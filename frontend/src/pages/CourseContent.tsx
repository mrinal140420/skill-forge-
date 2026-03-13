import { FC, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Play, FileText, Image as ImageIcon, Code, Link as LinkIcon, Loader2, Github, Linkedin } from 'lucide-react';
import apiClient from '@/api/apiClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourse, useEnrollCourse, useEnrollments, Enrollment } from '@/hooks/useApi';
import { getProfileInitials, normalizeExternalUrl } from '@/lib/instructorProfile';
import { useAuthStore } from '@/stores/authStore';

interface Topic {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  durationMinutes: number;
  resources: Resource[];
}

interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  contentUrl: string;
  orderIndex: number;
  durationMinutes: number;
  fileSizeBytes?: number;
  isVisible: boolean;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'VIDEO':
      return <Play className="h-4 w-4 text-red-600" />;
    case 'NOTES':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'IMAGE':
      return <ImageIcon className="h-4 w-4 text-green-600" />;
    case 'PDF':
      return <FileText className="h-4 w-4 text-orange-600" />;
    case 'CODE_SNIPPET':
      return <Code className="h-4 w-4 text-purple-600" />;
    case 'ARTICLE':
      return <FileText className="h-4 w-4 text-indigo-600" />;
    case 'LINK':
      return <LinkIcon className="h-4 w-4 text-cyan-600" />;
    default:
      return <FileText className="h-4 w-4 text-slate-600" />;
  }
};

