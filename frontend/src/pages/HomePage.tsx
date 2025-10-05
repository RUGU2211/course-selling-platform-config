import React from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Rating,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow,
  School,
  People,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const stats = [
    { icon: <School />, value: '10,000+', label: 'Courses' },
    { icon: <People />, value: '500K+', label: 'Students' },
    { icon: <TrendingUp />, value: '95%', label: 'Success Rate' },
    { icon: <Star />, value: '4.8/5', label: 'Average Rating' },
  ];

  const featuredCourses = [
    {
      id: 1,
      title: 'Complete React Development Course',
      instructor: 'John Smith',
      rating: 4.9,
      students: 15420,
      price: 89.99,
      originalPrice: 199.99,
      image: '/api/placeholder/300/200',
      category: 'Web Development',
      level: 'Beginner',
      duration: '40 hours',
    },
    {
      id: 2,
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Sarah Johnson',
      rating: 4.8,
      students: 8930,
      price: 129.99,
      originalPrice: 249.99,
      image: '/api/placeholder/300/200',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '60 hours',
    },
    {
      id: 3,
      title: 'Digital Marketing Mastery',
      instructor: 'Mike Wilson',
      rating: 4.7,
      students: 12340,
      price: 69.99,
      originalPrice: 149.99,
      image: '/api/placeholder/300/200',
      category: 'Marketing',
      level: 'Beginner',
      duration: '25 hours',
    },
  ];

  const testimonials = [
    {
      name: 'Emily Chen',
      role: 'Software Developer',
      avatar: '/api/placeholder/60/60',
      content: 'CourseHub transformed my career. The quality of courses and instructors is exceptional.',
      rating: 5,
    },
    {
      name: 'David Rodriguez',
      role: 'Marketing Manager',
      avatar: '/api/placeholder/60/60',
      content: 'I learned more in 3 months than I did in years of traditional education. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Lisa Thompson',
      role: 'Data Analyst',
      avatar: '/api/placeholder/60/60',
      content: 'The practical approach and real-world projects helped me land my dream job.',
      rating: 5,
    },
  ];

  const features = [
    {
      icon: <PlayArrow />,
      title: 'Learn at Your Pace',
      description: 'Access courses 24/7 and learn at your own schedule with lifetime access.',
    },
    {
      icon: <People />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience.',
    },
    {
      icon: <CheckCircle />,
      title: 'Certificates',
      description: 'Earn certificates upon completion to showcase your new skills.',
    },
    {
      icon: <TrendingUp />,
      title: 'Career Growth',
      description: 'Advance your career with in-demand skills and practical knowledge.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: '#ffffff',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Learn Without Limits
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                  }}
                >
                  Discover thousands of courses from expert instructors and advance your career with practical skills.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/courses')}
                    sx={{
                      backgroundColor: '#ffffff',
                      color: theme.palette.primary.main,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.9),
                      },
                    }}
                  >
                    Explore Courses
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/auth/register')}
                    sx={{
                      borderColor: '#ffffff',
                      color: '#ffffff',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: alpha('#ffffff', 0.1),
                      },
                    }}
                  >
                    Start Learning
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src="/api/placeholder/500/400"
                    alt="Learning illustration"
                    sx={{
                      width: '100%',
                      maxWidth: 500,
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.primary.main,
                        color: '#ffffff',
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Courses Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Featured Courses
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Discover our most popular and highly-rated courses
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {featuredCourses.map((course, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={course.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={course.image}
                      alt={course.title}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip
                          label={course.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={course.level}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {course.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        by {course.instructor}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={course.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {course.rating} ({course.students.toLocaleString()} students)
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {course.duration}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                        <Box>
                          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                            ${course.price}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                          >
                            ${course.originalPrice}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<ArrowForward />}
                        >
                          Enroll
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/courses')}
              endIcon={<ArrowForward />}
            >
              View All Courses
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Why Choose CourseHub?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to succeed in your learning journey
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mb: 3,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              What Our Students Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join thousands of successful learners
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 60, height: 60, mx: 'auto', mb: 2 }}
                    />
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to Start Learning?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join millions of learners and start your journey today
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth/register')}
                sx={{
                  backgroundColor: '#ffffff',
                  color: theme.palette.primary.main,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.9),
                  },
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/courses')}
                sx={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: '#ffffff',
                    backgroundColor: alpha('#ffffff', 0.1),
                  },
                }}
              >
                Browse Courses
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;