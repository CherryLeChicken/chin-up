import { useRef, useCallback } from 'react'

// Audio queue to prevent overlapping speech
class AudioQueue {
  constructor() {
    this.queue = []
    this.isPlaying = false
  }

  async add(audioUrl) {
    return new Promise((resolve, reject) => {
      this.queue.push({ audioUrl, resolve, reject })
      this.processQueue()
    })
  }

  async processQueue() {
    if (this.isPlaying || this.queue.length === 0) return

    this.isPlaying = true
    const { audioUrl, resolve, reject } = this.queue.shift()

    try {
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        this.isPlaying = false
        resolve()
        this.processQueue()
      }

      audio.onerror = (error) => {
        this.isPlaying = false
        reject(error)
        this.processQueue()
      }

      await audio.play()
    } catch (error) {
      this.isPlaying = false
      reject(error)
      this.processQueue()
    }
  }
}

const audioQueue = new AudioQueue()

// Voice personality types
export const VOICE_PERSONALITY = {
  CALM: 'calm',
  ENERGETIC: 'energetic',
  NEUTRAL: 'neutral'
}

/**
 * Get base voice settings for personality
 */
const getPersonalitySettings = (personality) => {
  switch (personality) {
    case VOICE_PERSONALITY.CALM:
      return {
        baseRate: 0.85,
        basePitch: 0.95,
        baseStability: 0.7,
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Default calm voice
      }
    case VOICE_PERSONALITY.ENERGETIC:
      return {
        baseRate: 0.95,
        basePitch: 1.1,
        baseStability: 0.3,
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Can be changed to more energetic voice
      }
    case VOICE_PERSONALITY.NEUTRAL:
    default:
      return {
        baseRate: 0.9,
        basePitch: 1.0,
        baseStability: 0.5,
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Default voice
      }
  }
}

/**
 * Adapt voice settings based on breathing metrics and personality
 * Used only for coaching tone, timing, and frequency - NOT for medical/emotional inference
 */
const adaptVoiceSettings = (personality, breathingRate, breathingConsistency, signalConfidence) => {
  const personalitySettings = getPersonalitySettings(personality)
  
  let rate = personalitySettings.baseRate
  let pitch = personalitySettings.basePitch
  let stability = personalitySettings.baseStability
  let volume = 1.0

  // Adapt based on breathing rate (coaching tone adaptation)
  if (breathingRate === 'fast') {
    // Fast breathing: use calmer, slower tone (regardless of personality)
    rate = Math.min(rate, 0.85)
    pitch = Math.max(pitch - 0.05, 0.9)
    stability = Math.min(stability + 0.1, 0.8)
  } else if (breathingRate === 'slow') {
    // Slow breathing: can use slightly more energetic tone
    rate = Math.min(rate + 0.05, 1.0)
    pitch = Math.min(pitch + 0.05, 1.15)
    stability = Math.max(stability - 0.1, 0.2)
  }

  // Adapt based on breathing consistency (coaching timing)
  if (breathingConsistency === 'erratic') {
    // Erratic breathing: use more measured, steady tone
    rate = Math.min(rate, 0.88)
    stability = Math.min(stability + 0.1, 0.8)
  }

  // Adapt based on signal confidence (coaching frequency)
  // Lower confidence = less frequent feedback
  const confidenceMultiplier = signalConfidence === 'low' ? 1.5 : signalConfidence === 'medium' ? 1.2 : 1.0

  return {
    rate,
    pitch,
    stability,
    volume,
    confidenceMultiplier, // Used to adjust feedback frequency
    voiceId: personalitySettings.voiceId
  }
}

export function useVoiceFeedback(personality = VOICE_PERSONALITY.NEUTRAL) {
  const apiKeyRef = useRef(null)

  // Get API key from environment or prompt user
  const getApiKey = useCallback(() => {
    if (apiKeyRef.current) return apiKeyRef.current
    
    // Check for environment variable (in production, this would be set)
    const envKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    
    if (envKey) {
      apiKeyRef.current = envKey
      return envKey
    }

    // For development, prompt user (or use a default demo key)
    // In production, this should be set via environment variables
    console.warn('ElevenLabs API key not found. Please set VITE_ELEVENLABS_API_KEY')
    return null
  }, [])

  const speak = useCallback(async (text, breathingRate = null, breathingConsistency = null, signalConfidence = null) => {
    if (!text || !text.trim()) return

    // Adapt voice settings based on personality and breathing metrics (coaching adaptation only)
    const voiceSettings = (breathingRate && breathingConsistency && signalConfidence)
      ? adaptVoiceSettings(personality, breathingRate, breathingConsistency, signalConfidence)
      : getPersonalitySettings(personality)

    const apiKey = getApiKey()
    if (!apiKey) {
      // Fallback to Web Speech API if ElevenLabs is not configured
      console.log('Using Web Speech API fallback')
      return speakWithWebAPI(text, voiceSettings)
    }

    try {
      // ElevenLabs TTS API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceSettings.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: voiceSettings.stability,
              similarity_boost: 0.75
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      await audioQueue.add(audioUrl)
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(audioUrl), 60000)
    } catch (error) {
      console.error('Error with ElevenLabs TTS:', error)
      // Fallback to Web Speech API
      return speakWithWebAPI(text, voiceSettings)
    }
  }, [getApiKey, personality])

  return { speak }
}

// Fallback to Web Speech API
function speakWithWebAPI(text, voiceSettings = { rate: 0.9, pitch: 1.0, volume: 1.0 }) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = voiceSettings.rate || 0.9
    utterance.pitch = voiceSettings.pitch || 1.0
    utterance.volume = voiceSettings.volume || 1.0
    
    return new Promise((resolve) => {
      utterance.onend = resolve
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    })
  }
  
  return Promise.resolve()
}
