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

function normalizeLogo(logo?: string | null): string {
  if (!logo) return DEFAULT_PLATFORM_BRANDING.logo;

  const trimmed = logo.trim();
  if (!trimmed) return DEFAULT_PLATFORM_BRANDING.logo;

  const isAllowed =
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:') ||
    trimmed.endsWith('.svg') ||
    trimmed.endsWith('.png') ||
    trimmed.endsWith('.jpg') ||
    trimmed.endsWith('.jpeg') ||
    trimmed.endsWith('.webp');

  return isAllowed ? trimmed : DEFAULT_PLATFORM_BRANDING.logo;
}

function normalizeBranding(branding: Partial<PlatformBranding>): PlatformBranding {
  return {
    platformName: (branding.platformName || DEFAULT_PLATFORM_BRANDING.platformName).trim() || DEFAULT_PLATFORM_BRANDING.platformName,
    supportEmail: (branding.supportEmail || DEFAULT_PLATFORM_BRANDING.supportEmail).trim() || DEFAULT_PLATFORM_BRANDING.supportEmail,
    logo: normalizeLogo(branding.logo),
  };
}

export function readPlatformBranding(): PlatformBranding {
  try {
    const raw = localStorage.getItem(PLATFORM_BRANDING_STORAGE_KEY);
    if (!raw) return DEFAULT_PLATFORM_BRANDING;

    const parsed = JSON.parse(raw) as Partial<PlatformBranding>;
    return normalizeBranding(parsed);
  } catch {
    return DEFAULT_PLATFORM_BRANDING;
  }
}

export function writePlatformBranding(branding: PlatformBranding) {
  const normalized = normalizeBranding(branding);
  localStorage.setItem(PLATFORM_BRANDING_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(PLATFORM_BRANDING_UPDATED_EVENT));
}
