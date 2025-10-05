import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  LinearProgress,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  Fullscreen,
  ExpandLess,
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Menu,
  Close,
  Download,
  Quiz,
  Assignment,
  VideoLibrary,
  Article,
  Notes,
  Star,
  Send,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourse, useEnrollment, useUpdateProgress } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { CourseContent, Lesson } from '../../types';

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
      id={`player-tabpanel-${index}`}
      aria-labelledby={`player-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

const CoursePlayerPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSection, setCurrentSection] = useState<CourseContent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const courseId = parseInt(id || '0');
  const { data: course, isLoading, error } = useCourse(courseId);
  const { data: enrollment } = useEnrollment(courseId);
  const updateProgressMutation = useUpdateProgress();

  useEffect(() => {
    if (course?.content && course.content.length > 0) {
      // Find the first incomplete lesson or start from the beginning
      let firstLesson: Lesson | null = null;
      let firstSection: CourseContent | null = null;

      for (const section of course.content) {
        if (section.lessons && section.lessons.length > 0) {
          for (const lesson of section.lessons) {
            if (!completedLessons.has(lesson.id)) {
              firstLesson = lesson;
              firstSection = section;
              break;
            }
          }
          if (firstLesson) break;
        }
      }

      if (!firstLesson && course.content[0]?.lessons?.[0]) {
        firstLesson = course.content[0].lessons[0];
        firstSection = course.content[0];
      }

      if (firstLesson && firstSection) {
        setCurrentLesson(firstLesson);
        setCurrentSection(firstSection);
        setExpandedSections(new Set([firstSection.id]));
      }
    }
  }, [course, completedLessons]);

  useEffect(() => {
    if (enrollment?.completedLessons) {
      setCompletedLessons(new Set(enrollment.completedLessons));
    }
  }, [enrollment]);

  const handleLessonSelect = (lesson: Lesson, section: CourseContent) => {
    setCurrentLesson(lesson);
    setCurrentSection(section);
    setVideoProgress(0);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSectionToggle = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleLessonComplete = async (lessonId: number) => {
    try {
      await updateProgressMutation.mutateAsync({
        courseId,
        lessonId,
        completed: true,
      });
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      
      // Auto-advance to next lesson
      const nextLesson = getNextLesson();
      if (nextLesson) {
        setTimeout(() => {
          handleLessonSelect(nextLesson.lesson, nextLesson.section);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const getNextLesson = (): { lesson: Lesson; section: CourseContent } | null => {
    if (!course?.content || !currentSection || !currentLesson) return null;

    const currentSectionIndex = course.content.findIndex(s => s.id === currentSection.id);
    const currentLessonIndex = currentSection.lessons?.findIndex(l => l.id === currentLesson.id) || 0;

    // Try next lesson in current section
    if (currentSection.lessons && currentLessonIndex < currentSection.lessons.length - 1) {
      return {
        lesson: currentSection.lessons[currentLessonIndex + 1],
        section: currentSection,
      };
    }

    // Try first lesson in next section
    if (currentSectionIndex < course.content.length - 1) {
      const nextSection = course.content[currentSectionIndex + 1];
      if (nextSection.lessons && nextSection.lessons.length > 0) {
        return {
          lesson: nextSection.lessons[0],
          section: nextSection,
        };
      }
    }

    return null;
  };

  const getPreviousLesson = (): { lesson: Lesson; section: CourseContent } | null => {
    if (!course?.content || !currentSection || !currentLesson) return null;

    const currentSectionIndex = course.content.findIndex(s => s.id === currentSection.id);
    const currentLessonIndex = currentSection.lessons?.findIndex(l => l.id === currentLesson.id) || 0;

    // Try previous lesson in current section
    if (currentLessonIndex > 0 && currentSection.lessons) {
      return {
        lesson: currentSection.lessons[currentLessonIndex - 1],
        section: currentSection,
      };
    }

    // Try last lesson in previous section
    if (currentSectionIndex > 0) {
      const prevSection = course.content[currentSectionIndex - 1];
      if (prevSection.lessons && prevSection.lessons.length > 0) {
        return {
          lesson: prevSection.lessons[prevSection.lessons.length - 1],
          section: prevSection,
        };
      }
    }

    return null;
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);

      // Mark lesson as complete when 90% watched
      if (progress >= 90 && currentLesson && !completedLessons.has(currentLesson.id)) {
        handleLessonComplete(currentLesson.id);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
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
        return <VideoLibrary />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading course...</Typography>
      </Box>
    );
  }

  if (error || !course || !enrollment) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Course not found or you don't have access to this course.
        </Alert>
      </Container>
    );
  }

  const sidebarContent = (
    <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {course.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            Progress: {Math.round(enrollment.progress || 0)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={enrollment.progress || 0}
            sx={{ flex: 1, ml: 1 }}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {course.content?.map((section, sectionIndex) => (
            <Box key={section.id}>
              <ListItemButton
                onClick={() => handleSectionToggle(section.id)}
                sx={{ py: 1.5 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {sectionIndex + 1}. {section.title}
                    </Typography>
                  }
                  secondary={`${section.lessons?.length || 0} lessons`}
                />
                {expandedSections.has(section.id) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={expandedSections.has(section.id)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.lessons?.map((lesson, lessonIndex) => (
                    <ListItemButton
                      key={lesson.id}
                      selected={currentLesson?.id === lesson.id}
                      onClick={() => handleLessonSelect(lesson, section)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {completedLessons.has(lesson.id) ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <RadioButtonUnchecked color="action" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {renderContentIcon(lesson.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            {lessonIndex + 1}. {lesson.title}
                          </Typography>
                        }
                        secondary={formatDuration(lesson.duration || 0)}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setReviewDialogOpen(true)}
          startIcon={<Star />}
        >
          Rate Course
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <IconButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold' }}>
          {currentLesson?.title || 'Select a lesson'}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Course Details
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {isMobile ? (
          <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            ModalProps={{ keepMounted: true }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 400 }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden', borderRight: `1px solid ${theme.palette.divider}` }}
              >
                {sidebarContent}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentLesson ? (
            <>
              {/* Video Player */}
              {currentLesson.type === 'video' && currentLesson.videoUrl && (
                <Box sx={{ position: 'relative', backgroundColor: 'black' }}>
                  <video
                    ref={videoRef}
                    src={currentLesson.videoUrl}
                    style={{ width: '100%', height: 'auto', maxHeight: '60vh' }}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                  />
                  
                  {/* Custom Controls */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        const prev = getPreviousLesson();
                        if (prev) handleLessonSelect(prev.lesson, prev.section);
                      }}
                      disabled={!getPreviousLesson()}
                      sx={{ color: 'white' }}
                    >
                      <SkipPrevious />
                    </IconButton>
                    
                    <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
                      {isPlaying ? <Pause /> : <PlayArrow />}
                    </IconButton>
                    
                    <IconButton
                      onClick={() => {
                        const next = getNextLesson();
                        if (next) handleLessonSelect(next.lesson, next.section);
                      }}
                      disabled={!getNextLesson()}
                      sx={{ color: 'white' }}
                    >
                      <SkipNext />
                    </IconButton>

                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={videoProgress}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
                      <Fullscreen />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Content Area */}
              <Box sx={{ flex: 1, p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {currentLesson.title}
                    </Typography>
                    <Chip
                      label={currentLesson.type}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    {completedLessons.has(currentLesson.id) && (
                      <Chip
                        label="Completed"
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    )}
                  </Box>
                  
                  {currentLesson.description && (
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {currentLesson.description}
                    </Typography>
                  )}
                </Box>

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                  <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Overview" />
                    <Tab label="Notes" />
                    <Tab label="Resources" />
                    <Tab label="Discussion" />
                  </Tabs>

                  <TabPanel value={tabValue} index={0}>
                    <Typography variant="body1">
                      {currentLesson.content || 'No additional content available for this lesson.'}
                    </Typography>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      placeholder="Take notes for this lesson..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      variant="outlined"
                    />
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      startIcon={<Notes />}
                    >
                      Save Notes
                    </Button>
                  </TabPanel>

                  <TabPanel value={tabValue} index={2}>
                    {currentLesson.resources && currentLesson.resources.length > 0 ? (
                      <List>
                        {currentLesson.resources.map((resource, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Download />
                            </ListItemIcon>
                            <ListItemText
                              primary={resource.title}
                              secondary={resource.description}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              href={resource.url}
                              target="_blank"
                            >
                              Download
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        No resources available for this lesson.
                      </Typography>
                    )}
                  </TabPanel>

                  <TabPanel value={tabValue} index={3}>
                    <Typography color="text.secondary">
                      Discussion feature coming soon...
                    </Typography>
                  </TabPanel>
                </Paper>

                {/* Lesson Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const prev = getPreviousLesson();
                      if (prev) handleLessonSelect(prev.lesson, prev.section);
                    }}
                    disabled={!getPreviousLesson()}
                    startIcon={<SkipPrevious />}
                  >
                    Previous Lesson
                  </Button>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {!completedLessons.has(currentLesson.id) && (
                      <Button
                        variant="contained"
                        onClick={() => handleLessonComplete(currentLesson.id)}
                        startIcon={<CheckCircle />}
                      >
                        Mark Complete
                      </Button>
                    )}
                    
                    <Button
                      variant="contained"
                      onClick={() => {
                        const next = getNextLesson();
                        if (next) handleLessonSelect(next.lesson, next.section);
                      }}
                      disabled={!getNextLesson()}
                      endIcon={<SkipNext />}
                    >
                      Next Lesson
                    </Button>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Select a lesson to start learning
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose a lesson from the sidebar to begin your course.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate This Course</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Overall Rating</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Write a review (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about this course..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Submit review logic here
              setReviewDialogOpen(false);
            }}
            startIcon={<Send />}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursePlayerPage;