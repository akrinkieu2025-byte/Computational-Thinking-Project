# IEcare — AI Video Generation Prompts
**Target generator:** Kling 2.6 Pro (recommended) or Kling 2.5 Turbo · Veo 3.1 if available · Seedance 2.0 for image-to-video
**Clip length:** 10 seconds each · **Aspect ratio:** 16:9 · **Resolution:** 1080p minimum

---

## How to use this file

Each scene from the script needs **1–2 clips of 10 seconds**. For a 2:30–3:00 final video you'll generate roughly **16–18 clips** total and trim/overlap them in iMovie.

**Three rules that will save you re-generations:**

1. **Never ask the AI to render readable text.** Anything that has to be legible — the equation, chart labels, the word "IEcare", contributor names — goes on top of the clip as an iMovie title layer. The prompts below describe scenes that *imply* text without containing it (e.g. "a chalkboard with handwritten equations, slightly out of focus").
2. **Use negative prompts.** Every clip should include a negative prompt blocking: `text, captions, watermarks, logos, distorted hands, warped faces, fast camera movement, jump cuts, lens flare, oversaturation`.
3. **Lock the style across clips.** Paste this style suffix at the end of every prompt to keep the look consistent: `cinematic documentary style, muted colour palette of off-white, deep navy, and clinical teal, soft natural lighting, shallow depth of field, slow steady camera, 24fps film look, no on-screen text`.

---

## Scene-by-scene prompts

### SCENE 1 — Hook (0:00–0:15) · 2 clips

**Clip 1A — Establishing shot of a hospital corridor**
> Slow tracking shot moving forward through a quiet, empty modern hospital corridor at dawn. Pale morning light coming through tall windows on the left. Polished concrete floor reflecting the windows. Empty hospital beds visible through doorways. No people. The corridor stretches into soft focus in the distance. Calm, contemplative atmosphere, almost architectural. [STYLE SUFFIX]

**Clip 1B — Top-down architectural plan**
> A clean overhead view of a stylised hospital floor plan rendered as thin navy line drawings on an off-white surface, like an architect's blueprint laid on a desk. Beds, corridors, and equipment shown as simple geometric shapes. Camera slowly pushes in on the plan from above. A single anatomical shape glows faintly in a muted teal accent colour. No people, no text labels. [STYLE SUFFIX]

---

### SCENE 2 — Variables & the problem (0:15–0:35) · 2 clips

**Clip 2A — Hospital resources, abstract**
> A series of slow, locked-off macro shots inside a hospital, each held for 2 seconds: a stethoscope resting on a clipboard, an empty hospital bed with crisp white sheets, a heart monitor screen showing a gentle waveform, a nurse's station with a chair turned away from camera. Shallow depth of field, off-white and navy palette with the monitor glowing faint teal. No people visible. Quiet, observational, documentary tone. [STYLE SUFFIX]

**Clip 2B — Three-shift coverage suggestion**
> A wide static shot of a hospital window from inside a dim corridor. The view through the window cycles slowly through dawn light, midday sun, and evening blue in a smooth time-lapse over ten seconds. The corridor itself stays still and empty. The transition is gentle and continuous, suggesting twenty-four hour continuity. No people, no clock visible. [STYLE SUFFIX]

---

### SCENE 3 — The mathematical model (0:35–1:00) · 2 clips

> **Note:** The actual equation will be a title overlay in iMovie. These clips are atmospheric beds you'll lay the equation on top of.

**Clip 3A — Abstract academic backdrop**
> A close-up of a hand holding a fountain pen, hovering just above thick cream-coloured paper on a wooden desk. The pen does not write — it lingers. Soft warm light from the left. The page is blank but textured. Camera is locked off. Slight, almost imperceptible movement of the hand. Scholarly, calm, restrained. [STYLE SUFFIX]

**Clip 3B — Mathematical environment**
> A slow lateral dolly past an old wooden university blackboard covered in faint, half-erased chalk markings — abstract shapes and curves only, no legible numbers or letters. Dust particles drift through a shaft of afternoon light. The board is slightly out of focus so individual marks blur into texture. Academic, contemplative, archival feel. [STYLE SUFFIX]

---

### SCENE 4 — IEcare web app demo (1:00–1:35) · This is a SCREEN RECORDING, not AI

**Do not generate this with AI.** Record the IEcare app directly using QuickTime (Mac) or OBS. Walk through three states:
1. Empty input form → fields filling in for Regional District General (€8M, 800 m², etc.)
2. Hit calculate → result card showing P★ = 55.5, "Budget binding" flag
3. Click through to the sensitivity tab → tornado diagram or one parameter sweep

Record at 1080p, then slow playback to 75% in iMovie so viewers can read the interface. Total recorded length: aim for 35 seconds of raw footage to fill the scene.

**Optional AI clip to bookend the demo (5 sec):**
> A clean modern laptop sitting on a minimalist desk in soft daylight, screen glowing but content not visible to camera (screen seen edge-on or reflected indirectly). Hands not visible. Slight camera push-in. Off-white walls, dark wood desk, a notebook beside the laptop. Calm, professional studio atmosphere. [STYLE SUFFIX]

---

### SCENE 5 — Twelve scenarios stress test (1:35–2:10) · 3 clips

