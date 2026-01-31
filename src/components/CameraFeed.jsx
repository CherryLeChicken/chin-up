import { useRef, useEffect, useState, useCallback } from "react";
import { usePoseDetection } from "../hooks/usePoseDetection";
import { useFormAnalysis } from "../hooks/useFormAnalysis";
import { useVoiceFeedback } from "../hooks/useVoiceFeedback";
import { usePresage } from "../hooks/usePresage";
import { getFeedbackVariant, extractFeedbackKey } from "../lib/feedbackVariants";

export default function CameraFeed({ 
  exercise, 
  hoveredExercise, 
  isActive, 
  onFeedback, 
  onRepCountUpdate, 
  voicePersonality, 
  voiceGender 
}) {
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  // Exercise preview video URLs (MuscleWiki exercise demo videos)
  const previewVideos = {
    'squat': 'https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-bodyweight-box-squat-side.mp4',
    'push-up': 'https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-push-up-side.mp4',
    'lunge': 'https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-forward-lunges-side.mp4',
    'wall-sit': 'https://media.musclewiki.com/media/uploads/videos/branded/male-Bodyweight-wall-sit-side.mp4'
  };

  const lastFeedbackTimeRef = useRef(0);
  const lastDetectionLogTimeRef = useRef(0);
  const feedbackHistoryRef = useRef([]); // Track recent feedback keys (max 10)
  const FEEDBACK_INTERVAL = 2000; // 2 seconds between feedback

  const { detectPose, keypoints, isLoading } = usePoseDetection();
  const { analyzeForm } = useFormAnalysis(exercise);
  const { speak } = useVoiceFeedback(voicePersonality, voiceGender);
  const { 
    trackRep, 
    repCount, 
    breathingRate, 
    breathingConsistency, 
    signalConfidence 
  } = usePresage(exercise, isActive);
  
  const [detectionStatus, setDetectionStatus] = useState('initializing'); // 'initializing', 'detecting', 'no-pose', 'detected', 'full-body'
  const [isFullBodyVisible, setIsFullBodyVisible] = useState(false);
  const lastPresageCheckRef = useRef(0);

  // Sync rep count to parent
  useEffect(() => {
    if (onRepCountUpdate) {
      onRepCountUpdate(repCount);
    }
  }, [repCount, onRepCountUpdate]);

  // Reset feedback history when exercise changes
  useEffect(() => {
    feedbackHistoryRef.current = [];
  }, [exercise]);

  // Initialize camera
  useEffect(() => {
    if (!isActive) return;

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Please allow camera access to use FormBuddy.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found. Please connect a camera and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application. Please close other apps and try again.');
        } else {
          setError(`Camera error: ${err.message || 'Unable to access camera. Please try again.'}`);
        }
        console.error('Camera error:', err);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive]);

  // Handle keypoints updates for feedback and drawing
  useEffect(() => {
    if (!isActive || isLoading) {
      setDetectionStatus("initializing");
      return;
    }

    if (!keypoints || keypoints.length === 0) {
      setDetectionStatus("no-pose");
      setIsFullBodyVisible(false);
      return;
    }

    // Check if we have enough keypoints for basic detection
    const visibleKeypoints = keypoints.filter((kp) => kp && kp.score > 0.3).length;
    if (visibleKeypoints < 3) {
      setDetectionStatus("no-pose");
      setIsFullBodyVisible(false);
      return;
    }

    // Check if full body is visible
    const fullBodyVisible = exercise ? checkFullBodyVisible(keypoints, exercise) : false;
    setIsFullBodyVisible(fullBodyVisible);

    if (fullBodyVisible) {
      setDetectionStatus("full-body");
    } else {
      setDetectionStatus("detected");
    }

    drawPose(keypoints);

    // Only analyze form and give feedback if exercise is selected AND full body is visible
    if (exercise && fullBodyVisible) {
      const analysis = analyzeForm(keypoints);
      
      // Track rep for Presage
      trackRep(keypoints, analysis);

      if (analysis.feedback && !analysis.feedback.toLowerCase().includes("position yourself")) {
        const now = Date.now();
        
        // Calculate adaptive feedback interval based on signal confidence
        // Lower confidence = longer intervals (less frequent feedback)
        const confidenceMultiplier = signalConfidence === 'low' ? 1.5 : signalConfidence === 'medium' ? 1.2 : 1.0
        const adaptiveInterval = FEEDBACK_INTERVAL * confidenceMultiplier
        
        if (now - lastFeedbackTimeRef.current > adaptiveInterval) {
          // Extract feedback key and get variant (with Presage adaptation)
          const feedbackKey = extractFeedbackKey(analysis.feedback);
          const variantFeedback = feedbackKey 
            ? getFeedbackVariant(feedbackKey, feedbackHistoryRef.current, breathingRate, breathingConsistency, signalConfidence)
            : analysis.feedback;

          // Only speak if we got a valid variant (not null)
          if (variantFeedback) {
            // Update feedback history (keep last 10 entries)
            feedbackHistoryRef.current = [feedbackKey, ...feedbackHistoryRef.current].slice(0, 10);
            
            onFeedback(variantFeedback);
            if (variantFeedback.trim()) {
              speak(variantFeedback, breathingRate, breathingConsistency, signalConfidence);
            }
            lastFeedbackTimeRef.current = now;
          }
          // If variant is null (too many repeats), skip this feedback
        }
      }
    }
  }, [keypoints, isActive, exercise, analyzeForm, speak, onFeedback, isLoading, breathingRate, breathingConsistency, signalConfidence, trackRep]);

  // Pose detection loop
  useEffect(() => {
    if (!isActive || !videoRef.current || !stream || isLoading) {
      return;
    }

    let animationFrameId;
    const detectLoop = async () => {
      if (!videoRef.current || !isActive) return;

      if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
        try {
          await detectPose(videoRef.current);
        } catch (error) {
          const now = Date.now();
          if (!lastDetectionLogTimeRef.current || now - lastDetectionLogTimeRef.current > 5000) {
            console.error('Pose detection error:', error);
            lastDetectionLogTimeRef.current = now;
          }
        }
      }
      animationFrameId = requestAnimationFrame(detectLoop);
    };

    detectLoop();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, stream, detectPose, isLoading]);

  // Helper function to find keypoint by name
  const findKeypoint = (keypoints, name) => {
    if (!keypoints || keypoints.length === 0) return null;
    return keypoints.find((kp, idx) => {
      if (!kp) return false;
      const kpName = (kp.name || getKeypointName(idx)).toLowerCase();
      return kpName.includes(name.toLowerCase()) && kp.score > 0.3;
    });
  };

  const getKeypointName = (index) => {
    const names = ["nose", "left_eye", "right_eye", "left_ear", "right_ear", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle"];
    return names[index] || `keypoint_${index}`;
  };

  const checkFullBodyVisible = (keypoints, currentExercise) => {
    if (!keypoints || keypoints.length === 0) return false;
    const requiredParts = currentExercise === "squat" ? ["shoulder", "hip", "knee", "ankle"] : ["shoulder", "elbow", "wrist"];
    const foundParts = new Set();
    keypoints.forEach((kp, idx) => {
      if (!kp || kp.score <= 0.3) return;
      const kpName = (kp.name || getKeypointName(idx)).toLowerCase();
      requiredParts.forEach((part) => { if (kpName.includes(part)) foundParts.add(part); });
    });
    return foundParts.size >= (currentExercise === "squat" ? 3 : 2);
  };

  const drawPose = (keypoints) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !keypoints || keypoints.length === 0) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const connections = [
      ["nose", "left_eye"], ["nose", "right_eye"], ["left_eye", "right_eye"],
      ["left_eye", "left_ear"], ["right_eye", "right_ear"],
      ["left_ear", "left_shoulder"], ["right_ear", "right_shoulder"],
      ["left_shoulder", "right_shoulder"], ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"], ["left_hip", "right_hip"],
      ["left_shoulder", "left_elbow"], ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"], ["right_elbow", "right_wrist"],
      ["left_hip", "left_knee"], ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"], ["right_knee", "right_ankle"],
    ];

    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 3;
    connections.forEach(([from, to]) => {
      const fromKp = findKeypoint(keypoints, from);
      const toKp = findKeypoint(keypoints, to);
      if (fromKp && toKp) {
        ctx.beginPath();
        ctx.moveTo(fromKp.x, fromKp.y);
        ctx.lineTo(toKp.x, toKp.y);
        ctx.stroke();
      }
    });

    keypoints.forEach((kp, idx) => {
      if (kp && kp.score > 0.3) {
        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const showPreview = !isActive && exercise && previewVideos[exercise];

  useEffect(() => {
    const previewVideo = previewVideoRef.current;
    if (!previewVideo) return;
    if (showPreview) {
      previewVideo.src = previewVideos[exercise];
      previewVideo.play().catch(() => {});
    } else {
      previewVideo.pause();
      previewVideo.src = '';
    }
  }, [showPreview, exercise]);

  if (error) {
    return (
      <div className="relative aspect-video bg-slate-900 rounded-2xl border border-red-500/50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 rounded-xl">Reload</button>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (detectionStatus) {
      case "initializing": return { text: "Initializing...", color: "text-white", icon: "⏳" };
      case "detecting": return { text: "Detecting...", color: "text-yellow-400", icon: "👁️" };
      case "no-pose": return { text: "Position yourself", color: "text-orange-400", icon: "📍" };
      case "detected": return { text: "Pose detected", color: "text-cyan-400", icon: "👁️" };
      case "full-body": return { text: "Full body ready", color: "text-green-400", icon: "✓" };
      default: return { text: "Ready", color: "text-white", icon: "" };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {!isActive && !exercise && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-500">Select an exercise to begin</p>
        </div>
      )}
      {showPreview && <video ref={previewVideoRef} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-10" />}
      <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${showPreview ? 'opacity-0' : ''}`} />
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      {exercise && !showPreview && (
        <div className="absolute top-4 left-4 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-cyan-400 font-bold capitalize">{exercise}</span>
        </div>
      )}

      {isActive && !showPreview && (
        <div className="absolute top-4 right-4 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <span className={statusConfig.color}>{statusConfig.icon}</span>
            <span className={`${statusConfig.color} text-sm font-medium`}>{statusConfig.text}</span>
          </div>
        </div>
      )}

      {isActive && !showPreview && (detectionStatus === 'full-body' || detectionStatus === 'detected') && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 p-4 rounded-lg border border-slate-700 max-w-xs">
          <div className="text-xs font-bold text-cyan-400 mb-2 uppercase">Presage Analytics</div>
          <div className="space-y-1 text-xs text-white">
            <div className="flex justify-between"><span>Breathing:</span><span className="text-green-400">{breathingRate || 'normal'}</span></div>
            <div className="flex justify-between"><span>Consistency:</span><span className="text-green-400">{breathingConsistency || 'steady'}</span></div>
            <div className="flex justify-between"><span>Confidence:</span><span className="text-green-400">{signalConfidence || 'high'}</span></div>
            {repCount > 0 && <div className="flex justify-between pt-1 border-t border-slate-700"><span>Reps:</span><span className="text-cyan-400 font-bold">{repCount}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
