import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/client';
import './Navbar.css';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate('/');
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo" id="nav-logo">
          <div className="logo-icon">🤖</div>
          <span className="logo-text gradient-text">AI ChatBoard</span>
        </NavLink>

        {/* Desktop nav links */}
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-chat">
            <span className="nav-icon">💬</span>
            <span>{t('nav.chat')}</span>
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/board" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-board">
                <span className="nav-icon">📋</span>
                <span>{t('nav.board')}</span>
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-dashboard">
                <span className="nav-icon">📊</span>
                <span>{t('nav.dashboard')}</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* Language toggle */}
          <button
            className="lang-toggle"
            onClick={toggleLanguage}
            id="lang-toggle"
            aria-label="Toggle language"
            title={t('common.language')}
          >
            <span className="lang-flag">{i18n.language === 'en' ? '🇺🇸' : '🇹🇭'}</span>
            <span className="lang-label">{i18n.language === 'en' ? 'EN' : 'ไทย'}</span>
          </button>

          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-avatar" id="user-avatar" title={user?.username}>
                {user?.username?.[0].toUpperCase()}
              </div>
              <span className="user-name">{user?.username}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                id="btn-logout"
              >
                {isLoggingOut ? '...' : t('nav.logout')}
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm" id="btn-login">
              {t('nav.login')}
            </NavLink>
          )}

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className="mobile-nav-link" id="mobile-nav-chat">
            💬 {t('nav.chat')}
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/board" onClick={() => setMenuOpen(false)} className="mobile-nav-link" id="mobile-nav-board">
                📋 {t('nav.board')}
              </NavLink>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-nav-link" id="mobile-nav-dashboard">
                📊 {t('nav.dashboard')}
              </NavLink>
            </>
          )}
          {!isAuthenticated && (
            <NavLink to="/login" onClick={() => setMenuOpen(false)} className="mobile-nav-link" id="mobile-nav-login">
              🔑 {t('nav.login')}
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
}
