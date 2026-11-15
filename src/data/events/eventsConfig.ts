import { GdgEvent } from '../../types';

/**
 * Editable Local Event Configuration for GDG on Campus UPES.
 *
 * Add genuine upcoming events to `UPCOMING_EVENTS_CONFIG` with `registrationOpen: true`
 * when officially announced on https://gdg.community.dev/gdg-on-campus-university-of-petroleum-and-energy-studies-dehradun-india/
 *
 * NOTE: As of the latest verified chapter sync, 0 upcoming events are officially listed.
 * Do not invent fictional upcoming events here; organizers can also configure or reopen
 * sessions locally via the Participant & Event Management console (/participants).
 */
export const UPCOMING_EVENTS_CONFIG: GdgEvent[] = [];

/**
 * Verified historical events published by GDG on Campus UPES (Chapter #1783)
 * on gdg.community.dev. Registration is disabled by default for completed events.
 */
export const PAST_EVENTS_ARCHIVE_CONFIG: GdgEvent[] = [
  {
    id: 'ai-labs-26-workshop',
    name: "AI Labs'26 Workshop: Google Cloud & AI/ML",
    shortDescription:
      'Inaugural hands-on workshop exploring Artificial Intelligence and Machine Learning on Google Cloud with GDE speakers.',
    description:
      "AI Labs'26 Workshop: Google Cloud & AI/ML at UPES, Dehradun featuring Regional Lead Harsh Dattani (Google Developers Community, Bengaluru) and Google Developer Expert Rishiraj Acharya (Kolkata). Covered practical AI and Machine Learning workflows on Google Cloud.",
    category: 'AI & ML',
    date: '13 Feb 2026',
    time: '10:00 AM – 01:00 PM IST',
    venue: 'UPES Campus, Dehradun',
    format: 'In-Person',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/mjxvgk/',
    speakers: ['Harsh Dattani (Regional Lead, Google Developers Community)', 'Rishiraj Acharya (Google Developer Expert)'],
  },
  {
    id: 'ascend-2026-geu-upes',
    name: 'Ascend 2026 — GDG GEU x UPES Core Cohort',
    shortDescription:
      '5-month collaborative core cohort program co-hosted by GDG on Campus GEU & UPES across Web, Cloud, CP, and AI/ML.',
    description:
      'Collaborative 5-month structured core cohort co-organized by Google Developer Groups on Campus Graphic Era University and UPES. Weekly guided workshops and mentorship tracks spanning Web Development, Cloud Computing, Competitive Programming, and AI/ML.',
    category: 'Web & Cohort',
    date: '01 Feb – 30 Jun 2026',
    time: '07:00 PM – 08:00 PM IST',
    venue: 'Online Cohort (GDG GEU x UPES)',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/mc9w9p/',
  },
  {
    id: 'master-the-cloud-docker-k8s',
    name: 'Master the Cloud: Docker & Kubernetes Workshop',
    shortDescription:
      'Practical multi-hour session on containerization with Docker and core Kubernetes concepts (pods, deployments, services).',
    description:
      'Hands-on cloud engineering workshop introducing students to containerization with Docker, writing Dockerfiles, and orchestrating scalable workloads using Kubernetes pods, deployments, and services.',
    category: 'Cloud & DevOps',
    date: '28 Nov 2025',
    time: '12:00 PM – 03:00 PM IST',
    venue: 'UPES Dehradun & Online',
    format: 'Hybrid',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/m42ws2/',
  },
  {
    id: 'gdg-upes-2025-info-session',
    name: 'GDG on Campus UPES 2025 – Info Session',
    shortDescription:
      'Annual chapter onboarding session introducing incoming UPES developers to Google Developer Groups tracks and community culture.',
    description:
      'Official 2025–26 kickoff info session introducing students across all UPES schools to GDG on Campus UPES, upcoming technical tracks, Solution Challenge pathways, and core team mentorship.',
    category: 'Community & Info',
    date: '19 Sep 2025',
    time: '06:15 PM – 08:00 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/m9gbd8/',
  },
  {
    id: 'dmp-informative-session-2025',
    name: 'DMP Informative Session',
    shortDescription:
      'Open-source orientation covering C4GT Dedicated Mentorship Program contributions to Digital Public Goods.',
    description:
      'Informative session focused on the Dedicated Mentorship Program (DMP) under Code for GovTech (C4GT), guiding students on contributing to open-source Digital Public Infrastructure and Digital Public Goods.',
    category: 'Community & Info',
    date: '21 Apr 2025',
    time: '08:00 PM – 09:00 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/mc47u8/',
  },
  {
    id: 'spectrum-design-workshop-2025',
    name: 'Spectrum — The Design Workshop',
    shortDescription:
      'Interactive UI/UX and product design session covering visual hierarchy, prototyping, and developer-designer handoff.',
    description:
      'Community design workshop focused on user interface craftsmanship, design systems, prototyping workflows, and bridging product design with modern frontend engineering.',
    category: 'Design',
    date: '19 Jan 2025',
    time: '08:45 PM – 11:00 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/m6vdgq/',
  },
  {
    id: 'solution-challenge-2025',
    name: 'Solution Challenge 2025 Orientation',
    shortDescription:
      'Kickoff & ideation briefing for teams building UN SDG-aligned software solutions using Google technologies.',
    description:
      'Preparation and ideation briefing for the annual Google Solution Challenge, helping UPES student teams scope impactful real-world problems and architect scalable prototypes.',
    category: 'Web & Cohort',
    date: '14 Jan 2025',
    time: '08:45 PM – 10:00 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/mv5vss/',
  },
  {
    id: 'shell-shocked-linux-2024',
    name: 'Shell Shocked',
    shortDescription:
      'Practical Linux operating system fundamentals, terminal navigation, scripting, and command-line productivity.',
    description:
      'Hands-on command-line workshop introducing students to Linux environments, shell scripting, file permissions, process management, and everyday developer tooling.',
    category: 'Security & Systems',
    date: '23 Nov 2024',
    time: '08:45 PM – 10:30 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/m8ubwd/',
  },
  {
    id: 'get-set-git-3-0',
    name: 'GET SET GIT 3.0',
    shortDescription:
      'In-person Git & GitHub bootcamp covering branching, pull requests, merge conflict resolution, and open-source etiquette.',
    description:
      'Campus workshop teaching version control from scratch: Git internals, branching strategies, collaborative pull requests, and clean commit practices for team engineering.',
    category: 'Web & Cohort',
    date: '06 Nov 2024',
    time: '10:00 AM – 01:00 PM IST',
    venue: 'UPES Campus, Dehradun',
    format: 'In-Person',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/mp9xdm/',
  },
  {
    id: 'genai-study-jams-2024',
    name: 'GenAI Study Jams',
    shortDescription:
      'Guided study jam exploring Generative AI concepts, prompt engineering, and cloud AI foundations.',
    description:
      'Peer-led GenAI Study Jam helping UPES students gain hands-on experience with Generative AI labs, foundation models, and Google Cloud AI tooling.',
    category: 'AI & ML',
    date: '19 Oct 2024',
    time: '02:45 PM – 04:00 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/mv4y8k/',
  },
  {
    id: 'unplugged-iot-2024',
    name: "UNPLUGGED: Delving into the 'Internet of Things'",
    shortDescription:
      'Interactive exploration of connected sensors, embedded hardware protocols, and industrial IoT applications.',
    description:
      'Technical deep-dive into IoT architectures, microcontroller connectivity, telemetry pipelines, and real-world smart device deployments.',
    category: 'Security & Systems',
    date: '21 Sep 2024',
    time: '10:45 AM – 12:45 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/m8nxad/',
  },
  {
    id: 'cybersec-101-2024',
    name: 'CyberSec 101: An Intro To Cybersecurity',
    shortDescription:
      'Foundational cybersecurity workshop covering threat modeling, web security basics, and defensive practices.',
    description:
      'Two-day introductory cybersecurity series introducing students to security fundamentals, common vulnerabilities, and safe engineering habits.',
    category: 'Security & Systems',
    date: '14–15 Sep 2024',
    time: '08:45 PM – 11:00 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/myhjnc/',
  },
  {
    id: 'gdg-on-campus-info-session-2024',
    name: 'GDG on Campus Info Session (2024)',
    shortDescription:
      'Inaugural chapter transition session welcoming the UPES community to Google Developer Groups on Campus.',
    description:
      'Opening orientation introducing the transition to Google Developer Groups on Campus at UPES Dehradun, sharing the annual roadmap and community opportunities.',
    category: 'Community & Info',
    date: '12 Sep 2024',
    time: '09:00 PM – 10:00 PM IST',
    venue: 'Virtual Session',
    format: 'Virtual',
    status: 'completed',
    registrationOpen: false,
    feeType: 'free',
    feeAmount: 0,
    capacity: null,
    officialUrl: 'https://gdg.community.dev/e/m2tmgn/',
  },
];
