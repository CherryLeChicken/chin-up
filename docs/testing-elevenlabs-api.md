# Testing ElevenLabs API Key

This guide will help you test and verify that your ElevenLabs API key is working correctly.

## Quick Test Method

### Option 1: Using the Built-in Test Component

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser (usually `http://localhost:5173`)

3. **Find the "ElevenLabs API Key Test" panel** in the right sidebar

4. **Test your API key**:
   - If you've set `VITE_ELEVENLABS_API_KEY` in your `.env` file, it will automatically use that
   - Otherwise, enter your API key in the input field
   - Click "Test API Key"

5. **Check the result**:
   - ✅ **Success**: Green message showing "API key is valid!" and audio will play
   - ❌ **Error**: Red message with error details

### Option 2: Set Environment Variable

1. **Create a `.env` file** in the project root (if it doesn't exist):
   ```bash
   touch .env
   ```

2. **Add your API key**:
   ```
   VITE_ELEVENLABS_API_KEY=your_api_key_here
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

4. **The test component will automatically detect** the environment variable

## Getting Your API Key

1. Go to [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Create a new API key or copy an existing one
5. The key will look like: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Manual Testing (Browser Console)

You can also test directly in the browser console:

```javascript
// Test API key
const apiKey = 'your_api_key_here'

fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': apiKey
  },
  body: JSON.stringify({
    text: 'Hello, this is a test',
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75
    }
  })
})
.then(response => {
  if (response.ok) {
    console.log('✅ API key is valid!')
    return response.blob()
  } else {
    return response.json().then(err => {
      throw new Error(`API Error: ${err.detail?.message || response.statusText}`)
    })
  }
})
.then(blob => {
  console.log(`Generated ${blob.size} bytes of audio`)
  const audioUrl = URL.createObjectURL(blob)
  const audio = new Audio(audioUrl)
  audio.play()
})
.catch(error => {
  console.error('❌ Error:', error.message)
})
```

## What to Look For

### ✅ Success Indicators:
- Green success message in the test component
- Audio plays saying "Test"
- Console shows no errors
- Voice feedback works during exercises

### ❌ Error Indicators:
- Red error message
- Common errors:
  - **401 Unauthorized**: Invalid API key
  - **429 Too Many Requests**: Rate limit exceeded
  - **400 Bad Request**: Invalid request format
  - **Network Error**: Check internet connection

## Troubleshooting

### "No API key provided"
- **Solution**: Set `VITE_ELEVENLABS_API_KEY` in `.env` file or enter it in the test component

### "401 Unauthorized"
- **Solution**: Check that your API key is correct
- Make sure there are no extra spaces or quotes
- Verify the key is active in your ElevenLabs account

### "429 Too Many Requests"
- **Solution**: You've hit the rate limit
- Wait a few minutes and try again
- Check your ElevenLabs account usage limits

### API key works but voice doesn't play during exercises
- **Check**: Browser console for errors
- **Check**: That you've selected an exercise and started detection
- **Check**: That form feedback is being generated

### Environment variable not loading
- **Solution**: Make sure the `.env` file is in the project root
- **Solution**: Restart the dev server after adding the variable
- **Solution**: Variable must start with `VITE_` for Vite to expose it

## Verifying It's Working During Exercises

1. Set up your API key (via `.env` or test component)
2. Select an exercise (Squat or Push-Up)
3. Start detection
4. Perform the exercise
5. **Listen for voice feedback** - if you hear AI-generated voice (not robotic browser voice), the API key is working!

## Fallback Behavior

If the API key is invalid or missing:
- The app will automatically fall back to Web Speech API
- You'll see "Using Web Speech API fallback" in the console
- Voice will still work, but with browser's default TTS (less natural)

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control!

- The `.env` file should be in `.gitignore`
- Use environment variables for production deployments
- Don't share your API key publicly
