// Export all services
export { default as apiService } from './api';
export { default as authService } from './authService';
export { default as courseService } from './courseService';
export { default as enrollmentService } from './enrollmentService';
export { default as paymentService } from './paymentService';
export { default as notificationService } from './notificationService';

// Re-export for convenience
import apiService from './api';
import authService from './authService';
import courseService from './courseService';
import enrollmentService from './enrollmentService';
import paymentService from './paymentService';
import notificationService from './notificationService';

export {
  apiService as api,
  authService as auth,
  courseService as courses,
  enrollmentService as enrollments,
  paymentService as payments,
  notificationService as notifications,
};