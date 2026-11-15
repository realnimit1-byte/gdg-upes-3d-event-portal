import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';
import { GdgUpesLogo } from '../Branding/GdgUpesLogo';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface HeroSectionProps {
  onExploreEvents: () => void;
  onJoinExperience: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreEvents,
  onJoinExperience,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Dominant Typographic Focal Block */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-6 relative z-10"
        >
          <p className="font-mono-tech text-xs sm:text-sm tracking-[0.2em] uppercase text-[#61D9FF] font-medium">
            GOOGLE DEVELOPER GROUPS ON CAMPUS
          </p>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.03] text-balance">
            GDG UPES
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-display font-semibold tracking-wider text-slate-200">
            <span className="text-[#4285F4]">BUILD.</span>
            <span className="text-[#FBBC05]">CONNECT.</span>
            <span className="text-[#34A853]">INNOVATE.</span>
          </div>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            Explore technology, collaborate with developers, and turn ideas into real-world impact.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 font-mono-tech">
            University of Petroleum and Energy Studies · Dehradun, India
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onExploreEvents}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold tracking-wide text-white reg-cta-gradient cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61D9FF]"
            >
              EXPLORE EVENTS
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onJoinExperience}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold tracking-wide text-slate-100 bg-[#242631]/80 hover:bg-[#30313E] border border-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61D9FF]"
            >
              <Sparkles className="w-4 h-4 text-[#61D9FF]" />
              JOIN THE EXPERIENCE
            </button>
          </div>
        </motion.div>

        {/* Right Side: Open Viewport Framing the 3D Floating GDG UPES Logo Stage */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-end justify-center min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] pointer-events-none">
          {/* Shown cleanly on reduced motion / narrow devices where 3D stage is simplified */}
          <div className="lg:hidden mt-4 p-5 rounded-2xl bg-[#11121D]/75 border border-white/12 backdrop-blur-md">
            <GdgUpesLogo />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        type="button"
        onClick={onExploreEvents}
        aria-label="Scroll into the GDG UPES Developer Universe"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 inline-flex flex-col items-center gap-2 text-xs font-mono-tech tracking-widest uppercase text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#61D9FF] rounded-lg px-3 py-1"
      >
        <span>Scroll to Enter</span>
        <motion.span
          animate={reducedMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4 text-[#61D9FF]" />
        </motion.span>
      </button>
    </section>
  );
};
