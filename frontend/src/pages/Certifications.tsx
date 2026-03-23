import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Award, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useEnrollments, useProgress, Enrollment, ProgressSummaryItem } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/authStore';
import skillForgeLogo from '@/assets/skillforge-logo.svg';

export const Certifications: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
  const getCertificateNumber = (cert: { id: number; course: string; date: string }) => {
    const titleToken = cert.course.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'COURSE';
    const dateToken = new Date(cert.date).toISOString().slice(0, 10).replace(/-/g, '');
    return `SF-${titleToken}-${dateToken}-${cert.id}`;
  };

  const getCertificateElement = (certId: number) => document.getElementById(`cert-${certId}`);

  const getCertificateCanvas = async (certId: number) => {
    const element = getCertificateElement(certId);
    if (element) {
      return html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
    }
    return null;
  };

  const downloadCertificate = async (cert: { id: number; course: string; date: string }) => {
    const canvas = await getCertificateCanvas(cert.id);
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${cert.course.replace(/\s+/g, '-').toLowerCase()}-certificate.png`;
    link.click();
  };

  const shareCertificate = async (cert: { id: number; course: string; date: string }) => {
    const certificateNumber = getCertificateNumber(cert);
    const verificationUrl = `${window.location.origin}/certifications?certificate=${certificateNumber}`;
    const shareText = `SkillForge Certificate\nCourse: ${cert.course}\nRecipient: ${user?.name || 'Learner'}\nCertificate ID: ${certificateNumber}\nIssued: ${new Date(cert.date).toLocaleDateString()}\nVerify: ${verificationUrl}`;

    const canvas = await getCertificateCanvas(cert.id);

    if (canvas && navigator.share) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

      if (blob) {
        const file = new File([blob], `${certificateNumber}.png`, { type: 'image/png' });

        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${cert.course} - SkillForge Certificate`,
              text: shareText,
              files: [file],
            });
            return;
          }

          await navigator.share({
            title: `${cert.course} - SkillForge Certificate`,
            text: shareText,
            url: verificationUrl,
          });
          return;
        } catch {
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert('Certificate details copied to clipboard. You can now paste and share it.');
    } catch {
      alert('Sharing is not supported on this browser. Please use Download Certificate.');
    }
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-3">
          <Award className="h-10 w-10 text-indigo-700" />
          Certifications & Achievements
        </h1>
        <p className="text-slate-600 text-lg">Your earned certificates and progress</p>
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
        <div className={`grid grid-cols-1 gap-6 ${certificates.length > 1 ? '2xl:grid-cols-2' : ''}`}>
          {certificates.map((cert) => (
            <Card key={cert.id} className="border-primary/50 h-full">
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
                  className="bg-white p-8 rounded-lg border-2 border-slate-300 text-center shadow-sm"
                >
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <img src={skillForgeLogo} alt="SkillForge" className="h-10 w-10" />
                    <div className="text-left">
                      <div className="text-xs uppercase tracking-wider text-slate-500">AI Learning Platform</div>
                      <div className="text-xl font-bold text-slate-900">SkillForge</div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-500 mb-2">Certificate of Completion</div>
                  <div className="text-sm text-slate-500">Presented to</div>
                  <div className="text-2xl font-bold text-slate-900 mb-3">{user?.name || 'Learner'}</div>

                  <div className="text-sm text-slate-500">for successfully completing</div>
                  <h3 className="text-3xl font-bold mb-4 text-slate-900">{cert.course}</h3>

                  <div className="text-5xl font-extrabold text-slate-900 mb-2">{cert.score}%</div>
                  <p className="text-sm text-slate-600 mb-5">Successfully completed with distinction</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600 border-t border-slate-200 pt-4 mt-2">
                    <div>
                      <div className="font-semibold text-slate-800">Certificate ID</div>
                      <div>{getCertificateNumber(cert)}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Issue Date</div>
                      <div>{new Date(cert.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Issued By</div>
                      <div>SkillForge Academy</div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => downloadCertificate(cert)}
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </Button>

                <Button variant="ghost" className="w-full gap-2" onClick={() => shareCertificate(cert)}>
                  <Share2 className="h-4 w-4" />
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
        <div className={`grid grid-cols-1 gap-6 ${incompleteCourses.length > 1 ? '2xl:grid-cols-2' : ''}`}>
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
