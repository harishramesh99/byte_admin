import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// MUI Components
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Container,
  useTheme,
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  AccountCircle,
  PeopleOutline as UsersIcon,
  TrendingUp as ReportsIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigationItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { name: 'User Management', path: '/admin/users', icon: <UsersIcon /> },
    { name: 'Seller Approvals', path: '/admin/sellers', icon: <PeopleIcon /> },
    { name: 'Products', path: '/admin/products', icon: <InventoryIcon /> },
    { name: 'Reports', path: '/admin/reports', icon: <ReportsIcon /> },
   // { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getUserInitials = () => {
    if (currentUser?.name) {
      return currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'A';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        justifyContent: 'center', 
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 1.5 
      }}>
        <Typography variant="h6" fontWeight="bold">Admin Panel</Typography>
      </Toolbar>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
      }}>
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            mb: 1,
            width: 56,
            height: 56,
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          {getUserInitials()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 0.5 }}>
          {currentUser?.name || 'Super Admin'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          {currentUser?.email || 'admin@example.com'}
        </Typography>
      </Box>
      
      <List sx={{ flexGrow: 1, py: 0 }}>
        {navigationItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isSelected}
                sx={{
                  py: 1.5,
                  pl: 3,
                  borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(144, 202, 249, 0.16)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.24)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: isSelected ? theme.palette.primary.main : 'inherit' 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 'medium' : 'normal',
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider />
      
      <List sx={{ py: 0 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              py: 1.5,
              pl: 3,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontSize: '0.95rem' }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            {
              navigationItems.find(item => item.path === location.pathname)?.name || 
              location.pathname.split('/')[2]?.replace(/^\w/, c => c.toUpperCase()) || 
              'Admin'
            }
          </Typography>
          
          
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 2,
              sx: { 
                minWidth: 180,
                mt: 1,
                '& .MuiMenuItem-root': {
                  py: 1,
                  px: 2
                }
              }
            }}
          >
            <MenuItem onClick={() => navigate('/admin/profile')}>Profile</MenuItem>
            <MenuItem onClick={() => navigate('/admin/settings')}>Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer Section */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin sidebar"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Space for fixed app bar */}
        <Container 
          maxWidth={false} 
          disableGutters 
          sx={{ 
            px: { xs: 2, md: 4 },
            py: 3, 
            height: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;