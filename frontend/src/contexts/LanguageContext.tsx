import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SupportedLanguage, LanguageConfig } from '../types';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  languages: LanguageConfig[];
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages: LanguageConfig[] = [
  {
    code: 'english',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'french',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'kinyarwanda',
    name: 'Kinyarwanda',
    nativeName: 'Ikinyarwanda',
    flag: '🇷🇼'
  }
];

// Translation keys
const translations: Record<SupportedLanguage, Record<string, string>> = {
  english: {
    'nav.home': 'Home',
    'nav.lessons': 'Lessons',
    'nav.quiz': 'Quiz',
    'nav.language': 'Language',
    'home.title': 'Road Safety Learning Platform',
    'home.subtitle': 'Learn road safety rules in multiple languages',
    'home.getStarted': 'Get Started',
    'home.features': 'Features',
    'home.feature.lessons': 'Interactive Lessons',
    'home.feature.quiz': 'Real-time Quizzes',
    'home.feature.tts': 'Voice Support',
    'home.feature.multilingual': 'Multilingual Support',
    'lessons.title': 'Road Safety Lessons',
    'lessons.filter.all': 'All',
    'lessons.filter.beginner': 'Beginner',
    'lessons.filter.intermediate': 'Intermediate',
    'lessons.filter.advanced': 'Advanced',
    'quiz.title': 'Road Safety Quiz',
    'quiz.start': 'Start Quiz',
    'quiz.next': 'Next Question',
    'quiz.submit': 'Submit Answer',
    'quiz.correct': 'Correct!',
    'quiz.incorrect': 'Incorrect!',
    'quiz.score': 'Score',
    'quiz.complete': 'Quiz Complete!',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.cancel': 'Cancel',
    'common.save': 'Save'
  },
  french: {
    'nav.home': 'Accueil',
    'nav.lessons': 'Leçons',
    'nav.quiz': 'Quiz',
    'nav.language': 'Langue',
    'home.title': 'Plateforme d\'Apprentissage de la Sécurité Routière',
    'home.subtitle': 'Apprenez les règles de sécurité routière en plusieurs langues',
    'home.getStarted': 'Commencer',
    'home.features': 'Fonctionnalités',
    'home.feature.lessons': 'Leçons Interactifs',
    'home.feature.quiz': 'Quiz en Temps Réel',
    'home.feature.tts': 'Support Vocal',
    'home.feature.multilingual': 'Support Multilingue',
    'lessons.title': 'Leçons de Sécurité Routière',
    'lessons.filter.all': 'Tout',
    'lessons.filter.beginner': 'Débutant',
    'lessons.filter.intermediate': 'Intermédiaire',
    'lessons.filter.advanced': 'Avancé',
    'quiz.title': 'Quiz de Sécurité Routière',
    'quiz.start': 'Commencer le Quiz',
    'quiz.next': 'Question Suivante',
    'quiz.submit': 'Soumettre la Réponse',
    'quiz.correct': 'Correct !',
    'quiz.incorrect': 'Incorrect !',
    'quiz.score': 'Score',
    'quiz.complete': 'Quiz Terminé !',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer'
  },
  kinyarwanda: {
    'nav.home': 'Ahabanza',
    'nav.lessons': 'Amasomo',
    'nav.quiz': 'Quiz',
    'nav.language': 'Ururimi',
    'home.title': 'Urupapuro rwo Kwiga Mutekano w\'Umuhanda',
    'home.subtitle': 'Jya ubumenyi ku mategeko y\'umutekano w\'umuhanda mu ndimi zitandukanye',
    'home.getStarted': 'Tangira',
    'home.features': 'Ibikorwa',
    'home.feature.lessons': 'Amasomo yo Gukora',
    'home.feature.quiz': 'Quiz mu Giti Cye',
    'home.feature.tts': 'Gufasha ijwi',
    'home.feature.multilingual': 'Gufasha indimi zitandukanye',
    'lessons.title': 'Amasomo y\'Umutekano w\'Umuhanda',
    'lessons.filter.all': 'Byose',
    'lessons.filter.beginner': 'Utangira',
    'lessons.filter.intermediate': 'Hagati',
    'lessons.filter.advanced': 'Urugero',
    'quiz.title': 'Quiz y\'Umutekano w\'Umuhanda',
    'quiz.start': 'Tangira Quiz',
    'quiz.next': 'Ikibazo Gikurikira',
    'quiz.submit': 'Ohereza Igisubizo',
    'quiz.correct': 'Byemewe !',
    'quiz.incorrect': 'Ntibyemewe !',
    'quiz.score': 'Amafaranga',
    'quiz.complete': 'Quiz Yarangiye !',
    'common.loading': 'Kurura...',
    'common.error': 'Hari ikibazo cyabaye',
    'common.back': 'Subira inyuma',
    'common.next': 'Gukurikira',
    'common.cancel': 'Kureka',
    'common.save': 'Bika'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('english');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
    if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key] || key;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    languages,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 