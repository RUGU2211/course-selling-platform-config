import React from 'react';
import { Box, Typography, Container, Button, Card, CardContent, Rating, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, MenuItem, Select, FormControl, InputLabel, IconButton, LinearProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseById, fetchCourseRatingSummary, fetchContentByCourse, logContentAccess, fetchCourseReviews, createReview, enrollInCourse, getStudentEnrollments, ContentItem, addContentItem, deleteContentItem, updateEnrollmentProgress, updateEnrollmentCompletion, getCourseEnrollments, updateEnrollmentStage1, updateEnrollmentStage2, updateEnrollmentCurrentStage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const courseId = parseInt(id || '1');
  const [course, setCourse] = React.useState<any | null>(null);
  const [avgRating, setAvgRating] = React.useState<number>(0);
  const [ratingCount, setRatingCount] = React.useState<number>(0);
  const [contents, setContents] = React.useState<ContentItem[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = React.useState(false);
  const [contentError, setContentError] = React.useState<string | null>(null);
  const [contentLoading, setContentLoading] = React.useState<boolean>(false);
  const [enrolling, setEnrolling] = React.useState(false);
  const [enrollmentError, setEnrollmentError] = React.useState<string | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = React.useState(false);
  const [currentEnrollment, setCurrentEnrollment] = React.useState<any | null>(null);
  const [enrollmentCount, setEnrollmentCount] = React.useState<number>(0);
  const [showCongratulations, setShowCongratulations] = React.useState(false);
  
  // Review form state
  const [showReviewDialog, setShowReviewDialog] = React.useState(false);
  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewComment, setReviewComment] = React.useState<string>('');
  
  // Content management state
  const [showAddContentDialog, setShowAddContentDialog] = React.useState(false);
  const [newContent, setNewContent] = React.useState({
    title: '',
    url: '',
    body: '',
    type: 'VIDEO' as 'VIDEO' | 'PDF' | 'DOC' | 'IMAGE' | 'TEXT'
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchCourseById(courseId);
        const summary = await fetchCourseRatingSummary(courseId);
        if (!mounted) return;
        setCourse(c);
        setAvgRating(summary?.average || 0);
        setRatingCount(summary?.count || 0);
      } catch (e) {
        if (mounted) {
          setCourse({
            id: courseId,
            title: `Course ${id} - Complete Guide`,
            description: `This is a comprehensive course that covers essential topics with practical examples.`,
            instructorId: undefined,
            price: 99.99,
            duration: '15 hours',
            level: 'Intermediate',
            language: 'English',
          });
          setAvgRating(0);
          setRatingCount(0);
        }
      }
    })();
    return () => { mounted = false; };
  }, [courseId, id]);

  // Load content when courseId changes - load for everyone, show enroll message if not enrolled
  React.useEffect(() => {
    let mounted = true;
    setContentLoading(true);
    setContentError(null);
    (async () => {
      try {
        const list = await fetchContentByCourse(courseId);
        if (!mounted) return;
        setContents(list || []);
      } catch (e: any) {
        if (mounted) {
          console.error('Failed to load content:', e);
          setContentError(e?.message || 'Failed to load content');
        }
      } finally {
        if (mounted) setContentLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const reviewsList = await fetchCourseReviews(courseId);
        if (!mounted) return;
        setReviews(reviewsList);
      } catch (e) {
        // Ignore errors for reviews
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const checkEnrollmentStatus = React.useCallback(async () => {
      if (!user?.id || !isAuthenticated) {
        setIsEnrolled(false);
        return;
      }
      
      try {
        const enrollments = await getStudentEnrollments(Number(user.id));
        // Compare both as numbers to ensure type matching
        const enrolled = enrollments.some((e: any) => Number(e.courseId) === Number(courseId));
        setIsEnrolled(enrolled);
        // Get current enrollment for progress tracking
        const enrollment = enrollments.find((e: any) => Number(e.courseId) === Number(courseId));
        if (enrollment) {
          setCurrentEnrollment(enrollment);
          // Show congratulations if course just completed (but not already shown)
          if (enrollment.completed && !showCongratulations && enrollment.stage2Completed) {
            setShowCongratulations(true);
            setTimeout(() => setShowCongratulations(false), 10000);
          }
        }
      } catch (e) {
        console.error('Error checking enrollment status:', e);
        // Ignore enrollment check errors
      }
  }, [user, isAuthenticated, courseId]);
  
  // Fetch enrollment count for course
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const enrollments = await getCourseEnrollments(courseId);
        if (mounted) setEnrollmentCount(enrollments?.length || 0);
      } catch (e) {
        // Ignore errors
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  React.useEffect(() => {
    checkEnrollmentStatus();
  }, [checkEnrollmentStatus]);

  // Auto-refresh enrollment status, content, and reviews every 5 seconds for real-time updates
  React.useEffect(() => {
    if (!user?.id || !isAuthenticated) return;
    const interval = setInterval(async () => {
      // Refresh enrollment status
      await checkEnrollmentStatus();
      // Refresh content
      try {
        const list = await fetchContentByCourse(courseId);
        setContents(list || []);
      } catch (e) {
        // Ignore errors
      }
      // Refresh enrollment count
      try {
        const enrollments = await getCourseEnrollments(courseId);
        setEnrollmentCount(enrollments?.length || 0);
      } catch (e) {
        // Ignore errors
      }
      // Refresh reviews
      try {
        const reviewsList = await fetchCourseReviews(courseId);
        setReviews(reviewsList);
        const summary = await fetchCourseRatingSummary(courseId);
        setAvgRating(summary?.average || 0);
        setRatingCount(summary?.count || 0);
      } catch (e) {
        // Ignore errors
      }
    }, 5000); // Refresh every 5 seconds for real-time feel
    return () => clearInterval(interval);
  }, [user, isAuthenticated, checkEnrollmentStatus, courseId]);

  const handleEnroll = async () => {
    console.log('Enroll button clicked - user:', user, 'isAuthenticated:', isAuthenticated);
    
    if (!user) {
      console.log('No user - redirecting to login');
      navigate('/login');
      return;
    }
    
    // Check if already enrolled
    if (isEnrolled) {
      console.log('Already enrolled - no action');
      return; // Already enrolled, no action needed
    }
    
    console.log('Starting enrollment for user:', user.id, 'course:', courseId);
    setEnrollmentError(null);
    setEnrolling(true);
    
    try {
      // Enroll directly regardless of price (payment can be handled separately if needed)
      console.log('Enrolling in course...');
      const result = await enrollInCourse({
        studentId: Number(user.id),
        courseId: courseId
      });
      console.log('Enrollment successful:', result);
      
      // Refresh enrollment status immediately
      setIsEnrolled(true);
      setEnrolling(false);
      setEnrollmentError(null);
      setEnrollmentSuccess(true);
      
      // Refresh enrollment status from server to confirm
      await checkEnrollmentStatus();
      
      // Load course content now that user is enrolled
      try {
        const contentList = await fetchContentByCourse(courseId);
        setContents(contentList || []);
      } catch (e) {
        console.error('Failed to load content:', e);
      }
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setEnrollmentSuccess(false), 5000);
    } catch (error: any) {
      console.error('Enrollment failed with error:', error);
      setEnrolling(false);
      const errorMessage = error?.message || 'Failed to enroll. Please try again.';
      setEnrollmentError(errorMessage);
      alert(`Enrollment failed: ${errorMessage}`);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      return;
    }
    
    try {
      await createReview({
        courseId,
        userId: Number(user.id),
        rating: reviewRating,
        comment: reviewComment
      });
      
      // Refresh reviews and ratings
      const reviewsList = await fetchCourseReviews(courseId);
      const summary = await fetchCourseRatingSummary(courseId);
      setReviews(reviewsList);
      setAvgRating(summary?.average || 0);
      setRatingCount(summary?.count || 0);
      
      setShowReviewDialog(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (error: any) {
      // Review submission failed
    }
  };

  const handleOpenContent = async (item: ContentItem) => {
    // Check if user is enrolled or is instructor
    if (!user) {
      alert('Please login to access course content.');
      navigate('/login');
      return;
    }
    
    if (!isEnrolled && !isInstructor) {
      alert('Please enroll in this course to access content.');
      return;
    }
    
    try {
      // Log content access
      if (user && user.id) {
        await logContentAccess(Number(user.id), Number(item.contentId));
      }
      
      // Update progress if enrolled
      if (isEnrolled && currentEnrollment && contents.length > 0) {
        // Calculate progress based on content accessed
        // For now, increment by a fixed amount per content item
        const totalContent = contents.length;
        const currentProgress = currentEnrollment.progress || 0;
        const progressPerContent = Math.floor(100 / totalContent);
        const newProgress = Math.min(100, currentProgress + progressPerContent);
        
        if (newProgress > currentProgress) {
          try {
            await updateEnrollmentProgress(currentEnrollment.id, { progress: newProgress });
            // Mark as completed if progress reaches 100
            if (newProgress >= 100 && !currentEnrollment.completed) {
              await updateEnrollmentCompletion(currentEnrollment.id, true);
              // Show congratulations message
              setShowCongratulations(true);
              setTimeout(() => setShowCongratulations(false), 10000); // Auto-hide after 10 seconds
            }
            // Refresh enrollment status
            await checkEnrollmentStatus();
          } catch (e) {
            console.error('Failed to update progress:', e);
          }
        }
      }
    } catch (e) {
      // non-blocking: logging should not prevent content open
      console.error('Failed to log content access:', e);
    } finally {
      try {
        // For TEXT type, show content in an alert/dialog instead of opening URL
        if (item.type === 'TEXT' && item.body) {
          alert(item.body);
        } else if (item.url) {
          window.open(item.url, '_blank', 'noopener');
        }
      } catch (e) {
        console.error('Failed to open content:', e);
      }
    }
  };

  const handleDeleteContent = async (item: ContentItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }
    try {
      await deleteContentItem(item.contentId);
      // Refresh content list immediately for real-time update
      const list = await fetchContentByCourse(courseId);
      setContents(list || []);
      alert('Content deleted successfully!');
    } catch (e: any) {
      console.error('Failed to delete content:', e);
      alert(`Failed to delete content: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleAddContent = async () => {
    if (!newContent.title) {
      alert('Please enter a content title');
      return;
    }
    // URL is required for non-TEXT types, body is required for TEXT type
    if (newContent.type !== 'TEXT' && !newContent.url) {
      alert('Please enter a content URL');
      return;
    }
    if (newContent.type === 'TEXT' && !newContent.body) {
      alert('Please enter text content');
      return;
    }
    try {
      await addContentItem({
        courseId: courseId,
        type: newContent.type,
        title: newContent.title,
        url: newContent.url || '',
        body: newContent.type === 'TEXT' ? newContent.body : undefined
      });
      // Refresh content list immediately for real-time update
      const list = await fetchContentByCourse(courseId);
      setContents(list || []);
      setShowAddContentDialog(false);
      setNewContent({ title: '', url: '', body: '', type: 'VIDEO' });
      // Show success message
      alert('Content added successfully!');
    } catch (e: any) {
      console.error('Failed to add content:', e);
      alert(`Failed to add content: ${e?.message || 'Unknown error'}`);
    }
  };

  const isInstructor = user?.role === 'INSTRUCTOR' && course?.instructorId && Number(user.id) === course.instructorId;

  if (!course) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Enrollment Success Message - Shows after successful enrollment */}
      {enrollmentSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 'medium',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
          onClose={() => setEnrollmentSuccess(false)}
        >
          🎉 Successfully enrolled! You now have access to all course content below.
        </Alert>
      )}

      {/* Enrolled Banner - Shows when already enrolled (but not just enrolled) */}
      {isEnrolled && !enrollmentSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 'medium',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          ✓ You are enrolled in this course! You can access all course content below.
        </Alert>
      )}
      
      {/* Progress Display for Enrolled Students */}
      {isEnrolled && currentEnrollment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Progress
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2" fontWeight="bold">
                {currentEnrollment.progress || 0}%
              </Typography>
            </Box>
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={currentEnrollment.progress || 0} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            
            {/* Two-Stage Completion Display */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Course Completion Stages:
              </Typography>
              <Stack spacing={1}>
                {/* Stage 1 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: currentEnrollment.stage1Completed ? 'success.main' : 'grey.300', borderRadius: 1, backgroundColor: currentEnrollment.stage1Completed ? 'success.light' : 'transparent' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {currentEnrollment.stage1Completed ? (
                      <Chip label="✓" size="small" color="success" />
                    ) : (
                      <Chip label="○" size="small" variant="outlined" />
                    )}
                    <Typography variant="body2" fontWeight={currentEnrollment.stage1Completed ? 'bold' : 'normal'}>
                      Stage 1: Fundamentals
                    </Typography>
                  </Box>
                  {!currentEnrollment.stage1Completed && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        try {
                          await updateEnrollmentStage1(currentEnrollment.id, true);
                          await checkEnrollmentStatus();
                        } catch (e) {
                          console.error('Failed to complete stage 1:', e);
                        }
                      }}
                    >
                      Complete Stage 1
                    </Button>
                  )}
                </Box>
                
                {/* Stage 2 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: currentEnrollment.stage2Completed ? 'success.main' : 'grey.300', borderRadius: 1, backgroundColor: currentEnrollment.stage2Completed ? 'success.light' : 'transparent', opacity: currentEnrollment.stage1Completed ? 1 : 0.6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {currentEnrollment.stage2Completed ? (
                      <Chip label="✓" size="small" color="success" />
                    ) : (
                      <Chip label="○" size="small" variant="outlined" />
                    )}
                    <Typography variant="body2" fontWeight={currentEnrollment.stage2Completed ? 'bold' : 'normal'}>
                      Stage 2: Advanced Topics
                    </Typography>
                  </Box>
                  {currentEnrollment.stage1Completed && !currentEnrollment.stage2Completed && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        try {
                          await updateEnrollmentStage2(currentEnrollment.id, true);
                          await checkEnrollmentStatus();
                          // Show congratulations message
                          setShowCongratulations(true);
                          setTimeout(() => setShowCongratulations(false), 10000); // Auto-hide after 10 seconds
                        } catch (e) {
                          console.error('Failed to complete stage 2:', e);
                        }
                      }}
                    >
                      Complete Stage 2
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
            
            <Typography variant="body2" color={currentEnrollment.completed ? 'success.main' : 'text.secondary'} fontWeight={currentEnrollment.completed ? 'bold' : 'normal'}>
              {currentEnrollment.completed ? '✓ Course Completed! Congratulations!' : `Continue learning to complete the course`}
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {/* Congratulations Message */}
      {showCongratulations && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'success.light',
            color: 'success.dark'
          }}
          onClose={() => setShowCongratulations(false)}
        >
          🎉 Congratulations! You have successfully completed the course! 🎉
        </Alert>
      )}
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Instructor: {course.instructorId ? `#${course.instructorId}` : 'Unknown'}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                {course.duration && (
                  <Typography variant="body2" color="text.secondary">
                    Duration: {course.duration}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {enrollmentCount} enrolled
                </Typography>
                {course.level && (
                  <Typography variant="body2" color="text.secondary">
                    Level: {course.level}
                  </Typography>
                )}
              </Stack>
              <Typography variant="body1" paragraph>
                {course.description || 'Learn core concepts with practical projects and clear explanations.'}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={course.level || 'basic'} 
                  size="small" 
                  color="default" 
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Rating value={avgRating} precision={0.1} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {avgRating.toFixed(1)} ({ratingCount} ratings)
                </Typography>
                {isAuthenticated && (isEnrolled || isInstructor) && (
                  <Button size="small" onClick={() => setShowReviewDialog(true)}>
                    Write Review
                  </Button>
                )}
              </Stack>

              {!isAuthenticated && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Log in to enroll and access content.
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ mt: 3 }}>
                Course Content
              </Typography>
                {isInstructor && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddContentDialog(true)}
                  >
                    ADD CONTENT
                  </Button>
                )}
              </Box>

              {contentLoading && (
                <Typography variant="body2" color="text.secondary">Loading content...</Typography>
              )}
              {contentError && (
                <Typography variant="body2" color="error">{contentError}</Typography>
              )}

              {!contentLoading && !contentError && (
                <Box>
                  {contents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No content available yet.</Typography>
                  ) : (
                    <Box>
                      {contents.map((item) => (
                        <Card key={item.contentId} sx={{ mb: 2, boxShadow: 2 }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.title}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {isInstructor && (
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => handleDeleteContent(item)}
                                    sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                                {!isEnrolled && !isInstructor && (
                                  <Chip label="Enroll to Access" size="small" color="warning" />
                                )}
                                {(isEnrolled || isInstructor) && (
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => handleOpenContent(item)}
                                  >
                                    View
                                  </Button>
                                )}
                              </Stack>
                          </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Reviews Section */}
              <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                Reviews ({reviews.length})
              </Typography>
              
              {reviews.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No reviews yet. Be the first to review!</Typography>
              ) : (
                <Box>
                  {reviews.map((review) => (
                    <Card key={review.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Rating value={review.rating} size="small" readOnly />
                          <Typography variant="body2" color="text.secondary">
                            User #{review.userId}
                          </Typography>
                        </Stack>
                        {review.comment && (
                          <Typography variant="body2">{review.comment}</Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                  ${Number(course.price || 0).toFixed(2)}
                </Typography>
                {enrollmentError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{enrollmentError}</Alert>
                )}
                <Button 
                  variant="contained" 
                  color={isEnrolled ? "inherit" : "primary"}
                  fullWidth
                  sx={{ 
                    mt: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    ...(isEnrolled && {
                      backgroundColor: 'grey.300',
                      color: 'grey.700',
                      '&:hover': {
                        backgroundColor: 'grey.400',
                      }
                    })
                  }} 
                  onClick={handleEnroll}
                  disabled={isEnrolled || enrolling}
                >
                  {enrolling ? 'Enrolling...' : isEnrolled ? 'ALREADY ENROLLED' : 'Enroll Now'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About this course
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This course is designed to provide comprehensive knowledge and hands-on experience.
              </Typography>
              {course.level && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Level: {course.level}
                </Typography>
              )}
              {course.language && (
                <Typography variant="body2">
                  Language: {course.language}
                </Typography>
              )}
              {course.duration && (
                <Typography variant="body2">
                  Duration: {course.duration}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)}>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" gutterBottom>Rating</Typography>
              <Rating
                value={reviewRating}
                onChange={(_, newValue) => setReviewRating(newValue || 5)}
              />
            </Box>
            <TextField
              label="Comment"
              multiline
              rows={4}
              fullWidth
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this course..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Add Content Dialog */}
      <Dialog open={showAddContentDialog} onClose={() => setShowAddContentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Course Content</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Content Title"
              fullWidth
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              placeholder="e.g., Introduction to Java Programming"
            />
            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={newContent.type}
                label="Content Type"
                onChange={(e) => setNewContent({ ...newContent, type: e.target.value as any, url: '', body: '' })}
              >
                <MenuItem value="VIDEO">Video</MenuItem>
                <MenuItem value="PDF">PDF Document</MenuItem>
                <MenuItem value="DOC">Document</MenuItem>
                <MenuItem value="IMAGE">Image</MenuItem>
                <MenuItem value="TEXT">Text Content</MenuItem>
              </Select>
            </FormControl>
            {newContent.type === 'TEXT' ? (
              <TextField
                label="Content Body"
                fullWidth
                multiline
                rows={6}
                value={newContent.body}
                onChange={(e) => setNewContent({ ...newContent, body: e.target.value })}
                placeholder="Enter your text content here..."
                helperText="Enter the text content to display"
              />
            ) : (
              <TextField
                label="Content URL"
                fullWidth
                value={newContent.url}
                onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                helperText="URL to the content (video, PDF, etc.)"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddContentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddContent} variant="contained">Add Content</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetailPage;
