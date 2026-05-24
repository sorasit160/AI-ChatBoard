import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardApi } from '../api/client';
import './DashboardPage.css';

interface Stats {
  totalUsers: number;
  totalChatSessions: number;
  totalMessages: number;
  totalPosts: number;
  totalReplies: number;
  todayMessages: number;
}

interface Activity {
  date: string;
  chat_messages: number;
  posts: number;
  active_users: number;
}

interface TopUser {
  id: string;
  username: string;
  chat_count: number;
  post_count: number;
  reply_count: number;
  score: number;
}

interface RecentAction {
  id: string;
  action: string;
  resource: string;
  created_at: string;
  username: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recent, setRecent] = useState<RecentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [statsRes, activityRes, usersRes, recentRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getActivity(days),
        dashboardApi.getTopUsers(),
        dashboardApi.getRecentActivity(),
      ]);

      setStats(statsRes.data);
      setActivity(activityRes.data.activity);
      setTopUsers(usersRes.data.topUsers);
      setRecent(recentRes.data.recent);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [days]);

  if (isLoading && !stats) {
    return (
      <div className="page-layout container">
        <div className="empty-state"><div className="spinner" /></div>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard-page page-layout container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="gradient-text" style={{ margin: 0 }}>{t('dashboard.title')}</h1>
          <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <div className="dashboard-meta">
          <span className="last-updated">
            {t('dashboard.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => { setIsLoading(true); fetchData(); }}>
            ↻
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid mb-xl">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-label">{t('dashboard.totalUsers')}</div>
          <div className="stat-card-value">{stats?.totalUsers.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💬</div>
          <div className="stat-card-label">{t('dashboard.chatSessions')}</div>
          <div className="stat-card-value">{stats?.totalChatSessions.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🤖</div>
          <div className="stat-card-label">{t('dashboard.todayMessages')}</div>
          <div className="stat-card-value text-accent">{stats?.todayMessages.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-label">{t('dashboard.totalPosts')}</div>
          <div className="stat-card-value">{stats?.totalPosts.toLocaleString()}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Main Chart */}
        <div className="glass-card chart-card full-width">
          <div className="chart-header">
            <h3 className="chart-title">{t('dashboard.activityChart')}</h3>
            <div className="chart-controls">
              <button 
                className={`btn btn-sm ${days === 7 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDays(7)}
              >
                {t('dashboard.last7Days')}
              </button>
              <button 
                className={`btn btn-sm ${days === 30 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setDays(30)}
              >
                {t('dashboard.last30Days')}
              </button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDateShort} stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  labelFormatter={formatDateShort}
                />
                <Legend />
                <Line type="monotone" name={t('dashboard.chatMessages')} dataKey="chat_messages" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name={t('dashboard.posts')} dataKey="posts" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name={t('dashboard.activeUsers')} dataKey="active_users" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Users */}
        <div className="glass-card table-card">
          <h3 className="chart-title">{t('dashboard.topUsers')}</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('dashboard.rank')}</th>
                  <th>{t('dashboard.username')}</th>
                  <th>{t('dashboard.chats')}</th>
                  <th>{t('dashboard.posts')}</th>
                  <th>{t('dashboard.score')}</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, idx) => (
                  <tr key={user.id}>
                    <td>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="font-medium">{user.username}</td>
                    <td>{user.chat_count}</td>
                    <td>{user.post_count + user.reply_count}</td>
                    <td><span className="badge badge-primary">{user.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card list-card">
          <h3 className="chart-title">{t('dashboard.recentActivity')}</h3>
          <div className="activity-list">
            {recent.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon">
                  {item.action.includes('chat') ? '💬' : 
                   item.action.includes('post') ? '📝' : 
                   item.action.includes('reply') ? '↩️' : '⚡'}
                </div>
                <div className="activity-details">
                  <div className="activity-text">
                    <span className="font-medium text-primary">{item.username || 'Anonymous'}</span>{' '}
                    <span className="text-secondary">{item.action.replace('_', ' ')}</span>
                  </div>
                  <div className="activity-time">{formatTime(item.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
