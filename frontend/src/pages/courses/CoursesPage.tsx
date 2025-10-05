import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Rating,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  Star,
  AccessTime,
  People,
  PlayArrow,
  BookmarkBorder,
  Bookmark,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses, useSearchCourses } from '../../hooks';
import { Course, CourseFilters } from '../../types';

const CoursesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<CourseFilters>({
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    priceRange: [0, 500],
    rating: 0,
    duration: '',
    language: '',
    sortBy: 'popularity',
    sortOrder: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const { data: coursesData, isLoading, error } = useCourses({
    page: currentPage,
    limit: 12,
    ...filters,
    search: searchQuery,
  });

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Digital Marketing',
    'Graphic Design',
    'Business',
    'Photography',
    'Music',
    'Language Learning',
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const durations = ['0-2 hours', '3-6 hours', '7-17 hours', '17+ hours'];

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.level) params.set('level', filters.level);
    setSearchParams(params);
  }, [searchQuery, filters.category, filters.level, setSearchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleBookmark = (courseId: number) => {
    setBookmarkedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      priceRange: [0, 500],
      rating: 0,
      duration: '',
      language: '',
      sortBy: 'popularity',
      sortOrder: 'desc',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load courses. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Discover Courses
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Learn new skills with our comprehensive course catalog
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="popularity">Popularity</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                </Select>
              </FormControl>
            </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Box sx={{ mt: 3, p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={filters.category}
                        label="Category"
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Level</InputLabel>
                      <Select
                        value={filters.level}
                        label="Level"
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                      >
                        <MenuItem value="">All Levels</MenuItem>
                        {levels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Duration</InputLabel>
                      <Select
                        value={filters.duration}
                        label="Duration"
                        onChange={(e) => handleFilterChange('duration', e.target.value)}
                      >
                        <MenuItem value="">Any Duration</MenuItem>
                        {durations.map((duration) => (
                          <MenuItem key={duration} value={duration}>
                            {duration}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={filters.language}
                        label="Language"
                        onChange={(e) => handleFilterChange('language', e.target.value)}
                      >
                        <MenuItem value="">All Languages</MenuItem>
                        {languages.map((language) => (
                          <MenuItem key={language} value={language}>
                            {language}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
                    <Typography gutterBottom>Price Range</Typography>
                    <Slider
                      value={filters.priceRange}
                      onChange={(_, value) => handleFilterChange('priceRange', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={500}
                      marks={[
                        { value: 0, label: 'Free' },
                        { value: 100, label: '$100' },
                        { value: 250, label: '$250' },
                        { value: 500, label: '$500+' },
                      ]}
                    />
                  </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
                    <Typography gutterBottom>Minimum Rating</Typography>
                    <Rating
                      value={filters.rating}
                      onChange={(_, value) => handleFilterChange('rating', value || 0)}
                      precision={0.5}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button variant="contained" onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </Box>
              </Box>
            </motion.div>
          )}
        </Box>

        {/* Results */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Results Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {coursesData?.total || 0} courses found
              </Typography>
              {(searchQuery || Object.values(filters).some(v => v && v !== '' && v !== 0)) && (
                <Button variant="text" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </Box>

            {/* Course Grid */}
            <Grid container spacing={3}>
              {coursesData?.courses.map((course, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={course.thumbnailUrl || '/api/placeholder/300/200'}
                          alt={course.title}
                          onClick={() => navigate(`/courses/${course.id}`)}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50%',
                            p: 0.5,
                          }}
                        >
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(course.id);
                            }}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                          >
                            {bookmarkedCourses.has(course.id) ? (
                              <Bookmark color="primary" />
                            ) : (
                              <BookmarkBorder />
                            )}
                          </Button>
                        </Box>
                        {course.price === 0 && (
                          <Chip
                            label="FREE"
                            color="success"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                      </Box>

                      <CardContent sx={{ p: 2 }} onClick={() => navigate(`/courses/${course.id}`)}>
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

                        <Typography
                          variant="h6"
                          component="h3"
                          gutterBottom
                          sx={{
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {course.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          by {course.instructor?.firstName} {course.instructor?.lastName}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={course.rating || 0} precision={0.1} size="small" readOnly />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {course.rating?.toFixed(1) || 'N/A'} ({course.enrollmentCount || 0} students)
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {course.duration || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <People fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {course.enrollmentCount || 0}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            {course.price > 0 ? (
                              <>
                                <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                                  ${course.price}
                                </Typography>
                                {course.originalPrice && course.originalPrice > course.price && (
                                  <Typography
                                    variant="body2"
                                    component="span"
                                    sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                                  >
                                    ${course.originalPrice}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                FREE
                              </Typography>
                            )}
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayArrow />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${course.id}`);
                            }}
                          >
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {coursesData && coursesData.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={coursesData.totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            {/* No Results */}
            {coursesData?.courses.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  No courses found
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Try adjusting your search criteria or filters
                </Typography>
                <Button variant="outlined" onClick={clearFilters} sx={{ mt: 2 }}>
                  Clear Filters
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default CoursesPage;