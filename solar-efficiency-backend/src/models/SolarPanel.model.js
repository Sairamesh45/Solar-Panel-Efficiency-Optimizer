const mongoose = require('mongoose');

const SolarPanelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  installationDate: { type: Date },
  specifications: {
    wattage: Number,
    brand: String
  }
}, { timestamps: true });

module.exports = mongoose.model('SolarPanel', SolarPanelSchema);
