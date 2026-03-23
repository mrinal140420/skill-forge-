import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/api/apiClient';
import { doubtsAPI } from '@/api/adminAPI';
import { HelpCircle } from 'lucide-react';

export const StudentDoubts: FC = () => {
  const [searchParams] = useSearchParams();
  const prefilledCourseId = searchParams.get('courseId') || '';
  const prefilledModuleId = searchParams.get('moduleId') || '';

  const [doubts, setDoubts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    courseId: prefilledCourseId,
    moduleId: prefilledModuleId,
    title: '',
    description: '',
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [doubtsRes, coursesRes] = await Promise.all([
        doubtsAPI.getMine(),
        apiClient.get('/api/courses'),
      ]);
      setDoubts(doubtsRes.data?.doubts || []);
      setCourses(coursesRes.data?.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load doubts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await doubtsAPI.submit({
        courseId: Number(form.courseId),
        moduleId: form.moduleId || undefined,
        title: form.title,
        description: form.description,
      });
      setForm({
        courseId: prefilledCourseId,
        moduleId: prefilledModuleId,
        title: '',
        description: '',
      });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      courseId: prefilledCourseId,
      moduleId: prefilledModuleId,
    }));
  }, [prefilledCourseId, prefilledModuleId]);

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-3">
          <HelpCircle className="h-10 w-10 text-indigo-700" />
          My Doubts & Queries
        </h1>
        <p className="text-slate-600 text-lg">Submit course doubts and track replies from admins</p>
      </div>

      {error && (
        <div className="text-sm p-3 border rounded-md bg-red-50 text-red-700 border-red-200">
          {error}
        </div>
      )}

      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent border-b border-indigo-200">
          <CardTitle>Submit a New Doubt</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseId">Course ID</Label>
                <Select value={form.courseId} onValueChange={(value) => setForm((p) => ({ ...p, courseId: value }))}>
                  <SelectTrigger id="courseId" className="mt-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: any) => {
                      const courseId = String(course.id || course._id);
                      return (
                        <SelectItem key={courseId} value={courseId}>
                          {course.title} (ID: {courseId})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="moduleId">Module (optional)</Label>
                <Input
                  id="moduleId"
                  placeholder="e.g. mod_1"
                  value={form.moduleId}
                  onChange={(e) => setForm((p) => ({ ...p, moduleId: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Short summary of your doubt"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe the issue clearly, including what you tried"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Doubt'}
            </Button>
          </form>

          {courses.length > 0 && (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-muted-foreground">
              Ask doubts using the same course ids shown in the Courses page. Available courses: {courses.slice(0, 8).map((c: any) => `${c.title} (${c.id || c._id})`).join(' • ')}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent border-b border-indigo-200">
          <CardTitle>My Submitted Doubts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div>Loading doubts...</div>
          ) : doubts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No doubts submitted yet.</div>
          ) : (
            doubts.map((d: any) => (
              <div key={d.id} className="border rounded-md p-3 space-y-2 bg-slate-50/70 border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">{d.title}</div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${String(d.status).toLowerCase() === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</div>
                </div>
                <div className="text-sm text-muted-foreground">Course: {d.courseTitle || d.courseId}</div>
                <div className="text-sm">{d.description}</div>
                {d.adminReply ? (
                  <div className="text-sm p-2 rounded bg-muted">
                    <span className="font-medium">Admin Reply: </span>{d.adminReply}
                  </div>
                ) : (
                  <div className="text-xs text-amber-600">Pending admin response</div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
