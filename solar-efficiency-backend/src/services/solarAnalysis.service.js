/**
 * Solar Panel Analysis Service
 * This service formats data for ML, calls ML model, and processes results
 */

const { 
  formatForML, 
  calculatePayback, 
  identifyMajorIssues, 
  getMaintenancePriority 
} = require('../utils/solarTransform');

// Constants for calculations
const PEAK_SUN_HOURS_INDIA = 5.5;
const PANEL_POWER_PER_SQM = 150;

/**
 * Main analysis function
 * Orchestrates: Data formatting → ML call → Response transformation
 */
exports.performAnalysis = async (inputData) => {
  // 1. Format data for ML model
  const mlPayload = formatForML(inputData);
  
  // 2. Call ML model (mocked for hackathon, replace with actual API call)
  const mlResponse = await callMLModel(mlPayload);
  
  // 3. Transform ML response to judge-friendly format
  return transformMLResponse(mlResponse, inputData);
};

/**
 * Call ML Model (MOCK for hackathon)
 * Replace this with actual ML API call when ready
 */
async function callMLModel(payload) {
  // TODO: Replace with actual ML endpoint
  // const response = await fetch('http://ml-service:5000/predict', {
  //   method: 'POST',
  //   body: JSON.stringify(payload)
  // });
  
  // MOCK ML Response based on rule-based logic
  const systemSizeKw = (payload.roof_area * PANEL_POWER_PER_SQM) / 1000;
  const annualGeneration = systemSizeKw * PEAK_SUN_HOURS_INDIA * 365;
  
  // Calculate losses
  const dustLoss = Math.min((payload.days_since_cleaning / 30) * 1.5, 8);
  const shadingLossMap = { 'none': 0, 'partial': 6, 'full': 15 };
  const shadingLoss = shadingLossMap[payload.shading] || 0;
  const ageLoss = payload.panel_age * 0.5;
  const tempLoss = 5;
  
  const totalLoss = dustLoss + shadingLoss + ageLoss + tempLoss;
  
  // Maintenance alert
  let maintenanceAlert = "System operating normally";
  if (dustLoss > 5) maintenanceAlert = "Cleaning recommended";
  if (shadingLoss > 10) maintenanceAlert = "Critical: Address shading issues";
  
  return {
    recommended_system_kw: parseFloat(systemSizeKw.toFixed(2)),
    expected_annual_generation_kwh: parseFloat(annualGeneration.toFixed(0)),
    efficiency_loss_percent: parseFloat(totalLoss.toFixed(1)),
    loss_breakdown: {
      dust: parseFloat(dustLoss.toFixed(1)),
      shading: parseFloat(shadingLoss.toFixed(1)),
      age: parseFloat(ageLoss.toFixed(1)),
      temperature: tempLoss
    },
    maintenance_alert: maintenanceAlert,
    estimated_savings_per_year: parseFloat((annualGeneration * 6).toFixed(0)) // Assuming ₹6/kWh avg
  };
}

/**
 * Transform ML response to frontend-friendly format
 */
function transformMLResponse(mlData, originalInput) {
  const majorIssues = identifyMajorIssues(mlData.loss_breakdown);
  const paybackYears = calculatePayback(mlData.recommended_system_kw, mlData.estimated_savings_per_year);
  const priority = getMaintenancePriority(mlData.efficiency_loss_percent);
  
  return {
    systemRecommendation: {
      size_kw: mlData.recommended_system_kw,
      annual_generation: mlData.expected_annual_generation_kwh,
      optimal_efficiency: 20 - mlData.efficiency_loss_percent,
      peak_power_watts: mlData.recommended_system_kw * 1000
    },
    performanceAnalysis: {
      efficiency_loss: mlData.efficiency_loss_percent,
      major_issues: majorIssues,
      loss_breakdown: mlData.loss_breakdown,
      system_health_score: Math.max(100 - mlData.efficiency_loss_percent * 3, 0)
    },
    maintenance: {
      alert: mlData.maintenance_alert,
      priority: priority,
      recommended_actions: generateActions(mlData.loss_breakdown, originalInput.system)
    },
    financials: {
      yearly_savings: mlData.estimated_savings_per_year,
      monthly_savings: Math.round(mlData.estimated_savings_per_year / 12),
      payback_years: paybackYears,
      lifetime_savings: Math.round(mlData.estimated_savings_per_year * 25) // 25yr lifespan
    },
    location: {
      city: originalInput.location.city,
      state: originalInput.location.state,
      coordinates: {
        lat: originalInput.location.latitude,
        lon: originalInput.location.longitude
      }
    },
    metadata: {
      analyzed_at: new Date().toISOString(),
      model_version: '1.0.0'
    }
  };
}



/**
 * Generate actionable recommendations based on loss breakdown
 */
function generateActions(lossBreakdown, systemData) {
  const actions = [];

  if (lossBreakdown.dust > 5) {
    actions.push({
      action: 'Clean panels immediately',
      impact: `${lossBreakdown.dust}% efficiency gain expected`,
      urgency: 'high'
    });
  }

  if (lossBreakdown.shading > 5) {
    actions.push({
      action: 'Address shading obstacles',
      impact: `${lossBreakdown.shading}% efficiency gain possible`,
      urgency: lossBreakdown.shading > 10 ? 'high' : 'medium'
    });
  }

  if (lossBreakdown.age > 8) {
    actions.push({
      action: 'Consider panel upgrade/replacement',
      impact: `System is ${systemData.panel_age_years} years old`,
      urgency: 'medium'
    });
  }

  if (actions.length === 0) {
    actions.push({
      action: 'Maintain regular cleaning schedule',
      impact: 'Preventive maintenance recommended',
      urgency: 'low'
    });
  }

  return actions;
}
