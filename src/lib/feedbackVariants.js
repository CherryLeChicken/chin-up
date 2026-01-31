/**
 * Feedback variant system to prevent repetitive voice feedback
 * Maps feedback keys to arrays of variant messages
 */

const FEEDBACK_VARIANTS = {
  // Squat feedback variants
  'squat-knee-too-straight': [
    'Bend your knees more to go deeper into the squat',
    'Try bending your knees more for better depth',
    'Get lower by bending your knees more',
    'You need more knee bend to go deeper'
  ],
  'squat-great-depth': [
    'Great depth! Keep your knees aligned with your toes',
    'Excellent depth! Maintain that knee alignment',
    'Perfect depth! Keep those knees tracking over your toes',
    'Awesome! You\'re hitting great depth'
  ],
  'squat-good-depth': [
    'Good form! You\'re getting deep into the squat',
    'Nice depth! Keep it up',
    'Looking good! You\'re getting lower',
    'Good work! Keep that depth'
  ],
  'squat-encouragement': [
    'You\'re doing great! Keep it up!',
    'Keep going! You\'ve got this!',
    'Nice work! Stay strong!',
    'Looking good! Keep pushing!'
  ],
  'squat-back-alignment': [
    'Keep your back straight and chest up',
    'Maintain a straight back and lift your chest',
    'Straighten your back and keep your chest lifted',
    'Focus on keeping your back straight'
  ],
  'squat-knee-alignment': [
    'Keep your knees aligned with your toes, don\'t let them cave in',
    'Push your knees out to align with your toes',
    'Don\'t let your knees collapse inward',
    'Keep those knees tracking over your toes'
  ],

  // Push-up feedback variants
  'pushup-too-shallow': [
    'Lower your body more to get full range of motion',
    'Go deeper - lower your body more',
    'Try to get your chest closer to the ground',
    'You need more depth - lower yourself more'
  ],
  'pushup-excellent-depth': [
    'Excellent depth! You\'re going all the way down',
    'Perfect depth! Keep going that low',
    'Great! You\'re hitting full range of motion',
    'Awesome depth! Keep it up'
  ],
  'pushup-good-depth': [
    'Good depth! Keep your body straight',
    'Nice depth! Maintain that straight line',
    'Looking good! Keep that form',
    'Good work on the depth!'
  ],
  'pushup-need-deeper': [
    'You\'re doing great! Try to go a bit deeper',
    'Good form! Aim for a bit more depth',
    'Almost there! Try going a little lower',
    'Nice! See if you can get a bit deeper'
  ],
  'pushup-too-shallow-alt': [
    'Lower your body more for a complete push-up',
    'You need more depth for a full push-up',
    'Try lowering yourself more',
    'Get lower for better range of motion'
  ],
  'pushup-body-alignment': [
    'Keep your body in a straight line from head to toe',
    'Maintain a straight line throughout your body',
    'Keep your body aligned from head to heels',
    'Focus on keeping your body straight'
  ],
  'pushup-hand-position': [
    'Keep your hands directly under your shoulders',
    'Position your hands under your shoulders',
    'Make sure your hands are aligned with your shoulders',
    'Your hands should be directly under your shoulders'
  ],
  'pushup-elbow-flare': [
    'Keep your elbows closer to your body, not flared out',
    'Tuck your elbows in closer to your sides',
    'Don\'t let your elbows flare out too much',
    'Keep those elbows close to your body'
  ],

  // Wall sit feedback variants
  'wallsit-knee-too-bent': [
    'Bend your knees less - aim for a 90-degree angle',
    'Straighten your knees a bit - target 90 degrees',
    'Your knees are too bent - aim for 90 degrees',
    'Adjust to a 90-degree knee angle'
  ],
  'wallsit-knee-too-straight': [
    'Bend your knees more - aim for a 90-degree angle',
    'Bend deeper - target 90 degrees',
    'You need more knee bend - aim for 90 degrees',
    'Get to a 90-degree knee angle'
  ],
  'wallsit-perfect-knee': [
    'Perfect knee angle! Keep holding',
    'Excellent! That\'s the right angle',
    'Perfect! Maintain that 90-degree angle',
    'Great angle! Keep holding strong'
  ],
  'wallsit-good-knee': [
    'Good form! Keep your knees at 90 degrees',
    'Nice! Maintain that knee angle',
    'Looking good! Keep those knees at 90',
    'Good work! Stay at that angle'
  ],
  'wallsit-back-alignment': [
    'Keep your back flat against the wall and upright',
    'Press your back flat against the wall',
    'Make sure your back is flat on the wall',
    'Keep your back pressed against the wall'
  ],
  'wallsit-back-pressed': [
    'Keep your back pressed flat against the wall',
    'Press that back against the wall',
    'Make sure your back stays on the wall',
    'Keep your back flat on the wall'
  ],
  'wallsit-hips-too-high': [
    'Lower your hips - they should be at knee level or below',
    'Drop your hips down to knee level',
    'Your hips need to be lower - at knee height',
    'Get those hips down to knee level'
  ],
  'wallsit-hips-too-low': [
    'Keep your hips at knee level',
    'Raise your hips to knee level',
    'Your hips should be at knee height',
    'Adjust your hips to knee level'
  ]
}

