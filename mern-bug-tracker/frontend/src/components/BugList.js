import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bugAPI } from '../services/api';

const BugList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for filters and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    reporter: '',
    assignee: ''
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    bugId: null,
    bugTitle: ''
  });

  // Fetch bugs with filters and pagination
  const {
    data: bugsData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['bugs', page + 1, rowsPerPage, filters],
    () => bugAPI.getAllBugs({
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    }),
    {
      keepPreviousData: true,
      refetchInterval: 60000, // Refresh every minute
      onError: (error) => {
        console.error('Failed to fetch bugs:', error);
      }
    }
  );

  // Delete bug mutation
  const deleteMutation = useMutation(bugAPI.deleteBug, {
    onSuccess: () => {
      queryClient.invalidateQueries('bugs');
      queryClient.invalidateQueries('bugStats');
      setDeleteDialog({ open: false, bugId: null, bugTitle: '' });
    },
    onError: (error) => {
      console.error('Failed to delete bug:', error);
    }
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(0); // Reset to first page when filtering
  };

  const handleDeleteClick = (bug) => {
    setDeleteDialog({
      open: true,
      bugId: bug._id,
      bugTitle: bug.title
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.bugId) {
      deleteMutation.mutate(deleteDialog.bugId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, bugId: null, bugTitle: '' });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      reporter: '',
      assignee: ''
    });
    setPage(0);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'error',
      'in-progress': 'warning',
      resolved: 'success',
      closed: 'default'
    };
    return colors[status] || 'default';
  };

  if (isLoading && page === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        Failed to load bugs. Please try again.
      </Alert>
    );
  }

  const bugs = bugsData?.data?.bugs || [];
  const pagination = bugsData?.pagination || {};

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Bug List</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/bugs/new"
          data-testid="add-bug-button"
        >
          Report Bug
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterChange('status')}
              label="Status"
              data-testid="status-filter"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              onChange={handleFilterChange('priority')}
              label="Priority"
              data-testid="priority-filter"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Reporter"
            value={filters.reporter}
            onChange={handleFilterChange('reporter')}
            data-testid="reporter-filter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Assignee"
            value={filters.assignee}
            onChange={handleFilterChange('assignee')}
            data-testid="assignee-filter"
          />
        </Grid>

        <Grid item xs={12} sm={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={clearFilters}
            data-testid="clear-filters-button"
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer>
        <Table data-testid="bugs-table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Reporter</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bugs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">
                    No bugs found matching your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              bugs.map((bug) => (
                <TableRow key={bug._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" noWrap>
                      {bug.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bug.status}
                      color={getStatusColor(bug.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bug.priority}
                      color={getPriorityColor(bug.priority)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>{bug.reporter}</TableCell>
                  <TableCell>{bug.assignee || 'Unassigned'}</TableCell>
                  <TableCell>
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      component={Link}
                      to={`/bugs/${bug._id}`}
                      data-testid={`view-bug-${bug._id}`}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      component={Link}
                      to={`/bugs/${bug._id}/edit`}
                      data-testid={`edit-bug-${bug._id}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(bug)}
                      data-testid={`delete-bug-${bug._id}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={pagination.totalItems || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        data-testid="pagination"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        data-testid="delete-dialog"
      >
        <DialogTitle>Delete Bug</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the bug "{deleteDialog.bugTitle}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            disabled={deleteMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
            data-testid="confirm-delete-button"
          >
            {deleteMutation.isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BugList;
