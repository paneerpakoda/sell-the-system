# Sell the System — Godot port game design document

This is the implementation spec for the Godot port. It describes the game that plays in `play/src/engine.js`, not the older notes in `Game Design Document.md`. Where those notes disagree with the simulation, this document follows the simulation.

A Run is one ascent of a design agency. The Designer fixes phone screens by hand, then hires one Intern to copy finished frames, then promotes that Intern to a Permanent who starts clients. Tokens, tools, and industry languages make the staff faster and stop them missing. Stage 3 adds UX on top of the UI and raises the full fee. Money is the only score. The win is one quiet month after Stage 3 is already on.

## 1. Fantasy

You are the Designer. You do not pick a stage, an industry, or a roster. Clients arrive. Each one is a phone screen made of the same five parts. You set colour, corner radius, and text colour until the screen is good enough to ship. Later, someone else does the frames you would repeat, because you bought the judgment: a component, a radius variable, a colour style, a base token, or a whole industry language.

The player who designs should recognise the work. The player who does not should still be able to climb. There is no second currency, no mood, no pitch minigame, and no freeform layout tool.

## 2. The run in one page

| Stage | When it is on | What the Designer does |
| --- | --- | --- |
| 1 | From the first client until the first hire | Fix screens by hand and press Ship |
| 2 | After an Intern has ever been hired, until Stage 3 | Hire, buy tools and tokens, ship a big client, codify that industry, promote the Intern |
| 3 | A Permanent is employed and at least one language is codified | New arrivals also judge Hierarchy, Copy, and Flow. Full fees are higher. The design process can pre-solve the UX |

Stage is derived, never chosen:

- Stage 3 if a Permanent is on the team and any language is codified.
- Else Stage 2 if an Intern has ever been hired, even if they were later fired.
- Else Stage 1.

UX is stamped onto a project at the moment it arrives. A project that arrived before Stage 3 never grows UX. Fees are read at the moment of the ship, so a project that arrived in Stage 2 pays the Stage 3 fee if Stage 3 is on when it ships.

## 3. Words

Use these names in the Godot UI and in code comments. Do not rename them in the port.

| Word | Meaning |
| --- | --- |
| Designer | The player |
| Run | One ascent. Selling the agency starts another run and keeps one perk |
| Project | One client. It has an industry, a size, a standard, a temper, and one or more frames |
| Screen / frame | One phone inside a project. A small client has two. A big client has three. The first three clients are special, below |
| Lead | The first frame. A Permanent designs this. The Intern copies it onto the others |
| Industry | Fintech, Wellness, or Editorial. Every project has one. The Designer does not pick it, except by becoming a Specialist |
| Language | The strict recipe for one industry: Swiss Grid, Warm Soft, or Mono Stark |
| Exacting | Pays the full fee only when the whole frame is Best practice |
| Loose | Pays the full fee when every named line is at least Bare minimum |
| Sound | An on-time Fit can set the next Intern's miss rate to 20% |
| Sour | A Fit does not change the miss rate |
| Fit | The whole frame is Best practice, and Stage 3 type and flow pass |
| Hand ship | The Designer presses Ship |
| Auto-ship | The staff finish every frame and the project ships itself |
| Hands-free | An auto-ship. This is what lifts the big-client cap |
| Accepted ship | A hand ship that paid, or an auto-ship. Reputation is this count. It only speeds arrivals |
| Hand touch | A real change to a colour, radius, ink, copy, hierarchy, or flow value during the current month. This is what blocks the win |
| Coverage | A bought system that makes staff treat that property as safe. Staff miss only an unsafe property |
| Late | The client's own clock hit zero, or payroll could not be fully paid. These are different Lates. The UI must say which |

## 4. Simulation

One clock advances the world. Cap each frame at 0.25 seconds so a hitch does not skip a month.

The world is paused, and nothing below moves, while any of these is true:

- The studio has no name yet.
- The month-end break is open.
- The window is unfocused. The browser build pauses when the tab is hidden. Match that.

While the world runs:

1. Permanents act, then Interns.
2. A new project may arrive.
3. If the clocks have been released, the month counts down. At zero, payroll settles and the month-end break opens.
4. Each started project's on-time clock counts down, unless a teaching card is open. Teaching pauses only that clock. The month keeps running.

The month clock and the week clock stay held until the first Start. A Start is the Designer pressing Start, or a Permanent starting a client. Selling the agency holds them again until the next Start. `clocksLive` is the flag.

An edit, a hire, a purchase, a ship, and a decision apply immediately. They do not wait for the next tick.

Money is in dollars, stored as cents. Round to the nearest cent on every credit and debit. The cash balance never goes below $0. A shortfall that the rules allow becomes debt, not negative cash. Any credit pays debt first, then adds to cash.

## 5. Starting state

