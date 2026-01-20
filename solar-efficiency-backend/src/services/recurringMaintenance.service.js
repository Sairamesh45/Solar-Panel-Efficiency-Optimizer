const RecurringMaintenance = require('../models/RecurringMaintenance.model');
const Maintenance = require('../models/Maintenance.model');

// Create a new recurring maintenance schedule
exports.create = async (data) => {
  const { panelId, type, frequency, startDate, notes, createdBy } = data;
  
  const recurring = new RecurringMaintenance({
    panelId,
    type,
    frequency,
    startDate: new Date(startDate),
    nextDueDate: new Date(startDate),
    notes,
    createdBy
  });
  
  await recurring.save();
  return recurring.populate('panelId', 'name location');
};

// Get all recurring maintenance schedules
exports.getAll = async () => {
  return RecurringMaintenance.find()
    .populate('panelId', 'name location userId')
    .populate('createdBy', 'name email')
    .sort({ nextDueDate: 1 });
};

// Get recurring maintenance for a specific panel
exports.getByPanel = async (panelId) => {
  return RecurringMaintenance.find({ panelId })
    .populate('panelId', 'name location')
    .sort({ nextDueDate: 1 });
};

// Update a recurring maintenance schedule
exports.update = async (id, data) => {
  const update = { ...data, updatedAt: new Date() };
  
  // Recalculate next due date if frequency changes
  if (data.frequency || data.startDate) {
    const existing = await RecurringMaintenance.findById(id);
    if (existing) {
      const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
      update.nextDueDate = startDate;
    }
  }
  
  return RecurringMaintenance.findByIdAndUpdate(id, update, { new: true })
    .populate('panelId', 'name location');
};

// Delete a recurring maintenance schedule
exports.delete = async (id) => {
  return RecurringMaintenance.findByIdAndDelete(id);
};

// Toggle active status
exports.toggleActive = async (id) => {
  const recurring = await RecurringMaintenance.findById(id);
  if (!recurring) return null;
  
  recurring.isActive = !recurring.isActive;
  recurring.updatedAt = new Date();
  await recurring.save();
  
  return recurring.populate('panelId', 'name location');
};

// Generate maintenance requests for all due recurring schedules
exports.generateDueMaintenance = async () => {
  const now = new Date();
  const dueSchedules = await RecurringMaintenance.find({
    isActive: true,
    nextDueDate: { $lte: now }
  }).populate('panelId', 'name location');
  
  const generatedRequests = [];
  
  for (const schedule of dueSchedules) {
    // Create maintenance request
    const maintenance = new Maintenance({
      panelId: schedule.panelId._id,
      scheduledDate: schedule.nextDueDate,
      type: schedule.type,
      notes: `Auto-generated from recurring schedule: ${schedule.notes || ''}`,
      requested: false,
      handled: false,
      status: 'pending'
    });
    
    await maintenance.save();
    generatedRequests.push(maintenance);
    
    // Update next due date
    schedule.lastGeneratedDate = new Date();
    schedule.nextDueDate = schedule.calculateNextDueDate();
    schedule.updatedAt = new Date();
    await schedule.save();
  }
  
  return {
    generated: generatedRequests.length,
    requests: generatedRequests
  };
};

// Get upcoming schedules (next 30 days)
exports.getUpcoming = async (days = 30) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return RecurringMaintenance.find({
    isActive: true,
    nextDueDate: { $gte: now, $lte: futureDate }
  })
    .populate('panelId', 'name location')
    .sort({ nextDueDate: 1 });
};
