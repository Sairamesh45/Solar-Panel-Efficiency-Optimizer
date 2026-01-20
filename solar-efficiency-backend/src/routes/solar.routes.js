const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { body, param } = require('express-validator');
const solarController = require('../controllers/solar.controller');

// Validation rules
const analyzeSolarValidation = [
  // Make city/state optional: coordinates (latitude/longitude) are required for analysis
  body('location.city').optional({ checkFalsy: true }).trim(),
  body('location.state').optional({ checkFalsy: true }).trim(),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  
  body('roof.area').isFloat({ min: 1 }).withMessage('Roof area must be positive'),
  body('roof.type').isIn(['flat', 'sloped']).withMessage('Roof type must be flat or sloped'),
  body('roof.tilt').isFloat({ min: 0, max: 90 }).withMessage('Tilt must be between 0-90 degrees'),
  body('roof.orientation').isIn(['north', 'south', 'east', 'west']).withMessage('Invalid orientation'),
  body('roof.shading').isIn(['none', 'partial', 'full']).withMessage('Invalid shading value'),
  
  body('energy.monthly_bill').isFloat({ min: 0 }).withMessage('Monthly bill must be positive'),
  body('energy.tariff').isFloat({ min: 0 }).withMessage('Tariff must be positive'),
  
  body('system.panel_age_years').isFloat({ min: 0 }).withMessage('Panel age must be positive'),
  body('system.last_cleaned_days_ago').isFloat({ min: 0 }).withMessage('Last cleaned days must be positive')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid analysis ID')
];

// Routes
router.post('/analyze', protect, analyzeSolarValidation, validate, solarController.analyzeSolarPanel);
router.get('/history', protect, solarController.getAnalysisHistory);
router.get('/analysis/:id', protect, idValidation, validate, solarController.getAnalysisById);
router.delete('/analysis/:id', protect, idValidation, validate, solarController.deleteAnalysis);

module.exports = router;
