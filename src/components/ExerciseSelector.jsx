// All available exercises with their targets and equipment requirements
const ALL_EXERCISES = [
  // Legs exercises - No equipment
  { id: "squat", name: "Squat", icon: "🏋️", targets: ["legs", "full-body", "cardio"], equipment: ["none"] },
  { id: "lunge", name: "Lunges", icon: "🚶", targets: ["legs", "cardio"], equipment: ["none"] },
  { id: "calf-raise", name: "Calf Raises", icon: "🦵", targets: ["legs"], equipment: ["none"] },
  { id: "wall-sit", name: "Wall Sit", icon: "🧘", targets: ["legs"], equipment: ["none"] },
  { id: "jump-squat", name: "Jump Squats", icon: "⚡", targets: ["legs", "cardio", "full-body"], equipment: ["none"] },
  { id: "glute-bridge", name: "Glute Bridge", icon: "🍑", targets: ["legs", "core"], equipment: ["none"] },
  
  // Legs exercises - Dumbbells
  { id: "goblet-squat", name: "Goblet Squat", icon: "🏋️", targets: ["legs", "full-body"], equipment: ["dumbbells"] },
  { id: "dumbbell-lunge", name: "Dumbbell Lunges", icon: "🏋️", targets: ["legs", "cardio"], equipment: ["dumbbells"] },
  { id: "dumbbell-squat", name: "Dumbbell Squat", icon: "🏋️", targets: ["legs", "full-body"], equipment: ["dumbbells"] },
  { id: "weighted-calf-raise", name: "Weighted Calf Raises", icon: "🦵", targets: ["legs"], equipment: ["dumbbells"] },
  
  // Legs exercises - Resistance bands
  { id: "band-squat", name: "Band Squat", icon: "🎯", targets: ["legs", "full-body"], equipment: ["resistance-bands"] },
  { id: "band-lunge", name: "Band Lunges", icon: "🎯", targets: ["legs", "cardio"], equipment: ["resistance-bands"] },
  { id: "band-leg-press", name: "Band Leg Press", icon: "🎯", targets: ["legs"], equipment: ["resistance-bands"] },
  
  // Legs exercises - Chair/bench
  { id: "step-up", name: "Step-ups", icon: "📈", targets: ["legs", "cardio"], equipment: ["chair-bench"] },
  { id: "chair-squat", name: "Chair Squats", icon: "🪑", targets: ["legs"], equipment: ["chair-bench"] },
  { id: "elevated-lunge", name: "Elevated Lunges", icon: "📈", targets: ["legs", "cardio"], equipment: ["chair-bench"] },
  { id: "single-leg-squat", name: "Single Leg Squat", icon: "🦵", targets: ["legs"], equipment: ["chair-bench"] },
  
  // Arms exercises - No equipment
  { id: "push-up", name: "Push-up", icon: "💪", targets: ["arms", "upper-body", "core", "full-body", "cardio"], equipment: ["none"] },
  { id: "knee-pushup", name: "Knee Push-up", icon: "💪", targets: ["arms", "upper-body", "core"], equipment: ["none"] },
  { id: "arm-circles", name: "Arm Circles", icon: "🌀", targets: ["arms", "upper-body"], equipment: ["none"] },
  
  // Arms exercises - Dumbbells
  { id: "bicep-curl", name: "Bicep Curls", icon: "💪", targets: ["arms"], equipment: ["dumbbells"] },
  { id: "tricep-extension", name: "Tricep Extensions", icon: "💪", targets: ["arms"], equipment: ["dumbbells"] },
  { id: "shoulder-press", name: "Shoulder Press", icon: "🏋️", targets: ["arms", "upper-body"], equipment: ["dumbbells"] },
  { id: "hammer-curl", name: "Hammer Curls", icon: "🔨", targets: ["arms"], equipment: ["dumbbells"] },
  { id: "overhead-tricep", name: "Overhead Tricep", icon: "💪", targets: ["arms"], equipment: ["dumbbells"] },
  { id: "lateral-raise", name: "Lateral Raises", icon: "✋", targets: ["arms", "upper-body"], equipment: ["dumbbells"] },
  { id: "front-raise", name: "Front Raises", icon: "✋", targets: ["arms", "upper-body"], equipment: ["dumbbells"] },
  
  // Arms exercises - Resistance bands
  { id: "band-bicep-curl", name: "Band Bicep Curls", icon: "🎯", targets: ["arms"], equipment: ["resistance-bands"] },
  { id: "band-tricep", name: "Band Tricep Extensions", icon: "🎯", targets: ["arms"], equipment: ["resistance-bands"] },
  { id: "band-shoulder-press", name: "Band Shoulder Press", icon: "🎯", targets: ["arms", "upper-body"], equipment: ["resistance-bands"] },
  { id: "band-lateral-raise", name: "Band Lateral Raises", icon: "🎯", targets: ["arms", "upper-body"], equipment: ["resistance-bands"] },
  
  // Arms exercises - Chair/bench
  { id: "tricep-dip", name: "Tricep Dips", icon: "💪", targets: ["arms", "upper-body"], equipment: ["chair-bench"] },
  { id: "chair-dips", name: "Chair Dips", icon: "🪑", targets: ["arms"], equipment: ["chair-bench"] },
  
  // Upper Body exercises - No equipment
  { id: "wall-pushup", name: "Wall Push-ups", icon: "🧱", targets: ["upper-body", "arms"], equipment: ["none"] },
  { id: "superman", name: "Superman", icon: "🦸", targets: ["upper-body", "core"], equipment: ["none"] },
  
  // Upper Body exercises - Dumbbells
  { id: "chest-press", name: "Chest Press", icon: "💪", targets: ["upper-body"], equipment: ["dumbbells"] },
  { id: "rows", name: "Rows", icon: "🚣", targets: ["upper-body"], equipment: ["dumbbells"] },
  { id: "chest-fly", name: "Chest Fly", icon: "🦋", targets: ["upper-body"], equipment: ["dumbbells"] },
  { id: "bent-over-row", name: "Bent Over Row", icon: "🚣", targets: ["upper-body"], equipment: ["dumbbells"] },
  { id: "arnold-press", name: "Arnold Press", icon: "🏋️", targets: ["upper-body", "arms"], equipment: ["dumbbells"] },
  
  // Upper Body exercises - Resistance bands
  { id: "pull-apart", name: "Band Pull-aparts", icon: "🎯", targets: ["upper-body"], equipment: ["resistance-bands"] },
  { id: "band-chest-press", name: "Band Chest Press", icon: "🎯", targets: ["upper-body"], equipment: ["resistance-bands"] },
  { id: "band-row", name: "Band Rows", icon: "🎯", targets: ["upper-body"], equipment: ["resistance-bands"] },
  { id: "band-chest-fly", name: "Band Chest Fly", icon: "🎯", targets: ["upper-body"], equipment: ["resistance-bands"] },
  
  
  // Core exercises - No equipment
  { id: "plank", name: "Plank", icon: "🔥", targets: ["core", "full-body"], equipment: ["none"] },
  { id: "crunch", name: "Crunches", icon: "🔥", targets: ["core"], equipment: ["none"] },
  { id: "russian-twist", name: "Russian Twists", icon: "🔥", targets: ["core"], equipment: ["none"] },
  { id: "leg-raise", name: "Leg Raises", icon: "🔥", targets: ["core"], equipment: ["none"] },
  { id: "mountain-climber", name: "Mountain Climbers", icon: "⛰️", targets: ["core", "cardio", "full-body"], equipment: ["none"] },
  { id: "dead-bug", name: "Dead Bug", icon: "🐛", targets: ["core"], equipment: ["none"] },
  { id: "side-plank", name: "Side Plank", icon: "🔥", targets: ["core", "upper-body"], equipment: ["none"] },
  { id: "bicycle-crunch", name: "Bicycle Crunches", icon: "🚴", targets: ["core", "cardio"], equipment: ["none"] },
  { id: "hollow-body", name: "Hollow Body Hold", icon: "🥚", targets: ["core"], equipment: ["none"] },
  { id: "v-sit", name: "V-Sit", icon: "📐", targets: ["core"], equipment: ["none"] },
  
  // Core exercises - Dumbbells
  { id: "weighted-crunch", name: "Weighted Crunches", icon: "🔥", targets: ["core"], equipment: ["dumbbells"] },
  { id: "weighted-russian", name: "Weighted Russian Twists", icon: "🔥", targets: ["core"], equipment: ["dumbbells"] },
  { id: "woodchopper", name: "Woodchopper", icon: "🪓", targets: ["core", "full-body"], equipment: ["dumbbells"] },
  { id: "weighted-plank", name: "Weighted Plank", icon: "🔥", targets: ["core", "full-body"], equipment: ["dumbbells"] },
  
  // Core exercises - Resistance bands
  { id: "band-crunch", name: "Band Crunches", icon: "🎯", targets: ["core"], equipment: ["resistance-bands"] },
  { id: "band-rotation", name: "Band Rotations", icon: "🎯", targets: ["core"], equipment: ["resistance-bands"] },
  
  // Core exercises - Chair/bench
  { id: "chair-crunch", name: "Chair Crunches", icon: "🪑", targets: ["core"], equipment: ["chair-bench"] },
  { id: "bench-leg-raise", name: "Bench Leg Raises", icon: "🔥", targets: ["core"], equipment: ["chair-bench"] },
  
  // Cardio exercises - No equipment
  { id: "jumping-jacks", name: "Jumping Jacks", icon: "❤️", targets: ["cardio", "full-body"], equipment: ["none"] },
  { id: "high-knees", name: "High Knees", icon: "❤️", targets: ["cardio", "legs"], equipment: ["none"] },
  { id: "burpee", name: "Burpees", icon: "💥", targets: ["cardio", "full-body"], equipment: ["none"] },
  { id: "jump-rope", name: "Jump Rope (simulated)", icon: "🪢", targets: ["cardio", "legs"], equipment: ["none"] },
  { id: "butt-kicks", name: "Butt Kicks", icon: "🦵", targets: ["cardio", "legs"], equipment: ["none"] },
  { id: "star-jumps", name: "Star Jumps", icon: "⭐", targets: ["cardio", "full-body"], equipment: ["none"] },
  
  // Cardio exercises - Dumbbells
  { id: "dumbbell-burpee", name: "Dumbbell Burpees", icon: "💥", targets: ["cardio", "full-body"], equipment: ["dumbbells"] },
  { id: "dumbbell-thruster", name: "Dumbbell Thrusters", icon: "💥", targets: ["cardio", "full-body", "legs", "upper-body"], equipment: ["dumbbells"] },
  
  // Cardio exercises - Resistance bands
  { id: "band-jumping-jacks", name: "Band Jumping Jacks", icon: "🎯", targets: ["cardio", "full-body"], equipment: ["resistance-bands"] },
  
  // Cardio exercises - Chair/bench
  { id: "step-ups-cardio", name: "Step-ups", icon: "📈", targets: ["cardio", "legs"], equipment: ["chair-bench"] },
  { id: "bench-jumps", name: "Bench Jumps", icon: "📈", targets: ["cardio", "legs"], equipment: ["chair-bench"] },
  
  // Full Body exercises - No equipment
  { id: "burpee-full", name: "Burpees", icon: "💥", targets: ["full-body", "cardio"], equipment: ["none"] },
  { id: "bear-crawl", name: "Bear Crawl", icon: "🐻", targets: ["full-body", "core", "cardio"], equipment: ["none"] },
  { id: "mountain-climber-full", name: "Mountain Climbers", icon: "⛰️", targets: ["full-body", "core", "cardio"], equipment: ["none"] },
  { id: "jumping-jacks-full", name: "Jumping Jacks", icon: "❤️", targets: ["full-body", "cardio"], equipment: ["none"] },
  { id: "plank-jacks", name: "Plank Jacks", icon: "🔥", targets: ["full-body", "core", "cardio"], equipment: ["none"] },
  
  // Full Body exercises - Dumbbells
  { id: "squat-press", name: "Squat to Press", icon: "🏋️", targets: ["full-body", "legs", "upper-body"], equipment: ["dumbbells"] },
  { id: "deadlift", name: "Deadlift", icon: "🏋️", targets: ["full-body", "legs", "upper-body"], equipment: ["dumbbells"] },
  { id: "barbell-rdl", name: "Romanian Deadlift", icon: "🏋️", targets: ["full-body", "legs", "upper-body"], equipment: ["dumbbells"] },
  { id: "thruster", name: "Thrusters", icon: "💥", targets: ["full-body", "legs", "upper-body", "cardio"], equipment: ["dumbbells"] },
  { id: "clean-press", name: "Clean and Press", icon: "🏋️", targets: ["full-body", "legs", "upper-body", "cardio"], equipment: ["dumbbells"] },
  { id: "renegade-row", name: "Renegade Rows", icon: "🚣", targets: ["full-body", "core", "upper-body"], equipment: ["dumbbells"] },
  { id: "dumbbell-swing", name: "Dumbbell Swing", icon: "🏋️", targets: ["full-body", "legs", "cardio"], equipment: ["dumbbells"] },
  
  // Full Body exercises - Resistance bands
  { id: "band-squat-press", name: "Band Squat Press", icon: "🎯", targets: ["full-body", "legs", "upper-body"], equipment: ["resistance-bands"] },
  { id: "band-woodchopper", name: "Band Woodchopper", icon: "🎯", targets: ["full-body", "core"], equipment: ["resistance-bands"] },
  
  // Full Body exercises - Chair/bench
  { id: "step-up-full", name: "Step-ups", icon: "📈", targets: ["full-body", "legs", "cardio"], equipment: ["chair-bench"] },
  { id: "bench-dips-full", name: "Bench Dips", icon: "🪑", targets: ["full-body", "arms", "upper-body"], equipment: ["chair-bench"] },
];

