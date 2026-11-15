# GDG on Campus UPES — Immersive 3D Event Registration Portal

### Build. Connect. Innovate.

A premium, interactive 3D event registration platform designed for **Google Developer Groups on Campus (GDG) — University of Petroleum and Energy Studies (UPES), Dehradun**.

The platform combines immersive 3D web experiences, cinematic parallax scrolling, modern UI/UX, and event registration functionality to create an engaging digital environment for student developers.

Built using **React, TypeScript, Three.js, React Three Fiber, GSAP, and Tailwind CSS**, the project aims to transform conventional event registration into an interactive experience.

---

## Project Overview

The GDG UPES Event Registration Portal is a web application designed to streamline event discovery, student registration, and event management.

Instead of relying on conventional static interfaces, the platform introduces a futuristic developer universe with interactive 3D elements, animated transitions, and scroll-driven visual storytelling.

The application provides separate interfaces for students and administrators while maintaining a consistent visual identity.

## Key Features

### Immersive 3D Experience

- Cinematic 3D landing page.
- Interactive GDG-inspired visual environment.
- Scroll-driven camera movement and parallax effects.
- Floating geometric objects, orbital elements, and particle animations.
- Mouse-responsive interactions and perspective effects.
- Premium dark interface with Google-inspired accent colors.
- Responsive layouts for desktop and mobile.

### Student Portal

- Dedicated student signup and login interface.
- Three-step event registration process.
- Personal and university information collection.
- Form validation and duplicate registration prevention.
- Registration review and confirmation.
- Student dashboard and registration history.
- Event discovery and registration status.

### Admin Portal

- Separate administrator login interface.
- Event creation and editing.
- Open and close event registrations.
- Event publishing and management.
- Participant registration overview.
- Search and filtering functionality.
- Registration statistics.
- CSV export of participant records.

### Registration Workflow

**Step 1 — Personal Details**

Collect the participant's full name, email address, and phone number.

**Step 2 — University Details**

Collect university, branch/course, year of study, and selected event.

**Step 3 — Final Review**

Allow participants to review their details, check the event registration fee, and confirm their registration.

Free events can proceed directly to confirmation. Paid-event transactions require a separately configured payment integration.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, CSS |
| 3D Graphics | Three.js, React Three Fiber, Drei |
| Animation | GSAP, ScrollTrigger, Motion |
| Routing | React Router |
| Local Storage | Browser localStorage |
| Version Control | Git, GitHub |
| Deployment | Vercel |

## Project Architecture

The application follows a modular frontend architecture separating the public website, authentication interfaces, registration workflow, event management, and shared data services.

```text
gdg-upes-3d-event-portal/
├── public/
│   └── assets/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── Home/
│   │   ├── Student/
│   │   └── Admin/
│   ├── three/
│   ├── services/
│   ├── hooks/
│   ├── data/
│   ├── types/
│   └── styles/
├── package.json
├── vite.config.ts
└── README.md
```

*The structure above represents the intended modular organization; individual paths may differ in the generated project.*

---

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- A modern browser with WebGL support

### Installation

Clone the repository:

```bash
git clone https://github.com/realnimit1-byte/gdg-upes-3d-event-portal.git
```

Navigate to the project directory:

```bash
cd gdg-upes-3d-event-portal
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Production Build

```bash
npm run build
```

The compiled application is generated in the `dist` directory for a standard Vite configuration.

---

## Deployment

The application is designed for deployment using Vercel.

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Select the Vite framework preset.
4. Configure the build command as `npm run build`.
5. Set the output directory to `dist`.
6. Deploy the application.

**Live Website:** Add your verified Vercel deployment URL here.

**GitHub Repository:** https://github.com/realnimit1-byte/gdg-upes-3d-event-portal

---

## Data Storage and Authentication

The current frontend-first implementation uses browser-local storage for registration records and local account workflows.

This supports demonstrating event registration, duplicate prevention, registration history, participant management, and CSV export within the same browser profile.

**Important limitations:**

- Records are not synchronized across devices.
- Browser storage can be modified or cleared by users.
- Browser-local administrator access is not secure production authentication.
- Registration data should not be treated as a shared, authoritative database.
- Real student information should not be collected through a public deployment until appropriate backend security and privacy controls are implemented.

The architecture is intended to support future integration with a shared backend.

---

## Future Enhancements

Potential improvements include:

- Supabase or another secure backend.
- Role-based authentication and authorization.
- Shared PostgreSQL registration database.
- Email verification and confirmations.
- Secure administrator access.
- QR-based event check-in.
- Automated attendance management.
- Registration capacity and waitlists.
- Verified payment gateway integration.
- Event analytics and reporting.

---

## Design Philosophy

The project follows three principles:

**Immersion:** Create a visually engaging digital environment through genuine 3D graphics and cinematic scrolling.

**Functionality:** Make event discovery, registration, and management intuitive and reliable.

**Accessibility:** Balance advanced animation with responsive design, readable interfaces, and practical user interactions.

---

## Official References

- [GDG on Campus UPES](https://gdg.community.dev/gdg-on-campus-university-of-petroleum-and-energy-studies-dehradun-india/)
- [University of Petroleum and Energy Studies](https://www.upes.ac.in/)
- [Google Developer Groups](https://developers.google.com/community/gdg)

---

## Disclaimer

This project is an independently developed web application concept for GDG on Campus UPES.

Google Developer Groups, Google, UPES, and their respective logos and trademarks belong to their owners.

This repository does not imply official endorsement or authorization by Google or UPES.

---

## Developer

**Nimit**

B.Tech — Computer Science & Engineering  
University of Petroleum and Energy Studies, Dehradun

**GitHub:** [realnimit1-byte](https://github.com/realnimit1-byte)

**LinkedIn:** [nimit-cybersec](https://www.linkedin.com/in/nimit-cybersec/)

---

**Built with a passion for technology, community, and immersive web experiences.**
