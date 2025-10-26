import React from 'react';
import { Container, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPayments, getCourseById } from '../services/staticData';

const StudentPaymentsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const userId = Number(user?.id || 0);
  const payments = getPayments(userId);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Payment Receipts
      </Typography>

      <Card>
        <CardContent>
          {payments.length === 0 ? (
            <Typography>No payments found. Enroll in a course to generate a receipt.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map(p => {
                  const course = getCourseById(p.courseId);
                  const date = new Date(p.createdAt).toLocaleString();
                  return (
                    <TableRow key={p.id} hover>
                      <TableCell>{date}</TableCell>
                      <TableCell>{course?.title || `Course #${p.courseId}`}</TableCell>
                      <TableCell align="right">${p.amount.toFixed(2)}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>{p.id}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          <Button sx={{ mt: 2 }} variant="text" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentPaymentsPage;