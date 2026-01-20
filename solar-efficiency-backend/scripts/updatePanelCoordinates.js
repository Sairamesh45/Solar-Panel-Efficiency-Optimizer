const mongoose = require('mongoose');
const Panel = require('../src/models/SolarPanel.model');
const { MONGO_URI } = require('../src/config/env');

async function updatePanelCoordinates() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // First, let's see what we have
    const samplePanel = await Panel.findOne();
    console.log('Sample panel structure:', JSON.stringify(samplePanel, null, 2));

    // Update all panels that don't have coordinates
    const result = await Panel.updateMany(
      {
        $or: [
          { latitude: { $exists: false } },
          { longitude: { $exists: false } },
          { latitude: null },
          { longitude: null }
        ]
      },
      {
        $set: {
          latitude: 19.07,  // Mumbai coordinates
          longitude: 72.87
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} panels with default coordinates`);
    console.log(`Matched ${result.matchedCount} panels`);

    // Verify the update
    const updatedPanel = await Panel.findById(samplePanel._id);
    console.log('Updated panel:', JSON.stringify(updatedPanel, null, 2));

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePanelCoordinates();
