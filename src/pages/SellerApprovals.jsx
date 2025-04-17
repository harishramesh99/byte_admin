import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

// Material UI components
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Skeleton,
  InputAdornment,
  Grid
} from '@mui/material';

// Material UI icons
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const SellerApprovals = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/pending-sellers');
      setPendingSellers(response.data.sellers || []);
    } catch (err) {
      setError('Failed to load pending seller requests. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/approve-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      setSuccessMessage('Seller approved successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to approve seller. Please try again.');
      console.error(err);
    }
  };

  const handleRejectSeller = async (sellerId) => {
    try {
      await axiosInstance.put(`/admin/reject-seller/${sellerId}`);
      setPendingSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      setSuccessMessage('Seller rejected successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to reject seller. Please try again.');
      console.error(err);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Filter and sort sellers
  const filteredSellers = pendingSellers
    .filter(seller => 
      seller.name?.toLowerCase().includes(filterTerm.toLowerCase()) || 
      seller.email?.toLowerCase().includes(filterTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === 'name') {
        return a.name?.localeCompare(b.name);
      }
      return 0;
    });

  // Render loading skeletons
  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={3}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Seller Approvals
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage pending seller registration requests
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchPendingSellers}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filters" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by name or email..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                  labelId="sort-select-label"
                  id="sort-select"
                  value={sortOption}
                  label="Sort By"
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader 
          title="Pending Sellers" 
          subheader={`${filteredSellers.length} ${filteredSellers.length === 1 ? 'seller' : 'sellers'} awaiting approval ${filterTerm ? `matching "${filterTerm}"` : ''}`}
        />
        <CardContent>
          {filteredSellers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6">No pending sellers</Typography>
              <Typography variant="body2" color="text.secondary">
                {filterTerm 
                  ? 'No sellers match your search criteria.'
                  : 'There are no seller approval requests at this time.'}
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
                  {filteredSellers.map((seller) => (
                    <TableRow key={seller._id}>
                      <TableCell component="th" scope="row">
                        {seller.name}
                      </TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApproveSeller(seller._id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleRejectSeller(seller._id)}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SellerApprovals;