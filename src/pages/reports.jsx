import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Typography, 
  Grid, 
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Divider,
  useTheme,
  Skeleton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import {
  RefreshOutlined as RefreshIcon,
  TrendingUpOutlined as TrendingUpIcon,
  CategoryOutlined as CategoryIcon,
  InventoryOutlined as InventoryIcon,
  AttachMoneyOutlined as MoneyIcon,
  DateRangeOutlined as DateRangeIcon,
  PeopleOutlined as PeopleIcon
} from '@mui/icons-material';

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const AdminReportsPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('month');
  
  // State for different reports
  const [salesData, setSalesData] = useState(null);
  const [productStats, setProductStats] = useState(null);
  
  // Get month name from number
  const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1];
  };
  
  // Format date for chart display
  const formatDateForChart = (dateObj) => {
    if (timeframe === 'week') {
      return `${dateObj.day}/${dateObj.month}`;
    } else if (timeframe === 'month') {
      return `${dateObj.day} ${getMonthName(dateObj.month)}`;
    } else {
      return getMonthName(dateObj.month);
    }
  };
  
  // Fetch sales report data
  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get(`/admin/reports/sales?timeframe=${timeframe}`);
      
      if (response.data.success) {
        // Process sales by date data for the chart
        const processedSalesByDate = response.data.report.salesByDate.map(item => ({
          date: formatDateForChart(item._id),
          orders: item.orders,
          revenue: item.revenue
        }));
        
        // Process sales by category for the pie chart
        const processedSalesByCategory = response.data.report.salesByCategory.map(item => ({
          name: item._id || 'Uncategorized',
          value: item.revenue
        }));
        
        setSalesData({
          byDate: processedSalesByDate,
          byCategory: processedSalesByCategory,
          topProducts: response.data.report.topProducts
        });
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
      setError('Failed to load sales report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch product statistics
  const fetchProductStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get('/admin/reports/product-statistics');
      
      if (response.data.success) {
        // Process products by category for the bar chart
        const processedProductsByCategory = response.data.statistics.productsByCategory.map(item => ({
          name: item._id || 'Uncategorized',
          total: item.count,
          active: item.active,
          inactive: item.inactive
        }));
        
        // Process products by month for the line chart
        const processedProductsByMonth = response.data.statistics.productsByMonth.map(item => ({
          date: `${getMonthName(item._id.month)} ${item._id.year}`,
          count: item.count
        }));
        
        setProductStats({
          byCategory: processedProductsByCategory,
          byMonth: processedProductsByMonth,
          topSellers: response.data.statistics.topSellers
        });
      }
    } catch (err) {
      console.error('Error fetching product statistics:', err);
      setError('Failed to load product statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data based on selected tab
  useEffect(() => {
    if (tabValue === 0) {
      fetchSalesReport();
    } else if (tabValue === 1) {
      fetchProductStats();
    }
  }, [tabValue, timeframe]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };
  
  // Refresh data
  const handleRefresh = () => {
    if (tabValue === 0) {
      fetchSalesReport();
    } else if (tabValue === 1) {
      fetchProductStats();
    }
  };
  
  // Generate random color for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ mt: 3 }}>
      <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
      </Grid>
    </Box>
  );
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="medium">
            Reports & Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View detailed reports and analytics for your marketplace
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ borderRadius: 1 }}
        >
          Refresh Data
        </Button>
      </Box>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 1 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<MoneyIcon />} 
            iconPosition="start" 
            label="Sales Report" 
            sx={{ textTransform: 'none', minHeight: 64 }} 
          />
          <Tab 
            icon={<InventoryIcon />} 
            iconPosition="start" 
            label="Product Analytics" 
            sx={{ textTransform: 'none', minHeight: 64 }} 
          />
        </Tabs>
      </Paper>
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {/* Sales Report Tab */}
      {tabValue === 0 && (
        <Box>
          {/* Filters */}
          <Card sx={{ mb: 3, borderRadius: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DateRangeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mr: 3 }}>
                  Timeframe:
                </Typography>
                <FormControl sx={{ minWidth: 150 }}>
                  <Select
                    value={timeframe}
                    onChange={handleTimeframeChange}
                    displayEmpty
                    size="small"
                  >
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                    <MenuItem value="year">Last 12 Months</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
          
          {/* Sales Report Content */}
          {loading ? (
            renderSkeleton()
          ) : salesData ? (
            <Box>
              {/* Revenue Over Time Chart */}
              <Card sx={{ mb: 3, borderRadius: 1 }}>
                <CardHeader 
                  title="Revenue Over Time" 
                  subheader={`Sales revenue for the selected timeframe: ${
                    timeframe === 'week' ? 'Last 7 Days' : 
                    timeframe === 'month' ? 'Last 30 Days' : 'Last 12 Months'
                  }`}
                />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesData.byDate}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Revenue ($)" 
                          stroke={theme.palette.primary.main} 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
              
              <Grid container spacing={3}>
                {/* Sales by Category */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 1 }}>
                    <CardHeader 
                      title="Sales by Category" 
                      subheader="Revenue distribution across product categories" 
                    />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={salesData.byCategory}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {salesData.byCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Top Selling Products */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 1 }}>
                    <CardHeader 
                      title="Top Selling Products" 
                      subheader="Best performing products by order count" 
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell align="center">Orders</TableCell>
                              <TableCell align="right">Revenue</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {salesData.topProducts.slice(0, 5).map((product) => (
                              <TableRow key={product._id}>
                                <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {product.title}
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell align="center">{product.orders}</TableCell>
                                <TableCell align="right">${product.revenue.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 3 }}>
              No sales data available for the selected timeframe.
            </Alert>
          )}
        </Box>
      )}
      
      {/* Product Analytics Tab */}
      {tabValue === 1 && (
        <Box>
          {loading ? (
            renderSkeleton()
          ) : productStats ? (
            <Box>
              {/* Products by Category Chart */}
              <Card sx={{ mb: 3, borderRadius: 1 }}>
                <CardHeader 
                  title="Products by Category" 
                  subheader="Distribution of active and inactive products across categories" 
                />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={productStats.byCategory}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="active" name="Active Products" fill={theme.palette.success.main} />
                        <Bar dataKey="inactive" name="Inactive Products" fill={theme.palette.error.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
              
              <Grid container spacing={3}>
                {/* Product Uploads Over Time */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 1 }}>
                    <CardHeader 
                      title="Product Uploads Over Time" 
                      subheader="Number of new products added over the last 6 months" 
                    />
                    <CardContent>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={productStats.byMonth}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              name="Products Added" 
                              stroke={theme.palette.info.main} 
                              activeDot={{ r: 8 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Top Sellers by Product Count */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 1 }}>
                    <CardHeader 
                      title="Top Sellers by Products" 
                      subheader="Sellers with the most product listings" 
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Seller</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell align="right">Products</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {productStats.topSellers.map((seller) => (
                              <TableRow key={seller._id}>
                                <TableCell>{seller.sellerName}</TableCell>
                                <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {seller.sellerEmail}
                                </TableCell>
                                <TableCell align="right">{seller.productCount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 3 }}>
              No product data available.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AdminReportsPage;