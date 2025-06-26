import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Volume2, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type {Lesson} from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, currentLanguage } = useLanguage();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadLesson(parseInt(id));
    }
  }, [id]);

  const loadLesson = async (lessonId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getLesson(lessonId);
      setLesson(data);
      setError(null);
    } catch (err) {
      setError('Failed to load lesson');
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (text: string) => {
    try {
      const response = await apiService.synthesizeSpeech({
        text,
        language: currentLanguage
      });
      
      const audio = new Audio(`http://localhost:8000${response.audio_url}`);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Lesson not found'}</p>
        <Link to="/lessons">
          <Button>Back to Lessons</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/lessons">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
        </Link>
      </div>

      {/* Lesson Content */}
      <Card>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {lesson.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                lesson.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                lesson.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {lesson.difficulty_level}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {lesson.category}
              </span>
              <span className="text-gray-500">
                {new Date(lesson.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            onClick={() => playAudio(lesson.title)}
            variant="outline"
            size="sm"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Listen to Title
          </Button>
        </div>

        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-lg leading-relaxed text-gray-800">
              {lesson.content}
            </p>
          </div>
          
          <Button
            onClick={() => playAudio(lesson.content)}
            className="w-full"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Listen to Full Lesson
          </Button>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Link to="/lessons">
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            All Lessons
          </Button>
        </Link>
        <Link to="/quiz">
          <Button>
            Take a Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LessonDetailPage; 