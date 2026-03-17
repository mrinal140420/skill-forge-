import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useEnrollments, useProgress, Enrollment, ProgressSummaryItem } from '@/hooks/useApi';

export const Certifications: FC = () => {
  const navigate = useNavigate();
  const { data: enrollments, isLoading: enrollLoading } = useEnrollments();
  const { data: progressData, isLoading: progLoading } = useProgress();

  const { certificates, incompleteCourses } = useMemo(() => {
    const summary: ProgressSummaryItem[] = progressData?.summary || [];
    const progressMap: Record<string, ProgressSummaryItem> = {};
    for (const s of summary) {
      const cid = String(s.course?._id || s.course?.id || '');
      if (cid) progressMap[cid] = s;
    }

    const certs: any[] = [];
    const inProgress: any[] = [];

    (enrollments || []).forEach((e: Enrollment) => {
      const prog = progressMap[e.courseId];
      const pct = prog?.completionPercentage ?? e.progress ?? 0;
      if (pct >= 100) {
        certs.push({
          id: e.id,
          course: e.courseTitle,
          score: Math.round(pct),
          date: e.enrolledAt,
          status: 'completed',
        });
      } else {
        inProgress.push({
          id: e.id,
          courseId: e.courseId,
          currentModuleId: e.currentModuleId,
          course: e.courseTitle,
          progress: Math.round(pct),
          status: 'in-progress',
        });
      }
    });

    return { certificates: certs, incompleteCourses: inProgress };
  }, [enrollments, progressData]);
  const downloadCertificate = async (certId: number) => {
    const element = document.getElementById(`cert-${certId}`);
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = `certificate-${certId}.png`;
      link.click();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Certifications & Achievements</h1>
        <p className="text-muted-foreground">Your earned certificates and progress</p>
      </div>

      {/* Completed Certificates */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Completed Certificates</h2>
        {enrollLoading || progLoading ? (
          <p className="text-muted-foreground">Loading your certificates...</p>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Complete a course to earn your first certificate!</p>
            </CardContent>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      {cert.course}
                    </CardTitle>
                    <CardDescription>Completed on {new Date(cert.date).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge className="bg-green-600">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  id={`cert-${cert.id}`}
                  className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-lg border-2 border-dashed border-primary text-center"
                >
                  <div className="text-sm text-muted-foreground mb-2">Certificate of Completion</div>
                  <h3 className="text-lg font-bold mb-4">{cert.course}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">{cert.score}%</div>
                  <p className="text-xs text-muted-foreground">Successfully completed with distinction</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => downloadCertificate(cert.id)}
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </Button>

                <Button variant="ghost" className="w-full">
                  Share Certificate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* In Progress Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4">In Progress</h2>
        {incompleteCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No courses in progress. Enroll in a course to get started!</p>
            </CardContent>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {incompleteCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.course}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Progress</span>
                    <span className="text-sm text-muted-foreground">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => navigate(`/course-content/${course.courseId}`)}>
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Badges & Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Quick Learner', icon: '⚡' },
            { name: '7-Day Streak', icon: '🔥' },
            { name: 'Quiz Master', icon: '🎯' },
            { name: 'Night Owl', icon: '🌙' },
          ].map((badge) => (
            <Card key={badge.name} className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-sm font-semibold">{badge.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
