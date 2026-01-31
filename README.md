# Chin Up - Voice-Guided Fitness Companion

A real-time, voice-first fitness companion that analyzes exercise form through the camera, provides corrective feedback, and encourages users using AI-generated voice.

## Features

- **Real-time Pose Detection**: Uses TensorFlow.js MoveNet for accurate body keypoint detection
- **Form Analysis**: Analyzes exercise form and provides real-time feedback
- **Voice Feedback**: AI-powered voice guidance using ElevenLabs TTS API
- **Accessibility-First**: Voice-first interface designed for beginners and neurodivergent users

## Prerequisites

- Node.js 18+ and npm/yarn
- Modern browser with camera access (Chrome, Edge, Safari)
- ElevenLabs API key (optional - falls back to Web Speech API if not provided)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chin-up
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your ElevenLabs API key:

```
VITE_ELEVENLABS_API_KEY=your_api_key_here
```

> **Note**: If you don't have an ElevenLabs API key, the app will fall back to the browser's Web Speech API.

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. **Grant Camera Access**: When prompted, allow the browser to access your camera
2. **Select Exercise**: Choose an exercise from the list (currently supports Squat)
3. **Start Workout**: Click the "Start" button to begin pose detection
4. **Receive Feedback**: The app will provide real-time voice and visual feedback on your form

## Project Structure

```
chin-up/
├── src/
│   ├── components/       # React components
│   │   ├── CameraFeed.jsx
│   │   ├── ExerciseSelector.jsx
│   │   ├── ControlPanel.jsx
│   │   └── FeedbackDisplay.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── usePoseDetection.js
│   │   ├── useFormAnalysis.js
│   │   └── useVoiceFeedback.js
│   ├── lib/             # Utility functions
│   │   ├── angleUtils.js
│   │   └── exerciseAnalyzers.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── docs/                # Documentation (to be added)
├── package.json
└── README.md
```

## Current Phase (Phase 3: Testing & Polish)


✅ **Phase 1 Completed:**
=======
✅ **Completed:**

>>>>>>> 31a79c1298922a340d6c9300bd6a789ba8868db4
- HTML/CSS layout with modern, accessible design
- Webcam feed integration
- Basic pose detection using TensorFlow.js MoveNet
- Form analysis logic for Squat exercise
- ElevenLabs TTS API integration with fallback
- Real-time voice feedback playback with audio queue

✅ **Phase 2 Completed:**
- Presage SDK integration for predictive analytics (breathing tracking, fatigue prediction)
- Push-up exercise analysis
- Rep counting for both exercises
- Voice personality selection (Calm/Neutral/Energetic)
- Voice gender selection (Male/Female)
- Text feedback display
- API key testing tool

🔄 **Phase 3 In Progress:**
- Code cleanup and optimization
- Improved error handling
- Performance optimization
- UI/UX polish
- Comprehensive testing

## Environment Variables

| Variable                  | Description                | Required                          |
| ------------------------- | -------------------------- | --------------------------------- |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key for TTS | No (falls back to Web Speech API) |

## Browser Compatibility

- Chrome/Edge (recommended)
- Safari
- Firefox (may have limited camera support)

## Troubleshooting

**Camera not working:**

- Ensure you've granted camera permissions
- Check that no other application is using the camera
- Try refreshing the page

**Pose detection not working:**

- Ensure good lighting
- Stand at an appropriate distance from the camera
- Make sure your full body is visible

**Voice feedback not playing:**

- Check browser console for errors
- If using ElevenLabs, verify your API key is correct
- The app will automatically fall back to Web Speech API if ElevenLabs fails

## License

[Add your license here]
