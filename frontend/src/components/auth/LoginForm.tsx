import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // After login, redirect to last visited route or dashboard
      const lastRoute = localStorage.getItem('lastRoute');
      if (lastRoute && !['/auth/login', '/auth/register'].includes(lastRoute)) {
        navigate(lastRoute, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Demo credentials - in production, this would be removed
      await login('demo@example.com', 'demo123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🚗</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your road safety learning journey
          </p>
        </div>
        
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            {/* Demo Login Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="text-sm text-gray-600 hover:text-gray-500 underline"
              >
                Try Demo Account
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={loading}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}; 