/**
 * Utility functions for solar analysis data transformations
 */

/**
 * Convert monthly bill to estimated monthly kWh consumption
 * @param {number} monthlyBill - Monthly electricity bill in INR
 * @param {number} tariff - Cost per kWh in INR
 * @returns {number} Estimated monthly kWh
 */
exports.billToKwh = (monthlyBill, tariff) => {
  return parseFloat((monthlyBill / tariff).toFixed(2));
};

/**
 * Normalize orientation to single character
 * @param {string} orientation - Full orientation name
 * @returns {string} Single character (N, S, E, W)
 */
exports.normalizeOrientation = (orientation) => {
  const map = {
    'north': 'N',
    'south': 'S',
    'east': 'E',
    'west': 'W'
  };
  return map[orientation.toLowerCase()] || 'S';
};

/**
 * Normalize shading level to numeric value
 * @param {string} shading - Shading level
 * @returns {number} 0 (none), 1 (partial), 2 (full)
 */
exports.normalizeShadingToNumeric = (shading) => {
  const map = {
    'none': 0,
    'partial': 1,
    'full': 2
  };
  return map[shading.toLowerCase()] || 0;
};

/**
 * Format data for ML model consumption
 * @param {object} inputData - Raw input from user
 * @returns {object} Clean, minimal payload for ML
 */
exports.formatForML = (inputData) => {
  const { location, roof, energy, system } = inputData;
  
  const monthlyKwh = exports.billToKwh(energy.monthly_bill, energy.tariff);
  
  return {
    lat: parseFloat(parseFloat(location.latitude).toFixed(2)),
    lon: parseFloat(parseFloat(location.longitude).toFixed(2)),
    roof_area: parseFloat(roof.area),
    tilt: parseFloat(roof.tilt),
    orientation: exports.normalizeOrientation(roof.orientation),
    shading: roof.shading, // Keep as string for ML
    monthly_kwh: monthlyKwh,
    panel_age: parseFloat(system.panel_age_years),
    days_since_cleaning: parseFloat(system.last_cleaned_days_ago)
  };
};

/**
 * Calculate payback period with government subsidies
 * @param {number} systemSizeKw - System size in kW
 * @param {number} annualSavings - Annual savings in INR
 * @returns {number} Years to payback
 */
exports.calculatePayback = (systemSizeKw, annualSavings) => {
  if (!annualSavings || annualSavings <= 0) return 999; // Avoid division by zero
  
  // Cost per kW varies by system size (economies of scale)
  let costPerKw;
  if (systemSizeKw <= 3) {
    costPerKw = 75000; // INR per kW for small systems (1-3 kW)
  } else if (systemSizeKw <= 10) {
    costPerKw = 65000; // INR per kW for medium systems (3-10 kW)
  } else {
    costPerKw = 55000; // INR per kW for large systems (>10 kW)
  }
  
  const grossCost = systemSizeKw * costPerKw;
  
  // Government subsidy (varies by system size)
  // Up to 3 kW: 40% subsidy
  // 3-10 kW: 40% on first 3kW, 20% on rest
  // >10 kW: 40% on first 3kW, 20% on next 7kW
  let subsidy = 0;
  if (systemSizeKw <= 3) {
    subsidy = grossCost * 0.40;
  } else if (systemSizeKw <= 10) {
    subsidy = (3 * costPerKw * 0.40) + ((systemSizeKw - 3) * costPerKw * 0.20);
  } else {
    subsidy = (3 * costPerKw * 0.40) + (7 * costPerKw * 0.20);
  }
  
  const netCost = grossCost - subsidy;
  const paybackYears = netCost / annualSavings;
  
  return parseFloat(paybackYears.toFixed(1));
};

/**
 * Identify major issues from loss breakdown
 * @param {object} lossBreakdown - ML loss breakdown
 * @returns {array} Array of major issues (>5% loss)
 */
exports.identifyMajorIssues = (lossBreakdown) => {
  const issues = [];
  for (const [key, value] of Object.entries(lossBreakdown)) {
    if (value > 5) {
      issues.push(key.charAt(0).toUpperCase() + key.slice(1));
    }
  }
  return issues;
};

/**
 * Determine maintenance priority
 * @param {number} efficiencyLoss - Total efficiency loss percentage
 * @returns {string} Priority level (High, Medium, Low)
 */
exports.getMaintenancePriority = (efficiencyLoss) => {
  if (efficiencyLoss >= 15) return 'High';
  if (efficiencyLoss >= 8) return 'Medium';
  return 'Low';
};