| Field | Value |
| --- | --- |
| Cash | $24 |
| Debt | $0 |
| Month | 1, with 240 seconds left, clocks held |
| Accepted ships | 0 |
| Hand ships | 0 |
| Staff | None |
| Tokens, tools, languages, process | None |
| Queue | One project, spawned at start |
| Next arrival | 60 seconds, and it cannot arrive while the queue is full |

The first thing on screen is a gate: name the studio, 28 characters after trimming and collapsing whitespace. The world stays paused until the name is set. The name survives selling the agency.

## 6. Three clocks

These clocks are easy to confuse. The HUD names them separately.

**Client clock.** How long this project has to be a Sound on-time Fit. It starts when that project is started, at:

| Situation | Length |
| --- | --- |
| The first project, and every project until an Intern has ever been hired | 300 seconds (shown as 5:00) |
| After a hire, while no Permanent is employed | 180 seconds |
| While a Permanent is employed | 120 seconds |

The length is chosen when the project is created, from the studio at that moment. It does not shrink if you hire later. At zero the project stays, Ship still pays by the normal fee rule, and the on-time reward is closed. The queue shows the remaining time, then the word Late.

**Week clock.** A month is four weeks of 60 seconds. The HUD shows week 1 through week 4 and the time left in the current week. It waits with the month until the first Start.

**Month clock.** 240 seconds, then payroll. It is not a count of ships. It waits until the first Start. Opening a reference, a decision, or the editor does not pause it. Only the pause rules in section 4 do.

## 7. A project

Every project has:

| Field | Roll |
| --- | --- |
| Client name | Northwind, Lumen, Harbor, Kindred, Folio, Aster, Brass, Sable, Marlow, Pebble, Vesper, Quill, Hearth, Ledger, Nimbus, then the same names with a lap number: Northwind 2, and so on |
| Industry | Uniform among Fintech, Wellness, Editorial, unless the Designer is a Specialist |
| Size | Small, or big. See arrivals |
| Standard | Exacting or Loose. Before any token is unlocked, 1 in 4 are Exacting. After tokens are unlocked, 1 in 2. Tokens unlock once an Intern has ever been hired and accepted ships are at least 3 |
| Temper | Sound or Sour, 1 in 2, and this rate never changes |
| UX | Yes if Stage 3 was active when it arrived |

A project is unstarted until someone starts it. The Designer starts it with Start, which claims it. A Permanent starts an unclaimed project by walking up to it. An Intern never starts one.

Claiming pulls every unfinished frame back to the Designer and clears the staff off that project. Opening a frame without editing does not claim it. Selecting a part on a frame the staff own does not claim it. Editing is only possible on a frame the Designer owns, on a project the Designer has started, and not while watching staff work a project they still own.

### Frames

A normal small project has the first two product frames of its industry. A big project has all three. The first client of the run has one frame. The lead frame is frame one. Its element data is the project's element data. Later frames clone that data, then get their own copy.

| Industry | Frame | Title | Card A | Card B | Save |
| --- | --- | --- | --- | --- | --- |
| Fintech | Balance | Balance | Spending | Savings | Transfer |
| Fintech | Transfer | Transfer | From | To | Send |
| Fintech | Account | Account | Card | Limits | Confirm |
| Wellness | Today | Today | Sleep | Move | Check in |
| Wellness | Session | Session | Breath | Stretch | Start |
| Wellness | Profile | Profile | Goal | Streak | Log |
| Editorial | Issue | Issue | Essay | Review | Read |
| Editorial | Story | Story | Lede | Body | Continue |
| Editorial | Archive | Archive | Saved | Authors | Open |

Card labels are always that frame's card copy. Title and Save use the frame's words, unless the copy is the broken Stage 3 pair "Stuff" and "Submit", which is kept until something fixes it.

### What a new screen looks like

Every element starts broken, on purpose, so the brief still fails.

| Element | Fill | Radius | Text ink | Hierarchy |
| --- | --- | --- | --- | --- |
| Background | Hot | 24 | none | Body |
| Title | Lime | 0 | Ink | Primary |
| Card A | Lime | 0 | Ink | Body |
| Card B | Hot | 32 | Ink | Body |
| Save | Hot | 0 | White | Primary |

If the project has UX, that broken look is then overwritten: Title and Save become Small, both cards become Primary and Small respectively, Title says Stuff, Save says Submit, and either Empty or Error arrives broken and is the state on screen. A bought process step then repairs its own line on every frame. See section 17.

Staff do not start from this broken look as their target. They walk toward a passing look. The Designer does start from it.

### Requirements

A normal project builds a requirement for every visual property:

- Colour and radius on Background, Title, Card A, Card B, and Save.
- Contrast on Title, Card A, Card B, and Save. Background has no contrast row.

A small brief names 3 of those lines, chosen at random. A big brief names every one of them. The mode is vague for a small client and strict for a big client. The mode matters for the language pass inside `passes`, and for the words on the row. The fee itself uses the grade bands in section 9, not the industry's contrast number.

Stage 3 adds named UX lines: Hierarchy on Title, Save, Card A, and Card B; Copy on Title and Save; Flow on the screen.

