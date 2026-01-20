const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel', required: true },
  scheduledDate: { type: Date, required: true },
  type: { type: String, enum: ['cleaning', 'inspection', 'repair'], required: true },
  notes: String,
  completed: { type: Boolean, default: false },
  requested: { type: Boolean, default: false }, // true if requested by customer
  handled: { type: Boolean, default: false }, // true if installer has accepted/handled
  installerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assigned installer
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  statusTimeline: [
    {
      status: { type: String, enum: ['pending', 'in_progress', 'completed'] },
      timestamp: { type: Date, default: Date.now },
      notes: String
    }
  ],
  photos: [String], // URLs or file paths to uploaded photos
  // Technician assignment & scheduling
  scheduledDateTime: Date, // Specific date and time for the appointment
  estimatedCompletionTime: Date, // Expected completion time (ETA)
  actualCompletionTime: Date, // When it was actually completed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
