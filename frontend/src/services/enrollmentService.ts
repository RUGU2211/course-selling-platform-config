import { apiService } from './api';
import { 
  Enrollment, 
  EnrollmentRequest, 
  PaginatedResponse, 
  PaginationParams 
} from '../types';

class EnrollmentService {
  private readonly BASE_PATH = '/enrollments';

  // Enrollment operations
  async enrollInCourse(enrollmentData: EnrollmentRequest): Promise<Enrollment> {
    const response = await apiService.post<Enrollment>(this.BASE_PATH, enrollmentData);
    return response.data;
  }

  async getMyEnrollments(pagination?: PaginationParams): Promise<PaginatedResponse<Enrollment>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Enrollment>>(`${this.BASE_PATH}/my-enrollments`, params);
    return response.data;
  }

  async getEnrollmentById(id: number): Promise<Enrollment> {
    const response = await apiService.get<Enrollment>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async getEnrollmentByCourse(courseId: number): Promise<Enrollment | null> {
    try {
      const response = await apiService.get<Enrollment>(`${this.BASE_PATH}/course/${courseId}`);
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        return null; // Not enrolled
      }
      throw error;
    }
  }

  async cancelEnrollment(id: number): Promise<void> {
    await apiService.put(`${this.BASE_PATH}/${id}/cancel`);
  }

  async updateProgress(id: number, progress: number): Promise<Enrollment> {
    const response = await apiService.put<Enrollment>(`${this.BASE_PATH}/${id}/progress`, {
      progress,
    });
    return response.data;
  }

  async markAsCompleted(id: number): Promise<Enrollment> {
    const response = await apiService.put<Enrollment>(`${this.BASE_PATH}/${id}/complete`);
    return response.data;
  }

  // Instructor methods
  async getCourseEnrollments(courseId: number, pagination?: PaginationParams): Promise<PaginatedResponse<Enrollment>> {
    const params = {
      courseId,
      ...pagination,
    };
    
    const response = await apiService.get<PaginatedResponse<Enrollment>>(`${this.BASE_PATH}/course-enrollments`, params);
    return response.data;
  }

  async getInstructorEnrollments(pagination?: PaginationParams): Promise<PaginatedResponse<Enrollment>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Enrollment>>(`${this.BASE_PATH}/instructor-enrollments`, params);
    return response.data;
  }

  // Admin methods
  async getAllEnrollments(pagination?: PaginationParams): Promise<PaginatedResponse<Enrollment>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Enrollment>>(`${this.BASE_PATH}/all`, params);
    return response.data;
  }

  async getEnrollmentsByStudent(studentId: number, pagination?: PaginationParams): Promise<PaginatedResponse<Enrollment>> {
    const params = {
      studentId,
      ...pagination,
    };
    
    const response = await apiService.get<PaginatedResponse<Enrollment>>(`${this.BASE_PATH}/student`, params);
    return response.data;
  }

  // Statistics and analytics
  async getEnrollmentStats(): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    cancelledEnrollments: number;
    monthlyEnrollments: { month: string; count: number }[];
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/stats`);
    return response.data;
  }

  async getCourseEnrollmentStats(courseId: number): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
    completionRate: number;
  }> {
    const response = await apiService.get(`${this.BASE_PATH}/course/${courseId}/stats`);
    return response.data;
  }

  // Utility methods
  async isEnrolledInCourse(courseId: number): Promise<boolean> {
    try {
      const enrollment = await this.getEnrollmentByCourse(courseId);
      return enrollment !== null && enrollment.status === 'ACTIVE';
    } catch (error) {
      return false;
    }
  }

  async canAccessCourse(courseId: number): Promise<boolean> {
    try {
      const enrollment = await this.getEnrollmentByCourse(courseId);
      return enrollment !== null && ['ACTIVE', 'COMPLETED'].includes(enrollment.status);
    } catch (error) {
      return false;
    }
  }

  async getEnrollmentProgress(courseId: number): Promise<number> {
    try {
      const enrollment = await this.getEnrollmentByCourse(courseId);
      return enrollment?.progress || 0;
    } catch (error) {
      return 0;
    }
  }

  // Bulk operations
  async bulkEnroll(enrollmentRequests: EnrollmentRequest[]): Promise<Enrollment[]> {
    const response = await apiService.post<Enrollment[]>(`${this.BASE_PATH}/bulk-enroll`, {
      enrollments: enrollmentRequests,
    });
    return response.data;
  }

  async exportEnrollments(courseId?: number): Promise<Blob> {
    const params = courseId ? { courseId } : {};
    const response = await apiService.get(`${this.BASE_PATH}/export`, params);
    return new Blob([response.data], { type: 'text/csv' });
  }
}

export const enrollmentService = new EnrollmentService();
export default enrollmentService;