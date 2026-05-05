# Power Audit — Progress & Context

## What this is
A self-guided assessment app built on the Attention Alignment Process framework. Helps users identify where their creative power leaks across six stages of a creation cycle (Envision → Decide → Plan → Prepare → Do → Refine), then builds goals and clears blocks around those areas.

## Live app
**URL:** https://pauditapp.vercel.app
**Repo:** https://github.com/ReadySetGo555/power-audit
**Local:** `C:\Users\Bobby\Projects\power-audit\pauditapp`
**Stack:** Next.js 14, Supabase (Postgres), Tailwind, next-pwa, deployed on Vercel

---

## Current status
**Phase:** Post-launch bug fixing and UX improvements
**Last working on:** Context review session (May 5 2026) — confirmed all navigation improvements complete, PROGRESS.md cleaned up

---

## What's built and working
- ✅ Full 24-question assessment (4 sets × 6 stages)
- ✅ Question flow: slider → why (score) → somatic checkboxes → make it a 10
- ✅ Score 10 shows strength message instead of make-it-a-10 field
- ✅ Two selection screens per set (Excited ❗ / Impactful 💥)
- ✅ Both answer texts shown in selection screens (why + make it a 10)
- ✅ Tier dashboard with 4 tabs (Tiers / Stage / Scale / Set)
- ✅ 3 counters (biggest deficit by set, by stage, blocks overcome/total)
- ✅ Goals and Somatic dropdowns at top of each tab
- ✅ Tier 1 sorted: both ❗💥 first, then ❗ only, then 💥 only
- ✅ Somatic process (4 steps: identify → agreement → rewrite → commit)
- ✅ Completing somatic process clears block and re-tiers item
- ✅ Goal setting (6 steps: success → goal → timeframe → first action → obstacle → support)
- ✅ Supabase database wired up — data persists across sessions
- ✅ Race condition fixed — mutations gated on loaded state
- ✅ resetAll() removed from Begin button — no more data wipe
- ✅ Deployed to Vercel with auto-deploy from GitHub
- ✅ PWA configured — installable to phone home screen
- ✅ Assessment grid tab (shows all 24 questions, labeled "Finish Full Assessment" / "View Assessment Birds-eye")
- ✅ Clickable stage badges for navigation within a set
- ✅ Set tabs for navigation between sets
- ✅ "Continue where you left off" section on dashboard
- ✅ Previously answered questions pre-populate when revisited
- ✅ Dashboard ghost button in assessment header (navigate to dashboard without losing progress)

---

## What's in progress / partially working
- ⚠️ PWA caching on iOS — service worker can serve stale version after deploy (fix: force-close and reopen, or reinstall PWA)
- ⚠️ Vercel auto-deploy occasionally misses commits — manual redeploy via Vercel dashboard as workaround

---

## What's not built yet (deferred)
- ❌ CSV export / import (full backup — Phase 4)
- ❌ PDF report export (after core app is stable)
- ❌ User authentication / login
- ❌ Multi-user support (schema ready, enforcement deferred)
- ❌ "Start over" button (explicit, separate from Begin)
- ❌ Block clearing process content (currently a placeholder alert)
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
- `assessment_answers` — one row per (user, set, stage)
- `set_selections` — excited + impactful stage per set
- `goal_answers` — six prompts per (user, set, stage)
- `somatic_answers` — four prompts per (user, set, stage)

---

## Next actions (in order)
1. CSV export / import (Phase 4)
2. PWA icon and manifest polish (Phase 5)
3. PDF report (after CSV is done)
4. User auth + multi-user (future phase)

---

## How to resume a Claude Code session
```
cd ~\Projects\power-audit\pauditapp
claude
```
Then say: "Read PROGRESS.md and continue from where we left off."

---
*Last updated: May 5 2026*
