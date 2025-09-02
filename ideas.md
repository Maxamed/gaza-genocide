This is powerful material. Let’s turn it into a **Press Memorial** that’s consistent with your data-first, white-background, bilingual design — and reuse the same **rules/benchmark** pattern you’re using elsewhere.

---

# 🎯 Goal

A solemn, searchable wall for **journalists and media workers killed**, with:

* bilingual names,
* clear roles/outlets,
* respectful, auto-generated **context chips** from the long “notes,”
* filters (role, outlet, circumstance),
* and no images.

---

# 1) Data model (normalize once, render everywhere)

Create a tiny normalizer that turns each raw record into a strict shape:

```ts
// /js/types/press.ts (TS optional; JS JSDoc works too)
export type PressPerson = {
  id: string;              // slug from Arabic+EN name
  name_ar: string;         // "سلام ميمة"
  name_en: string;         // "Salam Mema"
  role: string | null;     // "journalist" | "photojournalist" | "editor" | "presenter" | "media worker" | null
  outlet: string[];        // ["Palestine TV", "Press House-Palestine"]
  organization: string[];  // umbrella orgs (IFJ, Syndicate) if found
  location: string | null; // "Jabalia", "Khan Yunis", "Gaza City", etc.
  date: string | null;     // ISO if you have it; else null
  circumstance: string | null; // "airstrike_on_home", "killed_while_covering", etc.
  family_killed_count: number | null; // 11, 42, 25... if extractable
  notes: string;           // original notes (untouched)
  sources: string[];       // urls in notes if present (optional)
};
```

**Normalizer responsibilities** (pure functions, <200 lines total):

* `makeId(name_ar, name_en)`
* `extractRole(notes)` → “journalist” / “photojournalist” / “media worker” / “editor” / “presenter”
* `extractOutlets(notes)` → array (Palestine TV, Al Jazeera, Al-Quds TV, …)
* `extractLocation(notes)` → “Jabalia”, “Rafah”, …
* `extractCircumstance(notes)` → enum (airstrike\_on\_home / airstrike\_in\_car / killed\_while\_covering / drone\_strike / siege\_hospital / with\_family / unknown)
* `extractFamilyCount(notes)` → number if “with X family members”
* `extractDate(notes)` (if dates appear; otherwise you’ll merge this later from the press dataset if it has explicit `date`)

Store normalized array to `/data/press_normalized.json` at build-time or on first load + cache.

---

# 2) Context rules (like your memorial rules)

Create `/data/press_rules.json`. Each rule declares how to turn fields into **short context chips**.

```json
[
  {
    "id": "role_outlet",
    "requires": ["role", "outlet"],
    "context": {
      "en": "{{role_en}} at {{outlet_en}}",
      "ar": "{{role_ar}} في {{outlet_ar}}"
    }
  },
  {
    "id": "circumstance_covering",
    "when": { "circumstance": "killed_while_covering" },
    "context": {
      "en": "Killed while covering the aftermath of strikes.",
      "ar": "قُتل أثناء تغطية آثار القصف."
    }
  },
  {
    "id": "circumstance_home",
    "when": { "circumstance": "airstrike_on_home" },
    "context": {
      "en": "Killed in an airstrike on the family home.",
      "ar": "قُتل في قصف على منزل الأسرة."
    }
  },
  {
    "id": "with_family",
    "requires": ["family_killed_count"],
    "context": {
      "en": "Family killed with them: {{family_killed_count}}.",
      "ar": "قُتل معهم من الأسرة: {{family_killed_count}}."
    }
  },
  {
    "id": "location_tag",
    "requires": ["location"],
    "context": {
      "en": "Location: {{location}}.",
      "ar": "الموقع: {{location}}."
    }
  }
]
```

> Keep each chip **short**, solemn, and factual. Avoid adjectives beyond what’s necessary.

---

# 3) Rendering (white, typographic, fast)

**Card layout (list or grid with 2 columns on desktop):**

* **Name (AR)** — Amiri, 18px, bold
* **Name (EN)** — Playfair/EB Garamond, 15px
* **Context chips** — small neutral pills (Inter/Noto Sans Arabic, 12–13px)
* **Notes** — collapsed (2–3 lines, ellipsis); “Read more” expands
* **Sources** — if you add URLs later, show tiny external-link icon (SVG)

Example card (English + Arabic stacked, white background, hairline dividers):

```
سلام ميمة   ·  Salam Mema
[ Journalist · Palestine Media Assembly ] [ Location: Jabalia ]
Killed in an airstrike on the family home.
Her body was recovered three days after the strike…  [Read more]
```

---

# 4) Filters & search (Alpine/vanilla)

* Chips: **Role**, **Outlet**, **Circumstance**, **Location** (autocomplete)
* Search across `name_ar`, `name_en`, and `notes` (diacritics-insensitive for Arabic)
* Sorting: **Default = A→Z (Arabic)**; options: by outlet, by circumstance

