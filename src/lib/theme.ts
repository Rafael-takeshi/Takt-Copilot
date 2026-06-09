import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "takt.theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as Theme) || "dark";
}

export function resolveTheme(t: Theme): "light" | "dark" {
  if (t === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return t === "light" ? "light" : "dark";
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(t);
  const root = document.documentElement;
  root.classList.toggle("light", resolved === "light");
  root.classList.toggle("dark", resolved === "dark");
}

export function setStoredTheme(t: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, t);
  applyTheme(t);
  window.dispatchEvent(new Event("takt:theme-changed"));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  useEffect(() => {
    setThemeState(getStoredTheme());
    const onChange = () => setThemeState(getStoredTheme());
    window.addEventListener("takt:theme-changed", onChange);
    return () => window.removeEventListener("takt:theme-changed", onChange);
  }, []);
  const setTheme = (t: Theme) => {
    setStoredTheme(t);
    setThemeState(t);
  };
  return { theme, setTheme, resolved: resolveTheme(theme) };
}

// Inline script string used before hydration to avoid FOUC
export const THEME_INIT_SCRIPT = `
(function(){try{
  var t=localStorage.getItem('${STORAGE_KEY}')||'dark';
  var r=t;
  if(t==='system'){r=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
  var c=document.documentElement.classList;
  c.toggle('light', r==='light');
  c.toggle('dark', r==='dark');
}catch(e){}})();
`;
