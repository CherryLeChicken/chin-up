import { useState } from 'react'

export default function ApiKeyTester() {
  const [status, setStatus] = useState('idle') // idle, testing, success, error
  const [message, setMessage] = useState('')
  const [apiKey, setApiKey] = useState('')

  const testApiKey = async () => {
    const keyToTest = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY

    if (!keyToTest) {
      setStatus('error')
      setMessage('No API key provided. Enter a key above or set VITE_ELEVENLABS_API_KEY in your .env file.')
      return
    }

    setStatus('testing')
    setMessage('Testing API key...')

    try {
      // Test with a simple API call - get user info or use a simple TTS call
      // Using a minimal TTS call to test the key (using free tier voice: Adam)
      const response = await fetch(
        'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': keyToTest
          },
          body: JSON.stringify({
            text: 'Test',
            model_id: 'eleven_turbo_v2_5', // Free tier compatible model
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      )

      if (response.ok) {
        // Success! The API key works
        const audioBlob = await response.blob()
        setStatus('success')
        setMessage(`✅ API key is valid! Generated ${audioBlob.size} bytes of audio.`)
        
        // Optionally play the test audio
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play().catch(err => {
          console.log('Could not play test audio:', err)
        })
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(audioUrl), 10000)
      } else {
        // API returned an error
        const errorData = await response.json().catch(() => ({ detail: { message: response.statusText } }))
        setStatus('error')
        setMessage(`❌ API key test failed: ${errorData.detail?.message || response.statusText} (Status: ${response.status})`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`❌ Error testing API key: ${error.message}`)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'testing':
        return 'text-yellow-400 border-yellow-400 bg-yellow-500/20'
      case 'success':
        return 'text-green-400 border-green-400 bg-green-500/20'
      case 'error':
        return 'text-red-400 border-red-400 bg-red-500/20'
      default:
        return 'text-slate-300 border-slate-700 bg-slate-800/50'
    }
  }

  const envKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const hasEnvKey = !!envKey

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
      <h3 className="text-lg font-display font-semibold text-slate-200 mb-4">
        ElevenLabs API Key Test
      </h3>

      {hasEnvKey ? (
        <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Environment Variable Found</div>
          <div className="text-xs text-slate-500 font-mono">
            VITE_ELEVENLABS_API_KEY={envKey.substring(0, 8)}...
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2 font-body">
            Enter API Key (or set VITE_ELEVENLABS_API_KEY in .env)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      )}

      <button
        onClick={testApiKey}
        disabled={status === 'testing'}
        className={`w-full py-3 px-4 rounded-xl font-display font-semibold transition-all duration-200 ${
          status === 'testing'
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30 cursor-pointer'
        }`}
      >
        {status === 'testing' ? 'Testing...' : 'Test API Key'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="text-sm font-body">{message}</div>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500 space-y-1">
        <div>💡 Tip: Set VITE_ELEVENLABS_API_KEY in your .env file for automatic loading</div>
        <div>📖 Get your API key from: <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">elevenlabs.io</a></div>
      </div>
    </div>
  )
}
