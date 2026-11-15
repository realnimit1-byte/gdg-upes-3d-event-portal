import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DeveloperUniverseCanvas } from '../../three/DeveloperUniverse/DeveloperUniverseCanvas';
import { Navbar } from '../../components/Navbar/Navbar';
import { HeroSection } from '../../components/Hero/HeroSection';
import { DeveloperUniverseSection } from '../../components/Universe/DeveloperUniverseSection';
import { AboutSection } from '../../components/About/AboutSection';
import { EventsSection } from '../../components/Events/EventsSection';
import { RegistrationSection } from '../../components/Registration/RegistrationSection';
import { CommunityFooter } from '../../components/Footer/CommunityFooter';
import { eventService } from '../../services/eventService/eventService';
import { STORAGE_KEYS, storageService } from '../../services/storageService/storageService';
import { PAST_EVENTS_ARCHIVE_CONFIG } from '../../data/events/eventsConfig';
import { GdgEvent } from '../../types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const SECTION_IDS = ['hero', 'universe', 'about', 'events', 'register', 'community'] as const;

export const HomePage: React.FC = () => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [upcomingEvents, setUpcomingEvents] = useState<GdgEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<GdgEvent[]>(PAST_EVENTS_ARCHIVE_CONFIG);
  const [openEvents, setOpenEvents] = useState<GdgEvent[]>([]);
  const [preselectedEventId, setPreselectedEventId] = useState<string | undefined>(undefined);
  const [successBurstActive, setSuccessBurstActive] = useState(false);

  const loadEvents = async () => {
    const res = await eventService.fetchPublicEvents();
    setUpcomingEvents(res.upcomingEvents);
    setPastEvents(res.pastEvents);
    setOpenEvents(res.openEvents);
  };

  // Sync published events from browser storage whenever user visits or events/registrations update
  useEffect(() => {
    void loadEvents();
    return storageService.subscribe(
      [STORAGE_KEYS.EVENTS, STORAGE_KEYS.REGISTRATIONS],
      () => {
        void loadEvents();
      },
    );
  }, [location.key]);

  // Smooth scroll to hash if navigated from subpages
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      window.setTimeout(() => {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }, 60);
    }
  }, [location.hash, reducedMotion]);

  // GSAP ScrollTrigger driving 3D camera progress & active section state
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
        },
      });

      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => setActiveSection(id === 'universe' ? 'about' : id),
          onEnterBack: () => setActiveSection(id === 'universe' ? 'about' : id),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const handleSelectEventForRegistration = (event: GdgEvent) => {
    setPreselectedEventId(event.id);
    scrollToSection('register');
  };

  const handleRegistrationCompleted = () => {
    void loadEvents();
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#080B18] text-slate-100">
      <DeveloperUniverseCanvas
        scrollProgressRef={scrollProgressRef}
        successBurstActive={successBurstActive}
        showHeroLogo
      />

      <Navbar activeSection={activeSection} />

      <main className="relative z-10">
        <HeroSection
          onExploreEvents={() => scrollToSection('events')}
          onJoinExperience={() => scrollToSection('register')}
        />

        <DeveloperUniverseSection />

        <AboutSection />

        <EventsSection
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          onSelectEventForRegistration={handleSelectEventForRegistration}
        />

        <RegistrationSection
          openEvents={openEvents}
          preselectedEventId={preselectedEventId}
          onBackToEvents={() => scrollToSection('events')}
          onSuccessChange={setSuccessBurstActive}
          onRegistrationCompleted={handleRegistrationCompleted}
        />

        <CommunityFooter />
      </main>
    </div>
  );
};
