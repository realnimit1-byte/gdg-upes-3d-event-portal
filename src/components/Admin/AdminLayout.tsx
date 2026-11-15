import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarCog,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GdgUpesLogo } from '../Branding/GdgUpesLogo';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/events', label: 'Events', icon: CalendarCog },
  { to: '/admin/participants', label: 'Participants', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, children }) => {
  const { admin, signOutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOutAdmin();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080B18] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080B18]/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/" className="shrink-0" aria-label="GDG on Campus UPES Public Site">
              <GdgUpesLogo compact />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider text-[#3AD4F5] border-l border-white/12 pl-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34A853]" />
              Admin Portal · {admin?.role ?? 'admin'}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1" aria-label="Admin Navigation">
            {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#5C67F9] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline text-xs font-mono-tech text-slate-400 truncate max-w-[180px]">
              {admin?.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-200 bg-rose-500/12 hover:bg-rose-500/20 border border-rose-500/25 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Admin Sub-navigation */}
        <nav
          className="md:hidden border-t border-white/8 px-4 py-2 flex items-center gap-1 overflow-x-auto"
          aria-label="Admin Mobile Navigation"
        >
          {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-[#5C67F9] text-white'
                    : 'text-slate-300 bg-[#11121D] border border-white/8'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#61D9FF] mb-1.5">
              GDG on Campus UPES · Organizer Console
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
          </div>
          <Link
            to="/"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            View Public Site
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
};
