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
  Paper,
  IconButton, 
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  TablePagination,
  Alert,
  AlertTitle,
  CircularProgress,
  Tooltip
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  PeopleOutline as PeopleOutlineIcon,
  VerifiedUser as VerifiedUserIcon,
  Block as BlockIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const AdminUserManagementPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogAction, setDialogAction] = useState('');
  const [dialogReason, setDialogReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, roleFilter, statusFilter]);

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 0) {
        setPage(0);
      } else {
        fetchUsers();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchUsers = async () => {
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
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await axiosInstance.get(`/admin/users?${params.toString()}`);
      
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalUsers(response.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Adjust filters based on tab
    if (newValue === 0) { // All users
      setRoleFilter('all');
      setStatusFilter('all');
    } else if (newValue === 1) { // Pending sellers
      setRoleFilter('seller');
      setStatusFilter('pending');
    } else if (newValue === 2) { // Approved sellers
      setRoleFilter('seller');
      setStatusFilter('approved');
    } else if (newValue === 3) { // Regular buyers
      setRoleFilter('buyer');
      setStatusFilter('all');
    }
  };

  const openDialog = (user, action) => {
    setSelectedUser(user);
    setDialogAction(action);
    setDialogReason('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogReason('');
  };

  const handleApproveRejectUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      
      if (dialogAction === 'approve') {
        await axiosInstance.put(`/admin/approve-seller/${selectedUser._id}`);
        
        // Update local state
        setUsers(prevUsers => prevUsers.map(user => {
          if (user._id === selectedUser._id) {
            return { ...user, status: 'approved' };
          }
          return user;
        }));
      } else if (dialogAction === 'reject') {
        await axiosInstance.put(`/admin/reject-seller/${selectedUser._id}`, {
          reason: dialogReason
        });
        
        // Update local state
        setUsers(prevUsers => prevUsers.map(user => {
          if (user._id === selectedUser._id) {
            return { ...user, status: 'rejected', rejectionReason: dialogReason };
          }
          return user;
        }));
      }
      
      closeDialog();
    } catch (err) {
      console.error(`Error ${dialogAction === 'approve' ? 'approving' : 'rejecting'} user:`, err);
      setError(`Failed to ${dialogAction} user. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Get chip color based on user status
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'approved':
        return { 
          label: 'Approved', 
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />
        };
      case 'rejected':
        return { 
          label: 'Rejected', 
          color: 'error',
          icon: <CancelIcon fontSize="small" />
        };
      case 'pending':
        return { 
          label: 'Pending', 
          color: 'warning',
          icon: null
        };
      default:
        return { 
          label: status || 'Unknown', 
          color: 'default',
          icon: null
        };
    }
  };

  // Get chip color based on user role
  const getRoleChipProps = (role) => {
    switch (role) {
      case 'admin':
        return { 
          label: 'Admin', 
          color: 'secondary',
          sx: { fontWeight: 'medium' }
        };
      case 'seller':
        return { 
          label: 'Seller', 
          color: 'primary',
          sx: {}
        };
      case 'buyer':
        return { 
          label: 'Buyer', 
          color: 'default',
          sx: {}
        };
      default:
        return { 
          label: role || 'Unknown', 
          color: 'default',
          sx: {}
        };
    }
  };

  // Function to email a user
  const emailUser = (user) => {
    window.location.href = `mailto:${user.email}?subject=BytesMA Marketplace: Important Information`;
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
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage all users of your marketplace
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
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

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 1 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PeopleOutlineIcon />} iconPosition="start" label="All Users" sx={{ textTransform: 'none' }} />
          <Tab icon={<PersonAddIcon />} iconPosition="start" label="Pending Sellers" sx={{ textTransform: 'none' }} />
          <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="Approved Sellers" sx={{ textTransform: 'none' }} />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Buyers" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Paper>

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
                placeholder="Search users by name or email..."
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
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="role-filter-label">Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="seller">Seller</MenuItem>
                  <MenuItem value="buyer">Buyer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
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
          ) : users.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search or filter criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setTabValue(0);
                }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const statusChip = getStatusChipProps(user.status);
                  const roleChip = getRoleChipProps(user.role);
                  
                  return (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {user.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={roleChip.label} 
                          color={roleChip.color}
                          size="small"
                          sx={{ ...roleChip.sx }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={statusChip.icon}
                          label={statusChip.label} 
                          color={statusChip.color}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {user.role === 'seller' && user.status === 'pending' && (
                          <>
                            <Tooltip title="Approve Seller">
                              <IconButton 
                                onClick={() => openDialog(user, 'approve')}
                                size="small"
                                color="success"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Seller">
                              <IconButton 
                                onClick={() => openDialog(user, 'reject')}
                                size="small"
                                color="error"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Send Email">
                          <IconButton 
                            onClick={() => emailUser(user)}
                            size="small"
                            color="primary"
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Approval/Rejection Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {dialogAction === 'approve' ? 'Approve Seller Account' : 'Reject Seller Account'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'approve' 
              ? `Are you sure you want to approve ${selectedUser?.name}'s seller account?` 
              : `Are you sure you want to reject ${selectedUser?.name}'s seller account?`}
          </DialogContentText>
          
          {dialogAction === 'reject' && (
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              fullWidth
              variant="outlined"
              value={dialogReason}
              onChange={(e) => setDialogReason(e.target.value)}
              placeholder="Please provide a reason for rejection"
              required
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleApproveRejectUser}
            color={dialogAction === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionLoading || (dialogAction === 'reject' && !dialogReason)}
          >
            {actionLoading 
              ? (dialogAction === 'approve' ? 'Approving...' : 'Rejecting...') 
              : (dialogAction === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserManagementPage;