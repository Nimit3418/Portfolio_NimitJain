# NIMIT JAIN PORTFOLIO — FULL CONTEXT FILE (v19-grid)

> **Purpose:** Complete handoff document so any AI agent can instantly resume work on this portfolio without re-reading the codebase or asking Nimit for background again. **Read this first, always.**

---

## 1. PROJECT OVERVIEW

| Property | Value |
|---|---|
| Site title | Nimit Jain · grid |
| Portfolio identity | Nimit Jain |
| Theme | Editorial / typographic — paper, ink, one warm accent. Squared-paper grid background. Sections are floating card-sheets on the grid. |
| Tone | Honest, direct, student-first builder identity. Every number has a source. |
| Target audience | Recruiters + general public (shareable link, not just a hiring page) |
| Tech stack | Vanilla HTML + CSS + JavaScript (no framework) |
| Animations | GSAP 3.13.0 + ScrollTrigger, Lenis 1.1.14 smooth scroll |
| Fonts | Instrument Sans (display/headings), Instrument Serif (italic Q&A questions), Switzer (body) |
| Active version | v19 "grid" |
| Local dev | python3 -m http.server 8000 from project root (no build step) |

**This is v19. The old CONTEXT.md described v14 "Daylight Terminal" (aviation theme). That theme is completely gone. The aviation theme, all its CSS tokens, and the boarding-pass / tower-board / split-flap HTML have all been replaced.**

---

## 2. FILE STRUCTURE

```
Portfolio-v19-grid/
├── index.html              ← SINGLE HTML FILE (376 lines) — entire page lives here
├── css/
│   ├── app.css             ← BASE stylesheet (v17 base, 478 lines) — ALWAYS edit this
│   └── grid.css            ← GRID VARIANT override (97 lines) — loads after app.css, adds card-sheet layout
├── js/
│   ├── app.js              ← ACTIVE JavaScript (545 lines) — ALWAYS edit this
│   ├── cursor.js           ← Custom cursor logic (34 lines, shared by all pages)
│   └── cs.js               ← Case-study page helper (559 bytes)
├── work/
│   ├── campuscritique.html ← Case study page
│   ├── oilspill.html       ← Case study page
│   ├── askmynotes.html     ← Case study page
│   ├── kisanmind.html      ← Case study page
│   └── zorvyn.html         ← Case study page
├── content/
│   ├── projects.mjs        ← SINGLE SOURCE OF TRUTH for all project data
│   └── now.json            ← "Right now" line data (building/watching/reading + updated date)
├── api/
│   ├── ask.mjs             ← /api/ask endpoint (RAG Q&A)
│   ├── contact.mjs         ← /api/contact endpoint (form to Notify)
│   └── contact/            ← contact delivery polling
├── rag/                    ← RAG pipeline (vector index, calibration, evals)
│   ├── build-index.mjs     ← builds rag/index.json
│   ├── dev-server.mjs      ← local dev server for /api/ask
│   └── index.json          ← compiled RAG corpus (250 KB)
├── lib/
│   └── notify.mjs          ← Email/Slack notification library
├── scripts/
│   └── build-work.mjs      ← generates HTML from content/projects.mjs
├── assets/img/             ← All images (see section below)
├── .env                    ← Local env vars (OPENAI_API_KEY, NOTIFY_* etc.)
├── package.json            ← scripts: dev, dev:api, rag:index, rag:calibrate, rag:evals, build:work
└── RAG-SETUP.md            ← RAG pipeline setup guide
```

**CRITICAL:** Always edit `css/app.css` and `js/app.js`. `css/grid.css` is loaded after and overrides specific layout rules — edit it when touching section layout, padding, or the grid-sheet look.

HTML links to active files:
```html
<link rel="stylesheet" href="css/app.css?v=19">
<link rel="stylesheet" href="css/grid.css?v=19">
<script src="js/cursor.js?v=19"></script>
<script src="js/app.js?v=19"></script>
```

