import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnrollments, useCourseTopics, Enrollment } from '@/hooks/useApi';
import { getSuggestedQuestions, sendSkillBotMessage, validateCourseContext } from '@/api/chatbotService';
import { Send, Lightbulb, HelpCircle, BookOpen, Loader2, FileVideo, Play, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const MyCourses: FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: enrollments = [], isLoading } = useEnrollments();
  const isInstructor = user?.role === 'instructor';
  const [selectedTab, setSelectedTab] = useState('curriculum');
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([
    { role: 'bot', text: `Hi ${user?.name?.split(' ')[0] || 'there'}, ask me about this course and I will keep the answer short and focused on the uploaded material.` },
  ]);

  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

  const typedEnrollments = enrollments as Enrollment[];
  const course = typedEnrollments[0];
  const courseModules = course?.course?.modules || [];
  const { data: courseTopics = [], isLoading: topicsLoading } = useCourseTopics(course?.courseId, !!course?.courseId);

  const toggleTopic = (id: number) =>
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const courseContext = course ? {
    courseId: String(course.courseId),
    courseTitle: course.courseTitle,
    courseDescription: course.course?.description,
    topics: courseModules.map((mod) => mod.title),
    studentName: user?.name,
  } : null;
  const suggestedQuestions = courseContext ? getSuggestedQuestions(courseContext) : [];

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !courseContext || !validateCourseContext(courseContext)) return;
    const question = aiQuestion;
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setAiQuestion('');
    try {
      const reply = await sendSkillBotMessage(question, courseContext);
      setChatMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I couldn\'t connect to the AI service right now.' }]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isInstructor ? 'My Courses (Instructor)' : 'My Courses'}</h1>
        <p className="text-muted-foreground">
          {isInstructor ? 'Manage and upload course content' : 'Continue your learning journey'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      ) : typedEnrollments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{isInstructor ? 'No courses assigned yet.' : "You haven't enrolled in any courses yet."}</p>
          <a href={isInstructor ? "/instructor/dashboard" : "/courses"}>
            <Button variant="link">{isInstructor ? 'Go to Dashboard' : 'Explore Courses'}</Button>
          </a>
        </div>
      ) : isInstructor ? (
        // INSTRUCTOR VIEW - Course Management
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{enrollment.courseTitle}</CardTitle>
                  <CardDescription>Manage course content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload videos, notes, images, PDFs, and code snippets for your students
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/instructor/courses/${enrollment.courseId}/content`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // STUDENT VIEW - Course Learning
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          {course && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{course.courseTitle}</CardTitle>
                    <CardDescription>
                      {courseModules.length > 0
                        ? `${courseModules.length} modules • ${course.course?.duration || 0} hours`
                        : 'Course content'}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">Course ID: {course.courseId}</p>
                  </div>
                  <Badge>{course.status === 'completed' ? 'Completed' : 'In Progress'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Course Progress</span>
                    <span className="text-sm text-muted-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Curriculum, Modules, and AI Tutor */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curriculum" className="flex items-center gap-2">
                <FileVideo className="h-4 w-4" />
                Study Materials
              </TabsTrigger>
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Modules
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                SkillBot
              </TabsTrigger>
            </TabsList>

            {/* Course Curriculum - Topics, Lessons, Resources */}
            <TabsContent value="curriculum" className="space-y-4">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileVideo className="h-5 w-5 text-purple-600" />
                        Course Curriculum
                      </CardTitle>
                      <CardDescription>
                        Watch videos, read notes, view images, and study materials organized by topics
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => navigate(`/course-content/${course?.courseId}`)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-lg border border-purple-200">
                    <p className="text-muted-foreground mb-4">
                      This course includes organized study materials including:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">📹 Video Lectures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">📝 Study Notes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">🖼️ Diagrams & Images</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm">📄 PDFs & Resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">💻 Code Examples</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">🔗 External Resources</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Course Modules Tab - loaded from instructor-created content */}
            <TabsContent value="modules" className="space-y-4">
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-900">
                      Course Modules
                    </CardTitle>
                    {courseTopics.length > 0 && (
                      <span className="text-xs text-slate-500">{courseTopics.length} topic{courseTopics.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {topicsLoading ? (
                    <div className="flex items-center gap-2 py-6 justify-center text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading course content...</span>
                    </div>
                  ) : courseTopics.length === 0 ? (
                    <div className="py-8 text-center">
                      <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500">No content published yet by the instructor.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {courseTopics.map((topic, topicIdx) => {
                        const isOpen = expandedTopics.has(topic.id);
                        const lessons = topic.lessons || [];
                        return (
                          <div key={topic.id} className="rounded-xl border border-slate-100 overflow-hidden">
                            {/* Topic header */}
                            <button
                              onClick={() => toggleTopic(topic.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-purple-50 transition-colors text-left"
                            >
                              <span className="flex-shrink-0 h-7 w-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                                {topicIdx + 1}
                              </span>
                              <span className="flex-1 font-semibold text-sm text-slate-900">{topic.title}</span>
                              {lessons.length > 0 && (
                                <span className="text-xs text-slate-400 mr-2">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
                              )}
                              {isOpen
                                ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                            </button>

                            {/* Lessons list */}
                            {isOpen && (
                              <div className="border-t border-slate-100 bg-slate-50">
                                {lessons.length === 0 ? (
                                  <p className="text-xs text-slate-400 px-12 py-3">No lessons in this topic yet.</p>
                                ) : (
                                  lessons.map((lesson, lessonIdx) => {
                                    const typeIcon: Record<string, string> = {
                                      video: '🎬', text: '📝', image: '🖼️',
                                      pdf: '📄', code: '💻', link: '🔗',
                                    };
                                    const icon = typeIcon[lesson.contentType?.toLowerCase()] || '📖';
                                    return (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-3 px-12 py-2.5 border-b border-slate-100 last:border-b-0"
                                      >
                                        <span className="text-base">{icon}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-slate-800 truncate">{lesson.title}</p>
                                          {lesson.duration != null && (
                                            <p className="text-xs text-slate-400">{lesson.duration} min{lesson.duration !== 1 ? 's' : ''}</p>
                                          )}
                                        </div>
                                        <span className="text-xs text-slate-400">#{lessonIdx + 1}</span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SkillBot AI Tutor Tab */}
            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    SkillBot AI
                  </CardTitle>
                  <CardDescription>Ask short questions about {course?.courseTitle} only</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 h-64 sm:h-72 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-primary/10 ml-4' : 'bg-primary/5 mr-4'}`}>
                        <p className="font-semibold mb-1">{msg.role === 'user' ? 'You' : 'SkillBot'}</p>
                        <p className="text-sm text-muted-foreground leading-6">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder={`Ask about ${course?.courseTitle || 'this course'}...`}
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                        className="pr-10 min-h-11"
                      />
                      <button onClick={handleAskAI} className="absolute right-2 top-2.5 text-muted-foreground">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-2 text-xs sm:grid-cols-2">
                      {suggestedQuestions.slice(0, 4).map((suggestion, index) => (
                        <button
                          key={suggestion}
                          onClick={() => { setAiQuestion(suggestion); }}
                          className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          {index === 0 ? <HelpCircle className="h-4 w-4 text-primary mt-0.5" /> : index === 1 ? <BookOpen className="h-4 w-4 text-primary mt-0.5" /> : <Lightbulb className="h-4 w-4 text-primary mt-0.5" />}
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* All Enrolled Courses */}
          {typedEnrollments.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Enrolled Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {typedEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{enrollment.courseTitle}</h4>
                      <p className="text-xs text-muted-foreground">{enrollment.progress}% complete</p>
                    </div>
                    <Badge variant={enrollment.progress >= 100 ? 'secondary' : 'default'}>
                      {enrollment.progress >= 100 ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Quick Stats */}
        <div>
          <Card className="sticky top-6 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Courses Enrolled</p>
                <p className="text-2xl font-bold">{typedEnrollments.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Progress</p>
                <p className="text-2xl font-bold">{Math.round(typedEnrollments.reduce((a, b) => a + (b.progress || 0), 0) / (typedEnrollments.length || 1))}%</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-semibold mb-2">Study Tips</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>✓ Study consistently for best results</li>
                  <li>✓ Complete all modules in order</li>
                  <li>✓ Take quizzes after each module</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};
