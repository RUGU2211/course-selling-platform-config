import React from 'react';
import { Box, Typography, Container, Button, Card, CardContent, Rating, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Alert, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseById, fetchCourseRatingSummary, fetchContentByCourse, fetchCourseReviews, addContentItem, deleteContentItem, ContentItem, getCourseEnrollments } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const InstructorCourseManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const courseId = parseInt(id || '1');
  const [course, setCourse] = React.useState<any | null>(null);
  const [avgRating, setAvgRating] = React.useState<number>(0);
  const [ratingCount, setRatingCount] = React.useState<number>(0);
  const [contents, setContents] = React.useState<ContentItem[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [enrollments, setEnrollments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Content management state
  const [showAddContentDialog, setShowAddContentDialog] = React.useState(false);
  const [newContent, setNewContent] = React.useState({
    title: '',
    url: '',
    body: '',
    type: 'VIDEO' as 'VIDEO' | 'PDF' | 'DOC' | 'IMAGE' | 'TEXT'
  });

  // Load course data
  const loadCourseData = React.useCallback(async () => {
    try {
      const [courseData, summary, contentsList, reviewsList, enrollmentsList] = await Promise.all([
        fetchCourseById(courseId),
        fetchCourseRatingSummary(courseId).catch(() => ({ average: 0, count: 0 })),
        fetchContentByCourse(courseId).catch(() => []),
        fetchCourseReviews(courseId).catch(() => []),
        getCourseEnrollments(courseId).catch(() => [])
      ]);
      
      setCourse(courseData);
      setAvgRating(summary.average || 0);
      setRatingCount(summary.count || 0);
      setContents(contentsList || []);
      setReviews(reviewsList || []);
      setEnrollments(enrollmentsList || []);
    } catch (error) {
      console.error('Failed to load course data:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Real-time refresh every 5 seconds
  React.useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      loadCourseData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loading, loadCourseData]);

  // Verify instructor owns this course
  const isOwner = user?.role === 'INSTRUCTOR' && course?.instructorId && Number(user.id) === course.instructorId;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Course not found</Typography>
      </Container>
    );
  }

  if (!isOwner) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">You don't have permission to manage this course.</Alert>
      </Container>
    );
  }

  const handleDeleteContent = async (item: ContentItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }
    try {
      await deleteContentItem(item.contentId);
      // Refresh content list immediately
      const list = await fetchContentByCourse(courseId);
      setContents(list || []);
      alert('Content deleted successfully!');
    } catch (e) {
      console.error('Failed to delete content:', e);
      alert('Failed to delete content. Please try again.');
    }
  };

  const handleAddContent = async () => {
    if (!newContent.title) {
      alert('Please enter a content title');
      return;
    }
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
      alert('Content added successfully!');
    } catch (e: any) {
      console.error('Failed to add content:', e);
      alert(`Failed to add content: ${e?.message || 'Unknown error'}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/instructor/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1">
          Course Management
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        You are managing this course as an instructor. All changes will be reflected in real-time.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Instructor: #{course.instructorId}
              </Typography>
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
              </Stack>

              {/* Course Content Section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ mt: 3 }}>
                  Course Content
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddContentDialog(true)}
                >
                  ADD CONTENT
                </Button>
              </Box>

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
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteContent(item)}
                            sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Reviews Section */}
              <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                Reviews ({reviews.length})
              </Typography>
              
              {reviews.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>
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

              {/* Enrollment Stats */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Enrollment Statistics
                </Typography>
                <Typography variant="body1" color="primary" fontWeight="bold">
                  Total Enrollments: {enrollments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ${Number(course.price || 0).toFixed(2)}
                </Typography>
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

export default InstructorCourseManagement;

