// ==================== 配置模块 ====================
const CONFIG = {
  UNITS: {
    INCH_TO_CM: 2.54,
    LBS_TO_KG: 0.453592
  },
  
  DEFAULT_VALUES: {
    'inch-lbs': {
      pallet: { length: 40, width: 48, height: 100, weight: 1500 },
      sku: { length: 11.8, width: 7.9, height: 5.9, weight: 11 }
    },
    'cm-kg': {
      pallet: { length: 120, width: 80, height: 180, weight: 1000 },
      sku: { length: 30, width: 20, height: 15, weight: 5 }
    }
  },
  
  ORIENTATIONS: [
    { name: '平放（正常）', desc: '长沿托盘长，宽沿托盘宽' },
    { name: '平放（旋转）', desc: '长沿托盘长，高沿托盘宽' },
    { name: '侧放（正常）', desc: '宽沿托盘长，长沿托盘宽' },
    { name: '侧放（旋转）', desc: '宽沿托盘长，高沿托盘宽' },
    { name: '竖放（正常）', desc: '高沿托盘长，长沿托盘宽' },
    { name: '竖放（旋转）', desc: '高沿托盘长，宽沿托盘宽' }
  ],
  
  COLORS: {
    PRIMARY: '#1B3A4B',
    ACCENT: '#E8A838',
    ACCENT_DARK: '#D4880F',
    PALLET_BOTTOM: '#8B7355',
    BACKGROUND: '#f8fafc'
  }
};

let currentUnit = 'inch-lbs';
let currentCalcMode = 'independent';
let currentPackingMode = 'auto';
let skuCounter = 0;
let currentIndependentResults = [];
let currentPallet = null;
let selectedSkuIndex = 0;

// ==================== 工具函数模块 ====================
function convertToMetric(value, type) {
  if (currentUnit === 'cm-kg') {
    return value;
  }
  
  if (type === 'length') {
    return value * CONFIG.UNITS.INCH_TO_CM;
  } else if (type === 'weight') {
    return value * CONFIG.UNITS.LBS_TO_KG;
  }
  
  return value;
}

function formatWeight(weightInKg) {
  if (currentUnit === 'cm-kg') {
    return weightInKg.toFixed(1);
  } else {
    return (weightInKg / CONFIG.UNITS.LBS_TO_KG).toFixed(1);
  }
}

function getLengthUnit() {
  return currentUnit === 'cm-kg' ? 'cm' : 'inch';
}

function getWeightUnit() {
  return currentUnit === 'cm-kg' ? 'kg' : 'lbs';
}

// ==================== 计算模块 ====================
class MaxRectsBinPack {
  constructor(binWidth, binHeight) {
    this.binWidth = binWidth;
    this.binHeight = binHeight;
    this.freeRects = [{ x: 0, y: 0, w: binWidth, h: binHeight }];
    this.usedRects = [];
  }

  insert(width, height, heuristic) {
    if (heuristic === undefined) heuristic = 'BSSF';
    let bestNode = null;
    let bestShortSideFit = Infinity;
    let bestLongSideFit = Infinity;

    for (let i = 0; i < this.freeRects.length; i++) {
      const rect = this.freeRects[i];
      if (rect.w >= width && rect.h >= height) {
        const leftoverHoriz = Math.abs(rect.w - width);
        const leftoverVert = Math.abs(rect.h - height);
        const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
        const longSideFit = Math.max(leftoverHoriz, leftoverVert);

        if (heuristic === 'BSSF') {
          if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
            bestNode = { x: rect.x, y: rect.y, w: width, h: height };
            bestShortSideFit = shortSideFit;
            bestLongSideFit = longSideFit;
          }
        } else if (heuristic === 'BLSF') {
          if (longSideFit < bestLongSideFit || (longSideFit === bestLongSideFit && shortSideFit < bestShortSideFit)) {
            bestNode = { x: rect.x, y: rect.y, w: width, h: height };
            bestShortSideFit = shortSideFit;
            bestLongSideFit = longSideFit;
          }
        } else if (heuristic === 'BAF') {
          const areaFit = rect.w * rect.h - width * height;
          if (areaFit < bestShortSideFit || (areaFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
            bestNode = { x: rect.x, y: rect.y, w: width, h: height };
            bestShortSideFit = areaFit;
            bestLongSideFit = longSideFit;
          }
        }
      }
    }

    if (!bestNode) return null;

    this._placeRect(bestNode);
    return bestNode;
  }

  insertWithRotation(width, height, heuristic) {
    if (heuristic === undefined) heuristic = 'BSSF';
    let bestNode = null;
    let bestRotated = false;
    let bestShortSideFit = Infinity;
    let bestLongSideFit = Infinity;

    for (let i = 0; i < this.freeRects.length; i++) {
      const rect = this.freeRects[i];

      if (rect.w >= width && rect.h >= height) {
        const leftoverHoriz = Math.abs(rect.w - width);
        const leftoverVert = Math.abs(rect.h - height);
        const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
        const longSideFit = Math.max(leftoverHoriz, leftoverVert);

        if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
          bestNode = { x: rect.x, y: rect.y, w: width, h: height };
          bestRotated = false;
          bestShortSideFit = shortSideFit;
          bestLongSideFit = longSideFit;
        }
      }

      if (rect.w >= height && rect.h >= width) {
        const leftoverHoriz = Math.abs(rect.w - height);
        const leftoverVert = Math.abs(rect.h - width);
        const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
        const longSideFit = Math.max(leftoverHoriz, leftoverVert);

        if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
          bestNode = { x: rect.x, y: rect.y, w: height, h: width };
          bestRotated = true;
          bestShortSideFit = shortSideFit;
          bestLongSideFit = longSideFit;
        }
      }
    }

    if (!bestNode) return { placed: null, rotated: false };

    this._placeRect(bestNode);
    return { placed: bestNode, rotated: bestRotated };
  }

  _placeRect(node) {
    const numFree = this.freeRects.length;
    const newFreeRects = [];

    for (let i = 0; i < numFree; i++) {
      const free = this.freeRects[i];
      if (!this._intersects(free, node)) {
        newFreeRects.push(free);
        continue;
      }
      const splits = this._splitFreeRect(free, node);
      for (let j = 0; j < splits.length; j++) {
        newFreeRects.push(splits[j]);
      }
    }

    this.freeRects = this._pruneFreeRects(newFreeRects);
    this.usedRects.push(node);
  }

  _splitFreeRect(freeRect, placedRect) {
    const results = [];

    if (placedRect.x > freeRect.x && placedRect.x < freeRect.x + freeRect.w) {
      results.push({
        x: freeRect.x,
        y: freeRect.y,
        w: placedRect.x - freeRect.x,
        h: freeRect.h
      });
    }
    if (placedRect.x + placedRect.w < freeRect.x + freeRect.w) {
      results.push({
        x: placedRect.x + placedRect.w,
        y: freeRect.y,
        w: freeRect.x + freeRect.w - placedRect.x - placedRect.w,
        h: freeRect.h
      });
    }
    if (placedRect.y > freeRect.y && placedRect.y < freeRect.y + freeRect.h) {
      results.push({
        x: freeRect.x,
        y: freeRect.y,
        w: freeRect.w,
        h: placedRect.y - freeRect.y
      });
    }
    if (placedRect.y + placedRect.h < freeRect.y + freeRect.h) {
      results.push({
        x: freeRect.x,
        y: placedRect.y + placedRect.h,
        w: freeRect.w,
        h: freeRect.y + freeRect.h - placedRect.y - placedRect.h
      });
    }

    return results;
  }

  _pruneFreeRects(rects) {
    const filtered = rects.filter(r => r.w > 0 && r.h > 0);
    const result = [];

    for (let i = 0; i < filtered.length; i++) {
      let dominated = false;
      for (let j = 0; j < filtered.length; j++) {
        if (i === j) continue;
        if (this._contains(filtered[j], filtered[i])) {
          dominated = true;
          break;
        }
      }
      if (!dominated) {
        result.push(filtered[i]);
      }
    }

    return result;
  }

  _intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  _contains(outer, inner) {
    return outer.x <= inner.x && outer.y <= inner.y &&
           outer.x + outer.w >= inner.x + inner.w &&
           outer.y + outer.h >= inner.y + inner.h;
  }

  occupancy() {
    let usedArea = 0;
    for (let i = 0; i < this.usedRects.length; i++) {
      usedArea += this.usedRects[i].w * this.usedRects[i].h;
    }
    return usedArea / (this.binWidth * this.binHeight);
  }
}

