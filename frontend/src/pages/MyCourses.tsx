import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnrollments, useSendChatMessage, Enrollment } from '@/hooks/useApi';
import { Send, Lightbulb, HelpCircle, BookOpen, Loader2 } from 'lucide-react';

export const MyCourses: FC = () => {
  const { data: enrollments = [], isLoading } = useEnrollments();
  const [selectedTab, setSelectedTab] = useState('modules');
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([
    { role: 'bot', text: 'How can I help? I can explain concepts, answer questions, and help you understand the material better.' },
  ]);
  const sendChat = useSendChatMessage();

  const typedEnrollments = enrollments as Enrollment[];
  const course = typedEnrollments[0];
  const courseModules = course?.course?.modules || [];

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    const question = aiQuestion;
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setAiQuestion('');
    try {
      const result = await sendChat.mutateAsync({ message: question, courseId: course?.courseId, topic: course?.courseTitle });
      setChatMessages((prev) => [...prev, { role: 'bot', text: result.botResponse || result.response || result.message || 'I couldn\'t generate a response.' }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I couldn\'t connect to the AI service right now.' }]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      ) : typedEnrollments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>You haven't enrolled in any courses yet.</p>
          <a href="/courses">
            <Button variant="link">Explore Courses</Button>
          </a>
        </div>
      ) : (
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

          {/* Tabs for Modules and Video */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {courseModules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No modules available</p>
                  ) : (
                    courseModules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{mod.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {mod.duration} mins • {mod.contentType || 'video'}
                          </p>
                        </div>
                        {mod.completed && <Badge variant="secondary">Completed</Badge>}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Video player area</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-2">
                        {courseModules[0]?.title || 'Course Content'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course?.courseTitle || 'Select a module to begin learning.'}
                      </p>
                    </div>
                    <Button className="w-full">Mark as Complete</Button>
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

        {/* AI Bot Panel */}
        <div>
          <Card className="sticky top-6 h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                SkillBot AI
              </CardTitle>
              <CardDescription>Ask questions about the content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 h-64 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-primary/10 ml-4' : 'bg-primary/5'}`}>
                    <p className="font-semibold mb-1">{msg.role === 'user' ? 'You' : 'SkillBot'}</p>
                    <p className="text-xs text-muted-foreground">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Ask a question..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    className="pr-10"
                  />
                  <button onClick={handleAskAI} className="absolute right-2 top-2.5 text-muted-foreground">
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <button onClick={() => { setAiQuestion('Explain like I\'m 5'); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <span>Explain like I'm 5</span>
                  </button>
                  <button onClick={() => { setAiQuestion('Generate practice questions'); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Generate practice questions</span>
                  </button>
                  <button onClick={() => { setAiQuestion('Summarize the key concepts'); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span>Summarize content</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};
