import React from 'react';
import { Box, Typography, Container, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourses, getEnrollments, getAverageRating } from '../services/staticData';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const allCourses = getCourses();
  const myCourses = allCourses.filter(c => c.instructor === (user?.email || ''));

  // Derive student counts from enrollments to keep numbers in sync with actual course sign-ups
  const enrollments = getEnrollments();
  const countByCourse = (courseId: number) => enrollments.filter(e => e.courseId === courseId).length;

  const [avgMap, setAvgMap] = React.useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    myCourses.forEach(c => { init[c.id] = getAverageRating(c.id); });
    return init;
  });

  React.useEffect(() => {
    const handler = (e: any) => {
      const cid = e?.detail?.courseId;
      if (cid) {
        setAvgMap(prev => ({ ...prev, [cid]: getAverageRating(cid) }));
      }
    };
    window.addEventListener('ratings:updated', handler);
    return () => window.removeEventListener('ratings:updated', handler);
  }, []);

  const stats = {
    totalStudents: myCourses.reduce((sum, c) => sum + countByCourse(c.id), 0),
    totalRevenue: myCourses.reduce((sum, c) => sum + (c.price * countByCourse(c.id)), 0),
    averageRating: myCourses.length ? (
      myCourses.reduce((sum, c) => sum + (avgMap[c.id] ?? 0), 0) / myCourses.length
    ) : 0,
    totalCourses: myCourses.length,
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Instructor Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4, mt: 3 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                My Courses
              </Typography>
              {myCourses.length > 0 ? (
                myCourses.map((course) => (
                  <Box key={course.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Students: {countByCourse(course.id)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating: {(avgMap[course.id] ?? 0).toFixed(1)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/courses/${course.id}`}
                    >
                      Manage Course
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography>You have not created any courses yet.</Typography>
              )}
              <Button variant="contained" sx={{ mt: 2 }} component={Link} to="/instructor/create-course">
                Create New Course
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Analytics Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {stats.totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Students
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  ${stats.totalRevenue.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {stats.averageRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {stats.totalCourses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Courses
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default InstructorDashboard;
