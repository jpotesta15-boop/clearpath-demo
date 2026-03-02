# Coach login with Google

## Supabase setup

1. In [Supabase Dashboard](https://app.supabase.com) go to **Authentication → Providers** and enable **Google**.
2. In [Google Cloud Console](https://console.cloud.google.com) create OAuth 2.0 credentials (Application type: Web application). Add authorized redirect URIs:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - For local dev you can use the same (Supabase accepts the redirect and then redirects to your app’s callback URL).
3. In Supabase, under **Authentication → URL Configuration**, set **Site URL** to your app URL (e.g. `http://localhost:3000` or your production URL). Add **Redirect URLs** to include:
   - `http://localhost:3000/auth/callback`
   - `https://<your-production-domain>/auth/callback`

## App behavior

- **Login page** ([`app/login/page.tsx`](../app/login/page.tsx)): “Sign in with Google” calls `signInWithOAuth({ provider: 'google' })` and sends the user to Supabase, which then redirects back to `/auth/callback`.
- **Callback** ([`app/auth/callback/route.ts`](../app/auth/callback/route.ts)): Exchanges the code for a session, sets cookies, then redirects to `/coach/dashboard` or `/client/dashboard` based on the user’s `profiles.role`.
- **Profile creation**: The trigger `handle_new_user` (migration `20240107000000_handle_new_user.sql`) runs after each new sign-up and inserts a row into `profiles`. The first user gets `role = 'coach'`; all others get `role = 'client'`. The app sets `profiles.tenant_id` on login from `NEXT_PUBLIC_CLIENT_ID` when the user hits the server.

## Demo coach role

For demo, the first user to sign up (Google or email) becomes the coach. To make an existing user a coach, update in SQL:

```sql
UPDATE public.profiles SET role = 'coach' WHERE id = '<user-uuid>';
```

To restrict coaches by email (e.g. only `@mygym.com`), you can change the trigger to set `role = 'coach'` when `NEW.email` matches a pattern; otherwise keep the “first user is coach” rule for simplicity.
