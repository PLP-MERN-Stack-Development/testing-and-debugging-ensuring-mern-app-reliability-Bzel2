import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Alert,
  AlertTitle
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In a real application, you would log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRefresh = () => {
    // Reset error state and reload the page
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <ErrorOutlineIcon 
                color="error" 
                sx={{ fontSize: 64, mb: 2 }} 
              />
              
              <Typography variant="h4" color="error" gutterBottom>
                Something went wrong
              </Typography>
              
              <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
                We're sorry, but something unexpected happened. 
                Please try refreshing the page or contact support if the problem persists.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
                sx={{ mb: 3 }}
              >
                Refresh Page
              </Button>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                  <AlertTitle>Error Details (Development Mode)</AlertTitle>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    <strong>Stack Trace:</strong>
                  </Typography>
                  <Box 
                    component="pre" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      overflow: 'auto',
                      maxHeight: '200px',
                      backgroundColor: '#f5f5f5',
                      p: 1,
                      mt: 1,
                      borderRadius: 1
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Box>
                </Alert>
              )}
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
