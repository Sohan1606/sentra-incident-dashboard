import React from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, 
  Avatar, Tooltip, useTheme, useMediaQuery, Fade, Chip 
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  People as PeopleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const goHome = () => {
    if (!user) return navigate('/login');
    const routes = {
      admin: '/admin',
      staff: '/staff',
      student: '/student'
    };
    navigate(routes[user.role] || '/student');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'staff': return 'warning';
      case 'student': return 'info';
      default: return 'default';
    }
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    const links = {
      admin: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { label: 'Incidents', icon: <ReportIcon />, path: '/admin/incidents' },
        { label: 'Staff', icon: <PeopleIcon />, path: '/admin/staff' }
      ],
      staff: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/staff' }
      ],
      student: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
        { label: 'Report', icon: <ReportIcon />, path: '/student/report' },
        { label: 'My Incidents', icon: <ReportIcon />, path: '/student/my-incidents' },
        { label: 'Awareness', icon: <PeopleIcon />, path: '/awareness' }
      ]
    };
    return links[user.role] || [];
  };

  return (
    <Fade in timeout={600}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Tooltip title="Sentra Dashboard">
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)' }
              }}
              onClick={goHome}
            >
              <Box sx={{ 
                mr: 2, 
                p: 1.5, 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: 2 
              }}>
                <DashboardIcon sx={{ color: 'white' }} />
              </Box>
              <Typography 
                variant="h5" 
                fontWeight={700}
                sx={{ 
                  background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                Sentra
              </Typography>
            </Box>
          </Tooltip>

          {/* Desktop Navigation */}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getNavLinks().map((link) => (
                <Tooltip key={link.path} title={link.label}>
                  <IconButton
                    onClick={() => navigate(link.path)}
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {link.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}

          {/* Right side: Role + Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle - Always visible */}
            <ThemeToggle />

            {/* User Info */}
            {user ? (
              <>
                <Fade in timeout={800}>
                  <Chip
                    label={user.role.toUpperCase()}
                    color={getRoleColor(user.role)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Fade>
                
                <Tooltip title={`Welcome, ${user.name || user.email}`}>
                  <Avatar 
                    sx={{ 
                      width: 36, height: 36, 
                      bgcolor: 'rgba(255,255,255,0.3)',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                    onClick={handleLogout}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Login">
                <IconButton onClick={() => navigate('/login')} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Fade>
  );
};

export default Navbar;