---

## 3. DESIGN SYSTEM (css/app.css + css/grid.css)

### Color Palette
| CSS Variable | Value | Usage |
|---|---|---|
| --paper | #f4f3ef | Page / section background |
| --paper-2 | #ebe9e3 | Hover background, subtle fills |
| --line | #d6d3ca | Dividers, hairlines |
| --line-strong | #b9b5aa | Stronger borders |
| --ink | #0c0c0c | Primary text, headings, borders |
| --ink-2 | #1a1a1a | Slightly lighter dark bg (palette) |
| --muted | #5c5c5c | Body text, captions |
| --faint | #8f8f8f | Labels, secondary info |
| --gold | #c9a961 | THE ONE ACCENT — live dot, nav progress, "So now" text, email hover |
| --on-ink | #f4f3ef | Light text on dark backgrounds |
| --on-ink-dim | #9a9a9a | Dim text on dark bg |
| --on-ink-line | rgba(244,243,239,0.16) | Hairlines on dark bg |
| --sheet (grid.css) | #f7f6f2 | Section card background |
| --grid-line (grid.css) | rgba(12,12,12,0.06) | The squared-paper grid lines |
| --radius (grid.css) | 14px | Border radius for section cards |

### Typography
- `--font-display`: "Instrument Sans" — h1, h2, h3, hero name, big numbers, nav brand
- `--font-body`: "Switzer" — all body text, buttons, nav links, forms
- `--font-serif`: "Instrument Serif" italic — Q&A question text (.q class)

