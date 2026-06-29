import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

/** App frame: scrollable content with a fixed bottom tab bar (thumb-friendly). */
export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <main className="flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
}
