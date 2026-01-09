const mongoose = require('mongoose');

const solarRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputData: {
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    roof: {
      area: { type: Number, required: true },
      type: { type: String, enum: ['flat', 'sloped'], required: true },
      tilt: { type: Number, required: true },
      orientation: { type: String, enum: ['north', 'south', 'east', 'west'], required: true },
      shading: { type: String, enum: ['none', 'partial', 'full'], required: true }
    },
    energy: {
      monthly_bill: { type: Number, required: true },
      tariff: { type: Number, required: true }
    },
    system: {
      panel_age_years: { type: Number, required: true },
      last_cleaned_days_ago: { type: Number, required: true }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SolarRequest', solarRequestSchema);
