import React from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'About Us', href: '/about' },
      { label: 'How it Works', href: '/how-it-works' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
    ],
    courses: [
      { label: 'Browse Courses', href: '/courses' },
      { label: 'Categories', href: '/categories' },
      { label: 'Popular Courses', href: '/popular' },
      { label: 'New Courses', href: '/new' },
      { label: 'Free Courses', href: '/free' },
    ],
    instructors: [
      { label: 'Become an Instructor', href: '/become-instructor' },
      { label: 'Instructor Resources', href: '/instructor-resources' },
      { label: 'Teaching Guidelines', href: '/teaching-guidelines' },
      { label: 'Instructor Community', href: '/instructor-community' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Technical Support', href: '/support' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Community Guidelines', href: '/guidelines' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com/coursehub', label: 'Facebook' },
    { icon: <Twitter />, href: 'https://twitter.com/coursehub', label: 'Twitter' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/coursehub', label: 'LinkedIn' },
    { icon: <Instagram />, href: 'https://instagram.com/coursehub', label: 'Instagram' },
    { icon: <YouTube />, href: 'https://youtube.com/coursehub', label: 'YouTube' },
  ];

  const contactInfo = [
    { icon: <Email />, text: 'support@coursehub.com', href: 'mailto:support@coursehub.com' },
    { icon: <Phone />, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: <LocationOn />, text: '123 Education St, Learning City, LC 12345' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.grey[900],
        color: theme.palette.common.white,
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              CourseHub
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: theme.palette.grey[400] }}>
              Empowering learners worldwide with high-quality online courses. 
              Join millions of students and instructors in our learning community.
            </Typography>
            
            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: theme.palette.grey[400],
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>

            {/* Contact Info */}
            <Box>
              {contactInfo.map((contact, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ mr: 1, color: theme.palette.grey[400] }}>
                    {contact.icon}
                  </Box>
                  {contact.href ? (
                    <Link
                      href={contact.href}
                      sx={{
                        color: theme.palette.grey[400],
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {contact.text}
                    </Link>
                  ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                      {contact.text}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Platform Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Platform
            </Typography>
            <Box>
              {footerLinks.platform.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    display: 'block',
                    color: theme.palette.grey[400],
                    textDecoration: 'none',
                    mb: 1,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Courses Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Courses
            </Typography>
            <Box>
              {footerLinks.courses.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    display: 'block',
                    color: theme.palette.grey[400],
                    textDecoration: 'none',
                    mb: 1,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Instructors Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Instructors
            </Typography>
            <Box>
              {footerLinks.instructors.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    display: 'block',
                    color: theme.palette.grey[400],
                    textDecoration: 'none',
                    mb: 1,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Support Links */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Support
            </Typography>
            <Box>
              {footerLinks.support.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    display: 'block',
                    color: theme.palette.grey[400],
                    textDecoration: 'none',
                    mb: 1,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Legal Links */}
          <Grid size={{ xs: 6, sm: 3, md: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Legal
            </Typography>
            <Box>
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    display: 'block',
                    color: theme.palette.grey[400],
                    textDecoration: 'none',
                    mb: 1,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: theme.palette.grey[700] }} />

        {/* Bottom Section */}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
              © {currentYear} CourseHub. All rights reserved.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                Made with ❤️ for learners everywhere
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Newsletter Signup */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Stay Updated
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.grey[400], mb: 2 }}>
            Subscribe to our newsletter for the latest courses and updates
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            <Box
              component="input"
              type="email"
              placeholder="Enter your email"
              sx={{
                flex: 1,
                px: 2,
                py: 1,
                borderRadius: 1,
                border: `1px solid ${theme.palette.grey[600]}`,
                backgroundColor: theme.palette.grey[800],
                color: theme.palette.common.white,
                '&::placeholder': {
                  color: theme.palette.grey[400],
                },
                '&:focus': {
                  outline: 'none',
                  borderColor: theme.palette.primary.main,
                },
              }}
            />
            <Box
              component="button"
              type="submit"
              sx={{
                px: 3,
                py: 1,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                border: 'none',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Subscribe
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;