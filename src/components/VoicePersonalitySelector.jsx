import { VOICE_PERSONALITY, VOICE_GENDER } from '../hooks/useVoiceFeedback'

export default function VoicePersonalitySelector({ personality, gender, onPersonalitySelect, onGenderSelect }) {
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

  const genders = [
    {
      value: VOICE_GENDER.MALE,
      label: 'Male',
      icon: '👨'
    },
    {
      value: VOICE_GENDER.FEMALE,
      label: 'Female',
      icon: '👩'
    }
  ]

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
      <h3 className="text-lg font-display font-semibold text-slate-200 mb-4">
        Voice Settings
      </h3>
      
      {/* Gender Selection */}
      <div className="mb-6">
        <div className="text-sm text-slate-400 mb-2 font-body">Voice Gender</div>
        <div className="flex gap-2">
          {genders.map((g) => (
            <button
              key={g.value}
              onClick={() => onGenderSelect(g.value)}
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                gender === g.value
                  ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                  : 'bg-slate-800/50 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{g.icon}</span>
                <span className="font-display font-semibold text-sm">{g.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Personality Selection */}
      <div>
        <div className="text-sm text-slate-400 mb-2 font-body">Personality</div>
        <div className="space-y-2">
          {personalities.map((p) => (
            <button
              key={p.value}
              onClick={() => onPersonalitySelect(p.value)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                personality === p.value
                  ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                  : 'bg-slate-800/50 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
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
    </div>
  )
}
