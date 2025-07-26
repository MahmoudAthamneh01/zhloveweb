// i18n utility functions for ZH-Love
import type { SSRResult } from 'astro';

// Language types
export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

// Translation type
export interface TranslationData {
  [key: string]: string | TranslationData;
}

// Supported languages configuration
export const languages: Record<Language, { name: string; direction: Direction; flag: string }> = {
  ar: {
    name: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
  en: {
    name: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
};

// Default language
export const DEFAULT_LANGUAGE: Language = 'ar';

// Get language from URL path
export function getLanguageFromURL(pathname: string): Language {
  const segments = pathname.split('/').filter(Boolean);
  const lang = segments[0];
  
  if (lang && isValidLanguage(lang)) {
    return lang as Language;
  }
  
  return DEFAULT_LANGUAGE;
}

// Check if language is valid
export function isValidLanguage(lang: string): boolean {
  return Object.keys(languages).includes(lang);
}

// Get direction for language
export function getDirection(lang: Language): Direction {
  return languages[lang].direction;
}

// Get opposite language
export function getOppositeLanguage(lang: Language): Language {
  return lang === 'ar' ? 'en' : 'ar';
}

// Create alternate URL for language switching
export function createAlternateURL(currentPath: string, targetLang: Language): string {
  const segments = currentPath.split('/').filter(Boolean);
  const currentLang = segments[0];
  
  if (isValidLanguage(currentLang)) {
    segments[0] = targetLang;
  } else {
    segments.unshift(targetLang);
  }
  
  return '/' + segments.join('/');
}

// Remove language from path
export function removeLanguageFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const lang = segments[0];
  
  if (lang && isValidLanguage(lang)) {
    segments.shift();
  }
  
  return '/' + segments.join('/');
}

// Get localized path
export function getLocalizedPath(path: string, lang: Language): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path is empty, return just the language
  if (!cleanPath) {
    return `/${lang}`;
  }
  
  // If path starts with a language, replace it
  const segments = cleanPath.split('/');
  if (isValidLanguage(segments[0])) {
    segments[0] = lang;
  } else {
    segments.unshift(lang);
  }
  
  return '/' + segments.join('/');
}

// Translation loading functions
export async function loadTranslations(lang: Language, namespace: string): Promise<TranslationData> {
  try {
    const translations = await import(`../locales/${lang}/${namespace}.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}/${namespace}:`, error);
    
    // Fallback to default language if not already trying it
    if (lang !== DEFAULT_LANGUAGE) {
      try {
        const fallbackTranslations = await import(`../locales/${DEFAULT_LANGUAGE}/${namespace}.json`);
        return fallbackTranslations.default || fallbackTranslations;
      } catch (fallbackError) {
        console.error(`Failed to load fallback translations for ${DEFAULT_LANGUAGE}/${namespace}:`, fallbackError);
      }
    }
    
    return {};
  }
}

// Get nested translation value
export function getNestedTranslation(obj: TranslationData, path: string): string {
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return key if translation not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

// Translation function with interpolation
export function translateWithInterpolation(
  template: string, 
  params: Record<string, string | number> = {}
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

// Format numbers for RTL/LTR
export function formatNumber(num: number, lang: Language): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
}

// Format date for RTL/LTR
export function formatDate(date: Date, lang: Language, options?: Intl.DateTimeFormatOptions): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
}

// Format time for RTL/LTR
export function formatTime(date: Date, lang: Language = DEFAULT_LANGUAGE, options?: Intl.DateTimeFormatOptions): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
}

// Format relative time
export function formatRelativeTime(date: Date, lang: Language): string {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(diffInYears, 'year');
}

// HTML attribute helpers
export function getHTMLAttributes(lang: Language): Record<string, string> {
  return {
    lang: lang,
    dir: getDirection(lang),
  };
}

// CSS class helpers
export function getLanguageClasses(lang: Language): string {
  const direction = getDirection(lang);
  return `lang-${lang} dir-${direction} ${direction}`;
}

