import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Compass, Search, ShoppingBag, ShieldAlert, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { addToCart, getCartCount } = useCart();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load products catalog.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    setMessage('');
    setError('');
    try {
      addToCart(product);
      setMessage(`Added "${product.name}" to your shopping cart!`);
      // Auto-clear message
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add to cart.');
    }
  };

  const categories = ['All', 'Food & Spices', 'Handicrafts', 'Soaps & Cosmetics', 'Agriculture', 'Apparel & Handloom', 'Others'];

  const filteredProducts = products.filter((p) => {
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading products marketplace...</div>;

  return (
    <div>
      {/* Header Shop Section */}
      <div className="flex justify-between align-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Kudumbashree Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Purchase high-quality organic groceries, handicrafts, and soaps direct from local NHG units</p>
        </div>
        
        {/* Shopping Cart button link */}
        <Link to="/member/cart" className="btn btn-secondary" style={{ display: 'inline-flex', align: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={18} />
          <span>My Cart</span>
          <span style={{ background: '#0b0f19', color: 'var(--secondary)', padding: '0.1rem 0.5rem', borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700 }}>
            {getCartCount()}
          </span>
        </Link>
      </div>

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

      {/* Filter and Search Panel */}
      <div className="glass-card mb-4 flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1.5rem', padding: '1rem' }}>
        {/* Category Pill Filters */}
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-dark'}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '300px' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Product List Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '4rem' }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No products match your criteria. Try looking under a different category.</p>
        </div>
      ) : (
        <div className="shop-grid">
          {filteredProducts.map((product) => {
            const hasStock = product.stock > 0;
            return (
              <div key={product._id} className="glass-card product-card hoverable">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="product-image" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="flex justify-between align-center mb-3">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manufactured by: {product.nhg?.name || 'Local NHG'}</span>
                    <span style={{ fontSize: '0.8rem', color: hasStock ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                      {hasStock ? `${product.stock} units left` : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="product-footer">
                    <span className="product-price">₹{product.price}</span>
                    <button
                      className={`btn btn-sm ${hasStock ? 'btn-primary' : 'btn-dark'}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={!hasStock}
                    >
                      {hasStock ? 'Add to Cart' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Shop;
