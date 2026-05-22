// ==================== 配置模块 ====================
const CONFIG = {
  UNITS: {
    INCH_TO_CM: 2.54,
    LBS_TO_KG: 0.453592
  },
  
  DEFAULT_VALUES: {
    'inch-lbs': {
      pallet: { length: 47.2, width: 31.5, height: 70.9, weight: 2205 },
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
let currentPackingMode = 'single';
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
    const placements = [];
    let freeRects = [{ x: 0, y: 0, w: pallet.length, h: pallet.width }];
    let totalWeight = 0;
    
    const validOrientations = orientations.filter(ori => ori.h <= layerHeight);
    if (validOrientations.length === 0) return { placements: [], count: 0, weight: 0 };
    
    let iterations = 0;
    const maxIterations = 1000;
    
    while (iterations < maxIterations) {
      iterations++;
      
      let bestPlacement = null;
      let bestScore = -1;
      let bestRectIndex = -1;
      
      for (let ri = 0; ri < freeRects.length; ri++) {
        const rect = freeRects[ri];
        
        for (const ori of validOrientations) {
          if (ori.l <= rect.w && ori.w <= rect.h) {
            if (sku.weight > 0 && totalWeight + sku.weight > maxWeight) continue;
            
            const areaUsed = ori.l * ori.w;
            const waste = rect.w * rect.h - areaUsed;
            const score = areaUsed * 1000 - waste;
            
            if (score > bestScore) {
              bestScore = score;
              bestPlacement = {
                x: rect.x,
                y: rect.y,
                l: ori.l,
                w: ori.w,
                h: ori.h,
                orientation: ori
              };
              bestRectIndex = ri;
            }
          }
          
          if (ori.w <= rect.w && ori.l <= rect.h) {
            if (sku.weight > 0 && totalWeight + sku.weight > maxWeight) continue;
            
            const areaUsed = ori.l * ori.w;
            const waste = rect.w * rect.h - areaUsed;
            const score = areaUsed * 1000 - waste;
            
            if (score > bestScore) {
              bestScore = score;
              bestPlacement = {
                x: rect.x,
                y: rect.y,
                l: ori.w,
                w: ori.l,
                h: ori.h,
                orientation: ori,
                rotated: true
              };
              bestRectIndex = ri;
            }
          }
        }
      }
      
      if (!bestPlacement) break;
      
      placements.push(bestPlacement);
      totalWeight += sku.weight;
      
      const usedRect = freeRects[bestRectIndex];
      const newFreeRects = [];
      
      for (let i = 0; i < freeRects.length; i++) {
        if (i === bestRectIndex) continue;
        newFreeRects.push(freeRects[i]);
      }
      
      if (usedRect.w > bestPlacement.l) {
        newFreeRects.push({
          x: usedRect.x + bestPlacement.l,
          y: usedRect.y,
          w: usedRect.w - bestPlacement.l,
          h: bestPlacement.w
        });
      }
      
      if (usedRect.h > bestPlacement.w) {
        newFreeRects.push({
          x: usedRect.x,
          y: usedRect.y + bestPlacement.w,
          w: usedRect.w,
          h: usedRect.h - bestPlacement.w
        });
      }
      
      freeRects = mergeFreeRects(newFreeRects);
    }
    
    return {
      placements,
      count: placements.length,
      weight: totalWeight
    };
  }
  
  function mergeFreeRects(rects) {
    const merged = [];
    const used = new Set();
    
    for (let i = 0; i < rects.length; i++) {
      if (used.has(i)) continue;
      
      let current = { ...rects[i] };
      
      for (let j = 0; j < rects.length; j++) {
        if (i === j || used.has(j)) continue;
        
        if (rects[j].x === current.x + current.w && 
            rects[j].y === current.y && 
            rects[j].h === current.h) {
          current.w += rects[j].w;
          used.add(j);
        }
        else if (rects[j].y === current.y + current.h && 
                 rects[j].x === current.x && 
                 rects[j].w === current.w) {
          current.h += rects[j].h;
          used.add(j);
        }
      }
      
      merged.push(current);
    }
    
    return merged;
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
    const placements = [];
    let freeRects = [{ x: 0, y: 0, w: pallet.length, h: pallet.width }];
    let totalWeight = 0;
    
    const validOrientations = orientations.filter(ori => ori.h <= layerHeight);
    if (validOrientations.length === 0) return { placements: [], count: 0, weight: 0 };
    
    let iterations = 0;
    const maxIterations = 2000;
    
    while (iterations < maxIterations) {
      iterations++;
      
      let bestPlacement = null;
      let bestScore = -1;
      let bestRectIndex = -1;
      
      for (let ri = 0; ri < freeRects.length; ri++) {
        const rect = freeRects[ri];
        
        for (const ori of validOrientations) {
          if (ori.l <= rect.w && ori.w <= rect.h) {
            if (sku.weight > 0 && totalWeight + sku.weight > maxWeight) continue;
            
            const fitWidth = Math.floor(rect.w / ori.l);
            const fitHeight = Math.floor(rect.h / ori.w);
            const countInRect = fitWidth * fitHeight;
            
            if (countInRect > 0) {
              const areaUsed = countInRect * ori.l * ori.w;
              const score = areaUsed;
              
              if (score > bestScore) {
                bestScore = score;
                bestPlacement = {
                  x: rect.x,
                  y: rect.y,
                  l: ori.l,
                  w: ori.w,
                  h: ori.h,
                  orientation: ori,
                  count: countInRect,
                  fitWidth,
                  fitHeight
                };
                bestRectIndex = ri;
              }
            }
          }
          
          if (ori.w <= rect.w && ori.l <= rect.h) {
            if (sku.weight > 0 && totalWeight + sku.weight * Math.floor(rect.w / ori.w) * Math.floor(rect.h / ori.l) > maxWeight) continue;
            
            const fitWidth = Math.floor(rect.w / ori.w);
            const fitHeight = Math.floor(rect.h / ori.l);
            const countInRect = fitWidth * fitHeight;
            
            if (countInRect > 0) {
              const areaUsed = countInRect * ori.l * ori.w;
              const score = areaUsed;
              
              if (score > bestScore) {
                bestScore = score;
                bestPlacement = {
                  x: rect.x,
                  y: rect.y,
                  l: ori.w,
                  w: ori.l,
                  h: ori.h,
                  orientation: ori,
                  rotated: true,
                  count: countInRect,
                  fitWidth,
                  fitHeight
                };
                bestRectIndex = ri;
              }
            }
          }
        }
      }
      
      if (!bestPlacement) break;
      
      const actualCount = Math.min(
        bestPlacement.count,
        sku.weight > 0 ? Math.floor((maxWeight - totalWeight) / sku.weight) : bestPlacement.count
      );
      
      if (actualCount <= 0) break;
      
      for (let i = 0; i < actualCount; i++) {
        const fi = Math.floor(i / bestPlacement.fitWidth);
        const fj = i % bestPlacement.fitWidth;
        placements.push({
          x: bestPlacement.x + fj * bestPlacement.l,
          y: bestPlacement.y + fi * bestPlacement.w,
          l: bestPlacement.l,
          w: bestPlacement.w,
          h: bestPlacement.h,
          orientation: bestPlacement.orientation
        });
      }
      
      totalWeight += actualCount * sku.weight;
      
      const usedRect = freeRects[bestRectIndex];
      const newFreeRects = [];
      
      for (let i = 0; i < freeRects.length; i++) {
        if (i === bestRectIndex) continue;
        newFreeRects.push(freeRects[i]);
      }
      
      const usedWidth = bestPlacement.fitWidth * bestPlacement.l;
      const usedHeight = Math.ceil(actualCount / bestPlacement.fitWidth) * bestPlacement.w;
      
      if (usedRect.w > usedWidth) {
        newFreeRects.push({
          x: usedRect.x + usedWidth,
          y: usedRect.y,
          w: usedRect.w - usedWidth,
          h: usedRect.h
        });
      }
      
      if (usedRect.h > usedHeight) {
        newFreeRects.push({
          x: usedRect.x,
          y: usedRect.y + usedHeight,
          w: usedWidth,
          h: usedRect.h - usedHeight
        });
      }
      
      freeRects = mergeFreeRectsOptimized(newFreeRects);
    }
    
    return {
      placements,
      count: placements.length,
      weight: totalWeight
    };
  }
  
  function mergeFreeRectsOptimized(rects) {
    if (rects.length === 0) return [];
    
    const filtered = rects.filter(r => r.w > 0 && r.h > 0);
    const merged = [];
    const used = new Set();
    
    for (let i = 0; i < filtered.length; i++) {
      if (used.has(i)) continue;
      
      let current = { ...filtered[i] };
      let changed = true;
      
      while (changed) {
        changed = false;
        for (let j = 0; j < filtered.length; j++) {
          if (i === j || used.has(j)) continue;
          
          if (filtered[j].x === current.x + current.w && 
              filtered[j].y === current.y && 
              filtered[j].h === current.h) {
            current.w += filtered[j].w;
            used.add(j);
            changed = true;
          }
          else if (filtered[j].y === current.y + current.h && 
                   filtered[j].x === current.x && 
                   filtered[j].w === current.w) {
            current.h += filtered[j].h;
            used.add(j);
            changed = true;
          }
        }
      }
      
      merged.push(current);
    }
    
    return merged;
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
    
    if (length > 0 && width > 0 && height > 0) {
      skus.push({
        id: skuId,
        name,
        length,
        width,
        height,
        weight
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
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }
  animate();
}

function drawVisualization(result, pallet, sku) {
  if (!scene) {
    const success = init3DScene();
    if (!success) return;
  }
  
  const canvas = document.getElementById('canvas3d');
  const container = canvas ? canvas.parentElement : null;
  if (container && container.clientWidth > 0 && renderer) {
    renderer.setSize(container.clientWidth, 500);
    camera.aspect = container.clientWidth / 500;
    camera.updateProjectionMatrix();
  }
  
  clearScene();
  
  const scale = 1;
  
  createPallet(pallet, scale);
  createSkuBoxes(result, scale);
  adjustCamera(pallet);
}

function clearScene() {
  while (palletGroup.children.length > 0) {
    palletGroup.remove(palletGroup.children[0]);
  }
  while (skuGroup.children.length > 0) {
    skuGroup.remove(skuGroup.children[0]);
  }
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
        
        const skuEdges = new THREE.EdgesGeometry(skuGeometry);
        const skuWireframe = new THREE.LineSegments(skuEdges, skuEdgesMaterial);
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
  if (!scene) {
    const success = init3DScene();
    if (!success) return;
  }
  
  const canvas = document.getElementById('canvas3d');
  const container = canvas ? canvas.parentElement : null;
  if (container && container.clientWidth > 0 && renderer) {
    renderer.setSize(container.clientWidth, 500);
    camera.aspect = container.clientWidth / 500;
    camera.updateProjectionMatrix();
  }
  
  clearScene();
  
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
  if (!scene) {
    const success = init3DScene();
    if (!success) return;
  }
  
  const canvas = document.getElementById('canvas3d');
  const container = canvas ? canvas.parentElement : null;
  if (container && container.clientWidth > 0 && renderer) {
    renderer.setSize(container.clientWidth, 500);
    camera.aspect = container.clientWidth / 500;
    camera.updateProjectionMatrix();
  }
  
  clearScene();
  
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
}

function setView(viewType, btnEl) {
  if (!camera || !controls) return;
  
  const buttons = document.querySelectorAll('.view-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  
  const maxDim = 200;
  
  switch(viewType) {
    case 'top':
      camera.position.set(0, maxDim * 2, 0);
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
function switchUnit(unit) {
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
  
  const defaultValues = CONFIG.DEFAULT_VALUES[unit].pallet;
  document.getElementById('palletLength').placeholder = defaultValues.length;
  document.getElementById('palletWidth').placeholder = defaultValues.width;
  document.getElementById('palletHeight').placeholder = defaultValues.height;
  document.getElementById('palletWeight').placeholder = defaultValues.weight;
  
  updateSkuUnits();
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
  
  document.getElementById('btn-packing-single').classList.toggle('active', mode === 'single');
  document.getElementById('btn-packing-between').classList.toggle('active', mode === 'between');
  document.getElementById('btn-packing-layer').classList.toggle('active', mode === 'layer');
  document.getElementById('btn-packing-full').classList.toggle('active', mode === 'full');
  
  const descEl = document.getElementById('packingModeDesc');
  switch(mode) {
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

function calculate() {
  const pallet = {
    length: convertToMetric(parseFloat(document.getElementById('palletLength').value) || 0, 'length'),
    width: convertToMetric(parseFloat(document.getElementById('palletWidth').value) || 0, 'length'),
    height: convertToMetric(parseFloat(document.getElementById('palletHeight').value) || 0, 'length'),
    weight: convertToMetric(parseFloat(document.getElementById('palletWeight').value) || 0, 'weight')
  };
  
  if (!validatePalletInputs(pallet)) return;
  
  const skus = getAllSkus();
  
  if (skus.length === 0) {
    alert('请至少添加一个SKU');
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

function calculateAllSkusWithPackingMode(pallet, skus, packingMode) {
  const results = [];
  
  skus.forEach(sku => {
    let result;
    
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
    alert(errors.join('\n'));
    return false;
  }
  
  return true;
}

function displayMultipleResults(results, pallet) {
  const validResults = results.filter(r => r.result && (r.result.quantity > 0 || r.result.totalItems > 0));
  if (validResults.length === 0) {
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('skuCardsContainer').innerHTML = '<div class="text-center text-gray-500 py-4">所有SKU均无法放入该托盘</div>';
    document.getElementById('selectedSkuDetail').style.display = 'none';
    document.getElementById('warningBox').style.display = 'none';
    return;
  }
  
  currentIndependentResults = validResults;
  currentPallet = pallet;
  selectedSkuIndex = 0;
  
  document.getElementById('resultSection').style.display = 'block';
  document.getElementById('resultTitle').textContent = '各SKU最大装载件数';
  
  const weightUnit = getWeightUnit();
  
  let cardsHTML = '';
  validResults.forEach((item, index) => {
    const { sku, result } = item;
    const isSelected = index === 0;
    const quantity = result.quantity || result.totalItems || 0;
    const isMixed = result.type && result.type !== 'single';
    
    let metaHTML = '';
    if (isMixed) {
      metaHTML = `<span><i class="fas fa-layer-group fa-sm"></i> ${result.layers.length}层</span>
                  <span><i class="fas fa-chart-pie fa-sm"></i> ${result.spaceUtilization}%</span>`;
    } else {
      metaHTML = `<span><i class="fas fa-arrows-rotate fa-sm"></i> ${result.orientation}</span>
                  <span><i class="fas fa-layer-group fa-sm"></i> ${result.countL}×${result.countW}×${result.countH}</span>`;
    }
    
    cardsHTML += `
      <div class="sku-result-card ${isSelected ? 'selected' : ''}" 
           onclick="selectSkuCard(${index})" 
           data-index="${index}">
        <div class="sku-result-card-header">
          <div class="sku-result-card-name">${sku.name}</div>
          ${index === 0 ? '<span class="sku-result-card-badge">最优</span>' : ''}
        </div>
        <div class="sku-result-card-quantity">${quantity}</div>
        <div class="sku-result-card-unit">件</div>
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
        <div class="detail-label">最大件数</div>
        <div class="detail-value">${quantity} 件</div>
      </div>
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
        <div class="detail-label">最大件数</div>
        <div class="detail-value">${result.quantity} 件</div>
      </div>
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
