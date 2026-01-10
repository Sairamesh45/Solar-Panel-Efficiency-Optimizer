const mongoose = require('mongoose');

const SolarPanelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  location: { type: String },
  latitude: { type: Number, default: 19.07 }, // Default to Mumbai
  longitude: { type: Number, default: 72.87 }, // Default to Mumbai
  installationDate: { type: Date },
  specifications: {
    wattage: Number,
    brand: String
  }
}, { timestamps: true });

module.exports = mongoose.model('SolarPanel', SolarPanelSchema);
