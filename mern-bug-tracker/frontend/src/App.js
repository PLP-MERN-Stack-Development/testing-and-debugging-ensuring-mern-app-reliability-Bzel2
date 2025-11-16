import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import BugIcon from '@mui/icons-material/BugReport';
import BugList from './components/BugList';
import BugForm from './components/BugForm';
import BugDetail from './components/BugDetail';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <BugIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MERN Bug Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bugs" element={<BugList />} />
          <Route path="/bugs/new" element={<BugForm />} />
          <Route path="/bugs/:id" element={<BugDetail />} />
          <Route path="/bugs/:id/edit" element={<BugForm />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
