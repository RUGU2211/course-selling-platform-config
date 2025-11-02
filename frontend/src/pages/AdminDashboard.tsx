import React from 'react';
import { Box, Typography, Container, Card, CardContent, Button, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { getEnrollmentStats } from '../services/api';
import { EnrollmentStats } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [enrollmentStats, setEnrollmentStats] = React.useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const platformStats = {
    totalUsers: 500,
    totalCourses: 120,
    totalEnrollments: enrollmentStats?.totalEnrollments || 0,
    totalRevenue: 50000,
    activeInstructors: 25,
  };

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Instructor', joinDate: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Student', joinDate: '2024-01-13' },
  ];

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stats = await getEnrollmentStats();
        if (mounted) {
          setEnrollmentStats(stats);
        }
      } catch (error) {
        console.error('Failed to load enrollment stats:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      getEnrollmentStats().then(stats => setEnrollmentStats(stats)).catch(console.error);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4, mt: 3 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Platform Overview
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, textAlign: 'center' }}>
                <Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {platformStats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {platformStats.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Courses
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {enrollmentStats?.totalEnrollments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Enrollments
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    ${platformStats.totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Management Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" component={Link} to="/admin/users">
                  Manage Users
                </Button>
                <Button variant="contained" component={Link} to="/admin/courses">
                  Manage Courses
                </Button>
                <Button variant="contained" component={Link} to="/admin/analytics">
                  View Analytics
                </Button>
                <Button variant="contained" component={Link} to="/admin/settings">
                  Platform Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Enrollment Statistics
              </Typography>
              {enrollmentStats && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Average Progress</Typography>
                      <Typography variant="body2">{enrollmentStats.averageProgress.toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={enrollmentStats.averageProgress} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completed Courses: {enrollmentStats.completedCourses} / {enrollmentStats.totalEnrollments}
                    </Typography>
                  </Box>
                  {enrollmentStats.recentEnrollments && enrollmentStats.recentEnrollments.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Recent Enrollments
                      </Typography>
                      {enrollmentStats.recentEnrollments.slice(0, 5).map((enrollment: any) => (
                        <Box key={enrollment.id} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: '4px' }}>
                          <Typography variant="body2">
                            Course #{enrollment.courseId} • Student #{enrollment.studentId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Progress: {enrollment.progress}% • {enrollment.completed ? 'Completed' : 'In Progress'}
                          </Typography>
                        </Box>
                      ))}
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
