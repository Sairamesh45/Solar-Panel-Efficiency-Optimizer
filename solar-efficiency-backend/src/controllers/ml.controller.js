const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Get ML model evaluation metrics and best model information
 */
exports.getModelMetrics = async (req, res, next) => {
  try {
    const mlResultPath = path.join(__dirname, '..', '..', '..', 'machine-learning', 'FINAL_MODEL_REPORT.json');
    
    // Check if file exists
    if (!fs.existsSync(mlResultPath)) {
      return res.status(404).json({
        success: false,
        message: 'ML model metrics not found. Please run the training script first.',
      });
    }

    // Read and parse the JSON file
    const mlData = JSON.parse(fs.readFileSync(mlResultPath, 'utf8'));

    return res.status(200).json({
      success: true,
      data: mlData,
    });
  } catch (error) {
    console.error('Error loading ML metrics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load ML model metrics',
      error: error.message,
    });
  }
};

/**
 * Predict solar power output using the trained ML model
 */
exports.predict = async (req, res, next) => {
  try {
    // TODO: Implement prediction using the saved model
    // This would require Python integration or a separate Python service
    res.status(501).json({ 
      success: false,
      message: 'Prediction endpoint not yet implemented. Use getModelMetrics for model information.' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to call Python ML service
 */
function callPythonService(scriptName, inputData) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '..', '..', '..', 'machine-learning', scriptName);
    
    const pythonProcess = spawn('python', [pythonScriptPath]);
    
    let outputData = '';
    let errorData = '';
    
    // Send input data via stdin
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
    
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python service failed: ${errorData}`));
      } else {
        try {
          const result = JSON.parse(outputData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

/**
 * Detect anomalies in sensor data
 * POST /api/ml/anomaly-detect
 * Body: { sensor_data: [{T2M: 25, ghi: 800, ...}, ...] }
 */
exports.detectAnomalies = async (req, res, next) => {
  try {
    const { sensor_data } = req.body;
    
    if (!sensor_data || !Array.isArray(sensor_data) || sensor_data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'sensor_data array is required'
      });
    }
    
    const result = await callPythonService('anomaly_detector.py', { sensor_data });
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        details: result
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to detect anomalies',
      error: error.message
    });
  }
};

/**
 * Predict maintenance needs based on panel conditions
 * POST /api/ml/maintenance-predict
 * Body: { panel_data: [{days_since_cleaning: 30, dust_level: 0.5, ...}, ...] }
 */
exports.predictMaintenance = async (req, res, next) => {
  try {
    const { panel_data } = req.body;
    
    if (!panel_data || !Array.isArray(panel_data) || panel_data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'panel_data array is required with at least days_since_cleaning field'
      });
    }
    
    const result = await callPythonService('maintenance_predictor.py', { panel_data });
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        details: result
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error predicting maintenance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to predict maintenance needs',
      error: error.message
    });
  }
};
