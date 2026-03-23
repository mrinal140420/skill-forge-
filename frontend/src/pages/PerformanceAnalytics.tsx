import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Zap, Trophy, Loader2 } from 'lucide-react';
import { useMLAnalytics, useRecommendations } from '@/hooks/useApi';

interface SkillData {
  name: string;
  score: number;
}

interface TrendPoint {
  x: number;
  y: number;
  label: string;
  score: number;
}

const RADAR_FALLBACK_AXES = ['Concepts', 'Practice', 'Accuracy', 'Consistency', 'Speed'];

const toDisplayLabel = (name: string) => name
  .replace(/_/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (char) => char.toUpperCase());

const PerformanceRadar: FC<{ skills: SkillData[] }> = ({ skills }) => {
  const normalizedSkills: SkillData[] = skills
    .slice(0, 5)
    .map((skill) => ({
      name: toDisplayLabel(skill.name),
      score: Math.max(0, Math.min(100, Number(skill.score || 0))),
    }));

  const fallbackScore = normalizedSkills.length
    ? Math.round(normalizedSkills.reduce((acc, item) => acc + item.score, 0) / normalizedSkills.length)
    : 0;

  while (normalizedSkills.length < 5) {
    const fallbackName = RADAR_FALLBACK_AXES[normalizedSkills.length];
    normalizedSkills.push({ name: fallbackName, score: fallbackScore });
  }

  const svgSize = 360;
  const center = svgSize / 2;
  const maxRadius = 120;
  const slices = (Math.PI * 2) / normalizedSkills.length;

  const pointFor = (index: number, score: number) => {
    const angle = slices * index - Math.PI / 2;
    const radius = (Math.max(0, Math.min(100, score)) / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const polygonPoints = normalizedSkills.map((skill, index) => {
    const point = pointFor(index, skill.score);
    return `${point.x},${point.y}`;
  }).join(' ');

  const gridPolygonPoints = (level: number) => normalizedSkills.map((_, index) => {
    const point = pointFor(index, level);
    return `${point.x},${point.y}`;
  }).join(' ');

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <svg width={svgSize} height={svgSize} className="drop-shadow-sm">
        {[20, 40, 60, 80, 100].map((level) => (
          <polygon
            key={level}
            points={gridPolygonPoints(level)}
            fill="none"
            stroke="rgba(148,163,184,0.3)"
            strokeDasharray="4 4"
          />
        ))}

        {normalizedSkills.map((_, index) => {
          const angle = slices * index - Math.PI / 2;
          return (
            <line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke="rgba(148,163,184,0.35)"
            />
          );
        })}

        <polygon points={polygonPoints} fill="rgba(59,130,246,0.25)" stroke="rgb(59,130,246)" strokeWidth="2" />

        {normalizedSkills.map((skill, index) => {
          const point = pointFor(index, skill.score);
          const labelAngle = slices * index - Math.PI / 2;
          const labelX = center + (maxRadius + 28) * Math.cos(labelAngle);
          const labelY = center + (maxRadius + 28) * Math.sin(labelAngle);

          return (
            <g key={`node-${skill.name}-${index}`}>
              <circle cx={point.x} cy={point.y} r="4" fill="rgb(59,130,246)" />
              <text x={labelX} y={labelY} textAnchor="middle" className="text-xs fill-current" fontSize="11">
                {skill.name}
              </text>
            </g>
          );
        })}
      </svg>

      {!skills.length && (
        <p className="text-sm text-muted-foreground -mt-2">No analytics yet, showing default pentagon view.</p>
      )}
    </div>
  );
};

export const PerformanceAnalytics: FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = useMLAnalytics();
  const { data: recommendations } = useRecommendations();

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const radarSkills: SkillData[] = analytics?.radarSkills || [];
  const topicPerformance = analytics?.topicPerformance || [];
  const attemptTrend = analytics?.attemptTrend || [];
  const accuracyVsDifficulty = analytics?.accuracyVsDifficulty || [];
  const badges = analytics?.badges || [];
  const improvementPlan = analytics?.improvementPlan || [];
  const insights: string[] = analytics?.insights || [];

  const lineWidth = 440;
  const lineHeight = 170;
  const linePath: TrendPoint[] = attemptTrend.map((item: any, index: number) => {
    const x = 20 + (attemptTrend.length > 1 ? (index * lineWidth) / (attemptTrend.length - 1) : lineWidth / 2);
    const score = Math.max(0, Math.min(100, Number(item.score || 0)));
    const y = 20 + lineHeight - (score / 100) * lineHeight;
    return { x, y, label: item.label || `Point ${index + 1}`, score };
  });

  const polylinePoints = linePath.map((point: TrendPoint) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">Performance Analytics</h1>
        <p className="text-slate-600 text-lg">ML-generated insights from your enrolled courses, progress, and attempts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground mb-1">Average Completion</p><p className="text-3xl font-bold">{overview.avgCompletion || 0}%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground mb-1">Modules Completed</p><p className="text-3xl font-bold">{overview.modulesCompleted || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground mb-1">Total Hours</p><p className="text-3xl font-bold">{overview.totalHours || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground mb-1">Enrolled Courses</p><p className="text-3xl font-bold">{overview.enrolledCourses || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-blue-500" />Skills Radar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <PerformanceRadar skills={radarSkills} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Topic-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topicPerformance.length ? topicPerformance.map((item: any) => (
                <div key={item.topic}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold">{item.topic}</span>
                    <span className="text-sm text-muted-foreground">{item.score}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">No topic data available.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempts Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {linePath.length ? (
              <svg width="100%" height="240" viewBox="0 0 500 240" className="mt-2">
                {[0, 25, 50, 75, 100].map((label) => {
                  const y = 20 + lineHeight - (label / 100) * lineHeight;
                  return (
                    <g key={`y-${label}`}>
                      <line x1="20" y1={y} x2="480" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                      <text x="4" y={y + 4} fontSize="10" fill="#94a3b8">{label}</text>
                    </g>
                  );
                })}
                <polyline points={polylinePoints} fill="none" stroke="rgb(59,130,246)" strokeWidth="3" />
                {linePath.map((point: TrendPoint, index: number) => (
                  <g key={`point-${index}`}>
                    <circle cx={point.x} cy={point.y} r="4" fill="rgb(59,130,246)" stroke="white" strokeWidth="2" />
                    <text x={point.x} y="220" fontSize="10" fill="#64748b" textAnchor="middle">{point.label}</text>
                  </g>
                ))}
              </svg>
            ) : (
              <p className="text-sm text-muted-foreground">No attempts yet to draw trend.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Accuracy vs Difficulty</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accuracyVsDifficulty.length ? accuracyVsDifficulty.map((point: any, index: number) => (
                <div key={`${point.course}-${index}`} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{point.course}</p>
                    <Badge variant="secondary">{point.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Accuracy: {point.accuracy}% • Attempts: {point.attempts}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No accuracy points available yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(recommendations?.courses?.length ?? 0) > 0 ? recommendations!.courses.slice(0, 3).map((rec: any, index: number) => (
              <div key={`${rec.id}-${index}`} className="border-l-4 border-primary pl-3 py-2">
                <p className="text-sm font-semibold">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No recommendations yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" />Badges & Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.length ? badges.map((badge: any) => (
              <div
                key={badge.label}
                className={`flex flex-col items-center text-center p-4 rounded-lg border ${badge.earned ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-muted opacity-60'}`}
              >
                <span className="text-3xl mb-2">{badge.icon}</span>
                <p className="text-sm font-semibold">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {badge.earned && <Badge className="mt-2 text-xs">Earned</Badge>}
              </div>
            )) : <p className="text-sm text-muted-foreground">No badge data available.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />7-Day Improvement Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {improvementPlan.length ? (
            <div className="space-y-3">
              {improvementPlan.map((item: any, index: number) => (
                <div key={`${item.day}-${index}`} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.status === 'completed' ? 'bg-green-500' : item.status === 'in-progress' ? 'bg-amber-500' : 'bg-muted'}`} />
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{item.day}:</span>
                    <span className="text-sm text-muted-foreground ml-2">{item.task}</span>
                  </div>
                  <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>{item.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No improvement plan available yet.</p>
          )}
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <Card>
          <CardHeader><CardTitle>ML Insights</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, index) => (
              <p key={`insight-${index}`} className="text-sm text-muted-foreground">• {insight}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
