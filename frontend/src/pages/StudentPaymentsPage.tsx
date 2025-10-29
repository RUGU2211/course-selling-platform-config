import React from 'react';
import { Container, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPaymentHistory, fetchCourseById } from '../services/api';

const StudentPaymentsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const paymentData = await getPaymentHistory(Number(user.id));
        if (!mounted) return;
        setPayments(paymentData);
        
        // Fetch course details for each payment
        const coursePromises = paymentData.map((p: any) => 
          fetchCourseById(p.courseId).catch(() => null)
        );
        const courseData = await Promise.all(coursePromises);
        if (!mounted) return;
        setCourses(courseData.filter(Boolean));
      } catch (error) {
        console.error('Failed to load payment history:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading payment history...</Typography>
      </Container>
    );
  }

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
                  <TableCell>Order ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p, index) => {
                  const course = courses[index];
                  const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A';
                  return (
                    <TableRow key={p.id} hover>
                      <TableCell>{date}</TableCell>
                      <TableCell>{course?.title || `Course #${p.courseId}`}</TableCell>
                      <TableCell align="right">${(p.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={p.status || 'UNKNOWN'} 
                          color={getStatusColor(p.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{p.externalOrderId || `#${p.id}`}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          <Button sx={{ mt: 2 }} variant="text" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentPaymentsPage;