import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Box, TextField, Button, Stack, Alert, Paper, Divider } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { fetchCourseById } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const courseId = parseInt(id || '0');

  const [course, setCourse] = React.useState<any | null>(null);
  const [card, setCard] = React.useState({ number: '', name: '', expiry: '', cvv: '' });
  const [fieldErrors, setFieldErrors] = React.useState<{ number?: string; name?: string; expiry?: string; cvv?: string }>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [paymentComplete, setPaymentComplete] = React.useState(false);
  const [receipt, setReceipt] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchCourseById(courseId);
        if (mounted) setCourse(c);
      } catch (e) {
        if (mounted) setCourse({ id: courseId, title: `Course #${courseId}`, price: 0 });
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  React.useEffect(() => {
    if (!course) {
      navigate('/courses');
    }
  }, [course, navigate]);

  const handlePay = async () => {
    setError(null);
    if (!isAuthenticated || !user) {
      setError('Please login to continue.');
      navigate('/login');
      return;
    }
    if (!card.number || !card.name || !card.expiry || !card.cvv) {
      setError('Please fill in all card details.');
      return;
    }
    setLoading(true);
    try {
      // Simulate payment processing
      const uid = Number(user.id) || 0;
      const amount = Number(course?.price || 0);
      
      const receiptData = {
        orderId: `TXN_${Date.now()}`,
        userId: uid,
        courseId: courseId,
        courseTitle: course?.title,
        amount: amount,
        status: 'COMPLETED',
        transactionId: `TXN_${Date.now()}`,
        date: new Date().toISOString(),
        paymentMethod: 'Credit Card'
      };
      
      setReceipt(receiptData);
      setPaymentComplete(true);
      
      // Redirect after delay
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (e: any) {
      setError('Payment processing failed. Please try again.');
    }
    setLoading(false);
  };

  function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  function validateFields(next?: typeof card) {
    const cur = next || card;
    const errors: typeof fieldErrors = {};
    if (!/^\d{16}$/.test(cur.number.replace(/\s/g, ''))) errors.number = 'Invalid card number';
    if (!cur.name.trim()) errors.name = 'Name required';
    if (!/^\d{2}\/\d{2}$/.test(cur.expiry)) errors.expiry = 'Use MM/YY';
    if (!/^\d{3,4}$/.test(cur.cvv)) errors.cvv = 'Invalid CVV';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  if (!course) return null;

  if (paymentComplete && receipt) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
              <Typography variant="h4" color="success.main" align="center">
                Payment Successful!
              </Typography>
              <Typography variant="body1" align="center">
                Redirecting to dashboard...
              </Typography>
              
              <Paper sx={{ p: 3, width: '100%', bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>Receipt</Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Course:</Typography>
                    <Typography variant="body2" fontWeight="bold">{receipt.courseTitle}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Amount:</Typography>
                    <Typography variant="body2" fontWeight="bold">${receipt.amount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                      {receipt.transactionId}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                    <Typography variant="body2">{new Date(receipt.date).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {receipt.status}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
              
              <Button variant="contained" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Checkout
          </Typography>
          <Typography variant="h6">{course.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Instructor: {course.instructorId ? `#${course.instructorId}` : 'Unknown'}
          </Typography>
          <Typography variant="h4" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
            ${Number(course.price || 0).toFixed(2)}
          </Typography>

          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Card Number"
              value={card.number}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                const next = { ...card, number: formatted };
                setCard(next);
                validateFields(next);
              }}
              error={Boolean(fieldErrors.number)}
              helperText={fieldErrors.number}
              inputProps={{ inputMode: 'numeric', maxLength: 19 }}
              placeholder="1234 5678 9012 3456"
            />
            <TextField
              label="Cardholder Name"
              value={card.name}
              onChange={(e) => {
                const next = { ...card, name: e.target.value };
                setCard(next);
                validateFields(next);
              }}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Expiry (MM/YY)"
                value={card.expiry}
                onChange={(e) => {
                  const next = { ...card, expiry: e.target.value };
                  setCard(next);
                  validateFields(next);
                }}
                error={Boolean(fieldErrors.expiry)}
                helperText={fieldErrors.expiry}
                sx={{ flex: 1 }}
                placeholder="12/25"
              />
              <TextField
                label="CVV"
                value={card.cvv}
                onChange={(e) => {
                  const next = { ...card, cvv: e.target.value };
                  setCard(next);
                  validateFields(next);
                }}
                error={Boolean(fieldErrors.cvv)}
                helperText={fieldErrors.cvv}
                sx={{ flex: 1 }}
                inputProps={{ maxLength: 4 }}
              />
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
            
            <Button
              variant="contained"
              onClick={() => {
                const ok = validateFields();
                if (!ok) {
                  setError('Please correct the highlighted fields.');
                  return;
                }
                handlePay();
              }}
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
            
            <Button variant="text" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckoutPage;