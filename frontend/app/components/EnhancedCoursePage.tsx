import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Clock, User, MapPin, FileText, Calendar, GraduationCap, BookMarked, Tag, Plus, X, Upload, Download, File, StickyNote, Edit2, Check, Trash2, Save, Folder, Image as ImageIcon, Link as LinkIcon, ClipboardList, Circle, CheckCircle2 } from 'lucide-react';
import { getAllCourses } from '~/services/courseService';
import {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  type Assignment,
  type AssignmentStatus,
} from '~/services/assignmentService';
import { notifyAssignmentsChanged, subscribeAssignmentsChanged } from '~/utils/assignmentSync';
import {
  getNotesByCourse,
  createNote,
  updateNote,
  deleteNote as deleteCourseNote,
  type CourseNote,
} from '~/services/noteService';
import {
  getFilesByCourse,
  createFile,
  deleteFile as deleteCourseFile,
  type CourseFileItem,
  type CourseFileType,
  type CourseFileCategory,
} from '~/services/fileService';
import type { Course } from '~/types/course';
// ...existing code...
import canvasLogo from '~/assets/22343b487a124e74995e468c0388ab2b6ab33dd7.png';
import coursicleLogo from '~/assets/8a64e37773e95c0484d47cd65db7a39fb7ef7f7d.png';

