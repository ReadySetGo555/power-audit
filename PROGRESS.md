# Power Audit — Progress & Context

## What this is
A self-guided assessment app built on the Attention Alignment Process framework. Helps users identify where their creative power leaks across six stages of a creation cycle (Envision → Decide → Plan → Prepare → Do → Refine), then builds goals and clears blocks around those areas.

## Live app
**URL:** https://pauditapp.vercel.app
**Repo:** https://github.com/ReadySetGo555/power-audit
**Local:** `C:\Users\Bobby\Projects\power-audit\pauditapp`
**Stack:** Next.js 16, Supabase (Postgres), Tailwind, next-pwa, deployed on Vercel

---

## Current status
**Phase:** Phase 2 complete — dashboard redesigned, UI polished
**Last working on:** UI polish pass — May 6 2026.

**Pending manual steps:**
~~1. Run Supabase DB migrations~~ ✅ Done May 5 2026
~~2. Add `ANTHROPIC_API_KEY` to `.env.local` and Vercel env vars~~ ✅ Done May 5 2026

**NOTE FOR NEXT SESSION:** Dashboard is a single scrollable view (no tabs). AI scale summaries are wired up but the Anthropic account tied to the API key is out of credits — add credits at console.anthropic.com to activate them. Otherwise the app is fully functional.

---

## What's built and working
- ✅ Full 24-question assessment (4 sets × 6 stages)
- ✅ Question flow: slider → why (score) → somatic checkboxes → make it a 10
- ✅ Score 10 shows strength message instead of make-it-a-10 field
- ✅ Two selection screens per set (Excited ❗ / Impactful 💥)
- ✅ Both answer texts shown in selection screens (why + make it a 10)
- ✅ Dashboard — single scrollable view (tabs removed May 6 2026):
  - Progress sections (Goals/Somatic/Blocked) with X/Y counters
  - Tiers section (1–4, same cards and logic)
  - Scale section — three flat outlined boxes (Strength/Improve/Limited); each row shows score, set/stage label, and user's "why" answer; sorted score desc then stage order; only items with a why answer shown
- ✅ Birds-eye grid — individual score cells are now clickable and navigate directly to that stage in the assessment
- ✅ TierItemCard polish (May 6 2026): badges show as read-only when not interactive; ❌ blocked badge visible on cards; button labels clarified (PDF Report / CSV Export / CSV Import); somatic button renamed "Somatic Clearing →"; optional Update button prop added
- ✅ 3 counters (biggest deficit by set, by stage, blocks overcome/total)
- ✅ Tier 1 sorted: both ❗💥 first, then ❗ only, then 💥 only
- ✅ Somatic process (4 steps: identify → agreement → rewrite → commit)
- ✅ Completing somatic process clears block and re-tiers item
- ✅ Goal setting (6 steps: success → goal → timeframe → first action → obstacle → support)
- ✅ Supabase database wired up — data persists across sessions
- ✅ Race condition fixed — mutations gated on loaded state
- ✅ resetAll() removed from Begin button — no more data wipe
- ✅ Deployed to Vercel with auto-deploy from GitHub
- ✅ PWA configured — installable to phone home screen
- ~~Assessment grid tab~~ Removed May 6 2026 — redundant with birds-eye grid at top of dashboard
- ✅ Clickable stage badges for navigation within a set
- ✅ Set tabs for navigation between sets
- ✅ "Continue where you left off" section on dashboard
- ✅ Previously answered questions pre-populate when revisited
- ✅ Dashboard ghost button in assessment header (navigate to dashboard without losing progress)
- ✅ CSV export / import (full backup and restore via Header buttons on dashboard)
- ✅ PWA icons polished — PA monogram (192, 512, 512-maskable, apple-touch-icon) replacing plain purple square
- ✅ manifest.json polished — id, scope, categories, separate any/maskable icon entries
- ✅ PDF report export — Report button in dashboard header downloads a PDF with assessment scores grid, tier breakdown, goal plans, and somatic processes (jspdf 4.x + jspdf-autotable 5.x, dynamic import)
- ✅ Phase 2 — dashboard redesign, blocks clearing, AI summaries:
  - Birds-eye 4×6 grid with clickable expand panels (stage averages → set breakdown, set averages → stage breakdown), sort toggle
  - "Your Next Step" section — highest-priority item with inline expand and Set Goals / Clear Block CTAs
  - Progress sections above tabs: Goals X/Y, Somatic X/Y, Blocked X/Y counters
  - 9-step block clearing process at `/blocks/[setId]/[stageId]` (actions → behaviors → feelings → thoughts → snapshot → belief → agreement → new_agreement → immediate_action)
  - Somatic branch from within block clearing (step 3 feelings → `/somatic/...?from=blocks` → returns to blocks without re-triggering somatic completion)
  - Two completion paths in block clearing: "I'll do it now" (completes immediately) vs "Schedule it for later" (marks scheduled, shows in Continue section)
  - AI-generated scale summaries wired up via `/api/summarize` + Anthropic claude-haiku-4-5-20251001 (inactive — account out of credits; add credits at console.anthropic.com)
  - Header: "ATTN: Dashboard" left link, Power Audit badge removed
  - Dashboard header: Power Audit eyebrow, tagline, "Current Power Snapshot" title, Counters removed
  - Return behavior: auto-redirect to dashboard if all 24 answers + all 4 selections complete
  - Blocked icon changed ❌, makeTen auto-clears when score moves to 10

