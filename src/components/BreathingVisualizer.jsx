const DOT_POSITIONS = [
  { left: "18%", top: "82%" },
  { left: "18%", top: "18%" },
  { left: "82%", top: "18%" },
  { left: "82%", top: "82%" },
];

const LABEL_POSITIONS = [
  { left: "8%", bottom: "10%" },
  { left: "8%", top: "10%" },
  { right: "8%", top: "10%" },
  { right: "8%", bottom: "10%" },
];

function BreathingVisualizer({ phases, phaseIndex, progress, cycleProgress, durations }) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const normalizedCycle = Math.min(Math.max(cycleProgress, 0), 1);
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const dotTarget = DOT_POSITIONS[phaseIndex] ?? DOT_POSITIONS[0];
  const currentPhase = phases[phaseIndex];
  const transitionDuration = Math.max(Number(durations[currentPhase.key]) || 0, 0.4);

  return (
    <div className="visualizer">
      <div className="visualizer__ring" aria-hidden="true">
        <svg viewBox="0 0 360 360">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--phase-inhale)" />
              <stop offset="50%" stopColor="var(--phase-exhale)" />
              <stop offset="100%" stopColor="var(--phase-hold-empty)" />
            </linearGradient>
          </defs>
          <circle className="visualizer__ring-track" cx="180" cy="180" r={radius} />
          <circle
            className="visualizer__ring-progress"
            cx="180"
            cy="180"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - normalizedCycle)}
          />
        </svg>
      </div>
      <div className="visualizer__square" aria-label="Визуализация цикла дыхания">
        <div className="visualizer__grid" />
        <div
          className="visualizer__dot"
          style={{
            left: dotTarget.left,
            top: dotTarget.top,
            transitionDuration: `${transitionDuration}s`,
          }}
        >
          <span className="visualizer__dot-core" />
        </div>
        {phases.map((phase, index) => {
          const coords = LABEL_POSITIONS[index] ?? {};
          return (
            <span
              key={phase.key}
              className={`visualizer__label${index === phaseIndex ? " is-active" : ""}`}
              style={coords}
            >
              {phase.cue}
            </span>
          );
        })}
        <div className="visualizer__center">
          <span className="visualizer__center-title">Прогресс</span>
          <span className="visualizer__center-value">{Math.round(normalizedProgress * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

export default BreathingVisualizer;
