
import React, { useState } from 'react';
import { fetchLatLonFromLocation } from '../../utils/geocode';
import { INDIAN_STATES, INDIAN_CITIES } from '../../utils/indianLocations';

const SolarInputForm = ({ onSubmit, loading }) => {
  // For city dropdown
  const [customCity, setCustomCity] = useState('');
  const [formData, setFormData] = useState({
    location: { city: '', state: '', latitude: null, longitude: null },
    roof: { type: 'flat', tilt: 15, orientation: 'south', shading: 'none' },
    energy: { monthly_bill: 2500, tariff: 7 },
    system: { panel_age_years: 2, last_cleaned_days_ago: 30 }
  });

  const handleChange = (e, section, field) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };


  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [currentLocLoading, setCurrentLocLoading] = useState(false);

  const handleGetCoordinates = async () => {
    if (!formData.location.city || formData.location.city.trim() === '') {
      setGeoError('Please enter a city name first');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    try {
      // Use only the city name for geocoding API (Open-Meteo works best with just city)
      const coords = await fetchLatLonFromLocation(formData.location.city);
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      });
    } catch (err) {
      setGeoError(err.message || 'Failed to fetch coordinates');
    } finally {
      setGeoLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    setCurrentLocLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            latitude: parseFloat(position.coords.latitude.toFixed(4)),
            longitude: parseFloat(position.coords.longitude.toFixed(4))
          }
        });
        setCurrentLocLoading(false);
      },
      (error) => {
        let errorMessage = 'Failed to get current location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setGeoError(errorMessage);
        setCurrentLocLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate area automatically from monthly bill
    // Assumptions: 
    // - Monthly bill / tariff = monthly consumption (kWh)
    // - Average 5 peak sun hours per day in India
    // - 15% panel efficiency
    // - 150 kWh per month per kW installed
    // - Area = (monthly_consumption / 150) * 1000 / 150 W/m² (panel density)
    const monthlyConsumption = formData.energy.monthly_bill / formData.energy.tariff;
    const requiredSystemKw = monthlyConsumption / 150; // 150 kWh per month per kW
    const calculatedArea = Math.ceil((requiredSystemKw * 1000) / 150); // 150W per sq meter
    
    const dataWithArea = {
      ...formData,
      roof: {
        ...formData.roof,
        area: calculatedArea
      }
    };
    
    onSubmit(dataWithArea);
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Solar Analysis</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Location Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: 'white' }}>
            <legend style={{ fontWeight: '600', padding: '0 8px' }}>Location</legend>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>State</label>
              <select
                value={formData.location.state}
                onChange={e => {
                  handleChange({ target: { value: e.target.value } }, 'location', 'state');
                  setFormData(f => ({ ...f, location: { ...f.location, city: '' } }));
                  setCustomCity('');
                }}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              
              <label style={{ display: 'block', marginTop: '12px', marginBottom: '6px' }}>City</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={INDIAN_CITIES[formData.location.state]?.includes(formData.location.city) ? formData.location.city : ''}
                  onChange={e => {
                    handleChange({ target: { value: e.target.value } }, 'location', 'city');
                    setCustomCity('');
                  }}
                  disabled={!formData.location.state}
                  style={{ flex: 2, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="">-- Select City --</option>
                  {formData.location.state && INDIAN_CITIES[formData.location.state]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="__custom">Other (Enter manually)</option>
                </select>
                {(formData.location.state && (!INDIAN_CITIES[formData.location.state]?.includes(formData.location.city) || formData.location.city === '__custom')) && (
                  <input
                    type="text"
                    value={customCity || (formData.location.city === '__custom' ? '' : formData.location.city)}
                    onChange={e => {
                      setCustomCity(e.target.value);
                      handleChange({ target: { value: e.target.value } }, 'location', 'city');
                    }}
                    placeholder="Enter city"
                    style={{ flex: 2, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                )}
                <button 
                  type="button" 
                  onClick={handleGetCoordinates} 
                  disabled={geoLoading || currentLocLoading} 
                  style={{ 
                    flex: 1, 
                    background: '#3498db',
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    padding: '10px', 
                    cursor: (geoLoading || currentLocLoading) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {geoLoading ? 'Locating...' : 'Get Coordinates'}
                </button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={handleGetCurrentLocation} 
                  disabled={geoLoading || currentLocLoading} 
                  style={{ 
                    width: '100%',
                    background: '#27ae60',
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    padding: '10px', 
                    cursor: (geoLoading || currentLocLoading) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>📍</span>
                  {currentLocLoading ? 'Getting location...' : 'Use Current Location'}
                </button>
              </div>
              {geoError && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '4px' }}>{geoError}</div>}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Latitude</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.location.latitude} 
                  onChange={(e) => handleChange(e, 'location', 'latitude')} 
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Longitude</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.location.longitude} 
                  onChange={(e) => handleChange(e, 'location', 'longitude')} 
                  required 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
                />
              </div>
            </div>
          </fieldset>

          {/* Roof Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: 'white' }}>
            <legend style={{ fontWeight: '600', padding: '0 8px' }}>Roof</legend>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Type</label>
                <select value={formData.roof.type} onChange={(e) => handleChange(e, 'roof', 'type')} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="flat">Flat</option>
                  <option value="sloped">Sloped</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Orientation</label>
                <select value={formData.roof.orientation} onChange={(e) => handleChange(e, 'roof', 'orientation')} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px' }}>Shading</label>
              <select value={formData.roof.shading} onChange={(e) => handleChange(e, 'roof', 'shading')} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="none">None</option>
                <option value="partial">Partial</option>
                <option value="full">Full</option>
              </select>
            </div>
          </fieldset>

          {/* Energy Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: 'white' }}>
            <legend style={{ fontWeight: '600', padding: '0 8px' }}>Energy & Bills</legend>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Monthly Bill (₹)</label>
              <input 
                type="number" 
                value={formData.energy.monthly_bill} 
                onChange={(e) => handleChange(e, 'energy', 'monthly_bill')} 
                required 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px' }}>Tariff (₹/kWh)</label>
              <input 
                type="number" 
                step="0.1" 
                value={formData.energy.tariff} 
                onChange={(e) => handleChange(e, 'energy', 'tariff')} 
                required 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
              />
            </div>
          </fieldset>

          {/* System Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', background: 'white' }}>
            <legend style={{ fontWeight: '600', padding: '0 8px' }}>System Info</legend>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px' }}>Panel Age (Years)</label>
              <input 
                type="number" 
                value={formData.system.panel_age_years} 
                onChange={(e) => handleChange(e, 'system', 'panel_age_years')} 
                required 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px' }}>Last Cleaned (Days Ago)</label>
              <input 
                type="number" 
                value={formData.system.last_cleaned_days_ago} 
                onChange={(e) => handleChange(e, 'system', 'last_cleaned_days_ago')} 
                required 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
              />
            </div>
          </fieldset>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '20px', 
            width: '100%', 
            padding: '14px', 
            background: loading ? '#95a5a6' : '#3498db',
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Processing...' : 'Run Analysis'}
        </button>
      </form>
    </div>
  );
};

export default SolarInputForm;

