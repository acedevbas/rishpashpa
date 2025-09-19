import { useEffect, useMemo, useState } from "react";
import { Link2, SlidersHorizontal, ToggleLeft, ToggleRight, Unlink2, X } from "lucide-react";

import { DEFAULT_SETTINGS, PHASES } from "../constants";

const areDurationsSynced = (durations) => {
  const values = PHASES.map((phase) => Number(durations?.[phase.key]) || DEFAULT_SETTINGS.durations[phase.key]);
  return values.every((value) => value === values[0]);
};

function SettingsDrawer({ open, onClose, settings, onSave }) {
  const [draft, setDraft] = useState(settings);
  const [linkDurations, setLinkDurations] = useState(() => areDurationsSynced(settings.durations));

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraft(settings);
    setLinkDurations(areDurationsSynced(settings.durations));
  }, [open, settings]);

  const limitCycles = draft.goalCycles > 0;

  const durationFields = useMemo(() => {
    if (linkDurations) {
      const value = Number(draft.durations[PHASES[0].key]) || DEFAULT_SETTINGS.durations[PHASES[0].key];
      return [
        {
          key: PHASES[0].key,
          label: "Все шаги",
          value,
        },
      ];
    }

    return PHASES.map((phase) => ({
      key: phase.key,
      label: phase.label,
      value: Number(draft.durations[phase.key]) || DEFAULT_SETTINGS.durations[phase.key],
    }));
  }, [draft.durations, linkDurations]);

  const handleDurationChange = (targetKey, nextValue) => {
    const normalized = Math.max(1, Math.min(20, Number(nextValue)));
    setDraft((prev) => {
      const updatedDurations = { ...prev.durations };
      if (linkDurations) {
        PHASES.forEach((phase) => {
          updatedDurations[phase.key] = normalized;
        });
      } else {
        updatedDurations[targetKey] = normalized;
      }
      return {
        ...prev,
        durations: updatedDurations,
      };
    });
  };

  const handleGoalChange = (nextValue) => {
    const parsed = Math.max(1, Math.min(30, Math.round(nextValue)));
    setDraft((prev) => ({
      ...prev,
      goalCycles: parsed,
    }));
  };

  const toggleCycleLimit = () => {
    setDraft((prev) => ({
      ...prev,
      goalCycles: prev.goalCycles ? 0 : Math.max(4, prev.goalCycles || 8),
    }));
  };

  const toggleSetting = (key) => {
    setDraft((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    const sanitized = {
      ...draft,
      durations: { ...draft.durations },
    };

    if (linkDurations) {
      const value = Number(sanitized.durations[PHASES[0].key]) || DEFAULT_SETTINGS.durations[PHASES[0].key];
      PHASES.forEach((phase) => {
        sanitized.durations[phase.key] = value;
      });
    }

    if (!limitCycles) {
      sanitized.goalCycles = 0;
    }

    onSave(sanitized);
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
    setLinkDurations(true);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="settings" role="presentation">
      <div className="settings__backdrop" onClick={onClose} />
      <div className="settings__panel" role="dialog" aria-modal="true">
        <header className="settings__header">
          <div className="settings__title">
            <SlidersHorizontal size={18} />
            <span>Настройки практики</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </header>

        <div className="settings__content">
          <section className="settings__section">
            <div className="settings__section-header">
              <h3>Длительность шага</h3>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setLinkDurations((prev) => !prev)}
              >
                {linkDurations ? <Link2 size={16} /> : <Unlink2 size={16} />}
                <span>{linkDurations ? "Связаны" : "Независимо"}</span>
              </button>
            </div>
            <p className="settings__hint">
              {linkDurations
                ? "Изменение ползунка применится ко всему квадрату."
                : "Настройте длительность каждого шага отдельно."
              }
            </p>
            <div className="settings__sliders">
              {durationFields.map((field) => (
                <label key={field.key} className="slider-field">
                  <div className="slider-field__header">
                    <span>{field.label}</span>
                    <span>{field.value.toFixed(1)} с</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={field.value}
                    onChange={(event) => handleDurationChange(field.key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="settings__section">
            <div className="settings__section-header">
              <h3>Циклы</h3>
              <button
                type="button"
                className="ghost-button"
                onClick={toggleCycleLimit}
              >
                {limitCycles ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                <span>{limitCycles ? "Ограничено" : "Безлимит"}</span>
              </button>
            </div>
            {limitCycles && (
              <div className="settings__goal">
                <label className="slider-field">
                  <div className="slider-field__header">
                    <span>Количество циклов</span>
                    <span>{draft.goalCycles}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={draft.goalCycles}
                    onChange={(event) => handleGoalChange(event.target.value)}
                  />
                </label>
              </div>
            )}
          </section>

          <section className="settings__section">
            <h3>Управление</h3>
            <div className="toggle-row">
              <div>
                <span className="toggle-row__title">Автоматический старт</span>
                <p className="toggle-row__description">Запускать практику сразу после открытия приложения.</p>
              </div>
              <button
                type="button"
                className={`switch ${draft.autoStart ? "is-on" : ""}`}
                role="switch"
                aria-checked={draft.autoStart}
                onClick={() => toggleSetting("autoStart")}
              >
                <span className="switch__thumb" />
              </button>
            </div>
            <div className="toggle-row">
              <div>
                <span className="toggle-row__title">Тактильная обратная связь</span>
                <p className="toggle-row__description">Использовать вибрацию или haptic-сигнал при смене шага.</p>
              </div>
              <button
                type="button"
                className={`switch ${draft.vibrateOnChange ? "is-on" : ""}`}
                role="switch"
                aria-checked={draft.vibrateOnChange}
                onClick={() => toggleSetting("vibrateOnChange")}
              >
                <span className="switch__thumb" />
              </button>
            </div>
          </section>
        </div>

        <footer className="settings__footer">
          <button type="button" className="ghost-button" onClick={handleReset}>
            Сбросить
          </button>
          <button type="button" className="primary-button" onClick={handleSave}>
            Сохранить
          </button>
        </footer>
      </div>
    </div>
  );
}

export default SettingsDrawer;
