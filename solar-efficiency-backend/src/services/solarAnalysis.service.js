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
 * Convert orientation string to azimuth degrees
 */
function parseAzimuthFromOrientation(orientation) {
  const orientationMap = {
    'N': 0,
    'north': 0,
    'NE': 45,
    'E': 90,
    'east': 90,
    'SE': 135,
    'S': 180,
    'south': 180,
    'SW': 225,
    'W': 270,
    'west': 270,
    'NW': 315
  };
  return orientationMap[orientation] || 180; // Default to south
}

/**
 * Main analysis function
 * Orchestrates: Data formatting → ML call → Response transformation
 */
exports.performAnalysis = async (inputData) => {
  // 1. Format data for ML model
  const mlPayload = formatForML(inputData);
  
  // 2. Call ML model
  const mlResponse = await callMLModel(mlPayload);
  
  // 3. Transform ML response to judge-friendly format
  return transformMLResponse(mlResponse, inputData);
};

/**
 * Call ML Model (MOCK for hackathon)
 * Replace this with actual ML API call when ready
 */
async function callMLModel(payload) {
  try {
    console.log('Calling ML model with payload:', JSON.stringify(payload, null, 2));
    
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Path to Python prediction service
    const pythonScriptPath = path.join(__dirname, '..', '..', '..', 'machine-learning', 'predict_service.py');
    
    // Prepare input data for ML model
    const mlInput = {
      location: {
        latitude: payload.lat || payload.latitude || 40.79,
        longitude: payload.lon || payload.longitude || -73.95
      },
      roof: {
        area: payload.roof_area || 50,
        tilt: payload.tilt || 30,
        azimuth: parseAzimuthFromOrientation(payload.orientation) || 180
      },
      energy: {
        monthly_consumption: payload.monthly_kwh || payload.monthly_consumption || 500
      },
      system: {
        capacity_kw: (payload.roof_area * PANEL_POWER_PER_SQM) / 1000 || 5,
        panel_age_years: payload.panel_age || 0,
        days_since_cleaning: payload.days_since_cleaning || 0
      }
    };
    
    // Call Python service
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [pythonScriptPath]);
      
      let outputData = '';
      let errorData = '';
      
      // Send input data to Python script via stdin
      pythonProcess.stdin.write(JSON.stringify(mlInput));
      pythonProcess.stdin.end();
      
      // Collect output
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python service error:', errorData);
          // Fallback to mock data if Python service fails
          resolve(getFallbackMLResponse(payload));
        } else {
          try {
            const result = JSON.parse(outputData);
            if (result.success) {
              // Transform ML output to expected format
              const systemSizeKw = mlInput.system.capacity_kw;
              resolve({
                recommended_system_kw: systemSizeKw,
                expected_annual_generation_kwh: result.predictions.annual.energy_kwh,
                efficiency_loss_percent: 100 - result.predictions.efficiency.system_efficiency_percent,
                loss_breakdown: {
                  dust: Math.min((payload.days_since_cleaning / 30) * 1.5, 8),
                  shading: { 'none': 0, 'partial': 6, 'full': 15 }[payload.shading] || 0,
                  age: (payload.panel_age || 0) * 0.5,
                  temperature: 5
                },
                maintenance_alert: (payload.days_since_cleaning > 30) ? "Cleaning recommended" : "System operating normally",
                estimated_savings_per_year: result.predictions.financial.annual_savings_inr,
                ml_predictions: result.predictions,
                ml_model_info: result.model_info
              });
            } else {
              console.error('ML prediction failed:', result.error);
              resolve(getFallbackMLResponse(payload));
            }
          } catch (error) {
            console.error('Error parsing ML output:', error);
            resolve(getFallbackMLResponse(payload));
          }
        }
      });
    });
    
  } catch (error) {
    console.error('Error calling ML model:', error);
    return getFallbackMLResponse(payload);
  }
}

/**
 * Fallback response when ML service unavailable
 */
