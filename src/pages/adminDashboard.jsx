import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

// Material UI components
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Skeleton,
  IconButton,
  Chip
} from '@mui/material';

// Material UI icons
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingSellers, setPendingSellers] = useState([]);
  const [stats, setStats] = useState({
    pendingSellersCount: 0,
    totalProducts: 'N/A',
    totalSales: 'N/A'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/pending-sellers');
      setPendingSellers(response.data.sellers || []);
      setStats({
        pendingSellersCount: response.data.sellers?.length || 0,
        totalProducts: 'N/A',
        totalSales: 'N/A'
      });
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/approve-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      setStats(prevStats => ({
        ...prevStats,
        pendingSellersCount: prevStats.pendingSellersCount - 1
      }));
    } catch (err) {
      setError('Failed to approve seller. Please try again.');
      console.error(err);
    }
  };

  const handleRejectSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/reject-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      setStats(prevStats => ({
        ...prevStats,
        pendingSellersCount: prevStats.pendingSellersCount - 1
      }));
    } catch (err) {
      setError('Failed to reject seller. Please try again.');
      console.error(err);
    }
  };

  // Render loading skeletons
  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        </Grid>
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome to your admin dashboard
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Pending Sellers
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {stats.pendingSellersCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seller accounts awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingBagIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Products
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {stats.totalProducts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total products in marketplace
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Sales
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {stats.totalSales}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total sales this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Links */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <Button 
            variant="contained" 
            component={Link} 
            to="/admin/sellers"
            startIcon={<PeopleIcon />}
          >
            Manage Seller Approvals
          </Button>
        </CardContent>
      </Card>

      {/* Pending Sellers Table */}
      <Card>
        <CardHeader 
          title="Recent Pending Sellers" 
          subheader="Review and manage seller registration requests"
          action={
            <Button 
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
          }
        />
        <CardContent>
          {pendingSellers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6">No pending sellers</Typography>
              <Typography variant="body2" color="text.secondary">
                There are no seller approval requests at this time.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Registered On</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingSellers.slice(0, 5).map((seller) => (
                    <TableRow key={seller._id}>
                      <TableCell component="th" scope="row">
                        {seller.name}
                      </TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="success"
                          onClick={() => handleApproveSeller(seller._id)}
                          aria-label="approve"
                          title="Approve"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleRejectSeller(seller._id)}
                          aria-label="reject"
                          title="Reject"
                        >
                          <CancelIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {pendingSellers.length > 5 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/admin/sellers" 
                color="primary"
              >
                View all {pendingSellers.length} pending sellers
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;