// Assign installer to a maintenance request
exports.assignInstaller = async (id, installerId) => {
  return Maintenance.findByIdAndUpdate(
    id,
    { installerId, status: 'in_progress', $push: { statusTimeline: { status: 'in_progress', timestamp: new Date() } } },
    { new: true }
  );
};

// Schedule maintenance appointment with specific date/time
exports.scheduleAppointment = async (id, { scheduledDateTime, estimatedCompletionTime, notes }) => {
  const update = {};
  if (scheduledDateTime) update.scheduledDateTime = scheduledDateTime;
  if (estimatedCompletionTime) update.estimatedCompletionTime = estimatedCompletionTime;
  if (notes) {
    update.$push = { statusTimeline: { status: 'pending', timestamp: new Date(), notes } };
  }
  return Maintenance.findByIdAndUpdate(id, update, { new: true }).populate('panelId', 'name location');
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

// Add cost estimation to a maintenance request
exports.addCostEstimate = async (id, costData) => {
  const { laborCost, parts, notes } = costData;
  
  // Calculate parts cost
  let partsCost = 0;
  const partsWithTotal = (parts || []).map(part => {
    const totalPrice = part.quantity * part.unitPrice;
    partsCost += totalPrice;
    return { ...part, totalPrice };
  });
  
  const totalCost = (laborCost || 0) + partsCost;
  
  const update = {
    costEstimate: {
      laborCost: laborCost || 0,
      partsCost,
      totalCost,
      currency: costData.currency || 'INR',
      parts: partsWithTotal,
      estimatedAt: new Date(),
      notes
    }
  };
  
  return Maintenance.findByIdAndUpdate(id, update, { new: true }).populate('panelId', 'name location');
};