### Key UI Patterns
- **Grid background:** body in grid.css has a 28x28px squared-paper pattern using linear-gradient
- **Section cards (.hero, .sec):** Each section is a floating card with background: var(--sheet), border, border-radius: 14px, padding 40-64px 48px, margin: 0 0 18px
- **Nav:** Floating pill — border-radius: 999px, backdrop blur, sticky top: 12px
- **Gold progress bar:** #nav-progress — GSAP-driven scaleX scroll progress hairline under nav
- **Buttons (.btn):** Three variants: .btn-ink (dark fill), .btn-line (outlined), .btn-paper (light, for dark bg sections)
- **Pill badges (.pill):** Small outlined rounded chips on project titles for "measured"
- **Filter chips (.fchip):** Category filter buttons above the project list
- **Project rows (.prow):** Hover: indent + white fill + image peek. Grid variant: individual card borders
- **Peek image (.peek):** Floating project screenshot that follows cursor over the work list
- **Changelog:** Sticky rolling version numeral .cl-big, gold rail .cl-rail draws down the entries
- **Q&A interview (.qa):** Grid — italic serif questions, regular body answers
- **Postmortems (.pm-row):** Strike-through animation on "was" text, "So now" fades in. In grid.css: individual cards in a 2-col grid
- **Quotes (.pq):** Words light up word-by-word as you scroll (ScrollTrigger scrub). In grid.css: bordered card
- **Ink dots portrait canvas:** Halftone dots rendered in canvas, dots develop on scroll, swell away from pointer
- **Custom cursor (.cur):** Solid white disc, mix-blend-mode: difference; grows on links (.is-link), bigger on rows (.is-row), thin on text (.is-text)
- **Command palette (#palette):** Press / or Cmd+K — dark overlay, searches nav/projects/actions, powers RAG Q&A

---

## 4. PAGE SECTIONS (in order)

| # | Section | HTML ID / element | Key Elements |
|---|---|---|---|
| — | Nav | header.nav | Brand "Nimit Jain", 4 nav links (Work/Creator/About/Contact) with kbd hints, "Ask me anything" button, gold scroll progress bar |
| 01 | Hero | section.hero#hero | "Open to internships" live dot, two-line h1 (filled + outlined with fill-in on scroll), grayscale portrait with tilt, role tags, CTA buttons, "Right now" line |
| — | Stats | dl.stats (grid: 4 cards) | 4 headline numbers: 1,100+ visitors, 1st Noesis, 1st SIH, Top 2 HackWarts |
| — | Ticker | .ticker (dark pill) | Moving stats strip: 7 data points looping. Pauses on hover. Speeds up with scroll velocity |
| 02 | Work | section.sec#work | Section header with "measured" pill explanation, filter chips (All/AI-ML/Full stack/Product/Hackathons), 5 project rows with peek, "Also live" mini project links |
| 03 | Changelog | section.sec#changelog | Sticky version numeral, gold rail, 7 entries v0.1-v0.7 newest first, each with "Learned:" lesson |
| 04 | Creator | section.sec.sec-ink.sec-wipe#creator | Dark section. Wipe-in animation. Copy + stats (43,719 views / 523 subs / 1,700 watch hrs), channel link, embedded YouTube video |
| 05 | About | section.sec#about | 8 Q&A pairs (serif italic Q, body A), Awards list (5 results), 2 postmortems, 2 blockquotes + ink dot portrait canvas |
| 06 | Contact | section.sec.sec-ink#contact | Dark section. Big heading, email (click-to-copy), live Pune clock, contact form, 4 social links, footer |

---

## 5. ABOUT NIMIT JAIN

### Identity
- Full name: Nimit Jain
- Location: Delhi (hometown) to Pune (college, current)
- Email: jainnimit34b@gmail.com
- Tagline roles on site: Co-founder, Developer, Creator, Mentor
- Hero sub-headline: "builds for students"

### Education
- B.Tech CS (AI), Vedam School of Technology, Pune, 2025-2029
  - Semester 1: Rank 7, 9.59 SGPA (semester GPA). Running CGPA is 9.45 — index.html shows 9.45 CGPA everywhere, which is correct.
- Ramjas School, New Delhi, Class XII 2025
- Forage simulations: Goldman Sachs, Deloitte
- Scaler Young Innovator challenge 4.0

### Online Presence
| Platform | Handle | Stat on site |
|---|---|---|
| GitHub | github.com/Nimit3418 | 26 repositories |
| YouTube | youtube.com/@NimitJain18 | 523 subs, 43,719 views, 1,700+ watch hrs, 38+ referrals |
| LinkedIn | linkedin.com/in/nimitjain18 | "build in public" (NO connection count — intentional) |
| LeetCode | leetcode.com/u/Nimit_Jain07/ | 120+ solved |

Note: Google Maps (109K+ review views) from old CONTEXT is NOT shown in v19 — contact links only show GitHub, YouTube, LinkedIn, LeetCode.

---

## 6. PROJECTS — FULL DATA

All project data lives in `content/projects.mjs` — this is the SINGLE SOURCE OF TRUTH. The `work/*.html` case-study pages and the RAG index derive from it. Edit data there, then run `npm run build:work`.

### Project 01 — CampusCritique (TOP PRIORITY)
- slug: campuscritique
- Live URL: https://campuscritique.in
- Period: May 2026 to present
- Stack: Next.js, React, Supabase, Tailwind
- Role: Co-founder — product, growth, branding, partnerships; built auth, review workflows, mentorship booking
- Team: Satyam Kumar Singh (payments, infrastructure)
- Tags: Product, Full stack, Live
- Has measured pill: Yes
- Metrics:
  - 1,100+ unique visitors (Vercel Analytics, May-Sep 2026)
  - 80+ sign-ups (Supabase auth.users)
  - 7 institutions listed (colleges table)
  - 53% organic search share (Vercel Analytics referrers)
- Stat shown in work row: 1,100+ Unique visitors
- Images: campuscritique.png, campuscritique-explore.png, campuscritique-compare.png
- Learned: Distribution beats features.

### Project 02 — Oil Spill Detection
- slug: oilspill
- Repo: https://github.com/TrueMan08/Team_AlgoRise_OilSpill_detection
- Period: August-September 2026, SIH 2026, Team AlgoRise (4 people)
- Stack: Python, FastAPI, AIS data
- Role: AIS track reconstruction and vessel attribution module
- Tags: AI / ML, Backend, Hackathon
- Has measured pill: Yes
- Metrics:
  - 1st rank, Vedam SIH internal round
  - 3 of 3 attribution tests passed (counterfactual forward runs)
- Stat shown in work row: 1st, Internal round result
- Images: oilspill-1.jpeg, oilspill-2.jpeg
- Learned: Run the counterfactual, not just the backtrack.

### Project 03 — AskMyNotes AI
- slug: askmynotes
- Live URL: https://askmynotes-algorise.vercel.app/
- Period: March 2026, 8-hour Noesis hackathon, Team of 4
- Stack: JavaScript, Supabase, RAG
- Role: Authentication end-to-end + user-facing frontend
- Tags: AI / ML, Full stack, Hackathon
- Has measured pill: Yes
- Metrics:
  - 1st of ~50 teams, Noesis (top-10 shortlisted, judged live)
  - Rs 50K prize pool
- Stat shown in work row: 1st, Placing
- Images: askmynotes.png, askmynotes-preview.png
- Learned: Division of work beats heroics.

### Project 04 — KisanMind
- slug: kisanmind
- Live URL: https://altahackathon.vercel.app/
- Repo: https://github.com/Satyam087/AltaHack
- Period: April 2026, 24-hour HackWarts, "Regular crew of four"
- Stack: Next.js, TypeScript, LangGraph
- Role: Next.js frontend, wiring live agent output into UI
- Tags: AI / ML, Agents, Hackathon
- Has measured pill: Yes
- Metrics:
  - Top 2 of ~40 teams, HackWarts (Alta School of Technology)
  - 2 languages: Hindi + Marathi voice (Groq Whisper STT + Sarvam AI TTS)
- Stat shown in work row: Top 2, Placing
- Images: kisanmind.png, kisanmind-agents.png
- Learned: Voice in the farmer's own language was the feature judges remembered. Reach is a feature.

### Project 05 — Zorvyn
- slug: zorvyn
- Live URL: https://finance-dashboard-nimit.vercel.app/
- Repo: https://github.com/Nimit3418/Finance-Dashboard
- Period: 2026, solo build
- Stack: React, Charts
- Role: Everything — design, charts, transactions, insights
- Tags: Frontend, Solo
- Has measured pill: No
- Metrics: None (no measured table)
- Stat shown in work row: 2026 (just the period)
- Images: zorvyn.png
- Learned: A dashboard is a set of decisions about what not to show.

### Mini Projects ("Also live" section — text links only, no images)
| Project | URL |
|---|---|
| Business Web App | https://reactui-businesswebapp-nimit.netlify.app/ |
| Cultural Club for Vedam | https://cultural-club1.vercel.app/ |
| Clicky Projects | https://nimits-clicky-projects.netlify.app/ |
| LeetCode Analytics | https://leetcodeuserextractor.netlify.app/ |

Note: "Clicky Projects" is still in index.html — Nimit previously said he wants it removed. Revisit.

---

## 7. IMAGE ASSETS (assets/img/)

| File | Status | Where used |
|---|---|---|
| nimit.jpg | ACTIVE | Hero portrait (hero-figure) |
| portrait-cut.png | ACTIVE | Ink-dots canvas in About section (initDots in app.js) |
| portrait.png | UNUSED | Old boarding pass portrait (v14 remnant) |
| campuscritique.png | ACTIVE | Project row peek + case study |
| campuscritique-explore.png | ACTIVE | Case study |
| campuscritique-compare.png | ACTIVE | Case study |
| oilspill-1.jpeg | ACTIVE | Case study |
| oilspill-2.jpeg | ACTIVE | Project row peek + case study |
| askmynotes.png | ACTIVE | Project row peek + case study |
| askmynotes-preview.png | ACTIVE | Case study |
| kisanmind.png | ACTIVE | Project row peek + case study |
| kisanmind-agents.png | ACTIVE | Case study |
| zorvyn.png | ACTIVE | Project row peek + case study |
| leetcode-extractor.png | UNUSED | Old extra screenshot |
| miniapps.png | UNUSED | Old multi-project collage (removed) |
| miniapps-2.png | UNUSED | Old multi-project collage (removed) |

---

## 8. CHANGELOG ENTRIES (Nimit's version history of himself)

| Version | Date | Event | Learned |
|---|---|---|---|
| v0.7 | Sep 2026 | 1st, SIH internal round, Oil Spill Detection | Run the counterfactual, not just the backtrack. |
| v0.6 | May 2026 | Co-founded CampusCritique | Distribution beats features. |
| v0.5 | Apr 2026 | Top 2, HackWarts, KisanMind | Reach is a feature. |
| v0.4 | Mar 2026 | 1st, Noesis, AskMyNotes | Division of work beats heroics. |
| v0.3 | Oct 2025 | YouTube launched, 60-day Vedam challenge, first hackathon | The comment section is the honest metric. |
| v0.2 | Aug 2025 | B.Tech CS (AI) begins, Rank 7, 9.59 SGPA | Ask the questions before day one. |
| v0.1 | Jun 2025 | Scaler internship, Young Innovator 4.0 | First structured build with AI. |

---

## 9. ABOUT SECTION DATA

### Q&A Interview (8 questions)
1. Who are you, in one breath? — Second-year CS (AI) at Vedam, co-founder of CampusCritique, YouTube channel juniors trust, paid mentoring, full-stack builds in React, Next.js, Python.
2. Why students? — Vedam admission required many questions the brochure never covered. CampusCritique and the channel exist so the next person does not have to dig.
3. What are you good at? — Frontends that ship + product thinking. React, Next.js, Supabase, Tailwind, REST APIs. Also video and design.
4. What went wrong recently? — LeetCode Analytics (API paid limits after full build). Noesis connectivity dropped before submission (won anyway — split roles, parallel debug).
5. What are you learning? — MERN backend, ML with Python, DSA in Java, daily.
6. Standing? — 9.45 CGPA, rank 7 in semester one. Ramjas School Class XII 2025. Forage (Goldman Sachs, Deloitte), Scaler YI.
7. Who do you mentor? — Campus Connect: 8+ paid sessions, 38+ students referred into colleges.
8. What next? — Internship in frontend, product or AI with a team that ships. Replies within a day.

### Awards / Results List (5 entries)
1. 1st place, Noesis hackathon, AskMyNotes — Mar 2026
2. Top 2 of ~40, HackWarts, KisanMind — Apr 2026
3. 1st rank, SIH 2026 internal round, Oil Spill Detection — Sep 2026
4. 1st, content award, Rs 5,000 prize — 2026
5. Featured by Vedam, filmed twice — 2026

### Postmortems (2)
- PM 01 — The API I never checked: Built full LeetCode Analytics UI, then found the API has paid limits. So now: feasibility before execution.
- PM 02 — Connection lost at the finish: At Noesis, problem changed mid-event, then connectivity dropped before submission. So now: split roles, debug in parallel, present calm. Won.

### Quotes (2 blockquotes)
1. "Every build teaches us something. Continue to #BuildInPublic!" — Piyush Nangru, co-founder, Elevate Education, building Vedam
2. "The number of questions you had last year and with the answers you got, I am sure you can help a lot of students basis your insights!" — Chandan Mathur, P&L owner and zero-to-one business builder

---

## 10. CREATOR SECTION DATA

- Channel: https://www.youtube.com/@NimitJain18
- Stats displayed: 43,719 views, 523 subscribers, 1,700 watch hours
- Embedded video: https://www.youtube-nocookie.com/embed/RLUeGSyki-g
  - Title: "Which programming language should you learn in 2026?"
- Featured by Vedam link: https://youtu.be/uoKKyTPlK0Y
- Body copy para 1: "I took admission at Vedam only after getting answers to a ton of questions. The channel exists so juniors get those answers for free: what the college is actually like, what to learn before day one, which mistakes to skip."
- Body copy para 2: "It worked beyond views. 38+ students made their college application through my guidance, and the comment section became the most honest metric I have."

---

## 11. CONTACT SECTION DATA

- Heading: "Let's build something."
- Sub-copy: "Frontend, product, AI or content. If you are building something students or creators will love, I want in."
- Email: jainnimit34b@gmail.com (click-to-copy; shows "copied" on click)
- Live Pune clock: IST, updates every 15s, "replies within a day"
- Contact form: Name, Email, Message → POST /api/contact → Notify delivery ledger with poll-for-confirmation
- Honeypot field: "Company" (hidden, for spam detection)
- Social links (4): GitHub (26 repos), YouTube (43,719 views), LinkedIn (build in public), LeetCode (120+ solved)

---

## 12. "RIGHT NOW" LINE

Lives in `content/now.json`, injected into index.html in the NOW:START...NOW:END comment block.

Current content (as of 2026-09-20):
- building: CampusCritique Connect, the paid mentorship flow
- watching: the SIH 2026 national round brief
- reading: Designing Data-Intensive Applications

To update: edit content/now.json, then update the NOW:START...NOW:END block in index.html directly.

---

## 13. ANIMATIONS AND INTERACTIONS

### Load Sequence (Hero, GSAP, skipped for background tabs)
- Hero name lines: yPercent 110 to 0 (mask clip reveal, stagger 0.12s)
- Hero figure: autoAlpha 0, y 24 to visible (delay 0.35s)
- Hero top/tags/foot: opacity 0, y 14 to visible (stagger 0.1s, delay 0.5s)
- Ticker + now line: opacity 0, y 16 to visible (delay 0.8s)

### Scroll Animations (ScrollTrigger, once unless noted)
- Section titles ([data-mask]): masked line reveal, yPercent 110 to 0
- Blocks ([data-reveal]): opacity + y fade-up
- Hero outline fill-in (.ln-fillin): clip-path inset scrub, hero top to hero bottom 45%
- Creator section (.sec-wipe): scaleY 0 to 1 wipe-in at 80%
- Postmortems ([data-pm]): strike-through + "So now" appear at 78%
- Quote words ([data-pq] p): words lit up with scrub from 85% to 45%
- Ink dots portrait ([data-dots]): dots develop on scroll (scrub 0.4)
- Changelog rail (.cl-rail): height grows from 0 to full
- Changelog numeral (.cl-big): rolls to current entry on scroll
- Numbers ([data-count], .prow-v): count up from 0 to target in Indian number format
- Nav scroll progress (#nav-progress): gold scaleX 0 to 1 via scrub
- Nav scrollspy: .on class on nav links based on section in viewport at 45%

### Pointer / Cursor Effects (fine pointer only)
- Custom cursor (.cur): white disc, mix-blend-mode: difference. Grows on links, bigger on .prow, thin on text
- Project peek (.peek): floating screenshot follows cursor over work list
- Magnetic buttons ([data-magnet]): lean toward pointer, spring back (GSAP elastic.out)
- Portrait tilt ([data-tilt]): rotateY/X + parallax inner image on hover

### Ticker
- CSS animation: tick 46s linear infinite at rest
- Lenis scroll velocity speeds it up (GSAP ticker, target max 5x speed, lerp 0.04/0.1)
- Pauses on hover/focus

### Lenis Smooth Scroll
- lerp: 0.12, smoothWheel: true
- Drives ScrollTrigger.update on each frame via lenis.on("scroll", ScrollTrigger.update)

---

## 14. KEYBOARD SHORTCUTS

| Key | Action |
|---|---|
| 1 | Scroll to Work |
| 2 | Scroll to Creator |
| 3 | Scroll to About |
| 4 | Scroll to Contact |
| / | Open Ask palette |
| Cmd/Ctrl + K | Toggle Ask palette |
| j | Next project (focus) |
| k | Previous project (focus) |
| Enter | Open focused project case study |
| ? | Open keyboard map overlay |
| Esc | Close any overlay |

Single-letter commands inside the palette (when input is empty): g → GitHub, y → YouTube, l → LinkedIn, c → Copy email, ? → Keyboard map

---

## 15. RAG / ASK SYSTEM

The "Ask me anything" button (nav) or pressing / opens a command palette that:
1. Searches nav/project/action commands locally (filter by query)
2. For typed questions (3+ chars, question-like): sends POST /api/ask with question + last 6 history messages
3. Returns answers sourced only from the RAG index built from content/projects.mjs + site content

**Local dev note:** RAG answers only work on the deployed Vercel site, or when running `node rag/dev-server.mjs` locally alongside the HTTP server. The error message in the UI says: "Could not reach the answer service. It runs on the deployed site; locally start it with node rag/dev-server.mjs."

**Building the index:** `npm run rag:index` — reads content and writes rag/index.json (250 KB)

---

## 16. API ENDPOINTS

| Endpoint | File | Purpose |
|---|---|---|
| POST /api/ask | api/ask.mjs | RAG Q&A — returns {answer, hits, ms, resolved} |
| POST /api/contact | api/contact.mjs | Contact form → Notify library → email delivery |
| GET /api/contact/:traceId | api/contact/ | Poll delivery status for the ledger shown to the user |

---

## 17. CASE STUDY PAGES (work/*.html)

Each case study uses:
- class="page-cs" on the body element
- Same css/app.css?v=19 + css/grid.css?v=19 stylesheets
- js/cursor.js?v=19 + js/cs.js scripts
- Structure: breadcrumb → h1 → lead → .cs-meta grid → screenshots (.shots) → phases → measured table → learned → next project link

Generated by: `npm run build:work` — scripts/build-work.mjs reads content/projects.mjs and writes the HTML files.

.cs-meta shows: Role, Team, Period, Stack, Status, links (Live / GitHub)

---

## 18. NIMIT'S STATED PREFERENCES (apply when making changes)

1. Identity first: Student → developer/co-founder/creator. Not a "hire me" site — shows full personality.
2. LinkedIn: Do NOT show connection count — "cheap". Currently shows "build in public" only. Keep this.
3. LeetCode 120+: Shown in contact links. Fine there.
4. YouTube: Achievement but not the centerpiece. Creator section placement is correct.
5. Education: Keep clean. No clubs, no extracurriculars.
6. Every number has a source: The site footer says "Every number here has a source". Never add a stat without knowing where it comes from. content/projects.mjs has source fields on every metric.
7. "Measured" pill: Only on projects that have a table of numbers with sources. Currently: CampusCritique, Oil Spill, AskMyNotes, KisanMind. NOT on Zorvyn.
8. Mini projects: Short text links only. No images.
9. Clicky Projects: Still in the "Also live" list but Nimit previously said he wants it removed. Revisit.
10. No aviation theme: v14 aviation theming is entirely gone. Do not reference it.

---

## 19. ALL LINKS — QUICK REFERENCE

| Purpose | URL |
|---|---|
| CampusCritique live | https://campuscritique.in |
| Oil Spill GitHub | https://github.com/TrueMan08/Team_AlgoRise_OilSpill_detection |
| AskMyNotes live | https://askmynotes-algorise.vercel.app/ |
| KisanMind live | https://altahackathon.vercel.app/ |
| KisanMind GitHub | https://github.com/Satyam087/AltaHack |
| Zorvyn live | https://finance-dashboard-nimit.vercel.app/ |
| Zorvyn GitHub | https://github.com/Nimit3418/Finance-Dashboard |
| Business Web App | https://reactui-businesswebapp-nimit.netlify.app/ |
| Cultural Club Vedam | https://cultural-club1.vercel.app/ |
| LeetCode Analytics | https://leetcodeuserextractor.netlify.app/ |
| Clicky Projects | https://nimits-clicky-projects.netlify.app/ |
| GitHub profile | https://github.com/Nimit3418 |
| YouTube channel | https://www.youtube.com/@NimitJain18 |
| LinkedIn | https://www.linkedin.com/in/nimitjain18 |
| LeetCode profile | https://leetcode.com/u/Nimit_Jain07/ |
| Featured by Vedam video | https://youtu.be/uoKKyTPlK0Y |
| Embedded YouTube video | https://www.youtube-nocookie.com/embed/RLUeGSyki-g |

---

## 20. HOW TO WORK ON THIS PROJECT

1. Start local server: `python3 -m http.server 8000` from project root (or `npm run dev`)
2. Open http://localhost:8000
3. HTML changes: Edit index.html directly. WORK:START...WORK:END block is generated — regenerate with `npm run build:work`
4. Style changes: Edit css/app.css for global tokens/components, css/grid.css for grid-variant layout
5. Behavior changes: Edit js/app.js for all animations and interactions, js/cursor.js for cursor only
6. Project data changes: Edit content/projects.mjs → run `npm run build:work` to regenerate work/*.html and the WORK block
7. "Right now" update: Edit content/now.json, then update the NOW:START...NOW:END block in index.html
8. Cache-busting: Files linked with ?v=19 — increment this if browsers cache stale files
9. No build step required for basic HTML/CSS/JS edits — just save and refresh
10. RAG answers locally: Also run `node rag/dev-server.mjs` alongside the HTTP server

### Responsive Breakpoints
- 1150px: 2-col stats grid, single-col creator + contact, narrower changelog sticky
- 940px: Stack hero layout (portrait goes relative), single-col QA, smaller section padding, changelog loses sticky
- 640px: Hide nav links (no hamburger — they just disappear), single-col contact links, smaller ticker border-radius

---

## 21. KNOWN ISSUES AND TODOS

1. Clicky Projects in "Also live": Nimit previously said he wants it removed. Still in index.html line 143.
2. CGPA display: Changelog/ticker shows 9.59 SGPA (semester) vs Q&A shows 9.45 CGPA (running average). index.html correctly shows 9.45 everywhere in the displayed text.
3. portrait.png unused: Safe to delete if needed, not urgent.
4. leetcode-extractor.png, miniapps.png, miniapps-2.png: All unused. Safe to delete.
5. RAG local dev: Ask feature won't work locally without `node rag/dev-server.mjs` running. This is by design.
6. Contact form: Wired to /api/contact → Notify. The old TODO about wiring it is done.
7. Footer year: Dynamically set via document.getElementById("year") in app.js.

---

## 22. PERSONAL STORY DETAILS (available for future copy use)

- Genuine builder and student-first mindset — portfolio shows what he's made and why
- Took Vedam admission only after asking many questions no brochure covered — that experience is why he made the YouTube channel
- Won 1st prize in Vedam's content creation competition → Rs.5,000 Amazon voucher
- YouTube channel started as a 60-day "Vedam college life" challenge; grew organically to 38+ students guided into college
- 8+ paid Campus Connect mentor sessions
- Received praise from Vedam co-founders: Piyush Nangru and Chandan Mathur (both quoted on site)
- Vedam filmed him twice
- Hackathon wins: Noesis (1st, Mar 2026), HackWarts (Top 2, Apr 2026), SIH internal (1st, Sep 2026)
- CampusCritique institutions: Scaler, Newton, Vedam, NIAT featured

---

*Last updated: Sep 2026 — Portfolio version v19 "grid"*
