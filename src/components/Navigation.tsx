import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile } from './UserProfile';
import './Navigation.css';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className='navigation'>
      <div className='nav-container'>
        <div className='nav-brand'>
          <span className='nav-title'>Kanban Board</span>
        </div>

        <div className='nav-links'>
          <Link to='/board' className={`nav-link ${isActive('/board') ? 'active' : ''}`}>
            Board
          </Link>
          <Link to='/settings' className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
            Settings
          </Link>
        </div>

        <div className='nav-right'>
          <ThemeToggle mode={theme.mode} onToggle={toggleTheme} />
          <UserProfile name={user.name} role={user.role} onClick={() => navigate('/settings')} />
        </div>
      </div>
    </nav>
  );
};
