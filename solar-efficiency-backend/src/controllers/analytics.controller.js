const analyticsService = require('../services/analytics.service');
const reportService = require('../services/report.service');

/**
 * Generate analytics for a specific period
 */
exports.generateAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { panelId, startDate, endDate, systemCost, electricityTariff } = req.body;

    if (!panelId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Panel ID, start date, and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const analytics = await analyticsService.generateAnalytics(
      userId,
      panelId,
      start,
      end,
      systemCost || 0,
      electricityTariff || 6.5
    );

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Generate analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate analytics'
    });
  }
};

/**
 * Get analytics for user
 */
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { panelId, startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const analytics = await analyticsService.getAnalytics(userId, panelId, start, end);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics'
    });
  }
};

/**
 * Get cumulative analytics
 */
exports.getCumulativeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { panelId } = req.query;

    const cumulative = await analyticsService.getCumulativeAnalytics(userId, panelId);

    if (!cumulative) {
      return res.status(404).json({
        success: false,
        message: 'No analytics data found'
      });
    }

    res.status(200).json({
      success: true,
      data: cumulative
    });
  } catch (error) {
    console.error('Get cumulative analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cumulative analytics'
    });
  }
};

/**
 * Download PDF report
 */
exports.downloadPDFReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { panelId, startDate, endDate, systemCost, electricityTariff } = req.query;

    if (!panelId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Panel ID, start date, and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate or fetch analytics
    let analytics = await analyticsService.generateAnalytics(
      userId,
      panelId,
      start,
      end,
      systemCost || 0,
      electricityTariff || 6.5
    );

    // Generate PDF
    const pdfBuffer = await reportService.generatePDFReport(
      userId,
      panelId,
      start,
      end,
      analytics
    );

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=solar-analytics-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF report generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF report'
    });
  }
};

/**
 * Download Excel report
 */
exports.downloadExcelReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { panelId, startDate, endDate, systemCost, electricityTariff } = req.query;

    if (!panelId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Panel ID, start date, and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate or fetch analytics
    let analytics = await analyticsService.generateAnalytics(
      userId,
      panelId,
      start,
      end,
      systemCost || 0,
      electricityTariff || 6.5
    );

    // Generate Excel
    const excelBuffer = await reportService.generateExcelReport(
      userId,
      panelId,
      start,
      end,
      analytics
    );

    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=solar-analytics-${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Excel report generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Excel report'
    });
  }
};

/**
 * Get cost savings summary
 */
exports.getCostSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { panelId, startDate, endDate, systemCost, electricityTariff } = req.query;

    if (!panelId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Panel ID, start date, and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const costData = await analyticsService.calculateCostSavings(
      userId,
      panelId,
      start,
      end,
      systemCost || 0,
      electricityTariff || 6.5
    );

    res.status(200).json({
      success: true,
      data: costData
    });
  } catch (error) {
    console.error('Cost savings calculation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate cost savings'
    });
  }
};

/**
 * Get carbon footprint
 */
exports.getCarbonFootprint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { panelId, startDate, endDate } = req.query;

    if (!panelId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Panel ID, start date, and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // First get energy produced
    const costData = await analyticsService.calculateCostSavings(
      userId,
      panelId,
      start,
      end,
      0,
      6.5
    );

    const carbonData = await analyticsService.calculateCarbonFootprint(
      userId,
      panelId,
      start,
      end,
      costData.energyProduced.total
    );

    res.status(200).json({
      success: true,
      data: carbonData
    });
  } catch (error) {
    console.error('Carbon footprint calculation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate carbon footprint'
    });
  }
};
