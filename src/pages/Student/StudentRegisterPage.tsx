import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { DeveloperUniverseCanvas } from '../../three/DeveloperUniverse/DeveloperUniverseCanvas';
import { RegistrationSection } from '../../components/Registration/RegistrationSection';
import { CommunityFooter } from '../../components/Footer/CommunityFooter';
import { eventService } from '../../services/eventService/eventService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { GdgEvent } from '../../types';

function isEventDeadlinePassed(event: GdgEvent): boolean {
  if (!event.registrationDeadline) return false;
  const deadlineMs = new Date(`${event.registrationDeadline}T23:59:59`).getTime();
  return !Number.isNaN(deadlineMs) && Date.now() > deadlineMs;
}

export const StudentRegisterPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const scrollProgressRef = useRef(0.78);

  const [openEvents, setOpenEvents] = useState<GdgEvent[]>([]);
  const [requestedEvent, setRequestedEvent] = useState<GdgEvent | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [successBurstActive, setSuccessBurstActive] = useState(false);

  const loadOpenEvents = useCallback(async () => {
    const [publicRes, targetRes] = await Promise.all([
      eventService.fetchPublicEvents(),
      eventId ? eventService.fetchPublicEventById(eventId) : Promise.resolve({ event: null }),
    ]);
    setOpenEvents(publicRes.openEvents);
    setRequestedEvent(targetRes.event);
    setLoadingEvents(false);
  }, [eventId]);

  useEffect(() => {
    void loadOpenEvents();
    return storageService.subscribe(
      [STORAGE_KEYS.EVENTS, STORAGE_KEYS.REGISTRATIONS],
      () => {
        void loadOpenEvents();
      },
    );
  }, [loadOpenEvents]);

  const directUrlBlockedReason = (() => {
    if (!eventId) return null;
    if (!requestedEvent) {
      return {
        title: 'Event Unavailable',
        detail:
          'This event does not exist or has been unpublished by chapter organizers. Existing registrations remain safely stored under My Registrations.',
      };
    }
    if (!requestedEvent.registrationOpen) {
      return {
        title: 'Registration Closed',
        detail: `Registration for "${requestedEvent.name}" is currently closed by chapter organizers. Any previously confirmed passes remain preserved in your registrations.`,
      };
    }
    if (isEventDeadlinePassed(requestedEvent)) {
      return {
        title: 'Registration Deadline Passed',
        detail: `The registration deadline (${requestedEvent.registrationDeadline}) for "${requestedEvent.name}" has passed.`,
      };
    }
    return null;
  })();

  return (
    <div className="relative min-h-screen bg-[#080B18] text-slate-100">
      <DeveloperUniverseCanvas
        scrollProgressRef={scrollProgressRef}
        successBurstActive={successBurstActive}
        showHeroLogo={false}
      />
      <Navbar />

      <main className="relative z-10 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Student Dashboard
          </Link>
        </div>

        {loadingEvents ? (
          <div className="max-w-md mx-auto my-20 rounded-2xl bg-[#11121D]/90 border border-white/10 p-8 text-center text-xs text-slate-300">
            Loading open event details...
          </div>
        ) : directUrlBlockedReason ? (
          <div className="max-w-md mx-auto px-4 my-20">
            <div className="relative overflow-hidden rounded-[24px] reg-card-surface p-7 sm:p-9 text-center space-y-5">
              <div
                className="pointer-events-none absolute -top-14 -left-14 w-40 h-40 rounded-full bg-gradient-to-br from-[#4D58FF] to-[#3640F2] opacity-95"
                aria-hidden="true"
              />
              <div className="relative z-10 w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5 text-[#FBBC05]" />
              </div>
              <div className="relative z-10 space-y-2">
                <h1 className="font-display text-2xl font-bold text-white uppercase">
                  {directUrlBlockedReason.title}
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {directUrlBlockedReason.detail}
                </p>
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/events"
                  className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white reg-cta-gradient text-center"
                >
                  Browse Open Events
                </Link>
                <Link
                  to="/student/registrations"
                  className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-200 bg-[#3B3E4B] hover:bg-[#494D5D] transition-colors text-center"
                >
                  My Registrations
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <RegistrationSection
            openEvents={openEvents}
            preselectedEventId={eventId}
            onBackToEvents={() => navigate('/events')}
            onSuccessChange={setSuccessBurstActive}
          />
        )}
      </main>

      <div className="relative z-10">
        <CommunityFooter />
      </div>
    </div>
  );
};
