# Product Design Incremental

The language for a browser incremental about one Run of a design agency. You design Screens by hand, Interns take Projects you have not claimed, and a design system, a language, and a design process take the judgments you would repeat.

The playable page is `prototype-sell-the-system.html` in this folder (`/Users/root1/Projects/Agency/prototype-sell-the-system.html`).

## Current loop

Three stages. Stage 1 is small clients and vague UI, shipped by hand. Stage 2 adds Interns, Permanents, the three base tokens, big clients, and a language per Industry. Stage 3 turns on while a Permanent is employed and a language is codified. Later arrivals then add Hierarchy, Copy / Clarity, and Flow / States, and the design process can pre-solve those. Fees are higher on ships completed in that stage.

A month is 240 seconds, four weeks of 60 seconds. Payroll is due at the end. If the queue is empty, the next Project arrives immediately. While the queue already holds a Project, the next arrives every 60 seconds until 3 ships have been accepted, then every 45 - (acceptedShips - 3) seconds, and never faster than 30 seconds.

The win is a non-blocking banner. The month must have begun after Stage 3 was already active. That month ships at least one big client, you never open or fix a Project by hand, and the payroll is paid. Play continues.

Numbers are in [[Game Parameters]]. The rules are in [[Game Design Document]]. Why this shape won is [0005](docs/adr/0005-hand-then-system-then-process.md).

## Doc map

| Doc | Use it for |
| --- | --- |
| [[Game Design Document]] | The current loop, stages, people, coverage, win, and layout |
| [[Game Parameters]] | Every tunable number, the industry recipes, and the palette |
| [[CONTEXT]] | These words, the loop above, and this map |
| `docs/adr/` | Why. [0005](docs/adr/0005-hand-then-system-then-process.md) is the current decision. Older ADRs stay |
| `prototype-sell-the-system.html` | The page that plays the loop. `PARAMS` must match [[Game Parameters]] |
| [[Agency Index]] | The note list |
| [[Incremental Loop]], [[Product Design Incremental]], [[Product Design Incremental One Pager]], [[Service Business Incremental Games]] | Research. They are not edited to match this design |

## Language

**Designer**:
The person you are. You start by doing the design work yourself.
_Avoid_: player, founder, lead, principal

**Run**:
One ascent through the three stages. A new game starts over. You do not pick a stage or an Industry.
_Avoid_: a layer, a prestige reset you buy, a chapter you choose

**Stage**:
Stage 1 is hand UI. Stage 2 is the team, the design system, and industry languages. Stage 3 is on while a Permanent is employed and a language is codified. It adds UX, the design process, and the higher fees.
_Avoid_: a layer, a prestige reset

**Industry**:
Fintech, Wellness, or Editorial. Every Project has one, including a small Project. It names the strict recipe a big client uses. You do not pick it.
_Avoid_: a roster you pick, a market, one industry dealt for the whole Run

**Project**:
One client's Screen, waiting in the queue or open. A small Project names fewer lines. A big client's Project asks every element to match that Industry.
_Avoid_: a portfolio, an account you pitch, a ticket

**Screen**:
The elements on every Project: Background, Title, Card A, Card B, and Save. Flow / States, in Stage 3, sits on the Screen.
_Avoid_: a new layout per client

**List**:
The queue. Projects that have arrived and are not shipped. The left HUD shows it as the project queue. Arrivals are kept. You claim one by selecting it.
_Avoid_: backlog, board, a roster

**Intern**:
A hire unlocked after 3 hand ships. No hire fee. Pay is $10 at the end of the month, including when idle. Their miss rate is set once from 20% to 50% and shown on their card. Firing and hiring does not roll a new rate. An on-time Fit for a Sound client sets the Intern who attempted that Project to 20%. It does not go below that. If no Intern has been hired, the next hire starts at 20%. An Intern does not start a client. Hire stops at one Intern, the one who can be busy on a screen already started. Only a Permanent starts a client you have not started. A big client stays unpulled until at least one token has been bought. You can claim that big client yourself before then. An attempt takes 1.4 seconds, minus 0.12 seconds for each counted system, and never under 0.4 seconds. Interns and Permanents use that same clock. They miss only an uncovered property. A clean ship pays $10, the same as the wage. In Stage 3 a full ship pays $16 and a clean ship stays $10.
_Avoid_: a free pair of hands, a property specialist from the day you hire them

