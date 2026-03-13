import { FC, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { readScopedSettings, writeScopedSettings } from '@/lib/settingsStorage';
import { DEFAULT_PLATFORM_BRANDING, PLATFORM_BRANDING_STORAGE_KEY, writePlatformBranding } from '@/lib/platformBranding';
import { useAuthStore } from '@/stores/authStore';

type AdminSettingsState = {
  platformName: string;
  logo: string;
  supportEmail: string;
  maintenanceMode: boolean;
  defaultRole: 'student';
  allowInstructorAccounts: boolean;
  allowInstructorCourseCreation: boolean;
  defaultCourseStatus: 'DRAFT' | 'PUBLISHED';
  allowInstructorDirectPublish: boolean;
  maxModulesPerCourse: number;
  allowedResourceFileTypes: string;
  notifyNewUserRegistration: boolean;
  notifyNewCourseCreated: boolean;
  notifyIssueEscalation: boolean;
  mlServiceUrl: string;
  googleOAuthEnabled: boolean;
  githubOAuthEnabled: boolean;
};

const checkboxClassName = 'h-4 w-4 rounded border-slate-300';

export const AdminSettingsPage: FC = () => {
  const user = useAuthStore((state) => state.user);
  const storageKey = PLATFORM_BRANDING_STORAGE_KEY;
  const defaultSettings: AdminSettingsState = useMemo(() => ({
    platformName: DEFAULT_PLATFORM_BRANDING.platformName,
    logo: DEFAULT_PLATFORM_BRANDING.logo,
    supportEmail: DEFAULT_PLATFORM_BRANDING.supportEmail,
    maintenanceMode: false,
    defaultRole: 'student',
    allowInstructorAccounts: true,
    allowInstructorCourseCreation: true,
    defaultCourseStatus: 'DRAFT',
    allowInstructorDirectPublish: false,
    maxModulesPerCourse: 20,
    allowedResourceFileTypes: 'PDF, PPT, ZIP',
    notifyNewUserRegistration: true,
    notifyNewCourseCreated: true,
    notifyIssueEscalation: true,
    mlServiceUrl: 'http://localhost:8000',
    googleOAuthEnabled: true,
    githubOAuthEnabled: true,
  }), []);

  const [settings, setSettings] = useState<AdminSettingsState>(() => readScopedSettings(storageKey, defaultSettings));
  const [message, setMessage] = useState('');

  const saveSettings = () => {
    writeScopedSettings(storageKey, settings);
    writePlatformBranding({
      platformName: settings.platformName,
      logo: settings.logo,
      supportEmail: settings.supportEmail,
    });
    setMessage('Super admin settings saved locally.');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSettings((current) => ({ ...current, logo: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">Super Admin Settings</h1>
        <p className="text-slate-600 text-lg">Control platform behavior separately from student and instructor settings.</p>
        {message && <p className="text-sm text-blue-700 mt-2">{message}</p>}
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-5xl">
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>General LMS information and maintenance controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input value={settings.platformName} onChange={(e) => setSettings((current) => ({ ...current, platformName: e.target.value }))} />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input value={settings.supportEmail} onChange={(e) => setSettings((current) => ({ ...current, supportEmail: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                  <Label>Logo Upload</Label>
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                  <Input placeholder="Or paste logo URL" value={settings.logo} onChange={(e) => setSettings((current) => ({ ...current, logo: e.target.value }))} />
                </div>
                <div>
                  {settings.logo ? <img src={settings.logo} alt="Platform logo preview" className="h-24 w-24 rounded-2xl object-contain bg-slate-950 p-2 shadow-md border border-slate-200" /> : <div className="h-20 w-20 rounded-xl border bg-slate-100 flex items-center justify-center text-xs text-slate-500">No logo</div>}
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input className={checkboxClassName} type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings((current) => ({ ...current, maintenanceMode: e.target.checked }))} />
                Maintenance Mode
              </label>
              <Button onClick={saveSettings}>Save Platform Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User & Role Settings</CardTitle>
              <CardDescription>Control defaults and instructor permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Default Role for New Users</Label>
                <Select value={settings.defaultRole} onValueChange={(value: 'student') => setSettings((current) => ({ ...current, defaultRole: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input className={checkboxClassName} type="checkbox" checked={settings.allowInstructorAccounts} onChange={(e) => setSettings((current) => ({ ...current, allowInstructorAccounts: e.target.checked }))} />
                Allow Instructor Accounts
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input className={checkboxClassName} type="checkbox" checked={settings.allowInstructorCourseCreation} onChange={(e) => setSettings((current) => ({ ...current, allowInstructorCourseCreation: e.target.checked }))} />
                Allow Instructor Course Creation
              </label>
              <Button onClick={saveSettings}>Save User & Role Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>Global defaults and publishing rules for courses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Course Status</Label>
                  <Select value={settings.defaultCourseStatus} onValueChange={(value: 'DRAFT' | 'PUBLISHED') => setSettings((current) => ({ ...current, defaultCourseStatus: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max Modules Per Course</Label>
                  <Input type="number" min={1} value={settings.maxModulesPerCourse} onChange={(e) => setSettings((current) => ({ ...current, maxModulesPerCourse: Number(e.target.value) }))} />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input className={checkboxClassName} type="checkbox" checked={settings.allowInstructorDirectPublish} onChange={(e) => setSettings((current) => ({ ...current, allowInstructorDirectPublish: e.target.checked }))} />
                Allow Instructors To Publish Courses Directly
              </label>
              <div>
                <Label>Allowed Resource File Types</Label>
                <Input value={settings.allowedResourceFileTypes} onChange={(e) => setSettings((current) => ({ ...current, allowedResourceFileTypes: e.target.value }))} placeholder="PDF, PPT, ZIP" />
              </div>
              <Button onClick={saveSettings}>Save Course Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose which platform events notify super admins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 text-sm"><input className={checkboxClassName} type="checkbox" checked={settings.notifyNewUserRegistration} onChange={(e) => setSettings((current) => ({ ...current, notifyNewUserRegistration: e.target.checked }))} />New User Registration</label>
              <label className="flex items-center gap-3 text-sm"><input className={checkboxClassName} type="checkbox" checked={settings.notifyNewCourseCreated} onChange={(e) => setSettings((current) => ({ ...current, notifyNewCourseCreated: e.target.checked }))} />New Course Created</label>
              <label className="flex items-center gap-3 text-sm"><input className={checkboxClassName} type="checkbox" checked={settings.notifyIssueEscalation} onChange={(e) => setSettings((current) => ({ ...current, notifyIssueEscalation: e.target.checked }))} />Reported Issue / Doubt Escalation</label>
              <Button onClick={saveSettings}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Minimal platform integration controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>ML Service URL</Label>
                <Input value={settings.mlServiceUrl} onChange={(e) => setSettings((current) => ({ ...current, mlServiceUrl: e.target.value }))} />
              </div>
              <label className="flex items-center gap-3 text-sm"><input className={checkboxClassName} type="checkbox" checked={settings.googleOAuthEnabled} onChange={(e) => setSettings((current) => ({ ...current, googleOAuthEnabled: e.target.checked }))} />Google OAuth Enabled</label>
              <label className="flex items-center gap-3 text-sm"><input className={checkboxClassName} type="checkbox" checked={settings.githubOAuthEnabled} onChange={(e) => setSettings((current) => ({ ...current, githubOAuthEnabled: e.target.checked }))} />GitHub OAuth Enabled</label>
              <Button onClick={saveSettings}>Save Integration Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
