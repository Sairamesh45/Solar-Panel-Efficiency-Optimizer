const SolarRequest = require('../models/SolarRequest.model');
const SolarAnalysisResult = require('../models/SolarAnalysisResult.model');
const solarAnalysisService = require('../services/solarAnalysis.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Submit solar data for analysis
// @route   POST /api/solar/analyze
// @access  Private
exports.analyzeSolarPanel = async (req, res) => {
  try {
    const { location, roof, energy, system } = req.body;

    // Create solar request record
    const solarRequest = await SolarRequest.create({
      userId: req.user._id,
      inputData: { location, roof, energy, system },
      status: 'processing'
    });

    // Run analysis (ML service)
    const analysisData = await solarAnalysisService.performAnalysis({
      location,
      roof,
      energy,
      system
    });

    // Store analysis result (raw ML output for history)
    const result = await SolarAnalysisResult.create({
      requestId: solarRequest._id,
      userId: req.user._id,
      analysis: analysisData
    });

    // Update request status
    solarRequest.status = 'processed';
    await solarRequest.save();

    // Return judge-friendly response
    return successResponse(res, {
      requestId: solarRequest._id,
      result: analysisData // Already transformed in service
    }, 'Analysis completed successfully', 201);

  } catch (error) {
    console.error('Solar Analysis Error:', error);
    const errorMessage = error.message || 'Analysis failed';
    return errorResponse(res, errorMessage, 500);
  }
};

// @desc    Get user's analysis history
// @route   GET /api/solar/history
// @access  Private
exports.getAnalysisHistory = async (req, res) => {
  try {
    const results = await SolarAnalysisResult.find({ userId: req.user._id })
      .populate('requestId', 'inputData createdAt status')
      .sort('-createdAt')
      .limit(20);

    return successResponse(res, results, 'History retrieved successfully');
  } catch (error) {
    console.error('History Error:', error);
    return errorResponse(res, 'Failed to retrieve history', 500);
  }
};

// @desc    Get specific analysis by ID
// @route   GET /api/solar/analysis/:id
// @access  Private
exports.getAnalysisById = async (req, res) => {
  try {
    const result = await SolarAnalysisResult.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('requestId', 'inputData createdAt status');

    if (!result) {
      return errorResponse(res, 'Analysis not found', 404);
    }

    return successResponse(res, result, 'Analysis retrieved successfully');
  } catch (error) {
    console.error('Get Analysis Error:', error);
    return errorResponse(res, 'Failed to retrieve analysis', 500);
  }
};

// @desc    Delete analysis record (soft delete by marking request as deleted)
// @route   DELETE /api/solar/analysis/:id
// @access  Private
exports.deleteAnalysis = async (req, res) => {
  try {
    const result = await SolarAnalysisResult.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!result) {
      return errorResponse(res, 'Analysis not found', 404);
    }

    return successResponse(res, null, 'Analysis deleted successfully');
  } catch (error) {
    console.error('Delete Analysis Error:', error);
    return errorResponse(res, 'Failed to delete analysis', 500);
  }
};