function packLayerMaxRects(binWidth, binHeight, validOrientations, skuWeight, maxWeight) {
  const packer = new MaxRectsBinPack(binWidth, binHeight);
  const placements = [];
  let totalWeight = 0;
  const maxIterations = 2000;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    let bestNode = null;
    let bestRotated = false;
    let bestOrientation = null;
    let bestShortSideFit = Infinity;
    let bestLongSideFit = Infinity;

    for (let i = 0; i < packer.freeRects.length; i++) {
      const rect = packer.freeRects[i];

      for (const ori of validOrientations) {
        if (ori.l <= rect.w && ori.w <= rect.h) {
          const leftoverHoriz = rect.w - ori.l;
          const leftoverVert = rect.h - ori.w;
          const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
          const longSideFit = Math.max(leftoverHoriz, leftoverVert);

          if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
            bestNode = { x: rect.x, y: rect.y, w: ori.l, h: ori.w };
            bestRotated = false;
            bestOrientation = ori;
            bestShortSideFit = shortSideFit;
            bestLongSideFit = longSideFit;
          }
        }

        if (ori.w <= rect.w && ori.l <= rect.h) {
          const leftoverHoriz = rect.w - ori.w;
          const leftoverVert = rect.h - ori.l;
          const shortSideFit = Math.min(leftoverHoriz, leftoverVert);
          const longSideFit = Math.max(leftoverHoriz, leftoverVert);

          if (shortSideFit < bestShortSideFit || (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
            bestNode = { x: rect.x, y: rect.y, w: ori.w, h: ori.l };
            bestRotated = true;
            bestOrientation = ori;
            bestShortSideFit = shortSideFit;
            bestLongSideFit = longSideFit;
          }
        }
      }
    }

    if (!bestNode) break;

    if (skuWeight > 0 && totalWeight + skuWeight > maxWeight) break;

    packer._placeRect(bestNode);

    const placement = {
      x: bestNode.x,
      y: bestNode.y,
      l: bestNode.w,
      w: bestNode.h,
      h: bestOrientation.h,
      orientation: bestOrientation
    };
    if (bestRotated) {
      placement.rotated = true;
    }

    placements.push(placement);
    totalWeight += skuWeight;
  }

  return {
    placements,
    count: placements.length,
    weight: totalWeight
  };
}

function calculateForOrientation(pallet, sku, skuWeight) {
  const countL = Math.floor(pallet.length / sku.l);
  const countW = Math.floor(pallet.width / sku.w);
  const countH = Math.floor(pallet.height / sku.h);
  
  const maxBySize = countL * countW * countH;
  const maxByWeight = skuWeight > 0 ? Math.floor(pallet.weight / skuWeight) : Infinity;
  const quantity = Math.min(maxBySize, maxByWeight);
  
  return {
    quantity,
    countL,
    countW,
    countH,
    maxBySize,
    maxByWeight,
    limitByWeight: maxByWeight < maxBySize
  };
}

function getOrientations(sku) {
  return [
    { l: sku.length, w: sku.width, h: sku.height, ...CONFIG.ORIENTATIONS[0] },
    { l: sku.length, w: sku.height, h: sku.width, ...CONFIG.ORIENTATIONS[1] },
    { l: sku.width, w: sku.length, h: sku.height, ...CONFIG.ORIENTATIONS[2] },
    { l: sku.width, w: sku.height, h: sku.length, ...CONFIG.ORIENTATIONS[3] },
    { l: sku.height, w: sku.length, h: sku.width, ...CONFIG.ORIENTATIONS[4] },
    { l: sku.height, w: sku.width, h: sku.length, ...CONFIG.ORIENTATIONS[5] }
  ];
}

function calculateBestOrientation(pallet, sku) {
  const orientations = getOrientations(sku);
  let bestResult = null;
  let maxQuantity = -1;
  
  orientations.forEach(orientation => {
    const result = calculateForOrientation(pallet, orientation, sku.weight);
    if (result.quantity > maxQuantity) {
      maxQuantity = result.quantity;
      bestResult = {
        ...result,
        orientation: orientation.name,
        desc: orientation.desc,
        skuL: orientation.l,
        skuW: orientation.w,
        skuH: orientation.h
      };
    }
  });
  
  if (!bestResult) {
    const fallback = orientations[0];
    const result = calculateForOrientation(pallet, fallback, sku.weight);
    bestResult = {
      ...result,
      orientation: fallback.name,
      desc: fallback.desc,
      skuL: fallback.l,
      skuW: fallback.w,
      skuH: fallback.h
    };
  }
  
  return bestResult;
}

function calculateAllSkus(pallet, skus) {
  const results = [];
  
  skus.forEach(sku => {
    const bestResult = calculateBestOrientation(pallet, sku);
    results.push({
      sku,
      result: bestResult
    });
  });
  
  return results;
}

function calculateCombinedLoading(pallet, skus) {
  const skuOrientations = skus.map(sku => {
    const orientations = getOrientations(sku);
    return {
      sku,
      orientations: orientations.map(ori => {
        const countL = Math.floor(pallet.length / ori.l);
        const countW = Math.floor(pallet.width / ori.w);
        return {
          ...ori,
          perLayer: countL * countW,
          countL,
          countW,
          layerHeight: ori.h
        };
      }).sort((a, b) => b.perLayer - a.perLayer)
    };
  });
  
  let remainingHeight = pallet.height;
  let remainingWeight = pallet.weight;
  const layers = [];
  const skuCounts = {};
  skus.forEach(sku => { skuCounts[sku.id] = 0; });
  
  while (remainingHeight > 0) {
    let bestLayer = null;
    let bestLayerScore = -1;
    
    for (const item of skuOrientations) {
      for (const ori of item.orientations) {
        if (ori.layerHeight > remainingHeight) continue;
        
        const maxByWeight = item.sku.weight > 0
          ? Math.floor(remainingWeight / item.sku.weight)
          : ori.perLayer;
        const count = Math.min(ori.perLayer, maxByWeight);
        
        if (count <= 0) continue;
        
        const volumeUsed = count * ori.l * ori.w * ori.h;
        const score = volumeUsed;
        
        if (score > bestLayerScore) {
          bestLayerScore = score;
          bestLayer = {
            sku: item.sku,
            orientation: ori,
            count,
            height: ori.layerHeight
          };
        }
      }
    }
    
    if (!bestLayer) break;
    
    layers.push(bestLayer);
    remainingHeight -= bestLayer.height;
    remainingWeight -= bestLayer.count * bestLayer.sku.weight;
    skuCounts[bestLayer.sku.id] += bestLayer.count;
  }
  
  const totalItems = Object.values(skuCounts).reduce((sum, c) => sum + c, 0);
  const usedHeight = layers.reduce((sum, l) => sum + l.height, 0);
  const volumeTotal = pallet.length * pallet.width * pallet.height;
  let volumeUsed = 0;
  layers.forEach(l => {
    volumeUsed += l.count * l.orientation.l * l.orientation.w * l.orientation.h;
  });
  
  return {
    layers,
    skuCounts,
    totalItems,
    usedHeight,
    spaceUtilization: (volumeUsed / volumeTotal * 100).toFixed(1),
    weightUtilization: ((pallet.weight - remainingWeight) / pallet.weight * 100).toFixed(1),
    limitByWeight: remainingWeight <= 0 && layers.length > 0
  };
}

function calculateLayerMixedPacking(pallet, sku) {
  const orientations = getOrientations(sku);

  function packLayer(layerHeight, maxWeight) {
    const validOrientations = orientations.filter(ori => ori.h <= layerHeight);
    if (validOrientations.length === 0) return { placements: [], count: 0, weight: 0 };

    return packLayerMaxRects(pallet.length, pallet.width, validOrientations, sku.weight, maxWeight);
  }

  let remainingHeight = pallet.height;
  let remainingWeight = pallet.weight;
  const allLayers = [];
  let totalItems = 0;
  
  while (remainingHeight > 0) {
    let bestLayerResult = null;
    let bestLayerHeight = 0;
    let bestEfficiency = 0;
    
    const uniqueHeights = [...new Set(orientations.map(o => o.h))].sort((a, b) => a - b);
    
    for (const layerH of uniqueHeights) {
      if (layerH > remainingHeight) continue;
      
      const layerResult = packLayer(layerH, remainingWeight);
      
      if (layerResult.count > 0) {
        const efficiency = layerResult.count / layerH;
        
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestLayerResult = layerResult;
          bestLayerHeight = layerH;
        }
      }
    }
    
    if (!bestLayerResult || bestLayerResult.count === 0) break;
    
    allLayers.push({
      height: bestLayerHeight,
      placements: bestLayerResult.placements,
      count: bestLayerResult.count
    });
    
    totalItems += bestLayerResult.count;
    remainingHeight -= bestLayerHeight;
    remainingWeight -= bestLayerResult.weight;
  }
  
  const usedHeight = allLayers.reduce((sum, l) => sum + l.height, 0);
  const volumeTotal = pallet.length * pallet.width * pallet.height;
  let volumeUsed = 0;
  allLayers.forEach(layer => {
    layer.placements.forEach(p => {
      volumeUsed += p.l * p.w * p.h;
    });
  });
  
  return {
    type: 'layerMixed',
    layers: allLayers,
    totalItems,
    usedHeight,
    spaceUtilization: (volumeUsed / volumeTotal * 100).toFixed(1),
    weightUtilization: ((pallet.weight - remainingWeight) / pallet.weight * 100).toFixed(1),
    limitByWeight: remainingWeight <= 0 && allLayers.length > 0
  };
}

