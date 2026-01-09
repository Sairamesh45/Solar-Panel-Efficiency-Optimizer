import React, { useState } from 'react';

const SolarInputForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    location: { city: 'Mumbai', state: 'Maharashtra', latitude: 19.07, longitude: 72.87 },
    roof: { area: 50, type: 'flat', tilt: 15, orientation: 'south', shading: 'none' },
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>Analysis Parameters</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Location Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <legend style={{ fontWeight: 'bold' }}>Location</legend>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>City</label>
              <input type="text" value={formData.location.city} onChange={(e) => handleChange(e, 'location', 'city')} required style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Lat</label>
                <input type="number" step="0.01" value={formData.location.latitude} onChange={(e) => handleChange(e, 'location', 'latitude')} required style={{ width: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Lon</label>
                <input type="number" step="0.01" value={formData.location.longitude} onChange={(e) => handleChange(e, 'location', 'longitude')} required style={{ width: '100%' }} />
              </div>
            </div>
          </fieldset>

          {/* Roof Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <legend style={{ fontWeight: 'bold' }}>Roof & Environment</legend>
            <div style={{ marginBottom: '10px' }}>
              <label>Area (sq m)</label>
              <input type="number" value={formData.roof.area} onChange={(e) => handleChange(e, 'roof', 'area')} required style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Type</label>
                <select value={formData.roof.type} onChange={(e) => handleChange(e, 'roof', 'type')} style={{ width: '100%' }}>
                  <option value="flat">Flat</option>
                  <option value="sloped">Sloped</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Orientation</label>
                <select value={formData.roof.orientation} onChange={(e) => handleChange(e, 'roof', 'orientation')} style={{ width: '100%' }}>
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                </select>
              </div>
            </div>
            <div>
              <label>Shading</label>
              <select value={formData.roof.shading} onChange={(e) => handleChange(e, 'roof', 'shading')} style={{ width: '100%' }}>
                <option value="none">None</option>
                <option value="partial">Partial</option>
                <option value="full">Full</option>
              </select>
            </div>
          </fieldset>

          {/* Energy Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <legend style={{ fontWeight: 'bold' }}>Energy & Bills</legend>
            <div style={{ marginBottom: '10px' }}>
              <label>Avg Monthly Bill (₹)</label>
              <input type="number" value={formData.energy.monthly_bill} onChange={(e) => handleChange(e, 'energy', 'monthly_bill')} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>Tariff (₹/kWh)</label>
              <input type="number" step="0.1" value={formData.energy.tariff} onChange={(e) => handleChange(e, 'energy', 'tariff')} required style={{ width: '100%' }} />
            </div>
          </fieldset>

          {/* System Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <legend style={{ fontWeight: 'bold' }}>System Age</legend>
            <div style={{ marginBottom: '10px' }}>
              <label>Panel Age (Years)</label>
              <input type="number" value={formData.system.panel_age_years} onChange={(e) => handleChange(e, 'system', 'panel_age_years')} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>Last Cleaned (Days ago)</label>
              <input type="number" value={formData.system.last_cleaned_days_ago} onChange={(e) => handleChange(e, 'system', 'last_cleaned_days_ago')} required style={{ width: '100%' }} />
            </div>
          </fieldset>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '20px', 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processing Analysis...' : 'Run Analysis'}
        </button>
      </form>
    </div>
  );
};

export default SolarInputForm;

