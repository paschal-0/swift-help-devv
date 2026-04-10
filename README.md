# Swift Help

Swift Help is a healthcare product monorepo with:

- a web experience built in Next.js
- an Expo mobile workspace

The current repo is primarily a frontend prototype with polished route flows, reusable platform shells, and static/sample data for patient, professional, and organisation journeys.

## Repository Layout

- `web/` - main product surface, built with Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, Sonner, and Chart.js
- `mobile-expo/` - Expo React Native workspace for the early mobile onboarding flow

## Current Product Areas

### Web

- Marketing landing page
- Get started flow: welcome, create account, login, OTP
- Patient onboarding
- Professional onboarding
- Organisation onboarding
- Patient platform: dashboard, appointments, consultations, symptom checker, medical records, profile, help, settings
- Professional platform: dashboard, schedule, requests, earnings, profile, help, settings

### Mobile

- Splash screen
- Get started role selection
- Create account screen

## Current State

What exists today:

- detailed UI flows across the web app
- responsive patient and professional dashboard shells
- client-side form validation and toast feedback
- local component state for interactions and mock workflows

What does not appear to be wired yet:

- backend/API integration
- real authentication
- database persistence
- shared app-wide data layer
- automated tests

This means most screens currently behave like a high-fidelity frontend prototype rather than a connected production system.

## Getting Started

### Web App

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

Available scripts from `web/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Mobile App

```bash
cd mobile-expo
npm install
npm run start
```

Other mobile scripts:

```bash
npm run android
npm run ios
```

## Main Web Routes

### Public

- `/` - landing page
- `/get-started`
- `/get-started/create-account`
- `/get-started/login`
- `/get-started/otp`

### Onboarding

- `/patient/onboarding/one`
- `/patient/onboarding/two`
- `/professional/onboarding/one`
- `/professional/onboarding/two`
- `/professional/onboarding/three`
- `/organisation/onboarding/one`
- `/organisation/onboarding/two`
- `/organisation/onboarding/three`

### Patient Platform

- `/patient-platform`
- `/patient-platform/dashboard`
- `/patient-platform/appointments`
- `/patient-platform/appointments/book`
- `/patient-platform/appointments/schedule`
- `/patient-platform/appointments/details`
- `/patient-platform/appointments/confirmed`
- `/patient-platform/consultations`
- `/patient-platform/consultations/live`
- `/patient-platform/consultations/rate`
- `/patient-platform/consultations/complete`
- `/patient-platform/consultations/no-consultation`
- `/patient-platform/symptom-checker`
- `/patient-platform/symptom-checker/assessment`
- `/patient-platform/symptom-checker/details`
- `/patient-platform/symptom-checker/recommendation`
- `/patient-platform/medical-records`
- `/patient-platform/medical-records/list`
- `/patient-platform/medical-records/summary`
- `/patient-platform/medical-records/recommendation`
- `/patient-platform/my-profile`
- `/patient-platform/help`
- `/patient-platform/settings`

### Professional Platform

- `/professional-platform`
- `/professional-platform/dashboard`
- `/professional-platform/schedule`
- `/professional-platform/requests`
- `/professional-platform/earnings`
- `/professional-platform/my-profile`
- `/professional-platform/help`
- `/professional-platform/settings`

## Notable Web Flows

- Patient appointments: `/patient-platform/appointments` -> `book` -> `schedule` -> `details` -> `confirmed`
- Patient consultations: `/patient-platform/consultations` -> `live` -> `rate` -> `complete`
- Symptom checker: `/patient-platform/symptom-checker` -> `assessment` -> `details` -> `recommendation`
- Medical records: `/patient-platform/medical-records` -> `list` -> `summary` -> `recommendation`
- Professional onboarding: `/professional/onboarding/one` -> `two` -> `three` -> `/professional-platform`

## Deployment

For Vercel deployment of the web app:

- Root Directory: `web`
- Build Command: `npm run build`
- Output Directory: `.next`

## Notes

- Node.js 18+ works for the web app.
- `mobile-expo/package.json` declares Node `20.x`.
- Shared web assets are stored in `web/public/`.
- Phone inputs on web use `react-international-phone`.
- Toast notifications on web use `sonner`.
