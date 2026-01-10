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

exports.handleRequest = async (req, res, next) => {
  try {
    const { id } = req.body;
    const updated = await maintenanceService.handleRequest(id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
