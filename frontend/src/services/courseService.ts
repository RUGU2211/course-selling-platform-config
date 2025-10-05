import { apiService } from './api';
import { 
  Course, 
  CreateCourseRequest, 
  CourseContent, 
  CourseFilters, 
  PaginatedResponse, 
  PaginationParams 
} from '../types';

class CourseService {
  private readonly BASE_PATH = '/courses';

  // Unified course listing to match current UI expectations
  async getCourses(
    filters?: CourseFilters,
    pagination?: PaginationParams
  ): Promise<{ courses: Course[]; total: number; totalPages: number }> {
    const params = {
      ...filters,
      ...pagination,
    };

    const response = await apiService.get<Course[]>(this.BASE_PATH, params);
    const courses = response.data || [];
    return {
      courses,
      total: courses.length,
      totalPages: 1,
    };
  }

  // Course CRUD operations
  async getAllCourses(
    filters?: CourseFilters, 
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Course>> {
    const params = {
      ...filters,
      ...pagination,
    };
    
    const response = await apiService.get<PaginatedResponse<Course>>(this.BASE_PATH, params);
    return response.data;
  }

  async getCourseById(id: number): Promise<Course> {
    const response = await apiService.get<Course>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async createCourse(courseData: CreateCourseRequest): Promise<Course> {
    const response = await apiService.post<Course>(this.BASE_PATH, courseData);
    return response.data;
  }

  async updateCourse(id: number, courseData: Partial<CreateCourseRequest>): Promise<Course> {
    const response = await apiService.put<Course>(`${this.BASE_PATH}/${id}`, courseData);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }

  async publishCourse(id: number): Promise<Course> {
    const response = await apiService.put<Course>(`${this.BASE_PATH}/${id}/publish`);
    return response.data;
  }

  async unpublishCourse(id: number): Promise<Course> {
    const response = await apiService.put<Course>(`${this.BASE_PATH}/${id}/unpublish`);
    return response.data;
  }

  // Course content management
  async getCourseContent(courseId: number): Promise<CourseContent[]> {
    const response = await apiService.get<CourseContent[]>(`${this.BASE_PATH}/${courseId}/content`);
    return response.data;
  }

  async addCourseContent(courseId: number, content: Omit<CourseContent, 'id' | 'courseId' | 'createdAt'>): Promise<CourseContent> {
    const response = await apiService.post<CourseContent>(`${this.BASE_PATH}/${courseId}/content`, content);
    return response.data;
  }

  async updateCourseContent(courseId: number, contentId: number, content: Partial<CourseContent>): Promise<CourseContent> {
    const response = await apiService.put<CourseContent>(`${this.BASE_PATH}/${courseId}/content/${contentId}`, content);
    return response.data;
  }

  async deleteCourseContent(courseId: number, contentId: number): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${courseId}/content/${contentId}`);
  }

  async reorderCourseContent(courseId: number, contentIds: number[]): Promise<CourseContent[]> {
    const response = await apiService.put<CourseContent[]>(`${this.BASE_PATH}/${courseId}/content/reorder`, {
      contentIds,
    });
    return response.data;
  }

  // Instructor-specific methods
  async getInstructorCourses(instructorId?: number, pagination?: PaginationParams): Promise<PaginatedResponse<Course>> {
    const params = {
      instructorId,
      ...pagination,
    };
    
    const response = await apiService.get<PaginatedResponse<Course>>(`${this.BASE_PATH}/instructor`, params);
    return response.data;
  }

  async getMyCourses(pagination?: PaginationParams): Promise<PaginatedResponse<Course>> {
    const params = pagination;
    const response = await apiService.get<PaginatedResponse<Course>>(`${this.BASE_PATH}/my-courses`, params);
    return response.data;
  }

  // Search and filtering
  async searchCourses(query: string, filters?: CourseFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Course>> {
    const params = {
      search: query,
      ...filters,
      ...pagination,
    };
    
    const response = await apiService.get<PaginatedResponse<Course>>(`${this.BASE_PATH}/search`, params);
    return response.data;
  }

  async getCoursesByCategory(category: string, pagination?: PaginationParams): Promise<PaginatedResponse<Course>> {
    const params = {
      category,
      ...pagination,
    };
    
    const response = await apiService.get<PaginatedResponse<Course>>(`${this.BASE_PATH}/category`, params);
    return response.data;
  }

  async getPopularCourses(limit?: number): Promise<Course[]> {
    const params = limit ? { limit } : {};
    const response = await apiService.get<Course[]>(`${this.BASE_PATH}/popular`, params);
    return response.data;
  }

  async getFeaturedCourses(limit?: number): Promise<Course[]> {
    const params = limit ? { limit } : {};
    const response = await apiService.get<Course[]>(`${this.BASE_PATH}/featured`, params);
    return response.data;
  }

  // File upload methods
  async uploadCourseThumbnail(courseId: number, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiService.uploadFile<{ url: string }>(
      `${this.BASE_PATH}/${courseId}/thumbnail`,
      file,
      onProgress
    );
    return response.data.url;
  }

  async uploadCourseVideo(courseId: number, contentId: number, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiService.uploadFile<{ url: string }>(
      `${this.BASE_PATH}/${courseId}/content/${contentId}/video`,
      file,
      onProgress
    );
    return response.data.url;
  }

  async uploadCourseDocument(courseId: number, contentId: number, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiService.uploadFile<{ url: string }>(
      `${this.BASE_PATH}/${courseId}/content/${contentId}/document`,
      file,
      onProgress
    );
    return response.data.url;
  }

  // Analytics and statistics
  async getCourseAnalytics(courseId: number): Promise<any> {
    const response = await apiService.get(`${this.BASE_PATH}/${courseId}/analytics`);
    return response.data;
  }

  async getCourseCategories(): Promise<string[]> {
    const response = await apiService.get<string[]>(`${this.BASE_PATH}/categories`);
    return response.data;
  }
}

export const courseService = new CourseService();
export default courseService;