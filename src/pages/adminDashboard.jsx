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
  Chip,
  Divider,
  useTheme
} from '@mui/material';

// Material UI icons
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  StorefrontOutlined as StorefrontIcon,
  ShoppingCartOutlined as CartIcon
} from '@mui/icons-material';

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingSellers, setPendingSellers] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [monthlySalesData, setMonthlySalesData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch pending sellers
      const sellersResponse = await axiosInstance.get('/admin/pending-sellers');
      setPendingSellers(sellersResponse.data.sellers || []);
      
      // Fetch dashboard metrics
      const metricsResponse = await axiosInstance.get('/admin/dashboard-metrics');
      if (metricsResponse.data.success) {
        setDashboardMetrics(metricsResponse.data.metrics);
        
        // Process monthly sales data for the chart
        const processedSalesData = metricsResponse.data.metrics.monthlySales.map(item => ({
          name: `${getMonthName(item._id.month)} ${item._id.year}`,
          revenue: item.amount,
          orders: item.count
        }));
        
        setMonthlySalesData(processedSalesData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get month name
  const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1];
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/approve-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      
      // Update dashboard metrics
      if (dashboardMetrics) {
        setDashboardMetrics(prev => ({
          ...prev,
          pendingSellers: prev.pendingSellers - 1
        }));
      }
    } catch (err) {
      setError('Failed to approve seller. Please try again.');
      console.error(err);
    }
  };

  const handleRejectSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/reject-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      
      // Update dashboard metrics
      if (dashboardMetrics) {
        setDashboardMetrics(prev => ({
          ...prev,
          pendingSellers: prev.pendingSellers - 1
        }));
      }
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
          <Grid item xs={12} sm={6} md={3}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="medium">
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
          sx={{ borderRadius: 1 }}
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
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" component="div" fontWeight="medium">
                  Pending Sellers
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                {dashboardMetrics?.pendingSellers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seller accounts awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingBagIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Typography variant="h6" component="div" fontWeight="medium">
                  Products
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                {dashboardMetrics?.totalProductsCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total products ({dashboardMetrics?.activeProductsCount || 0} active)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CartIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" component="div" fontWeight="medium">
                  Orders
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                {dashboardMetrics?.totalOrdersCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total orders processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" component="div" fontWeight="medium">
                  Revenue
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                ${(dashboardMetrics?.totalSales || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total marketplace revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Sales Chart */}
      <Card sx={{ mb: 3, borderRadius: 1 }}>
        <CardHeader 
          title="Monthly Sales Performance" 
          subheader="Revenue and order count over the last 6 months"
          action={
            <Button 
              component={Link}
              to="/admin/reports"
              startIcon={<TrendingUpIcon />}
              size="small"
              sx={{ borderRadius: 1 }}
            >
              View Reports
            </Button>
          }
        />
        <CardContent>
          <Box sx={{ height: 350 }}>
            {monthlySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlySalesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    return name === 'revenue' ? `$${value.toFixed(2)}` : value;
                  }}/>
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue ($)" 
                    stroke={theme.palette.primary.main} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    name="Orders" 
                    stroke={theme.palette.secondary.main} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No sales data available for the past 6 months
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<RefreshIcon />}
                  onClick={fetchDashboardData}
                >
                  Refresh Data
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/sellers"
                  startIcon={<PeopleIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  Manage Sellers
                </Button>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/products"
                  startIcon={<ShoppingBagIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  Manage Products
                </Button>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/reports"
                  startIcon={<TrendingUpIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  View Reports
                </Button>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/admin/settings"
                  startIcon={<StorefrontIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  Marketplace Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 1, height: '100%' }}>
            <CardHeader 
              title="Product Status" 
              subheader="Active and inactive product counts"
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="medium">
                    {dashboardMetrics?.activeProductsCount || 0}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Active Products
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="text.secondary" fontWeight="medium">
                    {(dashboardMetrics?.totalProductsCount || 0) - (dashboardMetrics?.activeProductsCount || 0)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Inactive Products
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/admin/products" 
                  size="small"
                  sx={{ borderRadius: 1 }}
                >
                  Manage Product Status
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Sellers Table */}
      <Card sx={{ borderRadius: 1 }}>
        <CardHeader 
          title="Recent Pending Sellers" 
          subheader="Review and manage seller registration requests"
          action={
            <Button 
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
              sx={{ borderRadius: 1 }}
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
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
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
                          size="small"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleRejectSeller(seller._id)}
                          aria-label="reject"
                          title="Reject"
                          size="small"
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
                sx={{ borderRadius: 1 }}
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