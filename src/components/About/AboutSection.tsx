import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { CHAPTER_INFO, FOCUS_DOMAINS, VERIFIED_LINKS } from '../../data/chapter/chapterInfo';
import { GdgUpesLogo } from '../Branding/GdgUpesLogo';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const AboutSection: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const chapterLink = VERIFIED_LINKS.find((l) => l.kind === 'chapter');
  const upesLink = VERIFIED_LINKS.find((l) => l.label === 'UPES Official');

  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading & Verified Chapter Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7 space-y-4">
            <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-[#61D9FF]">
              About GDG on Campus UPES
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance">
              Learning by doing, building together.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              {CHAPTER_INFO.missionParagraphs[2]}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4">
            <div className="p-5 rounded-2xl bg-[#11121D]/85 border border-white/12 backdrop-blur-md w-full sm:w-auto">
              <GdgUpesLogo />
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300 font-mono-tech tabular-nums">
                <span>{CHAPTER_INFO.verifiedMemberCount.toLocaleString()} Chapter Members</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{CHAPTER_INFO.verifiedCompletedEventCount} Documented Events</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Verified on official gdg.community.dev chapter directory
              </p>
            </div>
          </div>
        </div>

        {/* Connected Glass Focus Panels */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
          {FOCUS_DOMAINS.map((domain, idx) => (
            <motion.article
              key={domain.id}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reducedMotion ? undefined : { y: -4 }}
              className="group relative rounded-2xl bg-[#11121D]/82 border border-white/10 hover:border-white/22 backdrop-blur-md p-7 transition-colors"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="font-mono-tech text-xs text-slate-400 tabular-nums">
                  0{idx + 1}
                </span>
                <span
                  className="h-1.5 w-10 rounded-full transition-all duration-200 group-hover:w-14"
                  style={{ backgroundColor: domain.accentHex }}
                  aria-hidden="true"
                />
              </div>

              <h3 className="font-display text-xl font-semibold text-white mb-2.5">
                {domain.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {domain.summary}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Verified Source Links */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#11121D]/70 border border-white/10 px-6 py-4 text-xs sm:text-sm text-slate-300">
          <span>
            Official Chapter & University References — Dehradun, Uttarakhand
          </span>
          <div className="flex flex-wrap items-center gap-5">
            {chapterLink && (
              <a
                href={chapterLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#61D9FF] hover:text-white transition-colors"
              >
                GDG Chapter Page
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {upesLink && (
              <a
                href={upesLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
              >
                UPES Official
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
