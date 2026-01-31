# Voice-Guided Gym Web App – Process & Requirements Document

**Project Name:** FormBuddy  
**Pillar:** Accessibility  
**Objective:** Provide a real-time, voice-first fitness companion that analyzes user exercise form through the camera, provides corrective feedback, predicts potential fatigue or mistakes using AI (Presage), and encourages users using AI-generated voice (ElevenLabs).

---

## 1. Project Overview

Many beginners, neurodivergent users, and people with gym anxiety struggle with text-heavy or visual fitness instructions. Traditional apps rely on screens and text feedback, creating **barriers to inclusion**.

**Solution:** A web-based app that uses:
- **Camera-based pose detection** to monitor exercise form.
- **AI-driven voice feedback** (ElevenLabs) to correct and encourage users.
- **Predictive analytics** (Presage) to anticipate mistakes, fatigue, or form deterioration, helping users exercise safely.

---

## 2. Functional Requirements

### 2.1 User Authentication (Optional MVP)
- Users can optionally enter a name to personalize encouragement.
- No passwords needed for MVP.

### 2.2 Camera Integration
- Request permission to access webcam.
- Display live camera feed on the page.
- Capture key body joints (pose detection) in real-time.

### 2.3 Exercise Selection
- Users can select from a predefined list:
  - Squat
  - Push-up
- Optional: Add more exercises if time allows.

### 2.4 Pose Detection & Analysis
- Use **TensorFlow.js MoveNet** or **PoseNet** for real-time keypoint detection.
- Detect relevant joints per exercise:
  - Squat: hip, knee, ankle
  - Push-up: shoulder, elbow, wrist
- Calculate angles (using simple math / vector functions).
- Compare angles to threshold values for correct form.

### 2.5 Feedback Generation
- Translate pose analysis into **text feedback**:
  - Example: “Bend your knees more” or “Good posture!”
- Include **encouragement phrases**:
  - Example: “You’re doing great! Keep it up!”
- Optionally adjust **tone or voice style** for user preference.

### 2.6 Predictive Analytics (Presage Integration)
- Track user movement patterns, speed, and posture over time.
- Use Presage SDK to **predict potential fatigue or form mistakes** before they happen.
- Provide proactive voice suggestions:
  - Example: “Take a short break to avoid fatigue”  
  - Example: “Your posture may weaken after the next rep, slow down”
- Enhances **safety and accessibility**, reducing risk of injury.

### 2.7 Voice Feedback (ElevenLabs Integration)
- Convert feedback text and Presage predictions into speech in real-time.
- Play audio through the browser.
- Optional: Let users select from 2–3 voices (calm, energetic, neutral).

### 2.8 User Interface (UI)
- Webcam feed prominently displayed.
- Exercise selection menu.
- Start / Stop button.
- Optional: Display text feedback visually for clarity.

### 2.9 Real-Time Updates
- Feedback should occur **within 1–2 seconds** of pose change.
- Presage predictions updated periodically (every few reps).
- Ensure continuous audio cues do not overlap (queue system).

---

## 3. Non-Functional Requirements

| Category                  | Requirement                                                                 |
|---------------------------|----------------------------------------------------------------------------|
| Performance               | Real-time pose detection at ≥15 FPS                                         |
| Compatibility             | Modern browsers (Chrome, Edge, Safari)                                     |
| Accessibility             | Voice-first interface, optional visual text feedback                       |
| Safety                    | Predictive analytics warn of fatigue or incorrect form                      |
| Scalability               | Designed for single-user demo; scalable if multi-user supported in future |
| Security & Privacy        | Camera feed processed locally; no images or videos stored                  |
| Reliability               | Audio playback and Presage predictions should not freeze or overlap        |
| Maintainability           | Modular code for exercises, feedback, TTS, and Presage components          |

---

## 4. Technical Requirements

### 4.1 Front-End
- HTML / CSS / JavaScript
- Framework: optional (React for UI modularity)
- Camera integration via `navigator.mediaDevices.getUserMedia()`

### 4.2 Pose Detection
- **TensorFlow.js MoveNet / PoseNet**
- Detects body keypoints in real-time
- Calculates angles via JavaScript

### 4.3 Predictive Analytics
- **Presage Physiology SDK** integration for user fatigue and mistake prediction
- Analyze motion patterns, rep speed, and posture trends
- Generate proactive voice/text suggestions

### 4.4 Backend (Optional for MVP)
- Not required for hackathon MVP (client-side only)
- Could store user preferences, exercise history, or Presage predictions in the future

### 4.5 Voice Integration
- ElevenLabs TTS API (REST or JS SDK)
- Convert feedback and predictions into speech
- Play audio dynamically in-browser

### 4.6 Libraries / Dependencies
- TensorFlow.js
- ElevenLabs API SDK
- Presage API SDK / REST integration
- Optional: Tone.js or Howler.js for audio control
- Optional: Bootstrap or TailwindCSS for UI styling

---

## 5. Process Flow (User Journey)

1. Open Website → Grant Camera Access  
2. Select Exercise → Start Workout  
3. Pose Detection → Real-time Analysis  
4. Generate Feedback → Voice Playback  
5. Predictive Analytics → Presage provides proactive suggestions  
6. Continuous Loop → Encourage + Correct + Safety Suggestions  
7. End Exercise → Optionally Save Session Stats  

*Optional Diagram:* Webcam → Pose Detection → Analysis → Feedback → Presage Prediction → ElevenLabs TTS → User Audio

---

## 6. Implementation Plan

### Phase 1: MVP Setup
- Set up HTML/CSS layout
- Integrate webcam feed
- Implement basic pose detection (1 exercise)
- Implement form analysis logic
- Integrate ElevenLabs TTS API
- Play real-time voice feedback

### Phase 2: Presage & Enhancements
- Integrate Presage SDK for predictive fatigue/mistake analytics
- Add additional exercises
- Rep counting
- Voice personality selection
- Text feedback display
- Minor gamification (badges, encouragements)

### Phase 3: Testing & Demo
- Test real-time responsiveness
- Validate angle thresholds
- Ensure audio timing is natural
- Test Presage predictions and their audio alerts
- Ensure user experience is intuitive and safe

---

## 7. Deliverables for Hackathon
- Functional web app demonstrating **voice-first form correction with predictive safety suggestions**
- Demo script highlighting:
  - Accessibility impact
  - Voice encouragement
  - Presage-powered safety predictions
  - Real-time correction
- Technical documentation for judges

---

## 8. Assumptions & Constraints
- Single-user focus (no multi-user support)
- Camera feed processed in-browser (privacy-friendly)
- Voice feedback limited to short phrases for latency
- Only safe, beginner-friendly exercises included
- MVP prioritizes accessibility, clarity, and safety over AI perfection

---

## 9. Future Scope (Beyond Hackathon)
- Additional exercises & difficulty levels
- Personalized training plans
- Integration with wearable devices for better Presage predictions
- Multi-user / social features
- Adaptive AI feedback based on past performance
