import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Box, TextField, Button, Stack } from '@mui/material';
import { fetchCourseById, processPaymentWorkflow } from '../services/api';
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
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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
      const uid = Number(user.id) || 0;
      const amount = Number(course?.price || 0);
      const res = await processPaymentWorkflow(uid, courseId, amount);
      if (res && res.status === 'success') {
        setSuccess('Payment successful! You are enrolled.');
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setError(res?.message || 'Payment failed. Please try again.');
      }
    } catch (e: any) {
      setError(e?.message || 'Payment failed. Please try again.');
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
              inputProps={{ inputMode: 'numeric' }}
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
              />
            </Stack>

            {error && (
              <Typography color="error" variant="body2">{error}</Typography>
            )}
            {success && (
              <Typography color="success.main" variant="body2">{success}</Typography>
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
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckoutPage;