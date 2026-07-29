import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShoppingCart, Trash2, ShieldAlert, CheckCircle, ArrowLeft, Send, Coins, Truck } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user, reloadUserProfile } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleQtyChange = (productId, qty, stock) => {
    setMessage('');
    setError('');
    try {
      updateQuantity(productId, qty, stock);
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!shippingAddress) {
      setError('Please provide a delivery address');
      return;
    }

    setLoadingCheckout(true);
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
      }));

      const res = await axios.post('http://localhost:5000/api/orders', {
        items: orderItems,
        shippingAddress,
        paymentMethod,
      });

      if (res.data.success) {
        setMessage('Order placed successfully! Redirecting to orders tab...');
        clearCart();
        setShippingAddress('');
        if (paymentMethod === 'wallet') {
          // Sync wallet balance locally
          await reloadUserProfile();
        }
        // Redirect to MyOrders page after 2 seconds
        setTimeout(() => {
          navigate('/member/my-orders');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Checkout failed. Please verify stocks.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  if (cartItems.length === 0 && !message) {
    return (
      <div className="glass-card text-center" style={{ padding: '4rem' }}>
        <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h3>Your Shopping Cart is Empty</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }} className="mb-4">
          Browse the catalog and add products to your cart to checkout.
        </p>
        <Link to="/member/shop" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Shopping Cart</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Review your selected items and provide shipment details to complete order placement</p>

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

      <div className="grid-3">
        {/* Cart Item list */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Selected Products</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map((item) => (
              <div key={item.product._id} className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--dark-border)', paddingBottom: '1rem' }}>
                <div className="flex align-center gap-2">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80';
                    }}
                  />
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>{item.product.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supplier: {item.product.nhg?.name || 'Local Unit'}</p>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)', marginTop: '0.25rem' }}>
                      ₹{item.product.price}
                    </div>
                  </div>
                </div>

                <div className="flex align-center gap-2">
                  {/* Quantity selector */}
                  <div className="flex align-center" style={{ border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <button
                      type="button"
                      className="btn btn-dark btn-sm"
                      style={{ padding: '0.3rem 0.6rem', border: 'none', borderRadius: 0 }}
                      onClick={() => handleQtyChange(item.product._id, item.quantity - 1, item.product.stock)}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 0.8rem', fontSize: '0.95rem', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      type="button"
                      className="btn btn-dark btn-sm"
                      style={{ padding: '0.3rem 0.6rem', border: 'none', borderRadius: 0 }}
                      onClick={() => handleQtyChange(item.product._id, item.quantity + 1, item.product.stock)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.5rem' }}
                    onClick={() => removeFromCart(item.product._id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/member/shop" className="btn btn-dark" style={{ display: 'inline-flex', align: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Checkout panel */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Checkout Summary</h3>
          
          <div style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Items Count:</span>
              <span style={{ fontWeight: 600 }}>{cartItems.reduce((acc, i) => acc + i.quantity, 0)} units</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              <span style={{ color: '#fff' }}>Total Amount:</span>
              <span style={{ color: 'var(--secondary)' }}>₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout}>
            {/* Payment Method Selector */}
            <div className="form-group mb-3">
              <label className="form-label">Payment Method</label>
              <div className="flex gap-2 mb-2" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${paymentMethod === 'cod' ? 'btn-primary' : 'btn-dark'}`}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <Truck size={14} /> Cash on Delivery
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${paymentMethod === 'wallet' ? 'btn-primary' : 'btn-dark'}`}
                  style={{ flex: 1, fontSize: '0.8rem' }}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <Coins size={14} /> Pay with Wallet
                </button>
              </div>

              {paymentMethod === 'wallet' && user && (
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Your Wallet Balance:</span>
                    <span style={{ fontWeight: 700, color: user.walletBalance >= getCartTotal() ? '#4ade80' : '#f87171' }}>
                      ₹{(user.walletBalance || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {user.walletBalance < getCartTotal() && (
                    <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>
                      ⚠️ Insufficient balance in Disbursed Loan Wallet. Please apply for a loan or select COD.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Delivery Shipping Address</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Provide complete residential address (House name, Street, Ward, PIN, landmark...)"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              disabled={loadingCheckout || (paymentMethod === 'wallet' && user?.walletBalance < getCartTotal())}
            >
              <Send size={16} /> {loadingCheckout ? 'Placing Order...' : 'Confirm Checkout Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
