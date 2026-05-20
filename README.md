<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5ccfb765-b7fe-4fca-b35c-79857ad29c01

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure [.env.local](.env.local) with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (optional for future AI features)
3. Apply database migrations in Supabase SQL Editor using:
   - `supabase/migrations/20260519213000_init_time_de_troca.sql`
   - `supabase/migrations/20260519224500_skillnet_expansion.sql`
   - `supabase/migrations/20260519231000_app_login.sql`
   - `supabase/migrations/20260519232000_register_user_rpc.sql`
   - `supabase/migrations/20260519233500_fix_auth_hashing.sql` (correção caso apareça erro de `digest`)
4. Run the app:
   `npm run dev`
5. Login:
   - username: e-mail do perfil (ex: `rafael.o@uemasul.edu.br`)
   - senha para todos: `123321`
