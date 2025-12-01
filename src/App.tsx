import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { BoardPage } from './pages/BoardPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Navigation } from './components/Navigation';
import { useStore } from './store/useStore';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export const App = () => {
  const { theme } = useStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.mode);
  }, [theme.mode]);

  return (
    <Router>
      <div className='app'>
        <ToastContainer />
        <Navigation />
        <Routes>
          <Route path='/' element={<Navigate to='/board' />} />
          <Route path='/board' element={<BoardPage />} />
          <Route path='/issue/:id' element={<IssueDetailPage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};
