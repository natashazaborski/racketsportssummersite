import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SportLayout from './components/SportLayout';
import SportOverview from './pages/sport/SportOverview';
import SportTournamentPage from './pages/SportTournamentPage';
import SportDrillsPage from './pages/sport/SportDrillsPage';
import SportLessonPlanPage from './pages/sport/SportLessonPlanPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Each sport is a self-contained section with its own sub-pages. */}
      <Route path="/:sport" element={<SportLayout />}>
        <Route index element={<SportOverview />} />
        <Route path="tournament" element={<SportTournamentPage />} />
        <Route path="drills" element={<SportDrillsPage />} />
        <Route path="lesson-plan" element={<SportLessonPlanPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
