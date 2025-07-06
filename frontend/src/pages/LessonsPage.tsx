import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Volume2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';
import type {Lesson} from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LessonsPage: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadLessons();
  }, [currentLanguage]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLessons({ language: currentLanguage });
      setLessons(data);
      setError(null);
    } catch (err) {
      setError('Failed to load lessons');
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty_level === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const categories = ['all', 'general', 'traffic_signs', 'pedestrian', 'vehicle'];

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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadLessons}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('lessons.title')}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Learn road safety rules through interactive lessons with voice support in your preferred language.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {t(`lessons.filter.${difficulty}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons found</h3>
          <p className="text-gray-600">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/lessons/${lesson.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lesson.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                      lesson.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lesson.difficulty_level}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {lesson.category}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(lesson.title);
                  }}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {lesson.content.substring(0, 150)}...
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(lesson.created_at).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonsPage; 