Choosing a row selects that element. It does not write a value.

The first three projects ignore this generator. See section 13.

## 8. The phone

Five parts, in every industry, on every frame.

| Part | What the Designer sets | What is judged |
| --- | --- | --- |
| Background | Fill, corner radius | Colour and radius. Not hierarchy |
| Title | Fill, radius, text ink, and in Stage 3 hierarchy and copy | Colour, radius, contrast of the title text against the Background, and the UX lines |
| Card A and Card B | Fill, radius, text ink, and in Stage 3 hierarchy. Card copy is the product label | Colour, radius, contrast of the label against that card |
| Save | Fill, radius, text ink, and in Stage 3 hierarchy and copy | Colour, radius, contrast of the label against Save |

Contrast compares painted text with the surface behind it.

- Title text is compared with the Background fill.
- A card label is compared with that card's fill.
- Save's label is compared with Save's fill.
- Card fill against the Background is not a contrast grade.

Text ink is a swatch. If ink is unset, use automatic ink: near-white `#FFFFFF` on a dark fill, near-black `#161616` on a light fill. Light means the fill's simple luminance is above 0.62. The grade always uses the ink at full strength. The stored contrast number is a staff-step field. It is not what the grade reads. A contrast miss must fail the grade, so the miss sets the text ink equal to the fill. That pair is under 3 to 1.

The ratio is WCAG relative luminance, sRGB:

`ratio = (lighter + 0.05) / (darker + 0.05)`

Hierarchy sizes, if you show them: Small 15, Body 20, Primary 32.

Flow sits on the project, shared by every frame. The chip reads:

| Showing | Broken | Fixed |
| --- | --- | --- |
| Default | Default | Default |
| Empty | Empty | No notes yet |
| Error | Error | Couldn't save |

### Editor

The editor opens on a part the Designer owns.

| Control | Effect |
| --- | --- |
| Fill | One of the seven swatches |
| Radius | An integer from 0 to 32. A scrub moves 1 pixel of radius per 2 pixels of drag. Corner handles on the phone do the same. The radius variable, once bought, sets Title, both cards, and Save to one number and the Background to that number plus 4 |
| Text | A swatch for the ink. Shown on every part except Background. Background's contrast readout is the title's ratio |
| Hierarchy | Small, Body, Primary. Only if this part has a hierarchy line |
| Copy | The frame's real words, plus Stuff and Submit. Only on Title and Save when those lines exist |
| Flow | Shown only when the Background is selected on a UX project. Pick Default, Empty, or Error, then mark the demanded one Broken or Fixed |

Components, once bought, make an edit to either card apply to both cards.

A value change marks the project as edited by the player, marks the frame as touched, clears a Passed mark on that frame, and counts a hand touch. Setting the control back to the same value does not count. Take over does not count. Start, selecting a client, opening a frame, and pressing Ship do not count.

If the edit clears the part that was holding Ship, selection jumps to the next holding part.

While a frame is owned by staff, it is locked. Take over returns that frame to the Designer, stops that person on it, marks it held so the Intern will not pick it back up, and claims the project. The rest of a finished frame stays finished.

### Palette

| Name | Hex | Calm |
| --- | --- | --- |
| Paper | `#F4F1EA` | Yes |
| White | `#FFFFFF` | Yes |
| Ink | `#1C1917` | Yes |
| Sand | `#F5E6D3` | Yes |
| Stone | `#E7E5E4` | Yes |
| Hot | `#FF4D6D` | No |
| Lime | `#C8FF00` | No |

Calm is Paper, White, Ink, Sand, and Stone. Hot and Lime are wrong for colour.

## 9. Grades

Four grades, worst wins. The frame's grade is the lowest grade among colour, radius, and contrast on every part. Background has no contrast of its own; reading it returns the title's contrast grade.

| Grade | Colour | Radius | Contrast |
| --- | --- | --- | --- |
| Best practice | That part's industry colour | The industry pair: Title, both cards, and Save share the industry radius, and the Background is 4 larger. A single part whose radius is exactly its industry number is also Best on that part, including Editorial 0 and 4 | 7 to 1 or higher |
| Acceptable | None. Colour has no Acceptable step | The four components share some other radius, and the Background is exactly 4 larger | 4.5 to 1, under 7 to 1 |
| Bare minimum | Any calm swatch | That part is from 8 to 24, is not rounder than the Background, and is not already Best or Acceptable | 3 to 1, under 4.5 to 1 |
| Wrong | Hot or Lime | A component rounder than the Background, or a radius outside 8 to 24 that is not exactly the industry number | Under 3 to 1 |

Radius is one judgment across the frame for Best and Acceptable, then a per-part fallback. Editorial's 0 inside 4 is Best, even though 0 and 4 sit outside 8 to 24.

Industry recipes:

