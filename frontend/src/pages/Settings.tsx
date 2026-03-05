import { FC, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { useEnrollments, useProgress } from '@/hooks/useApi';
import { ChevronLeft, ChevronRight, Flame, Settings } from 'lucide-react';

export const SettingsPage: FC = () => {
  const user = useAuthStore((state) => state.user);
  const { data: enrollments } = useEnrollments();
  const { data: progressData } = useProgress();
  const [streakWeek, setStreakWeek] = useState(0);

  const stats = useMemo(() => {
    const summary = progressData?.summary || [];
    const completedCourses = summary.filter((s: any) => s.completionPercentage >= 100).length;
    const totalModulesCompleted = summary.reduce((acc: number, s: any) => acc + (s.completedModules || 0), 0);
    // Approximate learning days from completed modules (assume ~2 modules per active day)
    const learningDays = Math.max(totalModulesCompleted, enrollments?.length || 0);
    // Current streak: approximate from active enrollments
    const activeCount = enrollments?.filter((e: any) => e.status === 'active').length || 0;
    return { completedCourses, totalModulesCompleted, learningDays, activeCount };
  }, [enrollments, progressData]);

  const streaks = Array.from({ length: 12 }, (_, i) => ({
    week: i,
    days: Array.from({ length: 7 }, (_, d) => ({
      day: d,
      // Use a deterministic pattern based on enrollment count instead of random
      completed: d < (stats.activeCount > 0 ? Math.min(7, stats.activeCount + 2) : 0),
    })),
  }));

  const currentWeek = streaks[streakWeek];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Change Password</Label>
                <Input id="password" type="password" placeholder="Enter new password" />
              </div>

              <div className="space-y-2">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Member Since</span>
                <span className="font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Status</span>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Subscription</span>
                <Badge variant="secondary">Free Plan</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Email notifications for new courses</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Remind me to continue learning</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Weekly performance digest</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Show streak notifications</span>
                </label>
              </div>

              <Button className="mt-4">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks Board */}
        <TabsContent value="streaks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Learning Streaks
                  </CardTitle>
                  <CardDescription>Your consistent learning history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Streak Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Active Courses</p>
                    <p className="text-4xl font-bold text-orange-500 mb-1">{stats.activeCount}</p>
                    <p className="text-xs text-muted-foreground">currently enrolled</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Completed Courses</p>
                    <p className="text-4xl font-bold text-orange-500 mb-1">{stats.completedCourses}</p>
                    <p className="text-xs text-muted-foreground">courses finished</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Modules Completed</p>
                    <p className="text-4xl font-bold mb-1">{stats.totalModulesCompleted}</p>
                    <p className="text-xs text-muted-foreground">all time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Streak Board */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {new Date(2024, streakWeek).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStreakWeek(Math.max(0, streakWeek - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStreakWeek(Math.min(11, streakWeek + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {currentWeek?.days.map((day) => (
                      <div key={day.day} className="text-center">
                        <div
                          className={`h-12 w-12 rounded-lg mx-auto flex items-center justify-center text-2xl mb-1 ${
                            day.completed
                              ? 'bg-orange-500/20 text-orange-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {day.completed ? '🔥' : '🔒'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.day]}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Streak Tips */}
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">💡 Tips to Maintain Your Streak</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Learn at least 30 minutes each day</li>
                    <li>✓ Complete at least one module or quiz daily</li>
                    <li>✓ Set reminders for consistent learning time</li>
                    <li>✓ Don't skip more than one day</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
