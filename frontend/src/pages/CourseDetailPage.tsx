import React from 'react';
import { Box, Typography, Container, Button, Card, CardContent, Rating, Stack, Link as MuiLink, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseById, fetchCourseRatingSummary, fetchContentByCourse, logContentAccess, ContentItem } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const courseId = parseInt(id || '1');
  const [course, setCourse] = React.useState<any | null>(null);
  const [avgRating, setAvgRating] = React.useState<number>(0);
  const [ratingCount, setRatingCount] = React.useState<number>(0);
  const [contents, setContents] = React.useState<ContentItem[]>([]);
  const [contentError, setContentError] = React.useState<string | null>(null);
  const [contentLoading, setContentLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchCourseById(courseId);
        const summary = await fetchCourseRatingSummary(courseId);
        if (!mounted) return;
        setCourse(c);
        setAvgRating(summary?.average || 0);
        setRatingCount(summary?.count || 0);
      } catch (e) {
        // keep fallback UI
        if (mounted) {
          setCourse({
            id: courseId,
            title: `Course ${id} - Complete Guide`,
            description: `This is a comprehensive course that covers essential topics with practical examples.`,
            instructorId: undefined,
            price: 99.99,
            duration: '15 hours',
            level: 'Intermediate',
            language: 'English',
          });
          setAvgRating(0);
          setRatingCount(0);
        }
      }
    })();
    return () => { mounted = false; };
  }, [courseId, id]);

  React.useEffect(() => {
    let mounted = true;
    setContentLoading(true);
    setContentError(null);
    (async () => {
      try {
        const list = await fetchContentByCourse(courseId);
        if (!mounted) return;
        setContents(list || []);
      } catch (e: any) {
        if (mounted) setContentError(e?.message || 'Failed to load content');
      } finally {
        if (mounted) setContentLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const handleEnroll = () => {
    // Navigate to static checkout/payment flow
    navigate(`/checkout/${courseId}`);
  };

  const handleOpenContent = async (item: ContentItem) => {
    try {
      if (user && user.id) {
        await logContentAccess(Number(user.id), Number(item.contentId));
      }
    } catch (e) {
      // non-blocking: logging should not prevent content open
    } finally {
      try {
        window.open(item.url, '_blank', 'noopener');
      } catch {}
    }
  };

  if (!course) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Instructor: {course.instructorId ? `#${course.instructorId}` : 'Unknown'}
              </Typography>
              <Typography variant="body1" paragraph>
                {course.description || 'Learn core concepts with practical projects and clear explanations.'}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Rating value={avgRating} precision={0.1} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {avgRating.toFixed(1)} ({ratingCount} ratings)
                </Typography>
              </Stack>

              {/* Removed interactive rating until backend submission is wired */}
              {!user && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Log in to enroll and access content.
                </Typography>
              )}
              
              <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                What you'll learn
              </Typography>
              <ul>
                {(course.whatYouWillLearn || []).map((item: string, index: number) => (
                  <li key={index}>
                    <Typography variant="body1">{item}</Typography>
                  </li>
                ))}
              </ul>

              <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                Requirements
              </Typography>
              <ul>
                {(course.requirements || []).map((item: string, index: number) => (
                  <li key={index}>
                    <Typography variant="body1">{item}</Typography>
                  </li>
                ))}
              </ul>

              <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                Course Content
              </Typography>

              {contentLoading && (
                <Typography variant="body2" color="text.secondary">Loading content...</Typography>
              )}
              {contentError && (
                <Typography variant="body2" color="error">{contentError}</Typography>
              )}

              {!contentLoading && !contentError && (
                <Box>
                  {contents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No content available yet.</Typography>
                  ) : (
                    <ul>
                      {contents.map((item) => (
                        <li key={item.contentId}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={item.type} />
                            <MuiLink component="button" variant="body1" onClick={() => handleOpenContent(item)}>
                              {item.title}
                            </MuiLink>
                          </Stack>
                        </li>
                      ))}
                    </ul>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  ${Number(course.price || 0).toFixed(2)}
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleEnroll}>
                  Enroll Now
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About this course
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This course is designed to provide comprehensive knowledge and hands-on experience.
              </Typography>
              {course.level && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Level: {course.level}
                </Typography>
              )}
              {course.language && (
                <Typography variant="body2">
                  Language: {course.language}
                </Typography>
              )}
              {course.duration && (
                <Typography variant="body2">
                  Duration: {course.duration}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default CourseDetailPage;
