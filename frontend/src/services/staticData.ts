// Simple static data store using localStorage for demo flows
// Provides courses, enrollments, and payments without backend

// Courses
export type Course = {
  id: number;
  title: string;
  instructor: string;
  price: number;
  rating?: number;
  students?: number;
  duration?: string;
  description?: string;
  imageUrl?: string;
  level?: string;
  category?: string;
  language?: string;
};

const LS_KEYS = {
  courses: 'static:courses',
  enrollments: 'static:enrollments',
  payments: 'static:payments',
  ratings: 'static:ratings',
} as const;

const defaultCourses: Course[] = [
  { id: 1, title: 'Introduction to React', instructor: 'John Doe', price: 49.99, rating: 4.5, students: 150, duration: '10 hours' },
  { id: 2, title: 'Advanced Spring Boot', instructor: 'Jane Smith', price: 79.99, rating: 4.8, students: 200, duration: '15 hours' },
  { id: 3, title: 'Docker for Developers', instructor: 'Mike Johnson', price: 59.99, rating: 4.3, students: 120, duration: '8 hours' },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCourses(): Course[] {
  const courses = read<Course[]>(LS_KEYS.courses, defaultCourses);
  write(LS_KEYS.courses, courses);
  return courses;
}

export function getCourseById(id: number): Course | undefined {
  return getCourses().find(c => c.id === id);
}

export function addCourse(course: Omit<Course, 'id'>): Course {
  const courses = getCourses();
  const nextId = courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1;
  const newCourse: Course = { id: nextId, ...course };
  write(LS_KEYS.courses, [...courses, newCourse]);
  return newCourse;
}

// Enrollments
export type Enrollment = { userId: number; courseId: number; enrolledAt: number };

export function getEnrollments(userId?: number): Enrollment[] {
  const all = read<Enrollment[]>(LS_KEYS.enrollments, []);
  return userId ? all.filter(e => e.userId === userId) : all;
}

export function enrollCourse(userId: number, courseId: number) {
  const enrollments = getEnrollments();
  const exists = enrollments.some(e => e.userId === userId && e.courseId === courseId);
  if (!exists) {
    enrollments.push({ userId, courseId, enrolledAt: Date.now() });
    write(LS_KEYS.enrollments, enrollments);
  }
}

// Payments
export type PaymentRecord = { id: string; userId: number; courseId: number; amount: number; status: 'SUCCESS' | 'FAILED'; createdAt: number };

export function processPayment(userId: number, courseId: number, amount: number): PaymentRecord {
  const payments = read<PaymentRecord[]>(LS_KEYS.payments, []);
  const record: PaymentRecord = {
    id: `${Date.now()}-${userId}-${courseId}`,
    userId,
    courseId,
    amount,
    status: 'SUCCESS',
    createdAt: Date.now(),
  };
  payments.push(record);
  write(LS_KEYS.payments, payments);
  return record;
}

export function getPayments(userId?: number): PaymentRecord[] {
  const all = read<PaymentRecord[]>(LS_KEYS.payments, []);
  return userId ? all.filter(p => p.userId === userId) : all;
}
// Utilities
export function resetStaticData() {
  write(LS_KEYS.courses, defaultCourses);
  write(LS_KEYS.enrollments, []);
  write(LS_KEYS.payments, []);
}

export type RatingRecord = { userId: number; courseId: number; rating: number; ratedAt: number };

export function getRatings(courseId?: number): RatingRecord[] {
  const all = read<RatingRecord[]>(LS_KEYS.ratings, []);
  return courseId ? all.filter(r => r.courseId === courseId) : all;
}

export function rateCourse(userId: number, courseId: number, rating: number) {
  const clamp = Math.max(1, Math.min(5, Math.round(rating)));
  const all = getRatings();
  const idx = all.findIndex(r => r.userId === userId && r.courseId === courseId);
  const record: RatingRecord = { userId, courseId, rating: clamp, ratedAt: Date.now() };
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  write(LS_KEYS.ratings, all);
  // Notify app for real-time updates
  try {
    window.dispatchEvent(new CustomEvent('ratings:updated', { detail: { courseId } }));
  } catch {}
}

export function getAverageRating(courseId: number): number {
  const ratings = getRatings(courseId);
  if (!ratings.length) return 0;
  return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
}

export function getCourseRatingCount(courseId: number): number {
  return getRatings(courseId).length;
}