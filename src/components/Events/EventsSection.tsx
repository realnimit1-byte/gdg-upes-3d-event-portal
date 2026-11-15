import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Settings2,
  X,
} from 'lucide-react';
import { GdgEvent } from '../../types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { CHAPTER_INFO } from '../../data/chapter/chapterInfo';

interface EventsSectionProps {
  upcomingEvents: GdgEvent[];
  pastEvents: GdgEvent[];
  onSelectEventForRegistration: (event: GdgEvent) => void;
}

const FORMAT_FILTERS = ['All', 'In-Person', 'Virtual', 'Hybrid'] as const;

interface TiltCardProps {
  event: GdgEvent;
  onViewDetails: (event: GdgEvent) => void;
  onRegister?: (event: GdgEvent) => void;
}

const EventTiltCard: React.FC<TiltCardProps> = ({ event, onViewDetails, onRegister }) => {
  const reducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 7, ry: x * 7 });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const feeLabel =
    event.feeType === 'free' ? 'Free (₹0)' : `Paid (₹${event.feeAmount})`;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transform: reducedMotion
          ? undefined
          : `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="group flex flex-col justify-between rounded-2xl bg-[#11121D]/88 border border-white/10 hover:border-[#61D9FF]/45 backdrop-blur-md p-6 shadow-[0_20px_50px_rgba(3,5,16,0.55)]"
    >
      <div>
        {/* Clean Unboxed Metadata Row (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-slate-400 mb-3">
          <span className="text-[#61D9FF]">{event.category}</span>
          <span aria-hidden="true">·</span>
          <span>{event.format}</span>
          <span aria-hidden="true">·</span>
          <span className={event.registrationOpen ? 'text-[#34A853]' : 'text-slate-400'}>
            {event.registrationOpen ? 'Open' : event.status === 'completed' ? 'Completed' : 'Closed'}
          </span>
          {event.registrationOpen && event.capacity !== null && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-slate-300">
                {event.registeredCount ?? 0}/{event.capacity} spots
              </span>
            </>
          )}
        </div>

        <h3 className="font-display text-lg sm:text-xl font-semibold text-white group-hover:text-[#61D9FF] transition-colors leading-snug">
          {event.name}
        </h3>

        <p className="mt-2.5 text-sm text-slate-300 leading-relaxed line-clamp-3">
          {event.shortDescription}
        </p>

        <div className="mt-5 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
            <span className="tabular-nums">{event.date}</span>
            <span className="text-slate-500">·</span>
            <Clock className="w-3.5 h-3.5 text-[#FBBC05] shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#34A853] shrink-0" />
            <span>{event.venue}</span>
            <span className="text-slate-500">·</span>
            <span className="tabular-nums font-medium text-slate-200">{feeLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onViewDetails(event)}
          className="text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 whitespace-nowrap"
        >
          View Details
        </button>

        {event.registrationOpen && onRegister ? (
          <button
            type="button"
            onClick={() => onRegister(event)}
            className="text-xs font-semibold text-white py-2 px-4 rounded-lg reg-cta-gradient cursor-pointer whitespace-nowrap"
          >
            Register Now
          </button>
        ) : (
          <span className="text-xs font-mono-tech text-slate-500 whitespace-nowrap">
            Registration Closed
          </span>
        )}
      </div>
    </div>
  );
};

export const EventsSection: React.FC<EventsSectionProps> = ({
  upcomingEvents,
  pastEvents,
  onSelectEventForRegistration,
}) => {
  const reducedMotion = useReducedMotion();
  const [formatFilter, setFormatFilter] = useState<(typeof FORMAT_FILTERS)[number]>('All');
  const [selectedDetailsEvent, setSelectedDetailsEvent] = useState<GdgEvent | null>(null);
  const [showAllArchive, setShowAllArchive] = useState(false);

  useEffect(() => {
    if (!selectedDetailsEvent) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedDetailsEvent(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedDetailsEvent]);

  const filteredPast = useMemo(() => {
    if (formatFilter === 'All') return pastEvents;
    return pastEvents.filter((ev) => ev.format === formatFilter);
  }, [pastEvents, formatFilter]);

  const visibleArchive = showAllArchive ? filteredPast : filteredPast.slice(0, 6);

  return (
    <section
      id="events"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Upcoming Events Block */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-[#61D9FF] mb-3">
                Upcoming Experiences
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Event Discovery
              </h2>
            </div>

            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-[#242631]/80 hover:bg-[#30313E] border border-white/10 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#61D9FF]" />
              Student Portal & Passes
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-[#11121D]/85 border border-white/12 backdrop-blur-md p-8 sm:p-12 text-center shadow-[0_24px_80px_rgba(3,5,16,0.65)]"
            >
              <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-[#61D9FF] mb-3">
                Official GDG UPES Calendar Synced
              </p>
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-white text-balance">
                Something exciting is on the horizon.
              </h3>
              <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
                Stay connected for upcoming GDG UPES experiences.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={`https://gdg.community.dev/gdg-on-campus-university-of-petroleum-and-energy-studies-dehradun-india/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white reg-cta-gradient"
                >
                  Follow Chapter Updates
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link
                  to="/student/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-[#242631] hover:bg-[#30313E] border border-white/12 transition-colors"
                >
                  Student Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventTiltCard
                  key={event.id}
                  event={event}
                  onViewDetails={setSelectedDetailsEvent}
                  onRegister={onSelectEventForRegistration}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Events Archive */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="font-mono-tech text-xs tracking-[0.2em] uppercase text-slate-400 mb-2">
                Chapter Archive · {CHAPTER_INFO.verifiedCompletedEventCount} Verified Events
              </p>
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-white">
                Past Sessions & Cohorts
              </h3>
            </div>

            {/* Interactive Format Filter Control */}
            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#11121D]/90 border border-white/10 self-start"
              role="group"
              aria-label="Filter past events by format"
            >
              {FORMAT_FILTERS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormatFilter(fmt)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    formatFilter === fmt
                      ? 'bg-[#5C67F9] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArchive.map((event) => (
              <EventTiltCard
                key={event.id}
                event={event}
                onViewDetails={setSelectedDetailsEvent}
                onRegister={
                  event.registrationOpen ? onSelectEventForRegistration : undefined
                }
              />
            ))}
          </div>

          {filteredPast.length > 6 && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShowAllArchive((prev) => !prev)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-[#242631]/85 hover:bg-[#30313E] border border-white/12 transition-colors cursor-pointer"
              >
                {showAllArchive
                  ? 'Show Fewer Archive Events'
                  : `View All ${filteredPast.length} Archive Events`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accessible Event Details Modal */}
      {selectedDetailsEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          onClick={() => setSelectedDetailsEvent(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-[#11121D] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono-tech text-[#61D9FF] mb-1.5">
                  {selectedDetailsEvent.category} · {selectedDetailsEvent.format}
                </p>
                <h4
                  id="event-modal-title"
                  className="font-display text-2xl font-bold text-white"
                >
                  {selectedDetailsEvent.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailsEvent(null)}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                aria-label="Close event details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 bg-[#242631]/65 rounded-xl p-4 border border-white/8">
              <div>
                <span className="text-slate-400 block">Date & Time</span>
                <span className="font-medium text-white tabular-nums">
                  {selectedDetailsEvent.date} · {selectedDetailsEvent.time}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Venue & Fee</span>
                <span className="font-medium text-white">
                  {selectedDetailsEvent.venue} ·{' '}
                  {selectedDetailsEvent.feeType === 'free'
                    ? '₹0 — Free'
                    : `₹${selectedDetailsEvent.feeAmount}`}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {selectedDetailsEvent.description}
            </p>

            {selectedDetailsEvent.speakers && selectedDetailsEvent.speakers.length > 0 && (
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">Featured Speakers</p>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                  {selectedDetailsEvent.speakers.map((sp) => (
                    <li key={sp}>{sp}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              {selectedDetailsEvent.officialUrl ? (
                <a
                  href={selectedDetailsEvent.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#61D9FF] hover:text-white"
                >
                  Official Event Page
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDetailsEvent(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  Close
                </button>
                {selectedDetailsEvent.registrationOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      const ev = selectedDetailsEvent;
                      setSelectedDetailsEvent(null);
                      onSelectEventForRegistration(ev);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white reg-cta-gradient cursor-pointer"
                  >
                    Register for Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
