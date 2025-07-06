import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CourseManagement } from './CourseManagement';
import { PDFUpload } from './PDFUpload';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import type { Course, CourseEnrollment, DashboardStats as ApiDashboardStats, UserAnalytics, CourseAnalytics, QuizAnalytics } from '../../types';

type AdminTab = 'dashboard' | 'courses' | 'users' | 'analytics' | 'upload';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  activeEnrollments: number;
  recentCourses: Course[];
  recentEnrollments: CourseEnrollment[];
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    activeEnrollments: 0,
    recentCourses: [],
    recentEnrollments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data from the new API
      const analyticsData = await apiService.getDashboardStats();
      
      // Fetch courses for recent activity
      const courses = await apiService.getCourses();
      const recentEnrollments = await apiService.getUserEnrollments();
      
      setStats({
        totalUsers: analyticsData.users.total,
        totalCourses: analyticsData.courses.total,
        totalLessons: analyticsData.lessons.total,
        activeEnrollments: analyticsData.enrollments.active,
        recentCourses: courses.slice(0, 5), // Show 5 most recent
        recentEnrollments: recentEnrollments.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-course':
        setActiveTab('courses');
        break;
      case 'upload-pdf':
        setActiveTab('upload');
        break;
      case 'manage-users':
        setActiveTab('users');
        break;
      case 'analytics':
        setActiveTab('analytics');
        break;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} loading={loading} onRefresh={fetchDashboardStats} onQuickAction={handleQuickAction} />;
      case 'courses':
        return <CourseManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'upload':
        return <PDFUpload />;
      default:
        return <DashboardOverview stats={stats} loading={loading} onRefresh={fetchDashboardStats} onQuickAction={handleQuickAction} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user?.full_name || user?.username || 'Admin'}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Overview', icon: '📊' },
              { id: 'courses', label: 'Courses', icon: '📚' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'upload', label: 'Upload PDF', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

interface DashboardOverviewProps {
  stats: DashboardStats;
  loading: boolean;
  onRefresh: () => void;
  onQuickAction: (action: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, loading, onRefresh, onQuickAction }) => {
  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center"
        >
          <span className="mr-2">🔄</span>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-lg">📚</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Courses
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {loading ? '...' : stats.totalCourses}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-lg">📖</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Lessons
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {loading ? '...' : stats.totalLessons}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-lg">🎓</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Enrollments
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {loading ? '...' : stats.activeEnrollments}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start"
              onClick={() => onQuickAction('create-course')}
            >
              <span className="mr-2">➕</span>
              Create New Course
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => onQuickAction('upload-pdf')}
            >
              <span className="mr-2">📄</span>
              Upload PDF Document
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => onQuickAction('manage-users')}
            >
              <span className="mr-2">👥</span>
              Manage Users
            </Button>
            <Button 
              className="w-full justify-start"
              onClick={() => onQuickAction('analytics')}
            >
              <span className="mr-2">📊</span>
              View Analytics
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-gray-500">Loading recent activity...</div>
            ) : (
              <>
                {stats.recentCourses.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📚</span>
                    <span>Latest course: {stats.recentCourses[0].title}</span>
                    <span className="ml-auto text-xs">
                      {new Date(stats.recentCourses[0].created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {stats.recentEnrollments.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🎓</span>
                    <span>New enrollment in course</span>
                    <span className="ml-auto text-xs">
                      {new Date(stats.recentEnrollments[0].enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📊</span>
                  <span>Dashboard stats updated</span>
                  <span className="ml-auto text-xs">Just now</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => 
        filterRole === 'admin' ? user.is_admin : !user.is_admin
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUpdate = async (userId: number, updates: Partial<any>) => {
    try {
      await apiService.updateUser(userId, updates);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await apiService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'promote' | 'demote') => {
    const selectedUsers = filteredUsers.filter(user => user.selected);
    if (selectedUsers.length === 0) {
      alert('Please select users to perform bulk action');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const updates: Partial<any> = {};
      switch (action) {
        case 'activate':
          updates.is_active = true;
          break;
        case 'deactivate':
          updates.is_active = false;
          break;
        case 'promote':
          updates.is_admin = true;
          break;
        case 'demote':
          updates.is_admin = false;
          break;
      }

      await Promise.all(selectedUsers.map(user => apiService.updateUser(user.id, updates)));
      fetchUsers();
    } catch (err) {
      alert(`Failed to ${action} users`);
    }
  };

  if (loading) return <Card className="p-6">Loading users...</Card>;
  if (error) return <Card className="p-6 text-red-600">{error}</Card>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <Button 
          variant="outline" 
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center"
        >
          <span className="mr-2">🔄</span>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-gray-500">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {filteredUsers.some(user => user.selected) && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {filteredUsers.filter(user => user.selected).length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                Deactivate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('promote')}>
                Promote to Admin
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('demote')}>
                Demote to User
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="p-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFilteredUsers(prev => prev.map(user => ({ ...user, selected: checked })));
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">ID</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">User</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Language</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Role</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Joined</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={user.selected || false}
                    onChange={(e) => {
                      setFilteredUsers(prev => 
                        prev.map(u => u.id === user.id ? { ...u, selected: e.target.checked } : u)
                      );
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-3 py-2 text-gray-600">{user.id}</td>
                <td className="px-3 py-2">
                  <div>
                    <div className="font-medium text-gray-900">{user.full_name || user.username}</div>
                    {user.full_name && <div className="text-xs text-gray-500">@{user.username}</div>}
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-600">{user.email}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {user.preferred_language || 'Not set'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_admin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-3 py-2">
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleUpdate(user.id, { is_active: !user.is_active })}
                      className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleUpdate(user.id, { is_admin: !user.is_admin })}
                      className={user.is_admin ? 'text-orange-600 hover:text-orange-700' : 'text-purple-600 hover:text-purple-700'}
                    >
                      {user.is_admin ? 'Demote' : 'Promote'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700" 
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </Card>
    </div>
  );
};

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'quizzes'>('overview');
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
  const [quizAnalytics, setQuizAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [userData, courseData, quizData] = await Promise.all([
        apiService.getUserAnalytics(),
        apiService.getCourseAnalytics(),
        apiService.getQuizAnalytics()
      ]);
      setUserAnalytics(userData);
      setCourseAnalytics(courseData);
      setQuizAnalytics(quizData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalyticsContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserAnalyticsTab data={userAnalytics} loading={loading} />;
      case 'courses':
        return <CourseAnalyticsTab data={courseAnalytics} loading={loading} />;
      case 'quizzes':
        return <QuizAnalyticsTab data={quizAnalytics} loading={loading} />;
      default:
        return <OverviewTab userData={userAnalytics} courseData={courseAnalytics} quizData={quizAnalytics} loading={loading} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <Button 
          variant="outline" 
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center"
        >
          <span className="mr-2">🔄</span>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Analytics Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'courses', label: 'Courses', icon: '📚' },
            { id: 'quizzes', label: 'Quizzes', icon: '❓' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {renderAnalyticsContent()}
    </div>
  );
};

const OverviewTab: React.FC<{ 
  userData: UserAnalytics | null; 
  courseData: CourseAnalytics | null; 
  quizData: QuizAnalytics | null;
  loading: boolean;
}> = ({ userData, courseData, quizData, loading }) => {
  if (loading) return <Card className="p-6">Loading analytics...</Card>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
        {userData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userData.active_users.last_7_days}</div>
                <div className="text-sm text-gray-500">Active (7 days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userData.active_users.last_30_days}</div>
                <div className="text-sm text-gray-500">Active (30 days)</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Language Preferences</h4>
              <div className="space-y-2">
                {userData.language_preferences.map((lang, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{lang.language}</span>
                    <span className="font-medium">{lang.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Course Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Course Performance</h3>
        {courseData && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Most Popular Courses</h4>
              <div className="space-y-2">
                {courseData.popular_courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex justify-between text-sm">
                    <span className="truncate">{course.title}</span>
                    <span className="font-medium">{course.enrollment_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Quiz Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Performance</h3>
        {quizData && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{quizData.overall_stats.overall_accuracy}%</div>
              <div className="text-sm text-gray-500">Overall Accuracy</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{quizData.overall_stats.total_responses}</div>
                <div className="text-sm text-gray-500">Total Responses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{quizData.overall_stats.recent_responses_7_days}</div>
                <div className="text-sm text-gray-500">Recent (7 days)</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const UserAnalyticsTab: React.FC<{ data: UserAnalytics | null; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Card className="p-6">Loading user analytics...</Card>;
  if (!data) return <Card className="p-6">No user analytics data available.</Card>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Registration Trend</h3>
        <div className="space-y-2">
          {data.registration_trend.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{item.date}</span>
              <span className="font-medium">{item.count} registrations</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Language Distribution</h3>
        <div className="space-y-2">
          {data.language_preferences.map((lang, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{lang.language}</span>
              <span className="font-medium">{lang.count} users</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const CourseAnalyticsTab: React.FC<{ data: CourseAnalytics | null; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Card className="p-6">Loading course analytics...</Card>;
  if (!data) return <Card className="p-6">No course analytics data available.</Card>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Course Completion Rates</h3>
        <div className="space-y-3">
          {data.completion_rates.map((course) => (
            <div key={course.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{course.title}</span>
                <span className="text-sm text-gray-500">{course.completion_rate}%</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{course.completed_enrollments} completed</span>
                <span>{course.total_enrollments} total enrollments</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Language Distribution</h3>
          <div className="space-y-2">
            {data.language_distribution.map((lang, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{lang.language}</span>
                <span className="font-medium">{lang.count} courses</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Difficulty Distribution</h3>
          <div className="space-y-2">
            {data.difficulty_distribution.map((diff, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{diff.difficulty}</span>
                <span className="font-medium">{diff.count} courses</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const QuizAnalyticsTab: React.FC<{ data: QuizAnalytics | null; loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Card className="p-6">Loading quiz analytics...</Card>;
  if (!data) return <Card className="p-6">No quiz analytics data available.</Card>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Performance</h3>
        <div className="space-y-3">
          {data.quiz_performance.map((quiz) => (
            <div key={quiz.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{quiz.title}</span>
                <span className="text-sm text-gray-500">{quiz.avg_correct_rate}% accuracy</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{quiz.total_responses} total responses</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.overall_stats.total_responses}</div>
            <div className="text-sm text-gray-500">Total Responses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.overall_stats.correct_responses}</div>
            <div className="text-sm text-gray-500">Correct Responses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.overall_stats.overall_accuracy}%</div>
            <div className="text-sm text-gray-500">Overall Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.overall_stats.recent_responses_7_days}</div>
            <div className="text-sm text-gray-500">Recent (7 days)</div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 