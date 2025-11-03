import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Clear potentially corrupted localStorage if the error is storage-related
    if (error?.message?.includes('localStorage') || error?.message?.includes('storage')) {
      try {
        localStorage.clear();
        console.log('Cleared localStorage due to storage error');
      } catch (e) {
        console.error('Failed to clear localStorage:', e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f3f4f6',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              padding: '40px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h1 style={{ color: '#dc2626', marginTop: 0 }}>⚠️ Có lỗi xảy ra</h1>
            <p style={{ color: '#666' }}>
              Ứng dụng gặp lỗi khi khởi động. Vui lòng thử các giải pháp sau:
            </p>
            <ol style={{ color: '#666' }}>
              <li>
                Làm mới trang: <kbd>Ctrl + Shift + R</kbd> (Windows) hoặc <kbd>⌘ + Shift + R</kbd>{' '}
                (Mac)
              </li>
              <li>Xóa cache trình duyệt trong Settings → Privacy & Security</li>
              <li>Đóng và mở lại trình duyệt</li>
            </ol>
            <details style={{ marginTop: '20px', color: '#999' }}>
              <summary>Chi tiết lỗi (Developer)</summary>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  maxHeight: '200px',
                }}
              >
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
