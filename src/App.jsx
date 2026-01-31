import { useState } from 'react'
import CameraFeed from './components/CameraFeed'
import ExerciseSelector from './components/ExerciseSelector'
import ControlPanel from './components/ControlPanel'
import FeedbackDisplay from './components/FeedbackDisplay'
import VoicePersonalitySelector from './components/VoicePersonalitySelector'
import ApiKeyTester from './components/ApiKeyTester'
import { VOICE_PERSONALITY, VOICE_GENDER } from './hooks/useVoiceFeedback'

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [repCount, setRepCount] = useState(0)
  const [voicePersonality, setVoicePersonality] = useState(VOICE_PERSONALITY.NEUTRAL)
  const [voiceGender, setVoiceGender] = useState(VOICE_GENDER.MALE)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background texture overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            FormBuddy
          </h1>
          <p className="text-slate-400 text-lg font-body">
            Voice-guided fitness companion powered by AI
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Camera Feed */}
          <div className="lg:col-span-2">
            <CameraFeed 
              exercise={selectedExercise}
              isActive={isActive}
              onFeedback={setFeedback}
              onRepCountUpdate={setRepCount}
              voicePersonality={voicePersonality}
              voiceGender={voiceGender}
            />
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            <ExerciseSelector 
              selectedExercise={selectedExercise}
              onSelect={setSelectedExercise}
              disabled={isActive}
            />
            
            <ControlPanel 
              isActive={isActive}
              onToggle={setIsActive}
              hasExercise={!!selectedExercise}
            />

            <VoicePersonalitySelector
              personality={voicePersonality}
              gender={voiceGender}
              onPersonalitySelect={setVoicePersonality}
              onGenderSelect={setVoiceGender}
            />

            <ApiKeyTester />

            <FeedbackDisplay feedback={feedback} />
            
            {/* Rep Counter */}
            {isActive && selectedExercise && repCount > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-cyan-400 mb-2">
                    {repCount}
                  </div>
                  <div className="text-sm text-slate-400 font-body uppercase tracking-wide">
                    Reps Completed
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
