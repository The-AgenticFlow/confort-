# Confort Lounge — Frontend

React + Vite PWA for Wi-Fi time purchase.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in your keys.
3. Run locally: `npm run dev`
4. Build for production: `npm run build`

## PWA

The app is configured as a Progressive Web App via `vite-plugin-pwa`.
Service workers cache the UI shell for instant loading on the lounge Wi-Fi.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public, no DB access) |
| `VITE_SUPABASE_SERVICE_KEY` | Supabase service role key (API only) |
| `VITE_CINETPAY_API_KEY` | CinetPay API key |
| `VITE_CINETPAY_SITE_ID` | CinetPay site ID |
| `VITE_MANAGER_PIN` | Manager PIN for admin actions |
