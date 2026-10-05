# NIMIT JAIN PORTFOLIO — GITHUB REPOSITORY CONTEXT

> **Purpose:** Context file specifically for the GitHub Repository of the Nimit Jain Portfolio (v19-grid) and Profile README. This dictates how the repository is presented, how the `README.md` is structured, and the technical implementation of the theme. 

---

## 1. REPOSITORY OVERVIEW

| Property | Value |
|---|---|
| Repo Name | `NImit3418b` (Profile README) & `Portfolio_NimitJain` (Code) |
| Goal | Act as a high-conversion pinned repository on Nimit's GitHub profile. |
| Theme Translation | The "Editorial / typographic" theme of the portfolio is translated to GitHub Markdown via structured HTML tables, `for-the-badge` shields, live SVG animations, and `<picture>` tags for dark mode support. |

## 2. README.md DESIGN PRINCIPLES (The "Grid" Aesthetic on GitHub)

Because GitHub Markdown has limitations, the aesthetic is maintained using these specific tricks:

1. **Animated Hero:** Uses `readme-typing-svg` styled with `font=Switzer` and `color=C9A961` to mimic the website's hero section dynamically.
2. **Dynamic Dark Mode:** Uses the HTML `<picture>` tag and `<source media="(prefers-color-scheme: dark)">` to swap elements (like the live GitHub stats card) seamlessly based on the viewer's system theme. 
3. **Structured HTML Tables:** We use explicit HTML `<table>`, `<thead>`, and `<tbody>` tags instead of standard markdown tables for the "Selected Work" section. This allows line breaks (`<br>`) and tighter layout control.
4. **"For the Badge" Shields:** We use `style=for-the-badge` and the exact hex colors (`#c9a961` for gold, `#0c0c0c` for ink, `#f4f3ef` for paper) for all badges to make them look like bold UI buttons.
5. **Interactive Details:** We use `<details>` and `<summary>` blocks containing `<blockquote>` for the Postmortems, mirroring the "ink on paper" editorial feel.

## 3. MAINTENANCE RULES

- **Adding Projects:** If a new project is added to `content/projects.mjs` on the website, the HTML table under "Selected Work" in `README.md` must be updated to match.
- **Updating the "Right now" status:** Update the `> 🔴 **RIGHT NOW:**` blockquote in the README whenever `content/now.json` changes.
- **Theme Colors:** Always use `C9A961` (Gold) for accents, `0c0c0c` (Ink) for text/dark-backgrounds, and `f4f3ef` (Paper) for light backgrounds in any generated SVGs or badges.
