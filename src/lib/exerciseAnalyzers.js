import { calculateAngle, findKeypoint } from './angleUtils'

/**
 * Analyze squat form based on keypoints
 * Checks: knee angle, hip position, back alignment
 */
export function analyzeSquat(keypoints) {
  const leftHip = findKeypoint(keypoints, 'left_hip')
  const rightHip = findKeypoint(keypoints, 'right_hip')
  const leftKnee = findKeypoint(keypoints, 'left_knee')
  const rightKnee = findKeypoint(keypoints, 'right_knee')
  const leftAnkle = findKeypoint(keypoints, 'left_ankle')
  const rightAnkle = findKeypoint(keypoints, 'right_ankle')
  const leftShoulder = findKeypoint(keypoints, 'left_shoulder')
  const rightShoulder = findKeypoint(keypoints, 'right_shoulder')

  // Use left side by default, fallback to right
  const hip = leftHip || rightHip
  const knee = leftKnee || rightKnee
  const ankle = leftAnkle || rightAnkle
  const shoulder = leftShoulder || rightShoulder

  // If key body parts are missing, return empty feedback (visual indicator will show instead)
  if (!hip || !knee || !ankle) {
    return {
      feedback: '',
      isValid: false
    }
  }

  // Calculate knee angle (hip-knee-ankle)
  const kneeAngle = calculateAngle(hip, knee, ankle)

  // Calculate hip angle (shoulder-hip-knee) for back alignment
  let hipAngle = null
  if (shoulder) {
    hipAngle = calculateAngle(shoulder, hip, knee)
  }

  // Determine feedback based on angles
  let feedback = ''
  let isValid = true

  // Knee angle analysis (for squat depth)
  if (kneeAngle > 160) {
    feedback = 'Bend your knees more to go deeper into the squat'
    isValid = false
  } else if (kneeAngle < 70) {
    feedback = 'Great depth! Keep your knees aligned with your toes'
    isValid = true
  } else if (kneeAngle < 100) {
    feedback = 'Good form! You\'re getting deep into the squat'
    isValid = true
  } else {
    feedback = 'You\'re doing great! Keep it up!'
    isValid = true
  }

  // Back alignment check (if shoulder is visible)
  if (hipAngle !== null) {
    if (hipAngle < 150) {
      feedback = 'Keep your back straight and chest up'
      isValid = false
    }
  }

  // Knee alignment check (knee should be over ankle)
  const kneeAnkleAlignment = Math.abs(knee.x - ankle.x)
  const hipKneeDistance = Math.sqrt(
    Math.pow(hip.x - knee.x, 2) + Math.pow(hip.y - knee.y, 2)
  )
  const alignmentRatio = kneeAnkleAlignment / (hipKneeDistance || 1)

  if (alignmentRatio > 0.3) {
    feedback = 'Keep your knees aligned with your toes, don\'t let them cave in'
    isValid = false
  }

  return { feedback, isValid, kneeAngle, hipAngle }
}

/**
 * Analyze push-up form based on keypoints
 * Checks: elbow angle, body alignment, depth
 */
export function analyzePushUp(keypoints) {
  const leftShoulder = findKeypoint(keypoints, 'left_shoulder')
  const rightShoulder = findKeypoint(keypoints, 'right_shoulder')
  const leftElbow = findKeypoint(keypoints, 'left_elbow')
  const rightElbow = findKeypoint(keypoints, 'right_elbow')
  const leftWrist = findKeypoint(keypoints, 'left_wrist')
  const rightWrist = findKeypoint(keypoints, 'right_wrist')
  const leftHip = findKeypoint(keypoints, 'left_hip')
  const rightHip = findKeypoint(keypoints, 'right_hip')
  const nose = findKeypoint(keypoints, 'nose')
  const leftAnkle = findKeypoint(keypoints, 'left_ankle')
  const rightAnkle = findKeypoint(keypoints, 'right_ankle')

  // Use left side by default, fallback to right
  const shoulder = leftShoulder || rightShoulder
  const elbow = leftElbow || rightElbow
  const wrist = leftWrist || rightWrist
  const hip = leftHip || rightHip
  const ankle = leftAnkle || rightAnkle

  // If key body parts are missing, return empty feedback
  if (!shoulder || !elbow || !wrist) {
    return {
      feedback: '',
      isValid: false
    }
  }

  // Calculate elbow angle (shoulder-elbow-wrist)
  const elbowAngle = calculateAngle(shoulder, elbow, wrist)

  // Determine feedback based on angles
  let feedback = ''
  let isValid = true

  // Elbow angle analysis (for push-up depth)
  // At top: elbow angle ~180° (straight arm)
  // At bottom: elbow angle ~90° (90-degree bend)
  if (elbowAngle > 170) {
    feedback = 'Lower your body more to get full range of motion'
    isValid = false
  } else if (elbowAngle < 80) {
    feedback = 'Excellent depth! You\'re going all the way down'
    isValid = true
  } else if (elbowAngle < 100) {
    feedback = 'Good depth! Keep your body straight'
    isValid = true
  } else if (elbowAngle < 140) {
    feedback = 'You\'re doing great! Try to go a bit deeper'
    isValid = true
  } else {
    feedback = 'Lower your body more for a complete push-up'
    isValid = false
  }

  // Body alignment check (shoulder-hip-ankle should form a straight line)
  if (hip && ankle) {
    // Calculate if body is sagging (hip too low) or piking (hip too high)
    const shoulderHipDistance = Math.sqrt(
      Math.pow(shoulder.x - hip.x, 2) + Math.pow(shoulder.y - hip.y, 2)
    )
    const hipAnkleDistance = Math.sqrt(
      Math.pow(hip.x - ankle.x, 2) + Math.pow(hip.y - ankle.y, 2)
    )
    
    // Check if body forms a relatively straight line
    // Calculate angle between shoulder-hip-ankle
    const bodyAngle = calculateAngle(shoulder, hip, ankle)
    
    // For a good push-up, body should be relatively straight (angle close to 180°)
    if (bodyAngle < 160) {
      feedback = 'Keep your body in a straight line from head to toe'
      isValid = false
    }
  }

  // Check if shoulders are too far forward (common mistake)
  if (wrist && shoulder) {
    const shoulderWristDistance = Math.sqrt(
      Math.pow(shoulder.x - wrist.x, 2) + Math.pow(shoulder.y - wrist.y, 2)
    )
    // If wrists are significantly behind shoulders, user might be leaning forward too much
    if (wrist.x < shoulder.x - 50) {
      feedback = 'Keep your hands directly under your shoulders'
      isValid = false
    }
  }

  // Check elbow flare (elbows should be at ~45 degrees, not flared out)
  if (shoulder && elbow && wrist) {
    // Calculate horizontal distance from shoulder to elbow
    const horizontalDistance = Math.abs(elbow.x - shoulder.x)
    const verticalDistance = Math.abs(elbow.y - shoulder.y)
    const flareRatio = horizontalDistance / (verticalDistance || 1)
    
    // If elbows are flared out too much (high horizontal distance)
    if (flareRatio > 1.5) {
      feedback = 'Keep your elbows closer to your body, not flared out'
      isValid = false
    }
  }

  return { feedback, isValid, elbowAngle }
}
