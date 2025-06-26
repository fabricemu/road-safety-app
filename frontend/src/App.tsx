import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import  Layout from './layouts/Layout.tsx'
import HomePage from './pages/HomePage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import QuizPage from './pages/QuizPage'
import QuizDetailPage from './pages/QuizDetailPage'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/:id" element={<LessonDetailPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/:id" element={<QuizDetailPage />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  )
}

export default App
