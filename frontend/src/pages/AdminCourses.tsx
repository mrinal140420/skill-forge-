import { FC, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/api/apiClient';
import { adminAPI } from '@/api/adminAPI';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const AdminCourses: FC<{ scoped?: boolean }> = ({ scoped = false }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = scoped
        ? (await adminAPI.getMyCourses()).data.courses
        : (await apiClient.get('/api/courses')).data.courses;
      setCourses(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [scoped]);

  const title = useMemo(() => (scoped ? 'Assigned Course Management' : 'All Course Management'), [scoped]);

  const startEdit = (course: any) => {
    setEditingId(Number(course.id || course._id));
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      status: course.status || 'DRAFT',
      durationHours: course.durationHours,
      thumbnailUrl: course.thumbnailUrl,
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
    });
  };

  const save = async () => {
    if (!editingId) return;
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };
    await adminAPI.updateCourse(editingId, payload);
    setEditingId(null);
    await load();
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">{title}</h1>
        <p className="text-slate-600 text-lg">Manage metadata, status, and learning structure</p>
      </div>
      {loading ? (
        <div className="p-8 text-slate-600">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => {
            const id = Number(course.id || course._id);
            const isEditing = editingId === id;
            return (
              <Card key={id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all hover:scale-105 duration-300 border-l-4 border-l-indigo-500">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent border-b border-indigo-200">
                  <CardTitle className="text-indigo-900">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Title</Label>
                          <Input value={form.title || ''} onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Input value={form.status || ''} onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))} placeholder="DRAFT|PUBLISHED|ARCHIVED" />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input value={form.description || ''} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Category</Label>
                          <Input value={form.category || ''} onChange={(e) => setForm((f: any) => ({ ...f, category: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Level</Label>
                          <Input value={form.level || ''} onChange={(e) => setForm((f: any) => ({ ...f, level: e.target.value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Duration (hours)</Label>
                          <Input type="number" value={form.durationHours || 0} onChange={(e) => setForm((f: any) => ({ ...f, durationHours: Number(e.target.value) }))} />
                        </div>
                        <div>
                          <Label>Thumbnail URL</Label>
                          <Input value={form.thumbnailUrl || ''} onChange={(e) => setForm((f: any) => ({ ...f, thumbnailUrl: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <Label>Tags (comma separated)</Label>
                        <Input value={form.tags || ''} onChange={(e) => setForm((f: any) => ({ ...f, tags: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={save}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground line-clamp-3">{course.description}</div>
                      <div className="text-xs">Course ID: <span className="font-semibold">{id}</span></div>
                      <div className="text-xs">Status: <span className="font-semibold">{course.status || 'DRAFT'}</span></div>
                      <div className="text-xs">Category: {course.category} • Level: {course.level}</div>
                      <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => startEdit(course)}>Edit Course</Button>
                        <Button 
                          variant="outline" 
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                          onClick={() => navigate(scoped ? `/instructor/courses/${id}/content` : `/admin/courses/${id}/content`)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Content
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
