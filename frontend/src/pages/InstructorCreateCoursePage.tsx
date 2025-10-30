import React from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCourse } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

const InstructorCreateCoursePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pushPopup } = useNotifications();

  const [form, setForm] = React.useState({
    title: '',
    price: '',
    duration: '',
    description: '',
    level: '',
    category: '',
    language: ''
  });
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'INSTRUCTOR') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleCreate = async () => {
    setError(null);
    if (!form.title || !form.price) {
      setError('Title and price are required.');
      return;
    }
    const priceNum = Number(form.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setError('Enter a valid price.');
      return;
    }
    const categoryIdNum = parseInt(form.category, 10);
    try {
      await createCourse({
        title: form.title,
        description: form.description || undefined,
        price: priceNum,
        instructorId: user?.id ? Number(user.id) : undefined,
        categoryId: Number.isNaN(categoryIdNum) ? undefined : categoryIdNum,
      });
      setSuccess('Course created successfully!');
      pushPopup('Course Created', `Your course "${form.title}" has been created.`);
      setTimeout(() => navigate('/instructor/dashboard'), 800);
    } catch (e) {
      setError(String((e as Error).message || e));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create a New Course
          </Typography>
          <Stack spacing={2}>
            <TextField label="Course Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <TextField label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 12 hours" />
            <TextField label="Description" multiline minRows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Beginner / Intermediate / Advanced" />
            <TextField label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Web Development" />
            <TextField label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="e.g., English" />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            {success && <Typography color="success.main" variant="body2">{success}</Typography>}
            <Button variant="contained" onClick={handleCreate}>Create Course</Button>
            <Button variant="text" onClick={() => navigate('/instructor/dashboard')}>Back to Dashboard</Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default InstructorCreateCoursePage;