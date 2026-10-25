# Changelog

## 2026-10-25

### Documentation

Aligned the clock in the Game Design Document, Game Parameters, and CONTEXT with `play/src/engine.js`. The docs had a 45-second month and a 45-second on-time window. The engine's month is 240 seconds, four weeks of 60 seconds. On time is 300 seconds for the first Project and until an Intern is hired, 180 seconds after a hire with no Permanent, and 120 seconds while a Permanent is employed.

The arrival gap was `20 - min(acceptedShips, 12)` seconds, from 20 seconds down to 8 seconds. The engine waits 60 seconds until 3 ships have been accepted, then `45 - (acceptedShips - 3)` seconds, and never faster than 30 seconds. CONTEXT had the same 45-second month, 45-second on-time window, and 20-to-8-second gap, so those sentences were updated too.

Win rules and fees were left as written.

### Tooling

Added `play/scripts/check-params.mjs`. It reads the month, week, deadline, arrival, and attempt values from `play/src/engine.js` and exits non-zero if the Game Design Document, Game Parameters, or CONTEXT still describe the old clock. That keeps the doc fix from drifting the next time the engine constants change.

Added `play/scripts/simulate.mjs` so a hands-off win, a run that never buys the process steps, and a late firing can be checked without playing. The policy buys the three process steps when that is what gets a month shipped with no hand touch, and it does not change prices. The steps are $24 each, $72 in total. Seeds 1 through 11 each reach a first win in month 2. The same policy without those steps wins none of the 11 by month 36. Firing the Intern about one second before month end pays $9.96 against $10 for keeping them, which is that last second of the wage. The sim leaves `WIN_HAND_TOUCH` at `"strict"` and `gameFlags.specialtyMix` off.

### Payroll wording

The docs said payroll is due only for staff still employed, and that an Intern or Permanent fired before the end is not on that bill. The engine bills `pay × time employed / month length`, so a firing still owes the fraction of the month already worked, and a person kept for the whole month owes the full wage. The Game Design Document, Game Parameters, and CONTEXT now say that. Wages stay $10 and $30. The win is still a qualified month, a big client, no hand touch, and payroll paid.

The docs also said an Intern attempt takes 8 seconds and a Permanent attempt takes 4 seconds. Both roles use `stepSeconds`: 1.4 seconds, minus 0.12 seconds for each counted system, and never under 0.4 seconds. Those sentences now say that, and `check-params.mjs` reads the formula from the engine.

### First ten minutes

After the studio is named, one card tells the player to click what pulses, then gets out of the way.

The first client pulses the next click. The week bars stay hidden until three ships, and the month line says a month is four one-minute weeks, then payroll. Ship greys out when the press will not pay, and the HUD shows payroll due and the next hire before a hire.

A greyed Ship says it is held. The fee shows only once the press can complete the ship.

Before the week bars appear, the HUD says the month is already running, as four one-minute weeks. The clock still moves.

A covered contrast step includes Background, so a Permanent can finish the lead frame. A batch that skipped Background never wrote the lead, and the client sat unfinished.

A Permanent can take the open client that has not started. Skipping that client left staff blocked on the only one.

The month-end pause shows each person's name and amount. Joining the staff records had printed `[object Object]`.

Ship records whether the press would do nothing, so the button can look disabled.

Buying a process step re-applies it to projects already waiting. New projects already received the step, and queued ones had stayed on the old frames.

The short fee is the small auto fee for every client. Its big-client branch could not run, so that branch is gone.

Payroll is pro-rated by time employed. A lump sum had dropped the whole wage of anyone fired before the pause.

The win reads one hand-touch constant, `WIN_HAND_TOUCH`. The default stays `"strict"`: any recorded hand touch blocks the win, and a Ship press counts.

A specialty mix can hold arrivals to one industry, so a specialist and a generalist can win in different months. `gameFlags.specialtyMix` defaults to off, which keeps the current mix.

The first three clients of a fresh game gate Ship with one, two, and three colour lines so the opening is learnable. Client 1 is one screen and one Title colour. Client 2 asks for Title and Card A. Client 3 asks for Title, Card A, and Save. Client 4 keeps the old generator. This is the opening, not a balance change. After it, `node play/scripts/win-month-choice.mjs` reports a specialist median of month 2 and a generalist median of month 2, a gap of 0. The specialty flag stays off.

All grades hid empty Radius and Contrast headings on those colour-only clients. The queue chip named the first screen for each person, so it stayed on the lead after a later screen was the one holding Ship. A finished edit waited for the next clock tick before Ship could pay, so the button read "Ship held" for a moment after the last line was fixed. The chip now names the screens that still block Ship, and the edit updates the Ship offer immediately.
