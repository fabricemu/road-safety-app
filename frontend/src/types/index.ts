// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Course types
export interface Course {
  id: number;
  title: string;
  description?: string;
  language: string;
  category?: string;
  difficulty_level: string;
  estimated_duration?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CourseCreate {
  title: string;
  description?: string;
  language: string;
  category?: string;
  difficulty_level?: string;
  estimated_duration?: number;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
  language?: string;
  category?: string;
  difficulty_level?: string;
  estimated_duration?: number;
  is_active?: boolean;
}

// Module types
export interface Module {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ModuleCreate {
  title: string;
  description?: string;
  order_index: number;
}

export interface ModuleUpdate {
  title?: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
}

// Lesson types (updated)
export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  content: string;
  language: string;
  order_index: number;
  lesson_type: string;
  media_url?: string;
  estimated_duration?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LessonCreate {
  title: string;
  content: string;
  language: string;
  order_index: number;
  lesson_type?: string;
  media_url?: string;
  estimated_duration?: number;
}

export interface LessonUpdate {
  title?: string;
  content?: string;
  language?: string;
  order_index?: number;
  lesson_type?: string;
  media_url?: string;
  estimated_duration?: number;
  is_active?: boolean;
}

// User Progress types
export interface UserProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  completion_date?: string;
  time_spent?: number;
  score?: number;
  created_at: string;
  updated_at?: string;
}

export interface UserProgressCreate {
  completed: boolean;
  time_spent?: number;
  score?: number;
}

// Course Enrollment types
export interface CourseEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  certificate_issued: boolean;
  certificate_url?: string;
}

export interface CourseEnrollmentCreate {
  // Empty for now, enrollment is created automatically
}

// Course with content types
export interface LessonWithProgress extends Lesson {
  user_progress?: UserProgress;
}

export interface ModuleWithLessons extends Module {
  lessons: LessonWithProgress[];
}

export interface CourseWithContent extends Course {
  modules: ModuleWithLessons[];
  enrollment?: CourseEnrollment;
}

// Course Progress Summary
export interface CourseProgress {
  course_id: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  enrolled_at: string;
}

// Quiz types
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  language: string;
  difficulty_level: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface QuizResponse {
  id: number;
  question_id: number;
  user_answer_index: number;
  is_correct: boolean;
  response_time?: number;
  created_at: string;
}

// TTS types
export interface TTSRequest {
  text: string;
  language: string;
  voice_speed?: number;
  voice_pitch?: number;
}

export interface TTSResponse {
  audio_url: string;
  filename: string;
  duration?: number;
  file_size?: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface QuizWebSocketMessage extends WebSocketMessage {
  type: 'start_quiz' | 'submit_answer' | 'get_question' | 'quiz_started' | 'answer_result' | 'question' | 'error';
  quiz_id?: number;
  question_id?: number;
  answer_index?: number;
  response_time?: number;
  is_correct?: boolean;
  correct_answer?: number;
  explanation?: string;
  question_text?: string;
  options?: string[];
  time_limit?: number;
  message?: string;
}

// Language types
export type SupportedLanguage = 'english' | 'french' | 'kinyarwanda';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

// UI types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Analytics types
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    admins: number;
  };
  courses: {
    total: number;
    active: number;
  };
  lessons: {
    total: number;
    active: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  quizzes: {
    total: number;
    active: number;
  };
  recent_activity: {
    enrollments_7_days: number;
    progress_updates_7_days: number;
  };
}

export interface UserAnalytics {
  registration_trend: Array<{
    date: string;
    count: number;
  }>;
  active_users: {
    last_7_days: number;
    last_30_days: number;
  };
  language_preferences: Array<{
    language: string;
    count: number;
  }>;
}

export interface CourseAnalytics {
  popular_courses: Array<{
    id: number;
    title: string;
    enrollment_count: number;
  }>;
  completion_rates: Array<{
    id: number;
    title: string;
    total_enrollments: number;
    completed_enrollments: number;
    completion_rate: number;
  }>;
  language_distribution: Array<{
    language: string;
    count: number;
  }>;
  difficulty_distribution: Array<{
    difficulty: string;
    count: number;
  }>;
}

export interface QuizAnalytics {
  quiz_performance: Array<{
    id: number;
    title: string;
    total_responses: number;
    avg_correct_rate: number;
  }>;
  overall_stats: {
    total_responses: number;
    correct_responses: number;
    overall_accuracy: number;
    recent_responses_7_days: number;
  };
} 