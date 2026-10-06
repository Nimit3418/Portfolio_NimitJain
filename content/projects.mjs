/**
 * Single source of truth for Nimit's projects. The work index, every case-study page and the
 * RAG corpus read from here, so a number can only ever exist in one place.
 * Every metric carries a source; the site's promise is "every number has a source".
 */
export const projects = [
  {
    slug: 'campuscritique',
    seo_title: 'CampusCritique: college discovery platform with verified reviews',
    title: 'CampusCritique',
    one_line: 'College discovery platform I co-founded. Verified reviews, real placement data, side-by-side compare, and paid mentorship sessions.',
    role: 'Co-founder · Product, frontend, growth, branding, partnerships',
    team: [],
    period: 'May 2026 to present',
    status: 'live',
    stack: ['Next.js', 'React', 'Supabase', 'Tailwind'],
    tags: ['Product', 'Full stack', 'Live'],
    links: { live: 'https://campuscritique.in' },
    shots: [
      { file: 'campuscritique.png', caption: 'Homepage' },
      { file: 'campuscritique-explore.png', caption: 'Explore colleges' },
      { file: 'campuscritique-compare.png', caption: 'Side-by-side compare' },
    ],
    metrics: [
      { label: 'Unique visitors', value: '1,300+', detail: 'since launch', window: 'May to Sep 2026', source: 'Vercel Analytics, CampusCritique project' },
      { label: 'Sign-ups', value: '80+', detail: 'verified accounts', window: 'since launch', source: 'Supabase auth.users count' },
      { label: 'Institutions listed', value: '8', detail: 'with structured data', window: 'current', source: 'colleges table' },
      { label: 'Organic search share', value: '53%', detail: 'of sessions', window: 'lifetime', source: 'Vercel Analytics referrers' },
    ],
    measured: true,
    learned: 'Distribution beats features. The referrals from the channel did more for sign-ups than any page we shipped.',
    phases: [
      { title: 'Problem', body: [
        'Picking a new-generation Indian college is a four-year, multi-lakh decision made on brochures and WhatsApp forwards. Most students never get to ask the real questions the official material never answers.',
        'The gap is honest, comparable information: what the college is actually like, real placement numbers, and someone who has been there to talk to before you commit.',
      ]},
      { title: 'What I built', body: [
        'The full product end-to-end in Next.js on Supabase: authentication, verified review submission and moderation workflow, side-by-side college comparison tool, community Q&A, anonymous reviews, and the Connect mentorship booking flow where students pay for one-to-one sessions with verified seniors.',
        'On the product side I own positioning, the college onboarding pipeline, partnerships with Scaler, Newton, Vedam, NIAT, Alta, Veloces, and Intellipaat, and the brand identity.',
      ]},
      { title: 'Result', body: [
        '1,300+ unique visitors and 80+ sign-ups since the May 2026 launch, with 53% of sessions arriving from organic search. Eight institutions are listed with structured data across 6 comparison dimensions. Connect has completed paid sessions with zero refunds needed.',
      ]},
    ],
  },
  {
    slug: 'oilspill',
    seo_title: 'Oil Spill Detection: SAR slick detection and vessel attribution',
    title: 'Oil Spill Detection',
    one_line: 'Maritime console that detects oil slicks in satellite radar, backtracks drift, and ranks the responsible vessel using AIS track reconstruction.',
    role: 'AIS track reconstruction, vessel attribution module, candidate ranking algorithm',
    team: ['Team AlgoRise, four members'],
    period: 'August to September 2026',
    status: 'hackathon',
    stack: ['Python', 'FastAPI', 'AIS data'],
    tags: ['AI / ML', 'Backend', 'Hackathon'],
    links: { repo: 'https://github.com/TrueMan08/Team_AlgoRise_OilSpill_detection' },
    shots: [
      { file: 'oilspill-2.jpeg', caption: 'Incident console, satellite view' },
      { file: 'oilspill-1.jpeg', caption: 'Incident console, map view' },
    ],
    metrics: [
      { label: 'Internal round result', value: '1st', detail: 'of all teams at Vedam', window: 'Sep 2026', source: 'Smart India Hackathon 2026 internal round, Vedam' },
      { label: 'Attribution tests passed', value: '3 of 3', detail: 'counterfactual forward runs', window: 'validation', source: 'Test set in the repository, attribution/tests' },
    ],
    measured: true,
    learned: 'The ranking is only as honest as the counterfactual. Run the drift forward from each candidate, not just backward from the slick.',
    phases: [
      { title: 'Problem', body: [
        'A slick shows up on Sentinel-1 radar hours after the spill. By then the vessel responsible is somewhere else. Detection alone names a location; the useful question is which ship.',
        'Smart India Hackathon 2026 posed this as a maritime intelligence problem: detect, then attribute.',
      ]},
      { title: 'What I built', body: [
        'The attribution module. It reconstructs vessel tracks from sparse, noisy AIS position reports, then runs each candidate forward under the same ocean-current forcing the detection side uses to backtrack the slick. Candidates whose forward drift lands on the observed slick rank highest.',
        'The candidate-vessel ranking in the console is my code. The detection model and the console UI were built by teammates; my module is the bridge between them.',
      ]},
      { title: 'Result', body: [
        '1st rank in Vedam\'s internal round, with the national round ahead. The attribution passed 3 of 3 counterfactual forward tests on the validation set: the ranked vessel was the planted culprit each time.',
      ]},
    ],
  },
  {
    slug: 'askmynotes',
    seo_title: 'AskMyNotes AI: a subject-scoped AI tutor that answers from your notes',
    title: 'AskMyNotes AI',
    one_line: 'Subject-scoped AI study copilot that answers only from uploaded notes, provides page-level citations, and prevents hallucinations.',
    role: 'Authentication end to end, frontend architecture, UI/UX',
    team: ['Team of four'],
    period: 'March 2026, eight hours',
    status: 'hackathon',
    stack: ['JavaScript', 'Next.js', 'Supabase', 'RAG'],
    tags: ['AI / ML', 'Full stack', 'Hackathon'],
    links: { live: 'https://askmynotes-algorise.vercel.app/' },
    shots: [
      { file: 'askmynotes.png', caption: 'Landing page' },
      { file: 'askmynotes-preview.png', caption: 'Chat over uploaded notes' },
    ],
    metrics: [
      { label: 'Placing', value: '1st', detail: 'of about 50 teams', window: 'Mar 2026', source: 'Noesis hackathon results; top-10 shortlist judged live' },
      { label: 'Prize pool', value: 'Rs 50K', detail: '', window: '', source: 'Noesis hackathon' },
    ],
    measured: true,
    learned: 'Division of work beats heroics. When the connection died before submission, three people debugging in parallel is what saved it.',
    phases: [
      { title: 'Problem', body: [
        'General chatbots mix knowledge across subjects and invent sources. A student revising wants answers grounded in their own notes, with a page number they can check.',
      ]},
      { title: 'What I built', body: [
        'Authentication end to end and the user-facing frontend, in eight hours. The RAG pipeline retrieves only from uploaded notes for the selected subject so knowledge never bleeds between subjects. Each answer carries a citation, confidence badge, and page reference.',
        'Mid-event the organisers changed the problem statement. Right before submission our connection dropped with the demo broken. We split roles, debugged in parallel and presented calm.',
      ]},
      { title: 'Result', body: [
        '1st of about 50 teams, shortlisted to the top ten and judged live, with a Rs 50K prize pool.',
      ]},
    ],
  },
  {
    slug: 'kisanmind',
    seo_title: 'KisanMind: multi-agent AI decision support for Indian farmers',
    title: 'KisanMind',
    one_line: 'Multi-agent AI platform for Indian farmers with crop intelligence, live mandi prices, risk prediction, and government scheme matching — in Hindi and Marathi voice.',
    role: 'Next.js frontend, streaming agent output into the UI, voice I/O integration',
    team: ['Regular crew of four'],
    period: 'April 2026, 24 hours',
    status: 'hackathon',
    stack: ['Next.js', 'TypeScript', 'LangGraph', 'Groq Whisper', 'Sarvam AI'],
    tags: ['AI / ML', 'Agents', 'Hackathon'],
    links: { live: 'https://altahackathon.vercel.app/', repo: 'https://github.com/Satyam087/AltaHack' },
    shots: [
      { file: 'kisanmind.png', caption: 'Landing page' },
      { file: 'kisanmind-agents.png', caption: 'Agent sections' },
    ],
    metrics: [
      { label: 'Placing', value: 'Top 2', detail: 'of about 40 teams', window: 'Apr 2026', source: 'HackWarts by Alta School of Technology' },
      { label: 'AI Agents', value: '4', detail: 'Crop, Market, Risk, Finance', window: '', source: 'LangGraph orchestration' },
    ],
    measured: true,
    learned: 'Voice in the farmer\'s own language was the feature judges remembered. Reach is a feature.',
    phases: [
      { title: 'Problem', body: [
        'A farmer deciding what to plant needs four things at once: which crop suits the soil and season, what the mandi is paying against MSP today, which government scheme applies, and one plain-language risk summary. Each lives in a different place and none of them speak Hindi or Marathi.',
      ]},
      { title: 'What I built', body: [
        'The Next.js frontend, and the wiring that streams live output from four LangGraph agents into the UI: crop intelligence (87% confidence), mandi prices across 50+ mandis versus MSP, risk prediction against IMD forecasts, and government scheme matching across 12+ active schemes. Voice in and out through Groq Whisper and Sarvam AI, so the whole flow works spoken.',
      ]},
      { title: 'Result', body: [
        'Top 2 of about 40 teams at HackWarts, shipped in 24 hours on zero sleep with the regular crew.',
      ]},
    ],
  },
  {
    slug: 'zorvyn',
    seo_title: 'Zorvyn: premium personal finance analytics dashboard',
    title: 'Zorvyn',
    one_line: 'Premium finance analytics dashboard: income, expenses, savings rate, trends, category breakdowns, and AI insight nudges — with role-based access and CSV export.',
    role: 'Everything: design system, charts, transactions model, insights engine',
    team: [],
    period: '2026',
    status: 'live',
    stack: ['React', 'Charts', 'Vite'],
    tags: ['Frontend', 'Solo'],
    links: { live: 'https://finance-dashboard-nimit.vercel.app/', repo: 'https://github.com/Nimit3418/Finance-Dashboard' },
    shots: [{ file: 'zorvyn.png', caption: 'Dashboard' }],
    metrics: [],
    measured: false,
    learned: 'A dashboard is a set of decisions about what not to show.',
    phases: [
      { title: 'What it is', body: [
        'A premium finance analytics dashboard with deep obsidian UI. Income, expenses and savings rate at a glance, balance trends, category breakdowns, and an AI insight line that nudges habits. Role-based admin and viewer access, CSV export, and responsive across all devices.',
      ]},
      { title: 'What I built', body: [
        'All of it, solo: the design system, the chart components using custom data visualisations, the transactions model, and the insights engine.',
      ]},
    ],
  },
];

