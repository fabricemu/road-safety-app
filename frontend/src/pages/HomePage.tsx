import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, Volume2, Globe, Shield, Users, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: BookOpen,
      title: t('home.feature.lessons'),
      description: 'Interactive lessons with voice support in multiple languages'
    },
    {
      icon: HelpCircle,
      title: t('home.feature.quiz'),
      description: 'Real-time quizzes with instant feedback and scoring'
    },
    {
      icon: Volume2,
      title: t('home.feature.tts'),
      description: 'Text-to-speech support for all lessons and content'
    },
    {
      icon: Globe,
      title: t('home.feature.multilingual'),
      description: 'Available in English, French, and Kinyarwanda'
    }
  ];

  const stats = [
    { label: 'Languages', value: '3', icon: Globe },
    { label: 'Lessons', value: '20+', icon: BookOpen },
    { label: 'Quiz Questions', value: '100+', icon: HelpCircle },
    { label: 'Users', value: '1000+', icon: Users }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/lessons">
              <Button size="lg" className="w-full sm:w-auto">
                {t('home.getStarted')}
              </Button>
            </Link>
            <Link to="/quiz">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Take a Quiz
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('home.features')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn road safety rules through interactive content designed for all ages and languages.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="text-center">
                <div className="flex justify-center mb-4">
                  <Icon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">
          Ready to learn road safety?
        </h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Start your journey to becoming a safer road user with our comprehensive lessons and interactive quizzes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/lessons">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Start Learning
            </Button>
          </Link>
          <Link to="/quiz">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
              Take a Quiz
            </Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              About Road Safety Learning
            </h2>
            <p className="text-gray-600 mb-4">
              Our platform is designed to make road safety education accessible to everyone, 
              regardless of their language or location. We believe that knowledge is the key 
              to preventing accidents and saving lives.
            </p>
            <p className="text-gray-600 mb-6">
              With interactive lessons, real-time quizzes, and voice support in multiple languages, 
              we're making road safety education engaging and effective for learners of all ages.
            </p>
            <div className="flex items-center space-x-4">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-600">Certified by road safety experts</span>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Trusted by Thousands
            </h3>
            <p className="text-gray-600">
              Join thousands of learners who have improved their road safety knowledge through our platform.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 