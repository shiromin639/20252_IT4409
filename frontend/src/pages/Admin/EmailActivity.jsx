import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Admin.module.css';

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
  );
}

export default function EmailActivity() {
  const [stats, setStats] = useState({
    total_emails: 0,
    failed_emails: 0,
    emails_today: 0,
    latest_events: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmailActivity = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getEmailActivity();
        setStats(res.data || res);
      } catch (err) {
        console.error("Failed to load email activity", err);
        toast.error("Không thể tải hoạt động email");
      } finally {
        setLoading(false);
      }
    };
    fetchEmailActivity();
  }, []);

  if (loading) {
    return (
      <div className={styles.adminContent} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className={styles.adminContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Hoạt động Email</h1>
      </div>

      <div className={styles.statsGrid}>
        <StatCard 
          label="Tổng email đã gửi" 
          value={stats.total_emails} 
          icon={<Mail size={20} />} 
          color="primary" 
        />
        <StatCard 
          label="Email gửi hôm nay" 
          value={stats.emails_today} 
          icon={<Calendar size={20} />} 
          color="success" 
        />
        <StatCard 
          label="Email thất bại" 
          value={stats.failed_emails} 
          icon={<AlertCircle size={20} />} 
          color="danger" 
        />
      </div>

      <div className={styles.tableCard} style={{ marginTop: '2rem' }}>
        <div className={styles.tableHeader}>
          <h3>Các sự kiện email gần đây</h3>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Loại Email</th>
                <th>Người nhận</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Lỗi (nếu có)</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest_events && stats.latest_events.length > 0 ? (
                stats.latest_events.map(event => (
                  <tr key={event.id}>
                    <td>
                      <span className="badge badge-primary">{event.email_type}</span>
                    </td>
                    <td>{event.recipient}</td>
                    <td>
                      {event.status === 'SENT' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
                          <CheckCircle size={14} /> Thành công
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)' }}>
                          <XCircle size={14} /> Thất bại
                        </div>
                      )}
                    </td>
                    <td>{new Date(event.sent_at).toLocaleString('vi-VN')}</td>
                    <td style={{ color: 'var(--color-danger)', fontSize: '13px' }}>
                      {event.error_message || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    Chưa có sự kiện email nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
