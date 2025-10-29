import React from 'react';
import { Box, Typography, Container, Card, CardContent, Button, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStudentEnrollments, fetchCourseById, getPaymentHistory } from '../services/api';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [enrollments, setEnrollments] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalSpent, setTotalSpent] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch enrollments
        const enrolls = await getStudentEnrollments(Number(user.id));
        if (!mounted) return;
        setEnrollments(enrolls);
        
        // Fetch course details for each enrollment
        const coursePromises = enrolls.map((e: any) => 
          fetchCourseById(e.courseId).catch(() => null)
        );
        const courseData = await Promise.all(coursePromises);
        if (!mounted) return;
        setCourses(courseData.filter(Boolean));
        
        // Calculate total spent
        const payments = await getPaymentHistory(Number(user.id));
        const spent = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        setTotalSpent(spent);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, [user]);

  const enrolledCourses = courses.map((course, index) => {
    const enrollment = enrollments[index];
    return {
      id: course.id,
      title: course.title,
      progress: enrollment?.progress || 0,
      completed: enrollment?.completed || false,
      enrollmentDate: enrollment?.enrolledAt,
    };
  });

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
        Student Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4, mt: 3 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                My Enrolled Courses
              </Typography>
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <Box key={course.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">{course.progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={course.progress} />
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/courses/${course.id}`}
                    >
                      {course.completed ? 'View Certificate' : 'Continue Learning'}
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography>You are not enrolled in any courses yet.</Typography>
              )}
              <Button variant="contained" sx={{ mt: 2 }} component={Link} to="/courses">
                Browse Courses
              </Button>
              <Button variant="text" sx={{ mt: 1, ml: 2 }} component={Link} to="/student/payments">
                View Payments
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {enrolledCourses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enrolled Courses
              </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  ${totalSpent.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                  Total Spent
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {enrolledCourses.filter(c => c.completed).length}
                  </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Courses
                  </Typography>
                </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default StudentDashboard;
