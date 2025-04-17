import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Page imports
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import AdminLogin from './pages/login';
import AdminDashboard from './pages/adminDashboard';
import SellerApprovals from './pages/SellerApprovals';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminReportsPage from './pages/reports'; // New reports page
import AdminUserManagementPage from './pages/userManage'; // New user management page
import AdminLayout from './components/layout/AdminLayout';
import { useAuth } from './contexts/AuthContext';

// Theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App = () => {
  const { currentUser } = useAuth();

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Normalize CSS */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Regular User Routes */}
        {currentUser && !isAdmin ? (
          <Route path="/" element={<Dashboard />} />
        ) : null}
        
        {/* Admin Routes with Layout */}
        {isAdmin ? (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="sellers" element={<SellerApprovals />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="reports" element={<AdminReportsPage />} /> {/* New route */}
            <Route path="users" element={<AdminUserManagementPage />} /> {/* New route */}
          </Route>
        ) : null}
        
        {/* Default routing */}
        <Route path="/" element={
          currentUser 
            ? (isAdmin ? <Navigate to="/admin/dashboard" /> : <Dashboard />)
            : <Navigate to="/login" />
        } />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;