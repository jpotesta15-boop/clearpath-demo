# ClearPath Client Setup Guide

This guide walks you through setting up a new client instance for ClearPath Coach OS.

## Prerequisites

- Supabase project created and configured
- Supabase URL and anon key available
- Client intake information collected
- PowerShell (for Windows) or Bash (for Linux/Mac)

## Quick Start

### 1. Run the Client Creation Script

```powershell
# Windows PowerShell
cd C:\Users\jpote\OneDrive\Desktop\CLEARPATH
.\scripts\create-client.ps1 `
  -ClientName "client-name" `
  -BusinessName "Client Business Name" `
  -ClientEmail "coach@client.com" `
  -SupabaseUrl "https://your-project.supabase.co" `
  -SupabaseAnonKey "your-anon-key" `
  -PrimaryColor "#0284c7" `
  -SecondaryColor "#0369a1"
```

**Parameters:**
- `ClientName` (required): Unique identifier for the client (e.g., "acme-fitness")
- `BusinessName` (optional): Display name for the business
- `ClientEmail` (optional): Coach's email address
- `SupabaseUrl` (optional): Your Supabase project URL
- `SupabaseAnonKey` (optional): Your Supabase anon key
- `PrimaryColor` (optional): Primary brand color (hex)
- `SecondaryColor` (optional): Secondary brand color (hex)

### 2. Install Dependencies

```bash
cd clients/[client-name]
npm install
```

### 3. Set Up Supabase Database

#### A. Run Initial Schema Migration

1. Go to Supabase Dashboard → SQL Editor
2. Open `template/supabase/migrations/20240101000000_initial_schema.sql`
3. Copy and paste into SQL Editor
4. Click "Run"

#### B. Run Tenant Isolation Migration

1. Open `template/supabase/migrations/20240102000000_add_tenant_isolation.sql`
2. Copy and paste into SQL Editor
3. Click "Run"

### 4. Create Coach User in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `coach@client.com` (or from intake)
   - Password: (generate secure password)
   - Auto Confirm User: ON
4. Click "Create User"
5. **Copy the User UID** (you'll need this)

### 5. Add Coach Profile

Run this SQL in Supabase SQL Editor (replace `USER_UUID` and `CLIENT_ID`):

```sql
INSERT INTO public.profiles (id, email, full_name, role, tenant_id)
VALUES (
  'USER_UUID',
  'coach@client.com',
  'Coach Name',
  'coach',
  'CLIENT_ID'  -- This should match NEXT_PUBLIC_CLIENT_ID from .env.local
);
```

**Important:** The `tenant_id` must match the `NEXT_PUBLIC_CLIENT_ID` value in the client's `.env.local` file.

### 6. Start the Development Server

```bash
cd clients/[client-name]
npm run dev
```

The app will be available at `http://localhost:3000`

## Client Configuration

Each client instance has two configuration files:

### `.env.local`
Contains environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLIENT_ID=client-id
NEXT_PUBLIC_CLIENT_NAME=Client Name
NEXT_PUBLIC_BRAND_PRIMARY=#0284c7
NEXT_PUBLIC_BRAND_SECONDARY=#0369a1
```

### `client-config.json`
Contains client-specific settings:
```json
{
  "clientName": "Client Name",
  "businessName": "Business Name",
  "brandColors": {
    "primary": "#0284c7",
    "secondary": "#0369a1"
  },
  "supabaseClientId": "client-id",
  "features": {
    "groupSessions": true,
    "videoLibrary": true
  }
}
```

## Database Operations

### Important: Setting client_id

All database inserts must include `client_id`. Use the helper function:

```typescript
import { insertWithClientId } from '@/lib/db-helpers'

// Instead of:
await supabase.from('clients').insert({ name: 'John', email: 'john@example.com' })

// Use:
await insertWithClientId(supabase, 'clients', { name: 'John', email: 'john@example.com' })
```

This automatically adds the `client_id` from `NEXT_PUBLIC_CLIENT_ID`.

## Multi-Tenant Isolation

The system uses Row Level Security (RLS) to isolate data between clients:

- Each client has a unique `client_id` (stored in `NEXT_PUBLIC_CLIENT_ID`)
- All database tables have a `client_id` column
- RLS policies filter data by `client_id`
- Users' `tenant_id` in profiles table must match their client's `client_id`

## Deployment

Each client instance can be deployed separately:

1. **Vercel** (recommended):
   ```bash
   cd clients/[client-name]
   vercel
   ```
   Add environment variables in Vercel dashboard

2. **Netlify**:
   ```bash
   cd clients/[client-name]
   netlify deploy
   ```

3. **Other platforms**: Follow Next.js deployment guides

## Updating the Template

When you update the template code:

1. Make changes in `template/` directory
2. For each client, copy updated files:
   ```powershell
   # Copy specific files/folders from template to client
   robocopy template\app clients\[client-name]\app /E
   robocopy template\components clients\[client-name]\components /E
   # etc.
   ```
3. Or use the update script (if created):
   ```powershell
   .\scripts\update-template.ps1 -ClientName "client-name"
   ```

## Troubleshooting

### Issue: "client_id does not exist" error
**Solution:** Make sure you've run the tenant isolation migration (`20240102000000_add_tenant_isolation.sql`)

### Issue: User can't see their data
**Solution:** 
1. Check that `tenant_id` in profiles table matches `NEXT_PUBLIC_CLIENT_ID`
2. Verify RLS policies are active
3. Check that `client_id` is set on all data inserts

### Issue: Branding not showing
**Solution:**
1. Check `client-config.json` exists and is valid JSON
2. Verify `NEXT_PUBLIC_CLIENT_NAME` is set in `.env.local`
3. Restart the dev server after changing config

## Support

For issues or questions, refer to:
- `knowledge/command_playbook.md` - AI assistant guidelines
- `knowledge/generation_rules.md` - Client generation process
- `operations/onboarding_checklist.md` - Client onboarding checklist

