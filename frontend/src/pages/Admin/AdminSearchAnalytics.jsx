import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/admin';
import { Search, TrendingUp, Key, XCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Admin.module.css';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon, color = 'primary' }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statIcon} style={{ background: `var(--color-${color}-light)`, color: `var(--color-${color})` }}>
          {icon}
        </div>
      </div>
      <div className={styles.statValue}>{value}</div>
    </div>
  )
}

export default function AdminSearchAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_searches: 0, unique_keywords: 0, searches_today: 0, searches_last_7_days: 0 });
  const [trends, setTrends] = useState([]);
  const [topKeywords, setTopKeywords] = useState([]);
  const [noResults, setNoResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, trendsRes, topRes, noRes] = await Promise.all([
          adminApi.getSearchStats(),
          adminApi.getSearchTrends(),
          adminApi.getSearchTopKeywords(),
          adminApi.getSearchNoResults()
        ]);
        
        setStats(statsRes.data || statsRes);
        setTrends(trendsRes.data || trendsRes);
        setTopKeywords(topRes.data || topRes);
        setNoResults(noRes.data || noRes);
      } catch (err) {
        console.error("Failed to load search analytics", err);
        toast.error("Không thể tải dữ liệu tìm kiếm");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-state">Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Thống kê tìm kiếm</h1>
        <p>Phân tích hành vi tìm kiếm sản phẩm của người dùng</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Tổng lượt tìm kiếm" value={stats.total_searches?.toLocaleString()} icon={<Search size={20} />} color="primary" />
        <StatCard label="Từ khóa duy nhất" value={stats.unique_keywords?.toLocaleString()} icon={<Key size={20} />} color="warning" />
        <StatCard label="Tìm kiếm hôm nay" value={stats.searches_today?.toLocaleString()} icon={<TrendingUp size={20} />} color="success" />
        <StatCard label="Tìm kiếm (7 ngày qua)" value={stats.searches_last_7_days?.toLocaleString()} icon={<TrendingUp size={20} />} color="info" />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
          <h3>Biểu đồ lưu lượng tìm kiếm (30 ngày)</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Line type="monotone" dataKey="volume" name="Lượt tìm kiếm" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Top 20 từ khóa phổ biến</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topKeywords} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="keyword" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Số lượt tìm" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <XCircle size={18} color="var(--color-danger)" />
            <h3 style={{ margin: 0 }}>Tìm kiếm không có kết quả</h3>
          </div>
          <div className={styles.tableWrap} style={{ overflowY: 'auto', maxHeight: '300px' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Từ khóa</th>
                  <th style={{ textAlign: 'right' }}>Số lượt</th>
                </tr>
              </thead>
              <tbody>
                {noResults.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.keyword}</strong></td>
                    <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>{item.count}</td>
                  </tr>
                ))}
                {noResults.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '24px' }}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
