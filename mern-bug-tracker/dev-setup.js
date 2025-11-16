#!/usr/bin/env node

/**
 * Development Startup Script
 * Provides multiple options for running the MERN Bug Tracker application
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

console.log('🐛 MERN Bug Tracker - Development Setup');
console.log('=====================================\n');

// Check if dependencies are installed
function checkDependencies() {
  const backendNodeModules = path.join(backendPath, 'node_modules');
  const frontendNodeModules = path.join(frontendPath, 'node_modules');
  
  if (!fs.existsSync(backendNodeModules)) {
    console.log('❌ Backend dependencies not found. Please run:');
    console.log('   cd backend && npm install\n');
    return false;
  }
  
  if (!fs.existsSync(frontendNodeModules)) {
    console.log('❌ Frontend dependencies not found. Please run:');
    console.log('   cd frontend && npm install\n');
    return false;
  }
  
  console.log('✅ Dependencies found\n');
  return true;
}

// Display available commands
function showCommands() {
  console.log('Available commands:');
  console.log('==================');
  console.log('npm run start:backend    - Start backend server');
  console.log('npm run start:frontend   - Start frontend development server');
  console.log('npm run start:both       - Start both backend and frontend');
  console.log('npm run test:backend     - Run backend tests');
  console.log('npm run test:frontend    - Run frontend tests');
  console.log('npm run test:all         - Run all tests');
  console.log('');
  console.log('Development URLs:');
  console.log('=================');
  console.log('Frontend: http://localhost:3000');
  console.log('Backend:  http://localhost:5000');
  console.log('API Docs: http://localhost:5000/api/health');
  console.log('');
  console.log('Database Setup:');
  console.log('===============');
  console.log('1. Local MongoDB: Install and start MongoDB service');
  console.log('2. MongoDB Atlas: Update MONGODB_URI in backend/.env');
  console.log('3. Docker: docker run -d -p 27017:27017 mongo:latest');
  console.log('');
  console.log('VS Code Tasks:');
  console.log('==============');
  console.log('Use Ctrl+Shift+P > "Tasks: Run Task" for:');
  console.log('- Start Backend');
  console.log('- Start Frontend'); 
  console.log('- Run Tests');
  console.log('- Debug Backend/Frontend');
}

// Run command based on script argument
const command = process.argv[2];

if (!checkDependencies()) {
  process.exit(1);
}

switch (command) {
  case 'start:backend':
    console.log('🚀 Starting backend server...\n');
    spawn('npm', ['run', 'dev'], { 
      cwd: backendPath, 
      stdio: 'inherit',
      shell: true 
    });
    break;
    
  case 'start:frontend':
    console.log('🚀 Starting frontend development server...\n');
    spawn('npm', ['start'], { 
      cwd: frontendPath, 
      stdio: 'inherit',
      shell: true 
    });
    break;
    
  case 'start:both':
    console.log('🚀 Starting both backend and frontend...\n');
    
    // Start backend
    console.log('Starting backend on port 5000...');
    spawn('npm', ['run', 'dev'], { 
      cwd: backendPath, 
      stdio: 'inherit',
      shell: true 
    });
    
    // Start frontend after a delay
    setTimeout(() => {
      console.log('Starting frontend on port 3000...');
      spawn('npm', ['start'], { 
        cwd: frontendPath, 
        stdio: 'inherit',
        shell: true 
      });
    }, 3000);
    break;
    
  case 'test:backend':
    console.log('🧪 Running backend tests...\n');
    spawn('npm', ['test'], { 
      cwd: backendPath, 
      stdio: 'inherit',
      shell: true 
    });
    break;
    
  case 'test:frontend':
    console.log('🧪 Running frontend tests...\n');
    spawn('npm', ['test', '--', '--watchAll=false'], { 
      cwd: frontendPath, 
      stdio: 'inherit',
      shell: true 
    });
    break;
    
  case 'test:all':
    console.log('🧪 Running all tests...\n');
    
    console.log('Running backend tests...');
    const backendTest = spawn('npm', ['test'], { 
      cwd: backendPath, 
      stdio: 'inherit',
      shell: true 
    });
    
    backendTest.on('close', (code) => {
      if (code === 0) {
        console.log('\nRunning frontend tests...');
        spawn('npm', ['test', '--', '--watchAll=false'], { 
          cwd: frontendPath, 
          stdio: 'inherit',
          shell: true 
        });
      }
    });
    break;
    
  default:
    showCommands();
}
