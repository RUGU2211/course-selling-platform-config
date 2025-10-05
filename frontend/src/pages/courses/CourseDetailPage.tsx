import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Rating,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow,
  ExpandMore,
  CheckCircle,
  AccessTime,
  People,
  Language,
  School,
  Star,
  Share,
  Bookmark,
  BookmarkBorder,
  Download,
  Quiz,
  Assignment,
  VideoLibrary,
  Article,
  Lock,
  PlayCircleOutline,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourse, useEnrollment, useCreateEnrollment } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { Course, CourseContent } from '../../types';

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
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const CourseDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const courseId = parseInt(id || '0');
  const { data: course, isLoading, error } = useCourse(courseId);
  const { data: enrollment } = useEnrollment(courseId);
  const createEnrollmentMutation = useCreateEnrollment();

  const isEnrolled = !!enrollment;
  const canAccess = isEnrolled || course?.price === 0;

  useEffect(() => {
    // Check if course is bookmarked (this would typically come from an API)
    setIsBookmarked(false);
  }, [courseId]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    if (course?.price === 0) {
      // Free course - enroll directly
      try {
        await createEnrollmentMutation.mutateAsync({ courseId });
        setEnrollDialogOpen(false);
      } catch (error) {
        console.error('Enrollment failed:', error);
      }
    } else {
      // Paid course - redirect to payment
      navigate(`/payment/course/${courseId}`);
    }
  };

  const handlePreview = (videoUrl: string) => {
    setPreviewVideo(videoUrl);
    setPreviewDialogOpen(true);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // This would typically make an API call to save/remove bookmark
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: course?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const renderContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoLibrary />;
      case 'quiz':
        return <Quiz />;
      case 'assignment':
        return <Assignment />;
      case 'document':
        return <Article />;
      default:
        return <PlayCircleOutline />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Course not found or failed to load. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={course.category} color="primary" />
                  <Chip label={course.level} color="secondary" variant="outlined" />
                  {course.featured && <Chip label="Featured" color="warning" />}
                </Box>

                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {course.title}
                </Typography>

                <Typography variant="h6" color="text.secondary" paragraph>
                  {course.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={course.rating || 0} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {course.rating?.toFixed(1) || 'N/A'} ({course.enrollmentCount || 0} students)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {course.duration || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Language fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {course.language || 'English'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={course.instructor?.profilePicture}
                    alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Instructor
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>

            {/* Course Video Preview */}
            {course.previewVideoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      backgroundColor: 'black',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePreview(course.previewVideoUrl!)}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.common.black, 0.5),
                      }}
                    >
                      <PlayCircleOutline sx={{ fontSize: 80, color: 'white' }} />
                    </Box>
                    <img
                      src={course.thumbnailUrl || '/api/placeholder/800/450'}
                      alt={course.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Card>
              </motion.div>
            )}

            {/* Course Tabs */}
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
                  <Tab label="Overview" />
                  <Tab label="Curriculum" />
                  <Tab label="Instructor" />
                  <Tab label="Reviews" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  {/* Overview */}
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      What you'll learn
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      {course.learningObjectives?.map((objective, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <CheckCircle color="success" sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
                            <Typography variant="body1">{objective}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Requirements
                    </Typography>
                    <List dense>
                      {course.requirements?.map((requirement, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={requirement} />
                        </ListItem>
                      ))}
                    </List>

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
                      Course Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {course.longDescription || course.description}
                    </Typography>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {/* Curriculum */}
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Course Content
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {course.content?.length || 0} sections • {course.totalLessons || 0} lectures • {course.duration || 'N/A'} total length
                  </Typography>

                  {course.content?.map((section, sectionIndex) => (
                    <Accordion key={section.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                            Section {sectionIndex + 1}: {section.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {section.lessons?.length || 0} lectures • {formatDuration(section.duration || 0)}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {section.lessons?.map((lesson, lessonIndex) => (
                            <ListItem key={lesson.id} sx={{ py: 1 }}>
                              <ListItemIcon>
                                {canAccess || lesson.isFree ? (
                                  renderContentIcon(lesson.type)
                                ) : (
                                  <Lock color="disabled" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">
                                      {lessonIndex + 1}. {lesson.title}
                                    </Typography>
                                    {lesson.isFree && (
                                      <Chip label="Free" size="small" color="success" variant="outlined" />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption">
                                      {formatDuration(lesson.duration || 0)}
                                    </Typography>
                                    {lesson.type === 'video' && lesson.isFree && (
                                      <Button
                                        size="small"
                                        onClick={() => handlePreview(lesson.videoUrl || '')}
                                      >
                                        Preview
                                      </Button>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {/* Instructor */}
                  <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                    <Avatar
                      src={course.instructor?.profilePicture}
                      alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {course.instructor?.title || 'Instructor'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star color="warning" fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {course.instructor?.rating?.toFixed(1) || 'N/A'} rating
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <People fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {course.instructor?.totalStudents || 0} students
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <School fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {course.instructor?.totalCourses || 0} courses
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body1">
                    {course.instructor?.bio || 'No bio available.'}
                  </Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  {/* Reviews */}
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Student Reviews
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {course.rating?.toFixed(1) || 'N/A'}
                    </Typography>
                    <Box>
                      <Rating value={course.rating || 0} precision={0.1} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        Based on {course.enrollmentCount || 0} reviews
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Rating breakdown would go here */}
                  <Typography variant="body1" color="text.secondary">
                    Reviews feature coming soon...
                  </Typography>
                </TabPanel>
              </Paper>
            </motion.div>
          </Grid>

          {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card sx={{ position: 'sticky', top: 24 }}>
                <CardContent>
                  {/* Price */}
                  <Box sx={{ mb: 3 }}>
                    {course.price > 0 ? (
                      <Box>
                        <Typography variant="h4" component="span" sx={{ fontWeight: 'bold' }}>
                          ${course.price}
                        </Typography>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <Typography
                            variant="h6"
                            component="span"
                            sx={{ textDecoration: 'line-through', ml: 2, color: 'text.secondary' }}
                          >
                            ${course.originalPrice}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        FREE
                      </Typography>
                    )}
                  </Box>

                  {/* Enrollment Status */}
                  {isEnrolled ? (
                    <Box sx={{ mb: 3 }}>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        You are enrolled in this course
                      </Alert>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={() => navigate(`/courses/${courseId}/learn`)}
                      >
                        Continue Learning
                      </Button>
                      {enrollment?.progress && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Progress: {Math.round(enrollment.progress)}%
                          </Typography>
                          <LinearProgress variant="determinate" value={enrollment.progress} />
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ mb: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => setEnrollDialogOpen(true)}
                        disabled={createEnrollmentMutation.isLoading}
                      >
                        {createEnrollmentMutation.isLoading ? (
                          <CircularProgress size={24} />
                        ) : course.price === 0 ? (
                          'Enroll for Free'
                        ) : (
                          'Buy Now'
                        )}
                      </Button>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                      onClick={handleBookmark}
                      sx={{ flex: 1 }}
                    >
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleShare}
                      sx={{ flex: 1 }}
                    >
                      Share
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Course Info */}
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    This course includes:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <VideoLibrary color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={`${course.totalLessons || 0} video lectures`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Download color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Downloadable resources" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <AccessTime color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Lifetime access" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <School color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Certificate of completion" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Enrollment Dialog */}
        <Dialog open={enrollDialogOpen} onClose={() => setEnrollDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {course.price === 0 ? 'Enroll in Course' : 'Purchase Course'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              {course.price === 0
                ? 'This course is free. Click confirm to enroll.'
                : `You are about to purchase "${course.title}" for $${course.price}.`}
            </Typography>
            {!isAuthenticated && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You need to log in to enroll in this course.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleEnroll}
              disabled={createEnrollmentMutation.isLoading}
            >
              {createEnrollmentMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : course.price === 0 ? (
                'Confirm Enrollment'
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Course Preview</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '56.25%', // 16:9 aspect ratio
                backgroundColor: 'black',
              }}
            >
              {previewVideo && (
                <video
                  controls
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <source src={previewVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CourseDetailPage;