/* Extra projects: displayed as smaller cards with a "View more" toggle */
export const extras = [
  {
    title: 'Business Web App',
    one_line: 'React-based business landing page with component-driven UI, responsive layouts, and Vite build pipeline.',
    stack: ['React', 'Vite', 'CSS'],
    link: 'https://reactui-businesswebapp-nimit.netlify.app/',
  },
  {
    title: 'Cultural Club for Vedam',
    one_line: 'Event management website for Vedam\'s Cultural Club — 8 club pages, event calendar, team profiles, gallery, and registration flow.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    link: 'https://cultural-club1.vercel.app/',
  },
  {
    title: 'Clicky Projects',
    one_line: 'Collection of interactive JavaScript mini-projects: love calculator, quote generator, color changer, and astrology insights — all DOM-driven.',
    stack: ['JavaScript', 'HTML', 'CSS'],
    link: 'https://nimits-clicky-projects.netlify.app/',
  },
  {
    title: 'LeetCode Analytics',
    one_line: 'LeetCode user stats extractor — fetches and displays solve counts, ranking, and problem distribution via the LeetCode API.',
    stack: ['JavaScript', 'API', 'CSS'],
    link: 'https://leetcodeuserextractor.netlify.app/',
  },
];

export const filters = [
  { key: 'all', label: 'All', tags: [] },
  { key: 'ai', label: 'AI / ML', tags: ['AI / ML', 'Agents'] },
  { key: 'fullstack', label: 'Full stack', tags: ['Full stack', 'Frontend', 'Backend'] },
  { key: 'product', label: 'Product', tags: ['Product', 'Live'] },
  { key: 'hackathon', label: 'Hackathons', tags: ['Hackathon'] },
];

export const changelog = [
  { v: 'v0.7', date: 'Sep 2026', what: '1st in the SIH internal round with Oil Spill Detection. National round ahead.', learned: 'Run the counterfactual, not just the backtrack.' },
  { v: 'v0.6', date: 'May 2026', what: 'Co-founded CampusCritique.', learned: 'Distribution beats features.' },
  { v: 'v0.5', date: 'Apr 2026', what: 'Top 2 at HackWarts with KisanMind.', learned: 'Reach is a feature.' },
  { v: 'v0.4', date: 'Mar 2026', what: '1st place at Noesis with AskMyNotes.', learned: 'Division of work beats heroics.' },
  { v: 'v0.3', date: 'Oct 2025', what: 'YouTube launched with a 60-day Vedam challenge. First hackathon.', learned: 'The comment section is the honest metric.' },
  { v: 'v0.2', date: 'Aug 2025', what: 'B.Tech CS (AI) begins at Vedam, Pune. Rank 7, 9.59 SGPA.', learned: 'Ask the questions before day one.' },
  { v: 'v0.1', date: 'Jun 2025', what: 'Scaler internship, Young Innovator challenge 4.0.', learned: 'First structured build with AI.' },
];
