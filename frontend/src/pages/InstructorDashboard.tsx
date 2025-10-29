import React from 'react';
import { Box, Typography, Container, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCourses, fetchCourseRatingSummary } from '../services/api';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [myCourses, setMyCourses] = React.useState<any[]>([]);
  const [courseRatings, setCourseRatings] = React.useState<Record<number, any>>({});
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalCourses: 0,
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch all courses
        const allCourses = await fetchCourses();
        if (!mounted) return;
        
        // Filter courses for this instructor
        const instructorId = Number(user.id);
        const filtered = allCourses.filter((c: any) => c.instructorId === instructorId);
        setMyCourses(filtered);
        
        // Fetch ratings for each course
        const ratingPromises = filtered.map(async (course: any) => {
          try {
            const summary = await fetchCourseRatingSummary(course.id);
            return { courseId: course.id, summary };
          } catch {
            return { courseId: course.id, summary: { average: 0, count: 0 } };
          }
        });
        
        const ratings = await Promise.all(ratingPromises);
        const ratingsMap: Record<number, any> = {};
        ratings.forEach(r => {
          ratingsMap[r.courseId] = r.summary;
        });
        if (mounted) setCourseRatings(ratingsMap);
        
        // Calculate statistics
        // Note: We'll need to fetch enrollment and payment data separately
        // For now, calculate from available data
        const avgRating = filtered.length > 0
          ? ratings.reduce((sum, r) => sum + r.summary.average, 0) / ratings.length
          : 0;
        
        if (mounted) {
          setStats({
            totalStudents: 0, // Would need enrollment service integration
            totalRevenue: 0, // Would need payment service integration
            averageRating: avgRating,
            totalCourses: filtered.length,
          });
        }
      } catch (error) {
        console.error('Failed to load instructor dashboard:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

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
                myCourses.map((course) => {
                  const rating = courseRatings[course.id] || { average: 0, count: 0 };
                  return (
                  <Box key={course.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                          Price: ${course.price?.toFixed(2) || '0.00'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          Rating: {rating.average.toFixed(1)} ({rating.count} reviews)
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
                  );
                })
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
