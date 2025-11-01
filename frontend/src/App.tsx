import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';
import InstructorCreateCoursePage from './pages/InstructorCreateCoursePage';

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
  },
  shape: {
    borderRadius: 12,
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
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
                  <Route index element={<HomePage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:id" element={<CourseDetailPage />} />
                <Route path="checkout/:id" element={<CheckoutPage />} />
                
                {/* Student Dashboard */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute requiredRoles={["STUDENT"]}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Instructor Routes */}
                  <Route
                    path="instructor/*"
                    element={
                      <ProtectedRoute requiredRoles={["INSTRUCTOR"]}>
                        <Routes>
                          <Route path="dashboard" element={<InstructorDashboard />} />
                          <Route path="" element={<InstructorDashboard />} />
                          <Route path="create-course" element={<InstructorCreateCoursePage />} />
                        </Routes>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Admin Routes */}
                  <Route
                    path="admin/*"
                    element={
                      <ProtectedRoute requiredRoles={["ADMIN"]}>
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="" element={<AdminDashboard />} />
                        </Routes>
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
