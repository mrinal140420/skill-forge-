import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/api/adminAPI';
import apiClient from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';

type DashboardSummary = {
  totalUsers: number;
  totalStudents: number;
  totalCourseAdmins: number;
  totalSuperAdmins: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  activeLearnersToday: number;
  unresolvedDoubts: number;
  totalDoubts: number;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AdminCourse = {
  id?: number;
  _id?: number;
  title: string;
  status?: string;
  category?: string;
  level?: string;
};

type AdminDoubt = {
  id: number;
  title: string;
  courseTitle: string;
  studentName: string;
  status: string;
};

export const SuperAdminDashboard: FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [doubts, setDoubts] = useState<AdminDoubt[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showDoubts, setShowDoubts] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardRes, usersRes, coursesRes, doubtsRes] = await Promise.all([
          adminAPI.getSuperDashboard(),
          adminAPI.getUsers(),
          apiClient.get('/api/courses'),
          adminAPI.getDoubts(),
        ]);

        const loadedUsers = usersRes?.data?.users || [];
        const loadedCourses = coursesRes?.data?.courses || [];
        const loadedDoubts = doubtsRes?.data?.doubts || [];

        const totalStudents = loadedUsers.filter((user: AdminUser) => user.role === 'STUDENT').length;
        const totalCourseAdmins = loadedUsers.filter((user: AdminUser) => user.role === 'COURSE_ADMIN').length;
        const totalSuperAdmins = loadedUsers.filter((user: AdminUser) => user.role === 'SUPER_ADMIN').length;
        const publishedCourses = loadedCourses.filter((course: AdminCourse) => (course.status || 'DRAFT') === 'PUBLISHED').length;
        const draftCourses = loadedCourses.filter((course: AdminCourse) => !course.status || course.status === 'DRAFT').length;
        const archivedCourses = loadedCourses.filter((course: AdminCourse) => course.status === 'ARCHIVED').length;
        const unresolvedDoubts = loadedDoubts.filter((doubt: AdminDoubt) => doubt.status === 'OPEN').length;

        setUsers(loadedUsers);
        setCourses(loadedCourses);
        setDoubts(loadedDoubts);
        setSummary({
          totalUsers: loadedUsers.length,
          totalStudents,
          totalCourseAdmins,
          totalSuperAdmins,
          totalCourses: loadedCourses.length,
          publishedCourses,
          draftCourses,
          archivedCourses,
          totalEnrollments: dashboardRes?.data?.totalEnrollments ?? 0,
          activeLearnersToday: dashboardRes?.data?.activeLearnersToday ?? 0,
          unresolvedDoubts,
          totalDoubts: loadedDoubts.length,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;

  const cards = [
    {
      label: 'Total Users',
      value: summary?.totalUsers ?? 0,
      onClick: () => {
        setShowUsers(true);
        navigate('/admin/users');
      },
    },
    {
      label: 'Students',
      value: summary?.totalStudents ?? 0,
      onClick: () => setShowUsers((prev) => !prev),
    },
    {
      label: 'Course Admins',
      value: summary?.totalCourseAdmins ?? 0,
      onClick: () => setShowUsers((prev) => !prev),
    },
    {
      label: 'Courses',
      value: summary?.totalCourses ?? 0,
      onClick: () => {
        setShowCourses(true);
        navigate('/admin/courses');
      },
    },
    {
      label: 'Published',
      value: summary?.publishedCourses ?? 0,
      onClick: () => setShowCourses((prev) => !prev),
    },
    {
      label: 'Draft',
      value: summary?.draftCourses ?? 0,
      onClick: () => setShowCourses((prev) => !prev),
    },
    {
      label: 'Enrollments',
      value: summary?.totalEnrollments ?? 0,
      onClick: () => setShowCourses(true),
    },
    {
      label: 'Unresolved Doubts',
      value: summary?.unresolvedDoubts ?? 0,
      onClick: () => {
        setShowDoubts(true);
        navigate('/admin/doubts');
      },
    },
  ];

  const getCardClasses = (idx: number) => {
    const classes = [
      'border-l-blue-500 bg-blue-50',
      'border-l-purple-500 bg-purple-50',
      'border-l-cyan-500 bg-cyan-50',
      'border-l-indigo-500 bg-indigo-50',
    ];
    return classes[idx % classes.length];
  };

  const getTitleClasses = (idx: number) => {
    const classes = ['text-blue-600', 'text-purple-600', 'text-cyan-600', 'text-indigo-600'];
    return classes[idx % classes.length];
  };

  const getValueClasses = (idx: number) => {
    const classes = ['text-blue-900', 'text-purple-900', 'text-cyan-900', 'text-indigo-900'];
    return classes[idx % classes.length];
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">Super Admin Dashboard</h1>
        <p className="text-slate-600 text-lg">Platform-wide overview and governance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className={`text-4xl font-bold ${getValueClasses(idx)}`}>{card.value as any}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="shadow-lg bg-white border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-slate-900">Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span>Active learners today</span>
              <span className="font-semibold text-slate-900">{summary?.activeLearnersToday ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span>Total enrollments</span>
              <span className="font-semibold text-slate-900">{summary?.totalEnrollments ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span>Total doubts</span>
              <span className="font-semibold text-slate-900">{summary?.totalDoubts ?? 0}</span>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin/users')}>Open User Management</Button>
          </CardContent>
        </Card>

        {showUsers && (
          <Card className="shadow-lg bg-white border-l-4 border-l-cyan-500 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-slate-900">User Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">Students: <span className="font-semibold">{summary?.totalStudents ?? 0}</span></div>
                <div className="rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-900">Course Admins: <span className="font-semibold">{summary?.totalCourseAdmins ?? 0}</span></div>
                <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-900">Super Admins: <span className="font-semibold">{summary?.totalSuperAdmins ?? 0}</span></div>
              </div>
              <div className="space-y-3">
                {users.slice(0, 8).map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-3 bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-600">{user.email}</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-700">{user.role.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showCourses && (
        <Card className="shadow-lg bg-white border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="text-slate-900">Course Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-900">All Courses: <span className="font-semibold">{summary?.totalCourses ?? 0}</span></div>
              <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Published: <span className="font-semibold">{summary?.publishedCourses ?? 0}</span></div>
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">Draft: <span className="font-semibold">{summary?.draftCourses ?? 0}</span></div>
              <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-900">Archived: <span className="font-semibold">{summary?.archivedCourses ?? 0}</span></div>
            </div>
            <div className="space-y-3">
              {courses.slice(0, 8).map((course) => {
                const courseId = Number(course.id || course._id);
                return (
                  <div key={courseId} className="flex items-center justify-between rounded-lg border p-3 bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">{course.title}</div>
                      <div className="text-sm text-slate-600">{course.category || 'General'} • {course.level || 'All levels'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-700">{course.status || 'DRAFT'}</span>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/courses/${courseId}/content`)}>
                        Open Content
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showDoubts && (
        <Card className="shadow-lg bg-white border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-slate-900">Open Doubts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doubts.filter((doubt) => doubt.status === 'OPEN').slice(0, 8).map((doubt) => (
              <div key={doubt.id} className="rounded-lg border p-3 bg-slate-50">
                <div className="font-semibold text-slate-900">{doubt.title}</div>
                <div className="text-sm text-slate-600">{doubt.studentName} • {doubt.courseTitle}</div>
              </div>
            ))}
            {summary?.unresolvedDoubts === 0 && (
              <div className="text-sm text-slate-600">No unresolved doubts at the moment.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