---

## What's in progress / partially working
- ⚠️ AI scale summaries — wired up but Anthropic account is out of credits; add credits at console.anthropic.com to activate
- ⚠️ PWA caching on iOS — service worker can serve stale version after deploy (fix: force-close and reopen, or reinstall PWA)
- ⚠️ Vercel auto-deploy occasionally misses commits — manual redeploy via Vercel dashboard as workaround

---

## What's not built yet (deferred)
- ❌ User authentication / login
- ❌ Multi-user support (schema ready, enforcement deferred)
- ❌ "Start over" button (explicit, separate from Begin)
- ❌ Progress history / timestamped updates per stage
- ❌ Sharing results with others

---

## Key design decisions made
- **Begin button** always goes to Dashboard — never wipes or restarts data
- **Tier system** driven by excited/impact selections + somatic flags, not scores alone
- **Scores** determine Strength (7-10) / Improve (4-6) / Limited (1-3) labels
- **Somatic icon** is 🎭 not ⚠️
- **Score of 10** shows strength message, skips make-it-a-10 field
- **Set 4** slider poles are Negative Impact / Positive Impact (not Very Difficult / Very Easy)
- **DEFAULT_USER_ID** hardcoded for now — auth comes later
- **RLS disabled** on all tables until auth is added
- **localStorage removed** — not supported in artifact sandbox, state is in Supabase

---

## Framework reference

### The Creation Cycle
Envision 👁 → Decide 🤝 → Plan ✏️ → Prepare 🏗️ → Do ✅ → Refine ♻️

### The 4 Question Sets
1. Expressing Your Ideas (Very Difficult → Very Easy)
2. Expressing Yourself (Very Difficult → Very Easy)
3. Taking Immediate Action (Very Difficult → Very Easy)
4. Making Continual Progress (Negative Impact → Positive Impact)

### Tier Logic
| Tier | Condition |
|------|-----------|
| Tier 1 Urgent | Chosen as excited or impactful + somatic flag |
| Tier 2 Important | Chosen as both excited AND impactful, no somatic |
| Tier 3 Influential | Chosen as excited OR impactful (not both), no somatic |
| Tier 4 Somatic/Blocks | Somatic flag but not chosen as excited or impactful |

### Design tokens
- **Accent:** #7C5CBF (purple)
- **Background:** #0A0908
- **Fonts:** Cormorant Garamond (display) + Syne (body)
- **Strength:** 💪🏼 green #2ECC71
- **Improve:** ⚠️ orange #E67E22
- **Limited:** 🔥 red #C0392B

---

## Database tables
- `user_profiles` — single row for now (DEFAULT_USER_ID)
- `assessment_answers` — one row per (user, set, stage); Phase 2 added columns: `block_cleared boolean`, `action_scheduled boolean`, `action_confirmed boolean`
- `set_selections` — excited + impactful stage per set
- `goal_answers` — six prompts per (user, set, stage)
- `somatic_answers` — four prompts per (user, set, stage)
- `block_answers` — one row per (user, set, stage, prompt_id); Phase 2 new table

**⚠️ Run these migrations in Supabase SQL editor:**
```sql
ALTER TABLE assessment_answers ADD COLUMN block_cleared boolean DEFAULT false;
ALTER TABLE assessment_answers ADD COLUMN action_scheduled boolean DEFAULT false;
ALTER TABLE assessment_answers ADD COLUMN action_confirmed boolean DEFAULT false;

CREATE TABLE block_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id),
  set_id text not null,
  stage_id text not null,
  prompt_id text not null,
  answer text,
  action_scheduled boolean default false,
  action_confirmed boolean default false,
  somatic_branch_used boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, set_id, stage_id, prompt_id)
);
```

---

## Next actions (in order)
1. ~~CSV export / import~~ ✅ Done
2. ~~PWA icon and manifest polish~~ ✅ Done
3. ~~PDF report export~~ ✅ Done
4. ~~Phase 2 dashboard redesign + blocks clearing~~ ✅ Done
5. ~~**Run Supabase migrations**~~ ✅ Done May 5 2026
6. ~~**Add ANTHROPIC_API_KEY** to `.env.local` + Vercel env vars~~ ✅ Done May 5 2026
7. User auth + multi-user (future phase)

---

## How to resume a Claude Code session
```
cd ~\Projects\power-audit\pauditapp
claude
```
Then say: "Read PROGRESS.md and continue from where we left off."

---
*Last updated: May 6 2026 — UI polish pass complete, all changes live on Vercel*
