const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Fetch 7-day weather forecast from Open-Meteo API
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} systemCapacityKw - System capacity in kW
 * @returns {Promise<Object>} Weather forecast with solar predictions
 */
async function getWeatherForecast(latitude, longitude, systemCapacityKw = 5) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,shortwave_radiation_sum,sunrise,sunset&hourly=temperature_2m,shortwave_radiation,cloudcover,precipitation_probability&timezone=auto`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const { daily, hourly, timezone } = response.data;
    
    if (!daily || !daily.time) {
      throw new Error('Invalid weather data received');
    }

    const forecast = [];
    let bestDay = { index: -1, output: 0, date: '' };
    let worstDay = { index: -1, output: Infinity, date: '' };

    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const date = daily.time[i];
      const maxTemp = daily.temperature_2m_max[i];
      const minTemp = daily.temperature_2m_min[i];
      const precipitation = daily.precipitation_sum[i] || 0;
      const precipProb = daily.precipitation_probability_max[i] || 0;
      const weatherCode = daily.weathercode[i];
      const solarRadiation = daily.shortwave_radiation_sum[i] || 0; // MJ/m²
      
      // Convert MJ/m² to kWh/m² (1 MJ = 0.2778 kWh)
      const solarRadiationKwh = solarRadiation * 0.2778;
      
      // Estimate daily energy output (18% panel efficiency, 85% system efficiency)
      const dailyOutput = solarRadiationKwh * systemCapacityKw * 0.18 * 0.85;
      
      const weatherCondition = getWeatherCondition(weatherCode);
      const cloudiness = getAverageCloudCover(hourly, date);
      const insights = generateDayInsights(weatherCondition, cloudiness, precipitation, precipProb, dailyOutput, maxTemp, i);

      const dayData = {
        date,
        dayName: getDayName(date),
        weather: weatherCondition,
        temperatureMax: Math.round(maxTemp),
        temperatureMin: Math.round(minTemp),
        precipitation,
        precipitationProbability: Math.round(precipProb),
        cloudCover: Math.round(cloudiness),
        estimatedOutput: Math.round(dailyOutput * 100) / 100,
        solarRadiation: Math.round(solarRadiation * 100) / 100,
        insights
      };

      forecast.push(dayData);

      if (dailyOutput > bestDay.output) {
        bestDay = { index: i, output: dailyOutput, date: dayData.dayName };
      }
      if (dailyOutput < worstDay.output) {
        worstDay = { index: i, output: dailyOutput, date: dayData.dayName };
      }
    }

    const weeklyRecommendations = generateWeeklyRecommendations(forecast, bestDay, worstDay, systemCapacityKw);

    return {
      success: true,
      location: { latitude, longitude, timezone },
      forecast,
      summary: {
        totalEstimatedOutput: forecast.reduce((sum, day) => sum + day.estimatedOutput, 0),
        averageDailyOutput: forecast.reduce((sum, day) => sum + day.estimatedOutput, 0) / forecast.length,
        bestDay: bestDay.date,
        worstDay: worstDay.date,
        rainyDays: forecast.filter(d => d.precipitation > 1).length,
        cloudyDays: forecast.filter(d => d.cloudCover > 60).length
      },
      recommendations: weeklyRecommendations
    };

  } catch (error) {
    logger.error('Error fetching weather forecast:', error.message);
    throw new Error('Failed to fetch weather forecast: ' + error.message);
  }
}

function getAverageCloudCover(hourly, date) {
  if (!hourly || !hourly.time || !hourly.cloudcover) return 50;
  
  const dayHours = hourly.time
    .map((time, idx) => ({ time, cloudcover: hourly.cloudcover[idx] }))
    .filter(item => item.time.startsWith(date) && item.cloudcover != null);
  
  if (dayHours.length === 0) return 50;
  return dayHours.reduce((sum, item) => sum + item.cloudcover, 0) / dayHours.length;
}

function getWeatherCondition(code) {
  const weatherCodes = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
    61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 73: 'Snow',
    75: 'Heavy Snow', 80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with Hail'
  };
  return weatherCodes[code] || 'Unknown';
}

function getDayName(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function generateDayInsights(weatherCondition, cloudiness, precipitation, precipProb, dailyOutput, maxTemp, dayIndex) {
  const insights = [];
  
  if (cloudiness < 20 && precipitation === 0) {
    insights.push({ type: 'success', icon: '☀️', message: 'Excellent solar conditions! Peak production expected.' });
  }
  
  if (precipitation > 5 || precipProb > 70) {
    insights.push({ type: 'info', icon: '🌧️', message: 'Rain expected - natural panel cleaning!' });
  }
  
  if (cloudiness > 70) {
    const reduction = Math.round((cloudiness / 100) * 40);
    insights.push({ type: 'warning', icon: '☁️', message: `Heavy clouds - expect ${reduction}% less output.` });
  }
  
  if (maxTemp > 40) {
    insights.push({ type: 'warning', icon: '🌡️', message: 'High temperature may reduce panel efficiency.' });
  }
  
  if (dailyOutput < 5 && dayIndex < 3) {
    insights.push({ type: 'alert', icon: '⚠️', message: 'Consider grid backup or battery charging beforehand.' });
  }
  
  return insights;
}

function generateWeeklyRecommendations(forecast, bestDay, worstDay, systemCapacityKw) {
  const recommendations = [];
  
  if (bestDay.index !== -1) {
    recommendations.push({
      priority: 'high', type: 'optimization', icon: '🔋',
      title: 'Peak Production Day',
      message: `${bestDay.date} will be your best day! Consider charging batteries or running high-power appliances during peak hours (10 AM - 3 PM).`,
      action: 'Plan energy-intensive tasks'
    });
  }
  
  if (worstDay.index !== -1 && worstDay.output < systemCapacityKw * 3) {
    recommendations.push({
      priority: 'medium', type: 'backup', icon: '⚡',
      title: 'Low Output Alert',
      message: `${worstDay.date} expects poor conditions. Ensure grid backup is available or charge batteries in advance.`,
      action: 'Prepare backup power'
    });
  }
  
  const rainyDays = forecast.filter(d => d.precipitation > 5);
  if (rainyDays.length > 0) {
    recommendations.push({
      priority: 'low', type: 'maintenance', icon: '🧼',
      title: 'Natural Cleaning Expected',
      message: `Rain on ${rainyDays[0].dayName} will help clean your panels. Expect improved efficiency afterwards!`,
      action: 'Monitor post-rain performance'
    });
  }
  
  const cloudyStretch = findCloudyStretch(forecast);
  if (cloudyStretch.length >= 3) {
    const days = cloudyStretch.map(d => d.dayName).join(', ');
    const avgReduction = Math.round(cloudyStretch.reduce((sum, d) => sum + d.cloudCover, 0) / cloudyStretch.length / 2);
    recommendations.push({
      priority: 'high', type: 'alert', icon: '☁️',
      title: 'Extended Cloudy Period',
      message: `Heavy clouds expected ${days}. Anticipate ${avgReduction}% reduced output. Consider grid reliance.`,
      action: 'Adjust energy usage plans'
    });
  }
  
  const highOutputDays = forecast.filter(d => d.estimatedOutput > systemCapacityKw * 4);
  if (highOutputDays.length >= 2) {
    recommendations.push({
      priority: 'medium', type: 'optimization', icon: '🔌',
      title: 'Battery Charging Strategy',
      message: `Multiple high-output days ahead. Maximize battery charging on ${highOutputDays[0].dayName} and ${highOutputDays[1].dayName}.`,
      action: 'Optimize storage schedule'
    });
  }
  
  return recommendations;
}

function findCloudyStretch(forecast) {
  let stretch = [];
  let currentStretch = [];
  
  for (const day of forecast) {
    if (day.cloudCover > 60) {
      currentStretch.push(day);
    } else {
      if (currentStretch.length > stretch.length) stretch = [...currentStretch];
      currentStretch = [];
    }
  }
  
  if (currentStretch.length > stretch.length) stretch = [...currentStretch];
  return stretch;
}

module.exports = { getWeatherForecast };
