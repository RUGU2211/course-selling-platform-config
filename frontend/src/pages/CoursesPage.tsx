import React from 'react';
import { Box, Typography, Container, Card, CardContent, CardMedia, Button, Rating, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { People, AccessTime } from '@mui/icons-material';
import { fetchCourses, fetchCourseRatingSummary, getCourseEnrollments } from '../services/api';

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = React.useState<Array<any>>([]);
  const [ratingMap, setRatingMap] = React.useState<Record<number, { avg: number; count: number }>>({});
  const [enrollmentCountMap, setEnrollmentCountMap] = React.useState<Record<number, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchCourses();
        if (!mounted) return;
        setCourses(list);
        // Fetch rating summary and enrollment count for each course
        const summaries = await Promise.all(list.map(async (c: any) => {
          try {
            const s = await fetchCourseRatingSummary(Number(c.id));
            return { id: Number(c.id), avg: s.average || 0, count: s.count || 0 };
          } catch {
            return { id: Number(c.id), avg: 0, count: 0 };
          }
        }));
        const map: Record<number, { avg: number; count: number }> = {};
        summaries.forEach(s => { map[s.id] = { avg: s.avg, count: s.count }; });
        if (mounted) setRatingMap(map);
        
        // Fetch enrollment counts
        const enrollmentCounts = await Promise.all(list.map(async (c: any) => {
          try {
            const enrollments = await getCourseEnrollments(Number(c.id));
            return { id: Number(c.id), count: enrollments?.length || 0 };
          } catch {
            return { id: Number(c.id), count: 0 };
          }
        }));
        const countMap: Record<number, number> = {};
        enrollmentCounts.forEach(ec => { countMap[ec.id] = ec.count; });
        if (mounted) setEnrollmentCountMap(countMap);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCourseClick = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        All Courses
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Discover amazing courses from expert instructors
      </Typography>
      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {loading && (
        <Typography align="center" sx={{ mb: 2 }}>
          Loading courses...
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        {courses.map((course) => (
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
                <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                  Instructor: {course.instructorId ? `#${course.instructorId}` : 'Unknown'}
                </Typography>
                {course.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description.length > 100 ? `${course.description.slice(0, 100)}...` : course.description}
                  </Typography>
                )}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Rating value={ratingMap[course.id]?.avg || 0} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary">
                    {Number(ratingMap[course.id]?.avg || 0).toFixed(1)} ({ratingMap[course.id]?.count || 0})
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {enrollmentCountMap[course.id] || 0} enrolled
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.duration || 'N/A'}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
                  ${Number(course.price || 0).toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course.id);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default CoursesPage;