function calculateBetweenLayerMixed(pallet, sku) {
  const orientations = getOrientations(sku);
  
  const layerOptions = orientations.map(ori => {
    const countL = Math.floor(pallet.length / ori.l);
    const countW = Math.floor(pallet.width / ori.w);
    return {
      orientation: ori,
      perLayer: countL * countW,
      countL,
      countW,
      layerHeight: ori.h,
      volumePerItem: ori.l * ori.w * ori.h
    };
  }).filter(opt => opt.perLayer > 0);
  
  if (layerOptions.length === 0) {
    return {
      type: 'betweenLayerMixed',
      layers: [],
      totalItems: 0,
      usedHeight: 0,
      spaceUtilization: '0.0',
      weightUtilization: '0.0',
      limitByWeight: false
    };
  }
  
  let remainingHeight = pallet.height;
  let remainingWeight = pallet.weight;
  const layers = [];
  let totalItems = 0;
  
  while (remainingHeight > 0) {
    let bestOption = null;
    let bestScore = -1;
    
    for (const opt of layerOptions) {
      if (opt.layerHeight > remainingHeight) continue;
      
      const maxByWeight = sku.weight > 0 
        ? Math.floor(remainingWeight / sku.weight) 
        : Infinity;
      const possibleCount = Math.min(opt.perLayer, maxByWeight);
      
      if (possibleCount <= 0) continue;
      
      const efficiency = possibleCount / opt.layerHeight;
      const score = efficiency * 1000 + opt.volumePerItem;
      
      if (score > bestScore) {
        bestScore = score;
        bestOption = {
          ...opt,
          count: possibleCount
        };
      }
    }
    
    if (!bestOption) break;
    
    layers.push({
      orientation: bestOption.orientation,
      count: bestOption.count,
      height: bestOption.layerHeight,
      countL: bestOption.countL,
      countW: bestOption.countW
    });
    
    totalItems += bestOption.count;
    remainingHeight -= bestOption.layerHeight;
    remainingWeight -= bestOption.count * sku.weight;
  }
  
  const usedHeight = layers.reduce((sum, l) => sum + l.height, 0);
  const volumeTotal = pallet.length * pallet.width * pallet.height;
  let volumeUsed = 0;
  layers.forEach(l => {
    volumeUsed += l.count * l.orientation.l * l.orientation.w * l.orientation.h;
  });
  
  return {
    type: 'betweenLayerMixed',
    layers,
    totalItems,
    usedHeight,
    spaceUtilization: (volumeUsed / volumeTotal * 100).toFixed(1),
    weightUtilization: ((pallet.weight - remainingWeight) / pallet.weight * 100).toFixed(1),
    limitByWeight: remainingWeight <= 0 && layers.length > 0
  };
}

function calculateFullMixedPacking(pallet, sku) {
  const orientations = getOrientations(sku);

  function packLayerWithMixedOrientations(layerHeight, maxWeight) {
    const validOrientations = orientations.filter(ori => ori.h <= layerHeight);
    if (validOrientations.length === 0) return { placements: [], count: 0, weight: 0 };

    return packLayerMaxRects(pallet.length, pallet.width, validOrientations, sku.weight, maxWeight);
  }

  let remainingHeight = pallet.height;
  let remainingWeight = pallet.weight;
  const allLayers = [];
  let totalItems = 0;
  
  const uniqueHeights = [...new Set(orientations.map(o => o.h))].sort((a, b) => a - b);
  
  while (remainingHeight > 0) {
    let bestLayerResult = null;
    let bestLayerHeight = 0;
    let bestEfficiency = 0;
    
    for (const layerH of uniqueHeights) {
      if (layerH > remainingHeight) continue;
      
      const layerResult = packLayerWithMixedOrientations(layerH, remainingWeight);
      
      if (layerResult.count > 0) {
        const efficiency = layerResult.count / layerH;
        
        if (efficiency > bestEfficiency) {
          bestEfficiency = efficiency;
          bestLayerResult = layerResult;
          bestLayerHeight = layerH;
        }
      }
    }
    
    if (!bestLayerResult || bestLayerResult.count === 0) break;
    
    allLayers.push({
      height: bestLayerHeight,
      placements: bestLayerResult.placements,
      count: bestLayerResult.count
    });
    
    totalItems += bestLayerResult.count;
    remainingHeight -= bestLayerHeight;
    remainingWeight -= bestLayerResult.weight;
  }
  
  const usedHeight = allLayers.reduce((sum, l) => sum + l.height, 0);
  const volumeTotal = pallet.length * pallet.width * pallet.height;
  let volumeUsed = 0;
  allLayers.forEach(layer => {
    layer.placements.forEach(p => {
      volumeUsed += p.l * p.w * p.h;
    });
  });
  
  return {
    type: 'fullMixed',
    layers: allLayers,
    totalItems,
    usedHeight,
    spaceUtilization: (volumeUsed / volumeTotal * 100).toFixed(1),
    weightUtilization: ((pallet.weight - remainingWeight) / pallet.weight * 100).toFixed(1),
    limitByWeight: remainingWeight <= 0 && allLayers.length > 0
  };
}

// ==================== SKU管理模块 ====================
function addSkuInput(name = '', length = '', width = '', height = '', weight = '') {
  skuCounter++;
  const skuId = `sku-${skuCounter}`;
  const lengthUnit = getLengthUnit();
  const weightUnit = getWeightUnit();
  
  const defaultValues = CONFIG.DEFAULT_VALUES[currentUnit].sku;
  
  const html = `
    <div class="sku-item" id="${skuId}">
      <div class="sku-item-header">
        <div class="sku-item-title">SKU #${skuCounter}</div>
        <button class="btn-remove-sku" onclick="removeSkuInput('${skuId}')">
          <i class="fas fa-trash"></i> 删除
        </button>
      </div>
      <input type="text" 
             class="sku-name-input" 
             id="${skuId}-name" 
             placeholder="SKU名称（可选）" 
             value="${name}">
      <div class="input-group">
        <div class="input-item input-with-unit">
          <label>长度</label>
          <input type="number" 
                 id="${skuId}-length" 
                 placeholder="${length || defaultValues.length}" 
                 step="0.1" 
                 min="0"
                 value="${length}">
          <span class="unit">${lengthUnit}</span>
        </div>
        <div class="input-item input-with-unit">
          <label>宽度</label>
          <input type="number" 
                 id="${skuId}-width" 
                 placeholder="${width || defaultValues.width}" 
                 step="0.1" 
                 min="0"
                 value="${width}">
          <span class="unit">${lengthUnit}</span>
        </div>
        <div class="input-item input-with-unit">
          <label>高度</label>
          <input type="number" 
                 id="${skuId}-height" 
                 placeholder="${height || defaultValues.height}" 
                 step="0.1" 
                 min="0"
                 value="${height}">
          <span class="unit">${lengthUnit}</span>
        </div>
        <div class="input-item input-with-unit">
          <label>重量</label>
          <input type="number" 
                 id="${skuId}-weight" 
                 placeholder="${weight || defaultValues.weight}" 
                 step="0.1" 
                 min="0"
                 value="${weight}">
          <span class="unit">${weightUnit}</span>
        </div>
        <div class="input-item input-with-unit">
          <label>件数</label>
          <input type="number" 
                 id="${skuId}-quantity" 
                 placeholder="可选" 
                 step="1" 
                 min="0"
                 value="">
          <span class="unit">件</span>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('skuList').insertAdjacentHTML('beforeend', html);
}

function removeSkuInput(skuId) {
  const skuItem = document.getElementById(skuId);
  if (skuItem) {
    skuItem.remove();
  }
}

function getAllSkus() {
  const skuItems = document.querySelectorAll('.sku-item');
  const skus = [];
  
  skuItems.forEach(item => {
    const skuId = item.id;
    const name = document.getElementById(`${skuId}-name`).value || `SKU #${skuId.split('-')[1]}`;
    const length = convertToMetric(parseFloat(document.getElementById(`${skuId}-length`).value) || 0, 'length');
    const width = convertToMetric(parseFloat(document.getElementById(`${skuId}-width`).value) || 0, 'length');
    const height = convertToMetric(parseFloat(document.getElementById(`${skuId}-height`).value) || 0, 'length');
    const weight = convertToMetric(parseFloat(document.getElementById(`${skuId}-weight`).value) || 0, 'weight');
    const quantity = parseInt(document.getElementById(`${skuId}-quantity`).value) || 0;
    
    if (length > 0 && width > 0 && height > 0) {
      skus.push({
        id: skuId,
        name,
        length,
        width,
        height,
        weight,
        quantity
      });
    }
  });
  
  return skus;
}

