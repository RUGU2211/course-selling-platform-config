import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/auth';
import { HomePage } from './pages';
import { LoginPage, RegisterPage } from './pages/auth';
import { CoursesPage, CourseDetailPage, CoursePlayerPage } from './pages/courses';
import { StudentDashboard, InstructorDashboard, AdminDashboard } from './pages/dashboard';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Routes with Layout */}
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<HomePage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:id" element={<CourseDetailPage />} />
                
                {/* Protected Routes */}
                <Route
                  path="courses/:id/learn"
                  element={
                    <ProtectedRoute>
                      <CoursePlayerPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Student Dashboard */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Instructor Routes */}
                <Route
                  path="instructor/*"
                  element={
                    <ProtectedRoute requiredRole="instructor">
                      <Routes>
                        <Route path="dashboard" element={<InstructorDashboard />} />
                        <Route path="courses" element={<InstructorDashboard />} />
                        <Route path="courses/create" element={<div>Create Course Page</div>} />
                        <Route path="courses/:id/edit" element={<div>Edit Course Page</div>} />
                        <Route path="analytics" element={<div>Instructor Analytics Page</div>} />
                        <Route path="earnings" element={<div>Instructor Earnings Page</div>} />
                        <Route path="content" element={<div>Content Management Page</div>} />
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="admin/*"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<div>User Management Page</div>} />
                        <Route path="courses" element={<div>Course Management Page</div>} />
                        <Route path="analytics" element={<div>Admin Analytics Page</div>} />
                        <Route path="settings" element={<div>Platform Settings Page</div>} />
                        <Route path="" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
                
                {/* Profile and Settings */}
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <div>Profile Page</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <div>Settings Page</div>
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
