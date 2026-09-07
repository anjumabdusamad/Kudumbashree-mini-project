import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, CheckCircle, ShieldAlert, Package, Calendar, FileText } from 'lucide-react';
import { generateOrderInvoice } from '../utils/pdfGenerator';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your orders history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setMessage('');
    setError('');
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: 'cancelled',
      });

      if (res.data.success) {
        setMessage('Order cancelled successfully. Stocks restored.');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to cancel order.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading your orders...</div>;

  return (
    <div>
      <h1 className="mb-1" style={{ fontSize: '2rem' }}>My Purchases</h1>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Track the delivery status and dispatch details of products ordered by you</p>

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
        <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>Orders Ledger</h3>
        
        {orders.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>You haven't placed any product orders yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Order Date</th>
                  <th>Purchased Items</th>
                  <th>Price Total</th>
                  <th>Shipping Destination</th>
                  <th>Fulfillment Status</th>
                  <th className="text-center">Invoice & Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <code style={{ fontSize: '0.85rem' }}>{order._id}</code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', align: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                        <Calendar size={14} className="text-success" />
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {order.items.map((item, index) => (
                          <div key={index} style={{ fontSize: '0.85rem' }}>
                            • {item.product?.name || 'Deleted Product'} <strong style={{ color: 'var(--secondary)' }}>x{item.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{order.totalAmount}</td>
                    <td style={{ maxWidth: '180px', fontSize: '0.85rem', lineHeight: 1.4 }}>{order.shippingAddress}</td>
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
                        <button
                          className="btn btn-dark btn-sm flex align-center gap-1"
                          onClick={() => generateOrderInvoice(order)}
                          title="Download PDF Invoice"
                          style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' }}
                        >
                          <FileText size={14} />
                          <span>PDF</span>
                        </button>
                        {order.status === 'pending' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel
                          </button>
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

export default MyOrders;
