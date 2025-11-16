import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import { bugAPI } from '../services/api';

const BugForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      reporter: '',
      tags: [],
      stepsToReproduce: '',
      environment: '',
      status: 'open'
    }
  });

  // Fetch bug data if editing
  const { 
    data: bugData, 
    isLoading: isLoadingBug,
    error: loadError 
  } = useQuery(
    ['bug', id],
    () => bugAPI.getBugById(id),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        reset(data.data.bug);
      },
      onError: (error) => {
        console.error('Failed to load bug:', error);
        toast.error('Failed to load bug data');
      }
    }
  );

  // Create bug mutation
  const createMutation = useMutation(bugAPI.createBug, {
    onSuccess: () => {
      queryClient.invalidateQueries('bugs');
      queryClient.invalidateQueries('bugStats');
      navigate('/bugs');
    },
    onError: (error) => {
      console.error('Failed to create bug:', error);
    }
  });

  // Update bug mutation
  const updateMutation = useMutation(
    (data) => bugAPI.updateBug(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bugs');
        queryClient.invalidateQueries(['bug', id]);
        queryClient.invalidateQueries('bugStats');
        navigate(`/bugs/${id}`);
      },
      onError: (error) => {
        console.error('Failed to update bug:', error);
      }
    }
  );

  const onSubmit = (data) => {
    console.log('Form submitted with data:', data);
    
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isSubmitting || createMutation.isLoading || updateMutation.isLoading;

  if (isEditing && isLoadingBug) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isEditing && loadError) {
    return (
      <Alert severity="error">
        Failed to load bug data. Please try again.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Bug' : 'Report New Bug'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              rules={{
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters long'
                },
                maxLength: {
                  value: 100,
                  message: 'Title cannot exceed 100 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Bug Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  data-testid="title-input"
                />
              )}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              rules={{
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters long'
                },
                maxLength: {
                  value: 1000,
                  message: 'Description cannot exceed 1000 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Bug Description"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  data-testid="description-input"
                />
              )}
            />
          </Grid>

          {/* Priority and Status */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    {...field}
                    label="Priority"
                    data-testid="priority-select"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {isEditing && (
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...field}
                      label="Status"
                      data-testid="status-select"
                    >
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          )}

          {/* Reporter and Assignee */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="reporter"
              control={control}
              rules={{
                required: 'Reporter is required',
                minLength: {
                  value: 2,
                  message: 'Reporter name must be at least 2 characters long'
                },
                maxLength: {
                  value: 50,
                  message: 'Reporter name cannot exceed 50 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Reporter"
                  error={!!errors.reporter}
                  helperText={errors.reporter?.message}
                  data-testid="reporter-input"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="assignee"
              control={control}
              rules={{
                maxLength: {
                  value: 50,
                  message: 'Assignee name cannot exceed 50 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Assignee (Optional)"
                  error={!!errors.assignee}
                  helperText={errors.assignee?.message}
                  data-testid="assignee-input"
                />
              )}
            />
          </Grid>

          {/* Steps to Reproduce */}
          <Grid item xs={12}>
            <Controller
              name="stepsToReproduce"
              control={control}
              rules={{
                maxLength: {
                  value: 2000,
                  message: 'Steps to reproduce cannot exceed 2000 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="Steps to Reproduce (Optional)"
                  error={!!errors.stepsToReproduce}
                  helperText={errors.stepsToReproduce?.message}
                  data-testid="steps-input"
                />
              )}
            />
          </Grid>

          {/* Environment */}
          <Grid item xs={12}>
            <Controller
              name="environment"
              control={control}
              rules={{
                maxLength: {
                  value: 200,
                  message: 'Environment description cannot exceed 200 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Environment (Optional)"
                  placeholder="e.g., Chrome 91, Windows 10, React 18"
                  error={!!errors.environment}
                  helperText={errors.environment?.message}
                  data-testid="environment-input"
                />
              )}
            />
          </Grid>

          {/* Form Actions */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/bugs')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                data-testid="submit-button"
              >
                {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                {isEditing ? 'Update Bug' : 'Create Bug'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BugForm;
