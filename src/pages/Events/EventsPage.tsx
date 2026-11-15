import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar/Navbar';
import { EventsSection } from '../../components/Events/EventsSection';
import { CommunityFooter } from '../../components/Footer/CommunityFooter';
import { DeveloperUniverseCanvas } from '../../three/DeveloperUniverse/DeveloperUniverseCanvas';
import { PAST_EVENTS_ARCHIVE_CONFIG } from '../../data/events/eventsConfig';
import { eventService } from '../../services/eventService/eventService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { GdgEvent } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const EventsPage: React.FC = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const scrollProgressRef = useRef(0.5);

  const [upcomingEvents, setUpcomingEvents] = useState<GdgEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<GdgEvent[]>(PAST_EVENTS_ARCHIVE_CONFIG);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    const res = await eventService.fetchPublicEvents();
    setUpcomingEvents(res.upcomingEvents);
    setPastEvents(res.pastEvents);
    setLoadError(res.error ?? null);
  }, []);

  useEffect(() => {
    void loadEvents();
    return storageService.subscribe(
      [STORAGE_KEYS.EVENTS, STORAGE_KEYS.REGISTRATIONS],
      () => {
        void loadEvents();
      },
    );
  }, [loadEvents]);

  const handleSelectEvent = (event: GdgEvent) => {
    const target = `/student/register/${encodeURIComponent(event.id)}`;
    if (!student) {
      navigate(`/student/login?redirect=${encodeURIComponent(target)}`);
    } else {
      navigate(target);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080B18] text-slate-100">
      <DeveloperUniverseCanvas scrollProgressRef={scrollProgressRef} showHeroLogo={false} />
      <Navbar />

      <main className="relative z-10 pt-10">
        {loadError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            <div className="rounded-2xl bg-rose-500/12 border border-rose-500/35 p-4 text-xs text-rose-200">
              {loadError}
            </div>
          </div>
        )}
        <EventsSection
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          onSelectEventForRegistration={handleSelectEvent}
        />
        <CommunityFooter />
      </main>
    </div>
  );
};
