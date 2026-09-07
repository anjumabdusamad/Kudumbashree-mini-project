import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Calendar, 
  Coins, 
  GraduationCap, 
  FileText, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Bell 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  if (!user) return null;
  
  const isAdmin = user.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: '#fff'
        }}>K</div>
        <span className="sidebar-logo-text">KUDUMBA SREE</span>
      </div>

      <nav className="sidebar-menu">
        {isAdmin ? (
          // Admin Sidebar Links
          <>
            <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>{t('dashboard')}</span>
            </NavLink>
            <NavLink to="/admin/member-approval" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserCheck size={18} />
              <span>{t('menuMembers')}</span>
            </NavLink>
            <NavLink to="/admin/nhg-manager" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>{t('menuNHG')}</span>
            </NavLink>
            <NavLink to="/admin/meeting-manager" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>{t('menuMeetings')}</span>
            </NavLink>
            <NavLink to="/admin/financial-tracker" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Coins size={18} />
              <span>{t('menuSavingsLoans')}</span>
            </NavLink>
            <NavLink to="/admin/training-manager" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <GraduationCap size={18} />
              <span>{t('menuTrainings')}</span>
            </NavLink>
            <NavLink to="/admin/scheme-manager" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>{t('menuSchemes')}</span>
            </NavLink>
            <NavLink to="/admin/product-manager" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={18} />
              <span>{t('menuProducts')}</span>
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} />
              <span>{t('menuOrders')}</span>
            </NavLink>
          </>
        ) : (
          // Member Sidebar Links
          <>
            <NavLink to="/member" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>{t('dashboard')}</span>
            </NavLink>
            <NavLink to="/member/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User size={18} />
              <span>{t('profile')}</span>
            </NavLink>
            <NavLink to="/member/meetings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>{t('menuMeetings')}</span>
            </NavLink>
            <NavLink to="/member/savings-loans" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Coins size={18} />
              <span>{t('menuSavingsLoans')}</span>
            </NavLink>
            <NavLink to="/member/trainings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <GraduationCap size={18} />
              <span>{t('menuTrainings')}</span>
            </NavLink>
            <NavLink to="/member/schemes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>{t('menuSchemes')}</span>
            </NavLink>
            <NavLink to="/member/shop" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={18} />
              <span>{t('menuShop')}</span>
            </NavLink>
            <NavLink to="/member/my-orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} />
              <span>{t('menuMyOrders')}</span>
            </NavLink>
            <NavLink to="/member/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Bell size={18} />
              <span>{t('menuNotifications')}</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {t('welcome')}:
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {isAdmin ? 'System Admin' : 'NHG Member'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
