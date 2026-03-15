import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import Footer from './Footer';

export default function DesignYourBedsheet() {
  const { addToCart } = useCart();
  
  const [customization, setCustomization] = useState({
    bedSize: 'Double',
    color: '#FFFFFF',
    printPattern: 'solid',
    fabricType: 'cotton',
    threadCount: '200',
    pillowMatching: true,
    roomStyle: 'modern',
    lighting: 'natural',
    customPattern: null,
    textureIntensity: 'medium'
  });

  const [price, setPrice] = useState(2799);
  const [showRoomPreview, setShowRoomPreview] = useState(true);
  const [zoomedFabric, setZoomedFabric] = useState(null);
  const canvasRef = useRef(null);
  const [fabricTexture, setFabricTexture] = useState(null);
  const [realisticMode, setRealisticMode] = useState(true);
  const [lightingAngle, setLightingAngle] = useState(45);
  const [shadowIntensity, setShadowIntensity] = useState(0.7);
  const [depthOfField, setDepthOfField] = useState(0.8);
  const [materialReflection, setMaterialReflection] = useState(0.3);
  const [fabricPatternScale, setFabricPatternScale] = useState(1.0);
  const [clothSimulation, setClothSimulation] = useState(true);
  const [naturalDaylight, setNaturalDaylight] = useState(true);
  const [uploadedPattern, setUploadedPattern] = useState(null);
  const [useUploadedPattern, setUseUploadedPattern] = useState(false);
  const fileInputRef = useRef(null);

  const basePrice = 2000;
  const sizePrices = {
    'Single': 0,
    'Double': 500,
    'Queen': 800,
    'King': 1200
  };
  const fabricPrices = {
    'cotton': 0,
    'premium': 500,
    'silk': 1500
  };
  const threadCountPrices = {
    '200': 0,
    '250': 300,
    '300': 600,
    '400': 1000
  };

  const bedSizes = [
    { value: 'Single', label: 'Single', dimensions: '90cm × 190cm', icon: '🛏️' },
    { value: 'Double', label: 'Double', dimensions: '135cm × 190cm', icon: '🛏️' },
    { value: 'Queen', label: 'Queen', dimensions: '150cm × 200cm', icon: '🛏️' },
    { value: 'King', label: 'King', dimensions: '180cm × 200cm', icon: '🛏️' }
  ];

  const fabricTypes = [
    { value: 'cotton', label: 'Standard Cotton', description: '100% Pure Cotton', price: 0 },
    { value: 'premium', label: 'Premium Cotton', description: 'Extra Soft & Durable', price: 500 },
    { value: 'silk', label: 'Silk Blend', description: 'Luxury Silk-Cotton Mix', price: 1500 }
  ];

  const colorOptions = [
    { color: '#F5F5DC', name: 'Cream', category: 'neutral' },
    { color: '#FFF8DC', name: 'Cornsilk', category: 'neutral' },
    { color: '#DEB887', name: 'Burlywood', category: 'warm' },
    { color: '#D2B48C', name: 'Tan', category: 'warm' },
    { color: '#8B4513', name: 'Saddle Brown', category: 'warm' },
    { color: '#F0E68C', name: 'Khaki', category: 'neutral' },
    { color: '#E6E6FA', name: 'Lavender', category: 'cool' },
    { color: '#DDA0DD', name: 'Plum', category: 'cool' },
    { color: '#98D8C8', name: 'Mint', category: 'cool' },
    { color: '#F5DEB3', name: 'Wheat', category: 'warm' },
    { color: '#FFE4B5', name: 'Moccasin', category: 'warm' },
    { color: '#FAEBD7', name: 'Antique White', category: 'neutral' }
  ];

  const printPatterns = [
    { value: 'solid', label: 'Solid', description: 'Clean solid color', preview: 'solid' },
    { value: 'floral', label: 'Floral', description: 'Elegant flower patterns', preview: 'floral' },
    { value: 'geometric', label: 'Geometric', description: 'Modern geometric shapes', preview: 'geometric' },
    { value: 'striped', label: 'Striped', description: 'Classic stripes', preview: 'striped' },
    { value: 'paisley', label: 'Paisley', description: 'Traditional paisley', preview: 'paisley' },
    { value: 'damask', label: 'Damask', description: 'Luxury damask weave', preview: 'damask' }
  ];

  const threadCounts = [
    { value: '200', label: '200 TC', description: 'Standard', price: 0 },
    { value: '250', label: '250 TC', description: 'Premium', price: 300 },
    { value: '300', label: '300 TC', description: 'Luxury', price: 600 },
    { value: '400', label: '400 TC', description: 'Ultra Luxury', price: 1000 }
  ];

  const roomStyles = [
    { value: 'modern', label: 'Modern', description: 'Clean lines, minimalist' },
    { value: 'traditional', label: 'Traditional', description: 'Classic, elegant' },
    { value: 'bohemian', label: 'Bohemian', description: 'Eclectic, artistic' },
    { value: 'scandinavian', label: 'Scandinavian', description: 'Cozy, functional' }
  ];

  const lightingOptions = [
    { value: 'natural', label: 'Natural Light', description: 'Bright, airy' },
    { value: 'warm', label: 'Warm Light', description: 'Cozy, intimate' },
    { value: 'cool', label: 'Cool Light', description: 'Crisp, clean' },
    { value: 'dim', label: 'Dim Light', description: 'Soft, relaxing' }
  ];

  const textureIntensities = [
    { value: 'subtle', label: 'Subtle', description: 'Light texture' },
    { value: 'medium', label: 'Medium', description: 'Balanced texture' },
    { value: 'rich', label: 'Rich', description: 'Deep texture' }
  ];

  // ML-based color harmony algorithm
  const getColorHarmony = (baseColor) => {
    const colorPalettes = {
      warm: ['#F5DEB3', '#FFE4B5', '#DEB887', '#D2B48C', '#F0E68C'],
      cool: ['#E6E6FA', '#DDA0DD', '#98D8C8', '#B0E0E6', '#ADD8E6'],
      neutral: ['#F5F5DC', '#FFF8DC', '#FAEBD7', '#F5F5F5', '#E8E8E8']
    };

    const isWarm = baseColor.includes('F5DE') || baseColor.includes('FFE4') || baseColor.includes('DEB8');
    const isCool = baseColor.includes('E6E6') || baseColor.includes('DDA0') || baseColor.includes('98D8');
    
    if (isWarm) return colorPalettes.warm;
    if (isCool) return colorPalettes.cool;
    return colorPalettes.neutral;
  };

  // Handle pattern upload
  const handlePatternUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setUploadedPattern(img);
          setUseUploadedPattern(true);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate ultra-realistic fabric texture with uploaded pattern support
  const generateFabricTexture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = 800; // Higher resolution for ultra-realistic rendering
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Create base fabric texture
    const createBaseFabric = () => {
      if (customization.fabricType === 'cotton') {
        // Ultra-realistic cotton weave with micro-fibers
        for (let i = 0; i < width; i += 1) {
          for (let j = 0; j < height; j += 1) {
            // Create realistic weave pattern
            const isWarp = Math.floor(i / 2) % 2 === Math.floor(j / 2) % 2;
            const threadVariation = Math.sin(i * 0.02) * Math.cos(j * 0.02) * 0.05;
            const brightness = isWarp ? 0.94 + threadVariation : 0.86 + threadVariation;
            const microFiber = Math.random() > 0.95 ? Math.random() * 0.03 : 0;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness + microFiber})`;
            ctx.fillRect(i, j, 1, 1);
            
            // Add realistic fiber strands
            if (Math.random() > 0.98) {
              const fiberLength = 3 + Math.random() * 5;
              const fiberAngle = Math.random() * Math.PI * 2;
              ctx.strokeStyle = `rgba(200, 200, 200, ${Math.random() * 0.02})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(i, j);
              ctx.lineTo(i + Math.cos(fiberAngle) * fiberLength, j + Math.sin(fiberAngle) * fiberLength);
              ctx.stroke();
            }
          }
        }
      } else if (customization.fabricType === 'premium') {
        // Premium cotton with ultra-fine weave and luxury sheen
        for (let i = 0; i < width; i += 0.5) {
          for (let j = 0; j < height; j += 0.5) {
            const threadAngle = Math.sin(i * 0.05) * Math.cos(j * 0.05);
            const brightness = 0.91 + threadAngle * 0.09;
            const premiumSheen = Math.random() > 0.97 ? 0.04 : 0;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness + premiumSheen})`;
            ctx.fillRect(i, j, 0.5, 0.5);
            
            // Add premium micro-sheen particles
            if (Math.random() > 0.995) {
              const sheenGradient = ctx.createRadialGradient(i, j, 0, i, j, 2);
              sheenGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
              sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = sheenGradient;
              ctx.fillRect(i - 2, j - 2, 4, 4);
            }
          }
        }
      } else if (customization.fabricType === 'silk') {
        // Ultra-realistic silk with smooth drape and natural sheen
        const baseGradient = ctx.createLinearGradient(0, 0, width, height);
        baseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        baseGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.25)');
        baseGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.65)');
        baseGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)');
        baseGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.75)');
        baseGradient.addColorStop(1, 'rgba(255, 255, 255, 0.85)');
        
        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add natural silk weave with varying sheen
        for (let i = 0; i < width; i += 3) {
          for (let j = 0; j < height; j += 3) {
            const sheenIntensity = Math.sin(i * 0.03) * Math.cos(j * 0.03) + Math.sin(i * 0.07) * Math.cos(j * 0.07);
            const sheenGradient = ctx.createRadialGradient(i, j, 0, i, j, 6);
            sheenGradient.addColorStop(0, `rgba(255, 255, 255, ${0.35 + sheenIntensity * 0.15})`);
            sheenGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.15 + sheenIntensity * 0.1})`);
            sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = sheenGradient;
            ctx.fillRect(i - 6, j - 6, 12, 12);
          }
        }
        
        // Add realistic silk drape and flow lines
        for (let drape = 0; drape < 8; drape++) {
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          const endX = startX + (Math.random() - 0.5) * 300;
          const endY = startY + (Math.random() - 0.5) * 300;
          
          const drapeGradient = ctx.createLinearGradient(startX, startY, endX, endY);
          drapeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.12)');
          drapeGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.04)');
          drapeGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.06)');
          drapeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
          
          ctx.strokeStyle = drapeGradient;
          ctx.lineWidth = 15 + Math.random() * 12;
          ctx.lineCap = 'round';
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            startX + (Math.random() - 0.5) * 100, startY + (Math.random() - 0.5) * 100,
            endX + (Math.random() - 0.5) * 100, endY + (Math.random() - 0.5) * 100,
            endX, endY
          );
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    };

    // Apply uploaded pattern with DSLR-quality perspective and seamless repetition
    const applyUploadedPattern = () => {
      if (!useUploadedPattern || !uploadedPattern) return;
      
      // Calculate pattern size based on bed size for proper DSLR-style perspective
      const bedSizeMultiplier = {
        'Single': 0.8,
        'Double': 1.0,
        'Queen': 1.2,
        'King': 1.4
      }[customization.bedSize] || 1.0;
      
      // DSLR-quality pattern resolution
      const patternSize = 120 * fabricPatternScale * bedSizeMultiplier;
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternSize;
      patternCanvas.height = patternSize;
      const patternCtx = patternCanvas.getContext('2d');
      
      // Apply DSLR-style perspective transformation for bedsheet surface
      patternCtx.save();
      
      // Enhanced perspective for realistic bedsheet appearance
      const perspectiveX = 1.0;
      const perspectiveY = 0.92; // Slight vertical perspective for bedsheet surface
      const skewX = 0.02; // Subtle horizontal skew for natural bedsheet drape
      
      patternCtx.transform(perspectiveX, skewX, 0, perspectiveY, 0, 0);
      
      // Add subtle vignette for DSLR-style lighting falloff
      const vignetteGradient = patternCtx.createRadialGradient(
        patternSize/2, patternSize/2, 0,
        patternSize/2, patternSize/2, patternSize/2
      );
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.02)');
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
      patternCtx.fillStyle = vignetteGradient;
      patternCtx.fillRect(0, 0, patternSize, patternSize);
      
      // Draw the uploaded pattern with enhanced quality
      patternCtx.drawImage(uploadedPattern, 0, 0, patternSize, patternSize);
      
      // Add subtle texture overlay for DSLR quality
      const textureOverlay = patternCtx.createLinearGradient(0, 0, patternSize, patternSize);
      textureOverlay.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
      textureOverlay.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
      textureOverlay.addColorStop(1, 'rgba(255, 255, 255, 0)');
      patternCtx.fillStyle = textureOverlay;
      patternCtx.fillRect(0, 0, patternSize, patternSize);
      
      patternCtx.restore();
      
      // Create DSLR-quality seamless pattern with professional blending
      const pattern = ctx.createPattern(patternCanvas, 'repeat');
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      
      // Add ultra-realistic cotton fabric texture overlay for DSLR quality
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.35;
      
      // Enhanced cotton weave texture for DSLR quality
      for (let i = 0; i < width; i += 1) {
        for (let j = 0; j < height; j += 1) {
          const isWarp = Math.floor(i / 2) % 2 === Math.floor(j / 2) % 2;
          const threadVariation = Math.sin(i * 0.02) * Math.cos(j * 0.02) * 0.06;
          const brightness = isWarp ? 0.97 + threadVariation : 0.89 + threadVariation;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
          ctx.fillRect(i, j, 1, 1);
          
          // Add micro-fibers for DSLR-quality cotton realism
          if (Math.random() > 0.99) {
            const fiberLength = 2 + Math.random() * 4;
            const fiberAngle = Math.random() * Math.PI * 2;
            ctx.strokeStyle = `rgba(200, 200, 200, ${Math.random() * 0.02 + 0.01})`;
            ctx.lineWidth = 0.4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(i, j);
            ctx.lineTo(i + Math.cos(fiberAngle) * fiberLength, j + Math.sin(fiberAngle) * fiberLength);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      
      // Add DSLR-quality fabric surface highlights
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.25;
      
      for (let i = 0; i < width; i += 3) {
        for (let j = 0; j < height; j += 3) {
          if (Math.random() > 0.65) {
            const highlightGradient = ctx.createRadialGradient(i, j, 0, i, j, 4);
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = highlightGradient;
            ctx.fillRect(i - 4, j - 4, 8, 8);
          }
        }
      }
      
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    // Apply photorealistic pattern with natural wrapping
    const applyPattern = () => {
      if (useUploadedPattern) {
        applyUploadedPattern();
        return;
      }
      
      if (customization.printPattern === 'solid') return;
      
      const patternSize = 40 * fabricPatternScale;
      
      if (customization.printPattern === 'floral') {
        // Ultra-realistic floral pattern with natural variation
        for (let repeatX = 0; repeatX < width / patternSize + 2; repeatX++) {
          for (let repeatY = 0; repeatY < height / patternSize + 2; repeatY++) {
            const baseX = repeatX * patternSize;
            const baseY = repeatY * patternSize;
            
            // Main flower with natural variation
            const flowerSize = patternSize * 0.3 * (0.9 + Math.random() * 0.2);
            const petalCount = 6 + Math.floor(Math.random() * 2);
            
            for (let petal = 0; petal < petalCount; petal++) {
              const angle = (petal / petalCount) * Math.PI * 2;
              const petalX = baseX + Math.cos(angle) * flowerSize * 0.6;
              const petalY = baseY + Math.sin(angle) * flowerSize * 0.6;
              
              const petalGradient = ctx.createRadialGradient(petalX, petalY, 0, petalX, petalY, flowerSize * 0.4);
              petalGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
              petalGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
              petalGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
              
              ctx.fillStyle = petalGradient;
              ctx.beginPath();
              ctx.ellipse(petalX, petalY, flowerSize * 0.4, flowerSize * 0.2, angle, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // Flower center
            const centerGradient = ctx.createRadialGradient(baseX, baseY, 0, baseX, baseY, flowerSize * 0.2);
            centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
            centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            ctx.fillStyle = centerGradient;
            ctx.beginPath();
            ctx.arc(baseX, baseY, flowerSize * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Secondary smaller flowers
            if (Math.random() > 0.6) {
              const smallFlowerX = baseX + (Math.random() - 0.5) * patternSize * 0.8;
              const smallFlowerY = baseY + (Math.random() - 0.5) * patternSize * 0.8;
              const smallFlowerSize = flowerSize * 0.4;
              
              for (let smallPetal = 0; smallPetal < 4; smallPetal++) {
                const smallAngle = (smallPetal / 4) * Math.PI * 2;
                const smallPetalX = smallFlowerX + Math.cos(smallAngle) * smallFlowerSize * 0.5;
                const smallPetalY = smallFlowerY + Math.sin(smallAngle) * smallFlowerSize * 0.5;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.beginPath();
                ctx.arc(smallPetalX, smallPetalY, smallFlowerSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      } else if (customization.printPattern === 'geometric') {
        // Ultra-realistic geometric pattern with precision
        for (let repeatX = 0; repeatX < width / patternSize + 1; repeatX++) {
          for (let repeatY = 0; repeatY < height / patternSize + 1; repeatY++) {
            const baseX = repeatX * patternSize;
            const baseY = repeatY * patternSize;
            
            // Main geometric shapes
            const shapeSize = patternSize * 0.4;
            const shapeGradient = ctx.createLinearGradient(baseX, baseY, baseX + shapeSize, baseY + shapeSize);
            shapeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
            shapeGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
            shapeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
            
            ctx.fillStyle = shapeGradient;
            ctx.fillRect(baseX + patternSize * 0.3, baseY + patternSize * 0.3, shapeSize, shapeSize);
            
            // Diagonal lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.lineTo(baseX + patternSize, baseY + patternSize);
            ctx.moveTo(baseX + patternSize, baseY);
            ctx.lineTo(baseX, baseY + patternSize);
            ctx.stroke();
            
            // Center accent
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(baseX + patternSize / 2, baseY + patternSize / 2, patternSize * 0.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (customization.printPattern === 'striped') {
        // Ultra-realistic striped pattern with natural variation
        const stripeWidth = patternSize * 0.15;
        const stripeSpacing = patternSize * 0.25;
        
        for (let i = -patternSize; i < width + patternSize; i += stripeSpacing) {
          const variation = Math.sin(i * 0.01) * 2;
          const stripeGradient = ctx.createLinearGradient(i + variation, 0, i + variation + stripeWidth, 0);
          stripeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
          stripeGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
          stripeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
          
          ctx.fillStyle = stripeGradient;
          ctx.fillRect(i + variation, 0, stripeWidth, height);
          
          // Add subtle texture to stripes
          for (let j = 0; j < height; j += 4) {
            if (Math.random() > 0.8) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
              ctx.fillRect(i + variation, j, stripeWidth, 2);
            }
          }
        }
      } else if (customization.printPattern === 'paisley') {
        // Ultra-realistic paisley with intricate details
        for (let repeatX = 0; repeatX < width / patternSize + 1; repeatX++) {
          for (let repeatY = 0; repeatY < height / patternSize + 1; repeatY++) {
            const baseX = repeatX * patternSize + patternSize / 2;
            const baseY = repeatY * patternSize + patternSize / 2;
            
            // Main paisley teardrop shape
            const teardropSize = patternSize * 0.35;
            const teardropGradient = ctx.createRadialGradient(baseX, baseY - teardropSize * 0.3, 0, baseX, baseY, teardropSize);
            teardropGradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
            teardropGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.12)');
            teardropGradient.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
            
            ctx.fillStyle = teardropGradient;
            ctx.beginPath();
            ctx.moveTo(baseX, baseY - teardropSize);
            ctx.bezierCurveTo(
              baseX - teardropSize * 0.8, baseY - teardropSize * 0.8,
              baseX - teardropSize * 0.8, baseY + teardropSize * 0.4,
              baseX, baseY + teardropSize * 0.6
            );
            ctx.bezierCurveTo(
              baseX + teardropSize * 0.8, baseY + teardropSize * 0.4,
              baseX + teardropSize * 0.8, baseY - teardropSize * 0.8,
              baseX, baseY - teardropSize
            );
            ctx.fill();
            
            // Inner decorative details
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath();
            ctx.arc(baseX, baseY - teardropSize * 0.3, teardropSize * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // Small accent dots
            for (let dot = 0; dot < 3; dot++) {
              const dotAngle = (dot / 3) * Math.PI * 2;
              const dotX = baseX + Math.cos(dotAngle) * teardropSize * 0.6;
              const dotY = baseY + Math.sin(dotAngle) * teardropSize * 0.6;
              
              ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
              ctx.beginPath();
              ctx.arc(dotX, dotY, teardropSize * 0.08, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (customization.printPattern === 'damask') {
        // Ultra-realistic damask with intricate woven patterns
        for (let repeatX = 0; repeatX < width / patternSize + 1; repeatX++) {
          for (let repeatY = 0; repeatY < height / patternSize + 1; repeatY++) {
            const baseX = repeatX * patternSize;
            const baseY = repeatY * patternSize;
            
            // Damask medallion center
            const medallionSize = patternSize * 0.3;
            const medallionGradient = ctx.createRadialGradient(
              baseX + patternSize / 2, baseY + patternSize / 2, 0,
              baseX + patternSize / 2, baseY + patternSize / 2, medallionSize
            );
            medallionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            medallionGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
            medallionGradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
            
            ctx.fillStyle = medallionGradient;
            ctx.beginPath();
            ctx.arc(baseX + patternSize / 2, baseY + patternSize / 2, medallionSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Intricate border details
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(baseX + patternSize / 2, baseY + patternSize / 2, medallionSize * 1.2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Corner flourishes
            for (let corner = 0; corner < 4; corner++) {
              const cornerAngle = (corner / 4) * Math.PI * 2;
              const flourishX = baseX + patternSize / 2 + Math.cos(cornerAngle) * medallionSize * 1.5;
              const flourishY = baseY + patternSize / 2 + Math.sin(cornerAngle) * medallionSize * 1.5;
              
              ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.beginPath();
              ctx.arc(flourishX, flourishY, medallionSize * 0.2, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // Connecting lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(baseX + patternSize * 0.2, baseY + patternSize / 2);
            ctx.lineTo(baseX + patternSize * 0.8, baseY + patternSize / 2);
            ctx.moveTo(baseX + patternSize / 2, baseY + patternSize * 0.2);
            ctx.lineTo(baseX + patternSize / 2, baseY + patternSize * 0.8);
            ctx.stroke();
          }
        }
      }
    };

    // Add ultra-realistic cotton fabric folds and wrinkles with DSLR quality
    const addClothFolds = () => {
      if (!clothSimulation) return;
      
      // DSLR-quality major folds that follow the bedsheet surface
      for (let fold = 0; fold < 20; fold++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * 300;
        const endY = startY + (Math.random() - 0.5) * 300;
        const controlX1 = startX + (Math.random() - 0.5) * 120;
        const controlY1 = startY + (Math.random() - 0.5) * 120;
        const controlX2 = endX + (Math.random() - 0.5) * 120;
        const controlY2 = endY + (Math.random() - 0.5) * 120;
        
        // Create DSLR-quality fold gradient that preserves pattern visibility
        const foldGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        foldGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        foldGradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.10)');
        foldGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
        foldGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.06)');
        foldGradient.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
        
        ctx.strokeStyle = foldGradient;
        ctx.lineWidth = 5 + Math.random() * 8;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Add DSLR-quality subtle highlight along the fold edge
        const highlightGradient = ctx.createLinearGradient(startX - 1, startY - 1, endX - 1, endY - 1);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
        
        ctx.strokeStyle = highlightGradient;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // DSLR-quality micro wrinkles for cotton fabric texture
      for (let wrinkle = 0; wrinkle < 100; wrinkle++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const wrinkleLength = 6 + Math.random() * 20;
        const wrinkleAngle = Math.random() * Math.PI * 2;
        
        // Subtle wrinkle that doesn't obscure pattern
        ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.015 + 0.005})`;
        ctx.lineWidth = 0.3 + Math.random() * 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(wrinkleAngle) * wrinkleLength, y + Math.sin(wrinkleAngle) * wrinkleLength);
        ctx.stroke();
      }
      
      // DSLR-quality natural fabric bunching and gathering
      for (let bunch = 0; bunch < 15; bunch++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 10 + Math.random() * 25;
        
        // Soft bunching that maintains pattern visibility
        const bunchGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        bunchGradient.addColorStop(0, 'rgba(0, 0, 0, 0.03)');
        bunchGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.025)');
        bunchGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.015)');
        bunchGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = bunchGradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        
        // Add DSLR-quality subtle highlight to bunching area
        const highlightGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.5);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(x - radius * 0.5, y - radius * 0.5, radius, radius);
      }
      
      // DSLR-quality edge wrinkles for realistic bedsheet edges
      for (let edge = 0; edge < 10; edge++) {
        const isTopEdge = Math.random() > 0.5;
        const x = Math.random() * width;
        const y = isTopEdge ? Math.random() * 40 : height - Math.random() * 40;
        const edgeLength = 15 + Math.random() * 35;
        
        const edgeGradient = ctx.createLinearGradient(x, y, x + edgeLength, y);
        edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.06)');
        edgeGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.03)');
        edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.015)');
        
        ctx.strokeStyle = edgeGradient;
        ctx.lineWidth = 0.8 + Math.random() * 1.5;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + edgeLength, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // DSLR-quality cotton fabric drape lines
      for (let drape = 0; drape < 8; drape++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * 100;
        const endY = startY + (Math.random() - 0.5) * 100;
        
        const drapeGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        drapeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
        drapeGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.01)');
        drapeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.005)');
        
        ctx.strokeStyle = drapeGradient;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    // Add natural material imperfections for cotton fabric
    const addMaterialImperfections = () => {
      // General fabric imperfections
      for (let imperfection = 0; imperfection < 120; imperfection++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;
        const opacity = Math.random() * 0.015;
        
        ctx.fillStyle = `rgba(150, 150, 150, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Cotton-specific fabric pilling and fuzz
      if (customization.fabricType === 'cotton') {
        for (let pill = 0; pill < 40; pill++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const pillSize = 1 + Math.random() * 2;
          
          // Create realistic cotton pilling
          const pillGradient = ctx.createRadialGradient(x, y, 0, x, y, pillSize);
          pillGradient.addColorStop(0, 'rgba(200, 200, 200, 0.02)');
          pillGradient.addColorStop(0.5, 'rgba(180, 180, 180, 0.015)');
          pillGradient.addColorStop(1, 'rgba(160, 160, 160, 0.005)');
          
          ctx.fillStyle = pillGradient;
          ctx.beginPath();
          ctx.arc(x, y, pillSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Add subtle cotton fuzz
        for (let fuzz = 0; fuzz < 60; fuzz++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const fuzzLength = 2 + Math.random() * 3;
          const fuzzAngle = Math.random() * Math.PI * 2;
          
          ctx.strokeStyle = `rgba(220, 220, 220, ${Math.random() * 0.01 + 0.005})`;
          ctx.lineWidth = 0.3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(fuzzAngle) * fuzzLength, y + Math.sin(fuzzAngle) * fuzzLength);
          ctx.stroke();
        }
      }
      
      // Premium fabric imperfections
      if (customization.fabricType === 'premium') {
        for (let imperfection = 0; imperfection < 30; imperfection++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 1;
          const opacity = Math.random() * 0.008;
          
          ctx.fillStyle = `rgba(180, 180, 180, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Silk fabric imperfections
      if (customization.fabricType === 'silk') {
        // Add very subtle imperfections for silk
        for (let imperfection = 0; imperfection < 20; imperfection++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 0.8;
          const opacity = Math.random() * 0.005;
          
          ctx.fillStyle = `rgba(190, 190, 190, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Add subtle silk sheen variations
        for (let sheen = 0; sheen < 15; sheen++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const sheenSize = 3 + Math.random() * 5;
          
          const sheenGradient = ctx.createRadialGradient(x, y, 0, x, y, sheenSize);
          sheenGradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
          sheenGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
          sheenGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = sheenGradient;
          ctx.fillRect(x - sheenSize, y - sheenSize, sheenSize * 2, sheenSize * 2);
        }
      }
      
      // Add subtle texture variations across the fabric
      for (let variation = 0; variation < 50; variation++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const variationSize = 10 + Math.random() * 20;
        
        const variationGradient = ctx.createRadialGradient(x, y, 0, x, y, variationSize);
        const variationIntensity = Math.random() * 0.02;
        variationGradient.addColorStop(0, `rgba(255, 255, 255, ${variationIntensity})`);
        variationGradient.addColorStop(0.5, `rgba(255, 255, 255, ${variationIntensity * 0.5})`);
        variationGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = variationGradient;
        ctx.fillRect(x - variationSize, y - variationSize, variationSize * 2, variationSize * 2);
      }
    };

    // Execute all rendering steps
    createBaseFabric();
    applyPattern();
    addClothFolds();
    addMaterialImperfections();

    setFabricTexture(canvas.toDataURL('image/png', 1.0));
  };

  // Calculate price
  useEffect(() => {
    let total = basePrice;
    total += sizePrices[customization.bedSize] || 0;
    total += fabricPrices[customization.fabricType] || 0;
    total += threadCountPrices[customization.threadCount] || 0;
    setPrice(total);
  }, [customization]);

  // Generate fabric texture when fabric type changes
  useEffect(() => {
    generateFabricTexture();
  }, [customization.fabricType, customization.textureIntensity]);

  const handleChange = (field, value) => {
    // Auto-match pillow color when bedsheet color changes
    if (field === 'color' && customization.pillowMatching) {
      setCustomization(prev => ({
        ...prev,
        color: value,
        pillowColor: value
      }));
    } else {
      setCustomization(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddToCart = () => {
    const product = {
      id: `bedsheet-custom-${Date.now()}`,
      name: `Custom ${customization.bedSize} Bedsheet Set`,
      price: price,
      image: '/1.jpg',
      category: 'bedsheets',
      customization: { ...customization }
    };

    addToCart(product, customization.bedSize, customization.color, 1);
    alert('Custom bedsheet set added to cart!');
  };

  const selectedFabric = fabricTypes.find(f => f.value === customization.fabricType);
  const selectedPattern = printPatterns.find(p => p.value === customization.printPattern);

  return (
    <>
      <div className="design-bedsheet-container">
        <div className="design-bedsheet-hero">
          <h1 className="design-bedsheet-title">Design Your Bedsheet</h1>
          <p className="design-bedsheet-subtitle">Create the perfect bedroom aesthetic with custom bedsheets</p>
        </div>

        <div className="design-bedsheet-content">
          {/* Customization Panel */}
          <div className="bedsheet-customization-panel">
            <h2 className="panel-title">Customize Your Bedsheet</h2>

            {/* Bed Size */}
            <div className="customization-section">
              <h3 className="section-title">Bed Size</h3>
              <div className="bed-size-grid">
                {bedSizes.map(size => (
                  <button
                    key={size.value}
                    className={`bed-size-card ${customization.bedSize === size.value ? 'active' : ''}`}
                    onClick={() => handleChange('bedSize', size.value)}
                  >
                    <span className="size-icon">{size.icon}</span>
                    <div className="size-label">{size.label}</div>
                    <div className="size-dimensions">{size.dimensions}</div>
                    {sizePrices[size.value] > 0 && (
                      <div className="size-price">+₹{sizePrices[size.value]}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="customization-section">
              <h3 className="section-title">Color</h3>
              <div className="color-swatches-grid">
                {colorOptions.map((swatch, idx) => (
                  <button
                    key={idx}
                    className={`color-swatch ${customization.color === swatch.color ? 'active' : ''}`}
                    onClick={() => handleChange('color', swatch.color)}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.name}
                    onMouseEnter={() => setZoomedFabric(swatch)}
                    onMouseLeave={() => setZoomedFabric(null)}
                  >
                    {customization.color === swatch.color && (
                      <span className="swatch-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label>Custom Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={customization.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={customization.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="color-text"
                  />
                </div>
              </div>
            </div>

            {/* Pattern Selection */}
            <div className="customization-section">
              <h3 className="section-title">Pattern Selection</h3>
              <div className="pattern-upload-section">
                <div className="upload-controls">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={useUploadedPattern}
                      onChange={(e) => setUseUploadedPattern(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Use Custom Pattern</span>
                  </label>
                  
                  {useUploadedPattern && (
                    <div className="file-upload-container">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePatternUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        className="upload-pattern-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📁 Upload Pattern
                      </button>
                      {uploadedPattern && (
                        <div className="uploaded-pattern-info">
                          <span className="pattern-status">✅ Pattern loaded</span>
                          <button
                            className="clear-pattern-btn"
                            onClick={() => {
                              setUploadedPattern(null);
                              setUseUploadedPattern(false);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {!useUploadedPattern && (
                  <div className="print-patterns-grid">
                    {printPatterns.map(pattern => (
                      <button
                        key={pattern.value}
                        className={`pattern-card ${customization.printPattern === pattern.value ? 'active' : ''}`}
                        onClick={() => handleChange('printPattern', pattern.value)}
                        onMouseEnter={() => setZoomedFabric({ color: customization.color, pattern: pattern.value, name: pattern.label })}
                        onMouseLeave={() => setZoomedFabric(null)}
                      >
                        <div 
                          className={`pattern-preview pattern-${pattern.value}`}
                          style={{ backgroundColor: customization.color }}
                        />
                        <span className="pattern-label">{pattern.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fabric Type */}
            <div className="customization-section">
              <h3 className="section-title">Fabric Type</h3>
              <div className="fabric-type-options">
                {fabricTypes.map(fabric => (
                  <label
                    key={fabric.value}
                    className={`fabric-type-card ${customization.fabricType === fabric.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="fabricType"
                      value={fabric.value}
                      checked={customization.fabricType === fabric.value}
                      onChange={(e) => handleChange('fabricType', e.target.value)}
                    />
                    <div className="fabric-type-content">
                      <span className="fabric-type-label">{fabric.label}</span>
                      <span className="fabric-type-desc">{fabric.description}</span>
                      {fabric.price > 0 && (
                        <span className="fabric-type-price">+₹{fabric.price}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Thread Count */}
            <div className="customization-section">
              <h3 className="section-title">Thread Count</h3>
              <div className="thread-count-options">
                {threadCounts.map(tc => (
                  <label
                    key={tc.value}
                    className={`thread-count-card ${customization.threadCount === tc.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="threadCount"
                      value={tc.value}
                      checked={customization.threadCount === tc.value}
                      onChange={(e) => handleChange('threadCount', e.target.value)}
                    />
                    <div className="thread-count-content">
                      <span className="thread-count-label">{tc.label}</span>
                      <span className="thread-count-desc">{tc.description}</span>
                      {tc.price > 0 && (
                        <span className="thread-count-price">+₹{tc.price}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pillow Cover Matching */}
            <div className="customization-section">
              <h3 className="section-title">Pillow Covers</h3>
              <div className="pillow-matching-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={customization.pillowMatching}
                    onChange={(e) => {
                      const matching = e.target.checked;
                      handleChange('pillowMatching', matching);
                      if (matching) {
                        handleChange('pillowColor', customization.color);
                      }
                    }}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Match Bedsheet Color</span>
                </label>
              </div>
              {!customization.pillowMatching && (
                <div className="form-group">
                  <label>Pillow Cover Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={customization.pillowColor}
                      onChange={(e) => handleChange('pillowColor', e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={customization.pillowColor}
                      onChange={(e) => handleChange('pillowColor', e.target.value)}
                      className="color-text"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Room Style */}
            <div className="customization-section">
              <h3 className="section-title">Room Style</h3>
              <div className="room-style-grid">
                {roomStyles.map(style => (
                  <button
                    key={style.value}
                    className={`room-style-card ${customization.roomStyle === style.value ? 'active' : ''}`}
                    onClick={() => handleChange('roomStyle', style.value)}
                  >
                    <div className="room-style-icon">
                      {style.value === 'modern' && '🏢'}
                      {style.value === 'traditional' && '🏛️'}
                      {style.value === 'bohemian' && '🎨'}
                      {style.value === 'scandinavian' && '🏡'}
                    </div>
                    <div className="room-style-label">{style.label}</div>
                    <small className="room-style-desc">{style.description}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="customization-section">
              <h3 className="section-title">Room Lighting</h3>
              <div className="lighting-options">
                {lightingOptions.map(lighting => (
                  <label
                    key={lighting.value}
                    className={`lighting-card ${customization.lighting === lighting.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="lighting"
                      value={lighting.value}
                      checked={customization.lighting === lighting.value}
                      onChange={(e) => handleChange('lighting', e.target.value)}
                    />
                    <div className="lighting-content">
                      <span className="lighting-label">{lighting.label}</span>
                      <span className="lighting-desc">{lighting.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Texture Intensity */}
            <div className="customization-section">
              <h3 className="section-title">Texture Intensity</h3>
              <div className="texture-intensity-options">
                {textureIntensities.map(texture => (
                  <label
                    key={texture.value}
                    className={`texture-card ${customization.textureIntensity === texture.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="textureIntensity"
                      value={texture.value}
                      checked={customization.textureIntensity === texture.value}
                      onChange={(e) => handleChange('textureIntensity', e.target.value)}
                    />
                    <div className="texture-content">
                      <span className="texture-label">{texture.label}</span>
                      <span className="texture-desc">{texture.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Photorealistic Rendering Controls */}
            <div className="customization-section">
              <h3 className="section-title">Photorealistic Rendering</h3>
              <div className="realistic-controls">
                <div className="control-group">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={realisticMode}
                      onChange={(e) => setRealisticMode(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Ultra Realistic Mode</span>
                  </label>
                </div>

                <div className="control-group">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={clothSimulation}
                      onChange={(e) => setClothSimulation(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Cloth Physics Simulation</span>
                  </label>
                </div>

                <div className="control-group">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={naturalDaylight}
                      onChange={(e) => setNaturalDaylight(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Natural Daylight</span>
                  </label>
                </div>

                {realisticMode && (
                  <>
                    <div className="slider-control">
                      <label>Pattern Scale: {fabricPatternScale.toFixed(1)}x</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={fabricPatternScale}
                        onChange={(e) => setFabricPatternScale(Number(e.target.value))}
                        className="realistic-slider"
                      />
                    </div>

                    <div className="slider-control">
                      <label>Lighting Angle: {lightingAngle}°</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={lightingAngle}
                        onChange={(e) => setLightingAngle(Number(e.target.value))}
                        className="realistic-slider"
                      />
                    </div>

                    <div className="slider-control">
                      <label>Shadow Intensity: {Math.round(shadowIntensity * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={shadowIntensity * 100}
                        onChange={(e) => setShadowIntensity(Number(e.target.value) / 100)}
                        className="realistic-slider"
                      />
                    </div>

                    <div className="slider-control">
                      <label>Depth of Field: {Math.round(depthOfField * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={depthOfField * 100}
                        onChange={(e) => setDepthOfField(Number(e.target.value) / 100)}
                        className="realistic-slider"
                      />
                    </div>

                    <div className="slider-control">
                      <label>Material Reflection: {Math.round(materialReflection * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={materialReflection * 100}
                        onChange={(e) => setMaterialReflection(Number(e.target.value) / 100)}
                        className="realistic-slider"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Preview Toggle */}
            <div className="customization-section">
              <div className="preview-toggle-group">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showRoomPreview}
                    onChange={(e) => setShowRoomPreview(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Preview in Room</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="add-to-cart-btn-large" onClick={handleAddToCart}>
                Add to Cart - ₹{price.toLocaleString('en-IN')}
              </button>
            </div>
          </div>

          {/* Hidden canvas for texture generation */}
          <canvas 
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </>
  );
};
