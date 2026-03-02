# Production Readiness Review

Structured review of the ClearPath demo app: what is solid, what is missing, and how to tighten it for production.

---

## Summary

**How close to production:** Demo-ready with a clear path. Core coach and client flows work; auth (Google + client invite) and video automation are in place. To reach production-ready: finish env and Supabase config (Google OAuth, invite emails, webhook secret), add a single middleware for protected routes, harden error handling and a few edge cases, then run through the checklist below. **Rough estimate: 1–2 sprints** after the demo is stable.

---

## Strengths

- **RLS and tenant isolation.** Tables are scoped by `get_current_client_id()` and coach/client role. Policies are consistent for clients, programs, videos, sessions, messages, and (after the new migration) video_assignments.
- **Coach flows.** Dashboard, clients (list + detail + notes), schedule (calendar, book session, day view, session notes, mark completed/canceled), programs (multi-type lessons, assign to clients), and videos (add by URL, assign from library) form a complete loop.
- **Client flows.** Dashboard, programs, videos, schedule, messages are in place. “Client not found” states direct users to contact their coach and get an invite.
- **Auth.** Email/password and Google sign-in, auth callback, and `handle_new_user` trigger so new users get a profile (first user = coach, rest = client). Coach invite creates an auth user and sends a Supabase invite email.
- **Automation.** n8n webhook API for adding videos from Google Drive; paste-link + assign-from-library for manual use.
- **Docs.** `auth-google.md`, `n8n-google-drive-video.md`, `CLIENT_PORTAL_GUIDE.md`, and this review give a clear path for setup and next steps.

---

## Gaps and Risks

| Area | Gap / risk | Severity |
|------|------------|----------|
| Auth | No middleware: `/coach/*` and `/client/*` protection is only in layouts; a direct hit to a route before layout can briefly expose content. | Medium |
| Auth | Google OAuth and “Redirect URLs” must be set in Supabase and (for Google) in Google Cloud Console; wrong URLs break sign-in. | High if misconfigured |
| Auth | Invite emails depend on Supabase (or custom SMTP). If email is not configured, invite fails silently or with a generic error. | Medium |
| API | Webhook and invite API have no rate limiting; abuse could create many rows or invites. | Medium |
| Data | No `tenant_id` on profile at sign-up (trigger doesn’t set it); app sets it on first request. First request before tenant is set could hit RLS edge cases. | Low |
| UX | Some forms use `alert()` for errors; replacing with inline messages would be more consistent. | Low |
| Ops | No single env checklist; missing `SUPABASE_SERVICE_ROLE_KEY` or `N8N_VIDEO_WEBHOOK_SECRET` causes runtime errors. | Medium |
| Security | Service role key must only be used server-side (API routes / server code); never in client bundle. Current usage (API routes, server-only lib) is correct. | — |

---

## Recommended Order of Work

1. **Config and auth**
   - Set Google OAuth redirect URLs (Supabase + Google Cloud).
   - Configure Supabase email (or SMTP) so invite emails send.
   - Add `SUPABASE_SERVICE_ROLE_KEY` and `N8N_VIDEO_WEBHOOK_SECRET` (and optional `N8N_DEFAULT_COACH_ID`) to env; document in a short “Deploy checklist”.

2. **Middleware**
   - Add a single middleware that protects `/coach` and `/client`: if unauthenticated, redirect to `/login`; if authenticated, optionally redirect `/` to role-based dashboard. This avoids relying only on layouts.

3. **Hardening**
   - Replace remaining `alert()` with inline error messages where it matters (e.g. login, invite).
   - Validate webhook body (e.g. URL format, title length) and log failures for debugging.
   - Ensure “client not found” and invite CTA are consistent (already done in client pages).

4. **Optional before production**
   - Rate limit login and webhook/invite APIs (e.g. by IP or key).
   - Add a simple health check route (e.g. `/api/health`) for monitoring.
   - Run the new migrations (`20240107000000_handle_new_user.sql`, `20240108000000_coach_video_assignments.sql`) on the production DB.

---

## Concrete Tips

1. **Add `handle_new_user` and coach video_assignments migrations**  
   Apply `20240107000000_handle_new_user.sql` and `20240108000000_coach_video_assignments.sql` in all environments so new sign-ups get a profile and coaches can assign videos from the library.

2. **Validate webhook body and log failures**  
   In `app/api/webhooks/n8n-video/route.ts`, validate `url` (e.g. must start with `http` and be a valid URL) and optionally cap `title` length. On error, log and return a clear message so n8n or you can debug.

3. **Single middleware for /coach and /client**  
   Create `middleware.ts` at the app root: get session (e.g. via Supabase getSession in middleware or a small helper), then if path starts with `/coach` or `/client` and there is no user, redirect to `/login`. Optionally redirect `/` to `/coach/dashboard` or `/client/dashboard` based on role.

4. **Client not found → CTA**  
   Already done: client dashboard, programs, videos, schedule, and messages show a short message and “Contact your coach / Back to login” when there is no client record.

5. **Env checklist**  
   Maintain a short list: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_CLIENT_ID`, `N8N_VIDEO_WEBHOOK_SECRET`, optional `N8N_DEFAULT_COACH_ID`. For Google: Client ID and Secret in Supabase; redirect URI in Google Cloud. For invite: Supabase email settings or custom SMTP.

6. **Replace alert() on login**  
   Use a state variable (e.g. `loginError`) and render an inline error message below the form instead of `alert(error.message)` so the experience is consistent with the rest of the app.

7. **Production redirect URIs**  
   When deploying, add the production base URL to Supabase “Redirect URLs” and set “Site URL” to the production URL. In Google OAuth, add the production callback URL.

8. **HTTPS**  
   Use HTTPS in production so cookies and OAuth redirects are secure.

9. **Dependency hygiene**  
   Run `npm audit` and fix critical/high issues; keep Next.js and Supabase packages up to date within your support window.

10. **Invite error handling**  
    If `inviteUserByEmail` fails (e.g. user already exists), show a clear message: “This email already has an account” or “Invite could not be sent. Check Supabase email settings.” so the coach knows what to do.

---

## Quick Reference

- **Deploy checklist:** [docs/DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)
- **Auth:** [docs/auth-google.md](auth-google.md)
- **Client portal:** [docs/CLIENT_PORTAL_GUIDE.md](CLIENT_PORTAL_GUIDE.md)
- **n8n + Drive:** [docs/n8n-google-drive-video.md](n8n-google-drive-video.md)
- **Coach product feedback:** [docs/KICKBOXING_COACH_REVIEW.md](KICKBOXING_COACH_REVIEW.md)