**Permanent**:
That Intern, promoted after 3 of their own clean ships. Pay is $30 a month. Attempts use that same clock. Covered properties are a 0% miss. The rolled rate still applies to an uncovered property that is judged. Fire removes the person. Tokens, languages, and process steps stay.
_Avoid_: a mood bar, a title ladder, a person who is also a token

**Head start**:
A Stage 1 purchase at one hand fee. It offers the Background colour from a Fit that was not a Sour ship. You still set the value. A rough ship or a Sour ship leaves the offer as it was.
_Avoid_: a token, a Machine, a value that ships itself

**Design system**:
Base Colour, Base Radius, and Base Contrast. $12 each, unlocked once an Intern has been hired and at least 3 ships have been accepted. They pre-fill later arrivals and cover vague colour, corner radius, and contrast.
_Avoid_: a Machine you retune, the service the client buys, a person

**Language**:
The strict recipe for one Industry. Swiss Grid, Warm Soft, or Mono Stark. Codify Language costs $15 after a big client in that Industry ships. Later Projects in that Industry arrive with it applied, in place of the token pre-fill on colour, corner radius, and contrast. It covers that Industry's colour, corner radius, and contrast, including a vague ask.
_Avoid_: a style guide you author by hand, one recipe for every Industry at once

**Design process**:
Three steps in Stage 3, $24 each. User Research covers Copy / Clarity. Wireframing covers Hierarchy. Usability Testing covers Flow / States. A bought step pre-solves that requirement on later arrivals.
_Avoid_: Leadership as a Service, a mood bar, Figma

**Coverage**:
A token covers its vague property. A language covers that Industry's colour, corner radius, and contrast. A process step covers its UX requirement. A miss lands only on a judged property with no cover. A fully covered brief is clean.
_Avoid_: a miss on a line something already covers

**Hand touch**:
Pressing Ship while it is held, selecting a client, opening it, and Start do not increment the hand counter. Only a real value change does. Taking a screen back does not count. Setting a value back to a different value does.
_Avoid_: counting a held Ship, a select, an open, or Start

**Hands-free**:
A clean auto-ship, or Ship pressed with nothing edited because tokens, a language, or the design process already met every judged requirement. That ship lifts the big-client cap. Opening a miss and fixing it is a hand ship.
_Avoid_: a ship you repaired, a cap lifted by a lucky fix

**Reputation**:
One per accepted ship. An accepted ship is a successful hand ship or a clean auto-ship. It speeds how often Projects arrive, down to 30 seconds. It does not change who is a big client, and hiring does not change it.
_Avoid_: a second currency, a score beside money

**Sale**:
Payment for a Project that shipped. You finish a ship, someone finishes one clean, or a big client pays the higher fee. Stage 3 raises the full fee and the big fee for ships completed while it is active. The clean fee stays $10. An Exacting client pays the full fee only when the Screen's grade is Best practice. Acceptable or Bare minimum pays the clean auto-ship fee. A Loose client pays the full fee when every named line is Bare minimum or better. Wrong holds Ship. The client is paying for the design.
_Avoid_: selling a token, a pitch, a contract you negotiate, a bonus for finishing faster

**Mid-game choice**:
After a hire and 3 accepted ships, pick one. Chase big clients: they arrive 1 in 2, and each month costs $8, including the month you choose. The winning month is still one big client. Keep a steady book: big clients stop arriving, and a small ship pays $4 more. The winning month is four small ships. Leaving the choice open means the month cannot be won. `gameFlags.midgameChoice` defaults to on.
_Avoid_: a second win screen, a choice with one real option

