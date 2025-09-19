import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Settings2 } from "lucide-react";

import BreathingVisualizer from "./components/BreathingVisualizer";
import SettingsDrawer from "./components/SettingsDrawer";
import { DEFAULT_SETTINGS, PHASES, SETTINGS_STORAGE_KEY } from "./constants";
import { useTelegramTheme } from "./hooks/useTelegramTheme";

const TICK_RATE = 50; // milliseconds

function loadSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      durations: {
        ...DEFAULT_SETTINGS.durations,
        ...(parsed?.durations ?? {}),
      },
    };
  } catch (error) {
    console.warn("Не удалось разобрать сохранённые настройки", error);
    return DEFAULT_SETTINGS;
  }
}

const formatTime = (seconds) => {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

function App() {
  useTelegramTheme();

  const [settings, setSettings] = useState(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);

  const stateRef = useRef({
    running: false,
    phaseIndex: 0,
    phaseElapsed: 0,
    completedCycles: 0,
  });

  const autoStartRef = useRef(false);

  const durations = useMemo(
    () => ({ ...settings.durations }),
    [settings.durations]
  );

  const totalCycleDuration = useMemo(
    () =>
      PHASES.reduce(
        (acc, phase) => acc + (Number(durations[phase.key]) || 0),
        0
      ),
    [durations]
  );

  const currentPhase = PHASES[phaseIndex];
  const currentDuration = Number(durations[currentPhase.key]) || 0;
  const phaseProgress = currentDuration
    ? Math.min(phaseElapsed / currentDuration, 1)
    : 1;

  const cycleProgress = (phaseIndex + phaseProgress) / PHASES.length;
  const sessionProgress = settings.goalCycles
    ? Math.min((completedCycles + cycleProgress) / settings.goalCycles, 1)
    : cycleProgress;

  const totalElapsedSeconds = useMemo(() => {
    const elapsedInCurrentCycle = PHASES.slice(0, phaseIndex).reduce(
      (acc, phase) => acc + (Number(durations[phase.key]) || 0),
      phaseElapsed
    );
    return completedCycles * totalCycleDuration + elapsedInCurrentCycle;
  }, [completedCycles, durations, phaseElapsed, phaseIndex, totalCycleDuration]);

  const remainingSeconds = Math.max(0, currentDuration - phaseElapsed);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  useEffect(() => {
    if (!autoStartRef.current && settings.autoStart) {
      autoStartRef.current = true;
      setRunning(true);
      stateRef.current.running = true;
    }
  }, [settings.autoStart]);

  useEffect(() => {
    stateRef.current.running = running;
  }, [running]);

  useEffect(() => {
    stateRef.current.phaseIndex = phaseIndex;
  }, [phaseIndex]);

  useEffect(() => {
    stateRef.current.phaseElapsed = phaseElapsed;
  }, [phaseElapsed]);

  useEffect(() => {
    stateRef.current.completedCycles = completedCycles;
  }, [completedCycles]);

  const triggerHaptics = useCallback(() => {
    if (!settings.vibrateOnChange) {
      return;
    }
    const telegram = window.Telegram?.WebApp;
    if (telegram?.HapticFeedback?.impactOccurred) {
      telegram.HapticFeedback.impactOccurred("soft");
    } else if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  }, [settings.vibrateOnChange]);

  const handlePhaseAdvance = useCallback(
    (carry = 0) => {
      const current = stateRef.current.phaseIndex;
      const nextIndex = (current + 1) % PHASES.length;
      const completedCycle = nextIndex === 0;

      triggerHaptics();

      stateRef.current.phaseIndex = nextIndex;
      setPhaseIndex(nextIndex);

      if (completedCycle) {
        const updatedCycles = stateRef.current.completedCycles + 1;
        stateRef.current.completedCycles = updatedCycles;
        setCompletedCycles(updatedCycles);

        if (settings.goalCycles && updatedCycles >= settings.goalCycles) {
          stateRef.current.running = false;
          setRunning(false);
        }
      }

      stateRef.current.phaseElapsed = carry;
      setPhaseElapsed(carry);
    },
    [settings.goalCycles, triggerHaptics]
  );

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const interval = setInterval(() => {
      const current = stateRef.current;
      const activePhase = PHASES[current.phaseIndex];
      const duration = Number(durations[activePhase.key]) || 0;

      if (!current.running) {
        return;
      }

      if (duration === 0) {
        handlePhaseAdvance(current.phaseElapsed);
        return;
      }

      const increment = TICK_RATE / 1000;
      const nextElapsed = current.phaseElapsed + increment;

      if (nextElapsed >= duration) {
        const overflow = nextElapsed - duration;
        handlePhaseAdvance(overflow);
      } else {
        stateRef.current.phaseElapsed = nextElapsed;
        setPhaseElapsed(nextElapsed);
      }
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [durations, handlePhaseAdvance, running]);

  const toggleRunning = useCallback(() => {
    setRunning((prev) => {
      const next = !prev;
      stateRef.current.running = next;
      if (next && settings.goalCycles && stateRef.current.completedCycles >= settings.goalCycles) {
        stateRef.current.completedCycles = 0;
        stateRef.current.phaseIndex = 0;
        stateRef.current.phaseElapsed = 0;
        setCompletedCycles(0);
        setPhaseIndex(0);
        setPhaseElapsed(0);
      }
      return next;
    });
  }, [settings.goalCycles]);

  const resetSession = useCallback(() => {
    stateRef.current = {
      running: false,
      phaseIndex: 0,
      phaseElapsed: 0,
      completedCycles: 0,
    };
    setRunning(false);
    setPhaseIndex(0);
    setPhaseElapsed(0);
    setCompletedCycles(0);
  }, []);

  const handleSettingsSave = useCallback((draft) => {
    setSettings((prev) => ({
      ...prev,
      ...draft,
      durations: {
        ...prev.durations,
        ...draft.durations,
      },
    }));
  }, []);

  const goalLabel = settings.goalCycles
    ? `${completedCycles} / ${settings.goalCycles}`
    : `${completedCycles}`;

  return (
    <div className="app-shell">
      <div className="app-card">
        <header className="app-card__header">
          <div className="badge">Метод квадратного дыхания 4-4-4-4</div>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 size={18} />
            <span>Настройки</span>
          </button>
        </header>

        <main className="app-card__content">
          <section className="visual-section">
            <BreathingVisualizer
              phases={PHASES}
              phaseIndex={phaseIndex}
              progress={phaseProgress}
              cycleProgress={sessionProgress}
              durations={durations}
            />
            <div className="phase-details" key={currentPhase.key}>
              <span className="phase-details__eyebrow">Сейчас</span>
              <h1 className="phase-details__title">{currentPhase.label}</h1>
              <p className="phase-details__description">{currentPhase.description}</p>
              <div className="phase-details__timer">
                <div className="phase-details__time-number">
                  {remainingSeconds > 6
                    ? Math.ceil(remainingSeconds)
                    : remainingSeconds.toFixed(1)}
                </div>
                <span>сек.</span>
              </div>
            </div>
          </section>

          <section className="control-section">
            <div className="control-grid">
              <div className="control-grid__primary">
                <div className="control-grid__buttons">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={toggleRunning}
                  >
                    {running ? <Pause size={18} /> : <Play size={18} />}
                    <span>{running ? "Пауза" : "Старт"}</span>
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={resetSession}
                  >
                    <RotateCcw size={18} />
                    <span>Сбросить</span>
                  </button>
                </div>
                <div className="control-grid__stats">
                  <div className="stat-card">
                    <span className="stat-card__label">Цель циклов</span>
                    <span className="stat-card__value">{settings.goalCycles ? settings.goalCycles : "∞"}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Выполнено</span>
                    <span className="stat-card__value">{goalLabel}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Время в практике</span>
                    <span className="stat-card__value">{formatTime(totalElapsedSeconds)}</span>
                  </div>
                </div>
              </div>

              <div className="control-grid__timeline">
                <span className="timeline__title">Шаги цикла</span>
                <ul className="timeline__list">
                  {PHASES.map((phase, index) => {
                    const duration = Number(durations[phase.key]) || 0;
                    const stepProgress =
                      index < phaseIndex
                        ? 1
                        : index > phaseIndex
                        ? 0
                        : phaseProgress;

                    return (
                      <li key={phase.key} className="timeline__item">
                        <div className="timeline__item-header">
                          <span className="timeline__item-name">{phase.label}</span>
                          <span className="timeline__item-duration">{duration.toFixed(0)} с</span>
                        </div>
                        <div className="timeline__bar">
                          <div
                            className="timeline__bar-fill"
                            style={{
                              width: `${Math.max(stepProgress * 100, 4)}%`,
                              background: phase.color,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  );
}

export default App;
