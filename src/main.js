import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Error boundary for catching rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          padding: '20px',
          backgroundColor: '#121212',
          color: '#e0e0e0',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff5252' }}>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4bd5ee',
              color: '#121212',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px',
              fontWeight: 'bold'
            }}
          >
            Refresh Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
// Initialize the application with error handling
const initializeApp = () => {
  try {
    const container = document.getElementById('renderDiv');
    
    if (!container) {
      throw new Error('Target container not found');
    }
    
    const root = createRoot(container);
    
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    
    console.log('Type Ship application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Fallback rendering in case of initialization error
    const errorContainer = document.getElementById('renderDiv');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; 
                    align-items: center; height: 100vh; width: 100vw; padding: 20px;
                    background-color: #121212; color: #e0e0e0; 
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; text-align: center">
          <h1 style="color: #ff5252">Application Initialization Failed</h1>
          <p>There was a problem starting the application: ${error.message}</p>
          <button onclick="window.location.reload()" 
                  style="padding: 10px 20px; background-color: #4bd5ee; color: #121212; 
                         border: none; border-radius: 4px; cursor: pointer; 
                         margin-top: 20px; font-weight: bold">
            Try Again
          </button>
        </div>
      `;
    }
  }
};
// Start the application
initializeApp();