**Month**:
240 seconds, four weeks of 60 seconds, of wall clock. Payroll comes due at the end, pro-rated for the time each person was employed. The winning month is one of these that began only after Stage 3 was already active.
_Avoid_: a count of ships, a freeze, a mood timer

**On time**:
On time is 300 seconds for the first Project and until an Intern is hired, 180 seconds after a hire with no Permanent, and 120 seconds while a Permanent is employed. For a Sound client, shipping inside that window is what lets a Fit set an Intern's miss rate to 20%. When the deadline ends, that reward closes and the Project stays.
_Avoid_: the month, the gap before the next arrival

**UI**:
Colour, corner radius, and contrast on the Screen. Stage 1 is this work, done by hand. A vague ask judges only the lines it names.
_Avoid_: a freeform editor, one click that restyles the layout

**UX**:
Hierarchy, Copy / Clarity, and Flow / States. Stage 3 adds them on later arrivals, on top of the UI. Background is outside Hierarchy.
_Avoid_: a journey map, a research minigame

**Fundamentals**:
The UI work done by hand: colour, corner radius, and contrast. The Designer sets each printed value. A single click does not do the pass.
_Avoid_: Figma, a freeform editor, one click that fixes the layout

**Fit**:
Best practice on the whole Screen. The Industry's colours, Title and both cards and Save at that Industry's radius with the Background 4 larger, and painted text at 7 to 1 or higher against the colour behind it.
_Avoid_: any calm swatch, two equal radii, a quality score beside money

**Grade**:
Best practice, Acceptable, Bare minimum, or Wrong. The Screen's grade is the lowest of colour, radius, and contrast. Best practice is a Fit.
_Avoid_: a score beside money, a label on a swatch

**Exacting**:
A client who pays the full fee only when the Screen's grade is Best practice. Acceptable or Bare minimum pays the clean auto-ship fee. Wrong holds Ship.
_Avoid_: a big client, a Sound client, a client who cares

**Wiki**:
The studio reference for the grades, opened from the requirements heading when the Designer asks. It opens on the Industry of the open Project. It lists that Industry's colours, the radius pairs, and the contrast ratios. It does not mark a control. Opening it does not touch a Project, and the clocks keep running.
_Avoid_: a label on a swatch, Figma, a design tool, a panel that opens itself

**Requirement**:
A line in the client requirements list. It names an element and a group, and it shows the grade reached. A named line has a checkbox that fills at the grade that client pays the full fee for. An unnamed line does not. Choosing it selects the element. It does not write a value.
_Avoid_: a separate review you run, Apply, one click that restyles the layout

**Match**:
The word on a requirement whose value equals a token or a language you own. It sits beside the grade.
_Avoid_: a grade, Apply

**Loose**:
A client who pays the full fee when every named line is Bare minimum or better, Fit or not.
_Avoid_: a small client, a Sour client

**Sound**:
A client for whom an on-time Fit sets the attempting Intern's miss rate to 20%.
_Avoid_: an Exacting client, a fee increase, a faster queue

**Sour**:
A client for whom a Fit does not change that miss rate.
_Avoid_: a bad client, a fee cut

**Calm**:
Paper, White, Ink, Sand, and Stone. A vague colour ask passes on these. Hot and Lime are outside calm. The hexes are in [[Game Parameters]].
_Avoid_: treating Hot or Lime as a passing colour

**Big client**:
After 3 accepted ships, 1 in 4 arrivals may be one. At most one may be waiting until a Project has shipped hands-free. They name every element. They are also Exacting or Loose, and Sound or Sour, on the same rolls as any other client. The big fee follows that fee rule. A roll past the cap arrives as a small client. An Intern does not pull one until at least one token has been bought.
_Avoid_: a roster you pick, a client with no Industry

These words are not in this design. Older notes still use them: Layer, Pile, Ticket, Machine, System, Figma, paper.design, Leadership as a Service. Paper, White, Ink, Sand, and Stone here are colours.

## Related

- [[Game Design Document]]
- [[Game Parameters]]
- [[Agency Index]]
