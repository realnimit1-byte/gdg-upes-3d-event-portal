import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { GdgUpesLogo } from '../Branding/GdgUpesLogo';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeSection?: string;
}

const NAV_ITEMS = [
  { id: 'hero', label: 'Home', hash: '#hero' },
  { id: 'about', label: 'About', hash: '#about' },
  { id: 'events', label: 'Events', hash: '#events' },
  { id: 'register', label: 'Register', hash: '#register' },
  { id: 'community', label: 'Community', hash: '#community' },
] as const;

export const Navbar: React.FC<NavbarProps> = ({ activeSection = 'hero' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { student, isAdmin } = useAuth();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileOpen(false);
    if (isHome) {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (sectionId === 'events') {
      navigate('/events');
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const primaryCta = student
    ? { to: '/student/dashboard', label: 'Dashboard' }
    : isAdmin
      ? { to: '/admin/dashboard', label: 'Admin Portal' }
      : { to: '/student/login', label: 'Student Login' };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${
        scrolled
          ? 'bg-[#080B18]/88 border-b border-white/10 backdrop-blur-md'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Lockup */}
        <Link
          to="/"
          onClick={() => {
            setMobileOpen(false);
            if (isHome) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61D9FF] rounded-lg py-1 shrink-0"
          aria-label="GDG on Campus UPES Home"
        >
          <GdgUpesLogo compact />
        </Link>

        {/* Zone 2: Single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              (isHome && activeSection === item.id) ||
              (item.id === 'events' && location.pathname === '/events');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61D9FF] rounded ${
                  isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#61D9FF] to-[#755CFF] transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={primaryCta.to}
            className={`hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61D9FF] ${
              location.pathname.startsWith('/student') || location.pathname.startsWith('/admin')
                ? 'bg-[#5C67F9] text-white'
                : 'bg-[#242631]/90 hover:bg-[#30313E] text-slate-100 border border-white/12'
            }`}
          >
            {primaryCta.label}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#242631]/80 border border-white/10 text-slate-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61D9FF]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#080B18]/96 border-b border-white/10 backdrop-blur-lg px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              to={student ? '/student/dashboard' : '/student/login'}
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white reg-cta-gradient"
            >
              {student ? 'Student Dashboard' : 'Student Login'}
            </Link>
            {!student && (
              <Link
                to="/student/signup"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-[#242631] border border-white/10"
              >
                Create Student Account
              </Link>
            )}
            <Link
              to={isAdmin ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Organizer Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