**Circumstance enums** you can support out of the box:

* `airstrike_on_home`
* `airstrike_in_car`
* `killed_while_covering`
* `siege_hospital`
* `drone_strike`
* `unknown`

---

# 5) Example: normalization of one record

Input (your sample, abbreviated):

```json
{
  "name": "سلام ميمة",
  "name_en": "Salam Mema",
  "notes": "The death of Mema, a freelance journalist ... head of the Women Journalists Committee ... body was recovered from the rubble three days after her home in the Jabalia refugee camp ... hit by an Israeli airstrike ..."
}
```

Output:

```json
{
  "id": "salam-mema",
  "name_ar": "سلام ميمة",
  "name_en": "Salam Mema",
  "role": "journalist",
  "outlet": ["Palestinian Media Assembly"],
  "organization": ["Women Journalists Committee"],
  "location": "Jabalia",
  "date": null,
  "circumstance": "airstrike_on_home",
  "family_killed_count": null,
  "notes": "The death of Mema, a freelance journalist ...",
  "sources": []
}
```

Generated context chips (from `press_rules.json`):

* “Journalist at Palestinian Media Assembly” · “Location: Jabalia” · “Killed in an airstrike on the family home.”

---

# 6) Components (keep under 300 lines each)

```
/js/api/press.js
  - normalizePress(raw) -> PressPerson
  - loadPress() -> PressPerson[] (with caching)

/js/logic/pressContext.js
  - applyPressRules(person, rules) -> string[] // small chips (en/ar pair)

 /js/components/pressCard.js
  - renderPressCard(person, chips) -> HTMLElement

/js/components/pressFilters.js
  - render + emits {role, outlet, circumstance, location}
```

---

# 7) Respectful tone polish (Arabic)

Use **neutral, solemn** Arabic across chips:

* Journalist → **صحفي/ـة** (use neutral noun “صحفي/ـة” if you want inclusive, or just “صحفي” as generic role label)
* Photojournalist → **مصوّر صحفي**
* Media worker → **عامل في المجال الإعلامي**
* Killed while covering → **قُتل أثناء التغطية**
* Airstrike on home → **قُتل في قصفٍ على المنزل**
* Location → **الموقع**
* Family killed → **قُتل من الأسرة: {{n}}**

If you want strictly neutral chips without gender marks, prefer profession nouns without suffixes (e.g., **صحافة** as sector tag + “مراسل”/“مراسلة” only when dataset provides gender).

---

# 8) Optional: “Press Roll” mode

A separate page (or toggle) that **scrolls the names like film credits**, sorted by date (if/when you have it).

* Header counter: “Journalists and media workers killed: **N**”
* A slow, continuous vertical roll; hover pauses; spacebar toggle pause/play.
* Chips are hidden in roll mode; focus is on names + outlets only.

---

# 9) Quality & safety guardrails

* **No inference** beyond what’s in text (don’t guess dates, roles, or outlets).
* If multiple outlets appear, show up to **2** and add “+ more”.
* If notes include graphic detail, keep snippets minimal; **never** sensationalize.
* Unknowns are fine: show “—” or skip the chip.
* Provide a **methodology** link: “Circumstances and roles are parsed from public notes; errors? Contact us.”

---

# 10) Tiny regex helpers (pseudo)

```js
const ROLE_PATTERNS = [
  [/photo ?journalist|cameraperson|camera operator/i, "photojournalist"],
  [/presenter|anchor|broadcaster/i, "presenter"],
  [/editor/i, "editor"],
  [/journalist|reporter/i, "journalist"],
  [/media worker|media professional/i, "media worker"]
];

const CIRCUM_PATTERNS = [
  [/airstrike (on|at) (his|her|the) home|strike on (his|her|the) home/i, "airstrike_on_home"],
  [/drone strike/i, "drone_strike"],
  [/killed while covering|while covering/i, "killed_while_covering"],
  [/siege of .*hospital|storming .*hospital/i, "siege_hospital"],
  [/airstrike|strike/i, "airstrike_other"]
];

const FAMILY_COUNT = /with (\d{1,3}) (?:members of (?:his|her) family|family members)/i;
```

Keep them in `/js/logic/extractors.js`. Start simple, expand as you see recurring phrases.

---

## TL;DR plan

* Normalize → **PressPerson** shape
* Generate **short, factual chips** via `press_rules.json`
* Render **clean cards** on a **white page** with bilingual names
* Filters + search, no images
* Optional rolling “Press Roll” page

If you want, I can package:

* `press_rules.json` (like above),
* `extractors.js` (regex helpers),
* `pressCard.js` (render),
* and a tiny `press.html` skeleton
  so you can paste into Cursor and be running in minutes.
