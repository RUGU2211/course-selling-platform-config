import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow,
  School,
  TrendingUp,
  AccessTime,
  Star,
  EmojiEvents,
  Notifications,
  Assignment,
  Quiz,
  BookmarkBorder,
  CalendarToday,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserEnrollments, useUserProfile, useNotifications } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { Enrollment, Notification } from '../../types';

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const { data: enrollments, isLoading: enrollmentsLoading } = useUserEnrollments();
  const { data: profile } = useUserProfile();
  const { data: notifications } = useNotifications({ limit: 5 });

  const activeEnrollments = enrollments?.filter(e => e.status === 'active') || [];
  const completedEnrollments = enrollments?.filter(e => e.status === 'completed') || [];
  const totalProgress = activeEnrollments.length > 0 
    ? activeEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / activeEnrollments.length 
    : 0;

  const stats = [
    {
      title: 'Enrolled Courses',
      value: activeEnrollments.length,
      icon: <School />,
      color: 'primary',
    },
    {
      title: 'Completed Courses',
      value: completedEnrollments.length,
      icon: <CheckCircle />,
      color: 'success',
    },
    {
      title: 'Average Progress',
      value: `${Math.round(totalProgress)}%`,
      icon: <TrendingUp />,
      color: 'info',
    },
    {
      title: 'Certificates Earned',
      value: completedEnrollments.length,
      icon: <EmojiEvents />,
      color: 'warning',
    },
  ];

  const recentActivity = [
    {
      type: 'lesson_completed',
      title: 'Completed "Introduction to React Hooks"',
      course: 'React Masterclass',
      time: '2 hours ago',
      icon: <CheckCircle color="success" />,
    },
    {
      type: 'quiz_completed',
      title: 'Passed JavaScript Fundamentals Quiz',
      course: 'JavaScript Complete Course',
      time: '1 day ago',
      icon: <Quiz color="primary" />,
    },
    {
      type: 'assignment_submitted',
      title: 'Submitted Portfolio Project',
      course: 'Web Development Bootcamp',
      time: '2 days ago',
      icon: <Assignment color="info" />,
    },
  ];

  const upcomingDeadlines = [
    {
      title: 'Final Project Submission',
      course: 'React Masterclass',
      dueDate: '2024-02-15',
      type: 'assignment',
    },
    {
      title: 'Module 3 Quiz',
      course: 'JavaScript Complete Course',
      dueDate: '2024-02-12',
      type: 'quiz',
    },
  ];

  if (enrollmentsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome back, {user?.firstName}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Continue your learning journey and track your progress
            </Typography>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
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
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
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
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Continue Learning */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Paper sx={{ mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Continue Learning" />
                  <Tab label="Completed Courses" />
                  <Tab label="Bookmarks" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  {activeEnrollments.length > 0 ? (
                    <Grid container spacing={3}>
                      {activeEnrollments.slice(0, 6).map((enrollment) => (
            <Grid size={{ xs: 12, sm: 6 }} key={enrollment.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[8],
                              },
                            }}
                            onClick={() => navigate(`/courses/${enrollment.course.id}/learn`)}
                          >
                            <CardMedia
                              component="img"
                              height="140"
                              image={enrollment.course.thumbnailUrl || '/api/placeholder/300/140'}
                              alt={enrollment.course.title}
                            />
                            <CardContent>
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {enrollment.course.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                by {enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}
                              </Typography>
                              
                              <Box sx={{ mt: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">Progress</Typography>
                                  <Typography variant="body2">{Math.round(enrollment.progress || 0)}%</Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={enrollment.progress || 0}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>

                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PlayArrow />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/courses/${enrollment.course.id}/learn`);
                                }}
                              >
                                Continue Learning
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No active courses
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Start learning by enrolling in a course
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/courses')}
                        sx={{ mt: 2 }}
                      >
                        Browse Courses
                      </Button>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {completedEnrollments.length > 0 ? (
                    <Grid container spacing={3}>
                      {completedEnrollments.map((enrollment) => (
            <Grid size={{ xs: 12, sm: 6 }} key={enrollment.id}>
                          <Card>
                            <CardMedia
                              component="img"
                              height="140"
                              image={enrollment.course.thumbnailUrl || '/api/placeholder/300/140'}
                              alt={enrollment.course.title}
                            />
                            <CardContent>
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {enrollment.course.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                by {enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <Chip
                                  label="Completed"
                                  color="success"
                                  size="small"
                                  icon={<CheckCircle />}
                                />
                                <Chip
                                  label="Certificate Available"
                                  color="warning"
                                  size="small"
                                  icon={<EmojiEvents />}
                                />
                              </Box>

                              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => navigate(`/courses/${enrollment.course.id}`)}
                                >
                                  View Course
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<EmojiEvents />}
                                >
                                  Certificate
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No completed courses yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Complete your enrolled courses to see them here
                      </Typography>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <BookmarkBorder sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No bookmarked courses
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Bookmark courses to save them for later
                    </Typography>
                  </Box>
                </TabPanel>
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Column */}
        <Grid size={{ xs: 12, md: 4 }}>
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Recent Activity
                  </Typography>
                  <List dense>
                    {recentActivity.map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {activity.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="primary">
                                {activity.course}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {activity.time}
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

            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Upcoming Deadlines
                  </Typography>
                  {upcomingDeadlines.length > 0 ? (
                    <List dense>
                      {upcomingDeadlines.map((deadline, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CalendarToday color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={deadline.title}
                            secondary={
                              <Box>
                                <Typography variant="caption" color="primary">
                                  {deadline.course}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Due: {new Date(deadline.dueDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No upcoming deadlines
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Notifications
                    </Typography>
                    <Button size="small" onClick={() => navigate('/notifications')}>
                      View All
                    </Button>
                  </Box>
                  {notifications && notifications.length > 0 ? (
                    <List dense>
                      {notifications.slice(0, 3).map((notification) => (
                        <ListItem key={notification.id} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Notifications color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={notification.title}
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No new notifications
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;