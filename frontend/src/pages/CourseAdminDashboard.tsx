import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/api/adminAPI';
import { useNavigate } from 'react-router-dom';

type DashboardSummary = {
  assignedCourses: number;
  enrolledStudents: number;
  averageProgress: number;
  pendingDoubts: number;
  quizAttempts: number;
  assignedCourseDetails?: Array<{ id: number; title: string; status?: string; enrolledStudents?: number }>;
  enrolledStudentDetails?: Array<{ id: number; name: string; email: string; coursesCount: number; courses: Array<{ id: number; title: string }> }>;
};

export const CourseAdminDashboard: FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [showEnrolledStudents, setShowEnrolledStudents] = useState(false);
  const [showAssignedCourses, setShowAssignedCourses] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardRes, myCoursesRes] = await Promise.all([
          adminAPI.getCourseAdminDashboard(),
          adminAPI.getMyCourses(),
        ]);

        const dashboard = dashboardRes?.data || {};
        const myCourses = myCoursesRes?.data?.courses || [];
        const normalizedAssignedCount = Array.isArray(myCourses) ? myCourses.length : 0;

        setSummary({
          assignedCourses: normalizedAssignedCount,
          enrolledStudents: dashboard?.enrolledStudents ?? 0,
          averageProgress: dashboard?.averageProgress ?? 0,
          pendingDoubts: dashboard?.pendingDoubts ?? 0,
          quizAttempts: dashboard?.quizAttempts ?? 0,
          assignedCourseDetails: dashboard?.assignedCourseDetails || myCourses,
          enrolledStudentDetails: dashboard?.enrolledStudentDetails || [],
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const cards = [
    {
      label: 'Assigned Courses',
      value: summary?.assignedCourses ?? 0,
      onClick: () => {
        setShowAssignedCourses(true);
        navigate('/instructor/courses');
      },
    },
    {
      label: 'Enrolled Students',
      value: summary?.enrolledStudents ?? 0,
      onClick: () => {
        setShowEnrolledStudents((prev) => !prev);
      },
    },
    {
      label: 'Average Progress',
      value: `${summary?.averageProgress ?? 0}%`,
      onClick: () => setShowAssignedCourses(true),
    },
    {
      label: 'Pending Doubts',
      value: summary?.pendingDoubts ?? 0,
      onClick: () => navigate('/instructor/doubts'),
    },
    {
      label: 'Quiz Attempts',
      value: summary?.quizAttempts ?? 0,
      onClick: () => setShowAssignedCourses(true),
    },
  ];

  const getCardClasses = (idx: number) => {
    const classes = [
      'border-l-purple-500 bg-purple-50',
      'border-l-violet-500 bg-violet-50',
      'border-l-pink-500 bg-pink-50',
      'border-l-indigo-500 bg-indigo-50',
      'border-l-blue-500 bg-blue-50',
    ];
    return classes[idx % classes.length];
  };

  const getTitleClasses = (idx: number) => {
    const classes = ['text-purple-600', 'text-violet-600', 'text-pink-600', 'text-indigo-600', 'text-blue-600'];
    return classes[idx % classes.length];
  };

  const getValueClasses = (idx: number) => {
    const classes = ['text-purple-900', 'text-violet-900', 'text-pink-900', 'text-indigo-900', 'text-blue-900'];
    return classes[idx % classes.length];
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">Course Admin Dashboard</h1>
        <p className="text-slate-600 text-lg">Overview for assigned courses</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, idx) => (
          <Card
            key={card.label}
            className={`border-l-4 shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 cursor-pointer ${getCardClasses(idx)}`}
            onClick={card.onClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-semibold ${getTitleClasses(idx)}`}>{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getValueClasses(idx)}`}>{card.value as any}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAssignedCourses && (
        <Card className="shadow-lg border-l-4 border-l-purple-500 bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Assigned Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(summary?.assignedCourseDetails || []).length === 0 ? (
              <div className="text-sm text-slate-600">No assigned courses found.</div>
            ) : (
              (summary?.assignedCourseDetails || []).map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-lg border p-3 bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-900">{course.title}</div>
                    <div className="text-xs text-slate-600">Enrolled students: {course.enrolledStudents ?? 0}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/instructor/courses/${course.id}/content`)}>
                    Open Content
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {showEnrolledStudents && (
        <Card className="shadow-lg border-l-4 border-l-violet-500 bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(summary?.enrolledStudentDetails || []).length === 0 ? (
              <div className="text-sm text-slate-600">No enrolled students found for your assigned courses.</div>
            ) : (
              (summary?.enrolledStudentDetails || []).map((student) => (
                <div key={student.id} className="rounded-lg border p-3 bg-slate-50">
                  <div className="font-semibold text-slate-900">{student.name}</div>
                  <div className="text-sm text-slate-600">{student.email}</div>
                  <div className="text-xs text-slate-600 mt-2">Assigned courses enrolled: {student.coursesCount}</div>
                  <div className="text-xs text-slate-700 mt-1">
                    {(student.courses || []).map((course) => course.title).join(', ')}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
