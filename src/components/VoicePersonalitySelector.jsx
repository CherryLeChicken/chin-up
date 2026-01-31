import { VOICE_PERSONALITY } from '../hooks/useVoiceFeedback'

export default function VoicePersonalitySelector({ personality, onSelect, disabled }) {
  const personalities = [
    {
      value: VOICE_PERSONALITY.CALM,
      label: 'Calm',
      description: 'Gentle, measured coaching',
      icon: '🧘'
    },
    {
      value: VOICE_PERSONALITY.NEUTRAL,
      label: 'Neutral',
      description: 'Balanced, professional tone',
      icon: '🎯'
    },
    {
      value: VOICE_PERSONALITY.ENERGETIC,
      label: 'Energetic',
      description: 'Upbeat, motivating coaching',
      icon: '⚡'
    }
  ]

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
      <h3 className="text-lg font-display font-semibold text-slate-200 mb-4">
        Voice Personality
      </h3>
      <div className="space-y-2">
        {personalities.map((p) => (
          <button
            key={p.value}
            onClick={() => onSelect(p.value)}
            disabled={disabled}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              personality === p.value
                ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                : 'bg-slate-800/50 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div className="flex-1">
                <div className="font-display font-semibold">{p.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>
              </div>
              {personality === p.value && (
                <span className="text-cyan-400">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
