// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'STUDENT' | 'INSTRUCTOR';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Course Types
export interface Course {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  instructor?: User;
  price: number;
  durationHours: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  enrollmentCount?: number;
  rating?: number;
  content?: CourseContent[];
}

export interface CourseContent {
  id: number;
  courseId: number;
  title: string;
  contentType: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'ASSIGNMENT';
  contentUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFree: boolean;
  createdAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  price: number;
  durationHours: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  thumbnailUrl?: string;
}

// Enrollment Types
export interface Enrollment {
  id: number;
  studentId: number;
  student?: User;
  courseId: number;
  course?: Course;
  enrollmentDate: string;
  completionDate?: string;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface EnrollmentRequest {
  courseId: number;
}

// Payment Types
export interface Payment {
  id: number;
  enrollmentId: number;
  enrollment?: Enrollment;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
}

export interface PaymentRequest {
  enrollmentId: number;
  paymentMethod: string;
  amount: number;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

// Dashboard Types
export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  totalEnrollments: number;
  recentEnrollments: Enrollment[];
  popularCourses: Course[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  recentEnrollments: Enrollment[];
  coursePerformance: { courseId: number; title: string; enrollments: number; revenue: number }[];
}

// Form Types
export interface CourseFilters {
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'title' | 'price' | 'createdAt' | 'enrollmentCount';
  sortDirection?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  size: number;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: number) => void;
  showActions?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}