import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
} from '@mui/material';
import {
  PlayCircleOutline,
  People,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchCourses, fetchGlobalRatingSummary, BackendCourse, apiFetch } from '../services/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Platform-wide stats derived from backend APIs
  const [platformStats, setPlatformStats] = React.useState({
    students: 0,
    courses: 0,
    instructors: 0,
    avgRating: 0,
  });

  // Featured courses (first six from backend)
  const [featuredCourses, setFeaturedCourses] = React.useState<BackendCourse[]>([]);
  const [featuredLoading, setFeaturedLoading] = React.useState<boolean>(false);
  const [featuredError, setFeaturedError] = React.useState<string | null>(null);

  const loadStats = React.useCallback(async () => {
    try {
      // Fetch all stats in parallel
      const [coursesResponse, ratingResponse, statsResponse] = await Promise.allSettled([
        fetchCourses(),
        fetchGlobalRatingSummary(),
        apiFetch<any>(`/user-management-service/api/users/stats`),
      ]);

      // Extract courses count
      let coursesCount = 0;
      if (coursesResponse.status === 'fulfilled') {
        coursesCount = Array.isArray(coursesResponse.value) ? coursesResponse.value.length : 0;
      }

      // Extract average rating
      let avgRating = 0;
      if (ratingResponse.status === 'fulfilled') {
        avgRating = Number((ratingResponse.value as any)?.average || 0);
      }

      // Extract user stats from database
      let students = 0;
      let instructors = 0;
      if (statsResponse.status === 'fulfilled') {
        const statsData = statsResponse.value;
        if (statsData?.stats) {
          students = Number(statsData.stats.totalStudents || 0);
          instructors = Number(statsData.stats.totalInstructors || 0);
        } else if (statsData?.totalStudents !== undefined) {
          // Handle direct stats object
          students = Number(statsData.totalStudents || 0);
          instructors = Number(statsData.totalInstructors || 0);
        }
      }

      // Update platform stats with real-time data
      setPlatformStats({
        students,
        courses: coursesCount,
        instructors,
        avgRating,
      });
    } catch (e) {
      console.error('Failed to load stats:', e);
      // Keep current stats on error instead of resetting to zero
    }
  }, []);

  React.useEffect(() => {
    (async () => {
      await loadStats();
    })();
  }, [loadStats]);

  // Realtime refresh for stats every 5 seconds
  React.useEffect(() => {
    const id = window.setInterval(() => { loadStats(); }, 5000);
    const onFocus = () => loadStats();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadStats]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setFeaturedLoading(true);
      setFeaturedError(null);
      try {
        const courses = await fetchCourses();
        if (!mounted) return;
        setFeaturedCourses(courses);
      } catch (e) {
        if (!mounted) return;
        setFeaturedError('Failed to load featured courses.');
      } finally {
        if (mounted) setFeaturedLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCourseClick = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Learn Without Limits
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Start, switch, or advance your career with more than 5,000 courses,
            Professional Certificates, and degrees from world-class universities and companies.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: 'white', color: 'primary.main', px: 4 }}
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ borderColor: 'white', color: 'white', px: 4 }}
              onClick={() => navigate('/register')}
            >
              Start Learning
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Featured Courses Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Featured Courses
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Discover our most popular courses
        </Typography>

        {featuredError && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {featuredError}
          </Typography>
        )}
        {featuredLoading && (
          <Typography align="center" sx={{ mb: 2 }}>
            Loading featured courses...
          </Typography>
        )}
        {!featuredLoading && !featuredError && featuredCourses.length === 0 && (
          <Typography align="center" sx={{ mb: 2 }} color="text.secondary">
            No featured courses available yet.
          </Typography>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {featuredCourses.slice(0, 6).map((course) => (
            <Box key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => handleCourseClick(course.id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={course.imageUrl || '/images/course-placeholder.svg'}
                  alt={course.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {course.description || 'Explore this course to learn more about its content and objectives.'}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {typeof course.students === 'number' ? `${course.students} students` : 'Popular course'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {course.duration || 'N/A'}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${Number(course.price || 0).toFixed(2)}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayCircleOutline />}
                      size="small"
                    >
                      View Course
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>

        <Box textAlign="center" sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/courses')}
          >
            View All Courses
          </Button>
        </Box>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 4, textAlign: 'center' }}>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {platformStats.students.toLocaleString()}
              </Typography>
              <Typography variant="h6" color="text.secondary">Students</Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {platformStats.courses.toLocaleString()}
              </Typography>
              <Typography variant="h6" color="text.secondary">Courses</Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {platformStats.instructors.toLocaleString()}
              </Typography>
              <Typography variant="h6" color="text.secondary">Instructors</Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {platformStats.avgRating.toFixed(1)}
              </Typography>
              <Typography variant="h6" color="text.secondary">Average Rating</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
