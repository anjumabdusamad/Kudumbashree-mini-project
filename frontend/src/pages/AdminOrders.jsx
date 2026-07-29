import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Check, ShieldAlert, CheckCircle, Package, Send, XCircle } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/all');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setMessage('');
    setError('');
    
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        setMessage(`Order status updated to ${newStatus}!`);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading customer orders...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>Order Fulfillment Panel</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Monitor product sales and dispatch ordered items to delivery addresses</p>

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

      <div className="glass-card">
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Customer Sales Orders</h3>
        
        {orders.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No product orders placed yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Buyer Information</th>
                  <th>Purchased Items</th>
                  <th>Order Value</th>
                  <th>Delivery Destination</th>
                  <th>Status</th>
                  <th className="text-center">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}><code>{order._id}</code></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {new Date(order.orderDate).toLocaleString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.user?.name || 'Unknown Buyer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone: {order.user?.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {order.items.map((item, index) => (
                          <div key={index} style={{ fontSize: '0.85rem' }}>
                            • {item.product?.name || 'Deleted Product'} <strong style={{ color: 'var(--secondary)' }}>x{item.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '1.05rem' }}>₹{order.totalAmount}</td>
                    <td style={{ maxWidth: '200px', fontSize: '0.85rem', lineHeight: 1.4 }}>{order.shippingAddress}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'delivered' ? 'badge-success' :
                        order.status === 'pending' ? 'badge-warning' :
                        order.status === 'shipped' ? 'badge-info' : 'badge-danger'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center gap-1">
                        {order.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateStatus(order._id, 'shipped')}
                              title="Ship Items"
                            >
                              <Send size={12} /> Ship
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                              title="Cancel Order"
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          </>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                            title="Deliver Items"
                          >
                            <Package size={12} /> Deliver
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600, display: 'flex', align: 'center', gap: '0.2rem' }}>
                            <Check size={14} /> Completed
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span style={{ fontSize: '0.85rem', color: '#f87171' }}>Cancelled</span>
                        )}
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

export default AdminOrders;
