import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  School,
  Person,
  Settings,
  Notifications,
  Payment,
  Analytics,
  Group,
  Category,
  Assignment,
  VideoLibrary,
  Quiz,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
  SupervisorAccount,
  TrendingUp,
  AttachMoney,
  Support,
  Feedback,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
  anchor?: 'left' | 'right';
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
  roles?: string[];
  divider?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  variant = 'temporary',
  anchor = 'left',
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
      if (variant === 'temporary') {
        onClose();
      }
    }
  };

  const isItemActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return user && roles.includes(user.role);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      id: 'courses',
      label: 'My Courses',
      icon: <School />,
      path: '/courses/my-courses',
    },
    {
      id: 'browse',
      label: 'Browse Courses',
      icon: <VideoLibrary />,
      path: '/courses',
    },
    { id: 'divider1', label: '', icon: <></>, divider: true },
    {
      id: 'instructor',
      label: 'Instructor',
      icon: <SupervisorAccount />,
      roles: ['INSTRUCTOR', 'ADMIN'],
      children: [
        {
          id: 'instructor-dashboard',
          label: 'Dashboard',
          icon: <Dashboard />,
          path: '/instructor/dashboard',
          roles: ['INSTRUCTOR', 'ADMIN'],
        },
        {
          id: 'instructor-courses',
          label: 'My Courses',
          icon: <School />,
          path: '/instructor/courses',
          roles: ['INSTRUCTOR', 'ADMIN'],
        },
        {
          id: 'create-course',
          label: 'Create Course',
          icon: <Assignment />,
          path: '/instructor/courses/create',
          roles: ['INSTRUCTOR', 'ADMIN'],
        },
        {
          id: 'instructor-analytics',
          label: 'Analytics',
          icon: <Analytics />,
          path: '/instructor/analytics',
          roles: ['INSTRUCTOR', 'ADMIN'],
        },
        {
          id: 'instructor-earnings',
          label: 'Earnings',
          icon: <AttachMoney />,
          path: '/instructor/earnings',
          roles: ['INSTRUCTOR', 'ADMIN'],
        },
      ],
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: <AdminPanelSettings />,
      roles: ['ADMIN'],
      children: [
        {
          id: 'admin-dashboard',
          label: 'Admin Dashboard',
          icon: <Dashboard />,
          path: '/admin/dashboard',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-users',
          label: 'Users',
          icon: <Group />,
          path: '/admin/users',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-courses',
          label: 'Courses',
          icon: <School />,
          path: '/admin/courses',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-categories',
          label: 'Categories',
          icon: <Category />,
          path: '/admin/categories',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-payments',
          label: 'Payments',
          icon: <Payment />,
          path: '/admin/payments',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-analytics',
          label: 'Analytics',
          icon: <TrendingUp />,
          path: '/admin/analytics',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-support',
          label: 'Support',
          icon: <Support />,
          path: '/admin/support',
          roles: ['ADMIN'],
        },
      ],
    },
    { id: 'divider2', label: '', icon: <></>, divider: true },
    {
      id: 'profile',
      label: 'Profile',
      icon: <Person />,
      path: '/profile',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Notifications />,
      path: '/notifications',
    },
    {
      id: 'payments',
      label: 'Payment History',
      icon: <Payment />,
      path: '/payments',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      path: '/settings',
    },
    { id: 'divider3', label: '', icon: <></>, divider: true },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <Feedback />,
      path: '/feedback',
    },
  ];

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (item.divider) {
      return <Divider key={item.id} sx={{ my: 1 }} />;
    }

    if (!hasAccess(item.roles)) {
      return null;
    }

    const isActive = isItemActive(item.path);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive
                ? alpha(theme.palette.primary.main, 0.1)
                : 'transparent',
              color: isActive ? theme.palette.primary.main : 'inherit',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isActive ? theme.palette.primary.main : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          CourseHub
        </Typography>
        {user && (
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Welcome, {user.firstName}
          </Typography>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.grey[500], 0.05),
        }}
      >
        <Typography variant="caption" color="text.secondary">
          CourseHub v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      anchor={anchor}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 280,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;