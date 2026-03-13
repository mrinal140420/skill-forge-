import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/api/adminAPI';

export const CourseAdminDashboard: FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminAPI.getCourseAdminDashboard();
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const cards = [
    ['Assigned Courses', summary?.assignedCourses ?? 0],
    ['Enrolled Students', summary?.enrolledStudents ?? 0],
    ['Average Progress', `${summary?.averageProgress ?? 0}%`],
    ['Pending Doubts', summary?.pendingDoubts ?? 0],
    ['Quiz Attempts', summary?.quizAttempts ?? 0],
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
        {cards.map(([label, value], idx) => (
          <Card key={label} className={`border-l-4 shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 ${getCardClasses(idx)}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-semibold ${getTitleClasses(idx)}`}>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getValueClasses(idx)}`}>{value as any}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
