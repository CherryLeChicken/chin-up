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

/**
 * Analyze wall sit form based on keypoints
 * Checks: knee angle (~90°), back upright (vertical), hips low enough, body static
 */
export function analyzeWallSit(keypoints) {
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

  // If key body parts are missing, return empty feedback
  if (!hip || !knee || !ankle) {
    return {
      feedback: '',
      isValid: false
    }
  }

  // Calculate knee angle (hip-knee-ankle)
  // For wall sit, knees should be bent at ~90°
  const kneeAngle = calculateAngle(hip, knee, ankle)

  // Calculate back angle (shoulder-hip-knee) to check if back is upright/vertical
  let backAngle = null
  if (shoulder) {
    backAngle = calculateAngle(shoulder, hip, knee)
  }

  // Determine feedback based on angles
  let feedback = ''
  let isValid = true

  // Knee angle analysis (should be ~90° for proper wall sit)
  // Acceptable range: 75° - 105°
  if (kneeAngle < 75) {
    feedback = 'Bend your knees less - aim for a 90-degree angle'
    isValid = false
  } else if (kneeAngle > 105) {
    feedback = 'Bend your knees more - aim for a 90-degree angle'
    isValid = false
  } else if (kneeAngle >= 85 && kneeAngle <= 95) {
    feedback = 'Perfect knee angle! Keep holding'
    isValid = true
  } else {
    feedback = 'Good form! Keep your knees at 90 degrees'
    isValid = true
  }

  // Back alignment check - back should be upright/vertical
  // For upright back, shoulder-hip-knee angle should be close to 180° (straight line)
  if (backAngle !== null) {
    if (backAngle < 160) {
      feedback = 'Keep your back flat against the wall and upright'
      isValid = false
    } else if (backAngle >= 160 && backAngle < 175) {
      // Back is mostly upright but could be better
      if (feedback.includes('Perfect') || feedback.includes('Good form')) {
        // Don't override positive feedback
      } else {
        feedback = 'Keep your back pressed flat against the wall'
        isValid = true
      }
    }
  }

  // Check if hips are low enough
  // Hips should be at a similar height to knees (or slightly lower) for proper wall sit
  if (hip && knee) {
    const hipKneeHeightDiff = hip.y - knee.y
    // If hips are too high (negative or small positive difference), user isn't low enough
    // For a good wall sit, hips should be at or below knee level
    if (hipKneeHeightDiff < -20) {
      feedback = 'Lower your hips - they should be at knee level or below'
      isValid = false
    } else if (hipKneeHeightDiff > 50) {
      // Hips too low might indicate sliding down
      if (!feedback.includes('Perfect') && !feedback.includes('Good form')) {
        feedback = 'Keep your hips at knee level'
        isValid = false
      }
    }
  }

  return { feedback, isValid, kneeAngle, backAngle }
}

/**
 * Analyze Romanian Deadlift (RDL) form based on keypoints
 * Checks: hip hinge, back alignment, knee position, depth
 */
export function analyzeRomanianDeadlift(keypoints) {
  const leftHip = findKeypoint(keypoints, 'left_hip')
  const rightHip = findKeypoint(keypoints, 'right_hip')
  const leftKnee = findKeypoint(keypoints, 'left_knee')
  const rightKnee = findKeypoint(keypoints, 'right_knee')
  const leftAnkle = findKeypoint(keypoints, 'left_ankle')
  const leftShoulder = findKeypoint(keypoints, 'left_shoulder')
  const rightShoulder = findKeypoint(keypoints, 'right_shoulder')

  // Use left side by default, fallback to right
  const hip = leftHip || rightHip
  const knee = leftKnee || rightKnee
  const ankle = leftAnkle || findKeypoint(keypoints, 'right_ankle')
  const shoulder = leftShoulder || rightShoulder

  // If key body parts are missing, return empty feedback
  if (!hip || !knee || !ankle) {
    return {
      feedback: '',
      isValid: false
    }
  }

  // Calculate knee angle (hip-knee-ankle) - should be slightly bent but not too much
  const kneeAngle = calculateAngle(hip, knee, ankle)

  // Calculate back angle (shoulder-hip-knee) - should stay relatively straight
  let backAngle = null
  if (shoulder) {
    backAngle = calculateAngle(shoulder, hip, knee)
  }

  // Calculate hip hinge angle (shoulder-hip-ankle) - this shows how much the hip is hinged
  let hipHingeAngle = null
  if (shoulder && ankle) {
    hipHingeAngle = calculateAngle(shoulder, hip, ankle)
  }

  // Determine feedback based on angles
  let feedback = ''
  let isValid = true

  // Knee angle check - RDL should have slight knee bend (around 150-170°), not deep squat
  if (kneeAngle < 140) {
    feedback = 'Keep your knees slightly bent, not too deep'
    isValid = false
  } else if (kneeAngle > 175) {
    feedback = 'Bend your knees slightly for proper RDL form'
    isValid = false
  } else if (kneeAngle >= 150 && kneeAngle <= 170) {
    feedback = 'Good knee position! Maintain that slight bend'
    isValid = true
  }

  // Back alignment check - back should stay straight (angle close to 180°)
  if (backAngle !== null) {
    if (backAngle < 150) {
      feedback = 'Keep your back straight - don\'t round your spine'
      isValid = false
    } else if (backAngle >= 150 && backAngle < 165) {
      if (!feedback.includes('Good') && !feedback.includes('Excellent')) {
        feedback = 'Keep your back straighter - maintain neutral spine'
        isValid = false
      }
    } else if (backAngle >= 165) {
      if (!feedback || feedback.includes('knee')) {
        feedback = 'Excellent back position! Keep it straight'
        isValid = true
      }
    }
  }

  // Hip hinge check - RDL is primarily a hip hinge movement
  // Hip hinge angle should decrease as you lower (hip moves back)
  if (hipHingeAngle !== null) {
    // For a good RDL, the hip should be hinged back (angle < 180°)
    // Too upright (angle > 175°) means not hinging enough
    // Too much hinge (angle < 120°) might indicate going too low or losing form
    if (hipHingeAngle > 175) {
      feedback = 'Hinge at your hips more - push your hips back'
      isValid = false
    } else if (hipHingeAngle < 120) {
      feedback = 'You\'re going very deep - make sure you can maintain back position'
      isValid = false
    } else if (hipHingeAngle >= 140 && hipHingeAngle <= 170) {
      if (!feedback.includes('Excellent') && !feedback.includes('Good knee')) {
        feedback = 'Good hip hinge! Keep pushing your hips back'
        isValid = true
      }
    }
  }

  // Check shoulder position relative to hip (shoulders should stay over or slightly behind the bar)
  if (shoulder && hip) {
    const shoulderHipHorizontal = Math.abs(shoulder.x - hip.x)
    const shoulderHipVertical = Math.abs(shoulder.y - hip.y)
    
    // For RDL, shoulders should be slightly behind hips (negative x difference or small positive)
    // If shoulders are too far forward, user might be rounding or not hinging properly
    if (shoulder.x > hip.x + 30) {
      feedback = 'Keep your shoulders over or slightly behind the bar'
      isValid = false
    }
  }

  return { feedback, isValid, kneeAngle, backAngle, hipHingeAngle }
}
