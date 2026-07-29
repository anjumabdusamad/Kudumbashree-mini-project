import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, HeartHandshake, BookOpen, ShoppingBag, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setProducts(prodRes.data.products.slice(0, 3)); // show first 3
      } catch (err) {
        console.error('Error fetching public products:', err);
      }
      setLoading(false);
    };
    fetchPublicData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark-bg)' }}>
      {/* Landing Header */}
      <header style={{ 
        padding: '2rem 5%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--dark-border)',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: '#fff'
          }}>K</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', background: 'linear-gradient(135deg, #4ade80, #facc15)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            KUDUMBA SREE
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-dark">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 5% 5rem', 
        textAlign: 'center', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span className="badge badge-success mb-3" style={{ fontSize: '0.85rem' }}>Kerala State Poverty Eradication Mission</span>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 800, 
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #ffffff 50%, #9ca3af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Centralized Digital Hub for <span style={{ background: 'linear-gradient(135deg, #4ade80, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kudumbashree Units</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Digitalizing member registrations, meetings attendance, weekly savings, microfinance loans, welfare schemes, and empowering home-grown women entrepreneurs through direct product sales.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started as Member <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Admin Login Portal
            </Link>
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(22, 163, 74, 0.1)',
          filter: 'blur(80px)',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1
        }}></div>
      </section>

      {/* Core Pillars */}
      <section style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="text-center mb-5" style={{ fontSize: '2rem' }}>Empowering Women, Eradicating Poverty</h2>
        <div className="grid-3">
          <div className="glass-card text-center hoverable">
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', marginBottom: '1rem' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 className="mb-2">Microfinance & Savings</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Secure online tracking of weekly contributions, deposits, and low-interest microfinance loans for NHG members with high transparency.
            </p>
          </div>

          <div className="glass-card text-center hoverable">
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(234, 179, 8, 0.1)', color: '#facc15', marginBottom: '1rem' }}>
              <HeartHandshake size={32} />
            </div>
            <h3 className="mb-2">Welfare Schemes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Instant notifications about active central and state welfare schemes, training schedules, and direct government subsidies.
            </p>
          </div>

          <div className="glass-card text-center hoverable">
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', marginBottom: '1rem' }}>
              <ShoppingBag size={32} />
            </div>
            <h3 className="mb-2">Empowered Commerce</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              A dedicated e-commerce catalog showcasing home-crafted pickles, spices, handicrafts, soaps, and handloom textiles.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '5rem 5% 7rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex justify-between align-center mb-4">
          <h2>Kudumbashree Products</h2>
          <Link to="/login" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            Log in to purchase <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Loading catalog...</p>
        ) : products.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No products listed yet. Log in as admin to add products.</p>
          </div>
        ) : (
          <div className="shop-grid">
            {products.map((product) => (
              <div key={product._id} className="glass-card product-card hoverable">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">₹{product.price}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Made by: {product.nhg?.name || 'Local Unit'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '3rem 5%', 
        textAlign: 'center', 
        borderTop: '1px solid var(--dark-border)',
        background: 'rgba(11, 15, 25, 0.9)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p className="mb-2">© 2026 Kudumbashree Management System. Built using MERN Stack.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Empowering women through community-based self-help groups across Kerala.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
