import React, { useState, useEffect } from 'react';
import { getWeatherForecast } from '../../api/weather.api';
import '../../styles/WeatherForecast.css';

const WeatherForecast = ({ panelId = null }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherForecast();
  }, [panelId]);

  const fetchWeatherForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWeatherForecast(panelId);
      if (response.success) {
        setForecast(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load weather forecast');
      console.error('Weather forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weather) => {
    const iconMap = {
      'Clear Sky': '☀️', 'Mainly Clear': '🌤️', 'Partly Cloudy': '⛅',
      'Overcast': '☁️', 'Foggy': '🌫️', 'Light Drizzle': '🌦️',
      'Drizzle': '🌧️', 'Heavy Drizzle': '🌧️', 'Light Rain': '🌦️',
      'Rain': '🌧️', 'Heavy Rain': '⛈️', 'Light Snow': '🌨️',
      'Snow': '❄️', 'Heavy Snow': '❄️', 'Light Showers': '🌦️',
      'Showers': '🌧️', 'Heavy Showers': '⛈️', 'Thunderstorm': '⛈️',
      'Thunderstorm with Hail': '⛈️'
    };
    return iconMap[weather] || '🌥️';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return colorMap[priority] || '#6b7280';
  };

  const getInsightStyle = (type) => {
    const styles = {
      'success': { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#10b981' },
      'info': { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#3b82f6' },
      'warning': { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#f59e0b' },
      'alert': { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' }
    };
    return styles[type] || styles.info;
  };

  if (loading) {
    return (
      <div className="weather-forecast-container">
        <div className="forecast-loading">
          <div className="spinner"></div>
          <p>Loading 7-day weather forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-forecast-container">
        <div className="forecast-error">
          <span className="error-icon">⚠️</span>
          <h3>Unable to Load Forecast</h3>
          <p>{error}</p>
          <button onClick={fetchWeatherForecast} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <div className="weather-forecast-container">
      <div className="forecast-header">
        <div className="header-title">
          <h2>🌤️ This Week's Solar Outlook</h2>
          <p className="header-subtitle">
            7-day weather forecast for {forecast.panel?.location?.city || 'your location'}
          </p>
        </div>
        <button onClick={fetchWeatherForecast} className="refresh-btn" title="Refresh forecast">
          🔄
        </button>
      </div>

      {/* Summary Cards */}
      <div className="forecast-summary">
        <div className="summary-card">
          <div className="summary-icon">⚡</div>
          <div className="summary-content">
            <p className="summary-label">Total Estimated Output</p>
            <p className="summary-value">{forecast.summary.totalEstimatedOutput.toFixed(1)} kWh</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <p className="summary-label">Daily Average</p>
            <p className="summary-value">{forecast.summary.averageDailyOutput.toFixed(1)} kWh</p>
          </div>
        </div>

        <div className="summary-card highlight">
          <div className="summary-icon">🌟</div>
          <div className="summary-content">
            <p className="summary-label">Best Day</p>
            <p className="summary-value">{forecast.summary.bestDay}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <p className="summary-label">Worst Day</p>
            <p className="summary-value">{forecast.summary.worstDay}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {forecast.recommendations && forecast.recommendations.length > 0 && (
        <div className="forecast-recommendations">
          <h3>🎯 Smart Recommendations</h3>
          <div className="recommendations-grid">
            {forecast.recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className="recommendation-card"
                style={{ borderLeftColor: getPriorityColor(rec.priority) }}
              >
                <div className="rec-header">
                  <span className="rec-icon">{rec.icon}</span>
                  <span 
                    className="rec-priority"
                    style={{ backgroundColor: getPriorityColor(rec.priority) }}
                  >
                    {rec.priority}
                  </span>
                </div>
                <h4 className="rec-title">{rec.title}</h4>
                <p className="rec-message">{rec.message}</p>
                <div className="rec-action">
                  <span className="action-label">Action:</span>
                  <span className="action-text">{rec.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Forecast */}
      <div className="daily-forecast-section">
        <h3>📅 7-Day Detailed Forecast</h3>
        <div className="daily-forecast-grid">
          {forecast.forecast.map((day, idx) => (
            <div 
              key={idx} 
              className={`forecast-day-card ${day.dayName === 'Today' ? 'today' : ''}`}
            >
              <div className="day-header">
                <h4>{day.dayName}</h4>
                <p className="day-date">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>

              <div className="day-weather">
                <span className="weather-icon-large">{getWeatherIcon(day.weather)}</span>
                <p className="weather-condition">{day.weather}</p>
              </div>

              <div className="day-temp">
                <span className="temp-max">{day.temperatureMax}°</span>
                <span className="temp-divider">/</span>
                <span className="temp-min">{day.temperatureMin}°</span>
              </div>

              <div className="day-stats">
                <div className="stat-row">
                  <span className="stat-label">☁️ Cloud Cover:</span>
                  <span className="stat-value">{day.cloudCover}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">🌧️ Rain Chance:</span>
                  <span className="stat-value">{day.precipitationProbability}%</span>
                </div>
                {day.precipitation > 0 && (
                  <div className="stat-row">
                    <span className="stat-label">💧 Rainfall:</span>
                    <span className="stat-value">{day.precipitation.toFixed(1)} mm</span>
                  </div>
                )}
              </div>

              <div className="day-output">
                <div className="output-label">Estimated Output</div>
                <div className="output-value">{day.estimatedOutput.toFixed(1)} kWh</div>
                <div className="output-bar">
                  <div 
                    className="output-fill"
                    style={{ 
                      width: `${Math.min(100, (day.estimatedOutput / (forecast.panel?.capacity || 5) / 5) * 100)}%`,
                      background: day.estimatedOutput > 20 ? '#10b981' : day.estimatedOutput > 10 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
              </div>

              {/* Day-specific insights */}
              {day.insights && day.insights.length > 0 && (
                <div className="day-insights">
                  {day.insights.map((insight, iIdx) => {
                    const style = getInsightStyle(insight.type);
                    return (
                      <div 
                        key={iIdx} 
                        className="insight-badge"
                        style={{ 
                          background: style.bg,
                          borderColor: style.border,
                          color: style.text
                        }}
                      >
                        <span className="insight-icon">{insight.icon}</span>
                        <span className="insight-message">{insight.message}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="forecast-footer">
        <p>Data provided by Open-Meteo • Updated in real-time</p>
        <p className="disclaimer">Estimates are based on weather conditions and may vary with actual system performance</p>
      </div>
    </div>
  );
};

export default WeatherForecast;
