# Testing Presage Integration

This guide explains how to test and verify that Presage breathing tracking and predictive analytics are working correctly.

## Visual Indicators

### 1. Presage Analytics Panel
When you start an exercise and your full body is detected, you'll see a **green-bordered panel** in the bottom-left corner showing:
- **Breathing Rate**: `slow` / `normal` / `fast` (color-coded)
- **Consistency**: `steady` / `erratic` (color-coded)
- **Signal Confidence**: `low` / `medium` / `high` (color-coded)
- **Rep Count**: Number of completed reps

### 2. Console Logs
Open your browser's Developer Console (F12) to see:
- `Presage Metrics:` logged every 5 seconds showing current values
- Breathing analysis updates

## How to Test

### Test 1: Breathing Rate Detection

1. **Start the app** and select "Squat" exercise
2. **Stand in front of camera** until you see the green border (full body detected)
3. **Breathe normally** - you should see "Breathing Rate: normal" in the Presage panel
4. **Breathe faster** (quick, shallow breaths) - rate should change to "fast" after ~10 seconds
5. **Breathe slowly** (deep, slow breaths) - rate should change to "slow"

**Expected Result**: Breathing rate updates in the panel and console logs show the changes.

### Test 2: Breathing Consistency

1. **Breathe in a steady rhythm** (consistent timing)
   - Should show "Consistency: steady"
2. **Breathe erratically** (vary your breathing pattern, hold breath, quick breaths)
   - Should show "Consistency: erratic" after a few cycles

**Expected Result**: Consistency metric updates based on breathing pattern regularity.

### Test 3: Signal Confidence

1. **Stand still with good lighting** - confidence should be "high" or "medium"
2. **Move around or have poor lighting** - confidence may drop to "low"
3. **Ensure full body is visible** - confidence should improve

**Expected Result**: Signal confidence reflects data quality from pose detection.

### Test 4: Rep Counting

1. **Do squats** - complete full squat movements
2. **Watch the rep counter** in the right panel
3. **Check Presage panel** - rep count should match

**Expected Result**: Reps are counted automatically as you complete squats.

### Test 5: Voice Adaptation

1. **Breathe fast** - voice feedback should be slower and calmer
2. **Breathe slow** - voice feedback can be slightly more energetic
3. **Breathe erratically** - voice should be more measured and steady

**Expected Result**: Voice tone adapts based on breathing patterns (listen for rate/pitch changes).

### Test 6: Feedback Frequency Adaptation

1. **Low confidence** - feedback should be less frequent (longer intervals)
2. **High confidence** - feedback should be more responsive (normal intervals)

**Expected Result**: Feedback timing adapts based on signal confidence.

### Test 7: Predictive Analytics

1. **Do 5+ squats** - system needs data to predict
2. **Slow down your reps** - should trigger fatigue prediction
3. **Let form degrade** - should trigger form mistake prediction
4. **Listen for proactive suggestions** like:
   - "You're slowing down. Consider taking a short break soon."
   - "Your posture may weaken after the next rep. Slow down and focus on form."

**Expected Result**: Proactive voice suggestions appear before problems occur.

## Console Debugging

### What to Look For

1. **Presage Metrics Logs** (every 5 seconds):
   ```
   Presage Metrics: {
     breathingRate: "normal",
     breathingConsistency: "steady",
     signalConfidence: "high",
     repCount: 3
   }
   ```

2. **Breathing Analysis**:
   - Check that breathing data is being collected
   - Verify cycle detection is working

3. **Predictions**:
   - Look for prediction objects with suggestions
   - Check that predictions are being generated after enough reps

## Troubleshooting

### No Presage Panel Appears
- **Check**: Is full body detected? (green border around camera)
- **Check**: Is an exercise selected?
- **Check**: Is detection active?

### Breathing Rate Not Updating
- **Wait**: System needs ~10 seconds of breathing data
- **Check**: Are you breathing visibly? (chest movement should be detectable)
- **Check**: Console for errors

### Reps Not Counting
- **Check**: Are you completing full squat movements?
- **Check**: Is form analysis detecting valid form?
- **Check**: Console logs for rep detection

### No Voice Adaptations
- **Check**: Are breathing metrics updating in the panel?
- **Check**: Voice feedback should adapt automatically
- **Note**: Adaptations are subtle - listen carefully for rate/pitch changes

## Expected Behavior Summary

✅ **Working Correctly When:**
- Presage panel appears with metrics
- Metrics update every 3-5 seconds
- Reps are counted accurately
- Voice feedback adapts based on breathing
- Proactive suggestions appear after 3+ reps
- Console shows regular metric updates

❌ **Not Working When:**
- Panel doesn't appear
- Metrics stay at default values
- No console logs
- Reps don't count
- No voice adaptations

## Quick Test Checklist

- [ ] Presage panel visible when full body detected
- [ ] Breathing rate updates (try fast/slow breathing)
- [ ] Consistency changes (try steady vs erratic)
- [ ] Signal confidence reflects data quality
- [ ] Reps are counted during squats
- [ ] Console shows "Presage Metrics" logs
- [ ] Voice feedback adapts (listen for tone changes)
- [ ] Proactive suggestions appear after multiple reps
