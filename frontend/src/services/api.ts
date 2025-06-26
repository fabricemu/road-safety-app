import axios, {type AxiosInstance, type AxiosResponse } from 'axios';
import type {Lesson, Quiz, QuizQuestion, QuizResponse, TTSRequest, TTSResponse} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
        const token = localStorage.getItem('authToken');
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
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Lesson endpoints
  async getLessons(params?: { language?: string; skip?: number; limit?: number }): Promise<Lesson[]> {
    const response: AxiosResponse<Lesson[]> = await this.api.get('/lessons', { params });
    return response.data;
  }

  async getLesson(id: number): Promise<Lesson> {
    const response: AxiosResponse<Lesson> = await this.api.get(`/lessons/${id}`);
    return response.data;
  }

  async createLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<Lesson> {
    const response: AxiosResponse<Lesson> = await this.api.post('/lessons', lesson);
    return response.data;
  }

  async updateLesson(id: number, lesson: Partial<Lesson>): Promise<Lesson> {
    const response: AxiosResponse<Lesson> = await this.api.put(`/lessons/${id}`, lesson);
    return response.data;
  }

  async deleteLesson(id: number): Promise<void> {
    await this.api.delete(`/lessons/${id}`);
  }

  // Quiz endpoints
  async getQuizzes(params?: { language?: string; skip?: number; limit?: number }): Promise<Quiz[]> {
    const response: AxiosResponse<Quiz[]> = await this.api.get('/quiz', { params });
    return response.data;
  }

  async getQuiz(id: number): Promise<Quiz> {
    const response: AxiosResponse<Quiz> = await this.api.get(`/quiz/${id}`);
    return response.data;
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    const response: AxiosResponse<QuizQuestion[]> = await this.api.get(`/quiz/${quizId}/questions`);
    return response.data;
  }

  async getQuestion(id: number): Promise<QuizQuestion> {
    const response: AxiosResponse<QuizQuestion> = await this.api.get(`/quiz/question/${id}`);
    return response.data;
  }

  async submitAnswer(response: Omit<QuizResponse, 'id' | 'is_correct' | 'created_at'>): Promise<QuizResponse> {
    const apiResponse: AxiosResponse<QuizResponse> = await this.api.post('/quiz/submit', response);
    return apiResponse.data;
  }

  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<Quiz> {
    const response: AxiosResponse<Quiz> = await this.api.post('/quiz', quiz);
    return response.data;
  }

  // TTS endpoints
  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response: AxiosResponse<TTSResponse> = await this.api.post('/tts', request);
    return response.data;
  }

  async cleanupAudioFiles(maxAgeHours?: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.get('/tts/cleanup', {
      params: { max_age_hours: maxAgeHours }
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 