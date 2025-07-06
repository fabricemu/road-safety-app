import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import type { Course, CourseEnrollment, CourseProgress } from '../../types';

interface EnrolledCourse extends Course {
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  certificate_issued: boolean;
}

interface ProgressStats {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  certificatesEarned: number;
}

export const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    averageScore: 0,
    certificatesEarned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearnerData();
  }, []);

  const fetchLearnerData = async () => {
    try {
      setLoading(true);
      
      // Fetch user enrollments
      const enrollments = await apiService.getUserEnrollments();
      
      // Fetch all available courses
      const allCourses = await apiService.getCourses();
      
      // Get detailed progress for each enrolled course
      const enrolledCoursesWithProgress: EnrolledCourse[] = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            const courseProgress = await apiService.getCourseProgress(enrollment.course_id);
            const course = allCourses.find(c => c.id === enrollment.course_id);
            
            if (course) {
              return {
                ...course,
                progress_percentage: courseProgress.progress_percentage,
                enrolled_at: enrollment.enrolled_at,
                completed_at: enrollment.completed_at,
                certificate_issued: enrollment.certificate_issued
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching progress for course ${enrollment.course_id}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and set enrolled courses
      const validEnrolledCourses = enrolledCoursesWithProgress.filter(course => course !== null) as EnrolledCourse[];
      setEnrolledCourses(validEnrolledCourses);

      // Set available courses (not enrolled)
      const enrolledCourseIds = validEnrolledCourses.map(c => c.id);
      const availableCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id));
      setAvailableCourses(availableCourses);

      // Calculate stats
      const totalLessons = validEnrolledCourses.reduce((total, course) => {
        // This would need to be calculated from actual modules/lessons
        return total + (course.estimated_duration || 0);
      }, 0);

      const completedLessons = validEnrolledCourses.reduce((total, course) => {
        return total + Math.floor((course.progress_percentage / 100) * (course.estimated_duration || 0));
      }, 0);

      const completedCourses = validEnrolledCourses.filter(course => course.progress_percentage === 100).length;
      const certificatesEarned = validEnrolledCourses.filter(course => course.certificate_issued).length;

      setStats({
        totalCourses: validEnrolledCourses.length,
        completedCourses,
        totalLessons,
        completedLessons,
        averageScore: 85, // TODO: Calculate from actual quiz scores
        certificatesEarned
      });

    } catch (error) {
      console.error('Failed to fetch learner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueCourse = (courseId: number) => {
    // TODO: Navigate to course detail page
    console.log('Continue course:', courseId);
    alert('Course navigation will be implemented in the next phase.');
  };

  const handleEnrollCourse = async (courseId: number) => {
    try {
      await apiService.enrollInCourse(courseId);
      
      // Refresh the data
      await fetchLearnerData();
      
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      alert('Failed to enroll in course. Please try again.');
    }
  };

  const handleViewCertificate = (courseId: number) => {
    // TODO: Navigate to certificate view
    console.log('View certificate for course:', courseId);
    alert('Certificate viewing will be implemented in the next phase.');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome back, {user?.full_name || user?.username}!
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Progress Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">📚</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Enrolled Courses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalCourses}
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Courses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.completedCourses}
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Score
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.averageScore}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">🏆</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Certificates
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.certificatesEarned}
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>
            </div>

            {/* Enrolled Courses */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {enrolledCourses.map((course) => (
                    <Card key={course.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.progress_percentage === 100 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {course.progress_percentage}% Complete
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Difficulty:</span>
                          <span className="font-medium capitalize">{course.difficulty_level}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{course.estimated_duration || 0} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Enrolled:</span>
                          <span className="font-medium">{new Date(course.enrolled_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Language:</span>
                          <span className="font-medium capitalize">{course.language}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleContinueCourse(course.id)}
                          className="flex-1"
                        >
                          {course.progress_percentage === 100 ? 'Review Course' : 'Continue Learning'}
                        </Button>
                        {course.certificate_issued && (
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewCertificate(course.id)}
                          >
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <div className="text-gray-500 mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                  <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
                  <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                    Browse Available Courses
                  </Button>
                </Card>
              )}
            </div>

            {/* Available Courses */}
            {availableCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courses</h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {availableCourses.map((course) => (
                    <Card key={course.id} className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Difficulty:</span>
                          <span className="font-medium capitalize">{course.difficulty_level}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{course.estimated_duration || 0} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Language:</span>
                          <span className="font-medium capitalize">{course.language}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium capitalize">{course.category || 'N/A'}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleEnrollCourse(course.id)}
                        className="w-full"
                      >
                        Enroll Now
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  {enrolledCourses.length > 0 ? (
                    <>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-3">📖</span>
                        <span>Enrolled in "{enrolledCourses[0].title}" course</span>
                        <span className="ml-auto text-xs">
                          {new Date(enrolledCourses[0].enrolled_at).toLocaleDateString()}
                        </span>
                      </div>
                      {enrolledCourses.length > 1 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-3">📚</span>
                          <span>Enrolled in "{enrolledCourses[1].title}" course</span>
                          <span className="ml-auto text-xs">
                            {new Date(enrolledCourses[1].enrolled_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No recent activity. Start learning to see your progress!
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 