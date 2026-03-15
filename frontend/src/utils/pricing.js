export function calculateCustomizedUnitPrice(product, customization = {}) {
  const base = Number(product?.basePrice ?? product?.price ?? 0);
  let unitPrice = base;

  const size = customization?.size;
  const material = customization?.material;
  const threadCount = customization?.threadCount;
  const fabricType = customization?.fabricType;

  const sizeMultiplierMap = {
    Small: 0.9,
    Single: 0.9,
    Medium: 1,
    Double: 1.05,
    Queen: 1.1,
    Large: 1.15,
    King: 1.2,
    'Extra Large': 1.3,
  };

  const materialAddMap = {
    'Premium Cotton': 300,
    'Luxury Blend': 600,
    'Cotton-Wool Blend': 450,
    'Luxury Cotton': 500,
    'Satin Cotton': 700,
    'Premium Canvas': 250,
    'Designer Material': 800,
    'Designer Collection': 900,
  };

  const threadCountAddMap = {
    '300': 150,
    '400': 250,
    '500': 400,
    '600': 550,
  };

  if (size && sizeMultiplierMap[size] !== undefined) {
    unitPrice = unitPrice * sizeMultiplierMap[size];
  }

  if (material && materialAddMap[material] !== undefined) {
    unitPrice = unitPrice + materialAddMap[material];
  }

  if (threadCount && threadCountAddMap[String(threadCount)] !== undefined) {
    unitPrice = unitPrice + threadCountAddMap[String(threadCount)];
  }

  if (product?.category === 'bags') {
    if (fabricType === 'premium') unitPrice += 199;
    if (customization?.customText) unitPrice += 99;
    if (customization?.imageUpload) unitPrice += 149;
  }

  unitPrice = Math.round(unitPrice);
  return unitPrice < 0 ? 0 : unitPrice;
}

export function calculateLineTotal(product, customization = {}, quantity = 1) {
  const unit = calculateCustomizedUnitPrice(product, customization);
  const qty = Math.max(1, Number(quantity || 1));
  return unit * qty;
}
