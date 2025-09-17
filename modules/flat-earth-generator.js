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

  // Generate flat earth heightmap with circular boundary
  const generateFlatEarth = (graph, options = {}) => {
    setGraph(graph);
    
    // For flat earth, we'll use the template system but with circular masking
    // This ensures compatibility with the existing heightmap generation pipeline
    return null; // Return null to use template system instead
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

  // Add a hill at specified location
  const addHill = (centerX, centerY, height, radius) => {
    for (let i = 0; i < grid.points.length; i++) {
      const [x, y] = grid.points[i];
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance <= radius) {
        const influence = 1 - (distance / radius);
        const hillHeight = height * influence;
        heights[i] = Math.max(heights[i], hillHeight);
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
