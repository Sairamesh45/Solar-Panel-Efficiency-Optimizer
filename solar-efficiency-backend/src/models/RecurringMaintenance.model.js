const mongoose = require('mongoose');

const RecurringMaintenanceSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel', required: true },
  type: { type: String, enum: ['cleaning', 'inspection', 'repair'], required: true },
  frequency: { 
    type: String, 
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'biannually', 'annually'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  nextDueDate: { type: Date, required: true },
  lastGeneratedDate: { type: Date },
  notes: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate next due date based on frequency
RecurringMaintenanceSchema.methods.calculateNextDueDate = function(fromDate) {
  const date = new Date(fromDate || this.nextDueDate);
  switch (this.frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'biannually':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
};

module.exports = mongoose.model('RecurringMaintenance', RecurringMaintenanceSchema);
