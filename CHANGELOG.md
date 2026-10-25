# Changelog

## 2026-10-25 — round 6 batch 2

A reload paints the restored studio. The screen listens before the game starts, and a second start paints again, so the name gate does not cover a save that loaded. A save with no studio name is a new game and does not say the save failed. A save is not written until the studio has a name, so an unnamed tab cannot wipe a run.

A second tab sees "This game is open in another tab" and does not write the save. An empty queue says "Start your first client". The week and month clocks, and the hire price, stay put until the first Start. A teaching card still pauses only the client clock. One card shows at a time, and a queued note waits until the month-end card closes.

The clock tick no longer refreshes payroll or writes the save. The save stays on events, on a one-second throttle, and when the page hides. Money restored from a save is rounded to cents.

## 2026-10-25 — round 6 batch 1

Blank text uses Ink on Hot and Lime fills, so contrast is at least 3 before the player touches a screen. Fixing only the brief's colour lines can ship clients 1 to 3. A contrast hold names the part and the ratio, for example "Card A contrast 1.0, under 3".

Payroll cuts an intern only when that intern's pay covers the whole gap and the gap is above $2.50, one week of intern pay. The permanent is not fired for a shortfall. A gap up to $2.50 is Late and keeps everyone. A larger gap that an intern cannot cover stays Late too, with a warning before the month ends and a line that says to ship the next screen. The paid line lists amounts that add up to the paid total.

A disabled Ship names the reason. There is no bare "Ship" label. A short ship of a big client pays $3 before Stage 3, less than the $6 for turning it down. Stage 3 stays $10. A Ship press still does not count as a hand touch. Counting one on a screen you had changed dropped a generalist win, so that press stays free. Rex's lit-Ship harness is not on this machine.

Bare minimum radius is 8–24, so stop 8 is not Wrong. The hold names the target. Stop 8 stays on the slider.

An older save shows "Old save from an earlier version was discarded." The old save is kept under `sell-the-system-discarded` for that browser session.

Simpler choices: the big-client short ship pays $3 before Stage 3, rather than a new hold. The permanent is never fired for a shortfall. The Late cap is $2.50, and a larger gap stays on the books with a recovery line.

## 2026-10-25 — round 5 prototype

Ship, the To Ship list, and the fee read `shipCheck` for the open client. The Ship button sets `data-ship-held` and `data-ship-reason`. A held Ship press, selecting a client, opening it, and Start do not count as hand touches. A value that does not change does not count either.

A full ship pays $10, or $16 in Stage 3. A short ship pays $6, or $10. A big client pays $36, or $48, and the card shows that amount. Turning the big client down frees the intern. Hire stops at one intern, does not reroll the miss rate, and stays disabled when it cannot be paid. A payroll gap of $1 or less is Late: nobody is fired, and the debt comes out of the next fee. An intern is cut only when that pay covers a larger gap. The permanent stays.

The week clock and the month clock wait until the first Start. A teaching card pauses the client clock. Esc closes the cards, Fire asks first, and the specialist choice can be undone. Saves write on events and at most once a second, with saveVersion 5. A save from another version is discarded and the studio gate says so.

The live host is https://sell-the-system.vercel.app/ and it auto-deploys from main. This build is the round 5 preview, not main.

## 2026-10-25 — fix list v4

Ship, the To Ship list, and the fee use one check. When Ship is held, the button names the screen and the property, and the list does not say Clear. A wrong radius or contrast on a judged line holds Ship. The radius target is shown, a typed value in range is graded before the Radius variable is bought, Background no longer starts at 0, and Editorial's industry radius of 0 is not Wrong. The radius stops include 8.

The opening is one card. Esc closes a note and the colour picker. Notes do not freeze the clock. The month bars are visible from month 1, and the round clock is described as the client's 5:00. Hire says why it is locked, the price is the rest of the month, and a second intern is refused until the first is promoted. Stage 3 says what is left. The run saves in the browser and pauses while the tab is hidden.

Payroll drops interns first only when their pay covers the shortfall. Hiring does not reset the next client. Select, an element click, and Start record a hand touch, matching the win rule. A full ship pays $6 and a short ship pays $3. Stage 3 raises those to $10 and $6. A ship does not pay $12.

After three ships and a hire, the player chooses specialist or generalist. The first big client can be taken or turned down. A won month can be sold, and one owned perk comes into the next run.

## 2026-10-25

### Documentation

Aligned the clock in the Game Design Document, Game Parameters, and CONTEXT with `play/src/engine.js`. The docs had a 45-second month and a 45-second on-time window. The engine's month is 240 seconds, four weeks of 60 seconds. On time is 300 seconds for the first Project and until an Intern is hired, 180 seconds after a hire with no Permanent, and 120 seconds while a Permanent is employed.

The arrival gap was `20 - min(acceptedShips, 12)` seconds, from 20 seconds down to 8 seconds. The engine waits 60 seconds until 3 ships have been accepted, then `45 - (acceptedShips - 3)` seconds, and never faster than 30 seconds. CONTEXT had the same 45-second month, 45-second on-time window, and 20-to-8-second gap, so those sentences were updated too.

Win rules and fees were left as written.

### Tooling

Added `play/scripts/check-params.mjs`. It reads the month, week, deadline, arrival, and attempt values from `play/src/engine.js` and exits non-zero if the Game Design Document, Game Parameters, or CONTEXT still describe the old clock. That keeps the doc fix from drifting the next time the engine constants change.

Added `play/scripts/simulate.mjs` so a hands-off win, a run that never buys the process steps, and a late firing can be checked without playing. The policy buys the three process steps when that is what gets a month shipped with no hand touch, and it does not change prices. The steps are $24 each, $72 in total. An earlier run of seeds 1 through 11 reported a first win in month 2. That figure is historical. Unchanged on this branch; remeasure after integration. The same policy without those steps had won none of the 11 by month 36 in that earlier run. Firing the Intern about one second before month end pays $9.96 against $10 for keeping them, which is that last second of the wage. The sim leaves `WIN_HAND_TOUCH` at `"strict"` and `gameFlags.specialtyMix` off.

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

The first three clients of a fresh game gate Ship with one, two, and three colour lines so the opening is learnable. Client 1 is one screen and one Title colour. Client 2 asks for Title and Card A. Client 3 asks for Title, Card A, and Save. Client 4 keeps the old generator. This is the opening, not a balance change. An earlier `node play/scripts/win-month-choice.mjs` reported a specialist median of month 2 and a generalist median of month 2, a gap of 0. That month-2, gap-0 line is historical. Unchanged on this branch; remeasure after integration. The specialty flag stays off.

All grades hid empty Radius and Contrast headings on those colour-only clients. The queue chip named the first screen for each person, so it stayed on the lead after a later screen was the one holding Ship. A finished edit waited for the next clock tick before Ship could pay, so the button read "Ship held" for a moment after the last line was fixed. The chip now names the screens that still block Ship, and the edit updates the Ship offer immediately.

The source stays private. Hosting is Vercel, at https://sell-the-system.vercel.app/, and it auto-deploys from main. `vercel.json` builds `play/` from the repo root. GitHub Pages is not used.