// ==================== 3D可视化模块 ====================
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let palletGroup = null;
let skuGroup = null;
let animationId = null;
let needsRender = true;

function init3DScene() {
  const canvas = document.getElementById('canvas3d');
  if (!canvas) {
    console.error('Canvas element not found');
    return false;
  }
  
  if (!window.THREE || !window.OrbitControls) {
    console.warn('Three.js not loaded yet, 3D visualization unavailable');
    return false;
  }
  
  const THREE = window.THREE;
  const OrbitControls = window.OrbitControls;
  
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth || 800;
  const containerHeight = 500;
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);
  
  camera = new THREE.PerspectiveCamera(
    45,
    containerWidth / containerHeight,
    0.1,
    10000
  );
  camera.position.set(200, 200, 200);
  
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(containerWidth, containerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 50;
  controls.maxDistance = 1000;
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 200, 100);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  palletGroup = new THREE.Group();
  skuGroup = new THREE.Group();
  scene.add(palletGroup);
  scene.add(skuGroup);
  
  const gridHelper = new THREE.GridHelper(300, 30, 0xcccccc, 0xe5e5e5);
  gridHelper.position.y = -1;
  scene.add(gridHelper);
  
  startAnimation();
  
  return true;
}

function startAnimation() {
  function animate() {
    animationId = requestAnimationFrame(animate);
    if (controls) {
      controls.update();
    }
    if (needsRender && renderer && scene && camera) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  }
  animate();
  
  if (controls) {
    controls.addEventListener('change', () => { needsRender = true; });
  }
}

function prepareScene() {
  if (!scene) {
    const success = init3DScene();
    if (!success) return false;
  }
  
  const canvas = document.getElementById('canvas3d');
  const container = canvas ? canvas.parentElement : null;
  if (container && container.clientWidth > 0 && renderer) {
    renderer.setSize(container.clientWidth, 500);
    camera.aspect = container.clientWidth / 500;
    camera.updateProjectionMatrix();
  }
  
  clearScene();
  return true;
}

function drawVisualization(result, pallet, sku) {
  if (!prepareScene()) return;
  
  const scale = 1;
  
  createPallet(pallet, scale);
  createSkuBoxes(result, scale);
  adjustCamera(pallet);
  needsRender = true;
}

function clearScene() {
  [palletGroup, skuGroup].forEach(group => {
    if (!group) return;
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      group.remove(child);
    }
  });
}

function createPallet(pallet, scale) {
  const THREE = window.THREE;
  
  const palletGeometry = new THREE.BoxGeometry(
    pallet.length * scale,
    pallet.height * scale,
    pallet.width * scale
  );
  const edges = new THREE.EdgesGeometry(palletGeometry);
  const palletMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.COLORS.PRIMARY,
    linewidth: 2
  });
  const palletWireframe = new THREE.LineSegments(edges, palletMaterial);
  palletWireframe.position.y = pallet.height * scale / 2;
  palletGroup.add(palletWireframe);
  
  const bottomGeometry = new THREE.BoxGeometry(
    pallet.length * scale,
    2,
    pallet.width * scale
  );
  const bottomMaterial = new THREE.MeshLambertMaterial({
    color: CONFIG.COLORS.PALLET_BOTTOM,
    transparent: true,
    opacity: 0.8
  });
  const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
  bottom.position.y = 1;
  bottom.receiveShadow = true;
  palletGroup.add(bottom);
}

function createSkuBoxes(result, scale) {
  const THREE = window.THREE;
  
  const skuL = result.skuL * scale;
  const skuW = result.skuW * scale;
  const skuH = result.skuH * scale;
  
  const skuGeometry = new THREE.BoxGeometry(skuL, skuH, skuW);
  const skuMaterial = new THREE.MeshLambertMaterial({
    color: CONFIG.COLORS.ACCENT,
    transparent: true,
    opacity: 0.7
  });
  
  const skuEdgesGeometry = new THREE.EdgesGeometry(skuGeometry);
  const skuEdgesMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.COLORS.ACCENT_DARK
  });
  
  let count = 0;
  for (let layer = 0; layer < result.countH; layer++) {
    for (let i = 0; i < result.countL; i++) {
      for (let j = 0; j < result.countW; j++) {
        if (count >= result.quantity) break;
        
        const skuMesh = new THREE.Mesh(skuGeometry, skuMaterial);
        skuMesh.position.x = (i - (result.countL - 1) / 2) * skuL;
        skuMesh.position.y = layer * skuH + skuH / 2 + 2;
        skuMesh.position.z = (j - (result.countW - 1) / 2) * skuW;
        skuMesh.castShadow = true;
        skuMesh.receiveShadow = true;
        skuGroup.add(skuMesh);
        
        const skuWireframe = new THREE.LineSegments(skuEdgesGeometry, skuEdgesMaterial);
        skuWireframe.position.copy(skuMesh.position);
        skuGroup.add(skuWireframe);
        
        count++;
      }
    }
  }
}

function adjustCamera(pallet) {
  const maxDim = Math.max(pallet.length, pallet.width, pallet.height);
  camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5);
  controls.target.set(0, pallet.height / 2, 0);
  controls.update();
}

function drawMixedVisualization(result, pallet, sku) {
  if (!prepareScene()) return;
  
  const THREE = window.THREE;
  if (!THREE) return;
  
  const scale = 1;
  createPallet(pallet, scale);
  
  const skuMaterial = new THREE.MeshLambertMaterial({
    color: CONFIG.COLORS.ACCENT,
    transparent: true,
    opacity: 0.7
  });
  
  const skuEdgesMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.COLORS.ACCENT_DARK
  });
  
  let currentY = 2;
  
  result.layers.forEach((layer, layerIndex) => {
    if (layer.placements && layer.placements.length > 0) {
      layer.placements.forEach((placement) => {
        const skuL = placement.l * scale;
        const skuW = placement.w * scale;
        const skuH = placement.h * scale;
        
        const skuGeometry = new THREE.BoxGeometry(skuL, skuH, skuW);
        const skuMesh = new THREE.Mesh(skuGeometry, skuMaterial);
        
        skuMesh.position.x = (placement.x + placement.l / 2 - pallet.length / 2) * scale;
        skuMesh.position.y = currentY + placement.h / 2 * scale;
        skuMesh.position.z = (placement.y + placement.w / 2 - pallet.width / 2) * scale;
        
        skuMesh.castShadow = true;
        skuMesh.receiveShadow = true;
        skuGroup.add(skuMesh);
        
        const skuEdges = new THREE.EdgesGeometry(skuGeometry);
        const skuWireframe = new THREE.LineSegments(skuEdges, skuEdgesMaterial);
        skuWireframe.position.copy(skuMesh.position);
        skuGroup.add(skuWireframe);
      });
      
      currentY += layer.height * scale;
    } else if (layer.orientation) {
      const ori = layer.orientation;
      const skuL = ori.l * scale;
      const skuW = ori.w * scale;
      const skuH = ori.h * scale;
      
      const skuGeometry = new THREE.BoxGeometry(skuL, skuH, skuW);
      
      let count = 0;
      for (let i = 0; i < layer.countL && count < layer.count; i++) {
        for (let j = 0; j < layer.countW && count < layer.count; j++) {
          const skuMesh = new THREE.Mesh(skuGeometry, skuMaterial);
          skuMesh.position.x = (i - (layer.countL - 1) / 2) * skuL;
          skuMesh.position.y = currentY + skuH / 2;
          skuMesh.position.z = (j - (layer.countW - 1) / 2) * skuW;
          skuMesh.castShadow = true;
          skuMesh.receiveShadow = true;
          skuGroup.add(skuMesh);
          
          const skuEdges = new THREE.EdgesGeometry(skuGeometry);
          const skuWireframe = new THREE.LineSegments(skuEdges, skuEdgesMaterial);
          skuWireframe.position.copy(skuMesh.position);
          skuGroup.add(skuWireframe);
          
          count++;
        }
      }
      
      currentY += layer.height * scale;
    }
  });
  
  adjustCamera(pallet);
  needsRender = true;
}

