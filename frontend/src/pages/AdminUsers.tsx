import { FC, useEffect, useRef, useState } from 'react';
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
import { Copy, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import apiClient from '@/api/apiClient';
import { adminAPI } from '@/api/adminAPI';

export const AdminUsers: FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create instructor form
  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: '',
  });

  // Create student form
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
  });

  // Assign course form
  const [assignForm, setAssignForm] = useState({
    userId: '',
    courseId: '',
  });

  // Created instructor credentials (to display)
  const [createdInstructor, setCreatedInstructor] = useState<any>(null);
  const [createdStudent, setCreatedStudent] = useState<any>(null);
  const createdInstructorRef = useRef<HTMLDivElement | null>(null);
  const createdStudentRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes] = await Promise.all([
        adminAPI.getUsers(),
        apiClient.get('/api/courses'),
      ]);
      setUsers(usersRes.data.users || []);
      setCourses(coursesRes.data.courses || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminAPI.createInstructor(instructorForm.name, instructorForm.email);
      setCreatedInstructor(res.data);
      setCreatedStudent(null);
      setInstructorForm({ name: '', email: '' });
      setSuccess(`Instructor created! Share credentials securely.`);
      requestAnimationFrame(() => {
        createdInstructorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      // Reload users list
      setTimeout(() => load(), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create instructor');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await adminAPI.deleteUser(userId);
        setSuccess('User deleted successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await load();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminAPI.createStudent(studentForm.name, studentForm.email);
      setCreatedStudent(res.data);
      setCreatedInstructor(null);
      setStudentForm({ name: '', email: '' });
      setSuccess(`Student created! Share credentials securely.`);
      requestAnimationFrame(() => {
        createdStudentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      // Reload users list
      setTimeout(() => load(), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create student');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (key: string) => {
    setShowCredentials((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      if (!assignForm.userId || !assignForm.courseId) {
        setError('Please select both an instructor and a course');
        setAssigning(false);
        return;
      }

      await adminAPI.assignCourseAdmin(Number(assignForm.userId), Number(assignForm.courseId));
      setAssignForm({ userId: '', courseId: '' });
      setSuccess('Course assigned successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign course');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">User & Instructor Management</h1>
        <p className="text-slate-600 text-lg">Create instructors, assign courses, and manage users</p>
      </div>

      {error && (
        <div className="sticky top-4 z-50 p-4 border rounded-xl bg-red-50 text-red-700 border-red-200 text-base font-medium shadow-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="sticky top-4 z-50 p-4 border rounded-xl bg-green-50 text-green-700 border-green-200 text-base font-medium shadow-lg">
          ✓ {success}
        </div>
      )}

      {/* Create New Instructor Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50 hover:shadow-xl transition-all border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b border-blue-200">
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">Create New Instructor (Course Admin)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleCreateInstructor}>
            <div>
              <Label htmlFor="instrName" className="text-sm">Instructor Name</Label>
              <Input
                id="instrName"
                placeholder="e.g., John Doe"
                value={instructorForm.name}
                onChange={(e) => setInstructorForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="instrEmail" className="text-sm">Email Address</Label>
              <Input
                id="instrEmail"
                type="email"
                placeholder="e.g., john@skillforge.com"
                value={instructorForm.email}
                onChange={(e) => setInstructorForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Instructor'
                )}
              </Button>
            </div>
          </form>
          <div className="mt-3 text-xs text-muted-foreground">
            💡 Password will be auto-generated and displayed below. Share it securely with the instructor.
          </div>
        </CardContent>
      </Card>

      {/* Display Generated Credentials */}
      {createdInstructor && (
        <div ref={createdInstructorRef}>
        <Card className="border-green-200 bg-green-50 scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-green-900">✓ Instructor Created Successfully</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <div className="font-semibold">{createdInstructor.name}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email (Login ID)</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 px-3 py-2 rounded text-sm flex-1">
                    {createdInstructor.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdInstructor.email, 'instructorEmail')}
                  >
                    {copiedId === 'instructorEmail' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 px-3 py-2 rounded text-sm flex-1 tracking-wider">
                    {showCredentials.instructorPassword
                      ? createdInstructor.generatedPassword
                      : '••••••••••••'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePasswordVisibility('instructorPassword')}
                  >
                    {showCredentials.instructorPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdInstructor.generatedPassword, 'instructorPassword')}
                  >
                    {copiedId === 'instructorPassword' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Next Steps:</strong>
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                <li>Share these credentials securely with the instructor</li>
                <li>Instructor logs in with email: {createdInstructor.email}</li>
                <li>Instructor should change password on first login</li>
                <li>Assign courses to this instructor below</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={() => setCreatedInstructor(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Create Student Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-green-50 hover:shadow-xl transition-all border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent border-b border-green-200">
          <CardTitle className="text-2xl bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">Create New Student</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleCreateStudent}>
            <div>
              <Label htmlFor="studName" className="text-sm">Student Name</Label>
              <Input
                id="studName"
                placeholder="e.g., Alice Johnson"
                value={studentForm.name}
                onChange={(e) => setStudentForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studEmail" className="text-sm">Email Address</Label>
              <Input
                id="studEmail"
                type="email"
                placeholder="e.g., alice@skillforge.com"
                value={studentForm.email}
                onChange={(e) => setStudentForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="submit"
                disabled={creating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Student'
                )}
              </Button>
            </div>
          </form>
          <div className="mt-3 text-xs text-muted-foreground">
            💡 Password will be auto-generated and displayed below. Share it securely with the student.
          </div>
        </CardContent>
      </Card>

      {/* Display Generated Student Credentials */}
      {createdStudent && (
        <div ref={createdStudentRef}>
        <Card className="border-green-200 bg-green-50 scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-green-900">✓ Student Created Successfully</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <div className="font-semibold">{createdStudent.name}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email (Login ID)</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 px-3 py-2 rounded text-sm flex-1">
                    {createdStudent.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdStudent.email, 'studentEmail')}
                  >
                    {copiedId === 'studentEmail' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-100 px-3 py-2 rounded text-sm flex-1 tracking-wider">
                    {showCredentials.studentPassword
                      ? createdStudent.generatedPassword
                      : '••••••••••••'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePasswordVisibility('studentPassword')}
                  >
                    {showCredentials.studentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdStudent.generatedPassword, 'studentPassword')}
                  >
                    {copiedId === 'studentPassword' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Next Steps:</strong>
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                <li>Share these credentials securely with the student</li>
                <li>Student logs in with email: {createdStudent.email}</li>
                <li>Student should change password on first login</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={() => setCreatedStudent(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
        </div>
      )}
      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-purple-900">Assign Course to Instructor</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleAssignCourse}>
            <div>
              <Label htmlFor="assignUser" className="text-sm">Select Instructor</Label>
              <Select value={assignForm.userId} onValueChange={(value) => setAssignForm((f) => ({ ...f, userId: value }))}>
                <SelectTrigger id="assignUser" className="mt-1">
                  <SelectValue placeholder="Select instructor..." />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(u => u.role === 'COURSE_ADMIN')
                    .map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name} (ID: {u.id})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignCourse" className="text-sm">Select Course</Label>
              <Select value={assignForm.courseId} onValueChange={(value) => setAssignForm((f) => ({ ...f, courseId: value }))}>
                <SelectTrigger id="assignCourse" className="mt-1">
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id || c._id} value={String(c.id || c._id)}>
                      {c.title} (ID: {c.id || c._id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="submit"
                disabled={assigning}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Course'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* All Users List */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-slate-50 hover:shadow-xl transition-all border-l-4 border-l-slate-500">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b border-slate-200">
          <CardTitle className="text-2xl text-slate-900">All Users in System ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6 text-slate-600">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-slate-600">
              No users found
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-sm text-slate-600">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg">
                      ID: {u.id}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : u.role === 'COURSE_ADMIN'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {u.role === 'SUPER_ADMIN' ? '👑 Admin' : u.role === 'COURSE_ADMIN' ? '👨‍🏫 Instructor' : '👤 Student'}
                    </span>
                    {u.role !== 'SUPER_ADMIN' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                        onClick={async () => {
                          if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
                          try {
                            if (u.role === 'COURSE_ADMIN') {
                              await adminAPI.deleteInstructor(u.id);
                              setSuccess('Instructor deleted successfully!');
                            } else {
                              await adminAPI.deleteUser(u.id);
                              setSuccess('User deleted successfully!');
                            }
                            await load();
                          } catch (err: any) {
                            setError(err.response?.data?.error || 'Failed to delete user');
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
