import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useCourse, useMarkModuleComplete, useProgress, useSendChatMessage } from '@/hooks/useApi';
import {
  Play,
  MessageCircle,
  BookOpen,
  CheckCircle2,
  Volume2,
  HelpCircle,
  Send,
} from 'lucide-react';

export const Learning: FC = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: courseProgress } = useProgress(courseId);
  const markComplete = useMarkModuleComplete();
  const sendChat = useSendChatMessage();

  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: 'SkillBot', text: 'Hi! I\'m here to help. Feel free to ask any questions about this module.' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [watchedMarked, setWatchedMarked] = useState(false);

  // Find the current module from the course
  const currentModule = course?.modules?.find((m) => m.id === moduleId) || course?.modules?.[0];
  const moduleTitle = currentModule?.title || 'Learning Module';
  const courseTitle = course?.title || 'Course';
  const instructor = course?.instructor || 'SkillForge Faculty';
  const moduleDuration = currentModule?.duration ? `${currentModule.duration} minutes` : '';
  const isCurrentModuleVideo = (currentModule?.contentType || 'video').toLowerCase() === 'video';
  const isSingleVideoCourse =
    (course?.modules?.length || 0) === 1 &&
    (course?.modules?.[0]?.contentType || 'video').toLowerCase() === 'video';
  const completionPercentage = Math.round((courseProgress as any)?.completionPercentage ?? 0);
  const examUnlocked = completionPercentage >= 100;

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue;
    setChatMessages((prev) => [
      ...prev,
      { id: prev.length + 1, author: 'You', text: userMsg },
    ]);
    setInputValue('');
    try {
      const result = await sendChat.mutateAsync({ message: userMsg, courseId: courseId, topic: moduleTitle });
      setChatMessages((prev) => [
        ...prev,
        { id: prev.length + 1, author: 'SkillBot', text: result.botResponse || result.response || result.message || 'Let me help you with that.' },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: prev.length + 1, author: 'SkillBot', text: 'Sorry, I couldn\'t connect to the AI service right now. Please try again.' },
      ]);
    }
  };

  const handleMarkComplete = () => {
    if (courseId && currentModule?.id) {
      markComplete.mutate(
        { courseId, moduleId: currentModule.id },
        {
          onSuccess: () => {
            setWatchedMarked(true);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading course content...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Learning Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Breadcrumb & Progress */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{courseTitle}</p>
          <h1 className="text-3xl font-bold">{moduleTitle}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span>By {instructor}</span>
            </span>
            <span>{moduleDuration}</span>
          </div>
        </div>

        {/* Video Player */}
        <Card className="overflow-hidden">
          {currentModule?.videoUrl ? (
            <div className="aspect-video">
              <iframe
                src={currentModule.videoUrl.replace('watch?v=', 'embed/')}
                title={moduleTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                <Play className="h-20 w-20 text-white group-hover:scale-110 transition" />
              </div>
            </div>
          )}
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">
              {currentModule?.videoUrl ? 'Watch the video above' : 'Video content coming soon'}
            </p>
          </CardContent>
        </Card>

        {/* Tabs for Content */}
        <Card>
          <CardHeader>
            <CardTitle>Module Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="modules" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  All Modules
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Key Concepts</h4>
                    <ul className="text-sm space-y-2 text-blue-800">
                      {(course?.outcomes || course?.tags || []).map((tag, idx) => (
                        <li key={idx}>✓ {tag}</li>
                      ))}
                      {(!course?.outcomes?.length && !course?.tags?.length) && (
                        <li>✓ {moduleTitle}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="mt-6">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {course?.modules?.map((mod, idx) => (
                    <div
                      key={mod.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${mod.id === currentModule?.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-gray-50'}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{mod.title}</p>
                        <p className="text-xs text-gray-500">{mod.duration} mins</p>
                      </div>
                      {mod.completed && <Badge variant="secondary">Done</Badge>}
                      {mod.id === currentModule?.id && !mod.completed && <Badge>Current</Badge>}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      📝 <strong>Tip:</strong> Take notes while watching to improve retention. Focus on key concepts in {moduleTitle}.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View All Notes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {isSingleVideoCourse ? 'Mark Video Watched' : 'Mark Module Complete'}
                </p>
                <p className="text-xs text-gray-600">
                  {isSingleVideoCourse
                    ? `After watching this single video module, mark it complete to unlock exam attempt.`
                    : `Mark "${moduleTitle}" as completed`}
                </p>
                <p className="text-xs text-gray-600 mt-1">Overall progress: {completionPercentage}%</p>
              </div>
              <Button size="sm" onClick={handleMarkComplete} disabled={markComplete.isPending}>
                {markComplete.isPending
                  ? 'Saving...'
                  : isCurrentModuleVideo
                  ? 'Mark Watched'
                  : 'Complete'}
              </Button>
            </div>
            {examUnlocked && (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">Exam is unlocked</p>
                  <p className="text-xs text-gray-600">Your course is 100% complete. You can attempt the exam now.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/exam')}>
                  Attempt Exam
                </Button>
              </div>
            )}
            {!examUnlocked && watchedMarked && (
              <p className="text-xs text-gray-600">Module marked complete. Finish remaining modules to unlock exam.</p>
            )}
            {course?.modules && course.modules.length > 1 && (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">Next Module</p>
                  <p className="text-xs text-gray-600">
                    {(() => {
                      const curIdx = course.modules.findIndex((m) => m.id === currentModule?.id);
                      const next = course.modules[curIdx + 1];
                      return next ? next.title : 'All modules completed!';
                    })()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Tutor Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              SkillBot
            </CardTitle>
            <p className="text-xs text-gray-600">Ask anything about {moduleTitle}</p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 border rounded-lg p-3 bg-gray-50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.author === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                      msg.author === 'You'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-semibold text-gray-600">Quick Help</p>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8 justify-start" onClick={() => { setInputValue('Explain like I\'m 5'); }}>
                  📚 Explain like I'm 5
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 justify-start" onClick={() => { setInputValue('Give me an example'); }}>
                  💡 Give me an example
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 justify-start" onClick={() => { setInputValue('Practice questions for ' + moduleTitle); }}>
                  ❓ Practice questions
                </Button>
              </div>
            </div>

            {/* Input */}
            <div className="border-t pt-3 flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="text-sm h-9"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                className="h-9 w-9 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
