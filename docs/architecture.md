# Architecture Overview

## System Architecture

Chin Up is a client-side web application built with React and Vite. All processing happens in the browser for privacy and performance.

## Component Architecture

### Core Components

1. **App.jsx** - Main application container
   - Manages global state (selected exercise, active status, feedback)
   - Coordinates between components

2. **CameraFeed.jsx** - Camera and pose visualization
   - Handles webcam stream initialization
   - Integrates pose detection
   - Draws pose overlay on canvas
   - Triggers form analysis and voice feedback

3. **ExerciseSelector.jsx** - Exercise selection UI
   - Displays available exercises
   - Manages exercise selection state

4. **ControlPanel.jsx** - Start/Stop controls
   - Manages workout session state

5. **FeedbackDisplay.jsx** - Visual feedback display
   - Shows current feedback text

## Custom Hooks

### usePoseDetection

- Initializes TensorFlow.js MoveNet detector
- Provides `detectPose()` function
- Returns detected keypoints

### useFormAnalysis

- Analyzes keypoints based on selected exercise
- Returns feedback and validation status
- Exercise-specific analyzers in `lib/exerciseAnalyzers.js`

### useVoiceFeedback

- Manages ElevenLabs TTS API integration
- Implements audio queue to prevent overlapping speech
- Falls back to Web Speech API if ElevenLabs unavailable

## Utility Libraries

### angleUtils.js

- `calculateAngle()` - Calculates angle between three points
- `calculateDistance()` - Calculates distance between two points
- `findKeypoint()` - Finds keypoint by name with fuzzy matching

### exerciseAnalyzers.js

- `analyzeSquat()` - Squat-specific form analysis
  - Checks knee angle (depth)
  - Checks back alignment
  - Checks knee alignment

## Data Flow

```
Camera → Video Element → Pose Detection → Keypoints → Form Analysis → Feedback → Voice TTS → Audio Playback
```

## Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Pose Detection**: TensorFlow.js MoveNet (Lightning model)
- **Text-to-Speech**: ElevenLabs API (with Web Speech API fallback)
- **Fonts**: Bricolage Grotesque (display), DM Sans (body)

## Design Decisions

1. **Client-Side Only**: All processing happens in browser for privacy
2. **Modular Hooks**: Separation of concerns via custom hooks
3. **Audio Queue**: Prevents overlapping voice feedback
4. **Fallback TTS**: Web Speech API as backup if ElevenLabs unavailable
5. **Real-time Processing**: Uses requestAnimationFrame for smooth pose detection

## Future Enhancements (Phase 2+)

- Presage SDK integration for predictive analytics
- Additional exercises (push-up, etc.)
- Rep counting
- User preferences storage
- Session history
