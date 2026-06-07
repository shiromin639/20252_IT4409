import React from 'react';
import { useApp } from '../context/AppContext';

export const Notification: React.FC = () => {
  const { notification } = useApp();

  if (!notification.message) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: isSuccess ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      fontWeight: 500,
      animation: 'fadeIn 0.3s ease'
    }}>
      {notification.message}
    </div>
  );
};
