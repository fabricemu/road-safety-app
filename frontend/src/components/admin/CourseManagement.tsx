import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import apiService from '../../services/api';
import type { Course, CourseCreate, CourseUpdate, Module, Lesson } from '../../types';

interface CourseWithStats extends Course {
  modules_count: number;
  lessons_count: number;
}

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithStats | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithStats | null>(null);
  const [showContentManager, setShowContentManager] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const fetchedCourses = await apiService.getCourses();
      
      // Calculate stats for each course
      const coursesWithStats: CourseWithStats[] = await Promise.all(
        fetchedCourses.map(async (course) => {
          try {
            const modules = await apiService.getModules(course.id);
            let totalLessons = 0;
            
            for (const module of modules) {
              const lessons = await apiService.getLessonsByModule(module.id);
              totalLessons += lessons.length;
            }
            
            return {
              ...course,
              modules_count: modules.length,
              lessons_count: totalLessons
            };
          } catch (error) {
            console.error(`Error fetching stats for course ${course.id}:`, error);
            return {
              ...course,
              modules_count: 0,
              lessons_count: 0
            };
          }
        })
      );
      
      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData: CourseCreate) => {
    try {
      const newCourse = await apiService.createCourse(courseData);
      await fetchCourses(); // Refresh the list
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course. Please try again.');
    }
  };

  const handleUpdateCourse = async (courseId: number, courseData: CourseUpdate) => {
    try {
      await apiService.updateCourse(courseId, courseData);
      await fetchCourses(); // Refresh the list
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await apiService.deleteCourse(courseId);
        await fetchCourses(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handleManageContent = (course: CourseWithStats) => {
    setSelectedCourse(course);
    setShowContentManager(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <span className="mr-2">➕</span>
          Create Course
        </Button>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{course.description}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {course.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Language:</span>
                <span className="font-medium capitalize">{course.language}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium capitalize">{course.category || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Difficulty:</span>
                <span className="font-medium capitalize">{course.difficulty_level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{course.estimated_duration || 0} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Modules:</span>
                <span className="font-medium">{course.modules_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lessons:</span>
                <span className="font-medium">{course.lessons_count}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => setEditingCourse(course)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => handleManageContent(course)}
              >
                Manage Content
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDeleteCourse(course.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="text-gray-500 mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Create your first course to get started</p>
          <Button onClick={() => setShowCreateForm(true)}>
            Create First Course
          </Button>
        </Card>
      )}

      {/* Create Course Modal */}
      {showCreateForm && (
        <CreateCourseModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCourse}
        />
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSubmit={(data) => handleUpdateCourse(editingCourse.id, data)}
        />
      )}

      {/* Content Manager Modal */}
      {showContentManager && selectedCourse && (
        <ContentManagerModal
          course={selectedCourse}
          onClose={() => {
            setShowContentManager(false);
            setSelectedCourse(null);
          }}
          onRefresh={fetchCourses}
        />
      )}
    </div>
  );
};

interface CreateCourseModalProps {
  onClose: () => void;
  onSubmit: (data: CourseCreate) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CourseCreate>({
    title: '',
    description: '',
    language: 'english',
    category: 'road_safety_basics',
    difficulty_level: 'beginner',
    estimated_duration: 60
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="english">English</option>
                <option value="french">French</option>
                <option value="kinyarwanda">Kinyarwanda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="road_safety_basics">Road Safety Basics</option>
                <option value="provisional_license">Provisional License</option>
                <option value="traffic_signs">Traffic Signs</option>
                <option value="driving_rules">Driving Rules</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                required
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Course
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface EditCourseModalProps {
  course: CourseWithStats;
  onClose: () => void;
  onSubmit: (data: CourseUpdate) => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CourseUpdate>({
    title: course.title,
    description: course.description,
    language: course.language,
    category: course.category,
    difficulty_level: course.difficulty_level,
    estimated_duration: course.estimated_duration,
    is_active: course.is_active
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Course</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="english">English</option>
                <option value="french">French</option>
                <option value="kinyarwanda">Kinyarwanda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="road_safety_basics">Road Safety Basics</option>
                <option value="provisional_license">Provisional License</option>
                <option value="traffic_signs">Traffic Signs</option>
                <option value="driving_rules">Driving Rules</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                required
                value={formData.estimated_duration}
                onChange={(e) => setFormData({...formData, estimated_duration: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Update Course
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Content Manager Modal for managing modules and lessons
interface ContentManagerModalProps {
  course: CourseWithStats;
  onClose: () => void;
  onRefresh: () => void;
}

const ContentManagerModal: React.FC<ContentManagerModalProps> = ({ course, onClose, onRefresh }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const fetchedModules = await apiService.getModules(course.id);
      setModules(fetchedModules);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (moduleData: { title: string; description: string; order_index: number }) => {
    try {
      await apiService.createModule(course.id, moduleData);
      await fetchModules();
      setShowCreateModule(false);
    } catch (error) {
      console.error('Failed to create module:', error);
      alert('Failed to create module. Please try again.');
    }
  };

  const handleUpdateModule = async (moduleId: number, moduleData: { title: string; description: string; order_index: number }) => {
    try {
      await apiService.updateModule(moduleId, moduleData);
      await fetchModules();
      setEditingModule(null);
    } catch (error) {
      console.error('Failed to update module:', error);
      alert('Failed to update module. Please try again.');
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (window.confirm('Are you sure you want to delete this module? This will also delete all lessons in this module.')) {
      try {
        // Note: You'll need to add a deleteModule method to the API service
        // await apiService.deleteModule(moduleId);
        alert('Module deletion not yet implemented');
        await fetchModules();
      } catch (error) {
        console.error('Failed to delete module:', error);
        alert('Failed to delete module. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Manage Content: {course.title}
          </h3>
          <div className="flex space-x-2">
            <Button onClick={() => setShowCreateModule(true)}>
              <span className="mr-2">➕</span>
              Add Module
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading modules...</div>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{module.title}</h4>
                    <p className="text-sm text-gray-600">{module.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Order: {module.order_index}</span>
                      <span>Status: {module.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => setEditingModule(module)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // TODO: Navigate to lesson management for this module
                        alert('Lesson management will be implemented in the next phase');
                      }}
                    >
                      Manage Lessons
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {modules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📚</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h4>
                <p className="text-gray-600 mb-4">Create your first module to get started.</p>
                <Button onClick={() => setShowCreateModule(true)}>
                  <span className="mr-2">➕</span>
                  Create First Module
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create Module Modal */}
        {showCreateModule && (
          <CreateModuleModal
            onClose={() => setShowCreateModule(false)}
            onSubmit={handleCreateModule}
            nextOrderIndex={modules.length + 1}
          />
        )}

        {/* Edit Module Modal */}
        {editingModule && (
          <EditModuleModal
            module={editingModule}
            onClose={() => setEditingModule(null)}
            onSubmit={(data) => handleUpdateModule(editingModule.id, data)}
          />
        )}
      </Card>
    </div>
  );
};

// Create Module Modal
interface CreateModuleModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; order_index: number }) => void;
  nextOrderIndex: number;
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ onClose, onSubmit, nextOrderIndex }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_index: nextOrderIndex
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Module</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction to Road Safety"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of what this module covers..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Order Index</label>
            <input
              type="number"
              required
              min="1"
              value={formData.order_index}
              onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Module
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Edit Module Modal
interface EditModuleModalProps {
  module: Module;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; order_index: number }) => void;
}

const EditModuleModal: React.FC<EditModuleModalProps> = ({ module, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: module.title,
    description: module.description || '',
    order_index: module.order_index
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Module</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Order Index</label>
            <input
              type="number"
              required
              min="1"
              value={formData.order_index}
              onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Update Module
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 