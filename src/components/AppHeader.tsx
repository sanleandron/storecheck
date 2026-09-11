import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  progress?: number;
}

export function AppHeader({ title, showBack = false, progress }: AppHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="app-header">
      {showBack && (
        <button className="btn-back" onClick={() => navigate(-1)} aria-label="Volver">
          ◄
        </button>
      )}
      <div className="header-title">{title}</div>
      {typeof progress === 'number' && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
