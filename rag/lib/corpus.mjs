/**
 * The corpus for Ask the tower: Nimit's site content as plain-text chunks with source anchors.
 * Every fact here appears on the site itself; nothing is invented. Used by the index builder only.
 * URLs are same-page anchors so citations work wherever the site is deployed.
 */

import { readFileSync } from 'node:fs';
import { projects, changelog } from '../../content/projects.mjs';

const now = JSON.parse(readFileSync(new URL('../../content/now.json', import.meta.url), 'utf8'));
const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

export function buildCorpus() {
  /** @type {{id:string,title:string,url:string,section:string,text:string}[]} */
  const chunks = [];
  const add = (id, title, url, section, text) => chunks.push({ id, title, url, section, text: text.replace(/\s+/g, ' ').trim() });

  /* projects: generated from content/projects.mjs, the same file the work index and case pages are built from */
  for (const p of projects) {
    const links = [p.links.live && `Live: ${host(p.links.live)}.`, p.links.repo && `Source: ${host(p.links.repo)}.`].filter(Boolean).join(' ');
    const team = p.team.length ? ` Team: ${p.team.join('; ')}.` : ' Solo build.';
    const metrics = p.metrics.map((m) => `${m.label}${m.detail ? ' (' + m.detail + ')' : ''}: ${m.value}${m.window ? ', ' + m.window : ''}, source ${m.source}`).join('. ');
    add(`${p.slug}#0`, p.title, `/work/${p.slug}.html`, 'Work',
      `${p.title}, ${p.period}, status ${p.status}. ${p.one_line} Nimit's role: ${p.role}.${team}
       ${p.phases.map((ph) => `${ph.title}: ${ph.body.join(' ')}`).join(' ')}
       ${metrics ? 'On record: ' + metrics + '.' : ''} Learned: ${p.learned} Stack: ${p.stack.join(', ')}. ${links}`);
    if (p.metrics.length) add(`${p.slug}#stats`, `${p.title} numbers`, `/work/${p.slug}.html#measured`, 'Measured',
      `${p.title} numbers, each with a source. ${p.metrics.map((m) => `What is the ${m.label.toLowerCase()}? ${m.value}${m.detail ? ' ' + m.detail : ''}${m.window ? ' (' + m.window + ')' : ''}; source: ${m.source}.`).join(' ')}`);
  }

  add('changelog#0', 'Changelog', '/#changelog', 'Changelog',
    `Nimit's changelog, newest first, one learning per entry. ${changelog.map((c) => `${c.v}, ${c.date}: ${c.what} Learned: ${c.learned}`).join(' ')}`);

  add('now#0', 'Right now', '/#now', 'Now',
    `What is Nimit working on right now? Building ${now.building}. What is he watching? ${now.watching}. What is he reading?
     ${now.reading}. This line was last updated on ${now.updated}.`);

  add('identity#0', 'About Nimit', '/#top', 'Identity',
    `Nimit Jain is a Computer Science (AI) undergraduate at Vedam School of Technology in Pune, India (B.Tech CS (AI), 2025 to 2029).
     He is a student, developer, co-founder of CampusCritique, and a YouTube creator. He builds honest tools for students and
     documents everything on the way up. He is from Delhi and now lives in Pune .
     He is open to internships. Contact: jainnimit34b@gmail.com. He responds within 24 hours.`);

  add('identity#roles', 'Four roles', '/#about', 'About',
    `Nimit is one person with four jobs, all for students. Co-founder: building CampusCritique, the honest college platform (1,100+ visitors).
     Developer: 4+ full-stack builds across React, Next.js and Python, with two hackathon first places.
     Creator: the YouTube channel juniors trust for unfiltered guidance (1,700+ watch hours).
     Mentor: paid 1-to-1 sessions and 38+ successful referrals.`);

  add('hangar#0', 'Smaller projects', '/#work', 'Also live',
    `Nimit's smaller live projects: a Business Web App in React (reactui-businesswebapp-nimit.netlify.app), the Cultural Club site
     for Vedam (cultural-club1.vercel.app), Clicky Projects (nimits-clicky-projects.netlify.app), and LeetCode Analytics
     (leetcodeuserextractor.netlify.app).`);

  add('skills#0', 'Skills', '/#about', 'About',
    `Nimit's skills. Languages: Java, Python, JavaScript. Web: React, Next.js, Supabase, Tailwind, REST APIs.
     Tools and craft: Git, GitHub, video editing, graphic design. Learning now (priority): MERN backend, machine learning with Python,
     and daily DSA in Java.`);

  add('creator#0', 'YouTube channel', '/#creator', 'The creator side',
    `Nimit runs the YouTube channel @NimitJain18. He took admission at Vedam only after getting answers to a ton of questions;
     the channel exists so juniors get those answers for free: what the college is actually like, what to learn before day one,
     which mistakes to skip. On record: 1,700+ hours of watch time, 43,719 views, 523 subscribers, and beyond views, 38+ students
     made their college application through his guidance. He was featured by Vedam, filmed twice (youtu.be/uoKKyTPlK0Y).`);

  add('creator#stats', 'Channel numbers', '/#creator', 'The creator side',
    `Nimit's YouTube channel numbers. How many subscribers does the channel have? 523 subscribers.
     How many subs? 523. How many views does it have? 43,719 views. How much watch time? 1,700+ hours of watch time.
     How many referrals came from it? 38+ students made their college application through his guidance.
     The channel is youtube.com/@NimitJain18 and it was featured by Vedam, filmed twice.`);

  add('availability#0', 'Availability', '/#contact', 'Contact',
    `Is Nimit available? Yes. Is he open to internships? Yes, across frontend, product, AI and content. Can I hire him or work
     with him? Reach out at jainnimit34b@gmail.com; he responds within 24 hours. He is based in Pune, India, timezone IST.`);

  add('incident#1', 'Incident: LeetCode Analytics', '/#about', 'About',
    `What went wrong with LeetCode Analytics, the API Nimit never checked: Nimit built the full UI and data logic, then discovered LeetCode's
     API has paid limits; most of the work was already done. Resolution: feasibility now gets validated before execution; research is
     part of the build, not a warm-up.`);

  add('incident#2', 'Incident: Noesis final approach', '/#about', 'About',
    `What went wrong at the 8-hour Noesis hackathon, connection lost at the finish: a twist changed the problem mid-event,
     then connectivity dropped right before submission with the demo broken. Resolution: the team split roles instantly, debugged in
     parallel, presented calm, and won. Division of work beats heroics.`);

  add('quotes#0', 'What people say', '/#about', 'About',
    `Piyush Nangru (co-founder, Elevate Education, building Vedam) told Nimit: "Every build teaches us something. Continue to
     #BuildInPublic!" Chandan Mathur (P&L owner and 0-to-1 business builder) told him: "The number of questions you had last year and
     with the answers you got, I am sure you can help a lot of students basis your insights!"`);

  add('credentials#0', 'Education and records', '/#about', 'About',
    `Nimit's records. What is his CGPA or GPA? 9.45 CGPA. B.Tech CS (AI) at Vedam School of Technology, 2025 to 2029. Standing: 9.45 CGPA, rank 7 in semester 1
     (semester 1 SGPA 9.59). Schooling: Ramjas School, New Delhi, Class XII in 2025. Training: Forage job simulations
     (Goldman Sachs, Deloitte) and Scaler Young Innovator. Roles: co-founder at CampusCritique since May 2026, YouTube creator
     since October 2025, mentor on Campus Connect with 8+ paid sessions.`);

  add('awards#0', 'Awards and stamps', '/#about', 'Results',
    `Nimit's results and awards: 1st place at the Noesis hackathon (March 2026, AskMyNotes); 1st rank in the SIH 2026 internal round at Vedam
     (September 2026, Team AlgoRise); Top 2 of about 40 at HackWarts (April 2026, KisanMind); a content award, 1st place with a
     Rs 5,000 prize (2026); featured by Vedam and filmed twice (2026).`);

  add('links#0', 'Profiles and links', '/#contact', 'Contact',
    `Nimit's profiles: GitHub github.com/Nimit3418 (26 repositories); YouTube youtube.com/@NimitJain18 (43,719 views);
     LinkedIn linkedin.com/in/nimitjain18 (build in public); LeetCode leetcode.com/u/Nimit_Jain07 (120+ problems solved);
     Google Maps local guide (109K+ review views). Email: jainnimit34b@gmail.com. He is open to internships across frontend,
     product, AI and content, and responds within 24 hours.`);

  add('sih#0', 'SIH internal round result', '/#work', 'Work',
    `How did the team do in the SIH internal round? Nimit's team, Team AlgoRise, took 1st rank in Vedam's internal
     Smart India Hackathon 2026 round with the Oil Spill Detection project. The national round is ahead.`);

  add('facts#0', 'Quick facts', '/#top', 'Facts',
    `Quick answers. What is Zorvyn? Zorvyn is Nimit's personal finance dashboard, a solo full build in React.
     How did the team do in the SIH internal round? Team AlgoRise took 1st rank in Vedam's internal Smart India Hackathon 2026
     round with the Oil Spill Detection project; the national round is ahead. Where is Nimit based? Pune, India (IST timezone),
     originally from Delhi. What is he studying? B.Tech Computer Science (AI) at Vedam School of Technology, 2025 to 2029.
     Is he available? Yes, he is open to internships; email jainnimit34b@gmail.com.`);

  add('behind#0', 'Behind this site', '/#contact', 'Contact',
    `How this site is built: a static page in plain HTML, CSS and JavaScript, paper and ink with one gold accent, set in Instrument
     Sans and Switzer. GSAP and Lenis power the motion. The work index and every case-study page are generated from one content file,
     so each number exists in one place, and every number on the site has a named source (the footer says so: every number here has a
     source). This Ask panel answers only from the site's own text, with citations. It was built through many iterations with an
     AI pair-programmer, directed by Nimit.`);

  return chunks;
}
