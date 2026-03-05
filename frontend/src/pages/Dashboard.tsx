import { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEnrollments, useRecommendations, Enrollment } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/authStore';
import { ArrowRight, BookOpen, Award, Flame, Target } from 'lucide-react';

export const Dashboard: FC = () => {
  const user = useAuthStore((state) => state.user);
  const { data: enrollments = [] } = useEnrollments();
  const { data: recommendations } = useRecommendations();

  const activeEnrollments = (enrollments as Enrollment[]).slice(0, 3);
  const recommendedCourses = recommendations?.courses?.slice(0, 3) || [];

  // Compute real stats from enrollment data
  const stats = useMemo(() => {
    const allEnrollments = enrollments as Enrollment[];
    const completedCount = allEnrollments.filter((e) => e.progress >= 100).length;
    const totalHours = allEnrollments.reduce((sum, e) => {
      const courseDuration = e.course?.duration || 0;
      return sum + Math.round((courseDuration * e.progress) / 100);
    }, 0);
    return {
      certificates: completedCount,
      totalHours,
      activeCourses: allEnrollments.length,
    };
  }, [enrollments]);

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Welcome back, {user?.name}! 👋</h1>
        <p className="text-slate-600">
          You have{' '}
          <span className="font-semibold text-blue-600">
            {stats.activeCourses} active {stats.activeCourses === 1 ? 'course' : 'courses'}
          </span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Courses</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeCourses}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Certificates</p>
                <p className="text-3xl font-bold text-slate-900">{stats.certificates}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Enrolled Courses</p>
                <p className="text-3xl font-bold text-slate-900">{(enrollments as Enrollment[]).length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Hours</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalHours}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Learning */}
      <Card className="border-slate-200 shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Resume Learning</CardTitle>
          <CardDescription>Continue where you left off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeEnrollments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No active courses yet</p>
              <Link to="/courses">
                <Button variant="link" className="text-blue-600">Explore Courses</Button>
              </Link>
            </div>
          ) : (
            activeEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="space-y-2 border-b border-slate-200 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{enrollment.courseTitle}</h4>
                    <p className="text-sm text-muted-foreground">{enrollment.progress}% complete</p>
                  </div>
                  <Link to={`/learn/${enrollment.courseId}/${enrollment.currentModuleId}`}>
                    <Button size="sm" variant="ghost" className="gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <Progress value={enrollment.progress} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended For You</CardTitle>
            <CardDescription>Based on your learning patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recommendations yet</p>
            ) : (
              recommendedCourses.map((course: any) => (
                <div key={course.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <h4 className="font-semibold text-sm mb-1">{course.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{course.reason}</p>
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Your learning roadmap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {activeEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Enroll in a course to see your next steps.
                </p>
              ) : (
                activeEnrollments.map((enrollment, idx) => (
                  <div key={enrollment.id} className="flex gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} text-sm font-semibold flex-shrink-0`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {enrollment.progress < 100
                          ? `Continue ${enrollment.courseTitle}`
                          : `Take ${enrollment.courseTitle} Exam`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.progress < 100
                          ? `${enrollment.progress}% complete`
                          : 'Ready for certification'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