/**
 * Get a variant of feedback based on history
 * @param {string} feedbackKey - The key identifying the feedback type
 * @param {Array} recentFeedback - Array of recent feedback keys (most recent first)
 * @returns {string} - A variant of the feedback message
 */
export function getFeedbackVariant(feedbackKey, recentFeedback = []) {
  const variants = FEEDBACK_VARIANTS[feedbackKey]
  
  if (!variants || variants.length === 0) {
    return null
  }

  // Count how many times this feedback appeared in recent history (last 5)
  const recentCount = recentFeedback.slice(0, 5).filter(key => key === feedbackKey).length

  // If this feedback appeared 5 times recently, return null to skip it
  if (recentCount >= 5) {
    return null
  }

  // If this is the same feedback as the last one, use a different variant
  if (recentFeedback.length > 0 && recentFeedback[0] === feedbackKey) {
    // Find which variant was used last (if we can determine it)
    // For simplicity, just rotate to next variant
    const variantIndex = recentCount % variants.length
    return variants[variantIndex]
  }

  // Otherwise, use the first variant (or rotate based on count)
  const variantIndex = recentCount % variants.length
  return variants[variantIndex]
}

/**
 * Extract feedback key from feedback text
 * This is a fallback if analyzers don't return keys directly
 */
export function extractFeedbackKey(feedbackText) {
  if (!feedbackText) return null

  const lowerText = feedbackText.toLowerCase()

  // Map common feedback patterns to keys
  if (lowerText.includes('bend your knees more') || lowerText.includes('knee bend')) {
    if (lowerText.includes('squat')) return 'squat-knee-too-straight'
    if (lowerText.includes('wall')) return 'wallsit-knee-too-straight'
  }
  if (lowerText.includes('great depth') || lowerText.includes('excellent depth')) {
    if (lowerText.includes('squat')) return 'squat-great-depth'
    if (lowerText.includes('push')) return 'pushup-excellent-depth'
  }
  if (lowerText.includes('good form') || lowerText.includes('good depth')) {
    if (lowerText.includes('squat')) return 'squat-good-depth'
    if (lowerText.includes('push')) return 'pushup-good-depth'
    if (lowerText.includes('wall')) return 'wallsit-good-knee'
  }
  if (lowerText.includes('back straight') || lowerText.includes('back flat')) {
    if (lowerText.includes('squat')) return 'squat-back-alignment'
    if (lowerText.includes('wall')) return 'wallsit-back-alignment'
  }
  if (lowerText.includes('knees aligned') || lowerText.includes('knees tracking')) {
    return 'squat-knee-alignment'
  }
  if (lowerText.includes('lower your body') || lowerText.includes('go deeper')) {
    if (lowerText.includes('push')) return 'pushup-too-shallow'
  }
  if (lowerText.includes('body in a straight line') || lowerText.includes('straight line')) {
    return 'pushup-body-alignment'
  }
  if (lowerText.includes('hands directly under') || lowerText.includes('hands under')) {
    return 'pushup-hand-position'
  }
  if (lowerText.includes('elbows closer') || lowerText.includes('elbows flared')) {
    return 'pushup-elbow-flare'
  }
  if (lowerText.includes('perfect knee angle') || lowerText.includes('90-degree')) {
    if (lowerText.includes('perfect')) return 'wallsit-perfect-knee'
    return 'wallsit-good-knee'
  }
  if (lowerText.includes('hips') && lowerText.includes('lower')) {
    return 'wallsit-hips-too-high'
  }
  if (lowerText.includes('hips') && lowerText.includes('knee level')) {
    return 'wallsit-hips-too-low'
  }
  if (lowerText.includes('doing great') || lowerText.includes('keep it up')) {
    return 'squat-encouragement'
  }

  // Default: create a key from the text (for unknown feedback)
  return `generic-${feedbackText.substring(0, 20).toLowerCase().replace(/\s+/g, '-')}`
}
