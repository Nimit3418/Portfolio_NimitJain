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
    one_line: 'College discovery platform I co-founded. Verified reviews, real placement data, paid sessions with seniors.',
    role: 'Co-founder. Product, growth, branding, partnerships',
    team: ['Satyam Kumar Singh (payments, infrastructure)'],
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
      { label: 'Unique visitors', value: '1,100+', detail: 'since launch', window: 'May to Sep 2026', source: 'Vercel Analytics, CampusCritique project' },
      { label: 'Sign-ups', value: '80+', detail: 'verified accounts', window: 'since launch', source: 'Supabase auth.users count' },
      { label: 'Institutions listed', value: '7', detail: 'with structured data', window: 'current', source: 'colleges table' },
      { label: 'Organic search share', value: '53%', detail: 'of sessions', window: 'lifetime', source: 'Vercel Analytics referrers' },
    ],
    measured: true,
    learned: 'Distribution beats features. The referrals from the channel did more for sign-ups than any page we shipped.',
    phases: [
      { title: 'Problem', body: [
        'Picking a new-generation Indian college is a four-year, multi-lakh decision made on brochures and WhatsApp forwards. I made mine at Vedam only after asking a ton of questions the official material never answered. Most students do not get to ask.',
        'The gap is honest, comparable information: what the college is actually like, real placement numbers, and someone who has been there to talk to before you commit.',
      ]},
      { title: 'What I built', body: [
        'The frontend in Next.js on Supabase: authentication, the review submission and moderation workflow, and the mentorship booking flow for Connect, where a student pays for a one-to-one session with a verified senior.',
        'On the product side I own positioning, the college onboarding pipeline, partnerships with Scaler, Newton, Vedam and NIAT, and the brand. Satyam owns payments, notifications and admissions automation.',
      ]},
      { title: 'Result', body: [
        '1,100+ unique visitors and 80+ sign-ups since the May 2026 launch, with 53% of sessions arriving from organic search. Seven institutions are listed with structured data. Connect has completed paid sessions with zero refunds needed, which the payments side reports on its own page.',
      ]},
    ],
  },
  {
    slug: 'oilspill',
    seo_title: 'Oil Spill Detection: SAR slick detection and vessel attribution',
    title: 'Oil Spill Detection',
    one_line: 'Maritime console that detects oil slicks in satellite radar, backtracks drift, and ranks the vessel that caused it.',
    role: 'AIS track reconstruction and vessel attribution',
    team: ['Team AlgoRise, four people'],
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
        'The attribution module. It reconstructs vessel tracks from AIS position reports, which are sparse and noisy, then runs each candidate forward under the same ocean-current forcing the detection side uses to backtrack the slick. Candidates whose forward drift lands on the observed slick rank highest.',
        'The candidate-vessel ranking in the console is my code. The detection model and the console UI were built by teammates; my module is the bridge between them.',
      ]},
      { title: 'Result', body: [
        '1st rank in Vedam\'s internal round, with the national round ahead. The attribution passed 3 of 3 counterfactual forward tests on the validation set: the ranked vessel was the planted culprit each time.',
      ]},
    ],
  },
  {
    slug: 'askmynotes',
    seo_title: 'AskMyNotes AI: a tutor that answers only from your notes',
    title: 'AskMyNotes AI',
    one_line: 'A subject-scoped tutor that answers only from the notes you upload, with citations to the page.',
    role: 'Authentication end to end, user-facing frontend',
    team: ['Team of four'],
    period: 'March 2026, eight hours',
    status: 'hackathon',
    stack: ['JavaScript', 'Supabase', 'RAG'],
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
        'Authentication end to end and the user-facing frontend, in eight hours. The pipeline retrieves only from the uploaded notes for the selected subject, so knowledge never bleeds between subjects, and each answer carries a citation and a confidence badge.',
        'Mid-event the organisers changed the problem statement. Right before submission our connection dropped with the demo broken. We split roles, debugged in parallel and presented calm.',
      ]},
      { title: 'Result', body: [
        '1st of about 50 teams, shortlisted to the top ten and judged live, with a Rs 50K prize pool.',
      ]},
    ],
  },
  {
    slug: 'kisanmind',
    seo_title: 'KisanMind: four LangGraph agents for Indian farmers, in Hindi and Marathi',
    title: 'KisanMind',
    one_line: 'Four LangGraph agents for Indian farmers, with Hindi and Marathi voice, built in 24 hours.',
    role: 'Next.js frontend, wiring live agent output into the UI',
    team: ['Regular crew of four'],
    period: 'April 2026, 24 hours',
    status: 'hackathon',
    stack: ['Next.js', 'TypeScript', 'LangGraph'],
    tags: ['AI / ML', 'Agents', 'Hackathon'],
    links: { live: 'https://altahackathon.vercel.app/', repo: 'https://github.com/Satyam087/AltaHack' },
    shots: [
      { file: 'kisanmind.png', caption: 'Landing page' },
      { file: 'kisanmind-agents.png', caption: 'Agent sections' },
    ],
    metrics: [
      { label: 'Placing', value: 'Top 2', detail: 'of about 40 teams', window: 'Apr 2026', source: 'HackWarts by Alta School of Technology' },
      { label: 'Languages', value: '2', detail: 'Hindi and Marathi voice', window: '', source: 'Groq Whisper STT, Sarvam AI TTS' },
    ],
    measured: true,
    learned: 'Voice in the farmer\'s own language was the feature judges remembered. Reach is a feature.',
    phases: [
      { title: 'Problem', body: [
        'A farmer deciding what to plant needs four things at once: which crop suits the soil and season, what the mandi is paying against MSP today, which government scheme applies, and one plain-language risk summary. Each lives in a different place and none of them speak Hindi or Marathi.',
      ]},
      { title: 'What I built', body: [
        'The Next.js frontend, and the wiring that streams live output from four LangGraph agents into the UI: crop recommendation, mandi prices versus MSP, scheme matching, and a unified risk report. Voice in and out through Groq Whisper and Sarvam AI, so the whole flow works spoken.',
      ]},
      { title: 'Result', body: [
        'Top 2 of about 40 teams at HackWarts, shipped in 24 hours on zero sleep with the regular crew.',
      ]},
    ],
  },
  {
    slug: 'zorvyn',
    seo_title: 'Zorvyn: personal finance dashboard in React',
    title: 'Zorvyn',
    one_line: 'Personal finance dashboard: income, expenses, savings rate, trends, and an insight line that nudges habits.',
    role: 'Everything: design, charts, transactions, insights',
    team: [],
    period: '2026',
    status: 'live',
    stack: ['React', 'Charts'],
    tags: ['Frontend', 'Solo'],
    links: { live: 'https://finance-dashboard-nimit.vercel.app/', repo: 'https://github.com/Nimit3418/Finance-Dashboard' },
    shots: [{ file: 'zorvyn.png', caption: 'Dashboard' }],
    metrics: [],
    measured: false,
    learned: 'A dashboard is a set of decisions about what not to show.',
    phases: [
      { title: 'What it is', body: [
        'A personal finance dashboard in deep obsidian. Income, expenses and savings rate at a glance, balance trends, category breakdowns, and an AI insight line that nudges habits. Admin and viewer roles, CSV export.',
      ]},
      { title: 'What I built', body: [
        'All of it, solo: the dashboard design, the chart components, the transactions model and the insights.',
      ]},
    ],
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
