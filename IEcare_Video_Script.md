# IEcare — Video Script & Visual Plan
**Target length:** 2:30–3:00 · **Tone:** Clean, academic, confident · **Pace:** ~150 words/min (≈400 words total)

---

## Visual & audio direction (applies throughout)

- **Palette:** Off-white background (#F7F6F2), deep navy text (#0F1B2D), one accent (clinical teal #0E7C86 or restrained red #B23A48 for the "binding constraint" callouts). Avoid bright blues and greens that read as generic tech.
- **Typography:** A single serif for titles (e.g. *Source Serif*, *Lora*, or *Times New Roman* to mirror the report) and a clean sans for body (*Inter*, *Helvetica Neue*). Keep on-screen text minimal — 6–10 words per frame.
- **Motion:** Slow fades, subtle parallax, equations that *write themselves on* rather than pop in. No zooms, no whooshes, no stock-video transitions.
- **Music:** Low-tempo neoclassical or muted ambient piano (royalty-free: try Epidemic Sound's "Documentary" category or Pixabay's classical section). Sit it at roughly −20 dB under voiceover.
- **Voiceover:** Single narrator, measured pace, mid-register. If using AI voice, ElevenLabs "Daniel" or "Charlotte" work well for academic tone.
- **Recording the web app:** Use a screen-recorder (Loom, OBS, or QuickTime on Mac) at 1080p, then slow the playback to ~75% in editing so viewers can read inputs and outputs.

---

## Scene-by-scene breakdown

### SCENE 1 — Hook (0:00–0:15)
**Voiceover:**
> "Every hospital faces the same question: given a fixed budget, a fixed floor plan, and a fixed pool of staff — how many patients can it actually care for? We built a tool that answers it."

**Visuals:**
- Open on a black frame. Fade up a single line of small text, top-left: *IE University · Industrial Engineering · 2026*.
- Cut to a slow pan across a stylised hospital floor plan (top-down line drawing — beds, corridors, no people). Keep it monochrome with only the beds highlighted in the accent colour.
- End the scene on the project name **IEcare** appearing centred, serif, with a thin horizontal rule underneath.

**On-screen text:** `IEcare — A Linear Programming Approach to Hospital Capacity`

---

### SCENE 2 — The problem & the variables (0:15–0:35)
**Voiceover:**
> "We modelled hospital capacity using five variables — doctors, nurses, equipment, beds, and patients — bounded by three real-world limits: a finite budget, a finite floor area, and regulatory minimum staffing. Because hospitals run twenty-four hours a day, every patient requires three shifts of staff, not one."

**Visuals:**
- Five icons fade in one by one, evenly spaced across the screen: doctor, nurse, monitor, bed, patient. Use simple line icons (Lucide or Phosphor icon sets — both free).
- Underneath each, the variable letter writes on: *d, n, e, b, p*.
- Transition: the five icons collapse into a single equation that types itself out:
  `p ≤ min( P_budget , P_space )` and below it `p ≥ max( P_min_doctors , P_min_nurses )`
- A small "× 3 shifts" multiplier appears next to the doctor and nurse icons to reinforce the 24/7 point.

**On-screen text:** Equation only. No bullet points.

---

### SCENE 3 — The mathematical model (0:35–1:00)
**Voiceover:**
> "Substituting each resource as a linear function of patient count lets us re-express the entire problem in a single inequality. The maximum patient capacity, P-star, is the tighter of two ceilings — budget divided by cost per slot, or floor area divided by space per slot — clipped from below by the minimum staffing floor."

**Visuals:**
- Centre-stage: the **final compound inequality** from the report, written out cleanly in LaTeX:
  `max(d_min/d_p , n_min/n_p) ≤ p ≤ min( B / (C_d·d_p + C_n·n_p + C_e·e_p + C_b·b_p) , A_T / (A_e·e_p + A_b·b_p) )`
- Animate the derivation in three quick stages: (1) substitution, (2) factoring p, (3) isolating p. Each stage fades the previous one out.
- Keep the camera still — let the math do the moving.

**Tip:** Render the equations in MathJax or KaTeX, screenshot at high resolution, then animate the reveal in your editor. Don't try to type LaTeX directly into a video tool — the kerning will look wrong.

---

### SCENE 4 — IEcare web app demo (1:00–1:35)
**Voiceover:**
> "We turned the model into a web application built in Next.js, using a Simplex-method solver that runs entirely in the browser. The user enters their hospital's parameters; the engine returns the optimal patient capacity, the binding constraint, and an exportable analysis — in under a second."

**Visuals:**
- Cut to a clean screen recording of the IEcare web app at `webapp-rose-ten.vercel.app`.
- Show three beats, each held for ~3 seconds:
  1. The **input panel** — fields filling in for a sample hospital (use the Regional District General row from your table: €8M, 800 m², etc.).
  2. The **result card** — P★ = 55.5, binding constraint flagged as Budget.
  3. The **sensitivity dashboard** — the tornado diagram or one of the parameter sweep curves.
- Overlay a thin caption at the bottom: `Live at webapp-rose-ten.vercel.app`
- Optional: a brief mention "(UI scaffolded with Claude Code)" overlaid in small text if you want to credit the tooling, as your report does.

---

### SCENE 5 — The twelve scenarios (1:35–2:10)
**Voiceover:**
> "We stress-tested the model across twelve hospital archetypes — from a rural cottage hospital to a pandemic surge facility. The result that surprised us most: the binding constraint is rarely the same twice. Budget binds in eight scenarios, space binds in three, and one hospital is trapped by regulatory minimum staffing alone."

**Visuals:**
- A horizontal bar chart of all 12 hospitals ranked by P★, with bars colour-coded by binding constraint (red = budget, amber = space, blue = dual, purple = staffing floor). The Pandemic Surge bar dwarfs the others — that's the visual punchline.
- Two callout cards slide in over the chart:
  - **"Private Premium Hospital"** — 60% budget used, 100% space used → space binds.
  - **"Rural Cottage Hospital"** — staffing minimums consume 35% of budget before a single optimised patient slot.
- End the scene by zooming out so all 12 bars are visible together.

**Tip:** Build the chart in Python (matplotlib or plotly) or directly in Figma. Export as a high-res PNG sequence if you want to animate bars growing in.

---

### SCENE 6 — The insight (2:10–2:35)
**Voiceover:**
> "The lesson is sharper than the model itself. In every budget-bound hospital, staff salaries — across three daily shifts — account for over ninety percent of the cost per patient slot. Improving the patients-per-clinician ratio by one is roughly ten times more impactful than cutting equipment spend. Diagnose the binding constraint first; intervene there second."

**Visuals:**
- A simple two-panel split. Left: a donut chart showing ~92% staff salaries, ~8% equipment. Right: a horizontal "leverage" bar showing the relative impact of changing the staffing ratio vs cutting equipment cost.
- Hold the frame. Don't over-animate — this is the takeaway moment.

**On-screen text:** `Diagnose the binding constraint. Then intervene.`

---

### SCENE 7 — Outro (2:35–2:55)
**Voiceover:**
> "IEcare — a working tool, a transferable framework, and a reminder that in healthcare operations, the answer always depends on where the ceiling actually sits."

**Visuals:**
- Fade back to the IEcare wordmark on the off-white background.
- Beneath it, in small serif: contributors' names (the eight from the report — Aron, Enzo, Krishiv, Alex, Abi, Manu, Lucas, Gabi, Diego, Marco — adjust to your actual team).
- Below that: `IE University · Industrial Engineering · May 2026`
- Hold for 4 seconds. Fade to black.

---

## Production checklist

- [ ] Record voiceover first; cut visuals to it, not the other way round.
- [ ] Keep total runtime under 3:00 — academic juries reward density.
- [ ] Export at 1080p, H.264, with captions burned in or available as a sidecar `.srt` (improves accessibility scoring).
- [ ] Cite the report's contributors and the web app URL in the description, not only on-screen.
- [ ] If the assignment requires a particular file format, confirm before final export.

## Tools that will save you time

- **Captions & rough cut:** Descript (transcribes the voiceover and lets you cut by editing text).
- **Equation animation:** Manim (Python) for polished math reveals, or just animate PNG layers in After Effects / Premiere / DaVinci Resolve (free).
- **Charts:** Build in Python or Figma, then animate in your editor.
- **Screen recording:** OBS (free) or QuickTime; record at 60fps so slow-playback stays smooth.
- **Music:** Pixabay (free, no attribution), Epidemic Sound (subscription, broader catalogue), or YouTube Audio Library.
