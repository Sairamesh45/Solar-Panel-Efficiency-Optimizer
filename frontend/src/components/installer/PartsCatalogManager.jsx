import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const PartsCatalogManager = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    partNumber: '',
    price: '',
    unit: 'piece',
    stockQuantity: 0,
    minStockLevel: 5,
    supplier: ''
  });
  const [message, setMessage] = useState('');

  const categories = [
    { value: 'panel', label: '🔲 Panel' },
    { value: 'inverter', label: '⚡ Inverter' },
    { value: 'wiring', label: '🔌 Wiring' },
    { value: 'mounting', label: '🔩 Mounting' },
    { value: 'cleaning', label: '🧹 Cleaning' },
    { value: 'tools', label: '🔧 Tools' },
    { value: 'safety', label: '🦺 Safety' },
    { value: 'other', label: '📦 Other' }
  ];

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      
      const res = await axiosInstance.get(`/parts-catalog?${params.toString()}`);
      setParts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch parts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchParts(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPart) {
        await axiosInstance.put(`/parts-catalog/${editingPart._id}`, formData);
        setMessage('Part updated successfully!');
      } else {
        await axiosInstance.post('/parts-catalog', formData);
        setMessage('Part added successfully!');
      }
      resetForm();
      fetchParts();
    } catch (err) {
      setMessage('Failed to save part');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      description: part.description || '',
      category: part.category,
      partNumber: part.partNumber || '',
      price: part.price,
      unit: part.unit || 'piece',
      stockQuantity: part.stockQuantity,
      minStockLevel: part.minStockLevel,
      supplier: part.supplier || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;
    try {
      await axiosInstance.delete(`/parts-catalog/${id}`);
      fetchParts();
      setMessage('Part deleted successfully');
    } catch (err) {
      setMessage('Failed to delete part');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPart(null);
    setFormData({
      name: '',
      description: '',
      category: 'other',
      partNumber: '',
      price: '',
      unit: 'piece',
      stockQuantity: 0,
      minStockLevel: 5,
      supplier: ''
    });
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading parts catalog...</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>🧰 Parts Catalog</h3>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Part'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          background: message.includes('Failed') ? '#ffebee' : '#e8f5e9',
          color: message.includes('Failed') ? '#c62828' : '#2e7d32',
          borderRadius: 8,
          marginBottom: 20,
          fontWeight: 500
        }}>
          {message}
        </div>
      )}

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Search parts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ced4da',
            fontSize: '1rem'
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ced4da',
            fontSize: '1rem'
          }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#f8f9fa',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 16px 0' }}>{editingPart ? 'Edit Part' : 'Add New Part'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Part Number</label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                placeholder="e.g., SP-001"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Price (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                <option value="piece">Piece</option>
                <option value="meter">Meter</option>
                <option value="kg">Kilogram</option>
                <option value="liter">Liter</option>
                <option value="set">Set</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Stock Qty</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                min="0"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Min Stock Level</label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
                min="0"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', minHeight: 60 }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 16,
              padding: '10px 24px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {editingPart ? 'Update Part' : 'Add Part'}
          </button>
        </form>
      )}

      {parts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#7f8c8d' }}>
          <p>No parts in catalog. Add your first part to get started.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 12, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, color: '#495057' }}>Part</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, color: '#495057' }}>Category</th>
                <th style={{ padding: 14, textAlign: 'right', fontWeight: 600, color: '#495057' }}>Price</th>
                <th style={{ padding: 14, textAlign: 'center', fontWeight: 600, color: '#495057' }}>Stock</th>
                <th style={{ padding: 14, textAlign: 'center', fontWeight: 600, color: '#495057' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(part => (
                <tr key={part._id} style={{ borderTop: '1px solid #e9ecef' }}>
                  <td style={{ padding: 14 }}>
                    <div style={{ fontWeight: 600, color: '#2c3e50' }}>{part.name}</div>
                    {part.partNumber && <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{part.partNumber}</div>}
                  </td>
                  <td style={{ padding: 14 }}>
                    <span style={{
                      padding: '4px 10px',
                      background: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: 20,
                      fontSize: '0.85rem'
                    }}>
                      {categories.find(c => c.value === part.category)?.label || part.category}
                    </span>
                  </td>
                  <td style={{ padding: 14, textAlign: 'right', fontWeight: 600 }}>
                    ₹{part.price.toLocaleString()} / {part.unit}
                  </td>
                  <td style={{ padding: 14, textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: part.stockQuantity <= part.minStockLevel ? '#ffebee' : '#e8f5e9',
                      color: part.stockQuantity <= part.minStockLevel ? '#c62828' : '#2e7d32',
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      {part.stockQuantity}
                      {part.stockQuantity <= part.minStockLevel && ' ⚠️'}
                    </span>
                  </td>
                  <td style={{ padding: 14, textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(part)}
                      style={{
                        padding: '6px 10px',
                        background: '#fff3e0',
                        color: '#f57c00',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        marginRight: 6
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(part._id)}
                      style={{
                        padding: '6px 10px',
                        background: '#ffebee',
                        color: '#c62828',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartsCatalogManager;
