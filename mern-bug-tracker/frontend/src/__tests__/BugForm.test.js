import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BugForm from '../components/BugForm';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }), // Default to new bug form
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const theme = createTheme();

const renderBugForm = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <BugForm {...props} />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('BugForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders new bug form', () => {
    renderBugForm();
    
    expect(screen.getByText('Report New Bug')).toBeInTheDocument();
    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
    expect(screen.getByTestId('priority-select')).toBeInTheDocument();
    expect(screen.getByTestId('reporter-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    renderBugForm();

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Reporter is required')).toBeInTheDocument();
    });
  });

  test('validates field lengths', async () => {
    const user = userEvent.setup();
    renderBugForm();

    // Test title too short
    const titleInput = screen.getByTestId('title-input').querySelector('input');
    await user.type(titleInput, 'AB'); // Too short

    // Test description too short
    const descriptionInput = screen.getByTestId('description-input').querySelector('textarea');
    await user.type(descriptionInput, 'Short'); // Too short

    // Test reporter too short
    const reporterInput = screen.getByTestId('reporter-input').querySelector('input');
    await user.type(reporterInput, 'A'); // Too short

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 3 characters long')).toBeInTheDocument();
      expect(screen.getByText('Description must be at least 10 characters long')).toBeInTheDocument();
      expect(screen.getByText('Reporter name must be at least 2 characters long')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockCreateBug = jest.fn().mockResolvedValue({ data: { bug: { _id: '123' } } });
    api.bugAPI.createBug = mockCreateBug;

    renderBugForm();

    // Fill in valid form data
    const titleInput = screen.getByTestId('title-input').querySelector('input');
    await user.type(titleInput, 'Test Bug Title');

    const descriptionInput = screen.getByTestId('description-input').querySelector('textarea');
    await user.type(descriptionInput, 'This is a test bug description that is long enough');

    const reporterInput = screen.getByTestId('reporter-input').querySelector('input');
    await user.type(reporterInput, 'John Doe');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBug).toHaveBeenCalledWith({
        title: 'Test Bug Title',
        description: 'This is a test bug description that is long enough',
        priority: 'medium',
        assignee: '',
        reporter: 'John Doe',
        tags: [],
        stepsToReproduce: '',
        environment: '',
        status: 'open'
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/bugs');
  });

  test('handles form submission error', async () => {
    const user = userEvent.setup();
    const mockCreateBug = jest.fn().mockRejectedValue(new Error('API Error'));
    api.bugAPI.createBug = mockCreateBug;

    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderBugForm();

    // Fill in valid form data
    const titleInput = screen.getByTestId('title-input').querySelector('input');
    await user.type(titleInput, 'Test Bug Title');

    const descriptionInput = screen.getByTestId('description-input').querySelector('textarea');
    await user.type(descriptionInput, 'This is a test bug description that is long enough');

    const reporterInput = screen.getByTestId('reporter-input').querySelector('input');
    await user.type(reporterInput, 'John Doe');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateBug).toHaveBeenCalled();
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    let resolvePromise;
    const mockCreateBug = jest.fn().mockImplementation(() => 
      new Promise(resolve => { resolvePromise = resolve; })
    );
    api.bugAPI.createBug = mockCreateBug;

    renderBugForm();

    // Fill in valid form data
    const titleInput = screen.getByTestId('title-input').querySelector('input');
    await user.type(titleInput, 'Test Bug Title');

    const descriptionInput = screen.getByTestId('description-input').querySelector('textarea');
    await user.type(descriptionInput, 'This is a test bug description that is long enough');

    const reporterInput = screen.getByTestId('reporter-input').querySelector('input');
    await user.type(reporterInput, 'John Doe');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    // Button should be disabled while submitting
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolvePromise({ data: { bug: { _id: '123' } } });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/bugs');
    });
  });

  test('handles priority selection', async () => {
    const user = userEvent.setup();
    renderBugForm();

    const prioritySelect = screen.getByTestId('priority-select');
    await user.click(prioritySelect);

    const highOption = screen.getByRole('option', { name: 'High' });
    await user.click(highOption);

    expect(prioritySelect).toHaveTextContent('High');
  });
});
