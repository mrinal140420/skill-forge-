import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

// ===== Types =====
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  assignedInstructorId?: string;
  instructorAvatar?: string;
  instructorBio?: string;
  instructorLinkedin?: string;
  instructorGithub?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  modules: Module[];
  rating: number;
  students: number;
  category: string;
  thumbnail?: string;
  outcomes?: string[];
  prerequisites?: string[];
  tags?: string[];
  slug?: string;
}

export interface Module {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string;
  transcript?: string;
  completed: boolean;
  contentType?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  progress: number;
  enrolledAt: string;
  courseTitle: string;
  currentModuleId: string;
  status: string;
  course?: Course;
}

export interface ProgressSummaryItem {
  course: any;
  totalModules: number;
  completedModules: number;
  completionPercentage: number;
  modules: any[];
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: QuizzQuestion[];
  duration: number;
  attempts: QuizAttempt[];
}

export interface QuizzQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  answers: number[];
  completedAt: string;
}

export interface GeneratedExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface GeneratedExam {
  courseId: string;
  title: string;
  durationSeconds: number;
  generatedAt?: string;
  questions: GeneratedExamQuestion[];
}

// ===== Data Mapping Helpers =====

/**
 * Map backend CourseDTO to frontend Course type.
 * Backend fields: _id, title, slug, category, level, durationHours, rating,
 *   thumbnailUrl, description, tags, syllabusModules, prerequisites
 * Frontend expects: id, title, description, instructor, level, duration,
 *   modules[], rating, students, category, thumbnail, outcomes, prerequisites
 */
function mapCourse(raw: any): Course {
  if (!raw) return raw;
  const modules = (raw.syllabusModules || raw.modules || []).map((m: any, idx: number) => ({
    id: String(m._id || m.id || '') || `mod-${idx}`,
    title: m.title || '',
    duration: m.durationMin || m.duration || 0,
    videoUrl: m.videoUrl || '',
    transcript: m.transcript || '',
    completed: m.completed || false,
    contentType: m.contentType || 'video',
  }));
  return {
    id: String(raw._id || raw.id || ''),
    title: raw.title || '',
    description: raw.description || '',
    instructor: raw.instructor || 'SkillForge Faculty',
    assignedInstructorId: raw.assignedInstructorId ? String(raw.assignedInstructorId) : undefined,
    instructorAvatar: raw.instructorAvatar || '',
    instructorBio: raw.instructorBio || '',
    instructorLinkedin: raw.instructorLinkedin || '',
    instructorGithub: raw.instructorGithub || '',
    level: (raw.level || 'Beginner').toLowerCase() as Course['level'],
    duration: raw.durationHours || raw.duration || 0,
    modules,
    rating: raw.rating || 0,
    students: raw.students || Math.floor((raw.rating || 4) * 2800),
    category: raw.category || '',
    thumbnail: raw.thumbnailUrl || raw.thumbnail || '',
    outcomes: raw.outcomes || raw.tags || [],
    prerequisites: raw.prerequisites || [],
    tags: raw.tags || [],
    slug: raw.slug || '',
  };
}

/**
 * Map backend EnrollmentDTO to frontend Enrollment type.
 * Backend: { _id, userId, courseId: CourseDTO, status, enrolledAt }
 * Frontend expects: { id, courseId, userId, progress, enrolledAt, courseTitle, currentModuleId }
 */
function mapEnrollment(raw: any, progressMap?: Record<string, number>): Enrollment {
  const courseObj = raw.courseId || raw.course || {};
  const courseId = String(courseObj._id || courseObj.id || raw.courseId || '');
  const modules = courseObj.syllabusModules || courseObj.modules || [];
  const progress = progressMap?.[courseId] ?? 0;
  const firstModuleId = modules.length > 0 ? String(modules[0]._id || modules[0].id || '1') : '1';

  return {
    id: String(raw._id || raw.id || ''),
    courseId,
    userId: String(raw.userId || ''),
    progress: Math.round(progress),
    enrolledAt: raw.enrolledAt || new Date().toISOString(),
    courseTitle: courseObj.title || 'Unknown Course',
    currentModuleId: firstModuleId,
    status: raw.status || 'active',
    course: typeof courseObj === 'object' && courseObj.title ? mapCourse(courseObj) : undefined,
  };
}

// ===== Courses =====
export const useCourses = (filters?: any) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/courses', { params: filters });
      const rawCourses = Array.isArray(data) ? data : data?.courses || [];
      return rawCourses.map(mapCourse);
    },
    retry: 1,
  });
};

