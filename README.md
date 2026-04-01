# Swift Help

Monorepo for the Swift Help product.

## Project Layout

- `web/` - Next.js frontend (App Router, TypeScript, Sonner toasts)
- `mobile-expo/` - mobile app workspace

## Run the Web App

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Run the Mobile App

```bash
cd mobile-expo
npm install
npm run start
```

## Web Scripts

From `web/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Current Main Routes (Web)

- `/` - Landing page
- `/get-started` - Welcome page (entry point)
- `/get-started/create-account`
- `/get-started/login`
- `/get-started/otp`
- `/patient/onboarding/one`
- `/patient/onboarding/two`
- `/professional/onboarding/one`
- `/professional/onboarding/two`
- `/professional/onboarding/three`
- `/organisation/onboarding/one`
- `/organisation/onboarding/two`
- `/organisation/onboarding/three`
- `/patient-platform` - Patient app shell entry
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

## Patient Platform Flows

- Appointment flow: `/patient-platform/appointments` -> `book` -> `schedule` -> `details` -> `confirmed`
- Consultation flow: `/patient-platform/consultations` -> `live` -> `rate` -> `complete`
- Empty consultation state: `/patient-platform/consultations/no-consultation`
- Symptom checker flow: `/patient-platform/symptom-checker` -> `assessment` -> `details` -> `recommendation`
- Medical records flow: `/patient-platform/medical-records` -> `list` -> `summary` -> `recommendation`

## Deployment (Vercel)

If deploying the web app on Vercel, use:

- **Root Directory:** `web`
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (default)

## Notes

- Node.js 18+ is recommended.
- Assets used by the landing and onboarding pages are in `web/public/`.
- Phone inputs are implemented with `react-international-phone`.
- Form validation feedback uses Sonner toasts.
