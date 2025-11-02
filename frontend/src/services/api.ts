// Minimal API client for backend services via API Gateway with direct fallback
// Always use relative paths in development - Vite proxy handles routing
const isDev = import.meta.env.DEV;
let API_BASE = import.meta.env.VITE_API_URL || "";

// In development, always use empty string (relative paths) for Vite proxy
// In production, use absolute URL from env, or default to http://localhost:8765
if (isDev) {
  API_BASE = ""; // Force relative paths in dev
} else if (!API_BASE) {
  API_BASE = "http://localhost:8765"; // Production fallback
}

// Remove trailing /api if present
if (API_BASE.endsWith("/api")) {
  API_BASE = API_BASE.substring(0, API_BASE.length - 4);
}

export type BackendCourse = {
  id: number;
  title: string;
  description?: string;
  price: number;
  instructorId?: number;
  imageUrl?: string;
  students?: number;
  duration?: string;
  enrollmentCount?: number;
  level?: string;
  language?: string;
};

export type RatingSummary = { average: number; count: number };

export type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
  progress: number;
  completed: boolean;
  stage1Completed?: boolean;
  stage2Completed?: boolean;
  currentStage?: number; // 0 = not started, 1 = stage 1, 2 = stage 2, 3 = completed
  enrolledAt: string;
};

export type EnrollmentProgress = {
  progress: number;
};

export type EnrollmentCompletion = {
  completed: boolean;
};

export type EnrollmentStats = {
  totalEnrollments: number;
  completedCourses: number;
  averageProgress: number;
  recentEnrollments: Enrollment[];
};

// Direct fallback removed for Kubernetes builds; all calls go via API Gateway.

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Remove any leading /api prefix that might be accidentally added
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.substring(4); // Remove "/api" prefix
  }
  
  // In development, use relative paths so Vite proxy can intercept
  // In production, use absolute URLs
  // Ensure API_BASE doesn't end with /api
  let baseUrl = API_BASE || "";
  if (baseUrl.endsWith("/api")) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 4);
  }
  
  const url = baseUrl 
    ? `${baseUrl}${cleanPath}`
    : cleanPath;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as any),
    },
    ...init,
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      // ignore
    }
    let message = res.statusText;
    try {
      const json = JSON.parse(detail);
      message = (json && (json.message || json.error || json.title)) || message;
    } catch {
      // not JSON, keep detail if present
      if (detail) message = detail;
    }
    throw new Error(`API ${path} failed: ${res.status} ${message}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}

// Courses
export async function fetchCourses(): Promise<BackendCourse[]> {
  return apiFetch<BackendCourse[]>(`/course-management-service/api/courses`);
}

export async function fetchCourseById(id: number): Promise<BackendCourse> {
  return apiFetch<BackendCourse>(`/course-management-service/api/courses/${id}`);
}

export async function createCourse(course: Partial<BackendCourse>): Promise<BackendCourse> {
  return apiFetch<BackendCourse>(`/course-management-service/api/courses`, {
    method: 'POST',
    body: JSON.stringify(course),
  });
}

export async function updateCourse(id: number, course: Partial<BackendCourse>): Promise<BackendCourse> {
  return apiFetch<BackendCourse>(`/course-management-service/api/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  });
}

export async function deleteCourse(id: number): Promise<void> {
  return apiFetch<void>(`/course-management-service/api/courses/${id}`, {
    method: 'DELETE',
  });
}

// Ratings & Reviews
export async function fetchCourseRatingSummary(courseId: number): Promise<RatingSummary> {
  return apiFetch<RatingSummary>(`/course-management-service/api/reviews/course/${courseId}/summary`);
}

export async function fetchGlobalRatingSummary(): Promise<RatingSummary> {
  return apiFetch<RatingSummary>(`/course-management-service/api/reviews/summary`);
}

export async function fetchCourseReviews(courseId: number): Promise<any[]> {
  return apiFetch<any[]>(`/course-management-service/api/reviews/course/${courseId}`);
}

