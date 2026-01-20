const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const SensorData = require('../src/models/SensorData.model');
const SolarPanel = require('../src/models/SolarPanel.model');

/**
 * Generate realistic sensor data for the past N days
 * This is useful for testing the trends analysis feature
 */
const generateHistoricalSensorData = async (panelId, days = 30) => {
  const data = [];
  const now = new Date();
  const baseEfficiency = 18;
  let cumulativeDust = 15; // Start with some dust

  for (let dayOffset = days; dayOffset >= 0; dayOffset--) {
    // Generate 4-6 readings per day (representing daytime hours)
    const readingsPerDay = 4 + Math.floor(Math.random() * 3);
    
    for (let reading = 0; reading < readingsPerDay; reading++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - dayOffset);
      timestamp.setHours(8 + reading * 2, Math.floor(Math.random() * 60), 0, 0);

      // Simulate realistic solar panel behavior
      const hour = timestamp.getHours();
      const hourFromNoon = Math.abs(hour - 12);
      
      // Irradiance peaks at noon
      const baseIrradiance = Math.max(0, 1000 - (hourFromNoon * 120));
      const irradiance = baseIrradiance + (Math.random() - 0.5) * 200;
      
      // Temperature varies with time of day
      const baseTemp = 25 + (irradiance / 80);
      const temperature = baseTemp + (Math.random() - 0.5) * 10;
      
      // Dust accumulates slowly, with occasional resets (cleaning)
      if (Math.random() < 0.03) { // 3% chance of cleaning
        cumulativeDust = 5 + Math.random() * 10;
      } else {
        cumulativeDust = Math.min(80, cumulativeDust + Math.random() * 0.5);
      }
      
      // Shading varies
      const shading = Math.random() * 25;
      
      // Calculate power based on conditions
      const voltage = irradiance > 0 ? 30 + (Math.random() - 0.5) * 8 : 0;
      const current = irradiance > 0 ? (irradiance / 30) + (Math.random() - 0.5) * 5 : 0;
      const power = Math.max(0, voltage * current);
      
      // Calculate efficiency with realistic losses
      const tempLoss = Math.max(0, (temperature - 25)) * 0.4;
      const dustLoss = cumulativeDust * 0.08;
      const shadingLoss = shading * 0.3;
      const efficiency = Math.max(5, baseEfficiency - (tempLoss + dustLoss + shadingLoss) / 8 + (Math.random() - 0.5) * 3);

      data.push({
        panelId,
        timestamp,
        temperature: Math.round(temperature * 100) / 100,
        voltage: Math.round(voltage * 100) / 100,
        current: Math.round(Math.max(0, current) * 100) / 100,
        power: Math.round(power * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        irradiance: Math.round(Math.max(0, irradiance) * 100) / 100,
        dust: Math.round(cumulativeDust * 100) / 100,
        tilt: 30,
        shading: Math.round(shading * 100) / 100
      });
    }
  }

  return data;
};

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all panels
    const panels = await SolarPanel.find({});
    
    if (panels.length === 0) {
      console.log('No panels found in the database. Please create panels first.');
      process.exit(1);
    }

    console.log(`Found ${panels.length} panels`);
    
    let totalCreated = 0;

    for (const panel of panels) {
      // Check existing data count
      const existingCount = await SensorData.countDocuments({ panelId: panel._id });
      console.log(`Panel "${panel.name}" has ${existingCount} existing sensor readings`);

      // Generate 30 days of historical data
      const sensorData = await generateHistoricalSensorData(panel._id, 30);
      
      // Insert in batches for efficiency
      if (sensorData.length > 0) {
        await SensorData.insertMany(sensorData);
        totalCreated += sensorData.length;
        console.log(`Generated ${sensorData.length} sensor readings for panel "${panel.name}"`);
      }
    }

    console.log(`\n✅ Successfully created ${totalCreated} sensor data records for ${panels.length} panels`);
    console.log('The System Trends feature should now display real data.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sensor data:', error);
    process.exit(1);
  }
};

seed();
