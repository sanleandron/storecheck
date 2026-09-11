interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = Math.round(value * 100);
  return (
    <div>
      {label && <div className="progress-text">{label}</div>}
      <div className="progress-container" style={{ position: 'relative', borderRadius: 4, overflow: 'hidden' }}>
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
