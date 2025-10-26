import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box, Chip, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BoltIcon from '@mui/icons-material/Bolt';

interface HeaderProps {
  handleDrawerToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [actionsEl, setActionsEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const actionsOpen = Boolean(actionsEl);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleActionsOpen = (event: React.MouseEvent<HTMLElement>) => setActionsEl(event.currentTarget);
  const handleActionsClose = () => setActionsEl(null);

  const isActive = (path: string, exact = false) => (
    exact ? location.pathname === path : location.pathname.startsWith(path)
  );
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)' }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>
            Course Platform
          </Link>
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Button color="inherit" component={Link} to="/courses" sx={{
            opacity: isActive('/courses') ? 1 : 0.85,
            borderBottom: isActive('/courses', true) ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
            borderRadius: 0
          }}>
            Courses
          </Button>
          {isAuthenticated && user ? (
            <>
              {user.role === 'STUDENT' && (
                <>
                  <Button color="inherit" component={Link} to="/dashboard" sx={{
                    opacity: isActive('/dashboard') ? 1 : 0.85,
                    borderBottom: isActive('/dashboard', true) ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                    borderRadius: 0
                  }}>Dashboard</Button>
                  <Button color="inherit" component={Link} to="/student/payments" sx={{
                    opacity: isActive('/student/payments') ? 1 : 0.85,
                    borderBottom: isActive('/student/payments', true) ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                    borderRadius: 0
                  }}>Payments</Button>
                </>
              )}
              {user.role === 'INSTRUCTOR' && (
                <>
                  <Button color="inherit" component={Link} to="/instructor/dashboard" sx={{
                    opacity: isActive('/instructor/dashboard') ? 1 : 0.85,
                    borderBottom: isActive('/instructor/dashboard') ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                    borderRadius: 0
                  }}>Instructor</Button>
                  <Button color="inherit" component={Link} to="/instructor/create-course" sx={{
                    opacity: isActive('/instructor/create-course') ? 1 : 0.85,
                    borderBottom: isActive('/instructor/create-course', true) ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                    borderRadius: 0
                  }}>Create Course</Button>
                </>
              )}
              <IconButton color="inherit" onClick={handleActionsOpen} sx={{ ml: 1 }} aria-label="quick actions">
                <BoltIcon />
              </IconButton>
              <Menu anchorEl={actionsEl} open={actionsOpen} onClose={handleActionsClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                {user.role === 'STUDENT'
                  ? [
                      <MenuItem key="payments" onClick={() => { handleActionsClose(); navigate('/student/payments'); }}>View Payments</MenuItem>,
                      <MenuItem key="browse" onClick={() => { handleActionsClose(); navigate('/courses'); }}>Browse Courses</MenuItem>,
                    ]
                  : user.role === 'INSTRUCTOR'
                  ? [
                      <MenuItem key="create" onClick={() => { handleActionsClose(); navigate('/instructor/create-course'); }}>Create Course</MenuItem>,
                      <MenuItem key="mycourses" onClick={() => { handleActionsClose(); navigate('/instructor/dashboard'); }}>My Courses</MenuItem>,
                    ]
                  : null}
              </Menu>
              <Chip label={user.role === 'STUDENT' ? 'Student' : 'Instructor'} size="small" sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <IconButton color="inherit" onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.25)' }}>{initials}</Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <MenuItem onClick={() => { handleClose(); navigate(user.role === 'STUDENT' ? '/dashboard' : '/instructor/dashboard'); }}>My Dashboard</MenuItem>
                <MenuItem onClick={() => { handleClose(); logout(); }}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" sx={{ opacity: isActive('/login', true) ? 1 : 0.85, borderBottom: isActive('/login', true) ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent', borderRadius: 0 }}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register" sx={{ opacity: isActive('/register', true) ? 1 : 0.85, borderBottom: isActive('/register', true) ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent', borderRadius: 0 }}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
