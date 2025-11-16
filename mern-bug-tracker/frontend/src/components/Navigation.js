import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import AddIcon from '@mui/icons-material/Add';

const Navigation = () => {
  const location = useLocation();
  
  const getTabValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/bugs') return 1;
    if (path === '/bugs/new') return 2;
    return false;
  };

  return (
    <Paper elevation={1} sx={{ borderRadius: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={getTabValue()} aria-label="navigation tabs">
          <Tab
            icon={<DashboardIcon />}
            label="Dashboard"
            component={Link}
            to="/"
            data-testid="dashboard-tab"
          />
          <Tab
            icon={<BugReportIcon />}
            label="All Bugs"
            component={Link}
            to="/bugs"
            data-testid="bugs-tab"
          />
          <Tab
            icon={<AddIcon />}
            label="Report Bug"
            component={Link}
            to="/bugs/new"
            data-testid="new-bug-tab"
          />
        </Tabs>
      </Box>
    </Paper>
  );
};

export default Navigation;
