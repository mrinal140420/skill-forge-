import { FC, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Zap, Trophy, Target, Loader2 } from 'lucide-react';
import { useEnrollments, useProgress, useRecommendations, ProgressSummaryItem, Enrollment } from '@/hooks/useApi';

interface SkillData {
  name: string;
  score: number;
}

const PerformanceRadar: FC<{ skills: SkillData[] }> = ({ skills }) => {
  if (skills.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Target className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">Enroll in at least 3 categories to see your skills radar</p>
      </div>
    );
  }

  const SVG_SIZE = 400;
  const CENTER = SVG_SIZE / 2;
  const MAX_RADIUS = 140;
  const NUM_LEVELS = 5;
  const NUM_SKILLS = skills.length;
  const ANGLE_SLICE = (Math.PI * 2) / NUM_SKILLS;

  // Convert percentage to radius
  const getRadius = (percentage: number) => (percentage / 100) * MAX_RADIUS;

  // Get point coordinates
  const getPoint = (index: number, radius: number) => {
    const angle = ANGLE_SLICE * index - Math.PI / 2;
    const x = CENTER + radius * Math.cos(angle);
    const y = CENTER + radius * Math.sin(angle);
    return { x, y };
  };

  // Create polygon points for the skill data
  const skillPoints = skills.map((skill, i) => {
    const radius = getRadius(skill.score);
    return getPoint(i, radius);
  });

  const polygonPath = skillPoints
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <svg width={SVG_SIZE} height={SVG_SIZE} className="drop-shadow-lg">
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric circles (levels) */}
        {Array.from({ length: NUM_LEVELS }, (_, idx) => {
          const radius = (MAX_RADIUS / NUM_LEVELS) * (idx + 1);
          return (
            <circle
              key={`level-${idx}`}
              cx={CENTER}
              cy={CENTER}
              r={radius}
              fill="none"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* Skill axes */}
        {skills.map((_, idx) => {
          const point = getPoint(idx, MAX_RADIUS);
          return (
            <line
              key={`axis-${idx}`}
              x1={CENTER}
              y1={CENTER}
              x2={point.x}
              y2={point.y}
              stroke="rgba(59, 130, 246, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Skill polygon (filled) */}
        <polygon
          points={polygonPath}
          fill="rgba(59, 130, 246, 0.25)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Skill vertices (points) */}
        {skillPoints.map((point, idx) => (
          <g key={`skill-${idx}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="rgb(59, 130, 246)"
              stroke="white"
              strokeWidth="2"
              filter="url(#glow)"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Center circle */}
        <circle cx={CENTER} cy={CENTER} r="4" fill="rgb(59, 130, 246)" />

        {/* Skill labels */}
        {skills.map((skill, idx) => {
          const point = getPoint(idx, MAX_RADIUS + 35);
          return (
            <g key={`label-${idx}`}>
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold fill-current"
                fontSize="12"
              >
                {skill.name}
              </text>
              <text
                x={point.x}
                y={point.y + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-blue-500 font-semibold"
                fontSize="11"
              >
                {skill.score}%
              </text>
            </g>
          );
        })}

        {/* Level labels */}
        {Array.from({ length: NUM_LEVELS }, (_, idx) => {
          const radius = (MAX_RADIUS / NUM_LEVELS) * (idx + 1);
          const percentage = Math.round(((idx + 1) / NUM_LEVELS) * 100);
          return (
            <text
              key={`level-label-${idx}`}
              x={CENTER + radius}
              y={CENTER - 5}
              className="text-xs fill-gray-400"
              fontSize="10"
            >
              {percentage}%
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {skills.map((skill) => (
          <div key={skill.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-semibold">{skill.name}</p>
              <p className="text-xs text-gray-500">{skill.score}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PerformanceAnalytics: FC = () => {
  const { data: enrollments, isLoading: enrollLoading } = useEnrollments();
  const { data: progressData, isLoading: progressLoading } = useProgress();
  const { data: recommendations } = useRecommendations();

  const isLoading = enrollLoading || progressLoading;

  const stats = useMemo(() => {
    const summary: ProgressSummaryItem[] = progressData?.summary || [];
    const allEnrollments = (enrollments || []) as Enrollment[];
    const totalEnrollments = allEnrollments.length;
    const totalModules = summary.reduce((a: number, s: any) => a + (s.totalModules || 0), 0);
    const completedModules = summary.reduce((a: number, s: any) => a + (s.completedModules || 0), 0);
    const completedCourses = allEnrollments.filter((e) => e.progress >= 100).length;
    const avgCompletion = summary.length > 0
      ? Math.round(summary.reduce((a: number, s: any) => a + (s.completionPercentage || 0), 0) / summary.length)
      : 0;
    const totalHours = allEnrollments.reduce((a: number, e: any) =>
      a + Math.round((e.course?.duration || 0) * (e.progress || 0) / 100), 0
    );

    // Build topic performance from course categories
    const categoryMap: Record<string, { total: number; completed: number }> = {};
    for (const s of summary) {
      const cat = s.course?.category || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, completed: 0 };
      categoryMap[cat].total += s.totalModules || 0;
      categoryMap[cat].completed += s.completedModules || 0;
    }
    const topicPerformance = Object.entries(categoryMap).map(([topic, data]) => ({
      topic,
      score: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    // Build skill radar data from categories
    const radarSkills: SkillData[] = topicPerformance.map(({ topic, score }) => ({
      name: topic,
      score,
    }));

    // Compute badges & achievements
    const badges: { icon: string; label: string; description: string; earned: boolean }[] = [
      { icon: '🎯', label: 'First Enrollment', description: 'Enrolled in your first course', earned: totalEnrollments >= 1 },
      { icon: '📚', label: 'Dedicated Learner', description: 'Enrolled in 5+ courses', earned: totalEnrollments >= 5 },
      { icon: '🏆', label: 'Course Completer', description: 'Completed a course at 100%', earned: completedCourses >= 1 },
      { icon: '⚡', label: 'Module Master', description: 'Completed 10+ modules', earned: completedModules >= 10 },
      { icon: '🔥', label: 'Study Streak', description: 'Studied 20+ hours', earned: totalHours >= 20 },
      { icon: '🌟', label: 'All-Rounder', description: 'Enrolled in 3+ categories', earned: Object.keys(categoryMap).length >= 3 },
      { icon: '💎', label: 'Half Way There', description: '50% average completion', earned: avgCompletion >= 50 },
      { icon: '👑', label: 'Perfectionist', description: '100% on a course', earned: completedCourses >= 1 },
    ];

    // Dynamic improvement plan based on weakest topics
    const weakTopics = [...topicPerformance].sort((a, b) => a.score - b.score);
    const improvementPlan = totalEnrollments > 0 ? [
      { day: 'Day 1', task: weakTopics[0] ? `Review ${weakTopics[0].topic} basics (${weakTopics[0].score}% current)` : 'Review enrolled course content', status: 'pending' },
      { day: 'Day 2', task: 'Complete 3 pending modules', status: 'pending' },
      { day: 'Day 3', task: weakTopics[1] ? `Focus on ${weakTopics[1].topic} (${weakTopics[1].score}% current)` : 'Practice with examples', status: 'pending' },
      { day: 'Day 4', task: 'Revisit completed modules for reinforcement', status: 'pending' },
      { day: 'Day 5', task: 'Attempt quiz for strongest topic', status: 'pending' },
      { day: 'Day 6', task: 'Review and reinforce weak areas', status: 'pending' },
      { day: 'Day 7', task: 'Full progress review & set next goals', status: 'pending' },
    ] : [];

    return { totalEnrollments, totalModules, completedModules, completedCourses, avgCompletion, totalHours, topicPerformance, radarSkills, badges, improvementPlan };
  }, [enrollments, progressData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground">Track your learning progress and performance</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Average Completion</p>
            <p className="text-3xl font-bold">{stats.avgCompletion}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Modules Completed</p>
            <p className="text-3xl font-bold">{stats.completedModules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
            <p className="text-3xl font-bold">{stats.totalHours}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Enrolled Courses</p>
            <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Skills Radar 
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Your performance across different skill areas
          </p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PerformanceRadar skills={stats.radarSkills} />
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Topic-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topicPerformance.length > 0 ? stats.topicPerformance.map((item) => (
                <div key={item.topic}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">{item.topic}</span>
                    <span className="text-sm text-muted-foreground">{item.score}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Enroll in courses to see topic-wise performance</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempts Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <svg width="100%" height="250" viewBox="0 0 500 250" className="mt-4">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={`grid-${i}`}>
                  <line
                    x1="40"
                    y1={40 + i * 40}
                    x2="480"
                    y2={40 + i * 40}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text x="10" y={45 + i * 40} fontSize="12" fill="#999">
                    {20 - i * 5}
                  </text>
                </g>
              ))}

              {/* Axes */}
              <line x1="40" y1="200" x2="480" y2="200" stroke="#333" strokeWidth="2" />
              <line x1="40" y1="200" x2="40" y2="20" stroke="#333" strokeWidth="2" />

              {/* Y-axis label */}
              <text x="15" y="110" fontSize="12" fill="#666" textAnchor="middle">
                Score (%)
              </text>

              {/* Line curve */}
              <polyline
                points="60,140 100,100 140,120 180,80 220,110 260,70 300,90 340,60 380,85 420,45"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="3"
              />

              {/* Data points */}
              {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420].map((x, idx) => {
                const scores = [70, 85, 80, 95, 75, 100, 90, 85, 95, 100];
                const y = 200 - (scores[idx] / 100) * 180;
                return (
                  <circle
                    key={`point-${idx}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="rgb(59, 130, 246)"
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}

              {/* X-axis labels */}
              {['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 9', 'Day 11', 'Day 13'].map((label, idx) => (
                <text
                  key={label}
                  x={60 + idx * 60}
                  y="220"
                  fontSize="11"
                  fill="#666"
                  textAnchor="middle"
                >
                  {label}
                </text>
              ))}
            </svg>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Chart - Accuracy vs Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy vs Difficulty</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Each bubble represents a problem attempt
            </p>
          </CardHeader>
          <CardContent>
            <svg width="100%" height="280" viewBox="0 0 450 280" className="mt-2">
              {/* Grid */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={`grid-${i}`}>
                  <line
                    x1="50"
                    y1={50 + i * 45}
                    x2="420"
                    y2={50 + i * 45}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text x="20" y={55 + i * 45} fontSize="11" fill="#999">
                    {100 - i * 25}%
                  </text>
                </g>
              ))}

              {/* Axes */}
              <line x1="50" y1="230" x2="420" y2="230" stroke="#333" strokeWidth="2" />
              <line x1="50" y1="230" x2="50" y2="30" stroke="#333" strokeWidth="2" />

              {/* Axis labels */}
              <text x="235" y="260" fontSize="12" fill="#666" textAnchor="middle">
                Difficulty Level
              </text>
              <text x="15" y="135" fontSize="12" fill="#666" textAnchor="middle">
                Accuracy (%)
              </text>

              {/* X-axis ticks and labels */}
              {['Easy', 'Medium', 'Hard', 'Expert'].map((label, idx) => (
                <g key={`x-${label}`}>
                  <line
                    x1={80 + idx * 90}
                    y1="230"
                    x2={80 + idx * 90}
                    y2="235"
                    stroke="#333"
                  />
                  <text
                    x={80 + idx * 90}
                    y="250"
                    fontSize="11"
                    fill="#666"
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                </g>
              ))}

              {/* Data points (bubbles) */}
              {[
                { x: 80, y: 100, score: 95, size: 6 },
                { x: 100, y: 110, score: 92, size: 5 },
                { x: 75, y: 95, score: 98, size: 8 },
                { x: 170, y: 130, score: 85, size: 5 },
                { x: 190, y: 115, score: 88, size: 6 },
                { x: 160, y: 145, score: 78, size: 4 },
                { x: 180, y: 125, score: 87, size: 7 },
                { x: 280, y: 155, score: 75, size: 5 },
                { x: 310, y: 165, score: 72, size: 4 },
                { x: 270, y: 145, score: 80, size: 6 },
                { x: 380, y: 190, score: 60, size: 4 },
                { x: 410, y: 175, score: 68, size: 5 },
              ].map((point, idx) => (
                <g key={`bubble-${idx}`}>
                  <circle
                    cx={point.x}
                    cy={230 - point.y}
                    r={point.size}
                    fill={`rgba(59, 130, 246, 0.3)`}
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                  />
                  {point.size > 5 && (
                    <text
                      x={point.x}
                      y={230 - point.y + 3}
                      fontSize="10"
                      fill="#000"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {point.score}%
                    </text>
                  )}
                </g>
              ))}
            </svg>
            <div className="mt-4 text-xs text-gray-600">
              <p>
                💡 <strong>Insight:</strong> You perform better on easier problems. Focus on medium
                and hard problems to improve overall accuracy.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recommendations?.courses?.length ?? 0) > 0 ? recommendations!.courses.slice(0, 3).map((rec: any, idx: number) => {
              const colors = ['border-amber-500', 'border-blue-500', 'border-green-500'];
              return (
                <div key={rec.id || idx} className={`border-l-4 ${colors[idx % 3]} pl-3 py-2`}>
                  <p className="text-sm font-semibold">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
              );
            }) : (
              <>
                <div className="border-l-4 border-amber-500 pl-3 py-2">
                  <p className="text-sm font-semibold">Enroll in more courses</p>
                  <p className="text-xs text-muted-foreground">Get personalized recommendations</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3 py-2">
                  <p className="text-sm font-semibold">Complete current modules</p>
                  <p className="text-xs text-muted-foreground">To unlock AI-powered suggestions</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badges & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Badges & Achievements
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Unlock badges by completing learning milestones</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.badges.map((badge) => (
              <div
                key={badge.label}
                className={`flex flex-col items-center text-center p-4 rounded-lg border transition-all ${
                  badge.earned
                    ? 'bg-primary/5 border-primary/30 shadow-sm'
                    : 'bg-muted/30 border-muted opacity-50'
                }`}
              >
                <span className="text-3xl mb-2">{badge.icon}</span>
                <p className="text-sm font-semibold">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {badge.earned && (
                  <Badge variant="default" className="mt-2 text-xs">Earned</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            7-Day Improvement Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Personalized based on your weakest topics</p>
        </CardHeader>
        <CardContent>
          {stats.improvementPlan.length > 0 ? (
          <div className="space-y-3">
            {stats.improvementPlan.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-green-500'
                      : item.status === 'in-progress'
                        ? 'bg-amber-500'
                        : 'bg-muted'
                  }`}
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold">{item.day}:</span>
                  <span className="text-sm text-muted-foreground ml-2">{item.task}</span>
                </div>
                <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Enroll in courses to get a personalized improvement plan</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
