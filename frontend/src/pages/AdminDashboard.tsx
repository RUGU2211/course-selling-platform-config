import React from 'react';
import { Box, Typography, Container, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const platformStats = {
    totalUsers: 500,
    totalCourses: 120,
    totalEnrollments: 800,
    totalRevenue: 50000,
    activeInstructors: 25,
  };

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Instructor', joinDate: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Student', joinDate: '2024-01-13' },
  ];

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
                    {platformStats.totalEnrollments}
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
                Recent Users
              </Typography>
              {recentUsers.map((user) => (
                <Box key={user.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                  <Typography variant="h6">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email} • {user.role}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Joined: {user.joinDate}
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

export default AdminDashboard;
