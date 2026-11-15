import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, LogIn, Shield } from 'lucide-react';
import {
  BranchOption,
  GdgEvent,
  RegistrationFormState,
  RegistrationRecord,
  RegistrationValidationErrors,
  YearOfStudyOption,
} from '../../types';
import {
  BRANCH_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
  validateStepOne,
  validateStepTwo,
} from '../../utils/validation';
import { registrationService } from '../../services/registrationService/registrationService';
import { RegistrationSuccessCard } from '../Confirmation/RegistrationSuccessCard';
import { GdgUpesLogo } from '../Branding/GdgUpesLogo';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAuth } from '../../contexts/AuthContext';

interface RegistrationSectionProps {
  openEvents: GdgEvent[];
  preselectedEventId?: string;
  onBackToEvents: () => void;
  onSuccessChange?: (active: boolean) => void;
  onRegistrationCompleted?: () => void;
}

const INITIAL_FORM: RegistrationFormState = {
  fullName: '',
  email: '',
  phone: '',
  university: 'UPES, Dehradun',
  branch: '',
  customBranch: '',
  yearOfStudy: '',
  eventId: '',
};

const STEP_HEADINGS: Record<1 | 2 | 3, { white: string; cyan: string; subtitle: string }> = {
  1: {
    white: 'PERSONAL',
    cyan: 'DETAILS',
    subtitle: "Let's get you registered.",
  },
  2: {
    white: 'UNIVERSITY',
    cyan: 'DETAILS',
    subtitle: 'Academic track and open GDG event selection.',
  },
  3: {
    white: 'FINAL',
    cyan: 'REVIEW',
    subtitle: 'Review your details before confirming.',
  },
};

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  openEvents,
  preselectedEventId,
  onBackToEvents,
  onSuccessChange,
  onRegistrationCompleted,
}) => {
  const reducedMotion = useReducedMotion();
  const { student } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<RegistrationFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<RegistrationValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const [confirmedRecord, setConfirmedRecord] = useState<RegistrationRecord | null>(null);
  const [edgeSweepKey, setEdgeSweepKey] = useState(0);
  const [stepTransitionTilt, setStepTransitionTilt] = useState(false);
  const [isTypingFocused, setIsTypingFocused] = useState(false);
  const [hoverTilt, setHoverTilt] = useState({ rx: 0, ry: 0 });
  const prefilledUserRef = useRef<string | null>(null);

  const openEventIds = useMemo(() => openEvents.map((e) => e.id), [openEvents]);

  // Auto-populate authenticated student profile information where available
  useEffect(() => {
    if (!student) {
      prefilledUserRef.current = null;
      return;
    }
    if (prefilledUserRef.current === student.id) return;

    setForm((prev) => {
      const profileBranch = student.branch ?? '';
      const matchedBranch = BRANCH_OPTIONS.find((b) => b === profileBranch);
      const matchedYear = YEAR_OF_STUDY_OPTIONS.find((y) => y === student.academicYear);

      return {
        ...prev,
        fullName: prev.fullName || student.fullName || '',
        email: prev.email || student.email || '',
        phone: prev.phone || student.phone || '',
        university:
          prev.university === 'UPES, Dehradun' && student.university
            ? student.university
            : prev.university,
        branch: prev.branch || matchedBranch || (profileBranch ? 'Other' : ''),
        customBranch:
          prev.customBranch || (!matchedBranch && profileBranch ? profileBranch : ''),
        yearOfStudy: prev.yearOfStudy || matchedYear || '',
      };
    });
    prefilledUserRef.current = student.id;
  }, [student]);

  // Sync preselected event or auto-select single open event
  useEffect(() => {
    if (preselectedEventId && openEventIds.includes(preselectedEventId)) {
      setForm((prev) => ({ ...prev, eventId: preselectedEventId }));
      return;
    }
    if (!form.eventId && openEvents.length === 1) {
      setForm((prev) => ({ ...prev, eventId: openEvents[0].id }));
    } else if (form.eventId && !openEventIds.includes(form.eventId)) {
      setForm((prev) => ({ ...prev, eventId: openEvents[0]?.id ?? '' }));
    }
  }, [preselectedEventId, openEventIds, openEvents, form.eventId]);

  useEffect(() => {
    onSuccessChange?.(confirmedRecord !== null);
  }, [confirmedRecord, onSuccessChange]);

  const selectedEvent = useMemo(
    () => openEvents.find((e) => e.id === form.eventId),
    [openEvents, form.eventId],
  );

  const triggerStepTransitionEffect = (nextStep: 1 | 2 | 3) => {
    if (!reducedMotion) {
      setStepTransitionTilt(true);
      setEdgeSweepKey((k) => k + 1);
      window.setTimeout(() => setStepTransitionTilt(false), 320);
    }
    setStep(nextStep);
  };

  const handleFieldChange = <K extends keyof RegistrationFormState>(
    field: K,
    value: RegistrationFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    if (submitError) setSubmitError(null);
  };

  const handleStepOneContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStepOne(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    triggerStepTransitionEffect(2);
  };

  const handleStepTwoContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStepTwo(form, openEventIds);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setSubmitError(null);
    triggerStepTransitionEffect(3);
  };

  const handleFinalSubmit = async () => {
    if (submitLockRef.current || isSubmitting) return;
    setSubmitError(null);

    if (!student) {
      setSubmitError('Please sign in with your Student Account before confirming registration.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await registrationService.submitRegistration(form, openEventIds);
      if (!result.ok || !result.record) {
        setSubmitError(result.error ?? 'Unable to complete registration.');
        return;
      }
      setConfirmedRecord(result.record);
      onRegistrationCompleted?.();
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleResetForNewRegistration = () => {
    setConfirmedRecord(null);
    setSubmitError(null);
    setErrors({});
    setStep(1);
    setForm((prev) => ({
      ...INITIAL_FORM,
      fullName: student?.fullName || prev.fullName,
      email: student?.email || prev.email,
      phone: student?.phone || prev.phone,
      university: student?.university || 'UPES, Dehradun',
      eventId: openEvents[0]?.id ?? prev.eventId,
    }));
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || isTypingFocused || confirmedRecord) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setHoverTilt({ rx: -ny * 4.5, ry: nx * 4.5 });
  };

  const resetCardTilt = () => setHoverTilt({ rx: 0, ry: 0 });

  const resolvedBranchDisplay =
    form.branch === 'Other' ? form.customBranch.trim() || 'Other' : form.branch;

  const heading = STEP_HEADINGS[step];
  const loginRedirectTarget = form.eventId
    ? `/student/register/${encodeURIComponent(form.eventId)}`
    : '/student/dashboard';

  return (
    <section
      id="register"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-[#61D9FF] mb-3">
            Event Registration Portal
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance">
            Step into the GDG UPES Experience
          </h2>
        </div>

        <div className="relative flex flex-col items-center justify-center">
          <div
            className="pointer-events-none hidden sm:flex items-center justify-center mb-5 opacity-75"
            aria-hidden="true"
          >
            <GdgUpesLogo compact />
          </div>

          {confirmedRecord ? (
            <RegistrationSuccessCard
              record={confirmedRecord}
              onBackToEvents={onBackToEvents}
              onRegisterAnother={handleResetForNewRegistration}
            />
          ) : (
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={resetCardTilt}
              onFocusCapture={() => {
                setIsTypingFocused(true);
                resetCardTilt();
              }}
              onBlurCapture={() => setIsTypingFocused(false)}
              style={{
                transform: reducedMotion
                  ? undefined
                  : stepTransitionTilt
                    ? 'perspective(1100px) rotateX(6deg) scale(0.985)'
                    : `perspective(1100px) rotateX(${hoverTilt.rx}deg) rotateY(${hoverTilt.ry}deg)`,
                transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="relative overflow-hidden rounded-[24px] reg-card-surface p-7 sm:p-9 w-full max-w-[440px] mx-auto"
            >
              {edgeSweepKey > 0 && !reducedMotion && (
                <div
                  key={edgeSweepKey}
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#3AD4F5] to-[#755CFF] reg-edge-sweep z-20"
                  aria-hidden="true"
                />
              )}

              {/* Top-left blue-indigo decorative quarter-circle */}
              <div
                className="pointer-events-none absolute -top-14 -left-14 w-40 h-40 rounded-full bg-gradient-to-br from-[#4D58FF] to-[#3640F2] opacity-95"
                aria-hidden="true"
              />

              {/* Top-center glowing blue-violet User+ SVG icon */}
              <div className="relative z-10 flex flex-col items-center text-center mb-6">
                <div className="mb-3" aria-hidden="true">
                  <svg width="46" height="36" viewBox="0 0 46 36" fill="none">
                    <defs>
                      <linearGradient id="regUserGrad" x1="0" y1="0" x2="46" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3AD4F5" />
                        <stop offset="50%" stopColor="#5C67F9" />
                        <stop offset="100%" stopColor="#7C2AE8" />
                      </linearGradient>
                    </defs>
                    <circle cx="17" cy="11" r="6.5" fill="url(#regUserGrad)" />
                    <path
                      d="M4 31.5C4 25.1487 9.14873 20 15.5 20H18.5C24.8513 20 30 25.1487 30 31.5C30 32.3284 29.3284 33 28.5 33H5.5C4.67157 33 4 32.3284 4 31.5Z"
                      fill="url(#regUserGrad)"
                    />
                    <path
                      d="M36 9V19M31 14H41"
                      stroke="#3AD4F5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h3 className="font-display text-[22px] sm:text-2xl font-bold tracking-wide uppercase">
                  <span className="text-white">{heading.white} </span>
                  <span className="text-[#3AD4F5]">{heading.cyan}</span>
                </h3>
                <p className="mt-1 text-xs text-slate-300">{heading.subtitle}</p>

                {/* Refined 3-Step Progress Indicator */}
                <div
                  className="mt-4 w-full flex items-center justify-center gap-2"
                  aria-label={`Registration step ${step} of 3`}
                >
                  {[1, 2, 3].map((idx) => {
                    const isCurrent = step === idx;
                    const isCompleted = step > idx;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCurrent
                              ? 'w-10 bg-gradient-to-r from-[#3AD4F5] to-[#755CFF]'
                              : isCompleted
                                ? 'w-6 bg-[#3AD4F5]/75'
                                : 'w-6 bg-white/15'
                          }`}
                        />
                      </div>
                    );
                  })}
                  <span className="ml-1.5 font-mono-tech text-[11px] text-slate-400 tabular-nums">
                    {step}/3
                  </span>
                </div>
              </div>

              {/* Authentication Reminder when browsing as guest */}
              {!student && (
                <div className="relative z-10 mb-4 rounded-xl bg-[#1A1C28]/90 border border-white/12 p-3 text-xs text-slate-300 flex items-center justify-between gap-2">
                  <span>Sign in as a student to confirm registration.</span>
                  <Link
                    to={`/student/login?redirect=${encodeURIComponent(loginRedirectTarget)}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#3AD4F5] hover:text-white shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Link>
                </div>
              )}

              {/* Animated Step Content */}
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.form
                      key="step-1"
                      initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
                      transition={{ duration: 0.24 }}
                      onSubmit={handleStepOneContinue}
                      noValidate
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="reg-fullname" className="sr-only">
                          Full Name
                        </label>
                        <input
                          id="reg-fullname"
                          type="text"
                          autoComplete="name"
                          placeholder="Full Name"
                          value={form.fullName}
                          onChange={(e) => handleFieldChange('fullName', e.target.value)}
                          aria-invalid={Boolean(errors.fullName)}
                          aria-describedby={errors.fullName ? 'err-fullname' : undefined}
                          className="w-full rounded-xl reg-input-surface px-4 py-3.5 text-sm text-white placeholder:text-[#B8BCC8]"
                        />
                        {errors.fullName && (
                          <p id="err-fullname" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.fullName}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reg-email" className="sr-only">
                          Email Address
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          autoComplete="email"
                          placeholder="Email Address"
                          value={form.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? 'err-email' : undefined}
                          className="w-full rounded-xl reg-input-surface px-4 py-3.5 text-sm text-white placeholder:text-[#B8BCC8]"
                        />
                        {errors.email && (
                          <p id="err-email" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reg-phone" className="sr-only">
                          Phone Number (10-digit Indian mobile)
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="Phone Number (10-digit mobile)"
                          value={form.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? 'err-phone' : undefined}
                          className="w-full rounded-xl reg-input-surface px-4 py-3.5 text-sm text-white placeholder:text-[#B8BCC8]"
                        />
                        {errors.phone && (
                          <p id="err-phone" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.phone}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase text-white reg-cta-gradient cursor-pointer"
                        >
                          CONTINUE
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {step === 2 && (
                    <motion.form
                      key="step-2"
                      initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
                      transition={{ duration: 0.24 }}
                      onSubmit={handleStepTwoContinue}
                      noValidate
                      className="space-y-3.5"
                    >
                      <div>
                        <label htmlFor="reg-university" className="sr-only">
                          University / College
                        </label>
                        <input
                          id="reg-university"
                          type="text"
                          placeholder="University / College"
                          value={form.university}
                          onChange={(e) => handleFieldChange('university', e.target.value)}
                          aria-invalid={Boolean(errors.university)}
                          aria-describedby={errors.university ? 'err-university' : undefined}
                          className="w-full rounded-xl reg-input-surface px-4 py-3 text-sm text-white placeholder:text-[#B8BCC8]"
                        />
                        {errors.university && (
                          <p id="err-university" className="mt-1 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.university}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reg-branch" className="sr-only">
                          Branch / Course
                        </label>
                        <select
                          id="reg-branch"
                          value={form.branch}
                          onChange={(e) =>
                            handleFieldChange('branch', e.target.value as BranchOption | '')
                          }
                          aria-invalid={Boolean(errors.branch)}
                          className="w-full rounded-xl reg-input-surface px-4 py-3 text-sm text-white"
                        >
                          <option value="" className="bg-[#242631] text-slate-300">
                            Select Branch / Course
                          </option>
                          {BRANCH_OPTIONS.map((b) => (
                            <option key={b} value={b} className="bg-[#242631] text-white">
                              {b}
                            </option>
                          ))}
                        </select>
                        {errors.branch && (
                          <p className="mt-1 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.branch}</span>
                          </p>
                        )}
                      </div>

                      {form.branch === 'Other' && (
                        <div>
                          <label htmlFor="reg-custom-branch" className="sr-only">
                            Specify Branch / Course
                          </label>
                          <input
                            id="reg-custom-branch"
                            type="text"
                            placeholder="Enter your Branch / Course"
                            value={form.customBranch}
                            onChange={(e) => handleFieldChange('customBranch', e.target.value)}
                            aria-invalid={Boolean(errors.customBranch)}
                            className="w-full rounded-xl reg-input-surface px-4 py-3 text-sm text-white placeholder:text-[#B8BCC8]"
                          />
                          {errors.customBranch && (
                            <p className="mt-1 text-xs text-rose-400 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{errors.customBranch}</span>
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <label htmlFor="reg-year" className="sr-only">
                          Year of Study
                        </label>
                        <select
                          id="reg-year"
                          value={form.yearOfStudy}
                          onChange={(e) =>
                            handleFieldChange(
                              'yearOfStudy',
                              e.target.value as YearOfStudyOption | '',
                            )
                          }
                          aria-invalid={Boolean(errors.yearOfStudy)}
                          className="w-full rounded-xl reg-input-surface px-4 py-3 text-sm text-white"
                        >
                          <option value="" className="bg-[#242631] text-slate-300">
                            Select Year of Study
                          </option>
                          {YEAR_OF_STUDY_OPTIONS.map((y) => (
                            <option key={y} value={y} className="bg-[#242631] text-white">
                              {y}
                            </option>
                          ))}
                        </select>
                        {errors.yearOfStudy && (
                          <p className="mt-1 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.yearOfStudy}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reg-event" className="sr-only">
                          Selected GDG Event
                        </label>
                        {openEvents.length > 0 ? (
                          <select
                            id="reg-event"
                            value={form.eventId}
                            onChange={(e) => handleFieldChange('eventId', e.target.value)}
                            aria-invalid={Boolean(errors.eventId)}
                            className="w-full rounded-xl reg-input-surface px-4 py-3 text-sm text-white"
                          >
                            <option value="" className="bg-[#242631] text-slate-300">
                              Select Open GDG Event
                            </option>
                            {openEvents.map((ev) => (
                              <option key={ev.id} value={ev.id} className="bg-[#242631] text-white">
                                {ev.name} ({ev.feeType === 'free' ? 'Free' : `₹${ev.feeAmount}`})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="rounded-xl bg-[#1A1C28]/90 border border-white/12 p-3.5 text-xs text-slate-300 space-y-1.5">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-[#3AD4F5] shrink-0 mt-0.5" />
                              <p>
                                No upcoming events are currently open for registration on the GDG UPES schedule.
                              </p>
                            </div>
                          </div>
                        )}
                        {errors.eventId && (
                          <p className="mt-1 text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.eventId}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setErrors({});
                            triggerStepTransitionEffect(1);
                          }}
                          className="w-1/3 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase text-slate-200 bg-[#3B3E4B] hover:bg-[#494D5D] transition-colors cursor-pointer"
                        >
                          BACK
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase text-white reg-cta-gradient cursor-pointer"
                        >
                          CONTINUE
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
                      transition={{ duration: 0.24 }}
                      className="space-y-4"
                    >
                      <div className="rounded-2xl bg-[#1A1C28]/90 border border-white/10 p-4 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-mono-tech uppercase tracking-wider text-slate-400">
                            Participant Details
                          </span>
                          <button
                            type="button"
                            onClick={() => triggerStepTransitionEffect(1)}
                            className="text-[#3AD4F5] hover:text-white font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Full Name</span>
                          <span className="text-white font-medium text-right">{form.fullName.trim()}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Email</span>
                          <span className="text-white font-medium text-right break-all">
                            {form.email.trim().toLowerCase()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Phone</span>
                          <span className="text-white font-medium tabular-nums">{form.phone.trim()}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 pb-2 border-t border-b border-white/10">
                          <span className="font-mono-tech uppercase tracking-wider text-slate-400">
                            University & Event
                          </span>
                          <button
                            type="button"
                            onClick={() => triggerStepTransitionEffect(2)}
                            className="text-[#3AD4F5] hover:text-white font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">University</span>
                          <span className="text-white font-medium text-right">{form.university.trim()}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Branch</span>
                          <span className="text-white font-medium text-right">{resolvedBranchDisplay}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Year</span>
                          <span className="text-white font-medium text-right">{form.yearOfStudy}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Event</span>
                          <span className="text-white font-medium text-right">
                            {selectedEvent?.name ?? 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Date</span>
                          <span className="text-slate-200 tabular-nums text-right">
                            {selectedEvent?.date ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Venue</span>
                          <span className="text-slate-200 text-right">{selectedEvent?.venue ?? '—'}</span>
                        </div>
                      </div>

                      {selectedEvent && (
                        <div className="rounded-xl bg-[#1A1C28]/95 border border-white/12 p-4">
                          <p className="font-mono-tech text-[11px] uppercase tracking-widest text-slate-400">
                            REGISTRATION FEE
                          </p>
                          {selectedEvent.feeType === 'free' ? (
                            <div className="mt-1 flex items-center justify-between">
                              <span className="font-display text-lg font-bold text-[#34A853] tabular-nums">
                                ₹0 — FREE
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                                Ready to confirm
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 space-y-2">
                              <p className="font-display text-lg font-bold text-[#FBBC05] tabular-nums">
                                ₹{selectedEvent.feeAmount}
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                Online payment registration is currently unavailable until a verified payment gateway is connected. Paid events cannot be marked as paid or confirmed without a real transaction.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {submitError && (
                        <div
                          role="alert"
                          className="rounded-xl bg-rose-500/12 border border-rose-500/35 px-3.5 py-2.5 text-xs text-rose-300 flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      <div className="pt-1 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSubmitError(null);
                            triggerStepTransitionEffect(2);
                          }}
                          className="w-1/3 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase text-slate-200 bg-[#3B3E4B] hover:bg-[#494D5D] transition-colors cursor-pointer"
                        >
                          BACK
                        </button>
                        <button
                          type="button"
                          onClick={handleFinalSubmit}
                          disabled={!selectedEvent || selectedEvent.feeType === 'paid' || isSubmitting}
                          className="w-2/3 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white reg-cta-gradient cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          {selectedEvent?.feeType === 'paid'
                            ? 'PAYMENT UNAVAILABLE'
                            : isSubmitting
                              ? 'SAVING REGISTRATION...'
                              : 'CONFIRM REGISTRATION'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative z-10 mt-6 text-center text-xs text-slate-300 space-y-2">
                <div>
                  <span>{student ? 'Manage your event passes? ' : 'Already have an account? '}</span>
                  <Link
                    to={student ? '/student/registrations' : `/student/login?redirect=${encodeURIComponent(loginRedirectTarget)}`}
                    className="font-semibold text-[#3AD4F5] hover:text-white transition-colors"
                  >
                    {student ? 'View My Registrations' : 'Sign In'}
                  </Link>
                </div>
                <div>
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center gap-1 font-semibold text-[#3AD4F5] hover:text-white transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
