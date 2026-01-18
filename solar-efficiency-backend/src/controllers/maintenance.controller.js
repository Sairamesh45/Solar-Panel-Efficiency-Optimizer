// Assign installer to a maintenance request
exports.assignInstaller = async (req, res, next) => {
  try {
    const { id, installerId } = req.body;
    if (!id || !installerId) {
      return res.status(400).json({ success: false, message: 'Missing id or installerId' });
    }
    const updated = await maintenanceService.assignInstaller(id, installerId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
const maintenanceService = require('../services/maintenance.service');

exports.scheduleMaintenance = async (req, res, next) => {
  try {
    const maintenance = await maintenanceService.scheduleMaintenance(req.body);
    res.status(201).json({ message: 'Maintenance scheduled', data: maintenance });
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceHistory = async (req, res, next) => {
  try {
    const { panelId } = req.query;
    const history = await maintenanceService.getMaintenanceHistory(panelId);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await maintenanceService.getPendingRequests();
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get maintenance requests for a specific user's panels
exports.getMyMaintenanceRequests = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    const requests = await maintenanceService.getMaintenanceByUserId(userId);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};


exports.handleRequest = async (req, res, next) => {
  try {
    const { id } = req.body;
    const updated = await maintenanceService.handleRequest(id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Fetch assigned requests for installer
exports.getAssignedRequests = async (req, res, next) => {
  try {
    const assignedRequests = await maintenanceService.getAssignedRequests();
    res.status(200).json({ success: true, data: assignedRequests });
  } catch (error) {
    next(error);
  }
};

// Update maintenance status (for installers)
exports.updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { id, status, notes, photos } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, message: 'Missing id or status' });
    }
    const updated = await maintenanceService.updateMaintenanceStatus(id, { status, notes, photos });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
