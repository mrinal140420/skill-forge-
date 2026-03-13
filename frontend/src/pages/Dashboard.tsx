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
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
      {/* Welcome Section */}
      <div className="space-y-3">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">Welcome back, {user?.name}! 👋</h1>
        <p className="text-slate-600 text-lg">
          You have{' '}
          <span className="font-semibold text-blue-600">
            {stats.activeCourses} active {stats.activeCourses === 1 ? 'course' : 'courses'}
          </span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-2xl transition-all bg-white hover:scale-105 duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Active Courses</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mt-2">{stats.activeCourses}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-xl shadow-md">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-2xl transition-all bg-white hover:scale-105 duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Certificates</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mt-2">{stats.certificates}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-xl shadow-md">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-2xl transition-all bg-white hover:scale-105 duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Enrolled Courses</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mt-2">{(enrollments as Enrollment[]).length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-4 rounded-xl shadow-md">
                <Flame className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-2xl transition-all bg-white hover:scale-105 duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Total Hours</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mt-2">{stats.totalHours}</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-xl shadow-md">
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Learning */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50 hover:shadow-xl transition-all">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">Resume Learning</CardTitle>
          <CardDescription className="text-base">Continue where you left off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeEnrollments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium mb-4">No active courses yet</p>
              <Link to="/courses">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg">Explore Courses</Button>
              </Link>
            </div>
          ) : (
            activeEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="space-y-3 border-l-4 border-l-blue-400 bg-blue-50/30 p-4 rounded-lg hover:bg-blue-50/60 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-lg">{enrollment.courseTitle}</h4>
                    <p className="text-sm text-slate-600 font-medium">{enrollment.progress}% complete</p>
                  </div>
                  <Link to={`/course-content/${enrollment.courseId}`}>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <Progress value={enrollment.progress} className="h-2 bg-blue-100" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">Recommended For You</CardTitle>
            <CardDescription>Based on your learning patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedCourses.length === 0 ? (
              <p className="text-sm text-slate-600 font-medium">No recommendations yet</p>
            ) : (
              recommendedCourses.map((course: any) => (
                <div key={course.id} className="border-l-4 border-l-purple-400 bg-purple-50/30 p-3 rounded-lg hover:bg-purple-50/60 transition-all">
                  <h4 className="font-semibold text-slate-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-slate-600 mb-2">{course.reason}</p>
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs">
                    {course.category}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-cyan-50 hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Next Steps</CardTitle>
            <CardDescription>Your learning roadmap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {activeEnrollments.length === 0 ? (
                <p className="text-sm text-slate-600 font-medium">
                  Enroll in a course to see your next steps.
                </p>
              ) : (
                activeEnrollments.map((enrollment, idx) => (
                  <Link
                    key={enrollment.id}
                    to={`/course-content/${enrollment.courseId}`}
                    className="block"
                  >
                    <div className="flex gap-3 border-l-4 border-l-cyan-400 bg-cyan-50/30 p-3 rounded-lg hover:bg-cyan-50/60 transition-all">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 text-white font-bold shadow-md ${
                        idx === 0 ? 'bg-gradient-to-br from-cyan-500 to-cyan-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {enrollment.progress < 100
                            ? `Continue ${enrollment.courseTitle}`
                            : `Take ${enrollment.courseTitle} Exam`}
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {enrollment.progress < 100
                            ? `${enrollment.progress}% complete`
                            : 'Ready for certification'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