export async function createReview(review: { courseId: number; userId: number; rating: number; comment?: string }): Promise<any> {
  return apiFetch<any>(`/course-management-service/api/reviews`, {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

// Auth
export type LoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string | number;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  };
};

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(`/user-management-service/api/users/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  username?: string;
};

export async function registerApi(payload: RegisterRequest): Promise<LoginResponse> {
  const body = { ...payload, username: payload.username || payload.email.split('@')[0] };
  return apiFetch<LoginResponse>(`/user-management-service/api/users/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getUserProfile(userId: number): Promise<any> {
  return apiFetch<any>(`/user-management-service/api/users/profile/${userId}`);
}

// Enrollment
export async function enrollInCourse(enrollment: { studentId: number; courseId: number }): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollment-service/api/enrollments`, {
    method: 'POST',
    body: JSON.stringify(enrollment),
  });
}

export async function getEnrollmentById(enrollmentId: number): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollment-service/api/enrollments/${enrollmentId}`);
}

export async function getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
  return apiFetch<Enrollment[]>(`/enrollment-service/api/enrollments/student/${studentId}`);
}

export async function getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
  return apiFetch<Enrollment[]>(`/enrollment-service/api/enrollments/course/${courseId}`);
}

export async function updateEnrollmentProgress(enrollmentId: number, progress: EnrollmentProgress): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollment-service/api/enrollments/${enrollmentId}/progress`, {
    method: 'PUT',
    body: JSON.stringify(progress),
  });
}

export async function updateEnrollmentCompletion(enrollmentId: number, completed: boolean): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollment-service/api/enrollments/${enrollmentId}/complete`, {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  });
}

export async function updateEnrollmentStage1(enrollmentId: number, completed: boolean): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollment-service/api/enrollments/${enrollmentId}/stage1`, {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  });
}

export async function updateEnrollmentStage2(enrollmentId: number, completed: boolean): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollment-service/api/enrollments/${enrollmentId}/stage2`, {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  });
}

export async function updateEnrollmentCurrentStage(enrollmentId: number, stage: number): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollment-service/api/enrollments/${enrollmentId}/current-stage`, {
    method: 'PUT',
    body: JSON.stringify({ stage }),
  });
}

export async function unenrollFromCourse(enrollmentId: number): Promise<void> {
  return apiFetch<void>(`/enrollment-service/api/enrollments/${enrollmentId}`, {
    method: 'DELETE',
  });
}

export async function getEnrollmentStats(studentId?: number): Promise<EnrollmentStats> {
  const url = studentId 
    ? `/enrollment-service/api/enrollments/student/${studentId}/stats`
    : `/enrollment-service/api/enrollments/stats`;
  return apiFetch<EnrollmentStats>(url);
}

// Content Service
export type ContentItem = {
  contentId: number;
  courseId: number;
  type: 'VIDEO' | 'PDF' | 'DOC' | 'IMAGE' | 'TEXT';
  title: string;
  url: string;
  body?: string; // For TEXT type content
  uploadedAt?: string;
};

export async function fetchContentByCourse(courseId: number): Promise<ContentItem[]> {
  return apiFetch<ContentItem[]>(`/content-delivery-service/api/content/course/${courseId}`);
}

export async function addContentItem(payload: Omit<ContentItem, 'contentId' | 'uploadedAt'>): Promise<ContentItem> {
  return apiFetch<ContentItem>(`/content-delivery-service/api/content`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteContentItem(contentId: number): Promise<void> {
  return apiFetch<void>(`/content-delivery-service/api/content/${contentId}`, {
    method: 'DELETE',
  });
}

// Note: Backend uses InstanceInfo.ActionType; use 'ADDED' to avoid enum mismatch
export async function logContentAccess(userId: number, contentId: number, action: string = 'STREAM'): Promise<void> {
  await apiFetch<void>(`/content-delivery-service/api/logs`, {
    method: 'POST',
    body: JSON.stringify({ userId, content: { contentId }, action }),
  });
}
