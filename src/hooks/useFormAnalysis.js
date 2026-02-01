import { useMemo } from 'react'
import { calculateAngle, findKeypoint } from '../lib/angleUtils'
import { analyzeSquat, analyzePushUp, analyzeWallSit, analyzeRomanianDeadlift } from '../lib/exerciseAnalyzers'

export function useFormAnalysis(exercise) {
  const analyzeForm = useMemo(() => {
    return (keypoints) => {
      if (!keypoints || !exercise) {
        return { feedback: '', isValid: false }
      }

      switch (exercise) {
        case 'squat':
          return analyzeSquat(keypoints)
        case 'push-up':
          return analyzePushUp(keypoints)
        case 'wall-sit':
          return analyzeWallSit(keypoints)
        case 'barbell-rdl':
          return analyzeRomanianDeadlift(keypoints)
        default:
          return { feedback: '', isValid: false }
      }
    }
  }, [exercise])

  return { analyzeForm }
}
