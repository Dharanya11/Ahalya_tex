# Shri Ahalya Tex - Ecommerce Platform

A modern ecommerce platform for custom cotton products including carpets, bedsheets, and customizable bags.

## Features

- 🛍️ Product catalog (Carpets, Bedsheets)
- 🎨 **Design Your Bag** - Full customization tool with live preview
- 🤖 **AI Image Generation** - Generate realistic product previews using AI
- 💾 Save and reload custom designs
- 💰 Dynamic pricing based on customizations
- 📱 Responsive design

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

## AI Image Generation Setup

The "Design Your Bag" feature includes AI-powered image generation. To enable this feature, you need to set up an API key.

### Option 1: Replicate API (Stable Diffusion) - Recommended

1. Sign up at [Replicate](https://replicate.com)
2. Get your API token from [Account Settings](https://replicate.com/account/api-tokens)
3. Create a `.env` file in the project root:
   ```env
   VITE_REPLICATE_API_TOKEN=your_replicate_token_here
   ```

### Option 2: OpenAI DALL·E API

1. Sign up at [OpenAI](https://platform.openai.com)
2. Get your API key from [API Keys](https://platform.openai.com/api-keys)
3. Create a `.env` file in the project root:
   ```env
   VITE_OPENAI_API_KEY=your_openai_key_here
   ```

### Option 3: Use Both (Fallback)

You can configure both APIs for automatic fallback:

```env
VITE_REPLICATE_API_TOKEN=your_replicate_token_here
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_AI_PROVIDER=replicate
```

The system will try the preferred provider first, then fall back to the other if it fails.

### Important Notes

- **Never commit your `.env` file** - It's already in `.gitignore`
- Restart your development server after adding API keys
- Replicate API is recommended for product photography
- DALL·E API may have usage limits based on your plan

## Project Structure

```
src/
├── components/
│   ├── DesignYourBag.jsx    # Main customization component
│   ├── Shop.jsx              # Carpets shop
│   ├── Bedsheets.jsx         # Bedsheets shop
│   └── ...
├── services/
│   └── aiImageService.js     # AI image generation service
└── ...
```

## Customization Features

### Bag Customization
- Colors: Bag fabric, handles, zipper
- Size: Small, Medium, Large
- Fabric: Standard or Premium Cotton
- Personalization: Custom text with font selection
- Image/Logo upload with placement options

### Pricing
- Base price: ₹799
- Name print: +₹99
- Image print: +₹149
- Premium fabric: +₹199

## Build for Production

```bash
npm run build
```

## License

Private project - All rights reserved