const SKU_COLORS = [
  { fill: 0xE8A838, edge: 0xD4880F },
  { fill: 0x36CFC9, edge: 0x13A8A8 },
  { fill: 0x597EF7, edge: 0x2F54EB },
  { fill: 0xFF7A45, edge: 0xD4380D },
  { fill: 0x73D13D, edge: 0x389E0D },
  { fill: 0xF759AB, edge: 0xEB2F96 }
];

function drawCombinedVisualization(combinedResult, pallet, skus) {
  if (!prepareScene()) return;
  
  const THREE = window.THREE;
  if (!THREE) return;
  
  const scale = 1;
  createPallet(pallet, scale);
  
  const skuColorMap = {};
  skus.forEach((sku, i) => {
    skuColorMap[sku.id] = SKU_COLORS[i % SKU_COLORS.length];
  });
  
  let currentY = 2;
  
  combinedResult.layers.forEach(layer => {
    const ori = layer.orientation;
    const skuL = ori.l * scale;
    const skuW = ori.w * scale;
    const skuH = ori.h * scale;
    const colors = skuColorMap[layer.sku.id] || SKU_COLORS[0];
    
    const skuGeometry = new THREE.BoxGeometry(skuL, skuH, skuW);
    const skuMaterial = new THREE.MeshLambertMaterial({
      color: colors.fill,
      transparent: true,
      opacity: 0.7
    });
    const skuEdgesMaterial = new THREE.LineBasicMaterial({
      color: colors.edge
    });
    
    let count = 0;
    for (let i = 0; i < ori.countL; i++) {
      for (let j = 0; j < ori.countW; j++) {
        if (count >= layer.count) break;
        
        const skuMesh = new THREE.Mesh(skuGeometry, skuMaterial);
        skuMesh.position.x = (i - (ori.countL - 1) / 2) * skuL;
        skuMesh.position.y = currentY + skuH / 2;
        skuMesh.position.z = (j - (ori.countW - 1) / 2) * skuW;
        skuMesh.castShadow = true;
        skuMesh.receiveShadow = true;
        skuGroup.add(skuMesh);
        
        const skuEdges = new THREE.EdgesGeometry(skuGeometry);
        const skuWireframe = new THREE.LineSegments(skuEdges, skuEdgesMaterial);
        skuWireframe.position.copy(skuMesh.position);
        skuGroup.add(skuWireframe);
        
        count++;
      }
    }
    
    currentY += skuH;
  });
  
  adjustCamera(pallet);
  needsRender = true;
}

function setView(viewType, btnEl) {
  if (!camera || !controls) return;
  
  const buttons = document.querySelectorAll('.view-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  
  const maxDim = currentPallet 
    ? Math.max(currentPallet.length, currentPallet.width, currentPallet.height) 
    : 200;
  
  switch(viewType) {
    case 'top':
      camera.position.set(0, maxDim * 2, 0.01);
      break;
    case 'front':
      camera.position.set(0, maxDim * 0.5, maxDim * 2);
      break;
    case 'side':
      camera.position.set(maxDim * 2, maxDim * 0.5, 0);
      break;
    case 'perspective':
    default:
      camera.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5);
      break;
  }
  
  controls.update();
}

// ==================== UI交互模块 ====================
function convertValue(value, type, fromUnit, toUnit) {
  if (fromUnit === toUnit || !value || isNaN(value)) return value;
  
  const fromMetric = fromUnit === 'cm-kg';
  const toMetric = toUnit === 'cm-kg';
  
  if (type === 'length') {
    if (!fromMetric && toMetric) return +(value * CONFIG.UNITS.INCH_TO_CM).toFixed(2);
    if (fromMetric && !toMetric) return +(value / CONFIG.UNITS.INCH_TO_CM).toFixed(2);
  } else if (type === 'weight') {
    if (!fromMetric && toMetric) return +(value * CONFIG.UNITS.LBS_TO_KG).toFixed(2);
    if (fromMetric && !toMetric) return +(value / CONFIG.UNITS.LBS_TO_KG).toFixed(2);
  }
  
  return value;
}

function switchUnit(unit) {
  const oldUnit = currentUnit;
  if (oldUnit === unit) return;
  currentUnit = unit;
  
  document.getElementById('btn-cm-kg').classList.toggle('active', unit === 'cm-kg');
  document.getElementById('btn-inch-lbs').classList.toggle('active', unit === 'inch-lbs');
  
  const lengthUnit = getLengthUnit();
  const weightUnit = getWeightUnit();
  
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`unit-length-${i}`);
    if (el) el.textContent = lengthUnit;
  }
  
  for (let i = 1; i <= 1; i++) {
    const el = document.getElementById(`unit-weight-${i}`);
    if (el) el.textContent = weightUnit;
  }
  
  const palletLengthEl = document.getElementById('palletLength');
  const palletWidthEl = document.getElementById('palletWidth');
  const palletHeightEl = document.getElementById('palletHeight');
  const palletWeightEl = document.getElementById('palletWeight');
  
  if (palletLengthEl.value) palletLengthEl.value = convertValue(parseFloat(palletLengthEl.value), 'length', oldUnit, unit);
  if (palletWidthEl.value) palletWidthEl.value = convertValue(parseFloat(palletWidthEl.value), 'length', oldUnit, unit);
  if (palletHeightEl.value) palletHeightEl.value = convertValue(parseFloat(palletHeightEl.value), 'length', oldUnit, unit);
  if (palletWeightEl.value) palletWeightEl.value = convertValue(parseFloat(palletWeightEl.value), 'weight', oldUnit, unit);
  
  const defaultValues = CONFIG.DEFAULT_VALUES[unit].pallet;
  palletLengthEl.placeholder = defaultValues.length;
  palletWidthEl.placeholder = defaultValues.width;
  palletHeightEl.placeholder = defaultValues.height;
  palletWeightEl.placeholder = defaultValues.weight;
  
  document.querySelectorAll('.sku-item').forEach(item => {
    const skuId = item.id;
    const lengthEl = document.getElementById(`${skuId}-length`);
    const widthEl = document.getElementById(`${skuId}-width`);
    const heightEl = document.getElementById(`${skuId}-height`);
    const weightEl = document.getElementById(`${skuId}-weight`);
    
    if (lengthEl && lengthEl.value) lengthEl.value = convertValue(parseFloat(lengthEl.value), 'length', oldUnit, unit);
    if (widthEl && widthEl.value) widthEl.value = convertValue(parseFloat(widthEl.value), 'length', oldUnit, unit);
    if (heightEl && heightEl.value) heightEl.value = convertValue(parseFloat(heightEl.value), 'length', oldUnit, unit);
    if (weightEl && weightEl.value) weightEl.value = convertValue(parseFloat(weightEl.value), 'weight', oldUnit, unit);
  });
  
  updateSkuUnits();
  
  if (document.getElementById('resultSection').style.display !== 'none') {
    calculate();
  }
}

function updateSkuUnits() {
  const lengthUnit = getLengthUnit();
  const weightUnit = getWeightUnit();
  
  document.querySelectorAll('.sku-item').forEach(item => {
    const units = item.querySelectorAll('.unit');
    units.forEach((unit, index) => {
      unit.textContent = index < 3 ? lengthUnit : weightUnit;
    });
  });
}

function toggleAdvancedOptions() {
  const content = document.getElementById('advancedOptionsContent');
  const arrow = document.getElementById('advancedOptionsArrow');
  
  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    arrow.style.transform = 'rotate(-90deg)';
  } else {
    content.classList.add('expanded');
    arrow.style.transform = 'rotate(0deg)';
  }
}

function switchCalcMode(mode) {
  currentCalcMode = mode;
  
  document.getElementById('btn-mode-independent').classList.toggle('active', mode === 'independent');
  document.getElementById('btn-mode-combined').classList.toggle('active', mode === 'combined');
  
  const descEl = document.getElementById('modeDesc');
  const packingModeSection = document.getElementById('packingModeSection');
  
  if (mode === 'independent') {
    descEl.textContent = '每个SKU独立计算最大装载量，互不影响';
    packingModeSection.style.display = 'block';
  } else {
    descEl.textContent = '多个SKU混合装载在同一托盘上，按层叠方式优化组合';
    packingModeSection.style.display = 'none';
  }
}

function switchPackingMode(mode) {
  currentPackingMode = mode;
  
  document.getElementById('btn-packing-auto').classList.toggle('active', mode === 'auto');
  document.getElementById('btn-packing-single').classList.toggle('active', mode === 'single');
  document.getElementById('btn-packing-between').classList.toggle('active', mode === 'between');
  document.getElementById('btn-packing-layer').classList.toggle('active', mode === 'layer');
  document.getElementById('btn-packing-full').classList.toggle('active', mode === 'full');
  
  const descEl = document.getElementById('packingModeDesc');
  switch(mode) {
    case 'auto':
      descEl.textContent = '自动计算所有摆放模式，选择装载量最大的方案';
      break;
    case 'single':
      descEl.textContent = '所有货物使用同一摆放方向，选择最优方向计算';
      break;
    case 'between':
      descEl.textContent = '不同层可使用不同方向，每层内部统一方向';
      break;
    case 'layer':
      descEl.textContent = '同一层内可混合不同方向，类似拼图填充';
      break;
    case 'full':
      descEl.textContent = '层间混合 + 层内混合，最大化装载量';
      break;
  }
}

