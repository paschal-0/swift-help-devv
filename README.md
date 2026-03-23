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
- `/get-started/otp`
- `/patient/onboarding/one`
- `/patient/onboarding/two`
- `/professional/onboarding/one`
- `/professional/onboarding/two`
- `/professional/onboarding/three`
- `/organisation/onboarding/one`
- `/organisation/onboarding/two`
- `/organisation/onboarding/three`

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
