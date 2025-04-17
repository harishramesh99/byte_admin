import { Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Page imports
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import AdminLogin from './pages/login';
import AdminDashboard from './pages/adminDashboard';
import SellerApprovals from './pages/SellerApprovals';
import AdminProductsPage from './pages/AdminProductsPage'; // Import the products page
import AdminLayout from './components/layout/AdminLayout';
import { useAuth } from './contexts/AuthContext';

// Theme configuration (already in your code)
const darkTheme = createTheme({
  // Your theme configuration...
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
          <Route path="/" element={<Login />} />
        ) : null}
        
        {/* Admin Routes with Layout */}
        {isAdmin ? (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="sellers" element={<SellerApprovals />} />
            
            {/* Product Management Route (just the list page) */}
            <Route path="products" element={<AdminProductsPage />} />
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