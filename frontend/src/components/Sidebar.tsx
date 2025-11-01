import React from 'react';
import { Drawer, List, ListItemText, Toolbar, Box, ListItemButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

const drawerWidth = 240;

const Sidebar: React.FC<SidebarProps> = ({ open, handleDrawerToggle }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isActive = (path: string, exact = false) => (
    exact ? location.pathname === path : location.pathname.startsWith(path)
  );

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItemButton component={Link} to="/" selected={isActive('/', true)}>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={Link} to="/courses" selected={isActive('/courses')}>
          <ListItemText primary="Courses" />
        </ListItemButton>
        {isAuthenticated && user && (
          <>
            {user.role === 'STUDENT' && (
              <>
                <ListItemButton component={Link} to="/dashboard" selected={isActive('/dashboard', true)}>
                  <ListItemText primary="Student Dashboard" />
                </ListItemButton>
              </>
            )}
            {user.role === 'INSTRUCTOR' && (
              <>
                <ListItemButton component={Link} to="/instructor/dashboard" selected={isActive('/instructor/dashboard')}>
                  <ListItemText primary="Instructor Dashboard" />
                </ListItemButton>
                <ListItemButton component={Link} to="/instructor/create-course" selected={isActive('/instructor/create-course', true)}>
                  <ListItemText primary="Create Course" />
                </ListItemButton>
              </>
            )}
            {/* Removed admin links to enforce only Student and Instructor roles */}
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
