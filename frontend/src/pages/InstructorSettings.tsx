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
import { getInstructorSettingsStorageKey } from '@/lib/instructorProfile';
import apiClient from '@/api/apiClient';

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
};

const checkboxClassName = 'h-4 w-4 rounded border-slate-300';

const sanitizeInstructorSettings = (value: InstructorSettingsState): InstructorSettingsState => ({
  name: value.name,
  profilePhoto: value.profilePhoto,
  bio: value.bio,
  linkedin: value.linkedin,
  github: value.github,
  defaultCourseVisibility: value.defaultCourseVisibility,
  defaultQuizPassingPercentage: value.defaultQuizPassingPercentage,
  defaultQuizTimeLimit: value.defaultQuizTimeLimit,
  allowQuizRetakes: value.allowQuizRetakes,
  notifyEnrollmentInApp: value.notifyEnrollmentInApp,
  notifyEnrollmentEmail: value.notifyEnrollmentEmail,
  notifyDoubtInApp: value.notifyDoubtInApp,
  notifyDoubtEmail: value.notifyDoubtEmail,
  notifyAssignmentInApp: value.notifyAssignmentInApp,
  notifyAssignmentEmail: value.notifyAssignmentEmail,
  notifyReviewInApp: value.notifyReviewInApp,
  notifyReviewEmail: value.notifyReviewEmail,
});

export const InstructorSettingsPage: FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const storageKey = getInstructorSettingsStorageKey(user?.id);
  const defaultSettings: InstructorSettingsState = useMemo(() => ({
    name: user?.name || '',
    profilePhoto: user?.avatar || '',
    bio: user?.bio || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
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
  }), [user]);

  const [settings, setSettings] = useState<InstructorSettingsState>(() => sanitizeInstructorSettings(readScopedSettings(storageKey, defaultSettings)));
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const saveSettings = async () => {
    writeScopedSettings(storageKey, settings);
    setSaving(true);
    setMessage('');

    try {
      const { data } = await apiClient.put('/api/auth/me', {
        name: settings.name,
        email: user?.email,
        avatar: settings.profilePhoto,
        bio: settings.bio,
        linkedin: settings.linkedin,
        github: settings.github,
      });

      setUser({
        ...data,
        role: user?.role || data.role,
      });
      setMessage('Instructor profile saved successfully.');
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'Failed to save instructor profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSettings((current) => ({ ...current, profilePhoto: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage('All password fields are required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New password and confirmation must match.');
      return;
    }

    setChangingPassword(true);
    setMessage('');
    try {
      const { data } = await apiClient.post('/api/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage(data?.message || 'Password changed successfully.');
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
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
        <TabsList className="grid grid-cols-4 w-full max-w-4xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="teaching">Teaching Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
              <Button onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
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
              <Button onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Teaching Defaults'}</Button>
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
              <Button onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Notification Settings'}</Button>
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
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
                <Button variant="outline" onClick={logoutAllSessions}>Logout From All Sessions</Button>
              </div>
              <div className="text-sm text-slate-600">Last login: <span className="font-medium">{user?.lastActivityAt ? new Date(user.lastActivityAt).toLocaleString() : 'Not available'}</span></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
