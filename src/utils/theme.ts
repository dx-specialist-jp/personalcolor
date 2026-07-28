const THEME_STORAGE_KEY = 'personalcolor.theme';
type Theme = 'light' | 'dark';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/** 初回描画前に呼び出し、保存済みのテーマ(なければOS設定)を即座に適用してちらつきを防ぐ */
export function initTheme(): void {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  applyTheme(saved ?? (systemPrefersDark() ? 'dark' : 'light'));
}

export function toggleTheme(): void {
  const isDark = document.documentElement.classList.contains('dark');
  const next: Theme = isDark ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark');
}
