import defaultLogo from '@/assets/skillforge-logo.svg';

export const PLATFORM_BRANDING_STORAGE_KEY = 'platform-branding-settings';
export const PLATFORM_BRANDING_UPDATED_EVENT = 'skillforge:branding-updated';

export type PlatformBranding = {
  platformName: string;
  logo: string;
  supportEmail: string;
};

export const DEFAULT_PLATFORM_BRANDING: PlatformBranding = {
  platformName: 'SkillForge',
  logo: defaultLogo,
  supportEmail: 'support@skillforge.com',
};

export function readPlatformBranding(): PlatformBranding {
  try {
    const raw = localStorage.getItem(PLATFORM_BRANDING_STORAGE_KEY);
    return raw
      ? { ...DEFAULT_PLATFORM_BRANDING, ...JSON.parse(raw) }
      : DEFAULT_PLATFORM_BRANDING;
  } catch {
    return DEFAULT_PLATFORM_BRANDING;
  }
}

export function writePlatformBranding(branding: PlatformBranding) {
  localStorage.setItem(PLATFORM_BRANDING_STORAGE_KEY, JSON.stringify(branding));
  window.dispatchEvent(new Event(PLATFORM_BRANDING_UPDATED_EVENT));
}
