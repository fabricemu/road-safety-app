import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, Volume2, Globe, Shield, Users, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
// If the above import fails, try:
// import 'swiper/swiper-bundle.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const testimonials = [
  {
    name: 'Alice',
    text: 'This platform made learning road safety fun and easy! Highly recommended.',
    country: '🇷🇼 Rwanda'
  },
  {
    name: 'Jean',
    text: 'J\'ai adoré les quiz interactifs et les leçons en français.',
    country: '🇫🇷 France'
  },
  {
    name: 'John',
    text: 'The voice support and multilingual content are game changers.',
    country: '🇺🇸 USA'
  }
];

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Hero Section with background image and fade-in */}
      <motion.section
        className="text-center py-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {t('home.title')}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/lessons">
              <Button size="lg" className="w-full sm:w-auto">
                {t('home.getStarted')}
              </Button>
            </Link>
            <Link to="/quiz">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                Take a Quiz
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Stats Section with skeleton loader */}
      <motion.section className="py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton height={32} width={32} className="mx-auto mb-2" />
                  <Skeleton height={28} width={48} className="mx-auto mb-1" />
                  <Skeleton height={16} width={60} className="mx-auto" />
                </div>
              ))
            : stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                  </div>
                );
              })}
        </div>
      </motion.section>

      {/* Features Section with skeleton loader and fade-in */}
      <motion.section className="py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.features')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn road safety rules through interactive content designed for all ages and languages.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <Card key={i} className="text-center">
                  <Skeleton height={48} width={48} className="mx-auto mb-4" />
                  <Skeleton height={20} width={80} className="mx-auto mb-2" />
                  <Skeleton height={16} width={120} className="mx-auto" />
                </Card>
              ))
            : features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="text-center">
                    <div className="flex justify-center mb-4">
                      <Icon className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
        </div>
      </motion.section>

      {/* Carousel Section for testimonials */}
      <motion.section className="py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">What Our Learners Say</h2>
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            loop
            modules={[Autoplay]}
            autoplay={{ delay: 4000 }}
          >
            {testimonials.map((testimonial, idx) => (
              <SwiperSlide key={idx}>
                <Card className="p-8 text-center shadow-lg">
                  <div className="text-4xl mb-2">{testimonial.country}</div>
                  <p className="text-lg italic mb-4">“{testimonial.text}”</p>
                  <div className="font-semibold text-blue-600">{testimonial.name}</div>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.section>

      {/* CTA Section with fade-in */}
      <motion.section className="bg-blue-600 rounded-lg p-8 text-center text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
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
      </motion.section>

      {/* About Section with fade-in and scroll effect */}
      <motion.section className="py-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 }}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              About Road Safety Learning
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our platform is designed to make road safety education accessible to everyone, 
              regardless of their language or location. We believe that knowledge is the key 
              to preventing accidents and saving lives.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              With interactive lessons, real-time quizzes, and voice support in multiple languages, 
              we're making road safety education engaging and effective for learners of all ages.
            </p>
            <div className="flex items-center space-x-4">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Certified by road safety experts</span>
            </div>
          </div>
          <motion.div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center" initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }}>
            <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Trusted by Thousands
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Join thousands of learners who have improved their road safety knowledge through our platform.
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage; 