function getFallbackMLResponse(payload) {
  const systemSizeKw = (payload.roof_area * PANEL_POWER_PER_SQM) / 1000;
  
  // Location-based solar irradiance
  const lat = Math.abs(payload.lat || 0);
  let peakSunHours = 5.5; // Default
  if (lat < 15) peakSunHours = 6.0;      // Tropical
  else if (lat < 30) peakSunHours = 5.5; // Subtropical
  else if (lat < 45) peakSunHours = 4.5; // Temperate
  else peakSunHours = 3.5;               // High latitude
  
  // System degradation
  const ageFactor = 1.0 - ((payload.panel_age || 0) * 0.005);
  const cleaningFactor = 1.0 - Math.min((payload.days_since_cleaning || 0) / 90.0, 0.15);
  
  // Orientation efficiency
  const tilt = payload.tilt || 30;
  const optimalTilt = lat;
  const tiltEfficiency = 1.0 - Math.abs(tilt - optimalTilt) / 90.0;
  
  // Parse orientation to azimuth
  const orientationMap = { 'N': 0, 'north': 0, 'E': 90, 'east': 90, 'S': 180, 'south': 180, 'W': 270, 'west': 270 };
  const azimuth = orientationMap[payload.orientation] || 180;
  const azimuthEfficiency = 1.0 - Math.abs(azimuth - 180) / 180.0 * 0.2;
  
  // Combined efficiency
  const combinedEfficiency = tiltEfficiency * azimuthEfficiency * ageFactor * cleaningFactor;
  
  // Annual generation
  const annualGeneration = systemSizeKw * peakSunHours * 365 * combinedEfficiency;
  
  // Loss breakdown
  const dustLoss = Math.min((payload.days_since_cleaning / 30) * 1.5, 8);
  const shadingLossMap = { 'none': 0, 'partial': 6, 'full': 15 };
  const shadingLoss = shadingLossMap[payload.shading] || 0;
  const ageLoss = payload.panel_age * 0.5;
  const tempLoss = 5;
  const orientationLoss = (1 - azimuthEfficiency) * 20;
  const tiltLoss = (1 - tiltEfficiency) * 10;
  const totalLoss = dustLoss + shadingLoss + ageLoss + tempLoss + orientationLoss + tiltLoss;
  
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
      temperature: tempLoss,
      orientation: parseFloat(orientationLoss.toFixed(1)),
      tilt: parseFloat(tiltLoss.toFixed(1))
    },
    maintenance_alert: maintenanceAlert,
    estimated_savings_per_year: parseFloat((annualGeneration * 6.5).toFixed(0)),
    ml_model_info: { 
      model_name: "Fallback Model", 
      note: "ML service unavailable - using simplified calculations",
      peak_sun_hours: peakSunHours,
      combined_efficiency: parseFloat(combinedEfficiency.toFixed(3))
    }
  };
}

/**
 * Transform ML response to frontend-friendly format
 */
function transformMLResponse(mlData, originalInput) {
  const majorIssues = identifyMajorIssues(mlData.loss_breakdown);
  const paybackYears = calculatePayback(mlData.recommended_system_kw, mlData.estimated_savings_per_year);
  const priority = getMaintenancePriority(mlData.efficiency_loss_percent);
  
  // Calculate detailed costs
  const systemSizeKw = mlData.recommended_system_kw;
  let costPerKw;
  if (systemSizeKw <= 3) costPerKw = 75000;
  else if (systemSizeKw <= 10) costPerKw = 65000;
  else costPerKw = 55000;
  
  const grossCost = systemSizeKw * costPerKw;
  
  // Calculate subsidy
  let subsidy = 0;
  if (systemSizeKw <= 3) {
    subsidy = grossCost * 0.40;
  } else if (systemSizeKw <= 10) {
    subsidy = (3 * costPerKw * 0.40) + ((systemSizeKw - 3) * costPerKw * 0.20);
  } else {
    subsidy = (3 * costPerKw * 0.40) + (7 * costPerKw * 0.20);
  }
  
  const netCost = grossCost - subsidy;
  
  const response = {
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
      lifetime_savings_10yr: Math.round(mlData.estimated_savings_per_year * 10), // 10yr for ROI calculation
      lifetime_savings_25yr: Math.round(mlData.estimated_savings_per_year * 25), // 25yr lifespan
      system_cost: {
        gross_cost_inr: Math.round(grossCost),
        subsidy_inr: Math.round(subsidy),
        net_cost_inr: Math.round(netCost),
        cost_per_kw: costPerKw
      }
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
      model_version: mlData.ml_model_info?.model_version || '1.0.0',
      model_name: mlData.ml_model_info?.model_name || 'Unknown'
    }
  };
  
  // Include detailed ML predictions if available
  if (mlData.ml_predictions) {
    response.mlPredictions = {
      instantaneous: mlData.ml_predictions.instantaneous,
      daily: mlData.ml_predictions.daily,
      annual: mlData.ml_predictions.annual,
      efficiency: mlData.ml_predictions.efficiency,
      financial: mlData.ml_predictions.financial
    };
    
    response.modelInfo = {
      name: mlData.ml_model_info.model_name,
      version: mlData.ml_model_info.model_version,
      accuracy: {
        r2_score: mlData.ml_model_info.accuracy_r2,
        mape_percent: mlData.ml_model_info.mape_percent
      },
      trained_on: mlData.ml_model_info.trained_on
    };
  }
  
  return response;
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
