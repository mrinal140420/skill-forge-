export type AppRole = 'student' | 'instructor' | 'admin';

export function normalizeRole(rawRole?: string | null): AppRole {
  if (!rawRole) return 'student';

  const normalized = rawRole.trim().toLowerCase().replace(/^role_/, '');

  if (normalized.includes('super_admin') || normalized === 'admin') {
    return 'admin';
  }

  if (normalized.includes('course_admin') || normalized.includes('instructor')) {
    return 'instructor';
  }

  return 'student';
}

export function getRoleBasedRedirectPath(role?: string | null): string {
  switch (normalizeRole(role)) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    default:
      return '/dashboard';
  }
}