import { readScopedSettings } from './settingsStorage';

export type StoredInstructorProfile = {
  name: string;
  profilePhoto: string;
  bio: string;
  linkedin: string;
  github: string;
};

const emptyProfile: StoredInstructorProfile = {
  name: '',
  profilePhoto: '',
  bio: '',
  linkedin: '',
  github: '',
};

export const getInstructorSettingsStorageKey = (instructorId?: string | number | null) => `instructor-settings:${instructorId || 'guest'}`;

export const readInstructorProfile = (instructorId?: string | number | null) => {
  if (!instructorId) {
    return null;
  }

  return readScopedSettings(getInstructorSettingsStorageKey(instructorId), emptyProfile);
};

export const getProfileInitials = (name?: string) => {
  if (!name) {
    return '?';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || '?';
};

export const normalizeExternalUrl = (value?: string) => {
  if (!value) {
    return '';
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};