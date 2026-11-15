export interface VerifiedChapterLink {
  label: string;
  url: string;
  handle?: string;
  kind: 'chapter' | 'university' | 'social';
}

export interface FocusDomain {
  id: string;
  title: string;
  summary: string;
  accentHex: string;
}

export const CHAPTER_INFO = {
  shortBrand: 'GDG UPES',
  officialTitle: 'GDG on Campus University of Petroleum and Energy Studies - Dehradun, India',
  displayChapterName: 'Google Developer Groups on Campus — UPES',
  location: 'Dehradun, Uttarakhand, India',
  campuses: 'UPES Bidholi & Kandoli Campuses',
  chapterId: 1783,
  verifiedMemberCount: 3494,
  verifiedCompletedEventCount: 13,
  missionParagraphs: [
    'Google Developer Groups on Campus (GDGoC) at the University of Petroleum and Energy Studies, Dehradun is a student-led developer community within the global Google Developer Groups network.',
    'Our mission is to bridge the gap between theoretical coursework and real-world engineering by fostering peer-to-peer learning, technical mentorship, hands-on workshops, hackathons, and design sessions.',
    'From cloud infrastructure and generative AI to full-stack web engineering and product design, students across all schools and academic years collaborate to learn by doing and ship impactful projects together.',
  ],
  attributionNotice:
    'Community showcase and local event registration interface built for GDG on Campus UPES. All official chapter branding and historical event records reference publicly published information from gdg.community.dev. Not an official corporate site of Google LLC or UPES administration.',
} as const;

export const FOCUS_DOMAINS: FocusDomain[] = [
  {
    id: 'ai-ml',
    title: 'Artificial Intelligence & ML',
    summary:
      'Hands-on Generative AI Study Jams, Google Cloud AI Labs, model deployment workflows, and applied machine learning sessions.',
    accentHex: '#4285F4',
  },
  {
    id: 'cloud-devops',
    title: 'Cloud Computing & DevOps',
    summary:
      'Practical workshops covering Google Cloud, containerization with Docker, Kubernetes orchestration, and scalable architectures.',
    accentHex: '#34A853',
  },
  {
    id: 'software-web',
    title: 'Software & Web Development',
    summary:
      'Multi-month core cohorts such as Ascend, full-stack web tracks, Git workflows, Linux CLI mastery, and competitive programming.',
    accentHex: '#FBBC05',
  },
  {
    id: 'hackathons-design',
    title: 'Hackathons, Open Source & Design',
    summary:
      'Google Solution Challenge preparation, Dedicated Mentorship Program open-source onboarding, and Spectrum UI/UX workshops.',
    accentHex: '#EA4335',
  },
];

export const VERIFIED_LINKS: VerifiedChapterLink[] = [
  {
    label: 'Official GDG Chapter',
    url: 'https://gdg.community.dev/gdg-on-campus-university-of-petroleum-and-energy-studies-dehradun-india/',
    handle: 'gdg.community.dev',
    kind: 'chapter',
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/gdgupes',
    handle: '@gdgupes',
    kind: 'social',
  },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/gdsc-upes/',
    handle: 'linkedin.com/company/gdsc-upes',
    kind: 'social',
  },
  {
    label: 'GitHub',
    url: 'https://github.com/GDSC-UPES',
    handle: 'github.com/GDSC-UPES',
    kind: 'social',
  },
  {
    label: 'UPES Official',
    url: 'https://www.upes.ac.in/',
    handle: 'upes.ac.in',
    kind: 'university',
  },
  {
    label: 'UPES Student Engagement',
    url: 'https://www.upes.ac.in/student-space/student-engagement',
    handle: 'upes.ac.in/student-space',
    kind: 'university',
  },
];
