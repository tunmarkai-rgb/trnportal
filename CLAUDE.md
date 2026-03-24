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
--bg-primary, --bg-card, --border, --gold, --gold-dim
--text-primary, --text-secondary, --text-muted
--font-display, --font-body

## Shared CSS Classes (defined in index.css)
- .section-label — gold uppercase label
- .card — dark card with border
- .nav-grid — 2 col mobile, 3 col desktop
- .nav-card — clickable navigation card

## Supabase Tables
- members (full_name, email, country, city, role, niche[], status)
- videos (title, category, host, date, duration, embed_url)
- upcoming_calls (event_name, date, time, host, event_type, meeting_link)
- education_hub (title, type, category, file_link, description)
- referral_templates (name, type, download_link)
- deals (deal_name, originating_agent, destination_agent, stage)

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
/admin — Jake only

## Rules
- Mobile first, always
- No separate backend server
- All data from Supabase directly
- Use CSS variables, not hardcoded hex
- Use shared classes from index.css
- Keep components simple and fast