| Industry | Language | Voice | Background | Cards | Title | Save | Component radius | Background radius | Language contrast |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fintech | Swiss Grid | Tight corners. Strong contrast. | Paper | White | Ink | Ink | 4 | 8 | 9.0 |
| Wellness | Warm Soft | Soft corners. Gentle contrast. | Sand | Paper | Ink | Ink | 20 | 24 | 5.5 |
| Editorial | Mono Stark | Square corners. Stark contrast. | White | Stone | Ink | Ink | 0 | 4 | 12.0 |

The language contrast numbers are the strict recipe. The fee bands above are still 7, 4.5, and 3. A Best-practice frame needs 7 to 1 or higher even in Wellness, whose recipe number is 5.5. Show the recipe in the brief. Show the grade word on the row.

UX lines are not graded in those four words. They are met or unmet.

| Line | Met when |
| --- | --- |
| Hierarchy | Title and Save are Primary. Both cards are Body |
| Copy | Title equals that frame's title words. Save equals that frame's action words. Stuff and Submit fail |
| Flow | The demanded state, Empty or Error, is Fixed. The other state does not matter |

### What holds Ship

Ship is held, and pays nothing, when any of these is true on a frame that is blocking:

- A radius line exists and that part's radius grade is Wrong. Named or not.
- Any text contrast is under 3 to 1, named or not, even on the first client.
- A colour line exists, its grade is Wrong, and the client is Exacting or the line is named. A Loose client's unnamed Hot fill does not hold.
- A Hierarchy, Copy, or Flow line is unmet.
- The frame is marked Miss or Sent back.
- The frame's fee is null.
- The frame is not the reference frame, its look does not match the reference, and it still has a Wrong visual grade.

Look, for that match, is fill, radius, and text ink. Hierarchy and copy are judged by the fee, not by this match.

For a Loose client, named visual lines must each be Bare minimum or better and every UX line must pass, or the fee is null. A Loose client has no short fee. They pay the full fee or they cannot ship.

For an Exacting client, the full fee requires the whole frame at Best practice and every UX line passing. Anything less that is not a hold pays the short fee.

The project pays the lowest fee among its frames. One blocking frame holds the whole project. The Ship control reads `Ship · $N` or `Ship held ·` plus the first problem, named as frame, part, and property.

## 10. Fees

Read at the moment of the ship.

| Ship | Before Stage 3 | During Stage 3 |
| --- | --- | --- |
| Full small ship | $10 | $16 |
| Clean or short small ship | $10 | $10 |
| Full big ship | $36 | $48 |
| Short big ship | $3 | $10 |
| Turn a big client down | $6 | $6 |

A steady book adds $4 to a small full ship and to the small short fee. It does not add $4 to a big fee or to the $3 short big ship.

A clean auto-ship uses the short fee. One clean small ship is $10, the same as a month of Intern pay.

An on-time Fit does not add money and does not speed the queue. It only sets a miss rate. See staff.

## 11. Arrivals and reputation

Reputation is the accepted-ship count. It does nothing except shorten the gap before the next client.

| Accepted ships | Gap, while the queue already holds someone |
| --- | --- |
| 0, 1, or 2 | 60 seconds |
| 3 or more | `45 - (accepted - 3)` seconds, and never under 30 |

If the queue is empty and at least one ship has been accepted, the next client arrives immediately.

The queue also has a cap. While it is full, the timer does not spawn.

| When | Clients waiting, at most |
| --- | --- |
| Before anyone has ever been hired | 1 |
| After a hire, until 8 accepted ships | 2 |
| From 8 accepted ships | 3 |

So the second client cannot appear during the opening, because the cap is 1 until the first hire. After the first ship, if the queue is empty, the next one appears at once.

Big clients:

- Before 3 accepted ships, every arrival is small.
- After that, 1 in 4 arrivals are big.
- Chasing big clients makes it 1 in 2.
- A steady book makes it 0.
- Until a project has shipped hands-free, at most one big client may be waiting. A roll that would break the cap arrives as a small client.
- Hands-free means an auto-ship. The first one lifts the cap for the rest of the run.

The first big client of a run opens a decision, whether or not the Designer is ready. Take it, and it stays in the queue. Turn it down, and it leaves, the studio is paid $6, and a replacement spawns if the queue is now empty. The clocks keep running. The decision can be dismissed and reopened. It does not come back for later big clients.

## 12. The first three clients

These are the tutorial. They do not use the random 3-line brief.

| Project | Named lines | Frames |
| --- | --- | --- |
| 1 | Title colour only | 1, the first product frame |
| 2 | Title colour and Card A colour | The normal count for its size |
| 3 | Title colour, Card A colour, and Save colour | The normal count for its size |
| 4 onward | The normal brief | The normal count |

The lines are vague unless that client rolled big. Project 1 also shows a target chip with the words of the line that is holding Ship, and the editor pulses that control until Ship is live.

