const fs = require('fs');
const path = require('path');

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
