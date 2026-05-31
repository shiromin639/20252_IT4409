import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Đã có lỗi xảy ra</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Không thể tải trang này. Vui lòng tải lại trang hoặc quay về trang chủ.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Về trang chủ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
