const mongoose = require('mongoose');
const SensorData = require('../src/models/SensorData.model');
const SolarPanel = require('../src/models/SolarPanel.model');
require('dotenv').config();

const generateSampleSensorData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all panels
    const panels = await SolarPanel.find();
    
    if (panels.length === 0) {
      console.log('No panels found. Please create panels first.');
      process.exit(0);
    }

    console.log(`Found ${panels.length} panels. Generating sensor data...`);

    // Generate data for last 60 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);

    let totalRecordsCreated = 0;

    for (const panel of panels) {
      const panelCapacity = panel.specifications?.wattage || 400; // Default 400W
      
      // Generate hourly data for each day
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Generate data for daylight hours (6 AM to 6 PM)
        for (let hour = 6; hour <= 18; hour++) {
          const timestamp = new Date(d);
          timestamp.setHours(hour, 0, 0, 0);

          // Skip if timestamp is in the future
          if (timestamp > new Date()) continue;

          // Calculate power output based on time of day (peak at noon)
          const hourFromNoon = Math.abs(hour - 12);
          const solarIntensity = Math.max(0, 1 - (hourFromNoon / 6)); // Peak at noon
          
          // Add some randomness
          const randomFactor = 0.85 + (Math.random() * 0.3); // 85-115%
          const cloudFactor = Math.random() > 0.2 ? 1 : 0.3; // 20% chance of clouds
          
          const powerOutput = panelCapacity * solarIntensity * randomFactor * cloudFactor;
          
          // Calculate efficiency (typical 15-20%)
          const efficiency = 15 + (Math.random() * 5);
          
          // Other sensor readings
          const temperature = 25 + (Math.random() * 15) + (hourFromNoon * 2); // Hotter midday
          const dust = Math.random() * 30; // 0-30 dust level
          const shading = Math.random() * 10; // 0-10% shading
          const humidity = 40 + (Math.random() * 30); // 40-70%
          
          const sensorData = new SensorData({
            panelId: panel._id,
            timestamp,
            powerOutput: parseFloat(powerOutput.toFixed(2)),
            efficiency: parseFloat(efficiency.toFixed(2)),
            temperature: parseFloat(temperature.toFixed(1)),
            dust: parseFloat(dust.toFixed(1)),
            shading: parseFloat(shading.toFixed(1)),
            humidity: parseFloat(humidity.toFixed(1))
          });

          await sensorData.save();
          totalRecordsCreated++;
        }
      }
      
      console.log(`Generated sensor data for panel: ${panel.name}`);
    }

    console.log(`\n✅ Successfully created ${totalRecordsCreated} sensor data records`);
    console.log(`📊 Data range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error generating sensor data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

generateSampleSensorData();