Contrast under 3 to 1 still holds these ships. A Loose project 1 can ship once Title is a calm colour and no text is under 3 to 1. The other Hot fills and the wild radii do not hold a Loose ship, because those lines were never created. An Exacting project 1 pays the full fee only when the whole frame is Best practice, and pays the short fee if Title is fixed and nothing else is holding.

Guide copy on the gate: click what pulses. The round clock is the client's 5:00. The bars are the month.

## 13. People

One Intern. Then that Intern can become the Permanent. There is no hire fee taken at the moment of hiring. Pay is the month-end bill.

| | Intern | Permanent |
| --- | --- | --- |
| Unlock | 3 hand ships, and the studio can cover this month's payroll plus the rest of this month's wage | Promote after 3 of that Intern's clean frames |
| Wage | $10 a month | $30 a month |
| Starts clients | No | Yes. Any unstarted project that is not claimed, not flagged, and not already staffed |
| Does the work | Copies a finished reference frame onto the other frames | Designs the lead, then checks the Intern. With no Intern, designs the other frames too |
| Miss | The rolled rate, reduced by systems, with a floor | The same formula on the lead. Covered work is a 0% miss when colour, radius, and contrast are all safe |

Hire stays locked until 3 hand ships. A second Intern cannot be hired. The button explains that one Intern is the person who can be busy on a frame someone already started.

The miss rate is rolled once for the run, from 20% to 50% inclusive, and shown on the Intern. Firing and hiring does not roll again. If a Sound client is a Fit and still on time:

- If someone had attempted that project, that person's rate becomes 20%.
- If nobody has ever been hired, the next hire starts at 20% instead of rolling.

A Sour client never changes the rate. The rate does not go below 20% by this reward. Systems can still push the effective rate lower, down to 0 when the brief is fully safe, or down to a 5% floor while something is still unsafe.

Fire is immediate, after a confirm. Future pay stops. Time already worked this month is still billed. Cash already paid stays spent. Unfinished frames come back to the Designer. Tokens, languages, and process steps stay.

Promote has no fee. The Intern's unfinished frames come back first. They are then a Permanent, paid from that moment at $30, and they go look for a client the Designer has not started.

### Payroll

At the end of the month, each person is billed `wage × seconds employed this month / 240`, including idle time. Someone fired earlier is billed for the seconds they had already worked, kept in a ledger. Amounts for the same name add together.

If cash cannot cover the bill:

- A gap of $2.50 or less is Late. $2.50 is one week of Intern pay. Nobody is fired.
- A larger gap fires an Intern only when that Intern's own bill covers the entire gap, and only when more than one person is on the bill. The cheapest such Intern goes. The Permanent is never fired for a shortfall.
- The last person always stays.
- Whatever is still unpaid is added to debt. Cash goes to $0 if it was spent. Debt is Late. The note says to ship the next screen, because the next fee pays the debt down before it becomes cash.

The month-end note lists the people and the amounts, and those amounts add up to the figure it names.

Hiring looks forward. The rest of this month's Intern wage is `10 × seconds left in the month / 240`. Hire is allowed only when cash covers the payroll already forecast for the end of the month plus that remainder. The price falls as the month runs, then returns to $10 when the next month starts. The button shows the remainder, not a flat $10, once hire is unlocked.

### What "clean" means for Promote

Each time the Intern finishes a frame that matches the reference and has a fee, that frame counts as one clean frame. Three of those unlock Promote. It is three frames, not three shipped projects. A small project has one frame for the Intern to copy, so three small projects can be enough. A big project has two.

## 14. How staff work

A step takes `max(0.4, 1.4 - 0.12 × systems)` seconds, rounded to one decimal. Systems, for the project in hand:

| Owned | Added to the count |
| --- | --- |
| Components | 1 |
| Radius variable | 1 |
| Colour styles | 1 |
| Base colour, base radius, base contrast | 1 each |
| That project's language codified | 2 |

The same count reduces the miss rate by 4 points each, but not through the floor.

A property is safe, and an inaccurate pass will not dirty it, when:

| Property | Safe when |
| --- | --- |
| Colour | Colour styles, or the colour token, or this project's language |
| Radius | The radius variable, or the radius token, or this project's language |
| Contrast | The contrast token, or this project's language |

If all three are safe, the effective miss is 0. Otherwise it is at least 5%. Components speed the work and batch the two cards. They do not by themselves make a property safe.

Each step writes one property, then waits. The order on a part is colour, then radius, then ink, then contrast. Parts are walked Background, Title, Card A, Card B, Save.

Batching, so a bought system is one step instead of five:

- Colour safe: every fill in one step, then every ink in one step.
- Radius safe: every corner in one step.
- Contrast safe: every contrast field in one step.
- Else if Components is owned and the part is a card: both cards.
- Else: that one part.

### The look they walk toward

The Permanent's lead walks toward a passing look, not toward whatever the Designer last shipped.

- If the client is big, or that industry's language is codified: the industry colours and the industry radii, ink cleared so it is automatic, contrast field 21.
- Otherwise: Paper background, White cards, Ink title, Ink Save, component radius 16, Background radius 20, ink cleared, contrast field 21.

