import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Lessons', href: '/lessons', icon: '📚' },
    { name: 'Quiz', href: '/quiz', icon: '❓' },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: '⚙️' }] : []),
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-gray-900 text-white' : 'min-h-screen bg-gray-50'}>
      {/* Navigation */}
      <nav className={theme === 'dark' ? 'bg-gray-800 shadow-lg' : 'bg-white shadow-lg'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">🛣️</span>
                <span className="text-xl font-bold">Road Safety</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActiveRoute(item.href)
                        ? (theme === 'dark' ? 'border-blue-400 text-white' : 'border-blue-500 text-gray-900')
                        : (theme === 'dark' ? 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700')
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - Language, Theme, User menu, Mobile menu button */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="hidden sm:flex items-center space-x-2">
                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="english">🇺🇸 English</option>
                  <option value="french">🇫🇷 Français</option>
                  <option value="kinyarwanda">🇷🇼 Kinyarwanda</option>
                </select>
              </div>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-xl focus:outline-none"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
              {/* User Menu */}
              <div className="hidden sm:flex items-center space-x-4">
                <div className="text-sm">
                  Welcome, {user?.full_name || user?.username}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Language Selector */}
              <div className="px-3 py-2">
                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="english">🇺🇸 English</option>
                  <option value="french">🇫🇷 Français</option>
                  <option value="kinyarwanda">🇷🇼 Kinyarwanda</option>
                </select>
              </div>

              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="text-sm text-gray-700 mb-2">
                  Welcome, {user?.full_name || user?.username}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className={theme === 'dark' ? 'bg-gray-900 border-t border-gray-700 mt-auto text-white' : 'bg-white border-t border-gray-200 mt-auto'}>
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🛣️</span>
                <span className="text-lg font-bold">Road Safety</span>
              </div>
              <p className="text-sm mb-4 opacity-80">
                Your trusted platform for learning road safety rules, interactive lessons, and real-time quizzes. Stay safe, stay informed!
              </p>
              <div className="flex space-x-3 mt-2">
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80" aria-label="Twitter"><span>🐦</span></a>
                <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80" aria-label="Facebook"><span>📘</span></a>
                <a href="mailto:support@roadsafety.com" className="hover:opacity-80" aria-label="Email"><span>✉️</span></a>
              </div>
            </div>
            {/* Popular Links */}
            <div>
              <h3 className="font-semibold mb-3">Popular Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/lessons" className="hover:underline">🚦 Road Safety Lessons</Link></li>
                <li><Link to="/quiz" className="hover:underline">❓ Take a Quiz</Link></li>
                <li><Link to="/dashboard" className="hover:underline">📊 My Dashboard</Link></li>
                <li><Link to="/admin" className="hover:underline">⚙️ Admin Panel</Link></li>
                <li><a href="/assets/questions.pdf" target="_blank" rel="noopener noreferrer" className="hover:underline">📄 Download Questions PDF</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.who.int/roadsafety" target="_blank" rel="noopener noreferrer" className="hover:underline">🌐 WHO Road Safety</a></li>
                <li><a href="https://www.unroadsafetyfund.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">🌍 UN Road Safety Fund</a></li>
                <li><a href="https://www.rnp.rw/road-safety" target="_blank" rel="noopener noreferrer" className="hover:underline">🇷🇼 Rwanda National Police</a></li>
                <li><a href="mailto:support@roadsafety.com" className="hover:underline">✉️ Contact Support</a></li>
              </ul>
            </div>
            {/* Support & Legal */}
            <div>
              <h3 className="font-semibold mb-3">Support & Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:underline">🔒 Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:underline">📜 Terms of Service</Link></li>
                <li><a href="mailto:support@roadsafety.com" className="hover:underline">💬 Email Support</a></li>
                <li><a href="/faq" className="hover:underline">❔ FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 text-center text-xs opacity-70">
            &copy; {new Date().getFullYear()} Road Safety Learning Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}; 