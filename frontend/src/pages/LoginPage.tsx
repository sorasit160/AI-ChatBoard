import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/client';
import './LoginPage.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuth } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: 'admin@example.com', password: '123456' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from || '/board';
  const message = (location.state as any)?.message;

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await authApi.login({ email: formData.email, password: formData.password });
        setAuth(res.data.user, res.data.token);
      } else {
        const res = await authApi.register(formData);
        setAuth(res.data.user, res.data.token);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || t('common.error');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page page-layout">
      <div className="login-container">
        <div className="glass-card login-card">
          
          {/* Header */}
          <div className="login-header">
            <div className="login-icon">{isLogin ? '👋' : '🚀'}</div>
            <h1 className="login-title">
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h1>
            <p className="login-subtitle">
              {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Flash message from protected route */}
          {message && (
            <div className="auth-alert warning">
              <span className="alert-icon">🔒</span>
              {message}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="auth-alert error animate-scale-in">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label className="input-label" htmlFor="username">{t('auth.username')}</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="input"
                  placeholder={t('auth.usernamePlaceholder')}
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLogin}
                  minLength={3}
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label" htmlFor="email">{t('auth.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">{t('auth.password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                className="input"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={isLoading || !formData.email || !formData.password || (!isLogin && !formData.username)}
              id={isLogin ? 'btn-submit-login' : 'btn-submit-register'}
            >
              {isLoading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : isLogin ? (
                t('auth.loginBtn')
              ) : (
                t('auth.registerBtn')
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="login-footer">
            <p>
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
              <button
                type="button"
                className="toggle-mode-btn"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                disabled={isLoading}
                id="btn-toggle-auth"
              >
                {isLogin ? t('auth.register') : t('auth.login')}
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