An inaccurate lead dirties Card A only: Hot fill and Hot ink if colour is unsafe, radius 0 if radius is unsafe, contrast field 1.6 if contrast is unsafe. The contrast miss must also set Card A's ink to its fill, so the grade actually fails. The current browser build stores 1.6 and does not change the ink, and the grade ignores the stored number. The port should make the miss visible.

The Intern copies the reference frame's fill, radius, ink, and contrast. The same Card A dirt is applied when the roll misses. The Intern does not copy hierarchy or copy. Those are already on the frame from arrival, or from a process step bought later.

The reference frame is the first frame that is ready and that the Designer touched, else the Designer's ready frame, else a frame the staff have finished. A frame is ready when it has a fee and, if staff own it, they have finished it. A player-owned frame with a fee is ready immediately. The player does not have to press anything for the Intern to start copying.

### Permanent loop

1. If idle, take the first unclaimed project and start designing its lead. That start releases the month clock.
2. Step the lead until it matches the goal.
3. If the finished lead has no fee, or it is visually Wrong, flag the whole project back to the Designer.
4. If an Intern is on the team, stop and check their frames.
5. If no Intern is on the team, design each remaining frame as an accurate copy of the lead, then ship.

### Intern loop

The Intern looks for a project that already has a reference frame and another frame that is free to copy. The Designer's claimed projects come first. Otherwise only a project a Permanent is already on.

On a free frame, roll accurate or not, and step toward that goal. When the Designer edits the reference, the Intern's goal updates.

When the Intern finishes:

- If a Permanent is on that project and the Designer does not own it: the Permanent passes the frame when it has a fee and matches the lead. That is a clean frame. If it does not match, and it has not been sent back yet, and a roll beats the Permanent's raw miss rate, it is sent back for one accurate redo. Otherwise the project is flagged back to the Designer.
- If the Designer owns the project, or there is no Permanent on it: a matching frame with a fee is passed and counts as clean. Anything else is marked Miss and stays on the Intern until the Designer takes it over.

A flagged project is the Designer's. Unfinished frames come back. The status line names who flagged it and why.

### Auto-ship

When every frame is Passed and the project has a fee, and the Designer does not own it, it ships by itself. The Permanent is credited with the ship. That ship is hands-free. It pays the short fee, counts as an accepted ship, and counts as a big ship for the win if the client was big.

## 15. The tree

Purchases fail if the cash is short. They do not create debt. Owned rows move from the tree into a System list that shows the current step time.

Tools unlock in a chain, each $12, and the chain starts once the Designer has shipped one screen by hand:

1. Components. An edit to either card hits both. Staff set both cards in one step.
2. Radius variable. One number for the frame. Background stays 4 larger. Staff set every corner in one step.
3. Colour styles. Fills are safe, so staff do not miss them.

Base tokens unlock once an Intern has ever been hired and accepted ships are at least 3. $12 each. They can be bought in any order. The hire still counts if that Intern later leaves.

| Token | What it makes safe | The passing look it stands for |
| --- | --- | --- |
| Base colour | Vague colour | Paper background, White cards, Ink title, Ink Save. It does not set the text ink |
| Base radius | Vague radius | 16 on the components |
| Base contrast | Vague contrast | The contrast field 21, which is full-strength ink |

A language is $15. It appears after a big client in that industry has shipped, and only for that industry. Buying it makes colour, radius, and contrast safe on later projects in that industry, adds 2 to the system count there, and makes the staff walk toward that industry's recipe instead of the vague look. It also lets a vague check pass on the industry radii, including Editorial 0 and 4.

The design process is in section 17. $24 a step, only while Stage 3 is on.

Nothing in the tree prefills the Designer's own broken frames. The systems change the staff: their target, their speed, their miss, and how many parts one step writes.

## 16. On-time Fit

When a ship is a Fit, the client is Sound, and the client clock has not hit zero:

- The staff member who attempted it, if any, goes to a 20% miss.
- If nobody has ever been hired, the stored next-hire rate becomes 20%.

This does not pay extra. After the clock hits zero, a later Fit does not change the rate. The project still ships for the normal fee.

Head start, the old offer of a background colour after a Sound Fit, is not in the playable UI. Do not port it.

## 17. Stage 3

Stage 3 turns on the moment both are true: a Permanent is employed, and at least one language is codified. It turns off if the Permanent is fired and no other Permanent exists. Languages are not removed by firing.

While it is on, new projects arrive with UX already broken, then any bought process step repairs its line on every frame:

| Step | Cost | Repairs |
| --- | --- | --- |
| User Research | $24 | Copy. Title and Save get that frame's real words |
| Wireframing | $24 | Hierarchy. Title and Save become Primary. Both cards become Body |
| Usability Testing | $24 | Flow. The demanded state arrives Fixed |

Buying a step also repairs projects already in the queue that have UX, on every frame. It does not add UX to an older project.

