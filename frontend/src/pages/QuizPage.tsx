import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Play, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type {Quiz} from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const QuizPage: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [currentLanguage]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getQuizzes({ language: currentLanguage });
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load quizzes');
      console.error('Error loading quizzes:', err);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadQuizzes}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('quiz.title')}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Test your road safety knowledge with interactive quizzes. Get instant feedback and track your progress.
        </p>
      </div>

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes available</h3>
          <p className="text-gray-600">Check back later for new quizzes.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {quiz.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                      quiz.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty_level}
                    </span>
                    <span className="text-gray-500">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Multiple choice questions
                </span>
                <Link to={`/quiz/${quiz.id}`}>
                  <Button>
                    <Play className="w-4 h-4 mr-2" />
                    {t('quiz.start')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to test your knowledge?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Choose a quiz above to start testing your road safety knowledge. 
          Each quiz provides instant feedback and helps you learn from your mistakes.
        </p>
        <Link to="/lessons">
          <Button variant="outline">
            Review Lessons First
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default QuizPage; 