// Minimal API client for backend services via API Gateway with direct fallback
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8765";

export type BackendCourse = {
  id: number;
  title: string;
  description?: string;
  price: number;
  instructorId?: number;
  categoryId?: number;
  imageUrl?: string;
  students?: number;
  duration?: string;
};

export type RatingSummary = { average: number; count: number };

// Direct fallback removed for Kubernetes builds; all calls go via API Gateway.

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
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

// Ratings
export async function fetchCourseRatingSummary(courseId: number): Promise<RatingSummary> {
  return apiFetch<RatingSummary>(`/course-management-service/api/reviews/course/${courseId}/summary`);
}

export async function fetchGlobalRatingSummary(): Promise<RatingSummary> {
  return apiFetch<RatingSummary>(`/course-management-service/api/reviews/summary`);
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

// Payments
export async function processPaymentWorkflow(userId: number, courseId: number, amount: number): Promise<any> {
  const params = new URLSearchParams({ userId: String(userId), courseId: String(courseId), amount: String(amount) });
  return apiFetch<any>(`/payment-service/api/payments/workflow/process?${params.toString()}`, { method: 'POST' });
}

// Content Service
export type ContentItem = {
  contentId: number;
  courseId: number;
  type: 'VIDEO' | 'PDF' | 'DOC' | 'IMAGE';
  title: string;
  url: string;
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

// Note: Backend uses InstanceInfo.ActionType; use 'ADDED' to avoid enum mismatch
export async function logContentAccess(userId: number, contentId: number, action: string = 'STREAM'): Promise<void> {
  await apiFetch<void>(`/content-delivery-service/api/logs`, {
    method: 'POST',
    body: JSON.stringify({ userId, content: { contentId }, action }),
  });
}