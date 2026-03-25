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

## Supabase Tables
- members (full_name, email, country, city, role, niche[], status, avatar_url, agency, languages[], can_help_with, looking_for, whatsapp, instagram, linkedin, bio, notes)
- videos (title, category, host, date, duration, embed_url)
- upcoming_calls (event_name, date, time, host, event_type, meeting_link)
- education_hub (title, type, category, file_link, description)
- referral_templates (name, type, download_link)
- deals (deal_name, originating_agent, destination_agent, stage)

## Supabase Storage
- Bucket: "avatars" — stores member profile photos
- Public URL stored in members.avatar_url column
- Files named by user ID: {user.id}.{ext}, uploaded with upsert: true

## Routes
/login — public
/dashboard — members
/directory — members
/videos — members
/calls — members
/education — members
/templates — members
/deals — members
/onboarding — members
/profile — members (edit own profile + avatar upload)
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

## Jake Inline CRUD (jake@therealty-network.com only)
All four content pages detect Jake's email via supabase.auth.getUser() and set isAdmin state.
Regular members see NO add/edit/delete controls.

- VideoLibrary.jsx: "+ Add Video" in nav, ✏/🗑 icons on thumbnail overlay (stopPropagation so video still plays), modal fields: title, category, host, date, duration, embed_url
- UpcomingCalls.jsx: "+ Add Call" in nav, ✏/🗑 icons in top-right of each call card, modal fields: event_name, date, time, host, event_type, meeting_link, description, open_to
- EducationHub.jsx: "+ Add Resource" in nav, ✏/🗑 icons at top of each resource card, modal fields: title, type, category, file_link, description
- ReferralTemplates.jsx: "+ Add Template" in nav, ✏/🗑 icons inline with download button, modal fields: name, type, version, download_link
- After save or delete, all pages reload from Supabase
- Delete uses window.confirm() before executing
- Edit pre-populates modal form with existing row data

## YouTube URL Handling
getEmbedUrl(url) and getVideoId(url) helpers exist in VideoLibrary.jsx and Admin.jsx.
Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID (pass-through).
Video thumbnails use: https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg
Admin.jsx Content tab shows 80x45px thumbnail preview column for videos section.

## Supabase columns added (may need adding in dashboard)
- upcoming_calls: description (text), open_to (text)
- referral_templates: version (text)

## Rules
- Mobile first, always
- No separate backend server
- All data from Supabase directly
- Use CSS variables, not hardcoded hex
- Use shared classes from index.css
- Keep components simple and fast
