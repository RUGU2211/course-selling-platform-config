import React from 'react';
import { Box, Typography, Container, Button, Card, CardContent, Rating, Stack, Link as MuiLink, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseById, fetchCourseRatingSummary, fetchContentByCourse, logContentAccess, fetchCourseReviews, createReview, enrollInCourse, getStudentEnrollments, ContentItem } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  
  // Review form state
  const [showReviewDialog, setShowReviewDialog] = React.useState(false);
  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewComment, setReviewComment] = React.useState<string>('');

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
        if (mounted) setContentError(e?.message || 'Failed to load content');
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

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id || !isAuthenticated) {
        setIsEnrolled(false);
        return;
      }
      
      try {
        const enrollments = await getStudentEnrollments(Number(user.id));
        if (!mounted) return;
        const enrolled = enrollments.some((e: any) => e.courseId === courseId);
        setIsEnrolled(enrolled);
      } catch (e) {
        // Ignore enrollment check errors
      }
    })();
    return () => { mounted = false; };
  }, [user, isAuthenticated, courseId]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // Check if already enrolled
      if (isEnrolled) {
        navigate('/dashboard');
        return;
      }
      
      // Navigate to checkout if payment required
      if (course && course.price > 0) {
        navigate(`/checkout/${courseId}`);
      } else {
        // Free course - enroll directly
        await enrollInCourse({
          studentId: Number(user.id),
          courseId: courseId
        });
        setIsEnrolled(true);
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Enrollment failed
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
    if (!user || !isEnrolled) {
      return;
    }
    
    try {
      if (user && user.id) {
        await logContentAccess(Number(user.id), Number(item.contentId));
      }
    } catch (e) {
      // non-blocking: logging should not prevent content open
    } finally {
      try {
        window.open(item.url, '_blank', 'noopener');
      } catch {}
    }
  };

  if (!course) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Enrolled Banner */}
      {isEnrolled && (
        <Alert severity="success" sx={{ mb: 3 }}>
          You are enrolled in this course! Continue learning below.
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
              <Typography variant="body1" paragraph>
                {course.description || 'Learn core concepts with practical projects and clear explanations.'}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Rating value={avgRating} precision={0.1} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {avgRating.toFixed(1)} ({ratingCount} ratings)
                </Typography>
                {isAuthenticated && !isEnrolled && (
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

              <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                Course Content
              </Typography>

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
                    <ul>
                      {contents.map((item) => (
                        <li key={item.contentId}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Chip size="small" label={item.type} />
                            <MuiLink component="button" variant="body1" onClick={() => handleOpenContent(item)}>
                              {item.title}
                            </MuiLink>
                            {!isEnrolled && (
                              <Chip label="Enroll to Access" size="small" color="warning" />
                            )}
                          </Stack>
                        </li>
                      ))}
                    </ul>
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
                <Typography variant="h5" color="primary" fontWeight="bold">
                  ${Number(course.price || 0).toFixed(2)}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }} 
                  onClick={handleEnroll}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? 'Already Enrolled' : 'Enroll Now'}
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
    </Container>
  );
};

export default CourseDetailPage;
