import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../App';

// Create test utilities
const theme = createTheme();

const renderWithProviders = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const AllTheProviders = ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

describe('App Component', () => {
  test('renders without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('MERN Bug Tracker')).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByTestId('dashboard-tab')).toBeInTheDocument();
    expect(screen.getByTestId('bugs-tab')).toBeInTheDocument();
    expect(screen.getByTestId('new-bug-tab')).toBeInTheDocument();
  });

  test('renders dashboard by default', () => {
    renderWithProviders(<App />);
    
    // Dashboard should be rendered by default
    expect(screen.getByText('Bug Tracker Dashboard')).toBeInTheDocument();
  });
});

// Export test utilities for use in other test files
export { renderWithProviders };