interface Note {
  id: number;
  title: string;
  content: string;
  date: Date;
  lastEdited: Date;
  tags: string[];
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

  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'notes' | 'files'>('overview');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedInstructor, setEditedInstructor] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'overview' || tabParam === 'assignments' || tabParam === 'notes' || tabParam === 'files') {
      setActiveTab(tabParam);
    }
  }, [location.search]);

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentPoints, setAssignmentPoints] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');

  const loadAssignments = useCallback(async () => {
    if (!courseId) {
      setAssignments([]);
      setAssignmentsLoading(false);
      return;
    }

    try {
      setAssignmentsLoading(true);
      const assignmentData = await getAssignmentsByCourse(courseId);
      setAssignments(assignmentData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    const unsubscribe = subscribeAssignmentsChanged((payload) => {
      if (!courseId || !payload.courseId || payload.courseId === courseId) {
        loadAssignments();
      }
    });

    return unsubscribe;
  }, [courseId, loadAssignments]);

  // Files state
  const [files, setFiles] = useState<CourseFileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileFilter, setFileFilter] = useState<'all' | CourseFileCategory>('all');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<CourseFileType>('pdf');
  const [fileCategory, setFileCategory] = useState<CourseFileCategory>('other');
  const [fileSize, setFileSize] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    async function loadNotes() {
      if (!courseId) {
        setNotes([]);
        setNotesLoading(false);
        return;
      }

      try {
        setNotesLoading(true);
        const noteData = await getNotesByCourse(courseId);
        const mappedNotes: Note[] = noteData.map((note: CourseNote) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          date: note.createdAt,
          lastEdited: note.updatedAt,
          tags: [],
        }));
        setNotes(mappedNotes);
      } catch (error) {
        console.error('Failed to load notes:', error);
        setNotes([]);
      } finally {
        setNotesLoading(false);
      }
    }

    loadNotes();
  }, [courseId]);

  useEffect(() => {
    async function loadFiles() {
      if (!courseId) {
        setFiles([]);
        setFilesLoading(false);
        return;
      }

      try {
        setFilesLoading(true);
        const fileData = await getFilesByCourse(courseId);
        setFiles(fileData);
      } catch (error) {
        console.error('Failed to load files:', error);
        setFiles([]);
      } finally {
        setFilesLoading(false);
      }
    }

    loadFiles();
  }, [courseId]);

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

  const resetNoteForm = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    if (!courseId) {
      alert('Course not found. Unable to save note.');
      return;
    }

    try {
      if (editingNote) {
        const updated = await updateNote(editingNote.id, {
          title: noteTitle,
          content: noteContent,
        });
        setNotes(prev =>
          prev.map(n =>
            n.id === editingNote.id
              ? {
                  ...n,
                  title: updated.title,
                  content: updated.content,
                  lastEdited: updated.updatedAt,
                }
              : n
          )
        );
      } else {
        const created = await createNote(courseId, {
          title: noteTitle,
          content: noteContent,
        });

        const newNote: Note = {
          id: created.id,
          title: created.title,
          content: created.content,
          date: created.createdAt,
          lastEdited: created.updatedAt,
          tags: [],
        };
        setNotes(prev => [newNote, ...prev]);
      }

      setShowNoteModal(false);
      resetNoteForm();
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteCourseNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const resetFileForm = () => {
    setFileName('');
    setFileType('pdf');
    setFileCategory('other');
    setFileSize('');
    setFileUrl('');
  };

  const handleSaveFile = async () => {
    if (!fileName.trim()) {
      alert('Please provide a file name.');
      return;
    }

    if (!courseId) {
      alert('Course not found. Unable to save file.');
      return;
    }

    try {
      const createdFile = await createFile(courseId, {
        name: fileName.trim(),
        fileType,
        category: fileCategory,
        fileSize: fileSize.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
      });
      setFiles(prev => [createdFile, ...prev]);
      setShowFileModal(false);
      resetFileForm();
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file. Please try again.');
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteCourseFile(id);
        setFiles(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  const filteredFiles = fileFilter === 'all' 
    ? files 
    : files.filter(f => f.category === fileFilter);

  const sortedAssignments = [...assignments].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const filteredAssignments = assignmentFilter === 'all'
    ? sortedAssignments
    : sortedAssignments.filter(assignment => assignment.status === assignmentFilter);

  const upcomingAssignments = sortedAssignments.filter(assignment => assignment.status !== 'completed');
  const completedAssignments = sortedAssignments.filter(assignment => assignment.status === 'completed');

  const formatForDateTimeInput = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const resetAssignmentForm = () => {
    setAssignmentTitle('');
    setAssignmentDueDate('');
    setAssignmentPoints('');
    setAssignmentDescription('');
  };

  const handleSaveAssignment = async () => {
    if (!assignmentTitle.trim() || !assignmentDueDate) {
      alert('Please provide an assignment title and due date');
      return;
    }

    if (!courseId) {
      alert('Course not found. Unable to save assignment.');
      return;
    }

    try {
      const createdAssignment = await createAssignment(courseId, {
        title: assignmentTitle.trim(),
        dueDate: assignmentDueDate,
        points: assignmentPoints.trim() ? Number(assignmentPoints) : undefined,
        description: assignmentDescription.trim() || undefined,
      });
      setAssignments(prev => [...prev, createdAssignment]);
      notifyAssignmentsChanged({
        assignmentId: createdAssignment.id,
        courseId,
      });
      setShowAssignmentModal(false);
      resetAssignmentForm();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('Failed to create assignment. Please try again.');
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(id);
        setAssignments(prev => prev.filter(assignment => assignment.id !== id));
        notifyAssignmentsChanged({
          assignmentId: id,
          courseId,
        });
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        alert('Failed to delete assignment. Please try again.');
      }
    }
  };

  const handleCycleAssignmentStatus = async (assignment: Assignment) => {
    let nextStatus: AssignmentStatus = 'todo';
    if (assignment.status === 'todo') {
      nextStatus = 'in-progress';
    } else if (assignment.status === 'in-progress') {
      nextStatus = 'completed';
    }

    try {
      const updatedItem = await updateAssignment(assignment.id, { status: nextStatus });
      setAssignments(prev => prev.map(item => (item.id === assignment.id ? updatedItem : item)));
      notifyAssignmentsChanged({
        assignmentId: assignment.id,
        courseId,
      });
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      alert('Failed to update assignment status. Please try again.');
    }
  };

  const getAssignmentStatusClasses = (status: Assignment['status']) => {
    if (status === 'completed') {
      return 'bg-green-50 text-green-700';
    }
    if (status === 'in-progress') {
      return 'bg-amber-50 text-amber-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const getFileIcon = (type: CourseFileType) => {
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
                <div className="text-2xl font-semibold text-gray-900">{upcomingAssignments.length}</div>
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
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'assignments' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ClipboardList className="w-4 h-4" />
              Assignments ({upcomingAssignments.length})
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
                  {upcomingAssignments.slice(0, 4).map(assignment => (
                    <div key={assignment.id} className="p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm text-gray-900">{assignment.title}</p>
                        <span className={`px-2 py-0.5 text-xs rounded ${getAssignmentStatusClasses(assignment.status)}`}>
                          {assignment.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Due {assignment.dueDate.toLocaleString()}</p>
                    </div>
                  ))}
                  {upcomingAssignments.length === 0 && (
                    <p className="text-sm text-gray-500 col-span-2">No upcoming assignments</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Assignments</h2>
                <div className="flex gap-3">
                  <select
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value as typeof assignmentFilter)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => {
                      setAssignmentTitle('');
                      setAssignmentDueDate(formatForDateTimeInput(new Date()));
                      setAssignmentPoints('');
                      setAssignmentDescription('');
                      setShowAssignmentModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Assignment
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-semibold text-gray-900">{upcomingAssignments.length}</p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedAssignments.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredAssignments.map(assignment => (
                  <div key={assignment.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleCycleAssignmentStatus(assignment)}
                          className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                          aria-label={`Change status for ${assignment.title}`}
                        >
                          {assignment.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-medium ${assignment.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {assignment.title}
                            </p>
                            <span className={`px-2 py-0.5 text-xs rounded ${getAssignmentStatusClasses(assignment.status)}`}>
                              {assignment.status.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Due {assignment.dueDate.toLocaleString()}</p>
                          {typeof assignment.points === 'number' && (
                            <p className="text-xs text-gray-500 mt-1">{assignment.points} points</p>
                          )}
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label={`Delete ${assignment.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {assignmentsLoading && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Loading assignments...</p>
                  </div>
                )}

                {!assignmentsLoading && filteredAssignments.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No assignments found for this filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Course Notes</h2>
                <button
                  onClick={() => {
                    resetNoteForm();
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

                {!notesLoading && notes.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No notes yet. Create your first note to get started!</p>
                  </div>
                )}

                {notesLoading && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <p>Loading notes...</p>
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
                    onClick={() => {
                      resetFileForm();
                      setShowFileModal(true);
                    }}
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

                {!filesLoading && filteredFiles.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Folder className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No files found in this category.</p>
                  </div>
                )}

                {filesLoading && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Loading files...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">New Assignment</h2>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    resetAssignmentForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="assignment-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="assignment-title"
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignment title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignment-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Due date
                  </label>
                  <input
                    id="assignment-due-date"
                    type="datetime-local"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="assignment-points" className="block text-sm font-medium text-gray-700 mb-1">
                    Points (optional)
                  </label>
                  <input
                    id="assignment-points"
                    type="number"
                    min="0"
                    value={assignmentPoints}
                    onChange={(e) => setAssignmentPoints(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="assignment-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="assignment-description"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Add assignment details"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  resetAssignmentForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

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
                    resetNoteForm();
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
                  resetNoteForm();
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
                  onClick={() => {
                    setShowFileModal(false);
                    resetFileForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="file-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="file-name"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Week 3 Slides.pdf"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="file-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="file-type"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as CourseFileType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="link">Link</option>
                    <option value="folder">Folder</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="file-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="file-category"
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value as CourseFileCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="syllabus">Syllabus</option>
                    <option value="lecture">Lecture</option>
                    <option value="assignment">Assignment</option>
                    <option value="resource">Resource</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="file-size" className="block text-sm font-medium text-gray-700 mb-1">
                    Size (optional)
                  </label>
                  <input
                    id="file-size"
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 245 KB"
                  />
                </div>

                <div>
                  <label htmlFor="file-url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL (optional)
                  </label>
                  <input
                    id="file-url"
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFileModal(false);
                  resetFileForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFile}
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
