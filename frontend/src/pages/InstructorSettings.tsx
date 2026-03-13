import { FC, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { readScopedSettings, writeScopedSettings } from '@/lib/settingsStorage';

type InstructorSettingsState = {
  name: string;
  profilePhoto: string;
  bio: string;
  linkedin: string;
  github: string;
  defaultCourseVisibility: 'DRAFT' | 'PUBLISHED';
  defaultQuizPassingPercentage: number;
  defaultQuizTimeLimit: number;
  allowQuizRetakes: boolean;
  notifyEnrollmentInApp: boolean;
  notifyEnrollmentEmail: boolean;
  notifyDoubtInApp: boolean;
  notifyDoubtEmail: boolean;
  notifyAssignmentInApp: boolean;
  notifyAssignmentEmail: boolean;
  notifyReviewInApp: boolean;
  notifyReviewEmail: boolean;
  theme: 'light' | 'dark';
  defaultDashboardPage: 'dashboard' | 'courses' | 'doubts';
};

const checkboxClassName = 'h-4 w-4 rounded border-slate-300';

export const InstructorSettingsPage: FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const storageKey = `instructor-settings:${user?.id || 'guest'}`;
  const defaultSettings: InstructorSettingsState = useMemo(() => ({
    name: user?.name || '',
    profilePhoto: user?.avatar || '',
    bio: '',
    linkedin: '',
    github: '',
    defaultCourseVisibility: 'DRAFT',
    defaultQuizPassingPercentage: 60,
    defaultQuizTimeLimit: 30,
    allowQuizRetakes: true,
    notifyEnrollmentInApp: true,
    notifyEnrollmentEmail: true,
    notifyDoubtInApp: true,
    notifyDoubtEmail: true,
    notifyAssignmentInApp: true,
    notifyAssignmentEmail: false,
    notifyReviewInApp: true,
    notifyReviewEmail: true,
    theme: 'light',
    defaultDashboardPage: 'dashboard',
  }), [user]);

  const [settings, setSettings] = useState<InstructorSettingsState>(() => readScopedSettings(storageKey, defaultSettings));
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  const saveSettings = () => {
    writeScopedSettings(storageKey, settings);
    if (user) {
      setUser({ ...user, name: settings.name, avatar: settings.profilePhoto || user.avatar });
    }
    setMessage('Instructor settings saved locally.');
  };

  const handleProfilePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSettings((current) => ({ ...current, profilePhoto: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const handleChangePassword = () => {
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New password and confirmation must match.');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setMessage('Password change is prepared in UI. Connect a backend endpoint to persist it.');
  };

  const logoutAllSessions = () => {
    localStorage.removeItem('auth-store');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">Instructor Settings</h1>
        <p className="text-slate-600 text-lg">Manage your teaching profile and defaults without touching student settings.</p>
        {message && <p className="text-sm text-purple-700 mt-2">{message}</p>}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="teaching">Teaching Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Basic instructor identity shown on courses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={settings.name} onChange={(e) => setSettings((current) => ({ ...current, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} readOnly className="bg-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <Input type="file" accept="image/*" onChange={handleProfilePhotoUpload} />
                  <Input placeholder="Or paste image URL" value={settings.profilePhoto} onChange={(e) => setSettings((current) => ({ ...current, profilePhoto: e.target.value }))} />
                </div>
                <div>
                  {settings.profilePhoto ? <img src={settings.profilePhoto} alt="Profile preview" className="h-28 w-28 rounded-xl object-cover border" /> : <div className="h-28 w-28 rounded-xl border bg-slate-100 flex items-center justify-center text-sm text-slate-500">No photo</div>}
                </div>
              </div>
              <div>
                <Label>Bio / About</Label>
                <Textarea value={settings.bio} onChange={(e) => setSettings((current) => ({ ...current, bio: e.target.value }))} placeholder="Tell students about your teaching background..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>LinkedIn</Label>
                  <Input value={settings.linkedin} onChange={(e) => setSettings((current) => ({ ...current, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <Label>GitHub</Label>
                  <Input value={settings.github} onChange={(e) => setSettings((current) => ({ ...current, github: e.target.value }))} placeholder="https://github.com/..." />
                </div>
              </div>
              <Button onClick={saveSettings}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teaching">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Preferences</CardTitle>
              <CardDescription>Set defaults used when you create courses and quizzes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Default Course Visibility</Label>
                <Select value={settings.defaultCourseVisibility} onValueChange={(value: 'DRAFT' | 'PUBLISHED') => setSettings((current) => ({ ...current, defaultCourseVisibility: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Default Quiz Passing %</Label>
                  <Input type="number" min={0} max={100} value={settings.defaultQuizPassingPercentage} onChange={(e) => setSettings((current) => ({ ...current, defaultQuizPassingPercentage: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Default Quiz Time Limit</Label>
                  <Input type="number" min={1} value={settings.defaultQuizTimeLimit} onChange={(e) => setSettings((current) => ({ ...current, defaultQuizTimeLimit: Number(e.target.value) }))} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 text-sm">
                    <input className={checkboxClassName} type="checkbox" checked={settings.allowQuizRetakes} onChange={(e) => setSettings((current) => ({ ...current, allowQuizRetakes: e.target.checked }))} />
                    Allow Quiz Retakes
                  </label>
                </div>
              </div>
              <Button onClick={saveSettings}>Save Teaching Defaults</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose which instructor alerts you receive in-app or by email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ['New student enrollment', 'notifyEnrollmentInApp', 'notifyEnrollmentEmail'],
                ['New doubt/question', 'notifyDoubtInApp', 'notifyDoubtEmail'],
                ['Assignment submission', 'notifyAssignmentInApp', 'notifyAssignmentEmail'],
                ['Course review/feedback', 'notifyReviewInApp', 'notifyReviewEmail'],
              ].map(([label, inAppKey, emailKey]) => (
                <div key={label} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border rounded-lg p-3 bg-white">
                  <span className="font-medium text-sm">{label}</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input className={checkboxClassName} type="checkbox" checked={Boolean(settings[inAppKey as keyof InstructorSettingsState])} onChange={(e) => setSettings((current) => ({ ...current, [inAppKey]: e.target.checked }))} />
                    In-app
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input className={checkboxClassName} type="checkbox" checked={Boolean(settings[emailKey as keyof InstructorSettingsState])} onChange={(e) => setSettings((current) => ({ ...current, [emailKey]: e.target.checked }))} />
                    Email
                  </label>
                </div>
              ))}
              <Button onClick={saveSettings}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Basic account security for your instructor account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((current) => ({ ...current, currentPassword: e.target.value }))} />
                <Input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((current) => ({ ...current, newPassword: e.target.value }))} />
                <Input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((current) => ({ ...current, confirmPassword: e.target.value }))} />
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleChangePassword}>Change Password</Button>
                <Button variant="outline" onClick={logoutAllSessions}>Logout From All Sessions</Button>
              </div>
              <div className="text-sm text-slate-600">Last login: <span className="font-medium">{user?.lastActivityAt ? new Date(user.lastActivityAt).toLocaleString() : 'Not available'}</span></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Very small UI preferences for your instructor workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={settings.theme} onValueChange={(value: 'light' | 'dark') => setSettings((current) => ({ ...current, theme: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Dashboard Page</Label>
                  <Select value={settings.defaultDashboardPage} onValueChange={(value: 'dashboard' | 'courses' | 'doubts') => setSettings((current) => ({ ...current, defaultDashboardPage: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="courses">My Courses</SelectItem>
                      <SelectItem value="doubts">Student Doubts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={saveSettings}>Save Appearance</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
