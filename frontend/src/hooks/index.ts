import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Course, 
  Enrollment, 
  Payment, 
  Notification, 
  User,
  PaginatedResponse,
  CourseFilters,
  PaginationParams 
} from '../types';
import { 
  courseService, 
  enrollmentService, 
  paymentService, 
  notificationService,
  authService 
} from '../services';

// Generic hooks
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue] as const;
};

// Course hooks
export const useCourses = (filters?: CourseFilters, pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['courses', filters, pagination],
    queryFn: () => courseService.getCourses(filters, pagination),
  });
};

export const useInstructorCourses = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['instructor-courses', pagination],
    queryFn: () => courseService.getMyCourses(pagination),
  });
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id,
  });
};

export const useMyCourses = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['my-courses', pagination],
    queryFn: () => courseService.getMyCourses(pagination),
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      courseService.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
    },
  });
};

// Enrollment hooks
export const useMyEnrollments = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['my-enrollments', pagination],
    queryFn: () => enrollmentService.getMyEnrollments(pagination),
  });
};

export const useEnrollment = (id: number) => {
  return useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => enrollmentService.getEnrollmentById(id),
    enabled: !!id,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authService.getCurrentUser(),
  });
};

export const useUserEnrollments = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['my-enrollments', pagination],
    queryFn: () => enrollmentService.getMyEnrollments(pagination),
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: enrollmentService.enrollInCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: enrollmentService.enrollInCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, progress }: { id: number; progress: number }) =>
      enrollmentService.updateProgress(id, progress),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', id] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });
};

// Payment hooks
export const useMyPayments = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['my-payments', pagination],
    queryFn: () => paymentService.getMyPayments(pagination),
  });
};

export const usePayment = (id: number) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPaymentById(id),
    enabled: !!id,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-payments'] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });
};

export const useInstructorEarnings = () => {
  return useQuery({
    queryKey: ['instructor-earnings'],
    queryFn: () => paymentService.getInstructorEarnings(),
  });
};

export const useInstructorStats = () => {
  return useQuery({
    queryKey: ['instructor-stats'],
    queryFn: async () => {
      // For now, return basic stats - this could be enhanced to call a real API endpoint
      return {
        totalStudents: 0,
        totalCourses: 0,
        totalEarnings: 0,
        monthlyStats: [],
      };
    },
  });
};

// Notification hooks
export const useNotifications = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['notifications', pagination],
    queryFn: () => notificationService.getMyNotifications(pagination),
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => notificationService.getUnreadNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useNotificationCount = () => {
  return useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });
};

// User profile hooks
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
  });
};

// Search hooks
export const useSearchCourses = (query: string, filters?: CourseFilters, pagination?: PaginationParams) => {
  const debouncedQuery = useDebounce(query, 300);
  
  return useQuery({
    queryKey: ['search-courses', debouncedQuery, filters, pagination],
    queryFn: () => courseService.searchCourses(debouncedQuery, filters, pagination),
    enabled: debouncedQuery.length > 0,
  });
};

// File upload hooks
export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<string>
  ) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const url = await uploadFn(file, setUploadProgress);
      return url;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    error,
  };
};

// Pagination hook
export const usePagination = (initialPage: number = 0, initialSize: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const nextPage = useCallback(() => setPage(p => p + 1), []);
  const prevPage = useCallback(() => setPage(p => Math.max(0, p - 1)), []);
  const goToPage = useCallback((newPage: number) => setPage(newPage), []);
  const changeSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when changing size
  }, []);

  return {
    page,
    size,
    nextPage,
    prevPage,
    goToPage,
    changeSize,
    pagination: { page, size },
  };
};

// Real-time notifications hook
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Invalidate notification queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    });

    return unsubscribe;
  }, [queryClient]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotifications,
  };
};