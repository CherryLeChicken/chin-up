# Testing Phase 2 Features

This guide will help you test the new Phase 2 features: Push-up exercise analysis, rep counting, and voice personality selection.

## Prerequisites

1. Make sure you have the dev server running:
   ```bash
   npm run dev
   ```

2. Open your browser to the localhost URL (usually `http://localhost:5173` or similar)

3. Allow camera permissions when prompted

## Testing Push-Up Exercise

### 1. Basic Push-Up Detection

**Steps:**
1. Click "Start Detection" (you don't need to select an exercise yet)
2. Position yourself in front of the camera
3. You should see:
   - Cyan skeleton overlay when pose is detected
   - Status badge showing "Detected" or "Full Body"
   - Green pulsing border when full body is visible

**Expected Results:**
- Skeleton should show all body joints (shoulders, elbows, wrists, hips, knees, ankles)
- Face keypoints should appear in purple/magenta
- Status should update in real-time

### 2. Push-Up Form Analysis

**Steps:**
1. Select "Push-Up" from the exercise selector
2. Position yourself in push-up position (plank position)
3. Make sure the camera can see:
   - Your shoulders
   - Your elbows
   - Your wrists
   - Your full body (for alignment check)

**What to Test:**

#### A. Depth Detection
- **Shallow push-up**: Only go halfway down
  - **Expected**: Feedback like "Lower your body more to get full range of motion"
  
- **Good depth**: Go down until elbows are at ~90 degrees
  - **Expected**: Feedback like "Good depth! Keep your body straight" or "Excellent depth!"

#### B. Body Alignment
- **Sagging hips**: Let your hips drop below your shoulders
  - **Expected**: Feedback like "Keep your body in a straight line from head to toe"
  - **Visual**: Green alignment line should show if body is straight

- **Piked hips**: Raise your hips too high
  - **Expected**: Same alignment feedback

#### C. Hand Position
- **Hands too far forward**: Place hands ahead of shoulders
  - **Expected**: Feedback like "Keep your hands directly under your shoulders"

#### D. Elbow Flare
- **Elbows flared out**: Let elbows point out to the sides
  - **Expected**: Feedback like "Keep your elbows closer to your body, not flared out"

### 3. Push-Up Rep Counting

**Steps:**
1. Select "Push-Up" exercise
2. Start detection
3. Perform complete push-ups:
   - Lower your body (elbows bend to ~90 degrees)
   - Push back up (elbows straighten)

**Expected Results:**
- Rep counter should increment after each complete push-up
- Counter appears in the right sidebar when reps > 0
- Each rep should be counted only when:
  - You go down (shoulders move down, elbows bend)
  - You come back up (shoulders move up, elbows straighten)
  - Form is valid (no major errors)

**Testing Tips:**
- Do 3-5 push-ups slowly and deliberately
- Make sure to go all the way down and all the way up
- Watch the rep counter increment
- Try doing partial push-ups (shouldn't count)

### 4. Skeleton Visualization for Push-Ups

**What to Look For:**
- **Green alignment line**: When in push-up position, you should see a green line connecting:
  - Shoulder → Hip → Ankle
  - This line should be relatively straight for good form
- **Cyan skeleton**: Regular body connections (arms, legs, torso)
- **Purple/Magenta face**: Face keypoints should be visible

**Visual Test:**
1. Get into push-up position
2. Check that the green line is visible
3. Try sagging your hips - line should curve
4. Straighten your body - line should be straight

## Testing Voice Personality Selection

### 1. Personality Options

**Steps:**
1. Look for the "Voice Personality" panel in the right sidebar
2. You should see three options:
   - 🧘 **Calm**: Gentle, measured coaching
   - 🎯 **Neutral**: Balanced, professional tone (default)
   - ⚡ **Energetic**: Upbeat, motivating coaching

### 2. Testing Each Personality

**Steps:**
1. Select an exercise (Squat or Push-Up)
2. Choose a voice personality
3. Start detection
4. Perform the exercise and listen to the feedback

**Expected Differences:**

#### Calm Personality
- Slower speech rate
- Lower pitch
- More stable/steady tone
- Good for: Focused, meditative workouts

#### Neutral Personality
- Balanced speech rate and pitch
- Professional tone
- Default setting

#### Energetic Personality
- Faster speech rate
- Higher pitch
- More dynamic/upbeat tone
- Good for: High-energy, motivating workouts

**Note**: The personality adapts based on your breathing patterns:
- Fast breathing → voice becomes calmer (regardless of personality)
- Erratic breathing → voice becomes more measured
- This is intentional for optimal coaching timing

### 3. Personality Persistence

**Test:**
1. Select "Energetic" personality
2. Start a workout
3. Stop the workout
4. Start again
5. **Expected**: Personality should remain "Energetic"

## Testing Integration

### Full Workflow Test

**Complete Test Scenario:**
1. Select "Push-Up" exercise
2. Choose "Energetic" voice personality
3. Click "Start Detection"
4. Position yourself in front of camera
5. Wait for green border (full body detected)
6. Perform 5 push-ups with good form
7. Check:
   - ✅ Rep counter shows 5
   - ✅ Feedback appears in text display
   - ✅ Voice feedback is energetic/upbeat
   - ✅ Green alignment line is visible
   - ✅ Form corrections are given when needed

## Console Debugging

Open browser DevTools (F12) to see:
- Pose detection status
- Keypoint detection logs (throttled)
- Presage metrics (breathing rate, consistency, confidence)
- Rep detection events

**Look for:**
- "Pose detector initialized successfully!"
- Keypoint detection logs (every 3-5 seconds)
- Presage metrics updates
- Rep count updates

## Common Issues & Solutions

### Issue: No push-up feedback
- **Check**: Is full body visible? (Look for green border)
- **Check**: Are shoulders, elbows, and wrists detected? (Check debug panel)
- **Solution**: Adjust camera angle or lighting

### Issue: Reps not counting
- **Check**: Are you going all the way down and up?
- **Check**: Is form valid? (Check feedback messages)
- **Solution**: Ensure complete range of motion

### Issue: Voice personality not changing
- **Check**: Are you using ElevenLabs API? (Web Speech API has limited personality support)
- **Check**: Is voice feedback actually playing?
- **Solution**: Set `VITE_ELEVENLABS_API_KEY` environment variable for full personality features

### Issue: Green alignment line not showing
- **Check**: Is push-up exercise selected?
- **Check**: Are shoulders, hips, and ankles all visible?
- **Solution**: Adjust position so all keypoints are detected

## Next Steps

After testing, you can:
- Try different exercises (Squat vs Push-Up)
- Test different voice personalities
- Experiment with form variations to see different feedback
- Check Presage metrics in the debug panel
