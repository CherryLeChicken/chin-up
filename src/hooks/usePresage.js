import { useState, useRef, useCallback, useEffect } from 'react'
import { calculateAngle } from '../lib/angleUtils'

/**
 * Presage Physiology SDK Integration Hook
 * 
 * Tracks movement patterns, rep speed, and posture trends to predict
 * potential fatigue or form mistakes before they happen.
 * 
 * This implementation provides the core functionality described in the PRD.
 * When the official Presage SDK is available, this can be replaced with
 * the actual SDK integration.
 */

// Movement data point structure
// Works with just upper body (face/shoulders) for breathing, or full body for exercise tracking
const createDataPoint = (keypoints, timestamp) => {
  if (!keypoints || keypoints.length === 0) return null

  // Extract key body positions
  const getKeypoint = (name) => {
    return keypoints.find(kp => kp && kp.name && kp.name.toLowerCase().includes(name.toLowerCase()) && kp.score > 0.3)
  }

  const leftHip = getKeypoint('left_hip')
  const rightHip = getKeypoint('right_hip')
  const leftKnee = getKeypoint('left_knee')
  const rightKnee = getKeypoint('right_knee')
  const leftShoulder = getKeypoint('left_shoulder')
  const rightShoulder = getKeypoint('right_shoulder')
  const nose = getKeypoint('nose')

  // For breathing detection, we only need shoulders or face (nose)
  // For full body tracking, we need hips
  const hasUpperBody = leftShoulder || rightShoulder || nose
  const hasLowerBody = leftHip || rightHip

  // If we have neither upper nor lower body, can't track anything
  if (!hasUpperBody && !hasLowerBody) return null

  // Calculate chest position (average of shoulders, or use nose as fallback)
  let chestY = null
  if (leftShoulder && rightShoulder) {
    chestY = (leftShoulder.y + rightShoulder.y) / 2
  } else if (leftShoulder || rightShoulder) {
    chestY = (leftShoulder || rightShoulder).y
  } else if (nose) {
    // Use nose position as approximation for chest (for breathing when only face visible)
    chestY = nose.y + 50 // Approximate chest position below nose
  }

  // For full body tracking, calculate center of mass
  const hip = leftHip || rightHip
  const knee = leftKnee || rightKnee
  const shoulder = leftShoulder || rightShoulder

  return {
    timestamp,
    hipY: hip?.y || null,
    kneeY: knee?.y || null,
    shoulderY: shoulder?.y || null,
    chestY: chestY, // For breathing detection (works with just face/shoulders)
    // Calculate body center of mass approximation (only if we have lower body)
    centerY: hasLowerBody 
      ? ((hip?.y || 0) + (knee?.y || hip?.y || 0) + (shoulder?.y || hip?.y || 0)) / 3
      : chestY, // Use chest position if no lower body
    hasFullBody: hasLowerBody && hasUpperBody
  }
}

// Breathing rate enums
export const BREATHING_RATE = {
  SLOW: 'slow',
  NORMAL: 'normal',
  FAST: 'fast'
}

// Breathing consistency enums
export const BREATHING_CONSISTENCY = {
  STEADY: 'steady',
  ERRATIC: 'erratic'
}

// Signal confidence enums
export const SIGNAL_CONFIDENCE = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