A fully safe visual brief plus the bought UX steps is a clean auto-ship. People miss only what is still unsafe. UX itself is not in the miss roll. It is either pre-solved or left for the Designer, because staff steps do not write hierarchy or copy.

The Stage 3 panel shows five steps and a single progress fill: Permanent 0 to 3 clean frames, Language 0 or 1, then the three process steps. The next unfinished step is the sentence at the top.

## 18. Decisions

Three decisions. They stack, and only one modal is open. Priority is: the first big client, then the mid-game choice, then specialist or generalist. Each can be dismissed. A reopen button brings it back. The clocks keep running.

**Big clients or a steady book.** Opens after an Intern has ever been hired and accepted ships are at least 3, if it has not been answered. Until it is answered, a month that would otherwise win does not win. The month-end note says the choice is still open.

| Choice | Arrivals | Money | Winning month |
| --- | --- | --- | --- |
| Chase big clients | Big chance becomes 1 in 2 | $8 when you choose, and $8 at the start of every later month. If cash cannot cover it, cash goes to $0 and the rest is debt | At least one big client |
| Keep a steady book | Big clients stop arriving | A small ship pays $4 more | At least four small ships |

This choice cannot be undone.

**Specialist or generalist.** Opens on the same unlock, after the mid-game modal is out of the way. Specialist locks every future industry to the industry of the last shipped project, or Fintech if nothing has shipped. Generalist keeps the even mix. The choice can be undone, which clears it and lets the other one be picked. It does not change clients already in the queue.

Neither decision pauses payroll or the client clocks.

## 19. The win, and selling

A month can win only if all of these are true at the moment it ends:

- The month began with Stage 3 already on. Reaching Stage 3 in the middle of a month does not qualify that month. The next month does, if Stage 3 is still on when it starts.
- Payroll for the time people were employed was paid in full. Nobody left unpaid, debt is $0, and nothing was left Late.
- The Designer made no hand touch during that month. One changed value is enough to block it. Take over, Start, opening a frame, and pressing Ship do not.
- The mid-game choice has been made.
- Chase: at least one big client shipped during the month.
- Steady: at least four small clients shipped during the month.

The win is a line on the month-end break: "Won the month." The break does not end the run. Keep going starts the next month: clocks reset to 240 seconds, hand touches reset, ship counters for the month reset, the new month is qualified only if Stage 3 is on, and the chase fee is charged if that was the choice. Staff employment restarts at the beginning of the month.

If the month was won, the break also offers Sell the agency.

Selling keeps the studio name, the win count, and the sold count. Cash returns to $24. Staff, debt, process steps, the queue, the choice, and the specialist lock are cleared. Clocks are held until the next Start. One perk comes along, in this order:

1. The first codified language in the order Fintech, Wellness, Editorial.
2. Else the first owned token in the order colour, radius, contrast.
3. Else Components, if it was owned.
4. Else nothing. The status line says the screens came with you.

The kept language stays codified, but the "a big client has shipped" flags reset, so the other languages have to be earned again. A kept token stays owned. The other tokens do not.

## 20. Screen layout

One fixed viewport. The page does not scroll. Three regions.

**Top bar.** Studio name, cash, week bars, month number and time left, stage, ships (or hand ships out of 3 before the first hire), payroll due when it is above zero, the status line, and one primary button. That button is Start while the open client has not been started, and Ship or Ship held after that. A currency toggle between dollars and rupees is display only. The simulation is in dollars. The port can keep the toggle or drop it.

**Center.** The open client's frames, side by side. Pan and zoom the canvas. Zoom from 0.2 to 2.4, starting at 0.64. Dragging the empty canvas pans. Pinch or ctrl-wheel zooms around the pointer. With staff employed, a hard horizontal stretch can move to the next project someone is working. This camera is comfort, not a rule. The frames and the lock state are the rule.

Each frame shows its product name, who owns it, a Take over button when it is locked, jumps for Title, Card A, Card B, and Save, the phone, and a flow chip when the project has UX. The selected part gets corner handles.

**Right dock.** Clients, how to win, Stage 3 progress, To Ship, People, System, Tree.

Clients lists everyone waiting. A row shows the name, what the studio is waiting on, the target chip on the first client, and the round clock. The row starts an unstarted client. It opens a started one. Opening does not take a frame back.

To Ship lists the parts that are holding the open project. The first row is the one the tutorial pulses. All grades can be expanded: colour, radius, and contrast, with the grade word. A radius row includes the hint: the industry target, that 8 is a stop, that a Loose client also passes 8 to 24, and what is wrong if it is wrong.

People lists each person, their wage, what they are doing, the Intern's step time and miss rate, Fire, and Promote at `n/3`. Hire sits under the payroll lines.

The month-end break is a modal the scrim does not dismiss. Next month, or, if the month was won, Keep going and Sell the agency.