export const useCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/courses/${courseId}`);
      return mapCourse(data);
    },
    enabled: !!courseId,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const { data } = await apiClient.post('/api/courses', courseData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// ===== Enrollments =====
export const useEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      // Fetch enrollments and progress in parallel
      const [enrollRes, progressRes] = await Promise.all([
        apiClient.get('/api/enrollments/me'),
        apiClient.get('/api/progress/me').catch(() => ({ data: { summary: [] } })),
      ]);

      const rawEnrollments = enrollRes.data?.enrollments || [];
      const progressSummary: ProgressSummaryItem[] = progressRes.data?.summary || [];

      // Build progress map: courseId -> completionPercentage
      const progressMap: Record<string, number> = {};
      for (const item of progressSummary) {
        const cid = String(item.course?._id || item.course?.id || '');
        if (cid) progressMap[cid] = item.completionPercentage || 0;
      }

      return rawEnrollments.map((e: any) => mapEnrollment(e, progressMap));
    },
    retry: 1,
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await apiClient.post('/api/enrollments', { courseId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUnenrollCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { data } = await apiClient.delete(`/api/enrollments/${enrollmentId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// ===== Progress =====
export const useProgress = (courseId?: string) => {
  return useQuery({
    queryKey: ['progress', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/progress/me');
      const summary: ProgressSummaryItem[] = data?.summary || [];
      if (courseId) {
        return summary.find(
          (s: any) => String(s.course?._id || s.course?.id) === courseId
        ) || null;
      }
      return data;
    },
    enabled: true,
  });
};

export const useMarkModuleComplete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (progressData: { courseId: string; moduleId: string }) => {
      const { data } = await apiClient.post('/api/progress/complete', progressData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};

// ===== Quizzes =====
export const useQuiz = (quizId: string | undefined) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/quizzes/${quizId}`);
      return data as Quiz;
    },
    enabled: !!quizId,
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attemptData: any) => {
      const { data } = await apiClient.post('/api/quiz/submit', attemptData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};

export const useCourseExam = (courseId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['course-exam', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/exams/${courseId}`);
      return data as GeneratedExam;
    },
    enabled: !!courseId && enabled,
    retry: 1,
  });
};

export const useGenerateCourseExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await apiClient.post(`/api/exams/generate/${courseId}`);
      return data as GeneratedExam;
    },
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['course-exam', courseId] });
    },
  });
};

// ===== Course Content (Topics / Lessons) =====
export interface LessonResource {
  id: number;
  title: string;
  resourceType: string;
  contentUrl?: string;
  orderIndex: number;
}

export interface CourseLesson {
  id: number;
  title: string;
  description?: string;
  contentType: string;
  orderIndex: number;
  duration?: number;
  resources?: LessonResource[];
}

export interface CourseTopic {
  id: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons?: CourseLesson[];
}

export const useCourseTopics = (courseId?: string | number, enabled = true) => {
  return useQuery({
    queryKey: ['course-topics', String(courseId)],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/content/courses/${courseId}/topics`);
      return (data?.topics || []) as CourseTopic[];
    },
    enabled: !!courseId && enabled,
    retry: 1,
  });
};

// ===== Recommendations =====
export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/recommendations/me');
      // Strict ML response mapping only (no synthetic/hardcoded fallback labels)
      const rawCourses = Array.isArray(data?.recommendedCourses) ? data.recommendedCourses : [];
      const courses = rawCourses
        .filter((r: any) => typeof r?.courseId !== 'undefined' && typeof r?.title === 'string' && r.title.trim().length > 0)
        .map((r: any) => ({
          id: String(r.courseId),
          title: r.title.trim(),
          reason: typeof r.reason === 'string' ? r.reason : '',
          category: typeof r.category === 'string' && r.category.trim().length > 0 ? r.category : 'General',
          score: Number(r.score || 0),
        }));
      const topics = Array.isArray(data?.recommendedTopics) ? data.recommendedTopics : [];
      return { courses, topics };
    },
    retry: 1,
  });
};

// ===== ML Analytics =====
export const useMLAnalytics = () => {
  return useQuery({
    queryKey: ['ml-analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/analytics/me');
      return data;
    },
    retry: 1,
  });
};

// ===== SkillBot Chat =====
export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: async (payload: { message: string; courseId?: string | number; topic?: string }) => {
      const body: any = { message: payload.message };
      if (payload.courseId) body.courseId = Number(payload.courseId);
      const { data } = await apiClient.post('/api/skillbot/chat', body);
      return data;
    },
  });
};
