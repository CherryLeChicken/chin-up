import { useRef, useEffect, useState, useCallback } from 'react'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { useFormAnalysis } from '../hooks/useFormAnalysis'
import { useVoiceFeedback } from '../hooks/useVoiceFeedback'
import { usePresage } from '../hooks/usePresage'

export default function CameraFeed({ exercise, isActive, onFeedback, onRepCountUpdate, voicePersonality, voiceGender }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const lastFeedbackTimeRef = useRef(0)
  const lastKeypointLogTimeRef = useRef(0)
  const lastDetectionLogTimeRef = useRef(0)
  const lastPresageLogTimeRef = useRef(0)
  const FEEDBACK_INTERVAL = 2000 // 2 seconds between feedback

  const { detectPose, keypoints, isLoading } = usePoseDetection()
  const { analyzeForm } = useFormAnalysis(exercise)
  const { speak } = useVoiceFeedback(voicePersonality, voiceGender)
  const { trackMovement, trackRep, getPredictions, predictions: presagePredictions, repCount, breathingRate, breathingConsistency, signalConfidence } = usePresage(exercise, isActive)
  
  // Debug: Log Presage metrics (throttled)
  useEffect(() => {
    if (isActive && exercise && breathingRate) {
      const now = Date.now()
      if (!lastPresageLogTimeRef.current || now - lastPresageLogTimeRef.current > 5000) {
        console.log('Presage Metrics:', {
          breathingRate,
          breathingConsistency,
          signalConfidence,
          repCount
        })
        lastPresageLogTimeRef.current = now
      }
    }
  }, [isActive, exercise, breathingRate, breathingConsistency, signalConfidence, repCount])
  const [detectionStatus, setDetectionStatus] = useState('initializing') // 'initializing', 'detecting', 'no-pose', 'detected', 'full-body'
  const [isFullBodyVisible, setIsFullBodyVisible] = useState(false)
  const lastPresageCheckRef = useRef(0)

  // Initialize camera
  useEffect(() => {
    if (!isActive) return

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setError(null)
      } catch (err) {
        setError('Camera access denied. Please allow camera permissions.')
        console.error('Camera error:', err)
      }
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isActive])

  // Handle keypoints updates for feedback and drawing
  useEffect(() => {
    // Initialize fullBodyVisible to avoid undefined errors
    let fullBodyVisible = false
    
    if (!isActive) {
      setDetectionStatus('initializing')
      setIsFullBodyVisible(false)
      return
    }

    if (isLoading) {
      setDetectionStatus('initializing')
      setIsFullBodyVisible(false)
      return
    }

    // Debug: log keypoints when they change (throttled to once per 3 seconds)
    if (keypoints) {
      const visibleCount = keypoints.filter(kp => kp && kp.score > 0.3).length
      if (visibleCount > 0) {
        const now = Date.now()
        if (!lastKeypointLogTimeRef.current || now - lastKeypointLogTimeRef.current > 3000) {
          console.log(`Detected ${visibleCount} keypoints:`, keypoints.filter(kp => kp && kp.score > 0.3).map(kp => kp.name))
          lastKeypointLogTimeRef.current = now
        }
      }
    }

    if (!keypoints || keypoints.length === 0) {
      setDetectionStatus('no-pose')
      setIsFullBodyVisible(false)
      return
    }

    // Check if we have enough keypoints for basic detection
    const visibleKeypoints = keypoints.filter(kp => kp && kp.score > 0.3).length
    if (visibleKeypoints < 3) {
      setDetectionStatus('no-pose')
      setIsFullBodyVisible(false)
      return
    }

    // Check if full body is visible (only if exercise is selected)
    fullBodyVisible = exercise ? checkFullBodyVisible(keypoints, exercise) : false
    setIsFullBodyVisible(fullBodyVisible)

    if (fullBodyVisible) {
      setDetectionStatus('full-body')
    } else {
      setDetectionStatus('detected')
    }

    drawPose(keypoints)
    
    // Track movement for Presage analytics (breathing can work with just face/shoulders)
    // Check if we have at least face/shoulders for breathing detection
    const hasUpperBody = keypoints && keypoints.some(kp => {
      if (!kp || kp.score <= 0.3) return false
      const name = (kp.name || '').toLowerCase()
      return name.includes('shoulder') || name.includes('nose') || name.includes('eye')
    })
    
    // Track movement for breathing analysis (works with just upper body)
    if (isActive && hasUpperBody) {
      trackMovement(keypoints)
    }
    
    // Only analyze form and give feedback if exercise is selected AND full body is visible
    if (exercise && fullBodyVisible) {
      const analysis = analyzeForm(keypoints)
      
      // Track rep for Presage
      trackRep(keypoints, analysis)
      
      // Only give feedback if it's actual exercise feedback (not positioning messages)
      // Adapt feedback frequency based on signal confidence (coaching frequency adaptation)
      const confidenceMultiplier = signalConfidence === 'low' ? 1.5 : signalConfidence === 'medium' ? 1.2 : 1.0
      const adaptedInterval = FEEDBACK_INTERVAL * confidenceMultiplier
      
      if (analysis.feedback && !analysis.feedback.toLowerCase().includes('position yourself')) {
        const now = Date.now()
        if (now - lastFeedbackTimeRef.current > adaptedInterval) {
          onFeedback(analysis.feedback)
          if (analysis.feedback.trim()) {
            // Pass breathing metrics to adapt voice tone (coaching adaptation only)
            speak(analysis.feedback, breathingRate, breathingConsistency, signalConfidence)
          }
          lastFeedbackTimeRef.current = now
        }
      }
      
      // Check for Presage predictions periodically (every 5 seconds)
      const now = Date.now()
      if (now - lastPresageCheckRef.current > 5000) {
        const predictions = getPredictions()
        if (predictions && predictions.suggestions.length > 0) {
          // Get highest priority suggestion
          const highPrioritySuggestion = predictions.suggestions.find(s => s.priority === 'high')
          const suggestion = highPrioritySuggestion || predictions.suggestions[0]
          
          // Only speak if it's been a while since last feedback
          // Adapt timing based on signal confidence
          const confidenceMultiplier = signalConfidence === 'low' ? 1.5 : signalConfidence === 'medium' ? 1.2 : 1.0
          if (now - lastFeedbackTimeRef.current > FEEDBACK_INTERVAL * 2 * confidenceMultiplier) {
            onFeedback(suggestion.message)
            // Pass breathing metrics to adapt voice tone (coaching adaptation only)
            speak(suggestion.message, breathingRate, breathingConsistency, signalConfidence)
            lastFeedbackTimeRef.current = now
          }
        }
        lastPresageCheckRef.current = now
      }
    }
  }, [keypoints, isActive, exercise, analyzeForm, speak, onFeedback, isLoading, trackMovement, trackRep, getPredictions, breathingRate, breathingConsistency, signalConfidence])

  // Pose detection loop (works even without exercise selected for testing)
  useEffect(() => {
    if (!isActive || !videoRef.current || !stream) {
      setDetectionStatus('initializing')
      return
    }

    if (isLoading) {
      setDetectionStatus('initializing')
      console.log('Pose detector still loading...')
      return
    }

    // Wait for video to be ready with timeout
    const checkVideoReady = () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
        return true
      }
      return false
    }

    // Start detection loop function
    const startDetectionLoop = () => {
      setDetectionStatus('detecting')
      console.log('Starting pose detection loop')
      let animationFrameId
      let frameCount = 0
      let lastLogTime = Date.now()

      const detectLoop = async () => {
        if (!videoRef.current || !isActive) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
          }
          return
        }

        // Check video is ready (HAVE_CURRENT_DATA or higher) and has valid dimensions
        if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
          try {
            await detectPose(videoRef.current)
            frameCount++
            
            // Log first detection
            if (frameCount === 1) {
              console.log('First pose detection completed!')
            }
            
            // Throttle periodic logs to every 5 seconds
            const now = Date.now()
            if (now - lastLogTime > 5000) {
              console.log(`Detection running... frame ${frameCount}`)
              lastLogTime = now
            }
          } catch (error) {
            // Only log errors, not every frame
            const now = Date.now()
            if (!lastDetectionLogTimeRef.current || now - lastDetectionLogTimeRef.current > 5000) {
              console.error('Error in detection loop:', error)
              lastDetectionLogTimeRef.current = now
            }
          }
        } else {
          // Video not ready yet - only log once
          if (frameCount === 0) {
            console.log('Video not ready yet, waiting...')
          }
        }

        animationFrameId = requestAnimationFrame(detectLoop)
      }

      detectLoop()

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
      }
    }

    if (!checkVideoReady()) {
      console.log('Waiting for video to be ready...')
      let timeoutCount = 0
      const maxWaitTime = 5000 // 5 seconds max wait
      let lastCheckLogTime = Date.now()
      
      const checkInterval = setInterval(() => {
        timeoutCount += 100
        if (checkVideoReady()) {
          clearInterval(checkInterval)
          console.log('Video is ready! Starting detection...')
          startDetectionLoop()
        } else if (timeoutCount >= maxWaitTime) {
          clearInterval(checkInterval)
          console.warn('Video not ready after timeout, starting detection anyway...')
          startDetectionLoop()
        } else {
          // Only log waiting status every 2 seconds
          const now = Date.now()
          if (now - lastCheckLogTime > 2000) {
            console.log(`Still waiting for video... (${Math.round(timeoutCount / 1000)}s)`)
            lastCheckLogTime = now
          }
        }
      }, 100)
      
      return () => {
        clearInterval(checkInterval)
      }
    } else {
      // Video is already ready, start immediately
      return startDetectionLoop()
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isActive, stream, detectPose, isLoading])

  // Helper function to find keypoint by name
  const findKeypoint = (keypoints, name) => {
    if (!keypoints || keypoints.length === 0) return null
    return keypoints.find((kp, idx) => {
      if (!kp) return false
      const kpName = (kp.name || getKeypointName(idx) || `keypoint_${idx}`).toLowerCase()
      return kpName.includes(name.toLowerCase()) && kp.score > 0.3
    })
  }
  
  // Helper to get keypoint name (same as in usePoseDetection)
  const getKeypointName = (index) => {
    const names = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ]
    return names[index] || `keypoint_${index}`
  }

  // Check if full body is visible (need key body parts for exercise analysis)
  const checkFullBodyVisible = (keypoints, currentExercise) => {
    if (!keypoints || keypoints.length === 0) return false
    
    // For squat: need shoulders, hips, knees, ankles
    // For push-up: need shoulders, elbows, wrists
    const requiredParts = currentExercise === 'squat' 
      ? ['shoulder', 'hip', 'knee', 'ankle']
      : ['shoulder', 'elbow', 'wrist']
    
    const foundParts = new Set()
    
    keypoints.forEach((kp, idx) => {
      if (!kp || kp.score <= 0.3) return
      const kpName = (kp.name || getKeypointName(idx) || `keypoint_${idx}`).toLowerCase()
      requiredParts.forEach(part => {
        if (kpName.includes(part)) {
          foundParts.add(part)
        }
      })
    })
    
    // Need at least 3 out of 4 key parts for squat, or 2 out of 3 for push-up
    const minRequired = currentExercise === 'squat' ? 3 : 2
    return foundParts.size >= minRequired
  }

  const drawPose = (keypoints) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !keypoints || keypoints.length === 0) {
      console.log('Cannot draw pose - missing canvas, video, or keypoints')
      return
    }

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Debug: log what we're trying to draw
    const validKeypoints = keypoints.filter(kp => kp && kp.score > 0.3)
    if (validKeypoints.length > 0) {
      console.log(`Drawing ${validKeypoints.length} keypoints`)
    }
    
    // Define skeleton connections (full body)
    const connections = [
      // Face/Head - more detailed connections
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'right_eye'], // Connect eyes across face
      ['left_eye', 'left_ear'],
      ['right_eye', 'right_ear'],
      ['left_ear', 'left_shoulder'], // Connect ear to shoulder
      ['right_ear', 'right_shoulder'],
      
      // Torso
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      
      // Left arm
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      
      // Right arm
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      
      // Left leg
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      
      // Right leg
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
    ]

    // Exercise-specific connections (highlighted)
    if (exercise === 'push-up') {
      // For push-up, emphasize arm connections
      const leftShoulder = findKeypoint(keypoints, 'left_shoulder')
      const rightShoulder = findKeypoint(keypoints, 'right_shoulder')
      const leftElbow = findKeypoint(keypoints, 'left_elbow')
      const rightElbow = findKeypoint(keypoints, 'right_elbow')
      const leftWrist = findKeypoint(keypoints, 'left_wrist')
      const rightWrist = findKeypoint(keypoints, 'right_wrist')
      const leftHip = findKeypoint(keypoints, 'left_hip')
      const rightHip = findKeypoint(keypoints, 'right_hip')
      const leftAnkle = findKeypoint(keypoints, 'left_ankle')
      const rightAnkle = findKeypoint(keypoints, 'right_ankle')

      // Draw body line (shoulder-hip-ankle) for alignment check
      if (leftShoulder && leftHip && leftAnkle && 
          leftShoulder.score > 0.3 && leftHip.score > 0.3 && leftAnkle.score > 0.3) {
        ctx.strokeStyle = '#10b981' // Green for body alignment
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(leftShoulder.x, leftShoulder.y)
        ctx.lineTo(leftHip.x, leftHip.y)
        ctx.lineTo(leftAnkle.x, leftAnkle.y)
        ctx.stroke()
      }

      if (rightShoulder && rightHip && rightAnkle &&
          rightShoulder.score > 0.3 && rightHip.score > 0.3 && rightAnkle.score > 0.3) {
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(rightShoulder.x, rightShoulder.y)
        ctx.lineTo(rightHip.x, rightHip.y)
        ctx.lineTo(rightAnkle.x, rightAnkle.y)
        ctx.stroke()
      }

      // Reset stroke style for arm connections
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 3
    }

    // Draw skeleton connections
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 3
    ctx.shadowBlur = 8
    ctx.shadowColor = '#22d3ee'

    connections.forEach(([from, to]) => {
      const fromKp = findKeypoint(keypoints, from)
      const toKp = findKeypoint(keypoints, to)
      
      if (fromKp && toKp && fromKp.score > 0.3 && toKp.score > 0.3) {
        ctx.beginPath()
        ctx.moveTo(fromKp.x, fromKp.y)
        ctx.lineTo(toKp.x, toKp.y)
        ctx.stroke()
      }
    })

    // Draw keypoints with labels - face keypoints get special treatment
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    
    // Face keypoints (nose, eyes, ears) - draw with different color
    const faceKeypoints = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear']
    
    keypoints.forEach((kp, idx) => {
      // Ensure keypoint is valid
      if (!kp || kp.score === undefined || kp.x === undefined || kp.y === undefined) {
        return
      }
      
      if (kp.score > 0.3) {
        // Get name - use provided name or fallback to index-based name
        const jointName = (kp.name || getKeypointName(idx) || `keypoint_${idx}`).toLowerCase()
        const isFaceKeypoint = faceKeypoints.some(face => jointName.includes(face))
        
        // Use different colors for face vs body
        if (isFaceKeypoint) {
          // Face keypoints - use purple/magenta color
          ctx.shadowBlur = 15
          ctx.shadowColor = '#a855f7'
          ctx.fillStyle = '#a855f7'
        } else {
          // Body keypoints - use cyan color
          ctx.shadowBlur = 12
          ctx.shadowColor = '#22d3ee'
          ctx.fillStyle = '#22d3ee'
        }
        
        // Outer glow circle (larger for face keypoints)
        const radius = isFaceKeypoint ? 8 : 6
        ctx.beginPath()
        ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI)
        ctx.fill()
        
        // Inner dot
        ctx.shadowBlur = 0
        ctx.fillStyle = isFaceKeypoint ? '#c084fc' : '#06b6d4'
        ctx.beginPath()
        ctx.arc(kp.x, kp.y, 3, 0, 2 * Math.PI)
        ctx.fill()
        
        // Label for important joints (including all face keypoints)
        const importantJoints = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
                                'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 
                                'left_knee', 'right_knee', 'left_ankle', 'right_ankle']
        
        if (importantJoints.some(joint => jointName.includes(joint))) {
          ctx.fillStyle = '#ffffff'
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 2
          const label = jointName.split('_').pop() || ''
          ctx.strokeText(label, kp.x, kp.y - (isFaceKeypoint ? 12 : 10))
          ctx.fillText(label, kp.x, kp.y - (isFaceKeypoint ? 12 : 10))
        }
      }
    })
  }

  // Expose rep count to parent via callback (for display in App)
  // MUST be before any conditional returns (Rules of Hooks)
  useEffect(() => {
    if (onRepCountUpdate && typeof onRepCountUpdate === 'function') {
      onRepCountUpdate(repCount)
    }
  }, [repCount, onRepCountUpdate])

  if (!isActive) {
    return (
      <div className="relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-500 font-body">Select an exercise and start to begin</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative aspect-video bg-slate-900 rounded-2xl border border-red-500/50 flex items-center justify-center p-8">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  const getStatusConfig = () => {
    switch (detectionStatus) {
      case 'initializing':
        return {
          text: 'Initializing...',
          color: 'text-slate-400',
          bgColor: 'bg-slate-800/80',
          borderColor: 'border-slate-700',
          icon: '⏳',
          pulse: false
        }
      case 'detecting':
        return {
          text: 'Detecting pose...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/50',
          icon: '👁️',
          pulse: true
        }
      case 'no-pose':
        return {
          text: 'Position yourself in frame',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/50',
          icon: '📍',
          pulse: false
        }
      case 'detected':
        return {
          text: 'Pose detected',
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/50',
          icon: '👁️',
          pulse: false
        }
      case 'full-body':
        return {
          text: 'Full body detected ✓',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/50',
          icon: '✓',
          pulse: false
        }
      default:
        return {
          text: 'Ready',
          color: 'text-slate-400',
          bgColor: 'bg-slate-800/80',
          borderColor: 'border-slate-700',
          icon: '',
          pulse: false
        }
    }
  }

  const statusConfig = getStatusConfig()
  const visibleKeypoints = keypoints ? keypoints.filter(kp => kp.score > 0.3).length : 0
  
  // Get detected joints for debug panel, separate face and body
  const faceKeypoints = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear']
  const detectedJoints = keypoints 
    ? keypoints
        .filter(kp => kp.score > 0.3)
        .map(kp => ({
          name: kp.name || 'unknown',
          score: (kp.score * 100).toFixed(0),
          isFace: faceKeypoints.some(face => (kp.name || '').toLowerCase().includes(face))
        }))
        .sort((a, b) => {
          // Sort face keypoints first, then body
          if (a.isFace && !b.isFace) return -1
          if (!a.isFace && b.isFace) return 1
          return a.name.localeCompare(b.name)
        })
    : []
  
  const faceDetected = detectedJoints.some(joint => joint.isFace)
  const faceCount = detectedJoints.filter(joint => joint.isFace).length

  return (
    <div className="relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* Exercise name badge */}
      {exercise && (
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-cyan-400 font-display font-semibold capitalize">{exercise}</span>
        </div>
      )}

      {/* Detection status indicator */}
      {isActive && (
        <div className={`absolute top-4 right-4 ${statusConfig.bgColor} backdrop-blur-sm px-4 py-2 rounded-lg border ${statusConfig.borderColor} ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
          <div className="flex items-center gap-2">
            <span className={statusConfig.color}>{statusConfig.icon}</span>
            <span className={`${statusConfig.color} font-body text-sm font-medium`}>
              {statusConfig.text}
            </span>
          </div>
          {(detectionStatus === 'detected' || detectionStatus === 'full-body') && visibleKeypoints > 0 && (
            <div className="text-xs text-slate-400 mt-1">
              {visibleKeypoints} keypoints visible
              {faceDetected && (
                <span className="text-purple-400 ml-2">• {faceCount} face points</span>
              )}
              {isFullBodyVisible && exercise && (
                <span className="text-green-400 ml-2">• Full body ready</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Green border when full body is detected */}
      {isFullBodyVisible && exercise && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-green-500 rounded-2xl animate-pulse-slow"></div>
        </div>
      )}

      {/* Cyan border when pose detected but not full body */}
      {detectionStatus === 'detected' && !isFullBodyVisible && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-2xl"></div>
        </div>
      )}


      {/* Presage Metrics Display - shows when face/shoulders detected (breathing) or full body (all metrics) */}
      {isActive && (detectionStatus === 'full-body' || detectionStatus === 'detected') && (
        <div className={`absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-lg border max-w-xs ${
          detectionStatus === 'full-body' ? 'border-green-500/50' : 'border-cyan-500/50'
        }`}>
          <div className={`text-xs font-semibold mb-2 uppercase tracking-wide ${
            detectionStatus === 'full-body' ? 'text-green-400' : 'text-cyan-400'
          }`}>
            Presage Analytics {detectionStatus === 'full-body' ? '(Full Body)' : '(Breathing Only)'}
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Breathing Rate:</span>
              <span className={`font-semibold ${
                breathingRate === 'fast' ? 'text-yellow-400' :
                breathingRate === 'slow' ? 'text-blue-400' :
                'text-green-400'
              }`}>
                {breathingRate || 'normal'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Consistency:</span>
              <span className={`font-semibold ${
                breathingConsistency === 'erratic' ? 'text-orange-400' : 'text-green-400'
              }`}>
                {breathingConsistency || 'steady'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Signal Confidence:</span>
              <span className={`font-semibold ${
                signalConfidence === 'low' ? 'text-red-400' :
                signalConfidence === 'medium' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {signalConfidence || 'medium'}
              </span>
            </div>
            {repCount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <span className="text-slate-300">Reps:</span>
                <span className="text-cyan-400 font-semibold">{repCount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug panel showing detected joints */}
      {detectionStatus === 'detected' && detectedJoints.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-lg border border-cyan-500/50 max-w-xs max-h-48 overflow-y-auto">
          <div className="text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wide">
            Detected Joints ({detectedJoints.length})
          </div>
          
          {/* Face section */}
          {faceDetected && (
            <div className="mb-3 pb-2 border-b border-slate-700">
              <div className="text-xs text-purple-400 font-semibold mb-1">Face</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {detectedJoints.filter(j => j.isFace).map((joint, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span className="capitalize text-purple-300">{joint.name.replace(/_/g, ' ')}</span>
                    <span className="text-purple-400 ml-2">{joint.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Body section */}
          <div>
            <div className="text-xs text-cyan-400 font-semibold mb-1">Body</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {detectedJoints.filter(j => !j.isFace).map((joint, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <span className="capitalize">{joint.name.replace(/_/g, ' ')}</span>
                  <span className="text-cyan-400 ml-2">{joint.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
