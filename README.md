# CPRG-303 Mobile Application Development Authentication with Supabase

This is the group assignment "Authentication with Supabase" for CPRG-303 

All code for this assignment was written by Doug Dickens and Daniel Carpintero

This assignment is about connecting to Supabase and authenticating users using it.

## Features

- **Sign-Up** - create an account with email, password and password confirmation
- **Sign-In** - log in with an existing account
- **Sign-Out** - end the session from the home screen
- **Form validation** - every form uses React Hook Form with Zod schemas, with an error under each field
- **Loading indicators** - a spinner shows while each auth request is running
- **Readable error messages** - invalid credentials, weak passwords, existing accounts and network errors are turned into clear messages
- **Protected navigation** - signed-out users can only reach Sign-In and Sign-Up, and signed-in users can only reach the home screen
- **Session restore** - a saved session is restored on launch, with a loading screen while it is checked
- **Signed-in user in the navigation bar** - the home screen title shows the user's email
- **Public data** - resources anyone can read are listed on the Sign-Up screen
- **RLS-protected data** - resources only signed-in users can read are listed on the home screen, with pull-to-refresh

## Tech Stack

- [Expo](https://expo.dev) SDK 58 with [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- React Native and TypeScript
- [Supabase](https://supabase.com) for authentication and the database
- [React Hook Form](https://react-hook-form.com) and [Zod](https://zod.dev) for form validation
- `expo-sqlite` localStorage for saving the session on the device

## Project Structure

```
src/
  app/
    _layout.tsx         Root layout: AuthProvider, session loading screen, protected routes
    index.tsx           Protected home screen with the RLS-protected resources list
    sign-in.tsx         Sign-In screen
    sign-up.tsx         Sign-Up screen with the public resources list
  components/
    SignOut.tsx         Sign Out button
  context/
    AuthProvider.tsx    Auth context: session state, useAuth hook, sign-up/in/out
  schemas/
    authSchemas.ts      Zod schemas for the sign-in and sign-up forms
  utils/
    authErrors.ts       Turns Supabase errors into readable messages
    supabase.ts         Supabase client created from environment variables
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- The [Expo Go](https://expo.dev/go) app on a phone, or an Android emulator / iOS simulator
- A [Supabase](https://supabase.com) project

### Add environment variables

Create a `.env` file in the project root (next to `package.json`):

```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Both values are in the Supabase dashboard under **Project Settings -> API**. The `.env` file is listed in `.gitignore`, so it is never committed.

## Supabase Setup

### Resources table

The app reads from a `resources` table:

| Column | Type | Notes |
|---|---|---|
| `id` | int8 | Primary key, identity |
| `title` | text | |
| `description` | text | |
| `is_public` | bool | `true` = shown on Sign-Up, `false` = signed-in users only |
| `created_at` | timestamptz | Defaults to now |

### Row Level Security

RLS is enabled on `resources`, with one policy for public rows and one for private rows:

```sql
alter table public.resources enable row level security;

-- Anyone, signed in or not, can read public rows
create policy "Public resources are readable by everyone"
on public.resources for select
to anon, authenticated
using (is_public = true);

-- Only signed-in users can read private rows
create policy "Private resources are readable by signed-in users"
on public.resources for select
to authenticated
using (is_public = false);
```

The table needs a few rows of each type for both lists to show data.

### Authentication settings

**Confirm email** is turned off under **Authentication -> Sign In / Providers -> Email**. Supabase's built-in email service only allows a few emails per hour, so with confirmation on, testing quickly hits a "too many emails" error. With it off, a new account is signed in straight away and goes to the home screen.

## How Authentication Works

1. `AuthProvider` restores any saved session with `supabase.auth.getSession()` and listens for changes with `onAuthStateChange`.
2. While the session is being restored, `_layout.tsx` shows a loading screen.
3. `_layout.tsx` uses `Stack.Protected` guards. With no session only Sign-In and Sign-Up can be reached; with a session only the home screen can.
4. When a user signs in, signs up or signs out, the session changes and the guards move the user to the right screen automatically. No manual navigation is needed.
5. The session is saved to device storage, so users stay signed in after closing the app.

## Error Handling

- Form input is checked by Zod before any request is sent, and each problem is shown under its field.
- Supabase errors are passed through `getAuthErrorMessage()` in `authErrors.ts`, so the user always sees a readable message instead of a raw error.
- Failed data requests show a message instead of crashing. The home screen also has a **Try Again** button.

## Security

- The Supabase URL and publishable key are stored in environment variables in `.env`, which is listed in `.gitignore`.
- No keys are hardcoded in the code.
- The resources table is protected with Row Level Security, so private rows are only returned to signed-in users.

## Contributions

**Douglas Dickens**
- Removed the unused Expo starter code
- Zod validation schemas, including password confirmation
- Authentication error messages
- Sign-In and Sign-Up screens with React Hook Form and loading indicators
- Public resources list on the Sign-Up screen
- Code comments and README

**Daniel Carpintero**
- Project setup and Supabase installation
- Supabase client and environment variable configuration
- AuthProvider context and session restore
- Protected navigation and the session loading screen
- Sign Out component
- Protected home screen and auth state improvements

**Both**
- Supabase table and RLS setup
- Testing and final review

## AI Usage Disclamer

AI was used for the following in this project:
- To generate comments in the code
- To help quickly make this readme
- To help with styling as this assignment is more focused on the supabase side then the styling side
- Some slight debugging in places like making sure all the expo starter code was removed because we did that out of order