> **Note:** The actual bar chart will be a graphic overlay built in Figma/Python and animated in iMovie. These AI clips are visual variety — quick cuts of different hospital types to imply the range of scenarios.

**Clip 5A — Premium private hospital interior**
> Slow tracking shot through a spacious, hotel-like private hospital suite. One empty bed with high-quality linens, a large window with city light spilling in, an upholstered armchair, polished wood floor. The room feels expensive and underused. Warm, expensive, restrained luxury. No people. [STYLE SUFFIX]

**Clip 5B — Rural cottage hospital exterior**
> A wide static shot of a small, single-storey stone-and-brick cottage hospital nestled in green countryside under overcast morning light. A single light is on in one window. The building is modest, perhaps with a small red cross sign. No people, no cars. Damp, quiet, English-rural atmosphere. [STYLE SUFFIX]

**Clip 5C — Pandemic surge facility**
> An overhead wide shot looking down into an enormous converted exhibition hall, now filled with rows and rows of identical empty hospital field beds with white sheets, arranged in a vast grid. Industrial overhead lighting. The scale is overwhelming. No people. Cold, institutional, slightly unsettling. [STYLE SUFFIX]

---

### SCENE 6 — The insight (2:10–2:35) · 2 clips

> **Note:** The donut chart showing 92% staff salaries will be a graphic overlay. AI clips here humanise the staff-cost insight without showing identifiable faces.

**Clip 6A — Staff at work, anonymous**
> A slow tracking shot following two hospital staff members walking away from camera down a corridor, both in scrubs, only their backs visible. They walk in step. Soft natural light from windows on the right. Their figures are slightly out of focus to emphasise the institutional rather than individual nature of the moment. [STYLE SUFFIX]

**Clip 6B — Shift change suggestion**
> A static medium shot of a row of identical hospital staff lockers, three of them opening and closing very slowly in sequence over ten seconds, with no people visible. Off-white walls, brushed steel lockers, a clock on the wall in the deep background out of focus. Quiet, rhythmic, suggestive of three shifts of work. [STYLE SUFFIX]

---

### SCENE 7 — Outro (2:35–2:55) · 1 clip

> **Note:** The IEcare wordmark, contributor names, and university credit will all be iMovie title overlays. This is an empty backdrop frame.

**Clip 7A — Closing atmosphere**
> A very slow, almost imperceptible dolly-in on an off-white textured paper surface laid flat under soft warm light. The paper is blank but has a subtle grain. A small shadow on one edge suggests an object just out of frame. The camera barely moves. Quiet, contemplative, ten full seconds of stillness. [STYLE SUFFIX]

---

## Style suffix (paste at end of every prompt)

```
cinematic documentary style, muted colour palette of off-white, deep navy, and clinical teal, soft natural lighting, shallow depth of field, slow steady camera, 24fps film look, no on-screen text
```

## Negative prompt (paste into the negative prompt field for every clip)

```
text, captions, watermarks, logos, distorted hands, warped faces, fast camera movement, jump cuts, lens flare, oversaturation, cartoon style, anime, illustration, low quality, blurry, glitches, doctors in white coats stereotyped, generic stock footage look, dramatic lighting, bright colours
```

---

## Generation strategy & cost control

**Generate in this order:**
1. **One test clip first** (Clip 1A is a good candidate) at the cheapest tier to lock in the visual style. Inspect it for: palette match, camera speed, motion artefacts, depth of field.
2. **All scene-1 and scene-2 clips next** — these establish the look and are the most visually critical because they're the first thing the viewer sees.
3. **Generate two variants of every clip you intend to keep.** AI video has a ~30% failure rate even with good prompts — warped objects, weird motion, sudden zooms. Pre-budget for it.
4. **Save your seed numbers** when a clip works. If you need to regenerate a similar shot for visual consistency, reusing the seed plus a tweaked prompt usually gets you closer than starting fresh.

**Approximate budget** (at current FAL.AI pricing, Kling 2.6 Pro tier, ~$0.10/sec):
- 16 final clips × 10 sec × $0.10 = ~$16
- With a 2x failure-retry budget: **~$30–35 total**
- Veo 3.1 will run roughly $60–70 for the same coverage but produces more usable first takes.

---

## iMovie assembly notes

- **Overlay your text in iMovie's title layer**, never inside the AI clips. iMovie's "Lower" or "Centred Lower Third" templates work well for academic captions; for the equation, export it as a transparent PNG from KaTeX or LaTeXiT (free Mac app) and drag it onto the timeline as a cutaway.
- **Crossfade between AI clips** with a 0.5-second dissolve to hide any temporal inconsistency. Cuts can feel jarring when AI clips have different lighting.
- **Match audio first, video second.** Lay down the voiceover and music, mark the beats where each scene needs to land, and *then* drop video underneath. This is the opposite of the order most people try, and it's why most AI-assembled videos feel loose.
- **Colour-grade everything to match** using iMovie's "Adjust → Color Balance" panel. Pull all clips toward the same off-white/navy/teal palette so they read as one piece rather than a mosaic of generations.
- **Export at 1080p, H.264, "High" quality.** For an academic submission this is more than enough; 4K is overkill and slows playback on grading platforms.
```
