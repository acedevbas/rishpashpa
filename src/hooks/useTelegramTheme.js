import { useEffect } from "react";

const FALLBACK_THEME = {
  background: "#04070f",
  text: "#f4f6fb",
  hint: "#a3adc2",
  accent: "#5b8def",
  secondaryBg: "rgba(12, 20, 41, 0.7)",
};

export function useTelegramTheme() {
  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (!telegram) {
      const root = document.documentElement;
      root.style.setProperty("--tg-bg-color", FALLBACK_THEME.background);
      root.style.setProperty("--tg-text-color", FALLBACK_THEME.text);
      root.style.setProperty("--tg-hint-color", FALLBACK_THEME.hint);
      root.style.setProperty("--tg-accent-color", FALLBACK_THEME.accent);
      root.style.setProperty("--tg-surface-color", FALLBACK_THEME.secondaryBg);
      return undefined;
    }

    const applyTheme = (params = telegram.themeParams) => {
      const root = document.documentElement;
      root.style.setProperty("--tg-bg-color", params.bg_color || FALLBACK_THEME.background);
      root.style.setProperty("--tg-text-color", params.text_color || FALLBACK_THEME.text);
      root.style.setProperty("--tg-hint-color", params.hint_color || FALLBACK_THEME.hint);
      root.style.setProperty("--tg-accent-color", params.button_color || FALLBACK_THEME.accent);
      root.style.setProperty(
        "--tg-surface-color",
        params.secondary_bg_color || FALLBACK_THEME.secondaryBg
      );
    };

    telegram.ready?.();
    telegram.expand?.();
    applyTheme();

    const handleThemeChange = () => applyTheme();
    telegram.onEvent?.("themeChanged", handleThemeChange);

    return () => {
      telegram.offEvent?.("themeChanged", handleThemeChange);
    };
  }, []);
}
