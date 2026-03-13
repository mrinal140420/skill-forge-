import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCourses } from '@/hooks/useApi';
import { Search, Star, Loader2 } from 'lucide-react';
import { getProfileInitials } from '@/lib/instructorProfile';

export const Courses: FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    category: '',
    duration: '',
  });

  const { data: coursesData, isLoading } = useCourses(filters);
  const courses = Array.isArray(coursesData) ? coursesData : [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-slate-900">Explore Courses</h1>
          <p className="text-slate-600">
            Choose from 100+ curated computer science courses
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div>
            <Label htmlFor="search" className="text-slate-700">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="search"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 bg-slate-50 border-slate-300 text-slate-900"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-700">Level</Label>
            <Select value={filters.level} onValueChange={(v) => handleFilterChange('level', v)}>
              <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-700">Category</Label>
            <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
              <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dsa">DSA</SelectItem>
                <SelectItem value="dbms">DBMS</SelectItem>
                <SelectItem value="os">Operating Systems</SelectItem>
                <SelectItem value="cn">Computer Networks</SelectItem>
                <SelectItem value="oop">OOP</SelectItem>
                <SelectItem value="system-design">System Design</SelectItem>
                <SelectItem value="ml">ML Basics</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Duration</Label>
            <Select value={filters.duration} onValueChange={(v) => handleFilterChange('duration', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Any Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">0-20 hours</SelectItem>
                <SelectItem value="medium">20-40 hours</SelectItem>
                <SelectItem value="long">40+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-slate-500">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              No courses found
            </div>
          ) : (
            courses.map((course) => {
              const instructorName = course.instructor;

              return (
              <Card key={course.id} className="h-full hover:shadow-xl transition-all border-slate-200 bg-white shadow-md hover:border-blue-400 overflow-hidden group">
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 text-slate-900">{course.title}</CardTitle>
                        <div className="mt-2 flex items-center gap-3">
                          {course.instructorAvatar ? (
                            <img src={course.instructorAvatar} alt={instructorName} className="h-10 w-10 rounded-full border border-slate-200 object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                              {getProfileInitials(instructorName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{instructorName}</p>
                            {course.instructorBio && <p className="text-xs text-slate-500 line-clamp-1">{course.instructorBio}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={course.level === 'advanced' ? 'default' : 'secondary'} className="bg-blue-600">
                          {course.level}
                        </Badge>
                        <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          ID: {course.id}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-slate-900">{course.rating}</span>
                      </div>
                      <span className="text-slate-600">
                        {course.students.toLocaleString()} students
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-center bg-slate-50 p-3 rounded">
                      <div>
                        <div className="text-slate-600 text-xs">Duration</div>
                        <div className="font-semibold text-slate-900">{course.duration}h</div>
                      </div>
                      <div>
                        <div className="text-slate-600 text-xs">Modules</div>
                        <div className="font-semibold text-slate-900">{course.modules?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-600 text-xs">Category</div>
                        <div className="font-semibold text-slate-900">{course.category}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Link to={`/courses/${course.id}`}>View Course</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                        <Link to={`/doubts?courseId=${course.id}`}>Ask Doubt</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            );})
          )}
        </div>
      </div>
    </div>
  );
};
