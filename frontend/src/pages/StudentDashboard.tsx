import React from 'react';
import { Box, Typography, Container, Card, CardContent, Button, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEnrollments, getCourseById } from '../services/staticData';

const StudentDashboard: React.FC = () => {
  // enrolledCourses is derived from static enrollments below
  const { user } = useAuth();
  const enrolls = user ? getEnrollments(Number(user.id) || 0) : [];
  const enrolledCourses = enrolls.map(e => {
    const c = getCourseById(e.courseId);
    return c ? { id: c.id, title: c.title, progress: 0, instructor: c.instructor } : null;
  }).filter(Boolean) as { id: number; title: string; progress: number; instructor: string }[];

  const recentActivity = [
    { id: 1, action: 'Completed lesson', course: 'Introduction to React', time: '2 hours ago' },
    { id: 2, action: 'Started new course', course: 'Advanced Spring Boot', time: '1 day ago' },
    { id: 3, action: 'Earned certificate', course: 'Docker for Developers', time: '3 days ago' },
  ];

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
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Instructor: {course.instructor}
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
                      {course.progress === 100 ? 'View Certificate' : 'Continue Learning'}
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
                Recent Activity
              </Typography>
              {recentActivity.map((activity) => (
                <Box key={activity.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: '8px' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {activity.action}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.course}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default StudentDashboard;
