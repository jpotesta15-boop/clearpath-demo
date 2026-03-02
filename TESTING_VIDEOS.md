# Quick test: Video flow (demo)

## 1. Coach – add a video

1. Start the demo app: from `clients/demo` run `npm run dev`.
2. Log in as the **coach** (the user whose profile has `tenant_id = 'demo'`).
3. Go to **Video Library** (or Coach → Videos).
4. Click **Add Video**.
5. Fill in: Title, Description, **Video URL** (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`), Category.
6. Submit.

- **Success:** The new video appears in the list and the form closes. No red error box.
- **Failure:** A red box shows the error (e.g. RLS or missing `client_id`). Check that the coach profile has `tenant_id = 'demo'` and that `NEXT_PUBLIC_CLIENT_ID=demo` is in `.env.local`.

## 2. Client – see an assigned video (optional)

To see a video on the **client** side, you need a **video assignment** in the DB.

**Option A – From Supabase (one-off test)**

1. In Supabase **Table Editor**, open `videos` and note the **id** of the video you added.
2. Open `clients` and note the **id** of a demo client (e.g. John or Sarah from seed).
3. In **SQL Editor** run (replace the UUIDs):

```sql
INSERT INTO public.video_assignments (video_id, client_id)
VALUES ('<video-uuid>', '<client-uuid>');
```

4. Log in as that **client** (or use the client’s email/password if you have one).
5. Go to **My Videos** (or Client → Videos). The assigned video should appear.

**Option B – When you have “Assign to client” in the UI**

Use the coach UI to assign the video to a client; then log in as that client and open My Videos.

---

When this works, you have a working demo flow; an agent can later tighten validation, loading states, and polish.

---

## Future: Video import (phone / automation)

For a later phase, consider:

- **File upload:** Supabase Storage bucket for videos; coach uploads from phone or desktop; app creates a `videos` row with `file_path` (and keeps or adds `url` for external links). Requires Storage RLS and an upload UI.
- **Automation / “Add from link”:** Coach pastes a link (Google Drive, Dropbox, or message link); app stores link and metadata; coach adds title/description and chooses “Save to library” and/or “Assign to client.” Can be extended with a simple ingestion job (e.g. “watch folder” or webhook) later.
