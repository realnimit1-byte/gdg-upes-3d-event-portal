import React from 'react';
import { motion } from 'motion/react';
import { CHAPTER_INFO } from '../../data/chapter/chapterInfo';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const DeveloperUniverseSection: React.FC = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="universe"
      className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-[#11121D]/78 border border-white/10 backdrop-blur-md p-8 sm:p-12 lg:p-14 shadow-[0_24px_80px_rgba(3,5,16,0.65)]"
        >
          <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-[#61D9FF] mb-4">
            The Developer Universe · Dehradun
          </p>

          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight text-balance">
            MORE THAN A COMMUNITY.
          </h2>
          <p className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#61D9FF] to-[#755CFF] mt-2 text-balance">
            A UNIVERSE OF POSSIBILITIES.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300 text-base leading-relaxed">
            <p>{CHAPTER_INFO.missionParagraphs[0]}</p>
            <p>{CHAPTER_INFO.missionParagraphs[1]}</p>
          </div>

          {/* Four Google-colored horizontal micro-accents */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-3">
              <span className="inline-flex gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-1 rounded-full bg-[#4285F4]" />
                <span className="w-2.5 h-1 rounded-full bg-[#EA4335]" />
                <span className="w-2.5 h-1 rounded-full bg-[#FBBC05]" />
                <span className="w-2.5 h-1 rounded-full bg-[#34A853]" />
              </span>
              <span>Peer-to-Peer Learning · Open Source · Campus Engineering</span>
            </div>
            <span className="font-mono-tech text-slate-300">{CHAPTER_INFO.campuses}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
