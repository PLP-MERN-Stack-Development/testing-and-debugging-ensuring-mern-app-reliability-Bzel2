import React from 'react';
import { useQuery } from 'react-query';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BugReport as BugIcon,
  Assignment as OpenIcon,
  Build as InProgressIcon,
  CheckCircle as ResolvedIcon
} from '@mui/icons-material';
import { bugAPI } from '../services/api';

const StatCard = ({ title, value, icon, color, testId }) => (
  <Card 
    sx={{ 
      height: '100%',
      background: `linear-gradient(45deg, ${color}22, ${color}11)`
    }}
    data-testid={testId}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h3" component="div" sx={{ color }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color, fontSize: 48 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { 
    data: statsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery(
    'bugStats',
    bugAPI.getBugStats,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Failed to fetch bug statistics:', error);
      }
    }
  );

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <button onClick={() => refetch()}>
            Retry
          </button>
        }
      >
        Failed to load dashboard data. Please try again.
      </Alert>
    );
  }

  const stats = statsData?.data || {};
  const statusStats = stats.statusStats || [];
  const priorityStats = stats.priorityStats || [];

  // Calculate status counts
  const getStatusCount = (status) => {
    const stat = statusStats.find(s => s._id === status);
    return stat ? stat.count : 0;
  };

  const getPriorityCount = (priority) => {
    const stat = priorityStats.find(s => s._id === priority);
    return stat ? stat.count : 0;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bug Tracker Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Total Bugs */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bugs"
            value={stats.total || 0}
            icon={<BugIcon />}
            color="#1976d2"
            testId="total-bugs-card"
          />
        </Grid>

        {/* Open Bugs */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open"
            value={getStatusCount('open')}
            icon={<OpenIcon />}
            color="#f44336"
            testId="open-bugs-card"
          />
        </Grid>

        {/* In Progress Bugs */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={getStatusCount('in-progress')}
            icon={<InProgressIcon />}
            color="#ff9800"
            testId="in-progress-bugs-card"
          />
        </Grid>

        {/* Resolved Bugs */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved"
            value={getStatusCount('resolved')}
            icon={<ResolvedIcon />}
            color="#4caf50"
            testId="resolved-bugs-card"
          />
        </Grid>

        {/* Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Breakdown
            </Typography>
            {statusStats.length > 0 ? (
              statusStats.map((stat) => (
                <Box 
                  key={stat._id} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {stat._id}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {stat.count}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">No bugs found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Priority Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Priority Breakdown
            </Typography>
            {priorityStats.length > 0 ? (
              priorityStats.map((stat) => (
                <Box 
                  key={stat._id} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {stat._id}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {stat.count}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">No bugs found</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