export function usePresage(exercise, isActive) {
  const [predictions, setPredictions] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Breathing tracking state
  const [breathingRate, setBreathingRate] = useState(BREATHING_RATE.NORMAL)
  const [breathingConsistency, setBreathingConsistency] = useState(BREATHING_CONSISTENCY.STEADY)
  const [signalConfidence, setSignalConfidence] = useState(SIGNAL_CONFIDENCE.MEDIUM)
  
  // Store movement history
  const movementHistoryRef = useRef([])
  const repHistoryRef = useRef([])
  const breathingHistoryRef = useRef([]) // Track chest/shoulder vertical movement for breathing
  const lastRepTimeRef = useRef(null)
  const lastPredictionTimeRef = useRef(0)
  const lastBreathingAnalysisRef = useRef(0)
  
  // Configuration
  const HISTORY_WINDOW = 3000 // 3 seconds of history
  const PREDICTION_INTERVAL = 5000 // Predict every 5 seconds
  const MIN_REPS_FOR_ANALYSIS = 3 // Need at least 3 reps to predict
  const BREATHING_ANALYSIS_INTERVAL = 3000 // Analyze breathing every 3 seconds
  const BREATHING_WINDOW = 10000 // 10 seconds of breathing data

  /**
   * Track movement data point
   * Works with just upper body (face/shoulders) for breathing detection
   * Full body needed for exercise-specific tracking (reps, form)
   */
  const trackMovement = useCallback((keypoints) => {
    if (!isActive || !keypoints) return

    const dataPoint = createDataPoint(keypoints, Date.now())
    if (!dataPoint) return

    // Always track breathing data if we have chest/shoulder position (works with just face/upper body)
    if (dataPoint.chestY) {
      breathingHistoryRef.current.push({
        timestamp: dataPoint.timestamp,
        chestY: dataPoint.chestY
      })
    }

    // Only track full movement history if we have exercise selected (needs full body for reps)
    if (exercise) {
      // Add to history
      movementHistoryRef.current.push(dataPoint)
      
      // Keep only recent history (last 3 seconds for movement)
      const cutoff = Date.now() - HISTORY_WINDOW
      movementHistoryRef.current = movementHistoryRef.current.filter(
        point => point.timestamp > cutoff
      )
    }

    // Keep breathing history (10 seconds) - works independently of exercise
    const breathingCutoff = Date.now() - BREATHING_WINDOW
    breathingHistoryRef.current = breathingHistoryRef.current.filter(
      point => point.timestamp > breathingCutoff
    )
  }, [isActive, exercise])

  /**
   * Detect rep completion and track rep speed
   */
  const trackRep = useCallback((keypoints, formAnalysis) => {
    if (!isActive || !exercise || !keypoints) return

    const dataPoint = createDataPoint(keypoints, Date.now())
    if (!dataPoint) return

    const history = movementHistoryRef.current
    if (history.length < 10) return // Need some history

    if (exercise === 'squat') {
      // For squat: detect when user goes down and comes back up
      // Find lowest point (bottom of squat)
      const lowestPoint = history.reduce((min, point) => 
        point.centerY > min.centerY ? point : min
      )

      // Check if we're at the bottom (within threshold)
      const isAtBottom = Math.abs(dataPoint.centerY - lowestPoint.centerY) < 20

      // Check if we just came up from bottom
      const recentPoints = history.slice(-5)
      const wasLower = recentPoints.some(p => p.centerY > dataPoint.centerY + 30)

      if (wasLower && !isAtBottom && formAnalysis?.isValid) {
        // Rep completed
        const now = Date.now()
        if (lastRepTimeRef.current) {
          const repDuration = now - lastRepTimeRef.current
          repHistoryRef.current.push({
            timestamp: now,
            duration: repDuration,
            formQuality: formAnalysis.isValid ? 'good' : 'poor'
          })

          // Keep only last 10 reps
          if (repHistoryRef.current.length > 10) {
            repHistoryRef.current.shift()
          }
        }
        lastRepTimeRef.current = now
      }
    } else if (exercise === 'push-up') {
      // For push-up: detect when user goes down (elbow bends) and comes back up (elbow straightens)
      // Track shoulder vertical position (goes down when lowering, up when pushing)
      if (!dataPoint.shoulderY) return

      // Find lowest point (bottom of push-up - shoulders closest to ground)
      const lowestPoint = history.reduce((min, point) => 
        point.shoulderY && min.shoulderY ? (point.shoulderY > min.shoulderY ? point : min) : min
      )

      if (!lowestPoint.shoulderY) return

      // Check if we're at the bottom (shoulders at lowest point)
      const isAtBottom = Math.abs(dataPoint.shoulderY - lowestPoint.shoulderY) < 20

      // Check if we just came up from bottom (shoulders moved up significantly)
      const recentPoints = history.slice(-5)
      const wasLower = recentPoints.some(p => 
        p.shoulderY && dataPoint.shoulderY && p.shoulderY > dataPoint.shoulderY + 30
      )

      // Also check elbow angle - should be bent at bottom, straight at top
      const getKeypoint = (name) => {
        return keypoints.find(kp => kp && kp.name && kp.name.toLowerCase().includes(name.toLowerCase()) && kp.score > 0.3)
      }
      const shoulder = getKeypoint('shoulder')
      const elbow = getKeypoint('elbow')
      const wrist = getKeypoint('wrist')
      
      if (shoulder && elbow && wrist) {
        const elbowAngle = calculateAngle(shoulder, elbow, wrist)
        
        // At top: elbow angle ~180° (straight), at bottom: ~90° (bent)
        const isAtTop = elbowAngle > 160
        const wasAtBottom = elbowAngle < 120 // Was bent (at bottom)

        // Check if we came up from bottom (shoulders moved up) and reached top (elbow straight)
        if (wasLower && !isAtBottom && isAtTop && formAnalysis?.isValid) {
          // Rep completed (came up from bottom and reached top)
          const now = Date.now()
          if (lastRepTimeRef.current) {
            const repDuration = now - lastRepTimeRef.current
            repHistoryRef.current.push({
              timestamp: now,
              duration: repDuration,
              formQuality: formAnalysis.isValid ? 'good' : 'poor'
            })

            // Keep only last 10 reps
            if (repHistoryRef.current.length > 10) {
              repHistoryRef.current.shift()
            }
          }
          lastRepTimeRef.current = now
        }
      }
    }
  }, [isActive, exercise])

  /**
   * Analyze patterns and predict fatigue/mistakes
   */
  const analyzeAndPredict = useCallback(() => {
    if (!isActive || !exercise) return null

    const history = movementHistoryRef.current
    const reps = repHistoryRef.current

    if (history.length < 20 || reps.length < MIN_REPS_FOR_ANALYSIS) {
      return null
    }

    setIsAnalyzing(true)

    // Calculate average rep speed
    const recentReps = reps.slice(-5) // Last 5 reps
    const avgRepDuration = recentReps.reduce((sum, rep) => sum + rep.duration, 0) / recentReps.length

    // Check for speed degradation (slowing down = fatigue)
    const speedTrend = recentReps.length >= 3
      ? recentReps.slice(-3).reduce((sum, rep) => sum + rep.duration, 0) / 3
      : avgRepDuration
    const speedIncrease = speedTrend > avgRepDuration * 1.2 // 20% slower

    // Check for form degradation
    const recentFormQuality = recentReps.filter(rep => rep.formQuality === 'good').length / recentReps.length
    const formDeclining = recentFormQuality < 0.6 // Less than 60% good form

    // Calculate movement variability (higher = more instability)
    const recentPoints = history.slice(-30)
    const centerYValues = recentPoints.map(p => p.centerY)
    const avgCenterY = centerYValues.reduce((sum, y) => sum + y, 0) / centerYValues.length
    const variance = centerYValues.reduce((sum, y) => sum + Math.pow(y - avgCenterY, 2), 0) / centerYValues.length
    const highVariability = variance > 1000 // Threshold for instability

    // Generate predictions
    const predictions = {
      fatigueLevel: 'low',
      riskOfMistake: 'low',
      suggestions: []
    }

    // Fatigue prediction
    if (speedIncrease && recentReps.length >= 3) {
      predictions.fatigueLevel = 'medium'
      predictions.suggestions.push({
        type: 'fatigue',
        message: 'You\'re slowing down. Consider taking a short break soon.',
        priority: 'medium'
      })
    }

    if (speedIncrease && formDeclining) {
      predictions.fatigueLevel = 'high'
      predictions.suggestions.push({
        type: 'fatigue',
        message: 'Take a short break to avoid fatigue and maintain good form.',
        priority: 'high'
      })
    }

    // Form mistake prediction
    if (formDeclining && !speedIncrease) {
      predictions.riskOfMistake = 'medium'
      predictions.suggestions.push({
        type: 'form',
        message: 'Focus on maintaining your form. Slow down if needed.',
        priority: 'medium'
      })
    }

    if (highVariability && formDeclining) {
      predictions.riskOfMistake = 'high'
      predictions.suggestions.push({
        type: 'form',
        message: 'Your posture may weaken after the next rep. Slow down and focus on form.',
        priority: 'high'
      })
    }

    // Rep count milestone encouragement
    if (reps.length > 0 && reps.length % 5 === 0) {
      predictions.suggestions.push({
        type: 'encouragement',
        message: `Great work! You've completed ${reps.length} reps. Keep it up!`,
        priority: 'low'
      })
    }

    setIsAnalyzing(false)
    return predictions.suggestions.length > 0 ? predictions : null
  }, [isActive, exercise])

  /**
   * Analyze breathing patterns
   * Detects breathing rate, consistency, and calculates signal confidence
   */
  const analyzeBreathing = useCallback(() => {
    const breathingData = breathingHistoryRef.current
    if (breathingData.length < 30) {
      // Not enough data
      setSignalConfidence(SIGNAL_CONFIDENCE.LOW)
      return
    }

    // Extract chest Y positions (vertical movement indicates breathing)
    const chestPositions = breathingData.map(d => d.chestY)
    
    // Calculate signal confidence based on data quality
    const avgPosition = chestPositions.reduce((sum, y) => sum + y, 0) / chestPositions.length
    const variance = chestPositions.reduce((sum, y) => sum + Math.pow(y - avgPosition, 2), 0) / chestPositions.length
    const stdDev = Math.sqrt(variance)
    
    // Confidence based on data consistency
    if (stdDev < 5) {
      setSignalConfidence(SIGNAL_CONFIDENCE.LOW) // Too little variation
    } else if (stdDev > 50) {
      setSignalConfidence(SIGNAL_CONFIDENCE.LOW) // Too much noise
    } else if (stdDev > 20) {
      setSignalConfidence(SIGNAL_CONFIDENCE.MEDIUM)
    } else {
      setSignalConfidence(SIGNAL_CONFIDENCE.HIGH)
    }

    // Detect breathing cycles (peaks and valleys in chest movement)
    const peaks = []
    const valleys = []
    
    for (let i = 1; i < chestPositions.length - 1; i++) {
      if (chestPositions[i] > chestPositions[i - 1] && chestPositions[i] > chestPositions[i + 1]) {
        peaks.push({ index: i, value: chestPositions[i], timestamp: breathingData[i].timestamp })
      }
      if (chestPositions[i] < chestPositions[i - 1] && chestPositions[i] < chestPositions[i + 1]) {
        valleys.push({ index: i, value: chestPositions[i], timestamp: breathingData[i].timestamp })
      }
    }

    // Need at least 2 cycles to analyze
    if (peaks.length < 2 || valleys.length < 2) {
      return
    }

    // Calculate breathing rate (cycles per minute)
    const timeSpan = breathingData[breathingData.length - 1].timestamp - breathingData[0].timestamp
    const cycles = Math.min(peaks.length, valleys.length)
    const cyclesPerMinute = (cycles / timeSpan) * 60000

    // Classify breathing rate
    if (cyclesPerMinute < 10) {
      setBreathingRate(BREATHING_RATE.SLOW)
    } else if (cyclesPerMinute > 25) {
      setBreathingRate(BREATHING_RATE.FAST)
    } else {
      setBreathingRate(BREATHING_RATE.NORMAL)
    }

    // Calculate breathing consistency (variance in cycle durations)
    const cycleDurations = []
    for (let i = 1; i < peaks.length; i++) {
      const duration = peaks[i].timestamp - peaks[i - 1].timestamp
      cycleDurations.push(duration)
    }

    if (cycleDurations.length >= 2) {
      const avgDuration = cycleDurations.reduce((sum, d) => sum + d, 0) / cycleDurations.length
      const durationVariance = cycleDurations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / cycleDurations.length
      const durationStdDev = Math.sqrt(durationVariance)
      const coefficientOfVariation = durationStdDev / avgDuration

      // If cycle duration varies by more than 30%, it's erratic
      if (coefficientOfVariation > 0.3) {
        setBreathingConsistency(BREATHING_CONSISTENCY.ERRATIC)
      } else {
        setBreathingConsistency(BREATHING_CONSISTENCY.STEADY)
      }
    }
  }, [])

  /**
   * Get predictions (called periodically)
   */
  const getPredictions = useCallback(() => {
    const now = Date.now()
    if (now - lastPredictionTimeRef.current < PREDICTION_INTERVAL) {
      return predictions // Return cached predictions
    }

    lastPredictionTimeRef.current = now
    const newPredictions = analyzeAndPredict()
    
    if (newPredictions) {
      setPredictions(newPredictions)
      return newPredictions
    }

    return null
  }, [analyzeAndPredict, predictions])

  /**
   * Update breathing analysis periodically
   * Works even without exercise selected - just needs upper body (face/shoulders)
   */
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastBreathingAnalysisRef.current >= BREATHING_ANALYSIS_INTERVAL) {
        analyzeBreathing()
        lastBreathingAnalysisRef.current = now
      }
    }, BREATHING_ANALYSIS_INTERVAL)

    return () => clearInterval(interval)
  }, [isActive, analyzeBreathing])

  /**
   * Reset tracking when exercise changes or stops
   */
  useEffect(() => {
    if (!isActive) {
      movementHistoryRef.current = []
      repHistoryRef.current = []
      breathingHistoryRef.current = []
      lastRepTimeRef.current = null
      setPredictions(null)
      setBreathingRate(BREATHING_RATE.NORMAL)
      setBreathingConsistency(BREATHING_CONSISTENCY.STEADY)
      setSignalConfidence(SIGNAL_CONFIDENCE.MEDIUM)
    }
  }, [isActive, exercise])

  return {
    trackMovement,
    trackRep,
    getPredictions,
    predictions,
    isAnalyzing,
    repCount: repHistoryRef.current.length,
    // Breathing metrics (for coaching adaptation)
    breathingRate,
    breathingConsistency,
    signalConfidence
  }
}
