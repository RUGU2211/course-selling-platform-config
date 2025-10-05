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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  TrendingUp,
  People,
  School,
  AttachMoney,
  Visibility,
  VisibilityOff,
  Star,
  PlayArrow,
  Analytics,
  Notifications,
  Assignment,
  Quiz,
  VideoLibrary,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInstructorCourses, useInstructorStats, useInstructorEarnings } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { Course } from '../../types';

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
      id={`instructor-tabpanel-${index}`}
      aria-labelledby={`instructor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const InstructorDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: courses, isLoading: coursesLoading } = useInstructorCourses();
  const { data: stats } = useInstructorStats();
  const { data: earnings } = useInstructorEarnings();

  const publishedCourses = courses?.filter(c => c.status === 'published') || [];
  const draftCourses = courses?.filter(c => c.status === 'draft') || [];

  const statsData = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: <People />,
      color: 'primary',
      change: '+12%',
    },
    {
      title: 'Total Courses',
      value: courses?.length || 0,
      icon: <School />,
      color: 'success',
      change: '+2',
    },
    {
      title: 'Total Earnings',
      value: `$${earnings?.total || 0}`,
      icon: <AttachMoney />,
      color: 'warning',
      change: '+$234',
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) || '0.0',
      icon: <Star />,
      color: 'info',
      change: '+0.2',
    },
  ];

  const recentActivity = [
    {
      type: 'enrollment',
      title: 'New student enrolled in React Masterclass',
      time: '2 hours ago',
      icon: <People color="success" />,
    },
    {
      type: 'review',
      title: 'New 5-star review on JavaScript Course',
      time: '4 hours ago',
      icon: <Star color="warning" />,
    },
    {
      type: 'question',
      title: 'Student question in Web Development course',
      time: '6 hours ago',
      icon: <Quiz color="primary" />,
    },
    {
      type: 'completion',
      title: 'Student completed Python Basics',
      time: '1 day ago',
      icon: <Assignment color="info" />,
    },
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, course: Course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    // Delete course logic here
    setDeleteDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleTogglePublish = (course: Course) => {
    // Toggle publish status logic here
    handleMenuClose();
  };

  if (coursesLoading) {
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
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Instructor Dashboard 📚
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Manage your courses and track your teaching success
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/instructor/courses/create')}
            >
              Create Course
            </Button>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsData.map((stat, index) => (
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
                        <Chip
                          label={stat.change}
                          size="small"
                          color="success"
                          variant="outlined"
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
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Courses Management */}
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
                  <Tab label="All Courses" />
                  <Tab label="Published" />
                  <Tab label="Drafts" />
                  <Tab label="Analytics" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  {courses && courses.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Course</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Students</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Revenue</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {courses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={course.thumbnailUrl}
                                    alt={course.title}
                                    variant="rounded"
                                    sx={{ width: 60, height: 40 }}
                                  />
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                      {course.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {course.category}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={course.status}
                                  color={course.status === 'published' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{course.enrollmentCount || 0}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Star fontSize="small" color="warning" />
                                  {course.rating?.toFixed(1) || 'N/A'}
                                </Box>
                              </TableCell>
                              <TableCell>${(course.price * (course.enrollmentCount || 0)).toFixed(2)}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={(e) => handleMenuClick(e, course)}
                                  size="small"
                                >
                                  <MoreVert />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No courses yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Create your first course to start teaching
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/instructor/courses/create')}
                        sx={{ mt: 2 }}
                      >
                        Create Course
                      </Button>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    {publishedCourses.map((course) => (
            <Grid size={{ xs: 12, sm: 6 }} key={course.id}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="140"
                            image={course.thumbnailUrl || '/api/placeholder/300/140'}
                            alt={course.title}
                          />
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                              {course.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Chip label={course.category} size="small" color="primary" />
                              <Chip label={course.level} size="small" color="secondary" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="body2">
                                {course.enrollmentCount || 0} students
                              </Typography>
                              <Typography variant="body2">
                                ${course.price}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => navigate(`/courses/${course.id}`)}
                              >
                                View
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Grid container spacing={3}>
                    {draftCourses.map((course) => (
            <Grid size={{ xs: 12, sm: 6 }} key={course.id}>
                        <Card sx={{ opacity: 0.8 }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={course.thumbnailUrl || '/api/placeholder/300/140'}
                            alt={course.title}
                          />
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                              {course.title}
                            </Typography>
                            <Chip label="Draft" color="warning" size="small" sx={{ mb: 2 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Continue editing to publish this course
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                              >
                                Continue Editing
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Analytics sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Analytics Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Detailed analytics and insights coming soon
                    </Typography>
                    <Button variant="outlined" startIcon={<TrendingUp />}>
                      View Analytics
                    </Button>
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
                          secondary={activity.time}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/instructor/courses/create')}
                    >
                      Create New Course
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VideoLibrary />}
                      onClick={() => navigate('/instructor/content')}
                    >
                      Manage Content
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Analytics />}
                      onClick={() => navigate('/instructor/analytics')}
                    >
                      View Analytics
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AttachMoney />}
                      onClick={() => navigate('/instructor/earnings')}
                    >
                      Earnings Report
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Earnings Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Earnings Summary
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${earnings?.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      ${earnings?.thisMonth || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/instructor/earnings')}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Course Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => navigate(`/instructor/courses/${selectedCourse?.id}/edit`)}>
            <Edit sx={{ mr: 1 }} /> Edit Course
          </MenuItem>
          <MenuItem onClick={() => navigate(`/courses/${selectedCourse?.id}`)}>
            <Visibility sx={{ mr: 1 }} /> View Course
          </MenuItem>
          <MenuItem onClick={() => handleTogglePublish(selectedCourse!)}>
            {selectedCourse?.status === 'published' ? (
              <>
                <VisibilityOff sx={{ mr: 1 }} /> Unpublish
              </>
            ) : (
              <>
                <Visibility sx={{ mr: 1 }} /> Publish
              </>
            )}
          </MenuItem>
          <MenuItem onClick={handleDeleteCourse} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Delete Course
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default InstructorDashboard;