import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BugList from '../components/BugList';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const theme = createTheme();

const renderBugList = () => {
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
          <BugList />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const mockBugsData = {
  status: 'success',
  data: {
    bugs: [
      {
        _id: '1',
        title: 'Test Bug 1',
        description: 'Test description 1',
        status: 'open',
        priority: 'high',
        reporter: 'John Doe',
        assignee: 'Jane Smith',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      {
        _id: '2',
        title: 'Test Bug 2',
        description: 'Test description 2',
        status: 'in-progress',
        priority: 'medium',
        reporter: 'Alice Johnson',
        assignee: '',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      }
    ]
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 2,
    hasNext: false,
    hasPrev: false
  }
};

describe('BugList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.bugAPI.getAllBugs.mockResolvedValue(mockBugsData);
  });

  test('renders bug list with data', async () => {
    renderBugList();

    await waitFor(() => {
      expect(screen.getByText('Bug List')).toBeInTheDocument();
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Test Bug 2')).toBeInTheDocument();
    });
  });

  test('renders table headers', async () => {
    renderBugList();

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Reporter')).toBeInTheDocument();
      expect(screen.getByText('Assignee')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  test('displays bug data correctly', async () => {
    renderBugList();

    await waitFor(() => {
      // Check first bug
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      
      // Check second bug
      expect(screen.getByText('Test Bug 2')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });
  });

  test('renders action buttons for each bug', async () => {
    renderBugList();

    await waitFor(() => {
      expect(screen.getByTestId('view-bug-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-bug-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-bug-1')).toBeInTheDocument();
      
      expect(screen.getByTestId('view-bug-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-bug-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-bug-2')).toBeInTheDocument();
    });
  });

  test('filters bugs by status', async () => {
    const user = userEvent.setup();
    renderBugList();

    await waitFor(() => {
      expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    });

    // Click on status filter
    const statusFilter = screen.getByTestId('status-filter');
    await user.click(statusFilter);

    // Select 'open' status
    const openOption = screen.getByRole('option', { name: 'Open' });
    await user.click(openOption);

    await waitFor(() => {
      expect(api.bugAPI.getAllBugs).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'open'
        })
      );
    });
  });

  test('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderBugList();

    await waitFor(() => {
      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
    });

    // First set a filter
    const statusFilter = screen.getByTestId('status-filter');
    await user.click(statusFilter);
    const openOption = screen.getByRole('option', { name: 'Open' });
    await user.click(openOption);

    // Then clear filters
    const clearButton = screen.getByTestId('clear-filters-button');
    await user.click(clearButton);

    await waitFor(() => {
      expect(api.bugAPI.getAllBugs).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ''
        })
      );
    });
  });

  test('opens delete confirmation dialog', async () => {
    const user = userEvent.setup();
    renderBugList();

    await waitFor(() => {
      expect(screen.getByTestId('delete-bug-1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-bug-1');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Bug')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });
  });

  test('deletes bug when confirmed', async () => {
    const user = userEvent.setup();
    const mockDeleteBug = jest.fn().mockResolvedValue({});
    api.bugAPI.deleteBug = mockDeleteBug;

    renderBugList();

    await waitFor(() => {
      expect(screen.getByTestId('delete-bug-1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByTestId('delete-bug-1');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByTestId('confirm-delete-button');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteBug).toHaveBeenCalledWith('1');
    });
  });

  test('handles empty bug list', async () => {
    api.bugAPI.getAllBugs.mockResolvedValue({
      ...mockBugsData,
      data: { bugs: [] },
      pagination: { ...mockBugsData.pagination, totalItems: 0 }
    });

    renderBugList();

    await waitFor(() => {
      expect(screen.getByText('No bugs found matching your filters.')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    api.bugAPI.getAllBugs.mockRejectedValue(new Error('API Error'));
    
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderBugList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load bugs. Please try again.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('shows loading state', () => {
    // Don't resolve the promise immediately
    api.bugAPI.getAllBugs.mockImplementation(() => new Promise(() => {}));

    renderBugList();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles pagination', async () => {
    renderBugList();

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    // The pagination component should be rendered
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
  });
});