// Meta tags helpers
export function getLanguageMeta(lang: Language, currentPath: string): Array<{ name?: string; property?: string; content: string; href?: string; hreflang?: string; rel?: string }> {
  const alternateURL = createAlternateURL(currentPath, getOppositeLanguage(lang));
  const oppositeLang = getOppositeLanguage(lang);
  
  return [
    { name: 'language', content: lang },
    { property: 'og:locale', content: lang === 'ar' ? 'ar_SA' : 'en_US' },
    { 
      rel: 'alternate', 
      hreflang: oppositeLang, 
      href: alternateURL,
      content: alternateURL
    },
    { 
      rel: 'alternate', 
      hreflang: 'x-default', 
      href: getLocalizedPath(currentPath, DEFAULT_LANGUAGE),
      content: getLocalizedPath(currentPath, DEFAULT_LANGUAGE)
    },
  ];
}

// Validation helpers
export function isRTL(lang: Language): boolean {
  return getDirection(lang) === 'rtl';
}

export function isLTR(lang: Language): boolean {
  return getDirection(lang) === 'ltr';
}

// URL helpers for client-side navigation
export function navigateToLanguage(lang: Language, currentPath?: string): void {
  const path = currentPath || window.location.pathname;
  const newPath = getLocalizedPath(removeLanguageFromPath(path), lang);
  
  if (typeof window !== 'undefined') {
    window.location.href = newPath;
  }
}

// Browser language detection
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  
  const browserLang = navigator.language.split('-')[0];
  
  if (isValidLanguage(browserLang)) {
    return browserLang as Language;
  }
  
  return DEFAULT_LANGUAGE;
}

// Cookie helpers for language preference
export function setLanguageCookie(lang: Language): void {
  if (typeof document === 'undefined') return;
  
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  
  document.cookie = `zh-love-lang=${lang}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
}

export function getLanguageCookie(): Language | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(cookie => cookie.trim().startsWith('zh-love-lang='));
  
  if (langCookie) {
    const lang = langCookie.split('=')[1];
    return isValidLanguage(lang) ? lang as Language : null;
  }
  
  return null;
}

// Helper for Astro components
export function createI18nHelpers(lang: Language, translations: Record<string, TranslationData>) {
  return {
    lang,
    direction: getDirection(lang),
    isRTL: isRTL(lang),
    isLTR: isLTR(lang),
    htmlAttributes: getHTMLAttributes(lang),
    cssClasses: getLanguageClasses(lang),
    
    // Translation function
    t: (key: string, params?: Record<string, string | number>) => {
      const [namespace, ...keyParts] = key.split('.');
      const translationKey = keyParts.join('.');
      
      if (translations[namespace]) {
        const translation = getNestedTranslation(translations[namespace], translationKey);
        return params ? translateWithInterpolation(translation, params) : translation;
      }
      
      return key;
    },
    
    // Formatting functions
    formatNumber: (num: number) => formatNumber(num, lang),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => formatDate(date, lang, options),
    formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => formatTime(date, lang, options),
    formatRelativeTime: (date: Date) => formatRelativeTime(date, lang),
    
    // Navigation
    getLocalizedPath: (path: string) => getLocalizedPath(path, lang),
    createAlternateURL: (path: string) => createAlternateURL(path, getOppositeLanguage(lang)),
    
    // Language switching
    switchLanguage: () => getOppositeLanguage(lang),
    oppositeLang: getOppositeLanguage(lang),
    oppositeLangName: languages[getOppositeLanguage(lang)].name,
  };
}

// Export all language configurations
export { languages as supportedLanguages };
export const languageKeys = Object.keys(languages) as Language[];
export const defaultLanguage = DEFAULT_LANGUAGE; 

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} ثانية`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} دقيقة`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0 && remainingSeconds === 0) {
      return `${hours} ساعة`;
    } else if (remainingSeconds === 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}; 