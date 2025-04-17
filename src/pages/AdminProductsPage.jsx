import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  TablePagination,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

const AdminProductsPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // For status toggle
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  
  // For error display timeout
  const [errorTimeout, setErrorTimeout] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, sortOrder, statusFilter, categoryFilter]);

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 0) {
        setPage(0);
      } else {
        fetchProducts();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  // Clear error messages after timeout
  const showError = (message) => {
    // Clear any existing timeout
    if (errorTimeout) clearTimeout(errorTimeout);
    
    // Set the error message
    setError(message);
    
    // Set a timeout to clear the error after 5 seconds
    const timeout = setTimeout(() => setError(''), 5000);
    setErrorTimeout(timeout);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page + 1); // API uses 1-based indexing
      params.append('limit', rowsPerPage);
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      // Map frontend sort options to API sort params
      if (sortOrder === 'price-low') params.append('sort', 'price-low');
      if (sortOrder === 'price-high') params.append('sort', 'price-high');
      if (sortOrder === 'oldest') params.append('sort', 'oldest');
      if (sortOrder === 'newest') params.append('sort', 'newest');
      
      const response = await axiosInstance.get(`/admin/products?${params.toString()}`);
      
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      
      // Extract categories for filter dropdown
      if (response.data.products.length > 0) {
        const uniqueCategories = [...new Set(response.data.products
          .map(product => product.category)
          .filter(category => category && category.trim() !== '')
        )];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product) => {
    window.open(`/products/${product._id}`, '_blank');
  };

  const handleFlagProduct = async (product) => {
    const reason = prompt(`Flagging "${product.title}". Enter reason (optional):`);
    if (reason === null) return; // Cancelled prompt
  
    try {
      await axiosInstance.post('/admin/flag-product', {
        productId: product._id,
        title: product.title,
        flaggedBy: localStorage.getItem('user') || 'admin', // Or use currentUser?._id
        reason,
      });
      alert(`Product "${product.title}" has been flagged successfully.`);
    } catch (err) {
      console.error('Error flagging product:', err);
      alert('Failed to flag product. Please try again.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      setStatusUpdating(true);
      setStatusUpdatingId(productId);
      
      // Save original products state
      const originalProducts = [...products];
      
      // Optimistically update UI
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === productId 
            ? { ...product, active: !currentStatus } 
            : product
        )
      );
      
      // Make API call
      const response = await axiosInstance.patch(`/admin/products/${productId}/toggle-status`);
      
      // Check if request was successful
      if (!response.data || !response.data.success) {
        // Revert UI change if server reports failure
        setProducts(originalProducts);
        showError(response.data?.message || 'Failed to update product status');
      }
      
    } catch (err) {
      console.error('Error toggling product status:', err);
      
      // Revert UI change on error
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === productId 
            ? { ...product, active: currentStatus } // Revert to original
            : product
        )
      );
      
      // Set error message
      showError(err.response?.data?.message || 'Failed to update product status. Please try again.');
    } finally {
      setStatusUpdating(false);
      setStatusUpdatingId(null);
    }
  };

  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    try {
      setDeleteLoading(true);
      
      await axiosInstance.delete(`/admin/products/${productToDelete._id}`);
      
      // Remove product from local state
      setProducts(prevProducts => 
        prevProducts.filter(product => product._id !== productToDelete._id)
      );
      
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      
      // Update counts
      setTotalProducts(prev => prev - 1);
      
    } catch (err) {
      console.error(err);
      showError('Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
            Products
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage all products in your marketplace
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchProducts}
            sx={{ borderRadius: 1, textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ 
        mb: 3, 
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="h6" fontWeight="medium">
              Filters
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Search products by name..."
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="sort-filter-label">Sort By</InputLabel>
                <Select
                  labelId="sort-filter-label"
                  value={sortOrder}
                  label="Sort By"
                  onChange={(e) => setSortOrder(e.target.value)}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card sx={{ 
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search or filter criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setSortOrder('newest');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {product.thumbnailUrl ? (
                          <Box
                            component="img"
                            src={product.thumbnailUrl}
                            alt={product.title}
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 1, 
                              mr: 2,
                              objectFit: 'cover' 
                            }}
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 1, 
                              mr: 2, 
                              bgcolor: 'rgba(0, 0, 0, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              No img
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="body2" fontWeight="medium">
                          {product.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {product.seller?.name || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.category || 'Uncategorized'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>${product.price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          checked={product.active}
                          onChange={() => handleToggleStatus(product._id, product.active)}
                          size="small"
                          disabled={statusUpdating && statusUpdatingId === product._id}
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={product.active ? 'Active' : 'Inactive'}
                          color={product.active ? 'success' : 'default'}
                          size="small"
                          variant={product.active ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {/* View Product Button */}
                      <Tooltip title="View Product">
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => handleViewProduct(product)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Flag Product Button */}
                      <Tooltip title="Flag Product">
                        <IconButton 
                          size="small"
                          color="warning"
                          onClick={() => handleFlagProduct(product)}
                        >
                          <FlagIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Delete Button */}
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => openDeleteDialog(product)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalProducts}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product "{productToDelete?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProduct} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductsPage;