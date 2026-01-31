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

// Voice gender types
export const VOICE_GENDER = {
  MALE: 'male',
  FEMALE: 'female'
}

// ElevenLabs voice IDs mapping (Free Tier Compatible)
// These are commonly available voices in the free tier
// Male voices
const MALE_VOICES = {
  [VOICE_PERSONALITY.CALM]: 'pNInz6obpgDQGcFmaJgB', // Adam - calm, professional (free tier)
  [VOICE_PERSONALITY.NEUTRAL]: 'pNInz6obpgDQGcFmaJgB', // Adam - balanced (free tier)
  [VOICE_PERSONALITY.ENERGETIC]: 'pNInz6obpgDQGcFmaJgB' // Adam - can be energetic (free tier)
}

// Female voices
const FEMALE_VOICES = {
  [VOICE_PERSONALITY.CALM]: 'EXAVITQu4vr4xnSDxMaL', // Bella - calm, warm (free tier)
  [VOICE_PERSONALITY.NEUTRAL]: 'EXAVITQu4vr4xnSDxMaL', // Bella - balanced (free tier)
  [VOICE_PERSONALITY.ENERGETIC]: 'EXAVITQu4vr4xnSDxMaL' // Bella - can be energetic (free tier)
}

/**
 * Get base voice settings for personality and gender
 */
const getPersonalitySettings = (personality, gender = VOICE_GENDER.MALE) => {
  // Get voice ID based on gender and personality
  const voiceMap = gender === VOICE_GENDER.FEMALE ? FEMALE_VOICES : MALE_VOICES
  const voiceId = voiceMap[personality] || voiceMap[VOICE_PERSONALITY.NEUTRAL]

  switch (personality) {
    case VOICE_PERSONALITY.CALM:
      return {
        baseRate: 0.85,
        basePitch: gender === VOICE_GENDER.FEMALE ? 1.05 : 0.95, // Slightly higher for female
        baseStability: 0.7,
        voiceId: voiceId
      }
    case VOICE_PERSONALITY.ENERGETIC:
      return {
        baseRate: 0.95,
        basePitch: gender === VOICE_GENDER.FEMALE ? 1.15 : 1.1,
        baseStability: 0.3,
        voiceId: voiceId
      }
    case VOICE_PERSONALITY.NEUTRAL:
    default:
      return {
        baseRate: 0.9,
        basePitch: gender === VOICE_GENDER.FEMALE ? 1.1 : 1.0,
        baseStability: 0.5,
        voiceId: voiceId
      }
  }
}

/**
 * Adapt voice settings based on breathing metrics and personality
 * Used only for coaching tone, timing, and frequency - NOT for medical/emotional inference
 */
const adaptVoiceSettings = (personality, gender, breathingRate, breathingConsistency, signalConfidence) => {
  const personalitySettings = getPersonalitySettings(personality, gender)
  
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

export function useVoiceFeedback(personality = VOICE_PERSONALITY.NEUTRAL, gender = VOICE_GENDER.MALE) {
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

    // Adapt voice settings based on personality, gender, and breathing metrics (coaching adaptation only)
    const voiceSettings = (breathingRate && breathingConsistency && signalConfidence)
      ? adaptVoiceSettings(personality, gender, breathingRate, breathingConsistency, signalConfidence)
      : getPersonalitySettings(personality, gender)

    const apiKey = getApiKey()
    if (!apiKey) {
      // Fallback to Web Speech API if ElevenLabs is not configured
      console.warn('⚠️ ElevenLabs API key not found. Using Web Speech API fallback.')
      console.info('💡 To use ElevenLabs TTS, set VITE_ELEVENLABS_API_KEY in your .env file or use the API Key Tester component.')
      return speakWithWebAPI(text, voiceSettings)
    }

    try {
      // ElevenLabs TTS API
      console.log(`🎤 Using ElevenLabs TTS (Voice: ${voiceSettings.voiceId}, Personality: ${personality}, Gender: ${gender})`)
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
            model_id: 'eleven_turbo_v2_5', // Free tier compatible model
            voice_settings: {
              stability: voiceSettings.stability,
              similarity_boost: 0.75
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: { message: response.statusText } }))
        throw new Error(`ElevenLabs API error (${response.status}): ${errorData.detail?.message || response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      console.log(`✅ ElevenLabs audio generated (${audioBlob.size} bytes)`)
      await audioQueue.add(audioUrl)
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(audioUrl), 60000)
    } catch (error) {
      console.error('❌ Error with ElevenLabs TTS:', error.message)
      console.warn('⚠️ Falling back to Web Speech API')
      // Fallback to Web Speech API
      return speakWithWebAPI(text, voiceSettings)
    }
  }, [getApiKey, personality, gender])

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
