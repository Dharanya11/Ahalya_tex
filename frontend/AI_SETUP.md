# AI Image Generation Setup Guide

This guide will help you set up AI image generation for the "Design Your Bag" feature.

## Quick Start

1. Choose an AI provider (Replicate or OpenAI)
2. Get your API key/token
3. Create a `.env` file in the project root
4. Add your API key
5. Restart your dev server

## Option 1: Replicate API (Stable Diffusion)

### Why Replicate?
- Great for product photography
- Pay-per-use pricing
- High-quality results
- Fast generation

### Setup Steps

1. **Sign up for Replicate**
   - Go to [replicate.com](https://replicate.com)
   - Create a free account

2. **Get your API token**
   - Navigate to [Account Settings > API Tokens](https://replicate.com/account/api-tokens)
   - Click "Create token"
   - Copy your token

3. **Add to .env file**
   ```env
   VITE_REPLICATE_API_TOKEN=r8_your_token_here
   ```

4. **Restart your server**
   ```bash
   npm run dev
   ```

### Pricing
- ~$0.003 per image (SDXL model)
- First $5 free for new users

## Option 2: OpenAI DALL·E API

### Why DALL·E?
- Very high quality
- Good text understanding
- Reliable service

### Setup Steps

1. **Sign up for OpenAI**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an account

2. **Get your API key**
   - Navigate to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy your key (you won't see it again!)

3. **Add billing**
   - Go to [Billing](https://platform.openai.com/account/billing)
   - Add a payment method
   - Set usage limits if desired

4. **Add to .env file**
   ```env
   VITE_OPENAI_API_KEY=sk-your_key_here
   ```

5. **Restart your server**

### Pricing
- DALL·E 3: $0.040 per image (1024x1024)
- DALL·E 2: $0.020 per image (1024x1024)

## Option 3: Use Both (Recommended for Production)

Configure both APIs for automatic fallback:

```env
VITE_REPLICATE_API_TOKEN=r8_your_token_here
VITE_OPENAI_API_KEY=sk-your_key_here
VITE_AI_PROVIDER=replicate
```

The system will:
1. Try Replicate first (faster, cheaper)
2. Fall back to OpenAI if Replicate fails
3. Show error if both fail

## Testing Your Setup

1. Navigate to "Design Your Bag" page
2. Customize your bag
3. Click "🤖 AI Preview" button
4. Wait 30-60 seconds for generation
5. You should see the generated image!

## Troubleshooting

### "No AI API keys configured" Error

- Check that your `.env` file is in the project root
- Verify the variable names are correct (must start with `VITE_`)
- Restart your development server
- Check for typos in your API key

### "Failed to generate image" Error

- Verify your API key is valid
- Check your API account has credits/billing set up
- Check browser console for detailed error messages
- Try the other provider as a test

### Image Generation Takes Too Long

- Replicate: Usually 30-60 seconds
- OpenAI: Usually 10-20 seconds
- This is normal for AI image generation
- Check your internet connection

### CORS Errors

- AI APIs are called from the browser
- Some APIs may require a backend proxy
- Replicate and OpenAI work directly from browser
- If issues persist, consider a backend proxy

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`
   - Double-check before committing

2. **Use environment-specific keys**
   - Different keys for dev/prod
   - Rotate keys regularly

3. **Set usage limits**
   - Prevent unexpected charges
   - Monitor usage in provider dashboard

4. **Consider rate limiting**
   - Prevent abuse
   - Add user authentication

## Advanced Configuration

### Custom Model Selection

Edit `src/services/aiImageService.js` to change models:

```javascript
// For Replicate, change the model version
const REPLICATE_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

// For OpenAI, change the model
const OPENAI_MODEL = 'dall-e-3'; // or 'dall-e-2'
```

### Backend Proxy (Optional)

For production, consider proxying API calls through your backend:

1. Create API endpoints in your backend
2. Store API keys server-side
3. Update `aiImageService.js` to call your endpoints
4. Add authentication/rate limiting

## Support

- Replicate Docs: [replicate.com/docs](https://replicate.com/docs)
- OpenAI Docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- Project Issues: Contact the development team
