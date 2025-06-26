import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Timer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type { Quiz, QuizQuestion } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (id) {
      loadQuiz(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmitAnswer();
    }
  }, [timeLeft, showResult]);

  const loadQuiz = async (quizId: number) => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        apiService.getQuiz(quizId),
        apiService.getQuizQuestions(quizId)
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);
      setError(null);
    } catch (err) {
      setError('Failed to load quiz');
      console.error('Error loading quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;

    if (isCorrect) {
      setScore(score + currentQuestion.points);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
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

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Quiz not found'}</p>
        <Link to="/quiz">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/quiz">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="w-4 h-4 text-red-500" />
            <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Quiz Content */}
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {quiz.title}
          </h1>
          <p className="text-gray-600">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? showResult
                    ? index === currentQuestion.correct_answer_index
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{option}</span>
                {showResult && selectedAnswer === index && (
                  index === currentQuestion.correct_answer_index ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )
                )}
                {showResult && index === currentQuestion.correct_answer_index && selectedAnswer !== index && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Result */}
        {showResult && (
          <div className={`p-4 rounded-lg mb-6 ${
            selectedAnswer === currentQuestion.correct_answer_index
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              selectedAnswer === currentQuestion.correct_answer_index
                ? 'text-green-800'
                : 'text-red-800'
            }`}>
              {selectedAnswer === currentQuestion.correct_answer_index ? t('quiz.correct') : t('quiz.incorrect')}
            </h3>
            {currentQuestion.explanation && (
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Score: {score} points
          </div>
          <div className="space-x-3">
            {!showResult && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                {t('quiz.submit')}
              </Button>
            )}
            {showResult && !isLastQuestion && (
              <Button onClick={handleNextQuestion}>
                {t('quiz.next')}
              </Button>
            )}
            {showResult && isLastQuestion && (
              <Link to="/quiz">
                <Button>
                  Finish Quiz
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizDetailPage; 