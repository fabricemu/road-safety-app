// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Lesson types
export interface Lesson {
  id: number;
  title: string;
  content: string;
  language: string;
  difficulty_level: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LessonCreate {
  title: string;
  content: string;
  language: string;
  difficulty_level?: string;
  category?: string;
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