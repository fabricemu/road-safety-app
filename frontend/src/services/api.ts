import axios, {type AxiosInstance, type AxiosResponse } from 'axios';
import type {
  Lesson, Quiz, QuizQuestion, QuizResponse, TTSRequest, TTSResponse,
  Course, CourseCreate, CourseUpdate, Module, ModuleCreate, ModuleUpdate,
  LessonCreate, LessonUpdate, UserProgress, UserProgressCreate,
  CourseEnrollment, CourseProgress
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response: AxiosResponse<{ access_token: string; token_type: string }> = await this.api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    preferred_language?: string;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/auth/me');
    return response.data;
  }

  // Course endpoints
  async getCourses(params?: { language?: string; category?: string }): Promise<Course[]> {
    const response: AxiosResponse<Course[]> = await this.api.get('/courses', { params });
    return response.data;
  }

  async getCourse(id: number): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(course: CourseCreate): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.post('/courses', course);
    return response.data;
  }

  async updateCourse(id: number, course: CourseUpdate): Promise<Course> {
    const response: AxiosResponse<Course> = await this.api.put(`/courses/${id}`, course);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await this.api.delete(`/courses/${id}`);
  }

  // Module endpoints
  async getModules(courseId: number): Promise<Module[]> {
    const response: AxiosResponse<Module[]> = await this.api.get(`/courses/${courseId}/modules`);
    return response.data;
  }

  async createModule(courseId: number, module: ModuleCreate): Promise<Module> {
    const response: AxiosResponse<Module> = await this.api.post(`/courses/${courseId}/modules`, module);
    return response.data;
  }

  async updateModule(moduleId: number, module: ModuleUpdate): Promise<Module> {
    const response: AxiosResponse<Module> = await this.api.put(`/courses/modules/${moduleId}`, module);
    return response.data;
  }

  // Lesson endpoints (updated)
  async getLessons(params?: { language?: string; skip?: number; limit?: number }): Promise<Lesson[]> {
    const response: AxiosResponse<Lesson[]> = await this.api.get('/api/lessons', { params });
    return response.data;
  }

  async getLessonsByModule(moduleId: number): Promise<Lesson[]> {
    const response: AxiosResponse<Lesson[]> = await this.api.get(`/courses/modules/${moduleId}/lessons`);
    return response.data;
  }

  async getLesson(id: number): Promise<Lesson> {
    const response: AxiosResponse<Lesson> = await this.api.get(`/lessons/${id}`);
    return response.data;
  }

  async createLesson(moduleId: number, lesson: LessonCreate): Promise<Lesson> {
    const response: AxiosResponse<Lesson> = await this.api.post(`/courses/modules/${moduleId}/lessons`, lesson);
    return response.data;
  }

  async updateLesson(lessonId: number, lesson: LessonUpdate): Promise<Lesson> {
    const response: AxiosResponse<Lesson> = await this.api.put(`/courses/lessons/${lessonId}`, lesson);
    return response.data;
  }

  async deleteLesson(id: number): Promise<void> {
    await this.api.delete(`/lessons/${id}`);
  }

  // User Progress endpoints
  async updateLessonProgress(lessonId: number, progress: UserProgressCreate): Promise<UserProgress> {
    const response: AxiosResponse<UserProgress> = await this.api.post(`/courses/lessons/${lessonId}/progress`, progress);
    return response.data;
  }

  async getUserProgress(): Promise<UserProgress[]> {
    const response: AxiosResponse<UserProgress[]> = await this.api.get('/courses/progress');
    return response.data;
  }

  // Course Enrollment endpoints
  async enrollInCourse(courseId: number): Promise<CourseEnrollment> {
    const response: AxiosResponse<CourseEnrollment> = await this.api.post(`/courses/${courseId}/enroll`);
    return response.data;
  }

  async getUserEnrollments(): Promise<CourseEnrollment[]> {
    const response: AxiosResponse<CourseEnrollment[]> = await this.api.get('/courses/enrollments');
    return response.data;
  }

  async getCourseProgress(courseId: number): Promise<CourseProgress> {
    const response: AxiosResponse<CourseProgress> = await this.api.get(`/courses/${courseId}/progress`);
    return response.data;
  }

  // Quiz endpoints
  async getQuizzes(params?: { language?: string; skip?: number; limit?: number }): Promise<Quiz[]> {
    const response: AxiosResponse<Quiz[]> = await this.api.get('/api/quiz', { params });
    return response.data;
  }

  async getQuiz(id: number): Promise<Quiz> {
    const response: AxiosResponse<Quiz> = await this.api.get(`/api/quiz/${id}`);
    return response.data;
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    const response: AxiosResponse<QuizQuestion[]> = await this.api.get(`/api/quiz/${quizId}/questions`);
    return response.data;
  }

  async getQuestion(id: number): Promise<QuizQuestion> {
    const response: AxiosResponse<QuizQuestion> = await this.api.get(`/api/quiz/question/${id}`);
    return response.data;
  }

  async submitAnswer(response: Omit<QuizResponse, 'id' | 'is_correct' | 'created_at'>): Promise<QuizResponse> {
    const apiResponse: AxiosResponse<QuizResponse> = await this.api.post('/api/quiz/submit', response);
    return apiResponse.data;
  }

  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<Quiz> {
    const response: AxiosResponse<Quiz> = await this.api.post('/api/quiz', quiz);
    return response.data;
  }

  // TTS endpoints
  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response: AxiosResponse<TTSResponse> = await this.api.post('/api/tts', request);
    return response.data;
  }

  async cleanupAudioFiles(maxAgeHours?: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.get('/api/tts/cleanup', {
      params: { max_age_hours: maxAgeHours }
    });
    return response.data;
  }

  // User Management (Admin)
  async getUsers(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/api/users');
    return response.data;
  }

  async updateUser(userId: number, userUpdate: Partial<any>): Promise<any> {
    const response: AxiosResponse<any> = await this.api.put(`/api/users/${userId}`, userUpdate);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.api.delete(`/api/users/${userId}`);
  }

  // Analytics endpoints
  async getDashboardStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/api/analytics/dashboard-stats');
    return response.data;
  }

  async getUserAnalytics(days: number = 30): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/api/analytics/user-analytics', {
      params: { days }
    });
    return response.data;
  }

  async getCourseAnalytics(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/api/analytics/course-analytics');
    return response.data;
  }

  async getQuizAnalytics(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/api/analytics/quiz-analytics');
    return response.data;
  }

  async getUserCount(): Promise<{ total_users: number }> {
    const response: AxiosResponse<{ total_users: number }> = await this.api.get('/api/analytics/user-count');
    return response.data;
  }

  // PDF Upload endpoints
  async uploadPDF(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<any> = await this.api.post('/api/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async extractPDFContent(fileId: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/api/pdf/extract/${fileId}`);
    return response.data;
  }

  async deletePDF(fileId: string): Promise<any> {
    const response: AxiosResponse<any> = await this.api.delete(`/api/pdf/${fileId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 