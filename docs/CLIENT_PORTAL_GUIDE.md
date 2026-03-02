# Client portal guide

This guide describes what clients see and how they get access.

## How clients get access

1. **Coach adds the client**  
   The coach enters the client’s name and email in **Clients → Add Client** and can check **“Send portal invite”**. The client receives an email from Supabase with a link to set their password and sign in.

2. **First sign-in**  
   The client clicks the link in the invite email, sets a password, and is redirected to the app. They can then log in at **Login** with that email and password.

3. **If the client doesn’t have an account yet**  
   If the client was added without “Send portal invite,” they won’t have a login. The coach can either add them again with the invite option or use a future “Resend invite” from the client’s detail page.

## What the client sees

After logging in, the client has a sidebar with:

- **Dashboard** – Welcome message, upcoming sessions, and a summary of assigned programs.
- **Programs** – Training programs the coach has assigned (videos, links, notes, images).
- **Schedule** – Upcoming sessions and calendar.
- **Videos** – Videos the coach has assigned to them (individually or via programs).
- **Messages** – Direct messages with the coach.

The client only sees their own data: their sessions, their programs, and their messages. They cannot see other clients or coach-only areas.

## If “Client profile not found” appears

If a client logs in and sees **“Client profile not found”** or **“Client not found”**, it usually means:

- There is no **client** record with their email for this tenant, or  
- They were invited but the coach hasn’t added them to the client list yet (e.g. invite was sent before adding the client).

They should **contact their coach** and ask to be added as a client (with their email) and to receive a portal invite. The coach can add them under **Clients → Add Client** and check **“Send portal invite.”**

## Logging in

- **Email + password** – Use the email and password set via the invite link, or the password they chose when they signed up.
- **Google** – If the coach’s site allows Google sign-in and the client uses the same email as on their client record, they can use “Sign in with Google” (the first user to sign up with Google becomes the coach in the demo; clients use the same login page and are routed to the client portal by role).

## Summary

| Step | Who | Action |
|------|-----|--------|
| 1 | Coach | Add client (name, email) and optionally “Send portal invite”. |
| 2 | Client | Receive email, click link, set password. |
| 3 | Client | Log in at the app’s Login page and use Dashboard, Programs, Schedule, Videos, Messages. |

For questions or access issues, the client should contact their coach.
