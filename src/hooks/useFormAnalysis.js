import { useMemo } from 'react'
import { calculateAngle, findKeypoint } from '../lib/angleUtils'
import { analyzeSquat, analyzePushUp } from '../lib/exerciseAnalyzers'

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
        default:
          return { feedback: '', isValid: false }
      }
    }
  }, [exercise])

  return { analyzeForm }
}
