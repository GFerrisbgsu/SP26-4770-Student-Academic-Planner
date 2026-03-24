import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Clock, User, MapPin, FileText, Calendar, GraduationCap, BookMarked, Tag, Plus, X, Upload, Download, File, StickyNote, Edit2, Check, Trash2, Save, Folder, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { getAllCourses } from '~/services/courseService';
import type { Course } from '~/types/course';
// ...existing code...
import canvasLogo from '~/assets/22343b487a124e74995e468c0388ab2b6ab33dd7.png';
import coursicleLogo from '~/assets/8a64e37773e95c0484d47cd65db7a39fb7ef7f7d.png';

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  lastEdited: Date;
  tags: string[];
}

interface CourseFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'link' | 'folder';
  size?: string;
  uploadDate: Date;
  url?: string;
  category: 'syllabus' | 'lecture' | 'assignment' | 'resource' | 'other';
}

interface CoursePageProps {
  courseColors: Record<string, string>;
}

export function EnhancedCoursePage({ courseColors }: CoursePageProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const fromCatalog = location.search.includes('from=catalog');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'files'>('overview');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedInstructor, setEditedInstructor] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        const courses = await getAllCourses();
        setAllCourses(courses);
        const currentCourse = courses.find(c => c.id === courseId);
        setCourse(currentCourse || null);
        if (currentCourse) {
          setEditedInstructor(currentCourse.instructor || '');
          setEditedLocation('');
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [courseId]);
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Lecture 1: Introduction',
      content: 'Key concepts:\n- Programming fundamentals\n- Variables and data types\n- Control structures\n\nImportant: Assignment due next week on Chapter 1',
      date: new Date('2026-01-15'),
      lastEdited: new Date('2026-01-16'),
      tags: ['lecture', 'intro']
    },
    {
      id: '2',
      title: 'Study Notes - Midterm Prep',
      content: 'Topics to review:\n1. Arrays and loops\n2. Functions\n3. Object-oriented basics\n\nPractice problems: 5.1-5.5',
      date: new Date('2026-01-20'),
      lastEdited: new Date('2026-01-22'),
      tags: ['exam', 'study']
    }
  ]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Files state
  const [files, setFiles] = useState<CourseFile[]>([
    {
      id: '1',
      name: 'Course Syllabus.pdf',
      type: 'pdf',
      size: '245 KB',
      uploadDate: new Date('2026-01-10'),
      category: 'syllabus'
    },
    {
      id: '2',
      name: 'Lecture Slides',
      type: 'folder',
      uploadDate: new Date('2026-01-15'),
      category: 'lecture'
    },
    {
      id: '3',
      name: 'Week 1 Assignment.pdf',
      type: 'pdf',
      size: '120 KB',
      uploadDate: new Date('2026-01-17'),
      category: 'assignment'
    },
    {
      id: '4',
      name: 'Textbook Resources',
      type: 'link',
      uploadDate: new Date('2026-01-10'),
      url: 'https://example.com/textbook',
      category: 'resource'
    },
    {
      id: '5',
      name: 'Class Diagram.png',
      type: 'image',
      size: '890 KB',
      uploadDate: new Date('2026-01-20'),
      category: 'lecture'
    }
  ]);
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileFilter, setFileFilter] = useState<'all' | 'syllabus' | 'lecture' | 'assignment' | 'resource' | 'other'>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Course not found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to calendar
          </Link>
        </div>
      </div>
    );
  }

  // Prerequisites come from the course's prerequisiteText field (from database)
  const prerequisiteText = course.prerequisiteText || 'None';

  // Use custom color if available
  const courseColor = courseColors[course.id] || course.color;

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    if (editingNote) {
      setNotes(prev => prev.map(n => 
        n.id === editingNote.id 
          ? { ...n, title: noteTitle, content: noteContent, lastEdited: new Date() }
          : n
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteTitle,
        content: noteContent,
        date: new Date(),
        lastEdited: new Date(),
        tags: []
      };
      setNotes(prev => [newNote, ...prev]);
    }

    setShowNoteModal(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNoteModal(true);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleDeleteFile = (id: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const filteredFiles = fileFilter === 'all' 
    ? files 
    : files.filter(f => f.category === fileFilter);

  const getFileIcon = (type: CourseFile['type']) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <File className="w-5 h-5 text-red-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-600" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-green-600" />;
      case 'folder':
        return <Folder className="w-5 h-5 text-yellow-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation Bar */}
      {/* Side Navigation Bar handled by root layout */}
      
      <div className="max-w-6xl mx-auto p-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className={`${courseColor} h-2`}></div>
          <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className={`${courseColor} p-3 rounded-lg`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">{course.code}</div>
                <h1 className="text-3xl font-semibold mb-2">{course.name}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>
                {isEditingDetails ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Instructor</label>
                    <input
                      type="text"
                      value={editedInstructor}
                      onChange={(e) => setEditedInstructor(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      value={editedLocation}
                      onChange={(e) => setEditedLocation(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingDetails(false)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Done
                    </button>
                    <button
                      onClick={() => {
                        setEditedInstructor(course?.instructor || '');
                        setEditedLocation('');
                        setIsEditingDetails(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {editedInstructor || course.instructor}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {course.schedule}
                  </div>
                  {editedLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {editedLocation}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {course.credits} Credits
                  </div>
                </div>
              )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  aria-label="Edit instructor and location"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {course.enrolled && (
                  <a
                    href="https://www.instructure.com/canvas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="View on Canvas"
                  >
                    <img src={canvasLogo} alt="Canvas" className="w-6 h-6" />
                  </a>
                )}
                <a
                  href="https://www.coursicle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  aria-label="View on Coursicle"
                >
                  <img src={coursicleLogo} alt="Coursicle" className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{notes.length}</div>
                <div className="text-sm text-gray-600">Notes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 border-b-0">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <BookOpen className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notes' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <StickyNote className="w-4 h-4" />
              Notes ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'files' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Folder className="w-4 h-4" />
              Files ({files.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'overview' && (
            <div>
              {/* Course Information */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Course Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookMarked className="w-4 h-4 text-gray-600" />
                      <h3 className="text-sm font-medium text-gray-700">Prerequisites</h3>
                    </div>
                    <p className="text-sm text-gray-600 pl-6">{prerequisiteText}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-gray-600" />
                      <h3 className="text-sm font-medium text-gray-700">Credits</h3>
                    </div>
                    <p className="text-sm text-gray-600 pl-6">{course.credits || '--'}</p>

                    <div className="flex items-center gap-2 mb-3 mt-4">
                      <Tag className="w-4 h-4 text-gray-600" />
                      <h3 className="text-sm font-medium text-gray-700">Subject</h3>
                    </div>
                    <p className="text-sm text-gray-600 pl-6">{course.subject || 'General'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Semester Availability</h3>
                    <div className="flex flex-wrap gap-2">
                      {(course.semesters || []).map(semester => (
                        <span 
                          key={semester}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium"
                        >
                          {semester}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Course History</h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(course.history || []).map((semester, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{semester}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Assignments */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold">Upcoming Assignments</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-sm text-gray-500 col-span-2">No upcoming assignments</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Course Notes</h2>
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setNoteTitle('');
                    setNoteContent('');
                    setShowNoteModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Note
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map(note => (
                  <div key={note.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{note.title}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 whitespace-pre-line line-clamp-4">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last edited: {note.lastEdited.toLocaleDateString()}</span>
                      {note.tags.length > 0 && (
                        <div className="flex gap-1">
                          {note.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {notes.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No notes yet. Create your first note to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Course Files</h2>
                <div className="flex gap-3">
                  <select
                    value={fileFilter}
                    onChange={(e) => setFileFilter(e.target.value as typeof fileFilter)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Files</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="lecture">Lectures</option>
                    <option value="assignment">Assignments</option>
                    <option value="resource">Resources</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={() => setShowFileModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {filteredFiles.map(file => (
                  <div key={file.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {file.size && `${file.size} • `}
                          Uploaded {file.uploadDate.toLocaleDateString()}
                          {file.type === 'link' && file.url && (
                            <> • <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{file.url}</a></>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {file.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredFiles.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Folder className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No files found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h2>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setEditingNote(null);
                    setNoteTitle('');
                    setNoteContent('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="note-title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter note title..."
                />
              </div>

              <div>
                <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px] font-mono text-sm"
                  placeholder="Write your notes here..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setEditingNote(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Upload File</h2>
                <button
                  onClick={() => setShowFileModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, DOC, PNG, JPG up to 10MB</p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Syllabus</option>
                  <option>Lecture</option>
                  <option>Assignment</option>
                  <option>Resource</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowFileModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('File upload functionality would be implemented here');
                  setShowFileModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
