import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  BookOpen,
  Zap,
  Shield,
  Award,
  Flame,
  Network,
  Database,
  Brain,
  Cloud,
  Code,
  GitBranch,
  BarChart3,
} from 'lucide-react';

const categories = [
  { icon: Code, label: 'DSA', description: 'Data Structures & Algorithms' },
  { icon: Database, label: 'DBMS', description: 'Database Management' },
  { icon: Network, label: 'OS', description: 'Operating Systems' },
  { icon: GitBranch, label: 'CN', description: 'Computer Networks' },
  { icon: Brain, label: 'OOP', description: 'Object Oriented Programming' },
  { icon: Zap, label: 'System Design', description: 'Large Scale Architecture' },
  { icon: Brain, label: 'ML Basics', description: 'Machine Learning Fundamentals' },
  { icon: Cloud, label: 'Cloud', description: 'Cloud Fundamentals' },
];

const features = [
  {
    icon: Brain,
    title: 'Adaptive Learning',
    description: 'AI-powered curriculum that adapts to your learning pace',
  },
  {
    icon: Zap,
    title: 'AI Tutor',
    description: 'Ask questions and get instant explanations',
  },
  {
    icon: Shield,
    title: 'Proctored Exams',
    description: 'Secure testing with advanced proctoring technology',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Track your progress with detailed insights',
  },
  {
    icon: Award,
    title: 'Certificates',
    description: 'Earn industry-recognized certificates',
  },
  {
    icon: Flame,
    title: 'Streaks',
    description: 'Stay motivated with learning streaks',
  },
];

const steps = [
  { number: 1, title: 'Enroll Course', description: 'Choose from 100+ curated courses' },
  { number: 2, title: 'Complete Modules', description: 'Learn at your own pace' },
  { number: 3, title: 'Proctored Exam', description: 'Test your knowledge' },
  { number: 4, title: 'Get Certificate', description: 'Earn recognition' },
];

const featuredCourses = [
  {
    title: 'Advanced DSA',
    rating: 4.9,
    students: 12500,
    duration: 40,
    level: 'Advanced',
    modules: 12,
  },
  {
    title: 'System Design Masterclass',
    rating: 4.8,
    students: 8900,
    duration: 35,
    level: 'Advanced',
    modules: 10,
  },
  {
    title: 'DBMS Fundamentals',
    rating: 4.7,
    students: 5600,
    duration: 25,
    level: 'Intermediate',
    modules: 8,
  },
];

const BarChart = ({ className }: { className?: string }) => (
  <BarChart3 className={className} />
);

export const Landing: FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section - Professional Blue Gradient */}
      <section className="w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-32 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">✨ New: AI-Powered Learning</Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-200 via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            Master CS Fundamentals
          </h1>
          <p className="text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto">
            AI-driven adaptive learning, expert-guided modules, proctored exams, and industry-recognized certifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-black gap-2 shadow-lg hover:shadow-xl transition-all">
                Explore Courses
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-blue-400 text-black-100 hover:bg-blue-500/10">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">How SkillForge Works</h2>
          <p className="text-center text-slate-600 mb-12">Get started in 4 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md">
                      {step.number}
                    </div>
                    <h3 className="font-semibold mb-2 text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-16 -right-8 text-blue-400">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-100 to-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">CSE Course Categories</h2>
          <p className="text-center text-slate-600 mb-12">Explore topics across computer science</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card key={cat.label} className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-400 bg-white border-slate-200">
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-1 text-slate-900">{cat.label}</h3>
                    <p className="text-xs text-slate-600">{cat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Carousel */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900">Featured Courses</h2>
              <p className="text-slate-600 mt-2">Handpicked courses to accelerate your career</p>
            </div>
            <Link to="/courses">
              <Button variant="ghost" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course, idx) => (
              <Card key={idx} className="shadow-md hover:shadow-xl transition-all border-slate-200 overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <CardHeader>
                  <CardTitle className="text-slate-900">{course.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-blue-600">{course.rating}★</span>
                    <span className="text-slate-600">({course.students.toLocaleString()})</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-slate-900">{course.duration}h</div>
                      <div className="text-xs text-slate-500">Duration</div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{course.level}</div>
                      <div className="text-xs text-slate-500">Level</div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{course.modules}</div>
                      <div className="text-xs text-slate-500">Modules</div>
                    </div>
                  </div>
                  <Link to="/courses" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Learn More</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">Why SkillForge?</h2>
          <p className="text-center text-slate-600 mb-12">Comprehensive tools for your learning journey</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-slate-200 shadow-md hover:shadow-lg transition-all hover:border-blue-400 bg-white">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to start learning?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 50,000+ students mastering computer science
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl">Get Started Free</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-blue-400 text-black-100 hover:bg-blue-500/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
