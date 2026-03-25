# TRN Portal — Claude Code Context

## Project
The Realty Network (TRN) — private membership portal for international real estate professionals.

## Stack
- React + Vite (frontend only, no separate backend)
- Supabase (database + auth)
- Tailwind CSS + CSS variables
- React Router DOM

## Project Structure
client/
  src/
    pages/       — one file per route
    components/  — shared UI components
    lib/
      supabase.js — Supabase client
  public/
    logo.png
  .env
  index.css      — global styles + CSS variables

## Brand
- Background: #0a0a0a
- Card background: #111111
- Gold accent: #d7a042
- Text primary: #f2f2f2
- Text muted: #555555
- Heading font: Playfair Display (serif)
- Body font: Inter (sans-serif)

## CSS Variables (defined in index.css)
--bg-primary, --bg-card, --bg-warm, --border, --border-gold, --gold, --gold-dim
--text-primary, --text-secondary, --text-muted
--font-display, --font-body

## Shared CSS Classes (defined in index.css)
- .section-label — gold uppercase label
- .card — dark card with border
- .nav-grid — 2 col mobile, 3 col desktop
- .nav-card — clickable navigation card
- textarea::placeholder and textarea:focus styles match input equivalents

## Supabase Tables
- members (full_name, email, country, city, role, niche[], status, avatar_url, agency, languages[], can_help_with, looking_for, whatsapp, instagram, linkedin, bio, notes)
- videos (title, category, host, date, duration, embed_url)
- upcoming_calls (event_name, date, time, host, event_type, meeting_link, description, open_to)
- education_hub (title, type, category, file_link, description)
- referral_templates (name, type, version, download_link)
- deals (deal_name, originating_agent, originating_country, destination_agent, destination_country, property_type, property_value_min, property_value_max, commission_percent, stage, notes)

## Supabase Storage
- Bucket: "avatars" — stores member profile photos
- Public URL stored in members.avatar_url column
- Files named by user ID: {user.id}.{ext}, uploaded with upsert: true
- Avatar upload in Profile.jsx immediately saves avatar_url to members table (no need to click Save Profile for the photo alone)

## Routes
/login — public
/dashboard — members
/directory — members
/videos — members
/calls — members
/education — members
/templates — members
/deals — admin only (jake@therealty-network.com); non-admins see access-restricted card
/onboarding — members
/profile — members (edit own profile + avatar upload); linked from Dashboard nav card
/admin — Jake only

## Field Visibility Rules
- members.notes — admin only, shown in Admin.jsx members tab only, never in member-facing views
- members.status — admin only, never shown in member popup or profile page
- members.bio — shown on Profile.jsx edit form, NOT shown in MemberDirectory popup (admin may see it separately)
- All other members fields are shown in MemberDirectory popup if populated

## Member Directory Popup (MemberDirectory.jsx)
- MemberModal component defined inside MemberDirectory.jsx
- Triggered by clicking any member card
- Shows: avatar, full_name, role badge, city/country, agency, niche pills (gold), languages pills (grey), can_help_with, looking_for, contact buttons
- Contact buttons (WhatsApp → wa.me/, Instagram → instagram.com/, LinkedIn) only rendered if field is not empty
- Fade-in animation via @keyframes fadeInUp injected via <style> tag
- Close on X button or click outside overlay
- Does NOT show: notes, status, bio
- Member cards and modal both use 2-letter initials: split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

## Dashboard (Dashboard.jsx)
- userEmail initialises to null; nav-grid only renders after getUser() resolves (prevents Deal Flow card flash)
- navItems includes: Member Directory, Video Library, Upcoming Calls, Education Hub, Referral Templates, Deal Flow (admin only), My Profile, Getting Started
- Deal Flow card filtered out for non-admins: navItems.filter(item => item.path !== '/deals' || userEmail === ADMIN_EMAIL)
- Dashboard upcoming calls select includes meeting_link; RSVP button opens meeting_link in new tab or navigates to /calls if no link

## Admin-only pages
- /deals — DealFlow.jsx checks getUser() email; isAdmin=null shows loader, isAdmin=false shows restricted card with back link, isAdmin=true shows full tracker. Deals fetch is skipped entirely for non-admins.
- Dashboard.jsx filters the Deal Flow nav card out of navItems for non-admin users

## Jake Inline CRUD (jake@therealty-network.com only)
All four content pages detect Jake's email via supabase.auth.getUser() and set isAdmin state.
Regular members see NO add/edit/delete controls.

