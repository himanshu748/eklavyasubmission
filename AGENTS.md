# Repository Guidelines

## Project Shape
- React/Vite source lives in `src/`.
- Supabase Edge Function code lives in `supabase/functions/explain-topic/`.
- Do not commit real `.env` files. Keep only `.env.example` with placeholders.

## Local Commands
- Install dependencies with `npm install`.
- Run development server with `npm run dev`.
- Verify changes with `npm run lint`, `npm run build`, and `npm run test` when tests are present.
- Use `node --check` only for plain JavaScript files; TypeScript is checked by the build.

## Security Notes
- Treat AI output as untrusted. Keep KaTeX `trust` disabled for model-generated math.
- Validate topic input on both frontend and edge function.
- Validate generated explanation structure on both frontend and edge function before rendering.
- Keep Edge Function CORS origin handling explicit through `ALLOWED_ORIGINS`; do not reintroduce wildcard origins.
- Do not return raw provider errors or secret/config details to the browser.