function showGlobalError(message) {
  const box = document.getElementById('globalErrorBox');
  const text = document.getElementById('globalErrorText');
  if (box && text) {
    text.textContent = message;
    box.style.display = 'flex';
    box.style.animation = 'none';
    box.offsetHeight;
    box.style.animation = '';
    clearTimeout(box._hideTimer);
    box._hideTimer = setTimeout(() => { box.style.display = 'none'; }, 5000);
  }
}

function hideGlobalError() {
  const box = document.getElementById('globalErrorBox');
  if (box) box.style.display = 'none';
}

function calculate() {
  hideGlobalError();
  const pallet = {
    length: convertToMetric(parseFloat(document.getElementById('palletLength').value) || 0, 'length'),
    width: convertToMetric(parseFloat(document.getElementById('palletWidth').value) || 0, 'length'),
    height: convertToMetric(parseFloat(document.getElementById('palletHeight').value) || 0, 'length'),
    weight: convertToMetric(parseFloat(document.getElementById('palletWeight').value) || 0, 'weight')
  };
  
  if (!validatePalletInputs(pallet)) return;
  
  const skus = getAllSkus();
  
  if (skus.length === 0) {
    showGlobalError('请至少添加一个SKU');
    return;
  }
  
  if (currentCalcMode === 'combined' && skus.length >= 2) {
    const combinedResult = calculateCombinedLoading(pallet, skus);
    displayCombinedResults(combinedResult, pallet, skus);
  } else {
    const results = calculateAllSkusWithPackingMode(pallet, skus, currentPackingMode);
    displayMultipleResults(results, pallet);
  }
}

function getPackingModeLabel(type) {
  switch(type) {
    case 'single': return '单一方向';
    case 'betweenLayerMixed': return '层间混合';
    case 'layerMixed': return '层内混合';
    case 'fullMixed': return '完全混合';
    default: return '混合摆放';
  }
}

function calculateBestPackingMode(pallet, sku) {
  const allResults = [];
  
  const singleResult = calculateBestOrientation(pallet, sku);
  singleResult.type = 'single';
  singleResult.modeLabel = '单一方向';
  allResults.push(singleResult);
  
  const betweenResult = calculateBetweenLayerMixed(pallet, sku);
  allResults.push(betweenResult);
  
  const layerResult = calculateLayerMixedPacking(pallet, sku);
  allResults.push(layerResult);
  
  const fullResult = calculateFullMixedPacking(pallet, sku);
  allResults.push(fullResult);
  
  allResults.sort((a, b) => {
    const qtyA = a.quantity || a.totalItems || 0;
    const qtyB = b.quantity || b.totalItems || 0;
    if (qtyB !== qtyA) return qtyB - qtyA;
    
    const utilA = parseFloat(a.spaceUtilization) || 0;
    const utilB = parseFloat(b.spaceUtilization) || 0;
    return utilB - utilA;
  });
  
  return allResults[0];
}

function calculateAllSkusWithPackingMode(pallet, skus, packingMode) {
  const results = [];
  
  skus.forEach(sku => {
    let result;
    
    if (packingMode === 'auto') {
      result = calculateBestPackingMode(pallet, sku);
    } else {
      switch(packingMode) {
        case 'single':
          result = calculateBestOrientation(pallet, sku);
          result.type = 'single';
          break;
        case 'between':
          result = calculateBetweenLayerMixed(pallet, sku);
          break;
        case 'layer':
          result = calculateLayerMixedPacking(pallet, sku);
          break;
        case 'full':
          result = calculateFullMixedPacking(pallet, sku);
          break;
        default:
          result = calculateBestOrientation(pallet, sku);
          result.type = 'single';
      }
    }
    
    const maxQuantity = result.quantity || result.totalItems || 0;
    if (sku.quantity > 0 && maxQuantity > 0) {
      const totalPallets = Math.ceil(sku.quantity / maxQuantity);
      const remainder = sku.quantity % maxQuantity;
      
      result.palletCount = totalPallets;
      result.lastPalletQuantity = remainder === 0 ? maxQuantity : remainder;
      
      result.palletDetails = [];
      for (let i = 0; i < totalPallets; i++) {
        if (i < totalPallets - 1) {
          result.palletDetails.push({
            palletNumber: i + 1,
            quantity: maxQuantity,
            isFull: true
          });
        } else {
          result.palletDetails.push({
            palletNumber: i + 1,
            quantity: result.lastPalletQuantity,
            isFull: remainder === 0
          });
        }
      }
    }
    
    results.push({
      sku,
      result
    });
  });
  
  return results;
}

function validatePalletInputs(pallet) {
  const errors = [];
  
  if (pallet.length <= 0 || pallet.width <= 0 || pallet.height <= 0) {
    errors.push('请输入有效的托盘尺寸');
  }
  if (pallet.weight <= 0) {
    errors.push('请输入有效的托盘限重');
  }
  
  if (errors.length > 0) {
    showGlobalError(errors.join('；'));
    return false;
  }
  
  return true;
}

