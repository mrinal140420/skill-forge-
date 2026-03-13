import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/api/adminAPI';

export const SuperAdminDashboard: FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminAPI.getSuperDashboard();
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;

  const cards = [
    ['Total Users', summary?.totalUsers ?? 0],
    ['Students', summary?.totalStudents ?? 0],
    ['Course Admins', summary?.totalCourseAdmins ?? 0],
    ['Courses', summary?.totalCourses ?? 0],
    ['Published', summary?.publishedCourses ?? 0],
    ['Draft', summary?.draftCourses ?? 0],
    ['Enrollments', summary?.totalEnrollments ?? 0],
    ['Unresolved Doubts', summary?.unresolvedDoubts ?? 0],
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
        {cards.map(([label, value], idx) => (
          <Card key={label} className={`border-l-4 shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 ${getCardClasses(idx)}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-semibold ${getTitleClasses(idx)}`}>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getValueClasses(idx)}`}>{value as any}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
