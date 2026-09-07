import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User as UserIcon, Globe } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { toggleLanguage, t, language } = useLanguage();

  return (
    <nav className="navbar">
      <div className="flex align-center gap-2">
        <button 
          className="btn btn-dark btn-sm" 
          onClick={onToggleSidebar}
          style={{ display: 'none', padding: '0.5rem' }} /* For responsive toggle if needed */
        >
          ☰
        </button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>
          {user?.role === 'admin' ? t('adminPortal') : t('memberPortal')}
        </h2>
      </div>

      <div className="flex align-center gap-2">
        {/* Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          className="btn btn-dark btn-sm flex align-center gap-1"
          style={{
            background: 'var(--dark-border)',
            color: '#10b981',
            fontWeight: '600',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(16,185,129,0.3)',
            cursor: 'pointer',
          }}
          title="Switch Language / ഭാഷ മാറ്റുക"
        >
          <Globe size={16} />
          <span>{t('langSwitch')}</span>
        </button>

        {user && (
          <>
            <div className="flex align-center gap-2 mr-3" style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}>
              <UserIcon size={16} className="text-success" />
              <div className="text-left" style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {user.role === 'admin' ? 'Administrator' : `Member (${user.nhg?.name || 'No Group'})`}
                </div>
              </div>
            </div>
            
            <button 
              className="btn btn-dark btn-sm text-danger flex align-center gap-1" 
              onClick={logout}
              title={t('logout')}
              style={{ padding: '0.5rem 0.8rem' }}
            >
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
