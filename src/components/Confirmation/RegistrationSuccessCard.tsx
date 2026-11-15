import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { RegistrationRecord } from '../../types';
import { GdgUpesLogo } from '../Branding/GdgUpesLogo';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RegistrationSuccessCardProps {
  record: RegistrationRecord;
  onBackToEvents: () => void;
  onRegisterAnother: () => void;
}

export const RegistrationSuccessCard: React.FC<RegistrationSuccessCardProps> = ({
  record,
  onBackToEvents,
  onRegisterAnother,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[24px] reg-card-surface p-7 sm:p-10 w-full max-w-[460px] mx-auto"
    >
      {/* Top-left signature blue decorative quarter-circle */}
      <div
        className="pointer-events-none absolute -top-14 -left-14 w-40 h-40 rounded-full bg-gradient-to-br from-[#4D58FF] to-[#3640F2] opacity-90"
        aria-hidden="true"
      />

      {/* Converging orbital glow halo + luminous checkmark */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative w-20 h-20 flex items-center justify-center mb-5">
          {!reducedMotion && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.6, 1.15, 1], opacity: [0, 0.9, 0.55] }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7C2AE8]/45 via-[#5239F6]/40 to-[#3AD4F5]/45 blur-md"
              aria-hidden="true"
            />
          )}
          <motion.div
            initial={reducedMotion ? false : { scale: 0.5, rotate: -18 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#3AD4F5] via-[#5C67F9] to-[#755CFF] p-[2px] shadow-[0_0_32px_rgba(58,212,245,0.45)]"
          >
            <div className="w-full h-full rounded-full bg-[#1C1E2B] flex items-center justify-center">
              <Check className="w-8 h-8 text-[#3AD4F5] stroke-[2.75]" />
            </div>
          </motion.div>
        </div>

        {/* Google 4-color micro bar */}
        <div className="flex items-center gap-1.5 mb-4" aria-hidden="true">
          <span className="w-4 h-1 rounded-full bg-[#4285F4]" />
          <span className="w-4 h-1 rounded-full bg-[#EA4335]" />
          <span className="w-4 h-1 rounded-full bg-[#FBBC05]" />
          <span className="w-4 h-1 rounded-full bg-[#34A853]" />
        </div>

        <h3 className="font-display text-2xl font-bold tracking-wide uppercase">
          <span className="text-white">REGISTRATION </span>
          <span className="text-[#3AD4F5]">SUCCESSFUL</span>
        </h3>

        <p className="mt-2 text-sm text-slate-300 text-balance">
          You&apos;re officially registered for{' '}
          <span className="font-semibold text-white">{record.eventName}</span>.
        </p>

        {/* Verified Local Confirmation Details */}
        <div className="mt-6 w-full rounded-2xl bg-[#191B27]/90 border border-white/10 p-4 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Participant Name</span>
            <span className="font-medium text-white text-right">{record.fullName}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Event Name</span>
            <span className="font-medium text-white text-right truncate max-w-[220px]">
              {record.eventName}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Reference ID</span>
            <span className="font-mono-tech font-semibold text-[#3AD4F5] tabular-nums">
              {record.registrationId}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Event Date</span>
            <span className="font-medium text-slate-200 tabular-nums">{record.eventDate}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Status</span>
            <span className="font-medium text-[#34A853]">{record.registrationStatus}</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          Your registration is saved in your GDG UPES student account history. No automated email confirmation is sent unless email notifications are separately enabled.
        </p>

        <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBackToEvents}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide text-slate-200 bg-[#3B3E4B] hover:bg-[#494D5D] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            BACK TO EVENTS
          </button>
          <Link
            to="/student/registrations"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide text-white reg-cta-gradient whitespace-nowrap"
          >
            VIEW REGISTRATION
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={onRegisterAnother}
          className="mt-4 text-xs text-[#3AD4F5] hover:text-white transition-colors cursor-pointer"
        >
          Register for another event
        </button>

        <div className="mt-5 pt-4 border-t border-white/10 w-full flex justify-center">
          <GdgUpesLogo compact showCampusTag={false} />
        </div>
      </div>
    </motion.div>
  );
};
