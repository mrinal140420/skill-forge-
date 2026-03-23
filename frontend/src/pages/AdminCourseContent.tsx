import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronRight, Plus, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import apiClient from '@/api/apiClient';
import { useNavigate, useParams } from 'react-router-dom';

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
  isVisible: boolean;
}

interface GeneratedExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

interface GeneratedExam {
  courseId: string;
  title: string;
  durationSeconds: number;
  generatedAt?: string;
  questions: GeneratedExamQuestion[];
}

const resourceTypes = ['VIDEO', 'NOTES', 'IMAGE', 'PDF', 'CODE_SNIPPET', 'ARTICLE', 'LINK'];

export const AdminCourseContent: FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [courseMeta, setCourseMeta] = useState<{ id: number; title: string } | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);
  const [generatingExam, setGeneratingExam] = useState(false);

  // Form states
  const [newTopicForm, setNewTopicForm] = useState({ title: '', description: '', orderIndex: 1 });
  const [showTopicForm, setShowTopicForm] = useState(false);

  const [newLessonForm, setNewLessonForm] = useState({ title: '', description: '', orderIndex: 1, durationMinutes: 30, topicId: '' });
  const [showLessonForm, setShowLessonForm] = useState<number | null>(null);

  const [newResourceForm, setNewResourceForm] = useState({ title: '', description: '', type: 'VIDEO', contentUrl: '', orderIndex: 1, durationMinutes: 0, lessonId: '' });
  const [showResourceForm, setShowResourceForm] = useState<number | null>(null);

  useEffect(() => {
    loadTopics();
    loadCourseMeta();
    loadGeneratedExam();
  }, [courseId]);

  const loadCourseMeta = async () => {
    if (!courseId) return;
    try {
      const res = await apiClient.get(`/api/courses/${courseId}`);
      const course = res.data?.course;
      if (course) {
        setCourseMeta({ id: Number(course.id), title: course.title });
      }
    } catch (err: any) {
      console.error('Failed to load course metadata:', err);
    }
  };

  const loadTopics = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const res = await apiClient.get(`/api/content/courses/${courseId}/topics`);
      setTopics(res.data.topics || []);
    } catch (err: any) {
      console.error('Failed to load topics:', err);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const reloadTopicsPreserveScroll = async () => {
    const currentY = window.scrollY;
    await loadTopics(false);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentY, behavior: 'auto' });
    });
  };

  const loadGeneratedExam = async () => {
    if (!courseId) return;
    try {
      const res = await apiClient.get(`/api/exams/${courseId}`);
      setGeneratedExam(res.data || null);
    } catch {
      setGeneratedExam(null);
    }
  };

  const handleGenerateExam = async () => {
    if (!courseId) return;
    setGeneratingExam(true);
    try {
      const res = await apiClient.post(`/api/exams/generate/${courseId}`);
      setGeneratedExam(res.data || null);
    } catch (err: any) {
      alert('Failed to generate exam: ' + (err.response?.data?.error || err.message));
    } finally {
      setGeneratingExam(false);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicForm.title) return;
    setSaving(true);
    try {
      await apiClient.post(`/api/content/courses/${courseId}/topics`, newTopicForm);
      setNewTopicForm({ title: '', description: '', orderIndex: topics.length + 1 });
      setShowTopicForm(false);
      await reloadTopicsPreserveScroll();
    } catch (err: any) {
      alert('Failed to create topic: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (topicId: number) => {
    if (!newLessonForm.title) return;
    setSaving(true);
    try {
      await apiClient.post(`/api/content/topics/${topicId}/lessons`, newLessonForm);
      setNewLessonForm({ title: '', description: '', orderIndex: 1, durationMinutes: 30, topicId: '' });
      setShowLessonForm(null);
      await reloadTopicsPreserveScroll();
    } catch (err: any) {
      alert('Failed to create lesson: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddResource = async (lessonId: number) => {
    if (!newResourceForm.title || !newResourceForm.contentUrl) return;
    setSaving(true);
    try {
      await apiClient.post(`/api/content/lessons/${lessonId}/resources`, newResourceForm);
      setNewResourceForm({ title: '', description: '', type: 'VIDEO', contentUrl: '', orderIndex: 1, durationMinutes: 0, lessonId: '' });
      setShowResourceForm(null);
      await reloadTopicsPreserveScroll();
    } catch (err: any) {
      alert('Failed to add resource: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!window.confirm('Are you sure you want to delete this topic and all its lessons?')) return;
    try {
      await apiClient.delete(`/api/content/topics/${topicId}`);
      await reloadTopicsPreserveScroll();
    } catch (err: any) {
      alert('Failed to delete topic: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Are you sure you want to delete this lesson and all its resources?')) return;
    try {
      await apiClient.delete(`/api/content/lessons/${lessonId}`);
      await reloadTopicsPreserveScroll();
    } catch (err: any) {
      alert('Failed to delete lesson: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await apiClient.delete(`/api/content/resources/${resourceId}`);
      await reloadTopicsPreserveScroll();
    } catch (err: any) {
      alert('Failed to delete resource: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleResourceVisibility = async (resourceId: number, isVisible: boolean) => {
    try {
      await apiClient.put(`/api/content/resources/${resourceId}`, { isVisible: !isVisible });
      await reloadTopicsPreserveScroll();
    } catch (err: any) {
      alert('Failed to update resource: ' + (err.response?.data?.error || err.message));
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

  if (loading) {
    return <div className="p-8">Loading course content...</div>;
  }

  return (
    <div className="space-y-6 p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
          Course Content Management
        </h1>
        <p className="text-slate-600 text-lg">Add topics, lessons, and learning resources</p>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-slate-700">
            {courseMeta ? (
              <>
                Course: <span className="font-semibold">{courseMeta.title}</span> • ID: <span className="font-semibold">{courseMeta.id}</span>
              </>
            ) : (
              <>
                Course ID: <span className="font-semibold">{courseId}</span>
              </>
            )}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(`/course-content/${courseId}`)}
          >
            Preview Student Feed
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-white border-l-4 border-l-emerald-500">
        <CardHeader className="border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-transparent">
          <CardTitle className="flex items-center justify-between gap-3">
            <span className="text-slate-900">AI Generated Exam</span>
            <Button onClick={handleGenerateExam} disabled={generatingExam} className="bg-emerald-600 hover:bg-emerald-700">
              {generatingExam ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {generatingExam ? 'Generating...' : generatedExam ? 'Regenerate with Gemini' : 'Generate with Gemini'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {!generatedExam ? (
            <p className="text-sm text-slate-600">No exam generated yet. Generate one from the course content for students to take.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>Title: <span className="font-semibold text-slate-900">{generatedExam.title}</span></span>
                <span>Questions: <span className="font-semibold text-slate-900">{generatedExam.questions.length}</span></span>
                <span>Duration: <span className="font-semibold text-slate-900">{Math.round((generatedExam.durationSeconds || 0) / 60)} min</span></span>
              </div>
              <div className="space-y-3">
                {generatedExam.questions.map((question, index) => (
                  <div key={question.id || index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Q{index + 1}. {question.question}</p>
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      {question.options.map((option, optionIndex) => (
                        <p key={optionIndex} className={question.correctAnswerIndex === optionIndex ? 'font-semibold text-emerald-700' : ''}>
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Topic Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-purple-50 border-l-4 border-l-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b border-purple-200">
          <CardTitle className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">Add New Topic</span>
            <Button
              onClick={() => setShowTopicForm(!showTopicForm)}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Topic
            </Button>
          </CardTitle>
        </CardHeader>
        {showTopicForm && (
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label className="text-sm">Topic Title *</Label>
              <Input
                placeholder="e.g., Arrays & Lists"
                value={newTopicForm.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                placeholder="Describe this topic..."
                value={newTopicForm.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTopicForm({ ...newTopicForm, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Order</Label>
              <Input
                type="number"
                value={newTopicForm.orderIndex}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTopicForm({ ...newTopicForm, orderIndex: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleAddTopic}
              disabled={saving || !newTopicForm.title}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {saving ? 'Creating...' : 'Create Topic'}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <Card key={topic.id} className="border-0 shadow-lg bg-gradient-to-r from-white to-slate-50 border-l-4 border-l-slate-500">
            <CardHeader
              className="pb-3 cursor-pointer hover:bg-slate-50 transition-all bg-gradient-to-r from-slate-50 to-transparent border-b border-slate-200"
              onClick={() => toggleTopic(topic.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {expandedTopics.has(topic.id) ? (
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  )}
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">{topic.title}</CardTitle>
                    {topic.description && (
                      <p className="text-xs text-slate-600 mt-1">{topic.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                    {topic.lessons.length} lessons
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTopic(topic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedTopics.has(topic.id) && (
              <CardContent className="space-y-4 pt-6">
                {/* Add Lesson Form */}
                {showLessonForm === topic.id && (
                  <div className="bg-slate-50 p-4 rounded-lg border-l-2 border-l-blue-500 space-y-3">
                    <Label className="font-semibold">Add Lesson</Label>
                    <Input
                      placeholder="Lesson title"
                      value={newLessonForm.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLessonForm({ ...newLessonForm, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Lesson description"
                      value={newLessonForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLessonForm({ ...newLessonForm, description: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={newLessonForm.durationMinutes}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLessonForm({ ...newLessonForm, durationMinutes: parseInt(e.target.value) })}
                    />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleAddLesson(topic.id)}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add Lesson
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowLessonForm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lessons List */}
                {topic.lessons.length === 0 ? (
                  <div className="text-center py-6 text-slate-600">No lessons yet</div>
                ) : (
                  <div className="space-y-3">
                    {topic.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50 transition-all"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleLesson(lesson.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {expandedLessons.has(lesson.id) ? (
                              <ChevronDown className="h-4 w-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-600" />
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{lesson.title}</p>
                              {lesson.description && (
                                <p className="text-xs text-slate-600">{lesson.description}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-1">⏱️ {lesson.durationMinutes} min • {lesson.resources.length} resources</p>
                            </div>
                          </div>
                          <div className="flex gap-1" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                            <Button size="sm" variant="outline" className="text-blue-600">
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {expandedLessons.has(lesson.id) && (
                          <div className="mt-4 space-y-3 border-t pt-4">
                            {/* Add Resource Form */}
                            {showResourceForm === lesson.id && (
                              <div className="bg-blue-50 p-3 rounded border-l-2 border-l-blue-500 space-y-2">
                                <p className="font-semibold text-sm">Add Resource</p>
                                <Input
                                  placeholder="Resource title"
                                  value={newResourceForm.title}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                                  size={1}
                                  className="text-sm"
                                />
                                <Select value={newResourceForm.type} onValueChange={(v) => setNewResourceForm({ ...newResourceForm, type: v })}>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {resourceTypes.map((t) => (
                                      <SelectItem key={t} value={t}>
                                        {t}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="Content URL (YouTube, S3, etc.)"
                                  value={newResourceForm.contentUrl}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResourceForm({ ...newResourceForm, contentUrl: e.target.value })}
                                  size={1}
                                  className="text-sm"
                                />
                                <Input
                                  placeholder="Description"
                                  value={newResourceForm.description}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResourceForm({ ...newResourceForm, description: e.target.value })}
                                  size={1}
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm h-8"
                                    onClick={() => handleAddResource(lesson.id)}
                                    disabled={saving}
                                  >
                                    {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
                                    Add
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowResourceForm(null)}
                                    className="text-sm h-8"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Resources List */}
                            {lesson.resources.length === 0 ? (
                              <div className="text-center py-3 text-slate-600 text-sm">
                                No resources yet
                                <Button
                                  variant="outline"
                                  className="ml-2 text-xs h-7"
                                  onClick={() => setShowResourceForm(lesson.id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Add
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {lesson.resources.map((resource) => (
                                  <div key={resource.id} className="bg-slate-50 p-3 rounded flex items-center justify-between border border-slate-200">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-slate-900">{resource.title}</p>
                                      <div className="flex gap-2 mt-1 text-xs text-slate-600">
                                        <span className="bg-slate-200 px-2 py-0.5 rounded">{resource.type}</span>
                                        {resource.durationMinutes > 0 && <span>⏱️ {resource.durationMinutes}m</span>}
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs"
                                        onClick={() => handleToggleResourceVisibility(resource.id, resource.isVisible)}
                                      >
                                        {resource.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-7"
                                        onClick={() => handleDeleteResource(resource.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!showResourceForm || showResourceForm !== lesson.id ? (
                              <Button
                                variant="outline"
                                className="w-full text-sm"
                                onClick={() => setShowResourceForm(lesson.id)}
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Resource
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showLessonForm !== topic.id && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowLessonForm(topic.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Lesson to Topic
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {topics.length === 0 && (
        <Card className="border-0 shadow-lg text-center py-12">
          <p className="text-slate-600 mb-4">No topics added yet</p>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setShowTopicForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Create First Topic
          </Button>
        </Card>
      )}
    </div>
  );
};