- VideoLibrary.jsx: "+ Add Video" in nav, ✏/🗑 icons on thumbnail overlay (stopPropagation so video still plays), modal fields: title, category, host, date, duration, embed_url. Cards with no embed_url show "No video available" and are not clickable. Play overlay only renders when videoId is non-null.
- UpcomingCalls.jsx: "+ Add Call" in nav, ✏/🗑 icons in top-right of each call card, modal fields: event_name, date, time, host, event_type, meeting_link, description, open_to. open_to displayed as grey pill badge on card next to event_type.
- EducationHub.jsx: "+ Add Resource" in nav, ✏/🗑 icons at top of each resource card, modal fields: title, type, category, file_link, description
- ReferralTemplates.jsx: "+ Add Template" in nav, ✏/🗑 icons inline with download button, modal fields: name, type, version, download_link
- After save or delete, all pages reload from Supabase
- Delete uses window.confirm() before executing
- Edit pre-populates modal form with existing row data

## Admin.jsx — Content Tab
- CONTENT_CONFIG fields include all editable columns per section
- calls fields: event_name, date, time, host, event_type, meeting_link, description (textarea), open_to
- templates fields: name, type, version, download_link
- educaton fields: title, type, category, file_link, description (textarea)
- videos fields: title, category, host, date, duration, embed_url

## Admin.jsx — Deals Tab
- Lists all deals with stage dropdown (inline edit) and Delete button per row
- "+ Add Deal" button opens modal with fields: deal_name, originating_agent, originating_country, destination_agent, destination_country, property_type, property_value_min (number), property_value_max (number), commission_percent (number), stage (select), notes (textarea)
- DEAL_STAGES: Lead, Prospect, Active, Negotiating, Under Contract, Closed, Commission Collected, Completed, Dead
- EMPTY_DEAL and DEAL_FIELDS constants defined at module level
- saveDeal() inserts new row, prepends to state; deleteDeal() uses window.confirm()
- DealFlow.jsx CLOSED_STAGES includes 'Completed' — matches Admin DEAL_STAGES

## YouTube URL Handling
getEmbedUrl(url) and getVideoId(url) helpers exist in VideoLibrary.jsx and Admin.jsx.
Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID (pass-through).
Video thumbnails use: https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg
Admin.jsx Content tab shows 80x45px thumbnail preview column for videos section.

## Profile.jsx
- Avatar upload immediately persists avatar_url to members table (no wait for Save Profile)
- Banner shown after avatar upload: "Photo saved — click Save Profile to update your other details."
- handleSave() uses .select() and checks data.length === 0 to detect missing member row
- Error message for missing row: "Profile not found. Contact an administrator."
- handleSave() clears avatarSaved banner on success

## Onboarding.jsx
- WHATSAPP_LINK is a placeholder: '#NOTE_FOR_JAKE_replace_with_real_whatsapp_link' — must be replaced
- Step 01 has link: '/profile' and linkLabel: 'Update My Profile →'
- Step renderer handles step.action === true by rendering <a> to WHATSAPP_LINK

## Supabase columns required (add in dashboard if not present)
- upcoming_calls: description (text), open_to (text)
- referral_templates: version (text)
- deals: originating_country (text), destination_country (text), property_type (text), property_value_min (numeric), property_value_max (numeric), commission_percent (numeric), notes (text)

## Theme System
- `src/lib/theme.js` — exports getTheme(), setTheme(theme), initTheme()
  - getTheme(): returns 'dark' | 'light' from localStorage, defaults to 'dark'
  - setTheme(theme): saves to localStorage and adds/removes 'light' class on <html>
  - initTheme(): called in main.jsx before React renders to avoid flash of wrong theme
- `src/components/ThemeToggle.jsx` — 32×32 circular icon button, ☀️ in dark mode, 🌙 in light mode
  - Reads theme from localStorage on mount via useEffect
  - Calls setTheme() + updates local state on click
- Light theme applied via `html.light { ... }` CSS variable overrides in index.css
  - Light overrides: --bg-primary #f8f6f1, --bg-card #ffffff, --bg-warm #f0ead8, --bg-hover #ece6d9
  - Gold shifts to #b8860b (darker for contrast on light backgrounds)
  - Scrollbar thumb lightened to #ccc in light mode
- ThemeToggle placed in every page nav bar:
  - Dashboard: before Sign Out button (both in a flex wrapper)
  - Admin: in a right-side flex group with ← Dashboard link
  - Content pages (VideoLibrary, UpcomingCalls, EducationHub, ReferralTemplates): in a right-side flex group before the isAdmin "+ Add" button
  - MemberDirectory: in a right-side flex group with the member count span
  - DealFlow, Profile, Onboarding: marginLeft auto wrapper at nav right end
  - Login: position fixed top-right corner

## Rules
- Mobile first, always
- No separate backend server
- All data from Supabase directly
- Use CSS variables, not hardcoded hex
- Use shared classes from index.css
- Keep components simple and fast
