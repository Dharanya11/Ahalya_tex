/**
 * AI Image Generation Service
 * Supports Replicate API (Stable Diffusion) and OpenAI DALL·E API
 */

// Replicate API Configuration
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
// Using SDXL model - you can change this to any Replicate model
const REPLICATE_MODEL_VERSION = '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

// OpenAI DALL·E API Configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_MODEL = 'dall-e-3';

/**
 * Generate image using Replicate API (Stable Diffusion)
 */
export async function generateWithReplicate(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('Replicate API key is required. Set VITE_REPLICATE_API_TOKEN in your .env file');
  }

  try {
    // Create prediction
    const createResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: REPLICATE_MODEL_VERSION,
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: '1:1',
          output_format: 'url',
          output_quality: 90,
        },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.detail || 'Failed to create prediction');
    }

    const prediction = await createResponse.json();
    const predictionId = prediction.id;

    // Poll for result
    let result = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 second intervals)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check prediction status');
      }

      result = await statusResponse.json();

      if (result.status === 'succeeded') {
        return result.output[0]; // Return the image URL
      }

      if (result.status === 'failed' || result.status === 'canceled') {
        throw new Error(result.error || 'Image generation failed');
      }

      attempts++;
    }

    throw new Error('Image generation timed out');
  } catch (error) {
    console.error('Replicate API Error:', error);
    throw error;
  }
}

/**
 * Generate image using OpenAI DALL·E API
 */
export async function generateWithDALLE(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set VITE_OPENAI_API_KEY in your .env file');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    return data.data[0].url; // Return the image URL
  } catch (error) {
    console.error('OpenAI DALL·E API Error:', error);
    throw error;
  }
}

/**
 * Main function to generate AI image
 * Automatically selects available API based on environment variables
 */
export async function generateAIImage(prompt) {
  const replicateKey = import.meta.env.VITE_REPLICATE_API_TOKEN;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const preferredProvider = import.meta.env.VITE_AI_PROVIDER || 'replicate'; // 'replicate' or 'openai'

  // Try preferred provider first
  if (preferredProvider === 'replicate' && replicateKey) {
    try {
      return await generateWithReplicate(prompt, replicateKey);
    } catch (error) {
      console.warn('Replicate failed, trying OpenAI:', error);
      // Fall through to try OpenAI
    }
  }

  if (preferredProvider === 'openai' && openaiKey) {
    try {
      return await generateWithDALLE(prompt, openaiKey);
    } catch (error) {
      console.warn('OpenAI failed, trying Replicate:', error);
      // Fall through to try Replicate
    }
  }

  // Try the other provider if preferred one failed or not available
  if (replicateKey && preferredProvider !== 'replicate') {
    try {
      return await generateWithReplicate(prompt, replicateKey);
    } catch (error) {
      console.error('Replicate fallback failed:', error);
    }
  }

  if (openaiKey && preferredProvider !== 'openai') {
    try {
      return await generateWithDALLE(prompt, openaiKey);
    } catch (error) {
      console.error('OpenAI fallback failed:', error);
    }
  }

  // If we get here, no API keys are configured
  throw new Error(
    'No AI API keys configured. Please set VITE_REPLICATE_API_TOKEN or VITE_OPENAI_API_KEY in your .env file'
  );
}
