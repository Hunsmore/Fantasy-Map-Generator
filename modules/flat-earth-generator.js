"use strict";

window.FlatEarthGenerator = (function () {
  let grid = null;
  let heights = null;
  let blobPower;
  let linePower;

  const setGraph = graph => {
    const {cellsDesired, cells, points} = graph;
    heights = cells.h ? Uint8Array.from(cells.h) : createTypedArray({maxValue: 100, length: points.length});
    blobPower = getBlobPower(cellsDesired);
    linePower = getLinePower(cellsDesired);
    grid = graph;
  };

  const getHeights = () => heights;

  const clearData = () => {
    heights = null;
    grid = null;
  };

  // Generate flat earth heightmap with two large islands and archipelago
  const generateFlatEarth = (graph, options = {}) => {
    setGraph(graph);
    
    // Create custom flat earth with two large islands (2:1 ratio) and archipelago
    createCustomFlatEarth();
    
    return heights;
  };

  // Create custom flat earth terrain
  const createCustomFlatEarth = () => {
    const graphWidth = grid.points.reduce((max, p) => Math.max(max, p[0]), 0);
    const graphHeight = grid.points.reduce((max, p) => Math.max(max, p[1]), 0);
    const centerX = graphWidth / 2;
    const centerY = graphHeight / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    // Initialize all heights to ocean level
    for (let i = 0; i < heights.length; i++) {
      heights[i] = 15; // Ocean level
    }
    
    // Create two large islands with 2:1 area ratio
    createTwoLargeIslands(centerX, centerY, maxRadius);
    
    // Create archipelago
    createArchipelago(centerX, centerY, maxRadius);
    
    // Add ice wall at the edge
    addIceWall(centerX, centerY, maxRadius);
    
    // Smooth the terrain
    smoothHeightmap();
  };

  // Create two large continents with 2:1 area ratio, closer together
  const createTwoLargeIslands = (centerX, centerY, maxRadius) => {
    // Large continent (2/3 of total land area) - positioned northwest, closer to center
    const largeIslandX = centerX - maxRadius * 0.22;
    const largeIslandY = centerY - maxRadius * 0.28;
    const largeIslandRadius = maxRadius * 0.45;  // 增大到 45%
    
    // Small continent (1/3 of total land area) - positioned southeast, closer to center
    const smallIslandX = centerX + maxRadius * 0.28;
    const smallIslandY = centerY + maxRadius * 0.22;
    const smallIslandRadius = maxRadius * 0.25;  // 增大到 35%
    
    // Create large continent with complex terrain
    addComplexContinent(largeIslandX, largeIslandY, largeIslandRadius, 60, 85);
    
    // Create small continent with complex terrain
    addComplexContinent(smallIslandX, smallIslandY, smallIslandRadius, 50, 75);
    
    // Add connecting land bridge or archipelago between continents
    if (Math.random() < 0.6) {
      createLandBridge(largeIslandX, largeIslandY, smallIslandX, smallIslandY, maxRadius);
    }
  };

  // Create a complex continent with multiple peninsulas and varied terrain
  const addComplexContinent = (centerX, centerY, radius, baseHeight, maxHeight) => {
    // Main continent body with multiple overlapping sections
    const mainSections = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < mainSections; i++) {
      const angle = (i / mainSections) * 2 * Math.PI + Math.random() * 1.0;
      const distance = Math.random() * radius * 0.3;
      const sectionX = centerX + Math.cos(angle) * distance;
      const sectionY = centerY + Math.sin(angle) * distance;
      const sectionHeight = baseHeight * (0.7 + Math.random() * 0.3);
      const sectionRadius = radius * (0.4 + Math.random() * 0.3);
      
      addHill(sectionX, sectionY, sectionHeight, sectionRadius);
    }
    
    // Add multiple large peninsulas extending from the continent
    const peninsulaCount = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < peninsulaCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius * (0.6 + Math.random() * 0.4);
      const peninsulaX = centerX + Math.cos(angle) * distance;
      const peninsulaY = centerY + Math.sin(angle) * distance;
      const peninsulaHeight = baseHeight * (0.4 + Math.random() * 0.4);
      const peninsulaRadius = radius * (0.2 + Math.random() * 0.3);
      
      addHill(peninsulaX, peninsulaY, peninsulaHeight, peninsulaRadius);
      
      // Add sub-peninsulas extending from main peninsula
      const subPeninsulaCount = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < subPeninsulaCount; j++) {
        const subAngle = angle + (Math.random() - 0.5) * 2.0;
        const subDistance = peninsulaRadius * (1.0 + Math.random() * 1.0);
        const subX = peninsulaX + Math.cos(subAngle) * subDistance;
        const subY = peninsulaY + Math.sin(subAngle) * subDistance;
        const subHeight = peninsulaHeight * (0.5 + Math.random() * 0.5);
        const subRadius = peninsulaRadius * (0.3 + Math.random() * 0.4);
        
        addHill(subX, subY, subHeight, subRadius);
        
        // Sometimes add tiny islets at the tip
        if (Math.random() < 0.4) {
          const isletAngle = subAngle + (Math.random() - 0.5) * 1.0;
          const isletDistance = subRadius * (1.2 + Math.random() * 0.8);
          const isletX = subX + Math.cos(isletAngle) * isletDistance;
          const isletY = subY + Math.sin(isletAngle) * isletDistance;
          const isletHeight = 25 + Math.random() * 25;
          const isletRadius = 3 + Math.random() * 8;
          
          addHill(isletX, isletY, isletHeight, isletRadius);
        }
      }
    }
    
    // Add interior mountain ranges
    const mountainRangeCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < mountainRangeCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius * 0.4;
      const rangeX = centerX + Math.cos(angle) * distance;
      const rangeY = centerY + Math.sin(angle) * distance;
      const rangeLength = radius * (0.3 + Math.random() * 0.4);
      const rangeHeight = 20 + Math.random() * 30;
      
      addMountainRange(rangeX, rangeY, rangeLength, rangeHeight);
    }
    
    // Add numerous bays and inlets
    const bayCount = 5 + Math.floor(Math.random() * 8);
    for (let i = 0; i < bayCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius * (0.7 + Math.random() * 0.3);
      const bayX = centerX + Math.cos(angle) * distance;
      const bayY = centerY + Math.sin(angle) * distance;
      const baySize = 6 + Math.random() * 15;
      const bayRadius = 8 + Math.random() * 12;
      
      addValley(bayX, bayY, baySize, bayRadius);
    }
    
    // Add coastal islands and islets
    const coastalIslandCount = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < coastalIslandCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius * (1.0 + Math.random() * 0.4);
      const islandX = centerX + Math.cos(angle) * distance;
      const islandY = centerY + Math.sin(angle) * distance;
      const islandHeight = 30 + Math.random() * 40;
      const islandRadius = 4 + Math.random() * 12;
      
      addHill(islandX, islandY, islandHeight, islandRadius);
    }
  };

  // Create a land bridge or island chain between continents
  const createLandBridge = (x1, y1, x2, y2, maxRadius) => {
    const bridgeLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const bridgeIslands = 2 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < bridgeIslands; i++) {
      const progress = i / (bridgeIslands - 1);
      const bridgeX = x1 + (x2 - x1) * progress + (Math.random() - 0.5) * bridgeLength * 0.2;
      const bridgeY = y1 + (y2 - y1) * progress + (Math.random() - 0.5) * bridgeLength * 0.2;
      const bridgeHeight = 35 + Math.random() * 25;
      const bridgeRadius = 6 + Math.random() * 10;
      
      addHill(bridgeX, bridgeY, bridgeHeight, bridgeRadius);
    }
  };

  // Create archipelago
  const createArchipelago = (centerX, centerY, maxRadius) => {
    // Create archipelago in the northeast area
    const archipelagoCenterX = centerX + maxRadius * 0.35;
    const archipelagoCenterY = centerY - maxRadius * 0.35;
    const archipelagoRadius = maxRadius * 0.25;  // 稍微缩小群岛区域，为更大的大陆让出空间
    
    // Create 8-12 small islands in the archipelago
    const islandCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < islandCount; i++) {
      // Create more irregular distribution
      const angle = (i / islandCount) * 2 * Math.PI + Math.random() * 0.8;
      const distance = Math.random() * archipelagoRadius * 0.9;
      const islandX = archipelagoCenterX + Math.cos(angle) * distance;
      const islandY = archipelagoCenterY + Math.sin(angle) * distance;
      
      // Vary island sizes more dramatically
      const islandSize = 6 + Math.random() * 18;
      const islandHeight = 35 + Math.random() * 40;
      
      addIsland(islandX, islandY, islandSize, islandHeight, 70);
      
      // Add some very small islets around larger islands
      if (islandSize > 12 && Math.random() < 0.6) {
        const isletCount = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < isletCount; j++) {
          const isletAngle = Math.random() * 2 * Math.PI;
          const isletDistance = islandSize * (0.8 + Math.random() * 0.6);
          const isletX = islandX + Math.cos(isletAngle) * isletDistance;
          const isletY = islandY + Math.sin(isletAngle) * isletDistance;
          const isletSize = 3 + Math.random() * 6;
          const isletHeight = 25 + Math.random() * 20;
          
          addIsland(isletX, isletY, isletSize, isletHeight, 50);
        }
      }
    }
  };

  // Add a complete island with varied terrain
  const addIsland = (centerX, centerY, radius, baseHeight, maxHeight) => {
    // Create irregular island shape using multiple overlapping hills with more randomness
    const mainHills = 5 + Math.floor(Math.random() * 8);
    for (let i = 0; i < mainHills; i++) {
      const angle = (i / mainHills) * 2 * Math.PI + Math.random() * 1.2;
      const distance = Math.random() * radius * 0.5;
      const hillX = centerX + Math.cos(angle) * distance;
      const hillY = centerY + Math.sin(angle) * distance;
      const hillHeight = baseHeight * (0.5 + Math.random() * 0.5);
      const hillRadius = radius * (0.25 + Math.random() * 0.5);
      
      addHill(hillX, hillY, hillHeight, hillRadius);
    }
    
    // Add irregular coastal extensions and peninsulas with more variety
    const coastalExtensions = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < coastalExtensions; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius * (0.5 + Math.random() * 0.6);
      const extensionX = centerX + Math.cos(angle) * distance;
      const extensionY = centerY + Math.sin(angle) * distance;
      const extensionHeight = baseHeight * (0.2 + Math.random() * 0.5);
      const extensionRadius = radius * (0.1 + Math.random() * 0.3);
      
      addHill(extensionX, extensionY, extensionHeight, extensionRadius);
      
      // Add sub-extensions to create more complex peninsulas
      if (Math.random() < 0.4) {
        const subAngle = angle + (Math.random() - 0.5) * 1.5;
        const subDistance = extensionRadius * (1.2 + Math.random() * 0.8);
        const subX = extensionX + Math.cos(subAngle) * subDistance;
        const subY = extensionY + Math.sin(subAngle) * subDistance;
        const subHeight = extensionHeight * (0.6 + Math.random() * 0.4);
        const subRadius = extensionRadius * (0.4 + Math.random() * 0.4);
        
        addHill(subX, subY, subHeight, subRadius);
      }
    }
    
    // Add some interior hills and valleys for variety
    const interiorHills = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < interiorHills; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius * 0.6;
      const hillX = centerX + Math.cos(angle) * distance;
      const hillY = centerY + Math.sin(angle) * distance;
      const hillHeight = 12 + Math.random() * 30;
      const hillRadius = 6 + Math.random() * 18;
      
      addHill(hillX, hillY, hillHeight, hillRadius);
    }
    
    // Add more coastal indentations (bays and inlets) with varying sizes
    const coastalIndentations = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < coastalIndentations; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius * (0.7 + Math.random() * 0.3);
      const indentationX = centerX + Math.cos(angle) * distance;
      const indentationY = centerY + Math.sin(angle) * distance;
      
      // Create varying sizes of bays
      const baySize = 4 + Math.random() * 12;
      const bayRadius = 5 + Math.random() * 10;
      
      addValley(indentationX, indentationY, baySize, bayRadius);
      
      // Sometimes add a smaller secondary bay nearby
      if (Math.random() < 0.3) {
        const secondaryAngle = angle + (Math.random() - 0.5) * 1.0;
        const secondaryDistance = bayRadius * (0.8 + Math.random() * 0.4);
        const secondaryX = indentationX + Math.cos(secondaryAngle) * secondaryDistance;
        const secondaryY = indentationY + Math.sin(secondaryAngle) * secondaryDistance;
        
        addValley(secondaryX, secondaryY, baySize * 0.6, bayRadius * 0.7);
      }
    }
    
    // Add some coastal islets and rocks
    const coastalIslets = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < coastalIslets; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius * (1.1 + Math.random() * 0.3);
      const isletX = centerX + Math.cos(angle) * distance;
      const isletY = centerY + Math.sin(angle) * distance;
      const isletHeight = 20 + Math.random() * 30;
      const isletRadius = 2 + Math.random() * 6;
      
      addHill(isletX, isletY, isletHeight, isletRadius);
    }
    
    // Add some interior valleys and depressions
    const interiorValleys = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < interiorValleys; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius * 0.4;
      const valleyX = centerX + Math.cos(angle) * distance;
      const valleyY = centerY + Math.sin(angle) * distance;
      const valleyDepth = 3 + Math.random() * 8;
      const valleyRadius = 4 + Math.random() * 8;
      
      addValley(valleyX, valleyY, valleyDepth, valleyRadius);
    }
  };

  // Add mountain range
  const addMountainRange = (centerX, centerY, length, height) => {
    const mountainCount = 4 + Math.floor(Math.random() * 6);
    const direction = Math.random() * 2 * Math.PI;
    const curveAmount = Math.random() * 0.3; // Add some curve to the range
    
    for (let i = 0; i < mountainCount; i++) {
      const progress = i / (mountainCount - 1);
      const baseX = centerX + Math.cos(direction) * length * (progress - 0.5);
      const baseY = centerY + Math.sin(direction) * length * (progress - 0.5);
      
      // Add curve and random variation to mountain positions
      const curveOffset = Math.sin(progress * Math.PI) * curveAmount * length;
      const randomOffset = (Math.random() - 0.5) * length * 0.2;
      
      const mountainX = baseX + Math.cos(direction + Math.PI/2) * curveOffset + Math.cos(direction) * randomOffset;
      const mountainY = baseY + Math.sin(direction + Math.PI/2) * curveOffset + Math.sin(direction) * randomOffset;
      
      const mountainHeight = height * (0.6 + Math.random() * 0.8);
      const mountainRadius = 6 + Math.random() * 15;
      
      addHill(mountainX, mountainY, mountainHeight, mountainRadius);
      
      // Add some smaller peaks around the main peak
      const subPeaks = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < subPeaks; j++) {
        const subAngle = Math.random() * 2 * Math.PI;
        const subDistance = Math.random() * mountainRadius * 0.6;
        const subX = mountainX + Math.cos(subAngle) * subDistance;
        const subY = mountainY + Math.sin(subAngle) * subDistance;
        const subHeight = mountainHeight * (0.3 + Math.random() * 0.4);
        const subRadius = mountainRadius * (0.2 + Math.random() * 0.3);
        
        addHill(subX, subY, subHeight, subRadius);
      }
    }
  };

  // Add continental features
  const addContinents = (continentCount) => {
    const graphWidth = grid.points.reduce((max, p) => Math.max(max, p[0]), 0);
    const graphHeight = grid.points.reduce((max, p) => Math.max(max, p[1]), 0);
    const centerX = graphWidth / 2;
    const centerY = graphHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.9;
    
    for (let c = 0; c < continentCount; c++) {
      // Random position within the circle
      const angle = (c / continentCount) * 2 * Math.PI + Math.random() * 0.5;
      const distance = 0.2 + Math.random() * 0.6; // Between 20% and 80% from center
      const continentX = centerX + Math.cos(angle) * radius * distance;
      const continentY = centerY + Math.sin(angle) * radius * distance;
      
      // Add continental features
      addHill(continentX, continentY, 20 + Math.random() * 30, 30 + Math.random() * 20);
    }
  };

  // Add ice wall at the edge
  const addIceWall = (centerX, centerY, radius) => {
    const wallRadius = radius * 0.95;
    const wallThickness = radius * 0.05;
    
    for (let i = 0; i < grid.points.length; i++) {
      const [x, y] = grid.points[i];
      const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distanceFromCenter >= wallRadius && distanceFromCenter <= wallRadius + wallThickness) {
        heights[i] = 98 + Math.random() * 2; // Very high ice wall
      }
    }
  };

  // Add a hill at specified location with irregular shape
  const addHill = (centerX, centerY, height, radius) => {
    // Add some randomness to the hill shape
    const shapeVariation = 0.1 + Math.random() * 0.2; // 10-30% shape variation
    
    for (let i = 0; i < grid.points.length; i++) {
      const [x, y] = grid.points[i];
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance <= radius) {
        // Create irregular influence pattern
        const baseInfluence = 1 - (distance / radius);
        const angle = Math.atan2(y - centerY, x - centerX);
        
        // Add some noise to create irregular edges
        const noise = Math.sin(angle * 3 + Math.random() * 2) * shapeVariation;
        const influence = Math.max(0, baseInfluence + noise);
        
        // Vary the height profile
        const heightVariation = 0.8 + Math.random() * 0.4; // 80-120% height variation
        const hillHeight = height * influence * heightVariation;
        
        heights[i] = Math.max(heights[i], hillHeight);
      }
    }
  };

  // Add a valley (negative hill) at specified location
  const addValley = (centerX, centerY, depth, radius) => {
    for (let i = 0; i < grid.points.length; i++) {
      const [x, y] = grid.points[i];
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance <= radius) {
        const influence = 1 - (distance / radius);
        const valleyDepth = depth * influence;
        heights[i] = Math.max(heights[i] - valleyDepth, 15); // Don't go below sea level
      }
    }
  };

  // Smooth the heightmap
  const smoothHeightmap = () => {
    const {cellsX, cellsY, points} = grid;
    const smoothed = new Uint8Array(heights.length);
    
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      let sum = 0;
      let count = 0;
      
      // Check neighboring cells
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < cellsX && ny >= 0 && ny < cellsY) {
            const neighborIndex = ny * cellsX + nx;
            if (neighborIndex < heights.length) {
              sum += heights[neighborIndex];
              count++;
            }
          }
        }
      }
      
      smoothed[i] = count > 0 ? sum / count : heights[i];
    }
    
    // Blend original and smoothed
    for (let i = 0; i < heights.length; i++) {
      heights[i] = heights[i] * 0.7 + smoothed[i] * 0.3;
    }
  };

  // Get blob power based on cell count
  const getBlobPower = (cells) => {
    const blobPowerMap = {
      1000: 0.93,
      2000: 0.95,
      5000: 0.97,
      10000: 0.98,
      20000: 0.99,
      30000: 0.991,
      40000: 0.993,
      50000: 0.994,
      60000: 0.995,
      70000: 0.9955,
      80000: 0.996,
      90000: 0.9964,
      100000: 0.9973
    };
    return blobPowerMap[cells] || 0.98;
  };

  // Get line power based on cell count
  const getLinePower = (cells) => {
    const linePowerMap = {
      1000: 0.75,
      2000: 0.77,
      5000: 0.79,
      10000: 0.81,
      20000: 0.82,
      30000: 0.83,
      40000: 0.84,
      50000: 0.86,
      60000: 0.87,
      70000: 0.88,
      80000: 0.91,
      90000: 0.92,
      100000: 0.93
    };
    return linePowerMap[cells] || 0.81;
  };

  return {
    generateFlatEarth,
    getHeights,
    clearData,
    setGraph
  };
})();
