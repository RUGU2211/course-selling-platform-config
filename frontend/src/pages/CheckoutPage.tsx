import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Button, Stack, Alert, Box } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { fetchCourseById, enrollInCourse } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const courseId = parseInt(id || '0');

  const [course, setCourse] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchCourseById(courseId);
        if (mounted) setCourse(c);
      } catch (e) {
        if (mounted) setCourse({ id: courseId, title: `Course #${courseId}`, price: 0 });
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  React.useEffect(() => {
    if (!course) {
      navigate('/courses');
    }
  }, [course, navigate]);

  const handleEnroll = async () => {
    setError(null);
    if (!isAuthenticated || !user) {
      setError('Please login to continue.');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await enrollInCourse({
        studentId: Number(user.id),
        courseId: courseId
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (e: any) {
      console.error('Enrollment error:', e);
      const errorMessage = e?.message || 'Enrollment failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!course) return null;

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
              <Typography variant="h4" color="success.main" align="center">
                Enrollment Successful!
              </Typography>
              <Typography variant="body1" align="center">
                You have been enrolled in {course.title}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Redirecting to dashboard...
              </Typography>
              <Button variant="contained" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Enroll in Course
          </Typography>
          <Box sx={{ mb: 3 }}>
          <Typography variant="h6">{course.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Instructor: {course.instructorId ? `#${course.instructorId}` : 'Unknown'}
          </Typography>
            {course.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {course.description}
              </Typography>
            )}
            {course.price > 0 && (
              <Typography variant="h5" color="primary.main" fontWeight="bold">
            ${Number(course.price || 0).toFixed(2)}
          </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          
          <Stack spacing={2}>
            <Button
              variant="contained"
              onClick={handleEnroll}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? 'Enrolling...' : course.price > 0 ? `Enroll for $${course.price.toFixed(2)}` : 'Enroll for Free'}
            </Button>
            <Button variant="text" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckoutPage;