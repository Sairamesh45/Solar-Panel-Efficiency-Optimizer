const Maintenance = require('../models/Maintenance.model');

exports.scheduleMaintenance = async ({ panelId, scheduledDate, type, notes, requested, handled }) => {
  const maintenance = new Maintenance({ panelId, scheduledDate, type, notes, requested, handled });
  await maintenance.save();
  return maintenance;
};

exports.getMaintenanceHistory = async (panelId) => {
  return Maintenance.find({ panelId }).sort({ scheduledDate: -1 });
};

exports.getPendingRequests = async () => {
  return Maintenance.find({ requested: true, handled: false }).sort({ createdAt: -1 });
};

exports.handleRequest = async (id) => {
  return Maintenance.findByIdAndUpdate(id, { handled: true }, { new: true });
};