function openResultModal() {
  document.getElementById('resultModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeResultModal() {
  document.getElementById('resultModal').style.display = 'none';
  document.body.style.overflow = '';
}

function displayMultipleResults(results, pallet) {
  const validResults = results.filter(r => r.result && (r.result.quantity > 0 || r.result.totalItems > 0));
  if (validResults.length === 0) {
    showGlobalError('所有SKU均无法放入该托盘');
    return;
  }
  
  currentIndependentResults = validResults;
  currentPallet = pallet;
  selectedSkuIndex = 0;
  
  document.getElementById('modalResultTitle').textContent = '各SKU最大装载件数';
  
  const weightUnit = getWeightUnit();
  
  let cardsHTML = '';
  validResults.forEach((item, index) => {
    const { sku, result } = item;
    const isSelected = index === 0;
    const quantity = result.quantity || result.totalItems || 0;
    const isMixed = result.type && result.type !== 'single';
    const modeLabel = getPackingModeLabel(result.type);
    const showAutoBadge = currentPackingMode === 'auto';
    
    let metaHTML = '';
    if (isMixed) {
      metaHTML = `<span><i class="fas fa-layer-group fa-sm"></i> ${result.layers.length}层</span>
                  <span><i class="fas fa-chart-pie fa-sm"></i> ${result.spaceUtilization}%</span>`;
    } else {
      metaHTML = `<span><i class="fas fa-arrows-rotate fa-sm"></i> ${result.orientation}</span>
                  <span><i class="fas fa-layer-group fa-sm"></i> ${result.countL}×${result.countW}×${result.countH}</span>`;
    }
    
    let palletInfoHTML = '';
    if (result.palletCount) {
      palletInfoHTML = `<div class="sku-result-card-pallet-info">
        <span><i class="fas fa-pallet"></i> 需 ${result.palletCount} 托</span>
      </div>`;
    }
    
    cardsHTML += `
      <div class="sku-result-card ${isSelected ? 'selected' : ''}" 
           onclick="selectSkuCard(${index})" 
           data-index="${index}">
        <div class="sku-result-card-header">
          <div class="sku-result-card-name">${sku.name}</div>
          <div class="sku-result-card-quantity-inline">${quantity} 件/托</div>
          ${showAutoBadge ? `<span class="auto-selected-mode"><i class="fas fa-wand-magic-sparkles"></i>${modeLabel}</span>` : ''}
        </div>
        ${palletInfoHTML}
        <div class="sku-result-card-meta">${metaHTML}</div>
      </div>
    `;
  });
  
  document.getElementById('skuCardsContainer').innerHTML = cardsHTML;
  
  updateSelectedSkuDetail(0);
  
  const warningBox = document.getElementById('warningBox');
  const hasWeightLimit = validResults.some(r => r.result.limitByWeight);
  if (hasWeightLimit) {
    warningBox.style.display = 'flex';
    const warnings = validResults
      .filter(r => r.result.limitByWeight)
      .map(r => {
        const qty = r.result.quantity || r.result.totalItems || 0;
        return `${r.sku.name}: 受重量限制影响`;
      })
      .join('\n');
    document.getElementById('warningText').textContent = `部分SKU受重量限制影响：\n${warnings}`;
  } else {
    warningBox.style.display = 'none';
  }
  
  const firstItem = validResults[0];
  const isMixed = firstItem.result.type && firstItem.result.type !== 'single';
  
  if (!isMixed) {
    generateOrientationExamples(pallet, firstItem.sku, firstItem.result);
    drawVisualization(firstItem.result, pallet, firstItem.sku);
    document.getElementById('orientationInfo').textContent = `${firstItem.sku.name} - ${firstItem.result.orientation}`;
  } else {
    document.getElementById('orientationExamples').style.display = 'none';
    drawMixedVisualization(firstItem.result, pallet, firstItem.sku);
    document.getElementById('orientationInfo').textContent = `${firstItem.sku.name} - ${getPackingModeLabel(firstItem.result.type)}`;
  }
  
  openResultModal();
}

function getPackingModeLabel(type) {
  switch(type) {
    case 'betweenLayerMixed': return '层间混合';
    case 'layerMixed': return '层内混合';
    case 'fullMixed': return '完全混合';
    default: return '混合摆放';
  }
}

function selectSkuCard(index) {
  if (index < 0 || index >= currentIndependentResults.length) return;
  
  selectedSkuIndex = index;
  
  document.querySelectorAll('.sku-result-card').forEach((card, i) => {
    card.classList.toggle('selected', i === index);
  });
  
  updateSelectedSkuDetail(index);
  
  const { sku, result } = currentIndependentResults[index];
  const isMixed = result.type && result.type !== 'single';
  
  if (!isMixed) {
    generateOrientationExamples(currentPallet, sku, result);
    drawVisualization(result, currentPallet, sku);
    document.getElementById('orientationInfo').textContent = `${sku.name} - ${result.orientation}`;
  } else {
    document.getElementById('orientationExamples').style.display = 'none';
    drawMixedVisualization(result, currentPallet, sku);
    document.getElementById('orientationInfo').textContent = `${sku.name} - ${getPackingModeLabel(result.type)}`;
  }
}

function updateSelectedSkuDetail(index) {
  const { sku, result } = currentIndependentResults[index];
  const weightUnit = getWeightUnit();
  const isMixed = result.type && result.type !== 'single';
  
  document.getElementById('selectedSkuName').textContent = sku.name;
  document.getElementById('selectedSkuDetail').style.display = 'block';
  
  let detailHTML = '';
  
  if (isMixed) {
    const quantity = result.totalItems || 0;
    const totalWeight = formatWeight(quantity * sku.weight);
    
    detailHTML = `
      <div class="detail-item">
        <div class="detail-label">单托最大件数</div>
        <div class="detail-value">${quantity} 件</div>
      </div>
      ${result.palletCount ? `
      <div class="detail-item">
        <div class="detail-label">需要托数</div>
        <div class="detail-value">${result.palletCount} 托</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">末托件数</div>
        <div class="detail-value">${result.lastPalletQuantity} 件</div>
      </div>
      ` : ''}
      <div class="detail-item">
        <div class="detail-label">摆放模式</div>
        <div class="detail-value">${getPackingModeLabel(result.type)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">层数</div>
        <div class="detail-value">${result.layers.length} 层</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">总重量</div>
        <div class="detail-value">${totalWeight} ${weightUnit}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">空间利用率</div>
        <div class="detail-value">${result.spaceUtilization}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">重量利用率</div>
        <div class="detail-value">${result.weightUtilization}%</div>
      </div>
    `;
    
    if (result.palletDetails && result.palletDetails.length > 0) {
      detailHTML += `<div style="grid-column: 1 / -1; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">
          <i class="fas fa-pallet" style="color: var(--color-accent); margin-right: 6px;"></i>托数分配
        </div>
        <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.8;">
          ${result.palletDetails.map(p => {
            const status = p.isFull ? '已满' : '未满';
            const statusColor = p.isFull ? '#10B981' : '#F59E0B';
            return `<span style="display: inline-block; margin-right: 12px;">
              <span style="font-weight: 600; color: var(--color-primary);">第${p.palletNumber}托:</span> 
              ${p.quantity}件 
              <span style="color: ${statusColor}; font-size: 11px;">(${status})</span>
            </span>`;
          }).join('')}
        </div>
      </div>`;
    }
    
    if (result.layers.length > 0) {
      detailHTML += `<div style="grid-column: 1 / -1; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">层叠详情</div>
        <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.8;">
          ${result.layers.map((layer, i) => {
            const layerCount = layer.count || (layer.placements ? layer.placements.length : 0);
            const layerOri = layer.orientation ? layer.orientation.name : '混合方向';
            return `第 ${i + 1} 层：${layerCount} 件（${layerOri}，高 ${layer.height.toFixed(1)}${getLengthUnit()}）`;
          }).join('<br>')}
        </div>
      </div>`;
    }
  } else {
    const totalWeight = formatWeight(result.quantity * sku.weight);
    const volumeUsed = result.quantity * result.skuL * result.skuW * result.skuH;
    const volumeTotal = currentPallet.length * currentPallet.width * currentPallet.height;
    const spaceUtilization = (volumeUsed / volumeTotal * 100).toFixed(1);
    const weightUtilization = ((result.quantity * sku.weight) / currentPallet.weight * 100).toFixed(1);
    
    detailHTML = `
      <div class="detail-item">
        <div class="detail-label">单托最大件数</div>
        <div class="detail-value">${result.quantity} 件</div>
      </div>
      ${result.palletCount ? `
      <div class="detail-item">
        <div class="detail-label">需要托数</div>
        <div class="detail-value">${result.palletCount} 托</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">末托件数</div>
        <div class="detail-value">${result.lastPalletQuantity} 件</div>
      </div>
      ` : ''}
      <div class="detail-item">
        <div class="detail-label">摆放方向</div>
        <div class="detail-value">${result.orientation}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">布局</div>
        <div class="detail-value">${result.countL}×${result.countW}×${result.countH}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">总重量</div>
        <div class="detail-value">${totalWeight} ${weightUnit}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">空间利用率</div>
        <div class="detail-value">${spaceUtilization}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">重量利用率</div>
        <div class="detail-value">${weightUtilization}%</div>
      </div>
    `;
    
    if (result.palletDetails && result.palletDetails.length > 0) {
      detailHTML += `<div style="grid-column: 1 / -1; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">
          <i class="fas fa-pallet" style="color: var(--color-accent); margin-right: 6px;"></i>托数分配
        </div>
        <div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.8;">
          ${result.palletDetails.map(p => {
            const status = p.isFull ? '已满' : '未满';
            const statusColor = p.isFull ? '#10B981' : '#F59E0B';
            return `<span style="display: inline-block; margin-right: 12px;">
              <span style="font-weight: 600; color: var(--color-primary);">第${p.palletNumber}托:</span> 
              ${p.quantity}件 
              <span style="color: ${statusColor}; font-size: 11px;">(${status})</span>
            </span>`;
          }).join('')}
        </div>
      </div>`;
    }
  }
  
  document.getElementById('selectedSkuDetailGrid').innerHTML = detailHTML;
}

function displayCombinedResults(combinedResult, pallet, skus) {
  document.getElementById('resultSection').style.display = 'block';
  
  document.getElementById('resultTitle').textContent = '混合装载结果';
  document.getElementById('skuCardsContainer').innerHTML = '';
  document.getElementById('selectedSkuDetail').style.display = 'none';
  
  const weightUnit = getWeightUnit();
  const totalWeight = skus.reduce((sum, sku) => {
    return sum + (combinedResult.skuCounts[sku.id] || 0) * sku.weight;
  }, 0);
  
  let cardsHTML = '';
  skus.forEach((sku, i) => {
    const count = combinedResult.skuCounts[sku.id] || 0;
    const colors = SKU_COLORS[i % SKU_COLORS.length];
    cardsHTML += `
      <div class="sku-result-card combined-sku-result-card">
        <div class="sku-result-card-header">
          <div class="sku-result-card-name">
            <span class="sku-color-dot" style="background: #${colors.fill.toString(16).padStart(6, '0')}"></span>
            ${sku.name}
          </div>
        </div>
        <div class="sku-result-card-quantity">${count}</div>
        <div class="sku-result-card-unit">件</div>
      </div>
    `;
  });
  document.getElementById('skuCardsContainer').innerHTML = cardsHTML;
  
  let detailsHTML = `
    <div class="combined-summary">
      <div class="combined-summary-title">
        <i class="fas fa-chart-pie"></i>
        装载总览
      </div>
      <div class="result-detail">
        <div class="detail-item">
          <div class="detail-label">总件数</div>
          <div class="detail-value">${combinedResult.totalItems} 件</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">总重量</div>
          <div class="detail-value">${formatWeight(totalWeight)} ${weightUnit}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">使用层数</div>
          <div class="detail-value">${combinedResult.layers.length} 层</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">已用高度</div>
          <div class="detail-value">${combinedResult.usedHeight.toFixed(1)} ${getLengthUnit()}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">空间利用率</div>
          <div class="detail-value">${combinedResult.spaceUtilization}%</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">重量利用率</div>
          <div class="detail-value">${combinedResult.weightUtilization}%</div>
        </div>
      </div>
    </div>
  `;
  
  detailsHTML += `<div style="font-size: 13px; font-weight: 600; color: var(--color-primary); margin-top: 16px; margin-bottom: 8px;">层叠详情</div>`;
  detailsHTML += `<div style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.8;">`;
  combinedResult.layers.forEach((layer, i) => {
    detailsHTML += `第 ${i + 1} 层：${layer.sku.name} × ${layer.count} 件（${layer.orientation.name}，高 ${layer.height.toFixed(1)}${getLengthUnit()}）<br>`;
  });
  detailsHTML += `</div>`;
  
  document.getElementById('selectedSkuDetail').style.display = 'block';
  document.getElementById('selectedSkuName').textContent = '混合装载';
  document.getElementById('selectedSkuDetailGrid').innerHTML = detailsHTML;
  
  const warningBox = document.getElementById('warningBox');
  if (combinedResult.limitByWeight) {
    warningBox.style.display = 'flex';
    document.getElementById('warningText').textContent = '装载受重量限制影响，无法继续添加更多货物';
  } else {
    warningBox.style.display = 'none';
  }
  
  document.getElementById('orientationInfo').textContent = `混合装载 ${combinedResult.layers.length} 层`;
  document.getElementById('orientationExamples').style.display = 'none';
  
  drawCombinedVisualization(combinedResult, pallet, skus);
}

function generateOrientationExamples(pallet, sku, bestResult) {
  const orientations = getOrientations(sku);
  
  let html = '';
  orientations.forEach((orientation, index) => {
    const result = calculateForOrientation(pallet, orientation, sku.weight);
    const isActive = orientation.name === bestResult.orientation;
    
    html += `
      <div class="orientation-item ${isActive ? 'active' : ''}" 
           onclick="applyOrientation(${index})"
           data-index="${index}">
        <div class="orientation-name">${orientation.name}</div>
        <div class="orientation-count">${result.quantity}</div>
        <div class="orientation-label">件</div>
        <div class="orientation-preview">
          <div class="preview-info">
            <strong>摆放：</strong>${orientation.desc}<br>
            <strong>布局：</strong>${result.countL}×${result.countW}×${result.countH}<br>
            <strong>每层：</strong>${result.countL * result.countW} 件<br>
            <strong>层数：</strong>${result.countH} 层
          </div>
        </div>
      </div>
    `;
  });
  
  document.getElementById('orientationGrid').innerHTML = html;
  document.getElementById('orientationExamples').style.display = 'block';
}

function applyOrientation(index) {
  if (!currentIndependentResults.length || !currentPallet) return;
  
  const selectedItem = currentIndependentResults[selectedSkuIndex];
  if (!selectedItem) return;
  
  const sku = selectedItem.sku;
  const orientations = getOrientations(sku);
  const orientation = orientations[index];
  const result = calculateForOrientation(currentPallet, orientation, sku.weight);
  
  const bestResult = {
    ...result,
    orientation: orientation.name,
    desc: orientation.desc,
    skuL: orientation.l,
    skuW: orientation.w,
    skuH: orientation.h
  };
  
  currentIndependentResults[selectedSkuIndex].result = bestResult;
  
  const cardEl = document.querySelectorAll('.sku-result-card')[selectedSkuIndex];
  if (cardEl) {
    cardEl.querySelector('.sku-result-card-quantity').textContent = result.quantity;
    const metaSpans = cardEl.querySelector('.sku-result-card-meta');
    if (metaSpans) {
      metaSpans.innerHTML = `
        <span><i class="fas fa-arrows-rotate fa-sm"></i> ${orientation.name}</span>
        <span><i class="fas fa-layer-group fa-sm"></i> ${result.countL}×${result.countW}×${result.countH}</span>
      `;
    }
  }
  
  updateSelectedSkuDetail(selectedSkuIndex);
  
  document.getElementById('orientationInfo').textContent = `${sku.name} - ${orientation.name}`;
  
  document.querySelectorAll('.orientation-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
  
  drawVisualization(bestResult, currentPallet, sku);
}

function resetForm() {
  document.getElementById('palletLength').value = '';
  document.getElementById('palletWidth').value = '';
  document.getElementById('palletHeight').value = '';
  document.getElementById('palletWeight').value = '';
  
  document.getElementById('skuList').innerHTML = '';
  skuCounter = 0;
  addSkuInput();
  
  document.getElementById('resultSection').style.display = 'none';
}

// ==================== 初始化 ====================
function initPage() {
  const defaults = CONFIG.DEFAULT_VALUES[currentUnit].pallet;
  document.getElementById('palletLength').value = defaults.length;
  document.getElementById('palletWidth').value = defaults.width;
  document.getElementById('palletHeight').value = defaults.height;
  document.getElementById('palletWeight').value = defaults.weight;
  
  addSkuInput();
  generatePackingModeDiagrams();
}

function generatePackingModeDiagrams() {
  const diagrams = {
    single: `
      <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="160" height="100" fill="none" stroke="#2a3b7d" stroke-width="2" rx="4"/>
        <rect x="20" y="20" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="55" y="20" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="90" y="20" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="125" y="20" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="20" y="45" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="55" y="45" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="90" y="45" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="125" y="45" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="20" y="70" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="55" y="70" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="90" y="70" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="125" y="70" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <text x="90" y="112" text-anchor="middle" font-size="9" fill="#6b7280">统一方向</text>
      </svg>
    `,
    between: `
      <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="160" height="100" fill="none" stroke="#2a3b7d" stroke-width="2" rx="4"/>
        <rect x="15" y="15" width="35" height="18" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="55" y="15" width="35" height="18" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="95" y="15" width="35" height="18" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="135" y="15" width="30" height="18" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <text x="90" y="38" text-anchor="middle" font-size="8" fill="#E8A838">层1: 平放</text>
        <rect x="15" y="45" width="18" height="35" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="38" y="45" width="18" height="35" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="61" y="45" width="18" height="35" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="84" y="45" width="18" height="35" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="107" y="45" width="18" height="35" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="130" y="45" width="18" height="35" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <text x="90" y="88" text-anchor="middle" font-size="8" fill="#36CFC9">层2: 侧放</text>
        <text x="90" y="112" text-anchor="middle" font-size="9" fill="#6b7280">不同层不同方向</text>
      </svg>
    `,
    layer: `
      <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="160" height="100" fill="none" stroke="#2a3b7d" stroke-width="2" rx="4"/>
        <rect x="15" y="20" width="40" height="25" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="60" y="20" width="40" height="25" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="105" y="20" width="40" height="25" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="150" y="15" width="15" height="35" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="15" y="50" width="25" height="40" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="45" y="50" width="25" height="40" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="75" y="50" width="25" height="40" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="105" y="50" width="25" height="40" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="135" y="55" width="30" height="35" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <text x="90" y="112" text-anchor="middle" font-size="9" fill="#6b7280">同层混合方向</text>
      </svg>
    `,
    full: `
      <svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="160" height="100" fill="none" stroke="#2a3b7d" stroke-width="2" rx="4"/>
        <rect x="15" y="15" width="35" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="55" y="15" width="35" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="95" y="15" width="35" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="135" y="15" width="30" height="20" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="15" y="40" width="20" height="30" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="40" y="40" width="20" height="30" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="65" y="40" width="20" height="30" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="90" y="40" width="20" height="30" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="115" y="40" width="20" height="30" fill="#36CFC9" stroke="#13A8A8" stroke-width="1" rx="2"/>
        <rect x="140" y="40" width="25" height="30" fill="#E8A838" stroke="#D4880F" stroke-width="1" rx="2"/>
        <rect x="15" y="75" width="30" height="25" fill="#597EF7" stroke="#2F54EB" stroke-width="1" rx="2"/>
        <rect x="50" y="75" width="30" height="25" fill="#597EF7" stroke="#2F54EB" stroke-width="1" rx="2"/>
        <rect x="85" y="75" width="30" height="25" fill="#597EF7" stroke="#2F54EB" stroke-width="1" rx="2"/>
        <rect x="120" y="75" width="30" height="25" fill="#597EF7" stroke="#2F54EB" stroke-width="1" rx="2"/>
        <text x="90" y="112" text-anchor="middle" font-size="9" fill="#6b7280">层间+层内混合</text>
      </svg>
    `
  };
  
  Object.keys(diagrams).forEach(key => {
    const el = document.getElementById(`diagram-${key}`);
    if (el) {
      el.innerHTML = diagrams[key];
    }
  });
}
