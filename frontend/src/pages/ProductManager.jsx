import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, ShoppingBag, ShieldAlert, CheckCircle, Image } from 'lucide-react';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [nhgs, setNhgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: 'Food & Spices', stock: '10', nhgId: '' });
  const [editingId, setEditingId] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
      
      const nhgRes = await axios.get('http://localhost:5000/api/admin/nhgs');
      if (nhgRes.data.success) {
        setNhgs(nhgRes.data.nhgs);
        if (nhgRes.data.nhgs.length > 0) {
          setFormData(prev => ({ ...prev, nhgId: nhgRes.data.nhgs[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load products or NHG listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateProduct = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock) {
      setError('Please fill in all required fields');
      return;
    }

    setLoadingSubmit(true);
    try {
      if (editingId) {
        // Update product
        const res = await axios.put(`http://localhost:5000/api/products/${editingId}`, formData);
        if (res.data.success) {
          setMessage('Product updated successfully!');
          setEditingId(null);
        }
      } else {
        // Create product
        const res = await axios.post('http://localhost:5000/api/products', formData);
        if (res.data.success) {
          setMessage('Product added to catalog successfully!');
        }
      }
      // Reset form
      setFormData({ name: '', description: '', price: '', image: '', category: 'Food & Spices', stock: '10', nhgId: nhgs.length > 0 ? nhgs[0]._id : '' });
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit product details');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p._id);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      image: p.image || '',
      category: p.category,
      stock: p.stock.toString(),
      nhgId: p.nhg?._id || ''
    });
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setMessage('');
    setError('');
    try {
      const res = await axios.delete(`http://localhost:5000/api/products/${prodId}`);
      if (res.data.success) {
        setMessage('Product deleted successfully!');
        loadData();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete product from database.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Products Catalogue...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Product Directory Management</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Add and manage products manufactured by local self-help group units</p>

      {message && (
        <div className="flex align-center gap-1 mb-4" style={{
          padding: '0.75rem 1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 'var(--radius-sm)',
          color: '#4ade80',
          fontSize: '0.85rem'
        }}>
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex align-center gap-1 mb-4" style={{
          padding: '0.75rem 1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-sm)',
          color: '#ef4444',
          fontSize: '0.85rem'
        }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2 mb-4">
        {/* Create/Edit product form */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>
            {editingId ? 'Edit Product Details' : 'Add Product to Shop'}
          </h3>
          <form onSubmit={handleCreateOrUpdateProduct}>
            <div className="form-group">
              <label className="form-label">Product Title</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="E.g., Organic Honey (250g)"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  placeholder="150"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  placeholder="10"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-control form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Food & Spices">Food & Spices</option>
                  <option value="Handicrafts">Handicrafts</option>
                  <option value="Soaps & Cosmetics">Soaps & Cosmetics</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Apparel & Handloom">Apparel & Handloom</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Producing NHG Unit</label>
                {nhgs.length === 0 ? (
                  <p className="text-danger" style={{ fontSize: '0.8rem' }}>Create an NHG first</p>
                ) : (
                  <select
                    name="nhgId"
                    className="form-control form-select"
                    value={formData.nhgId}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingId} // Disable NHG change during edit
                  >
                    {nhgs.map((nhg) => (
                      <option key={nhg._id} value={nhg._id}>
                        {nhg.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL (Optional)</label>
              <input
                type="url"
                name="image"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Product Description</label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                placeholder="Provide detail specifications like weight, ingredients, organic certificates..."
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  className="btn btn-dark"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', description: '', price: '', image: '', category: 'Food & Spices', stock: '10', nhgId: nhgs.length > 0 ? nhgs[0]._id : '' });
                  }}
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loadingSubmit || nhgs.length === 0}>
                {loadingSubmit ? 'Submitting...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Info card display */}
        <div className="glass-card flex align-center justify-center text-center" style={{ minHeight: '300px' }}>
          <div>
            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Add goods produced by NHGs on the left. Approved items will show up on member shopping catalogs immediately.</p>
          </div>
        </div>
      </div>

      {/* Directory table */}
      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Active Products Catalog</h3>
        {products.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No products listed in catalog.</p>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Product Preview</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Supplier (NHG Unit)</th>
                  <th className="text-center">Configure</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex align-center gap-2">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: 'rgba(255,255,255,0.02)' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{p.category}</span></td>
                    <td style={{ fontWeight: 700, fontSize: '1rem' }}>₹{p.price}</td>
                    <td>
                      {p.stock > 0 ? (
                        <div style={{ color: '#4ade80', fontWeight: 600 }}>{p.stock} units</div>
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Out of Stock</span>
                      )}
                    </td>
                    <td>{p.nhg?.name || 'Local Unit'}</td>
                    <td>
                      <div className="flex justify-center gap-1">
                        <button className="btn btn-dark btn-sm" onClick={() => handleEditClick(p)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
