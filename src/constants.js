export const PHASES = [
  {
    key: "inhale",
    label: "Вдох",
    cue: "Вдох",
    description: "Мягко наполняйте лёгкие воздухом снизу вверх.",
    color: "var(--phase-inhale)",
  },
  {
    key: "holdFull",
    label: "Задержка сверху",
    cue: "Держим",
    description: "Задержите дыхание, сохраняя расслабленные плечи.",
    color: "var(--phase-hold-full)",
  },
  {
    key: "exhale",
    label: "Выдох",
    cue: "Выдох",
    description: "Плавно отпускайте воздух и опускайте плечи.",
    color: "var(--phase-exhale)",
  },
  {
    key: "holdEmpty",
    label: "Пауза снизу",
    cue: "Пауза",
    description: "Насладитесь короткой паузой перед новым вдохом.",
    color: "var(--phase-hold-empty)",
  },
];

export const DEFAULT_SETTINGS = {
  durations: {
    inhale: 4,
    holdFull: 4,
    exhale: 4,
    holdEmpty: 4,
  },
  goalCycles: 0,
  autoStart: true,
  vibrateOnChange: true,
};

export const SETTINGS_STORAGE_KEY = "square-breathing-preferences";
