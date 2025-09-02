1. The “Living Counter”

Numbers aren’t static. They tick upward while you’re on the page.

Instead of “60,199 killed”, it animates like a metronome of loss.

Even if estimates aren’t live per second, the effect drives home “this is ongoing.”

🔹 2. Relatability Engine as a Narrative

Not just random fact cards → but progressive storytelling.

Example flow:

“Yesterday: 412 killed = 8 school buses of children.”

“Cumulatively: More than 20× 9/11.”

“Generationally: 1 in 3 were children.”

Feels like a guided memorial, not a dashboard.

🔹 3. Daily Diary Mode

A page where you scroll through each day of the war like a calendar of grief:

“Day 127 — 302 killed, including 112 children.”

Each day annotated with relatability facts.

Feels like turning the pages of history.

🔹 4. The Namescape

Instead of a flat list of names → imagine an infinite grid or stream of names, drifting upward like a tide.

Filter: children, women, journalists.

User can hover → card expands with age, context.

Think: digital “Vietnam Memorial Wall.”

🔹 5. Global Mirror

Benchmarks aren’t just global tragedies — also local mirrors:

For a user in London → “This equals the entire O2 Arena.”

For a user in Doha → “This equals Education City Stadium.”

Could auto-detect visitor’s country and rotate benchmarks relevant to them.

🔹 6. Generational Visualization

Instead of just pie charts:

Rows of child silhouettes → each = 10 children killed.

Fades in as you scroll.

Subtle, symbolic, non-graphic.

🔹 7. Bilingual Poetry Layer

Pair numbers with a line of poetry (Arabic + English).

E.g., after a counter: “Every number is a face, every name a story.”

Could use lines from Mahmoud Darwish or other public-domain Palestinian poets.

Adds literary gravitas → makes the site feel like an art installation.

🔹 8. Social Memory Engine

Each fact card → one-click “share as card” to Twitter/Instagram.

Generates a clean white image with the fact + logo.

Turns the site into a fact amplifier.

🔹 9. Future-Facing Tracker

A module that doesn’t just say what happened → but projects:

“If deaths continue at the current rate, by Day 500 there will be X.”

Solemn, but it shows scale beyond the present.

🔹 10. Silent Mode

The site loads in silence.

A small toggle → plays whispered names (synthesized voice reading memorial list).

Emotional, optional, deeply powerful.


------

a calendar-style lens on the data:

“On this day (13th)” → aggregate every 13th across all months/years.

“This week” → aggregate by a weekly lens without caring about the month.

Here’s a clean way to build both (JS-only, fast, no new APIs).

How to do “On this day (13th)”
What it shows

Total killed on all 13ths since Oct 7, 2023

Average / median per 13th

Deadliest 13th (date + value)

Last 13th (date + value)

Optional: children share on 13ths (avg / last / worst)

Algorithm (JS)

Load casualties-daily JSON.

For each report_date, parse the day of month: d = new Date(report_date).getDate().

Keep rows where d === targetDay (e.g., 13).

From those rows, compute:

sum, average, median of killed

max (and keep its date)

last occurrence (max date ≤ today)

if available: use killed_children (or derive from killed_children_cum diff).

Minimal pseudo-code
function lensByDayOfMonth(rows, day=13) {
  const sameDay = rows.filter(r => new Date(r.report_date).getDate() === day);
  const vals = sameDay.map(r => r.killed).filter(Number.isFinite);
  vals.sort((a,b)=>a-b);
  const sum = vals.reduce((a,b)=>a+b, 0);
  const avg = sum / vals.length;
  const median = vals.length % 2 ? vals[(vals.length-1)/2]
                                 : (vals[vals.length/2-1] + vals[vals.length/2]) / 2;
  const maxRow = sameDay.reduce((best, r) => r.killed > (best?.killed ?? -1) ? r : best, null);
  const lastRow = sameDay.reduce((best, r) => new Date(r.report_date) > new Date(best?.report_date ?? 0) ? r : best, null);
  return { count: vals.length, sum, avg, median, max: maxRow, last: lastRow };
}

UI ideas

Headline: “On every 13th: avg X killed · worst Y on DATE”

Mini-timeline: only the points that are 13ths (dots), with hover tooltips.

Fact card: “All 13ths combined = Z → equals N school buses” (use your relatability engine).

How to do “This week” (no months)

You can mean two useful things. Pick one (or support both):

A) Weekday lens (all Mondays, all Tuesdays, …)

Answers: “What does a Thursday look like on average?”

Good for: spotting weekday patterns (aid days, ceasefires, etc.)

Algorithm

For each row, compute weekday = new Date(report_date).getDay() (0=Sun…6=Sat).

Group by weekday; compute avg/median/max the same way.

UI

A 7-bar strip (Sun→Sat) with average killed per weekday.

Tap a bar → shows “all Thursdays” sparkline (only Thursday points).

B) War-week lens (week 1, week 2, … from Oct 7, 2023)

Answers: “In Week 38 of the war, what happened (on average across years)?”

Good for: “seasonality” across long conflicts.

Algorithm

Define warStart = 2023-10-07.

For each row, weekIndex = Math.floor((date - warStart) / (1000*60*60*24*7)) + 1.

Group by weekIndex (1..N). Compute totals/averages.

UI

A compact sparkline of weeks with peaks annotated.

Card: “This week of the war (W = N) averaged X killed; worst Y on DATE”.

Children-only and other variants

For any lens above, you can run the same math on:

Children (if you have daily killed_children, or compute from cumulative daily diff)

Women (killed_women / diff)

Press / Medical / Aid-seeking deaths if daily fields exist

Presentation: toggle chips — All · Children · Women · Press.

Tie-in with the Relatability Engine

After you compute a number (sum/avg/max for the lens), pass it to the benchmark:

On this 13th (last occurrence): fact = mapToBenchmark(lastRow.killed)

All 13ths combined: mapToBenchmark(sum)

Average 13th: mapToBenchmark(avg) → round nicely, pick best-fit benchmark

Example card:

“Across all 13ths since Oct 2023, Z people were killed — that’s N school buses.”

Performance & UX notes (GitHub Pages friendly)

One fetch of casualties-daily.json → cache in memory (and in localStorage with lastUpdated).

All lenses are pure array ops (fast).

Keep each module <300 lines:

/logic/lenses.js → lensByDayOfMonth, lensByWeekday, lensByWarWeek

/components/onThisDay.js → renders the 1-day lens section

/components/thisWeek.js → renders weekday/war-week

Arabic/English:

Format dates with Intl.DateTimeFormat respecting RTL.

Keep labels short; numbers heavy; no images needed.

Edge cases

If no data yet for a given day-of-month (e.g., 31st) → show a gentle “No data points yet.”

Timezone: compute dates in UTC to match dataset (avoid off-by-one).

Children fields missing daily? Use cumulative diffs:

children_today = max(0, killed_children_cum[t] - killed_children_cum[t-1]).