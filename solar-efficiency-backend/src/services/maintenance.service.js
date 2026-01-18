// Assign installer to a maintenance request
exports.assignInstaller = async (id, installerId) => {
  return Maintenance.findByIdAndUpdate(
    id,
    { installerId, status: 'in_progress', $push: { statusTimeline: { status: 'in_progress', timestamp: new Date() } } },
    { new: true }
  );
};

// Installer updates status, notes, and photos
exports.updateMaintenanceStatus = async (id, { status, notes, photos }) => {
  const update = { status };
  if (notes) update.notes = notes;
  if (photos) update.photos = photos;
  return Maintenance.findByIdAndUpdate(
    id,
    {
      ...update,
      $push: { statusTimeline: { status, timestamp: new Date(), notes } }
    },
    { new: true }
  );
};
const Maintenance = require('../models/Maintenance.model');

exports.scheduleMaintenance = async ({ panelId, scheduledDate, type, notes, requested, handled }) => {
  const maintenance = new Maintenance({ panelId, scheduledDate, type, notes, requested, handled });
  await maintenance.save();
  return maintenance;
};

exports.getMaintenanceHistory = async (panelId) => {
  return Maintenance.find({ panelId }).sort({ scheduledDate: -1 });
};

// Get all maintenance requests for a user's panels
exports.getMaintenanceByUserId = async (userId) => {
  const SolarPanel = require('../models/SolarPanel.model');
  // First get all panels for this user
  const panels = await SolarPanel.find({ userId });
  const panelIds = panels.map(p => p._id);
  // Then get all maintenance requests for those panels
  return Maintenance.find({ panelId: { $in: panelIds } }).populate('panelId', 'name location').sort({ createdAt: -1 });
};

exports.getPendingRequests = async () => {
  return Maintenance.find({ requested: true, handled: false }).sort({ createdAt: -1 });
};


exports.handleRequest = async (id) => {
  return Maintenance.findByIdAndUpdate(id, { handled: true }, { new: true });
};

// Get assigned maintenance requests (example: assigned to installer and not completed)
exports.getAssignedRequests = async () => {
  // Adjust query as needed for your app logic
  return Maintenance.find({ installerId: { $exists: true, $ne: null }, status: { $ne: 'completed' } }).sort({ scheduledDate: -1 });
};
