import React, { useState, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import apiService from '../../services/api';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedContent?: string;
  error?: string;
  fileUrl?: string;
}

export const PDFUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCourseCreation, setShowCourseCreation] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf') {
        uploadFile(file);
      } else {
        alert('Please upload only PDF files');
      }
    });
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString();
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setIsUploading(true);

    try {
      // Update progress to 50% (upload phase)
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: 50 }
            : f
        )
      );

      // Upload file to backend
      const response = await apiService.uploadPDF(file);

      // Update status to processing
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'processing', progress: 75 }
            : f
        )
      );

      // Update with extracted content from response
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: 'completed',
                progress: 100,
                extractedContent: response.extracted_content,
                fileUrl: response.file_url,
                id: response.file_id // Use the actual file ID from backend
              }
            : f
        )
      );

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: 'Upload failed. Please try again.' }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const simulateContentExtraction = async (fileName: string): Promise<string> => {
    // Simulate AI content extraction
    const sampleContent = `
# Road Safety Content Extracted from ${fileName}

## Traffic Signs and Signals
- **Stop Sign**: Red octagon with white "STOP" text
- **Yield Sign**: Red and white triangle pointing downward
- **Speed Limit**: White rectangle with black numbers

## Basic Traffic Rules
1. Always drive on the right side of the road
2. Obey all traffic signals and signs
3. Use turn signals when changing lanes
4. Maintain safe following distance
5. Never drive under the influence of alcohol

## Pedestrian Safety
- Cross only at designated crosswalks
- Look both ways before crossing
- Wait for the walk signal at traffic lights
- Make eye contact with drivers

## Emergency Procedures
- Pull over safely when emergency vehicles approach
- Use hazard lights when stopped on the road
- Know how to perform basic vehicle maintenance

This content can be used to create:
- Interactive lessons
- Quiz questions
- Practice scenarios
- Assessment materials
    `;

    return sampleContent.trim();
  };

  const removeFile = async (fileId: string) => {
    try {
      // Delete file from backend
      await apiService.deletePDF(fileId);
      // Remove from local state
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const createCourseFromContent = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file?.extractedContent) {
      // Open course creation modal with pre-filled content
      setShowCourseCreation(true);
      setPdfContent(file.extractedContent);
    }
  };

  const viewFullContent = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file?.extractedContent) {
      // Open content in a new window or modal
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Extracted Content - ${file.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #1f2937; }
                h2 { color: #374151; margin-top: 30px; }
                pre { background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; }
                .file-info { background: #e5e7eb; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="file-info">
                <strong>File:</strong> ${file.name}<br>
                <strong>Size:</strong> ${formatFileSize(file.size)}<br>
                <strong>Extracted:</strong> ${new Date().toLocaleString()}
              </div>
              <pre>${file.extractedContent}</pre>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearAllFiles = () => {
    if (window.confirm('Are you sure you want to remove all uploaded files?')) {
      setUploadedFiles([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Upload & Content Extraction</h2>
          <p className="text-gray-600">
            Upload PDF documents to automatically extract content for creating courses, lessons, and quiz questions.
          </p>
        </div>
        {uploadedFiles.length > 0 && (
          <Button 
            variant="outline" 
            onClick={clearAllFiles}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <Card className="p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-6xl">📄</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Drop PDF files here or click to browse
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload road safety documents, manuals, or training materials
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{file.name}</h4>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{file.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        file.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                        file.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        file.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {file.status === 'uploading' && '⏳ Uploading...'}
                        {file.status === 'processing' && '🔄 Processing...'}
                        {file.status === 'completed' && '✅ Completed'}
                        {file.status === 'error' && '❌ Error'}
                      </span>
                    </div>

                    {/* Extracted Content */}
                    {file.status === 'completed' && file.extractedContent && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Extracted Content Preview:</h5>
                        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto">
                          {file.extractedContent.substring(0, 200)}...
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => createCourseFromContent(file.id)}
                          >
                            Create Course from Content
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewFullContent(file.id)}
                          >
                            View Full Content
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <div className="mt-3 text-sm text-red-600">
                        Error: {file.error}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(file.id)}
                    className="ml-4"
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">📤</div>
            <h4 className="font-medium text-gray-900">1. Upload PDF</h4>
            <p className="text-sm text-gray-500 mt-1">
              Upload road safety documents, manuals, or training materials
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h4 className="font-medium text-gray-900">2. Extract Content</h4>
            <p className="text-sm text-gray-500 mt-1">
              AI automatically extracts text, images, and structured content
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="font-medium text-gray-900">3. Create Courses</h4>
            <p className="text-sm text-gray-500 mt-1">
              Use extracted content to create lessons, quizzes, and courses
            </p>
          </div>
        </div>
      </Card>

      {/* Course Creation Modal */}
      {showCourseCreation && (
        <CourseCreationModal
          pdfContent={pdfContent}
          onClose={() => setShowCourseCreation(false)}
          onSuccess={() => {
            setShowCourseCreation(false);
            setPdfContent('');
          }}
        />
      )}
    </div>
  );
};

// Course Creation Modal Component
interface CourseCreationModalProps {
  pdfContent: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CourseCreationModal: React.FC<CourseCreationModalProps> = ({ pdfContent, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'english',
    category: 'road_safety_basics',
    difficulty_level: 'beginner',
    estimated_duration: 30
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create course with PDF content as description
      const courseData = {
        ...formData,
        description: formData.description || `Content extracted from PDF:\n\n${pdfContent.substring(0, 500)}...`
      };
      
      await apiService.createCourse(courseData);
      alert('Course created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create Course from PDF Content</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Course description (PDF content will be included if left empty)..."
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
              <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
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

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">PDF Content Preview:</h4>
            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
              {pdfContent.substring(0, 300)}...
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 