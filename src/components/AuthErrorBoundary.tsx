import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error.message.includes('User pool client') || error.message.includes('does not exist')) {
      this.setState({ hasError: true });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f7fa',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 61, 92, 0.1)',
            border: '1px solid #e1e5e9',
            padding: '40px',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#003d5c', marginBottom: '16px' }}>Service Temporarily Unavailable</h2>
            <p style={{ color: '#5a6c7d', marginBottom: '24px' }}>Authentication services are currently unavailable. Please try again later.</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#003d5c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;