// Map workout types from onboarding to exercise targets
const WORKOUT_TYPE_MAP = {
  "legs": ["legs"],
  "arms": ["arms"],
  "upper-body": ["upper-body"],
  "core": ["core"],
  "cardio": ["cardio"],
  "full-body": ["full-body"]
};

import { useState, useEffect } from 'react'

const WORKOUT_TYPES = [
  { value: 'legs', label: 'Legs', icon: '🦵' },
  { value: 'arms', label: 'Arms', icon: '💪' },
  { value: 'upper-body', label: 'Upper Body', icon: '🏋️' },
  { value: 'core', label: 'Core', icon: '🔥' },
  { value: 'cardio', label: 'Cardio', icon: '❤️' },
  { value: 'full-body', label: 'Full Body', icon: '🌟' }
]

const EQUIPMENT_OPTIONS = [
  { value: 'none', label: 'No equipment', icon: '🙌' },
  { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { value: 'resistance-bands', label: 'Resistance bands', icon: '🎯' },
  { value: 'chair-bench', label: 'Chair / bench', icon: '🪑' }
]

export default function ExerciseSelector({ selectedExercise, onSelect, onHover, disabled, workoutType, equipment, onPreferencesUpdate }) {
  const [showSettings, setShowSettings] = useState(false)
  const [tempWorkoutType, setTempWorkoutType] = useState(workoutType || '')
  // Handle both array (new) and string (old) formats for backward compatibility
  const [tempEquipment, setTempEquipment] = useState(
    Array.isArray(equipment) ? equipment : (equipment ? [equipment] : [])
  )
  const [favorites, setFavorites] = useState([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('exerciseFavorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('Error parsing favorites:', error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('exerciseFavorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (exerciseId, e) => {
    e.stopPropagation() // Prevent selecting the exercise when clicking favorite
    setFavorites(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId)
      } else {
        return [...prev, exerciseId]
      }
    })
  }

  // Filter exercises based on selected workout type and equipment
  let exercises = ALL_EXERCISES;
  
  // Filter by workout type
  if (workoutType) {
    const targetTypes = WORKOUT_TYPE_MAP[workoutType] || []
    exercises = exercises.filter(exercise => 
      exercise.targets.some(target => targetTypes.includes(target))
    )
  }
  
  // Filter by equipment (handle both array and string for backward compatibility)
  const equipmentArray = Array.isArray(equipment) ? equipment : (equipment ? [equipment] : [])
  if (equipmentArray.length > 0) {
    exercises = exercises.filter(exercise => 
      exercise.equipment.some(eq => equipmentArray.includes(eq))
    )
  }

  // Sort exercises: favorites first, then alphabetically
  exercises = [...exercises].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.id)
    const bIsFavorite = favorites.includes(b.id)
    
    if (aIsFavorite && !bIsFavorite) return -1
    if (!aIsFavorite && bIsFavorite) return 1
    return a.name.localeCompare(b.name)
  })
  
  const handleSavePreferences = () => {
    // Get existing onboarding data
    const existingData = JSON.parse(localStorage.getItem('onboarding') || '{}')
    
    // Update only workout type and equipment
    const updatedData = {
      ...existingData,
      workoutType: tempWorkoutType,
      equipment: tempEquipment
    }
    
    localStorage.setItem('onboarding', JSON.stringify(updatedData))
    
    // Notify parent to update
    if (onPreferencesUpdate) {
      onPreferencesUpdate(updatedData)
    }
    
    setShowSettings(false)
  }

  // If no exercises match, show a message
  if (exercises.length === 0 && !showSettings) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-[#FDF8FF]">
            Select Exercise
          </h2>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Edit Preferences"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">No exercises match your preferences.</p>
          <p className="text-sm text-slate-500">Try adjusting your workout type or equipment in settings.</p>
        </div>
      </div>
    )
  }

  if (showSettings) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-[#FDF8FF]">
            Edit Preferences
          </h2>
          <button
            onClick={() => {
              setShowSettings(false)
              setTempWorkoutType(workoutType || '')
              const equipmentArray = Array.isArray(equipment) ? equipment : (equipment ? [equipment] : [])
              setTempEquipment(equipmentArray)
            }}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Cancel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Workout Type Selection */}
          <div>
            <label className="block text-[#FDF8FF] font-body font-semibold mb-3">
              Workout Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {WORKOUT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    tempWorkoutType === type.value
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="workoutType"
                    value={type.value}
                    checked={tempWorkoutType === type.value}
                    onChange={(e) => setTempWorkoutType(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{type.icon}</span>
                  <span className="text-xs font-display font-semibold text-center">{type.label}</span>
                  {tempWorkoutType === type.value && (
                    <div className="absolute top-1 right-1">
                      <span className="text-cyan-400 text-xs">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Equipment Selection */}
          <div>
            <label className="block text-[#FDF8FF] font-body font-semibold mb-3">
              Equipment (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {EQUIPMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    tempEquipment.includes(option.value)
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="equipment"
                    value={option.value}
                    checked={tempEquipment.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempEquipment([...tempEquipment, option.value])
                      } else {
                        setTempEquipment(tempEquipment.filter(eq => eq !== option.value))
                      }
                    }}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{option.icon}</span>
                  <span className="text-xs font-display font-semibold text-center">{option.label}</span>
                  {tempEquipment.includes(option.value) && (
                    <div className="absolute top-1 right-1">
                      <span className="text-cyan-400 text-xs">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-display font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Save Preferences
            </button>
            <button
              onClick={() => {
                setShowSettings(false)
                setTempWorkoutType(workoutType || '')
                const equipmentArray = Array.isArray(equipment) ? equipment : (equipment ? [equipment] : [])
                setTempEquipment(equipmentArray)
              }}
              className="px-4 py-3 bg-slate-800/50 border-2 border-slate-700 text-slate-300 rounded-xl hover:border-slate-600 transition-all font-display font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleRandomExercise = () => {
    if (exercises.length === 0) return
    const randomIndex = Math.floor(Math.random() * exercises.length)
    const randomExercise = exercises[randomIndex]
    onSelect(randomExercise.id)
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-[#FDF8FF]">
          Select Exercise
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomExercise}
            disabled={disabled || exercises.length === 0}
            className="p-2 text-slate-400 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Random Exercise"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => {
              setTempWorkoutType(workoutType || '')
              const equipmentArray = Array.isArray(equipment) ? equipment : (equipment ? [equipment] : [])
              setTempEquipment(equipmentArray)
              setShowSettings(true)
            }}
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Edit Preferences"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {exercises.map((exercise) => {
          const isFavorite = favorites.includes(exercise.id)
          return (
            <div
              key={exercise.id}
              className={`relative rounded-xl border-2 transition-all duration-200 ${
                selectedExercise === exercise.id
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <button
                onClick={() => onSelect(exercise.id)}
                onMouseEnter={() => {
                  if (!disabled && onHover) {
                    console.log('Mouse enter on exercise:', exercise.id)
                    onHover(exercise.id)
                  }
                }}
                onMouseLeave={() => {
                  if (!disabled && onHover) {
                    console.log('Mouse leave on exercise')
                    onHover(null)
                  }
                }}
                disabled={disabled}
                className={`w-full p-4 rounded-xl text-left ${
                  disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 pr-8">
                  <span className="text-2xl">{exercise.icon}</span>
                  <span className="font-body font-medium text-[#FBF8FF] capitalize">
                    {exercise.name}
                  </span>
                </div>
              </button>
              <button
                onClick={(e) => toggleFavorite(exercise.id, e)}
                disabled={disabled}
                className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${
                  isFavorite
                    ? "text-yellow-400 hover:text-yellow-300"
                    : "text-slate-500 hover:text-yellow-400"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  className="w-5 h-5"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
