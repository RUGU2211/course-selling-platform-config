import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard,
  People,
  School,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
  Block,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Analytics,
  Settings,
  Notifications,
  Report,
  Security,
  Category,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data - replace with actual API calls
  const platformStats = {
    totalUsers: 15420,
    totalInstructors: 342,
    totalCourses: 1250,
    totalRevenue: 125000,
    activeUsers: 8920,
    pendingCourses: 23,
    reportedContent: 5,
    systemHealth: 98.5,
  };

  const recentUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      status: 'active',
      joinDate: '2024-01-15',
      avatar: '/api/placeholder/40/40',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'instructor',
      status: 'pending',
      joinDate: '2024-01-14',
      avatar: '/api/placeholder/40/40',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'student',
      status: 'active',
      joinDate: '2024-01-13',
      avatar: '/api/placeholder/40/40',
    },
  ];

  const pendingCourses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      instructor: 'Sarah Wilson',
      category: 'Programming',
      submittedDate: '2024-01-15',
      status: 'pending_review',
    },
    {
      id: 2,
      title: 'Digital Marketing Mastery',
      instructor: 'Tom Brown',
      category: 'Marketing',
      submittedDate: '2024-01-14',
      status: 'pending_review',
    },
  ];

  const systemAlerts = [
    {
      type: 'warning',
      title: 'High server load detected',
      description: 'Server CPU usage is above 85%',
      time: '5 minutes ago',
      severity: 'medium',
    },
    {
      type: 'info',
      title: 'Scheduled maintenance',
      description: 'System maintenance scheduled for tonight',
      time: '2 hours ago',
      severity: 'low',
    },
    {
      type: 'error',
      title: 'Payment gateway issue',
      description: 'Some payments are failing',
      time: '1 hour ago',
      severity: 'high',
    },
  ];

  const statsCards = [
    {
      title: 'Total Users',
      value: platformStats.totalUsers.toLocaleString(),
      icon: <People />,
      color: 'primary',
      change: '+12%',
      subtitle: `${platformStats.activeUsers.toLocaleString()} active`,
    },
    {
      title: 'Total Courses',
      value: platformStats.totalCourses.toLocaleString(),
      icon: <School />,
      color: 'success',
      change: '+8%',
      subtitle: `${platformStats.pendingCourses} pending review`,
    },
    {
      title: 'Platform Revenue',
      value: `$${platformStats.totalRevenue.toLocaleString()}`,
      icon: <AttachMoney />,
      color: 'warning',
      change: '+15%',
      subtitle: 'This month',
    },
    {
      title: 'System Health',
      value: `${platformStats.systemHealth}%`,
      icon: <TrendingUp />,
      color: 'info',
      change: '+0.5%',
      subtitle: 'All systems operational',
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: <People />,
      action: () => navigate('/admin/users'),
      color: 'primary',
    },
    {
      title: 'Course Review',
      description: 'Review pending courses',
      icon: <School />,
      action: () => navigate('/admin/courses'),
      color: 'success',
      badge: platformStats.pendingCourses,
    },
    {
      title: 'Analytics',
      description: 'View platform analytics',
      icon: <Analytics />,
      action: () => navigate('/admin/analytics'),
      color: 'info',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: <Settings />,
      action: () => navigate('/admin/settings'),
      color: 'warning',
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <Warning color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <CheckCircle color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Admin Dashboard 🛠️
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Platform overview and management tools
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                onClick={() => navigate('/admin/analytics')}
              >
                View Analytics
              </Button>
              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={() => navigate('/admin/settings')}
              >
                Settings
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsCards.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette[stat.color as keyof typeof theme.palette].main, 0.1)}, ${alpha(theme.palette[stat.color as keyof typeof theme.palette].main, 0.05)})`,
                    border: `1px solid ${alpha(theme.palette[stat.color as keyof typeof theme.palette].main, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {stat.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {stat.subtitle}
                        </Typography>
                        <Chip
                          label={stat.change}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette[stat.color as keyof typeof theme.palette].main, 0.1),
                          color: theme.palette[stat.color as keyof typeof theme.palette].main,
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Paper sx={{ mb: 4 }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {quickActions.map((action, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' },
                            position: 'relative',
                          }}
                          onClick={action.action}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            {action.badge && (
                              <Chip
                                label={action.badge}
                                color="error"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                }}
                              />
                            )}
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette[action.color as keyof typeof theme.palette].main, 0.1),
                                color: theme.palette[action.color as keyof typeof theme.palette].main,
                                display: 'inline-flex',
                                mb: 2,
                              }}
                            >
                              {action.icon}
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} gutterBottom>
                              {action.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </motion.div>

            {/* Management Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Paper>
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Recent Users" />
                  <Tab label="Pending Courses" />
                  <Tab label="Reports" />
                  <Tab label="System Logs" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Join Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={user.avatar} alt={user.name} />
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {user.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                color={user.role === 'instructor' ? 'primary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.status}
                                color={user.status === 'active' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{user.joinDate}</TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <MoreVert />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell>Instructor</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Submitted</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pendingCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {course.title}
                              </Typography>
                            </TableCell>
                            <TableCell>{course.instructor}</TableCell>
                            <TableCell>
                              <Chip label={course.category} size="small" color="primary" />
                            </TableCell>
                            <TableCell>{course.submittedDate}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" color="success">
                                  Approve
                                </Button>
                                <Button size="small" variant="outlined" color="error">
                                  Reject
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Report sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Reports Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Detailed reporting features coming soon
                    </Typography>
                    <Button variant="outlined" startIcon={<Analytics />}>
                      View Reports
                    </Button>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Security sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      System Logs
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      System monitoring and logs interface
                    </Typography>
                    <Button variant="outlined" startIcon={<Visibility />}>
                      View Logs
                    </Button>
                  </Box>
                </TabPanel>
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
            {/* System Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    System Alerts
                  </Typography>
                  <List dense>
                    {systemAlerts.map((alert, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getAlertIcon(alert.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {alert.title}
                              </Typography>
                              <Chip
                                label={alert.severity}
                                size="small"
                                color={getAlertColor(alert.severity) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {alert.description}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {alert.time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    System Health
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">CPU Usage</Typography>
                      <Typography variant="body2">65%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={65} color="success" />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Memory Usage</Typography>
                      <Typography variant="body2">78%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={78} color="warning" />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Disk Usage</Typography>
                      <Typography variant="body2">45%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={45} color="info" />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Network</Typography>
                      <Typography variant="body2">Normal</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={30} color="success" />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Platform Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Platform Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Active Instructors</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {platformStats.totalInstructors}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Course Completion Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        73%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Average Rating</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        4.6/5
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Support Tickets</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        12 Open
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/admin/analytics')}
                  >
                    View Full Analytics
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;