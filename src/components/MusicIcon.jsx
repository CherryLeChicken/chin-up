import { useState, useRef, useEffect } from 'react'

const MUSIC_PRESETS = [
  {
    id: 'energetic',
    label: '🔥 Energetic',
    prompt: 'High-energy electronic dance music, fast tempo, driving bassline, upbeat synth melodies, perfect for intense workout, rhythmic and continuous.'
  },
  {
    id: 'lofi',
    label: '☕ Relaxing',
    prompt: 'Chill lofi hip hop beats, mellow tempo, smooth jazzy chords, atmospheric vinyl crackle, calm and focused background music, continuous loop.'
  },
  {
    id: 'rock',
    label: '🎸 Power Rock',
    prompt: 'Powerful hard rock instrumental, distorted electric guitars, strong drum beat, motivational and driving energy, rhythmic continuous loop.'
  },
  {
    id: 'zen',
    label: '🧘 Zen Yoga',
    prompt: 'Peaceful ambient meditation music, soft pads, ethereal flutes, slow tempo, calming and spacious atmosphere, continuous flowing instrumental.'
  }
]

export default function MusicIcon({ 
  playMusic, 
  stopMusic, 
  togglePlay,
  updateVolume,
  toggleMute,
  isMuted,
  volume,
  isPlaying, 
  isLoading, 
  error,
  currentPrompt,
  audioData
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handlePresetClick = (preset) => {
    playMusic(preset.prompt)
    // Removed setShowDropdown(false) to keep the tab open
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (customPrompt.trim()) {
      playMusic(customPrompt)
      setCustomPrompt('')
      // Removed setShowDropdown(false) to keep the tab open
    }
  }

  // Show muted state if no audio data yet
  const showMuted = !audioData || isMuted

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`p-3 bg-slate-900/80 backdrop-blur-sm rounded-xl border-2 transition-all ${
          showMuted 
            ? 'border-slate-700 text-slate-400 hover:border-slate-600' 
            : 'border-cyan-500 text-cyan-400 hover:border-cyan-400'
        }`}
        title={showMuted ? "Music (Muted)" : "Music Settings"}
      >
        {showMuted ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M17 10l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-800 p-4 shadow-xl z-50">
          <div className="space-y-4">
            {/* Current Status */}
            {audioData && (
              <div className="pb-3 border-b border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`text-xs font-semibold ${isPlaying ? 'text-green-400' : 'text-slate-400'}`}>
                    {isPlaying ? 'Playing' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm font-semibold text-cyan-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <button
                    onClick={toggleMute}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      isMuted 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                    }`}
                  >
                    {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                  </button>
                  <button
                    onClick={stopMusic}
                    className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm font-semibold text-red-400 hover:bg-slate-700 transition-colors"
                  >
                    Stop
                  </button>
                </div>
                {!isMuted && (
                  <div className="mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={(e) => updateVolume(parseFloat(e.target.value) / 100)}
                      className="w-full"
                    />
                    <div className="text-xs text-slate-400 mt-1">Volume: {Math.round(volume * 100)}%</div>
                  </div>
                )}
              </div>
            )}

            {/* Presets */}
            <div>
              <div className="text-xs text-slate-400 mb-2 font-body">Music Presets</div>
              <div className="grid grid-cols-2 gap-2">
                {MUSIC_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 transition-all disabled:opacity-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <form onSubmit={handleCustomSubmit}>
              <div className="text-xs text-slate-400 mb-2 font-body">Custom Music</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your music..."
                  className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-[#FDF8FF] placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!customPrompt.trim() || isLoading}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  Generate
                </button>
              </div>
            </form>

            {isLoading && (
              <div className="py-4 px-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-center space-y-3 animate-pulse">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                  <p className="text-sm font-display font-bold text-cyan-400 tracking-wide">GENERATING AI AUDIO...</p>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-loading-progress"></div>
                </div>
                <p className="text-[10px] text-cyan-500/70 font-medium uppercase tracking-tighter">
                  Crafting your custom track • ~15 seconds
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-2">
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
