import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { CHAPTER_INFO, VERIFIED_LINKS } from '../../data/chapter/chapterInfo';
import { GdgUpesLogo } from '../Branding/GdgUpesLogo';

export const CommunityFooter: React.FC = () => {
  return (
    <footer
      id="community"
      className="relative border-t border-white/10 bg-[#080B18]/88 backdrop-blur-md pt-20 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          {/* Brand & Mission Summary */}
          <div className="lg:col-span-5 space-y-5">
            <GdgUpesLogo />
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
              Student-led Google Developer Groups on Campus chapter at the University of Petroleum and Energy Studies, Dehradun — empowering builders across AI/ML, Cloud, Web, Security, and Design.
            </p>
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="w-6 h-1 rounded-full bg-[#4285F4]" />
              <span className="w-6 h-1 rounded-full bg-[#EA4335]" />
              <span className="w-6 h-1 rounded-full bg-[#FBBC05]" />
              <span className="w-6 h-1 rounded-full bg-[#34A853]" />
            </div>
          </div>

          {/* Verified Social & Official Links */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Verified Community Channels
            </h3>
            <ul className="space-y-2.5 text-sm">
              {VERIFIED_LINKS.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-[#61D9FF] transition-colors"
                  >
                    <span>{item.label}</span>
                    {item.handle && (
                      <span className="text-xs font-mono-tech text-slate-500">
                        ({item.handle})
                      </span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Platform Routes */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Experience Portal
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/#hero" className="hover:text-white transition-colors">
                  Developer Universe
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Event Discovery & Archive
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-white transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Attribution & Honest Legal Boundary */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-400">
          <p className="max-w-3xl leading-relaxed">{CHAPTER_INFO.attributionNotice}</p>
          <p className="font-mono-tech text-slate-400 shrink-0">
            Dehradun · Uttarakhand · India
          </p>
        </div>
      </div>
    </footer>
  );
};