export const CourseContent: FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course } = useCourse(courseId);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { mutate: enrollCourse, isPending: enrolling } = useEnrollCourse();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const instructorName = useMemo(() => course?.instructor || 'SkillForge Faculty', [course?.instructor]);
  const linkedinUrl = normalizeExternalUrl(course?.instructorLinkedin);
  const githubUrl = normalizeExternalUrl(course?.instructorGithub);
  const existingEnrollment = useMemo(() => {
    if (!courseId) return null;
    return (enrollments as Enrollment[]).find((entry) => String(entry.courseId) === String(courseId));
  }, [courseId, enrollments]);
  const isStudent = user?.role === 'student';
  const canAccessContent = !isStudent || !!existingEnrollment;

  useEffect(() => {
    if (!courseId) {
      return;
    }
    if (isStudent && !existingEnrollment) {
      setLoading(false);
      setTopics([]);
      return;
    }
    loadTopics();
  }, [courseId, existingEnrollment, isStudent]);

  const handleEnrollNow = () => {
    if (!courseId) return;
    setEnrollError(null);
    enrollCourse(String(courseId), {
      onSuccess: () => {
        navigate(`/course-content/${courseId}`);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.error || error?.response?.data?.message || 'Enrollment failed';
        setEnrollError(message);
      },
    });
  };

  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/content/courses/${courseId}/topics`);
      setTopics(res.data.topics || []);
      // Auto-expand first topic
      if (res.data.topics?.length > 0) {
        setExpandedTopics(new Set([res.data.topics[0].id]));
      }
    } catch (err: any) {
      console.error('Failed to load topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleLesson = (lessonId: number) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  if (loading || (isStudent && enrollmentsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isStudent && !canAccessContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Enrollment Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                You need to enroll in this course before accessing course content.
              </p>
              {enrollError && <p className="text-sm text-red-600">{enrollError}</p>}
              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleEnrollNow} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
                <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
                  View Course Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
            Course Curriculum
          </h1>
          <p className="text-slate-600 text-lg">Study materials organized by topics and lessons</p>
          <p className="text-sm text-slate-700">Course ID: <span className="font-semibold">{courseId}</span></p>
        </div>

        {course && (
          <Card className="mb-8 border-0 border-l-4 border-l-blue-500 bg-white shadow-lg">
            <CardHeader className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-transparent">
              <CardTitle className="text-2xl text-slate-900">Instructor Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                {course.instructorAvatar ? (
                  <img src={course.instructorAvatar} alt={instructorName} className="h-24 w-24 rounded-2xl border border-slate-200 object-cover shadow-sm" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-sm">
                    {getProfileInitials(instructorName)}
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{instructorName}</h2>
                    <p className="text-sm text-slate-600">Assigned instructor for this course</p>
                  </div>
                  {course.instructorBio && <p className="text-sm leading-6 text-slate-700">{course.instructorBio}</p>}
                  {(linkedinUrl || githubUrl) && (
                    <div className="flex flex-wrap gap-3">
                      {linkedinUrl && (
                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {topics.length === 0 ? (
          <Card className="border-0 shadow-lg text-center py-16">
            <p className="text-slate-600 text-lg">No course content available yet for this course ID</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topics Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg bg-white sticky top-8">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b border-purple-200">
                  <CardTitle className="text-lg">Topics</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {topics.map((topic) => (
                      <div key={topic.id}>
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="w-full flex items-center gap-2 p-3 hover:bg-purple-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                        >
                          {expandedTopics.has(topic.id) ? (
                            <ChevronDown className="h-4 w-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{topic.title}</p>
                            <p className="text-xs text-slate-500">{topic.lessons.length} lessons</p>
                          </div>
                        </button>

                        {expandedTopics.has(topic.id) && (
                          <div className="bg-slate-50 space-y-1">
                            {topic.lessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => toggleLesson(lesson.id)}
                                className="w-full flex items-center gap-2 p-3 pl-8 hover:bg-purple-100 transition-colors text-left border-b border-slate-200 text-sm last:border-b-0"
                              >
                                {expandedLessons.has(lesson.id) ? (
                                  <ChevronDown className="h-3 w-3 text-slate-500" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-slate-500" />
                                )}
                                <span className="text-slate-700 truncate">{lesson.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {topics.map((topic) => (
                <div key={topic.id}>
                  {expandedTopics.has(topic.id) && (
                    <div className="space-y-4">
                      {/* Topic Card */}
                      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-purple-50 border-l-4 border-l-purple-500">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b border-purple-200">
                          <CardTitle className="text-2xl bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                            {topic.title}
                          </CardTitle>
                          {topic.description && (
                            <p className="text-slate-600 mt-2 text-base">{topic.description}</p>
                          )}
                        </CardHeader>
                      </Card>

                      {/* Lessons */}
                      {topic.lessons.map((lesson) => (
                        <Card key={lesson.id} className="border-0 shadow-md bg-white">
                          <CardHeader
                            className="pb-3 cursor-pointer hover:bg-slate-50 transition-all"
                            onClick={() => toggleLesson(lesson.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {expandedLessons.has(lesson.id) ? (
                                  <ChevronDown className="h-5 w-5 text-slate-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-slate-600" />
                                )}
                                <div>
                                  <CardTitle className="text-lg text-slate-900">{lesson.title}</CardTitle>
                                  {lesson.description && (
                                    <p className="text-sm text-slate-600 mt-1">{lesson.description}</p>
                                  )}
                                  <p className="text-xs text-slate-500 mt-2">⏱️ {lesson.durationMinutes} minutes • {lesson.resources.length} resources</p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          {expandedLessons.has(lesson.id) && (
                            <CardContent className="pt-0 space-y-3">
                              {lesson.resources.length === 0 ? (
                                <p className="text-center py-4 text-slate-600">No resources available for this lesson</p>
                              ) : (
                                <div className="space-y-2">
                                  {lesson.resources.map((resource) => (
                                    <button
                                      key={resource.id}
                                      onClick={() => setSelectedResource(resource)}
                                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                        selectedResource?.id === resource.id
                                          ? 'border-purple-500 bg-purple-50'
                                          : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {getResourceIcon(resource.type)}
                                        <div className="flex-1">
                                          <p className="font-medium text-slate-900">{resource.title}</p>
                                          {resource.description && (
                                            <p className="text-xs text-slate-600">{resource.description}</p>
                                          )}
                                          <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                              {resource.type}
                                            </span>
                                            {resource.durationMinutes > 0 && (
                                              <span className="text-xs text-slate-600">⏱️ {resource.durationMinutes}m</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource Viewer Modal */}
        {selectedResource && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="border-0 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getResourceIcon(selectedResource.type)}
                    <div>
                      <CardTitle className="text-xl text-white">{selectedResource.title}</CardTitle>
                      <p className="text-purple-100 text-sm">{selectedResource.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="text-white hover:bg-purple-700 p-2 rounded"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {selectedResource.description && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-600">{selectedResource.description}</p>
                  </div>
                )}

                {/* YouTube Video Embed */}
                {selectedResource.type === 'VIDEO' && (
                  selectedResource.contentUrl.includes('youtube') || selectedResource.contentUrl.includes('youtu.be')
                ) ? (
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={getYouTubeEmbedUrl(selectedResource.contentUrl)}
                      title={selectedResource.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : selectedResource.type === 'IMAGE' ? (
                  <div className="max-h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                    <img
                      src={selectedResource.contentUrl}
                      alt={selectedResource.title}
                      className="max-w-full max-h-96 object-contain"
                    />
                  </div>
                ) : selectedResource.type === 'PDF' ? (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <a
                      href={selectedResource.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <FileText className="h-5 w-5" />
                      Open PDF Document
                    </a>
                    {selectedResource.fileSizeBytes && (
                      <p className="text-xs text-slate-600 mt-2">
                        Size: {(selectedResource.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                ) : selectedResource.type === 'LINK' ? (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <a
                      href={selectedResource.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium break-all"
                    >
                      <LinkIcon className="h-5 w-5 flex-shrink-0" />
                      Visit Resource
                    </a>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <a
                      href={selectedResource.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <LinkIcon className="h-5 w-5" />
                      Open Resource
                    </a>
                  </div>
                )}

                {selectedResource.durationMinutes > 0 && (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700">
                      ⏱️ Estimated duration: <span className="font-semibold">{selectedResource.durationMinutes} minutes</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}
