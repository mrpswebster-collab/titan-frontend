import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL UI RENDER ERROR:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('titan_user_session');
      localStorage.setItem('titan_layout_mode', 'STANDARD');
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0a0e17',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚡</div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', margin: '0 0 8px 0' }}>
              TITAN Institutional Quant Enclave
            </h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
              An unexpected render notice occurred. The recovery shield is active to protect your session.
            </p>

            <div style={{
              backgroundColor: '#030712',
              border: '1px solid #1f2937',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#f87171',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '24px',
              maxHeight: '120px'
            }}>
              {this.state.error?.toString() || 'Unknown render exception'}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#10b981',
                  color: '#030712',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Reset Session & Reload
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem('titan_layout_mode', 'STANDARD');
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#1f2937',
                  color: '#e2e8f0',
                  border: '1px solid #374151',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Switch to Standard Mode
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