Teaching cards are one-shot. While one is open, client clocks pause. The known cards are Components after the first hand ship, the Intern at 3 hand ships, base values when tokens unlock, the language after the first big ship in an industry, the Permanent on promote, and the design process when Stage 3 turns on.

A separate unobtrusive card, the first time the studio is named, explains the three clocks. Dismissing it does not pause anything by itself. It is not one of the teaching cards that stop the client clock.

## 21. Save

Save on every committed action, and at least every second while the clock runs. Save again when the month breaks and when the window hides.

The browser key is `sell-the-system-v4` with save version 5. A save whose version is not 5 is discarded. Tell the Designer: "Old save from an earlier version was discarded." A file that cannot be parsed is not loaded, and the status line says so.

The Godot save can use a new version. Do not try to load the browser JSON unless you deliberately write a migration. Discard a version you do not know.

The browser build also locks the save to one tab. Godot does not need that.

## 22. Godot shape

Keep the simulation in one autoload, advanced by `_process` with the 0.25 second cap, and paused by the same rules as section 4. Scenes read state. They do not reimplement fees, grades, or staff.

Suggested split, matching the functions that already exist:

| Piece | Responsibility |
| --- | --- |
| `Run` | Cash, debt, month, reputation, choices, win, sell |
| `Project` | Industry, size, standard, temper, frames, requirements, flow, claim |
| `Grade` | Colour, radius, contrast, UX met, holds, fee |
| `Staff` | Hire, fire, promote, the step loop, QC, auto-ship |
| `Arrival` | Timer, cap, big-client roll, the first-big offer |
| `Tree` | Tools, tokens, languages, process |
| `Save` | Versioned snapshot of the autoload |

Seed the random generator and store the seed in the save if you want a run to replay. The browser build does not. Either is fine. Do not change a roll after it has been shown.

Content tables in this document are data, not code. Industries, products, palette, client names, and staff names (Ada, Ben, Cam, Dia, Eve, Fox, Gia, Hal, Ivy, Jed, Kim, Lux) belong in resources.

The phone is a scene instanced once per frame. The editor is one panel bound to the selected part. The dock is another. Do not build a second grade path for the UI. The Ship label, the To Ship list, and the fee all call the same check.

## 23. Do not port

These are in old notes or in unused functions. They are not the game.

- A roster, a pitch you write, a second currency, a mood bar.
- Layers, a real design tool, one click that restyles a layout.
- Selling a token or a language as the thing the client buys.
- A hire fee taken upfront. An upgrade that makes one click worth more money.
- Head start.
- The wiki that lists grades. The brief already shows the industry's colours, voice, and system name. Grades are on the rows.
- Swatches and the contrast slider as tree purchases. The tree chain is Components, then Radius variable, then Colour styles.
- Prefilling the Designer's frames with tokens. Staff walk toward the passing look. The Designer still opens a broken screen.
- Counting Start, opening a frame, or pressing Ship as a hand touch. Only a changed value counts.
- Firing the Permanent because payroll is short.
- More than one Intern.

## 24. Numbers to keep in one table

If a tuning pass changes a number, change it here and in the autoload together.

| Constant | Value |
| --- | --- |
| Starting cash | 24 |
| Month | 240 seconds |
| Week | 60 seconds |
| Frame cap | 0.25 seconds |
| Arrival before 3 ships | 60 seconds |
| Arrival after | max(30, 45 - (accepted - 3)) |
| Empty queue | Immediate, once accepted is at least 1 |
| Queue cap | 1 before a hire, 2 until 8 accepted, then 3 |
| Big client after | 3 accepted |
| Big chance | 1/4, or 1/2 if chasing, or 0 if steady |
| Big waiting cap | 1 until the first auto-ship |
| Exacting chance | 1/4, then 1/2 after tokens unlock |
| Sound chance | 1/2 |
| Named lines on a small brief | 3 |
| On-time clocks | 300, then 180, then 120 |
| Intern wage | 10 |
| Permanent wage | 30 |
| Intern cap | 1 |
| Miss roll | 20% to 50%, once |
| Miss floor while anything is unsafe | 5% |
| On-time Fit miss | 20% |
| Step | max(0.4, 1.4 - 0.12 × systems) seconds |
| Promote | 3 clean frames |
| Intern unlock | 3 hand ships |
| Token unlock | Ever hired, and 3 accepted |
| Tool price | 12 |
| Token price | 12 |
| Language price | 15 |
| Process price | 24 |
| Chase fee | 8 now, and 8 each new month |
| Steady bump | 4 on a small ship |
| Decline fee | 6 |
| Late payroll cap | 2.50 |
| Full fee | 10, or 16 in Stage 3 |
| Short fee | 10, or 3 for a big client before Stage 3 |
| Big fee | 36, or 48 in Stage 3 |
| Contrast bands | 7, 4.5, 3 |
| Radius range that is bare | 8 to 24 |
| Radius step | 4 |
| Radius clamp | 0 to 32 |
| Zoom | 0.2 to 2.4, default 0.64 |
