import { useState, useEffect } from "react";
import CameraFeed from "./components/CameraFeed";
import ExerciseSelector from "./components/ExerciseSelector";
import ControlPanel from "./components/ControlPanel";
import FeedbackDisplay from "./components/FeedbackDisplay";
import VoiceSettingsIcon from "./components/VoiceSettingsIcon";
import MusicIcon from "./components/MusicIcon";
import Onboarding from "./components/Onboarding";
import { VOICE_PERSONALITY, VOICE_GENDER } from "./hooks/useVoiceFeedback";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";

function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [hoveredExercise, setHoveredExercise] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [repCount, setRepCount] = useState(0);
  const [voicePersonality, setVoicePersonality] = useState(
    VOICE_PERSONALITY.NEUTRAL,
  );
  const [voiceGender, setVoiceGender] = useState(VOICE_GENDER.MALE);

  // Check if onboarding has been completed
  useEffect(() => {
    const savedOnboarding = localStorage.getItem("onboarding");
    if (savedOnboarding) {
      try {
        const data = JSON.parse(savedOnboarding);
        setOnboardingData(data);
        setOnboardingComplete(true);
      } catch (error) {
        console.error("Error parsing onboarding data:", error);
        localStorage.removeItem("onboarding");
      }
    }
  }, []);

  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    setOnboardingComplete(true);
  };

  const handlePreferencesUpdate = (updatedData) => {
    setOnboardingData(updatedData);
  };

  const {
    playMusic,
    stopMusic,
    togglePlay,
    updateVolume,
    toggleMute,
    isMuted,
    volume,
    isPlaying,
    isLoading,
    error: musicError,
    currentPrompt,
    audioData,
  } = useBackgroundMusic();

  // Show onboarding if not completed
  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#0B132B] app-wave">
      {/* Background texture overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Top Right Icons */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <VoiceSettingsIcon
            personality={voicePersonality}
            gender={voiceGender}
            onPersonalitySelect={setVoicePersonality}
            onGenderSelect={setVoiceGender}
          />
          <MusicIcon
            playMusic={playMusic}
            stopMusic={stopMusic}
            togglePlay={togglePlay}
            updateVolume={updateVolume}
            toggleMute={toggleMute}
            isMuted={isMuted}
            volume={volume}
            isPlaying={isPlaying}
            isLoading={isLoading}
            error={musicError}
            currentPrompt={currentPrompt}
            audioData={audioData}
          />
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="zalando-sans-expanded text-[4.5rem] md:text-[5.625rem] font-bold mb-3 bg-gradient-to-r from-[#00F5FF] via-[#76FFF6] to-[#FF00FF] bg-clip-text text-transparent">
            CHIN UP
          </h1>
          <p className="text-[#FDF8FF] text-lg font-body">
            {onboardingData?.name
              ? `Keep your chin up, ${onboardingData.name}!`
              : "Voice-guided fitness companion powered by AI"}
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Camera Feed */}
          <div className="lg:col-span-2">
            <CameraFeed
              exercise={selectedExercise}
              hoveredExercise={hoveredExercise}
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
              onHover={setHoveredExercise}
              disabled={isActive}
              workoutType={onboardingData?.workoutType}
              equipment={onboardingData?.equipment}
              onPreferencesUpdate={handlePreferencesUpdate}
            />

            <ControlPanel
              isActive={isActive}
              onToggle={setIsActive}
              hasExercise={!!selectedExercise}
            />

            <FeedbackDisplay feedback={feedback} />

            {/* Rep Counter */}
            {isActive && selectedExercise && repCount > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-cyan-400 mb-2">
                    {repCount}
                  </div>
                  <div className="text-sm text-[#FDF8FF] font-body uppercase tracking-wide">
                    Reps Completed
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
