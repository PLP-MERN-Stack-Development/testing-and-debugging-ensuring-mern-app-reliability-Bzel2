import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bugAPI } from '../services/api';

const InfoCard = ({ title, value, icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={1}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" color="textSecondary">
        {value || 'Not specified'}
      </Typography>
    </CardContent>
  </Card>
);

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  // Fetch bug data
  const {
    data: bugData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['bug', id],
    () => bugAPI.getBugById(id),
    {
      onError: (error) => {
        console.error('Failed to fetch bug:', error);
        if (error.response?.status === 404) {
          toast.error('Bug not found');
          navigate('/bugs');
        }
      }
    }
  );

  // Delete bug mutation
  const deleteMutation = useMutation(bugAPI.deleteBug, {
    onSuccess: () => {
      queryClient.invalidateQueries('bugs');
      queryClient.invalidateQueries('bugStats');
      navigate('/bugs');
    },
    onError: (error) => {
      console.error('Failed to delete bug:', error);
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate(id);
    setDeleteDialog(false);
  };

  if (isLoading) {
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
        Failed to load bug details. Please try again.
      </Alert>
    );
  }

  const bug = bugData?.data?.bug;

  if (!bug) {
    return (
      <Alert severity="warning">
        Bug not found.
      </Alert>
    );
  }

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

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<BackIcon />}
          component={Link}
          to="/bugs"
          data-testid="back-button"
        >
          Back to Bug List
        </Button>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={Link}
            to={`/bugs/${bug._id}/edit`}
            data-testid="edit-button"
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
            data-testid="delete-button"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Title and Status */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h4" component="h1">
              {bug.title}
            </Typography>
            <Chip
              label={bug.status}
              color={getStatusColor(bug.status)}
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={bug.priority}
              color={getPriorityColor(bug.priority)}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Bug ID: {bug._id}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Bug Information Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Reporter"
              value={bug.reporter}
              icon={<PersonIcon color="primary" />}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Assignee"
              value={bug.assignee || 'Unassigned'}
              icon={<AssignmentIcon color="primary" />}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Created Date"
              value={new Date(bug.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              icon={<DateIcon color="primary" />}
            />
          </Grid>
        </Grid>

        {/* Description */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {bug.description}
            </Typography>
          </Paper>
        </Box>

        {/* Steps to Reproduce */}
        {bug.stepsToReproduce && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Steps to Reproduce
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {bug.stepsToReproduce}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Environment */}
        {bug.environment && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Environment
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">
                {bug.environment}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Tags */}
        {bug.tags && bug.tags.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {bug.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Metadata */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="body2" color="textSecondary">
            Created: {new Date(bug.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Last Updated: {new Date(bug.updatedAt).toLocaleString()}
          </Typography>
          {bug.ageInDays !== undefined && (
            <Typography variant="body2" color="textSecondary">
              Age: {bug.ageInDays} days
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        data-testid="delete-dialog"
      >
        <DialogTitle>Delete Bug</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this bug? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog(false)}
            disabled={deleteMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
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
    </Box>
  );
};

export default BugDetail;
