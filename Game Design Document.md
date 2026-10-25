# Game Design Document

Updated 24 October 2026. This is the current design of the game. When a decision changes, change it here in the same pass.

Words are defined in [[CONTEXT]]. Numbers are in [[Game Parameters]] and must match the `PARAMS` object in `prototype-sell-the-system.html`. Research stays in [[Service Business Incremental Games]] and [[Product Design Incremental]]. Old decisions stay in `docs/adr/` and are not rewritten. This design supersedes [0004](docs/adr/0004-studio-run.md). The reason is in [0005](docs/adr/0005-hand-then-system-then-process.md).

## Fantasy

You become a design agency. You start by fixing screens yourself. An Intern takes a Project you have not claimed. A design system, a language, and a design process take the judgments you would repeat. Money is the only score. You have won when a full month that began only after Stage 3 was already active ships a big client without you opening or fixing a Project, and the payroll at the end of that month is paid. A banner says so. The Run keeps going.

## Who it is for

A designer should recognize the work. An incremental player who does not design should still be able to climb.

## Run

A Run is one ascent in three stages.

| Stage | The work | What joins |
| --- | --- | --- |
| 1 | UI by hand, for small clients | Ship |
| 2 | The same UI, with help | Team, design system, industry languages |
| 3 | UX on top of that UI | Design process, and higher fees |

Stage 3 is active while at least one Permanent is employed and at least one language is codified. The higher fees apply to ships completed while it is active.

Every Project has an Industry, including a small one. You do not pick the Industry. The Screen is always the same elements. A big client in an Industry uses that Industry's strict recipe.

## The screen

The phone shows five elements.

| Element | UI | UX, once Stage 3 is active |
| --- | --- | --- |
| Background | Colour | Hierarchy is not judged here |
| Title | Colour and contrast | Hierarchy must be Primary. Copy / Clarity is judged |
| Card A | Colour, corner radius, and contrast | Hierarchy must be Body |
| Card B | Colour, corner radius, and contrast | Hierarchy must be Body |
| Save | Colour, corner radius, and contrast | Hierarchy must be Primary. Copy / Clarity is judged |

Flow / States sits on the Screen, not on one element. The states are Default, Empty, and Error.

You work on one Project. The tool for the selected element floats beside the phone. A ship you finish pays the hand fee. A property the client did not name is not judged.

## Clock

One balance, shown as money. A Run starts at $24. A month is 240 seconds, four weeks of 60 seconds. The HUD counts it down, and payroll comes due at the end.

## The queue

Projects arrive on a timer, including while you are fixing a miss. A Project that is waiting is kept.

If the queue is empty, the next Project arrives immediately. While the queue already holds a Project, the next arrives every 60 seconds until 3 ships have been accepted, then every 45 - (acceptedShips - 3) seconds, and never faster than 30 seconds.

An accepted ship is a successful hand ship or a clean auto-ship. Each one raises Reputation by one. Reputation only speeds that timer.

Selecting a Project in the queue claims it. An Intern does not take a claimed Project.

After 3 accepted ships, 1 in 4 arrivals is a big client. Until a Project has shipped hands-free, at most one big client may be waiting. A roll that would break the cap arrives as a small client. After a hands-free ship, that cap is lifted.

Hands-free means a clean auto-ship, or you press Ship without editing anything because tokens, a language, or the design process already met every judged requirement. Opening a miss and fixing it is a hand ship. It does not lift the cap.

A big client pays the big fee. The names and the recipes are in [[Game Parameters]].

## Stage 1

Small clients. A vague ask names a subset of elements. An unnamed property is not judged.

Every client is Exacting or Loose, and Sound or Sour. Those two pairs are independent of each other, and independent of big or small. From the start, 1 in 4 clients are Exacting and 1 in 2 are Sound. After the first token is bought, half are Exacting. Sound stays 1 in 2. A big client uses the same two rolls, and still names every element.

The client requirements list is grouped under Colour, Radius, and Contrast. Every element has a row for each of those, except Background, which has no contrast row. A small brief names 3 lines, drawn from Colour, Radius, and Contrast. A named row has a checkbox and shows the grade. The checkbox fills at the grade that client pays the full fee for: Bare minimum for a Loose client, Best practice for an Exacting client. An unnamed row shows the element and the grade, with no checkbox. The row does not show the target value, and hovering it does not preview a corrected Screen. Choosing a row selects the element. It does not write a value. When the value equals a token or a language you own, the row says Match beside the grade. Stage 3 adds a Type group for Hierarchy and Copy. Those lines are met or unmet. Flow stays met or unmet. The grade on a row changes as the value changes. That is how a last edit is read. The Wiki opens only when the Designer asks, on the Industry of the open Project. It does not open itself, and it does not mark a control. The month and the on-time clock both keep running while it is open. The swatches do not say which grades pass. Opening the Wiki does not touch a Project, so a winning month can include reading it.

The Screen's grade is the lowest of colour, radius, and contrast.

| Grade | Colour | Radius | Contrast |
| --- | --- | --- | --- |
| Best practice | That element's Industry colour | Title, both cards, and Save at the Industry radius. Background is 4 larger | Painted text at 7 to 1 or higher |
| Acceptable | A calm swatch is Bare minimum. Colour has no Acceptable step | The four components match, and the Background is 4 larger, at some other radius | Painted text at 4.5 to 1, under 7 to 1 |
| Bare minimum | Any calm swatch. Calm is Paper, White, Ink, Sand, and Stone | That element's radius is 12–24 | Painted text at 3 to 1, under 4.5 to 1 |
| Wrong | Hot or Lime | A component rounder than the Background, or a radius outside 12–24 that is not the Industry pair | Painted text under 3 to 1 |

Contrast compares the painted text with the colour behind it. Title is compared with the Background. Each card's label is compared with that card. Save's label is compared with Save. Card colour against the Background is not a contrast grade.

A Loose client pays the full fee when every named line is Bare minimum or better. A Wrong named line holds Ship. An Exacting client pays the full fee only when the whole Screen is Best practice, including a line the brief left unnamed, and any Wrong line holds Ship. Acceptable or Bare minimum pays the clean auto-ship fee: $3, or $6 once Stage 3 is active. That short fee is the same for a big client. Editorial radius 0 inside 4 is Best practice and pays the full fee for an Exacting client, even though 0 and 4 sit outside 12–24.

On time is 300 seconds for the first Project and until an Intern is hired, 180 seconds after a hire with no Permanent, and 120 seconds while a Permanent is employed. That clock is its own. It is not the month, and it is not the gap before the next arrival. Both clocks keep running while the Wiki is open. The queue shows the seconds while they remain. When they run out, the Sound reward closes and the Project stays. A later ship still pays by the fee rule. For a Sound client, an on-time Fit sets the miss rate to 20% for the Intern who attempted that Project. If no Intern has been hired, the next hire starts at 20%, once, and later hires roll again. A Sour client does not change a miss rate. An on-time Fit does not raise the fee, and it does not speed the queue.

You press Ship. The control shows the fee this Screen would pay. A Loose ship at Bare minimum or better pays $6, including when you fixed an Intern's miss. An Exacting Fit pays $6. Once Stage 3 is active, that same full fee is $10. An Exacting Screen that is not a Fit, and is not held, pays the auto-ship fee. A big client pays $36, or $48 while Stage 3 is active, when that fee rule says the full fee is due. While a line holds Ship, the control says it is held.

A Head start can be bought after the first Fit you finish for a client who was not Sour, for one hand fee. It offers the Background colour from that ship. A rough ship does not change it, and a Sour ship does not change it. You still set the value. The offered colour can fail the brief in front of you. It does not cover the line, and it does not pre-fill the next arrival. The tokens do that later.

## Stage 2

### People

The first Intern can be hired after 3 hand ships. Hire has no fee. Pay comes due at the end of the month, pro-rated for the time each person was employed. A month is 240 seconds, four weeks of 60 seconds. An idle Intern is still paid. Each hire is another Intern. Hiring and firing do not change Reputation.

Each Intern's miss rate is rolled from 20% to 50% and shown on that Intern's card. An on-time Fit for a Sound client sets the Intern who attempted that Project to 20%, and the rate does not go below that. If no Intern has been hired, the next hire starts at 20%, once. An idle Intern pulls the oldest small Project you have not claimed. A big client is not pulled until at least one token has been bought. You can claim that big client yourself before then. An attempt takes 1.4 seconds, minus 0.12 seconds for each counted system, and never under 0.4 seconds. Interns and Permanents use that same clock.

A clean auto-ship pays $3, or $6 once Stage 3 is active. It counts as an accepted ship. An Intern's clean auto-ship also counts toward the 3 clean ships that unlock Promote.

A miss writes a visibly wrong value on one uncovered property and flags the Project. You fix it and Ship. That pays the hand fee. It is a hand ship, and it is not that Intern's clean ship.

Fire is immediate, for an Intern or a Permanent. Future pay stops. The month still bills the time already worked. Money already paid stays spent. The Project they were attempting returns to the queue.

Promote that Intern after 3 of their own clean ships. Promote has no fee. They become a Permanent: $30 a month, that same attempt clock, and a 0% miss on any property the design system, a codified language, or the design process covers. The miss rate on their card still applies to an uncovered property that is judged.

If the balance cannot cover payroll, unpaid Permanents leave first, then unpaid Interns. Stop when the people who remain are affordable, pay them, and keep them. The balance does not go below $0.

### Design system

Three tokens, $12 each. They unlock once an Intern has been hired and accepted ships are at least 3. The hire stays counted if that Intern later leaves.

| Token | What later arrivals are pre-filled with | What it covers |
| --- | --- | --- |
| Base Colour | Paper background, White cards, Ink title, Ink Save | Vague colour |
| Base Radius | Corner radius 16 | Vague radius |
| Base Contrast | Contrast 21.0, the 100% contrast default | Vague contrast |

Those defaults satisfy a vague small-client UI ask. An Intern and a Permanent can miss only an uncovered property. A fully covered brief is always clean.

### Languages

Shipping a big client in an Industry unlocks Codify Language for that Industry, for $15. Later Projects in that Industry arrive with the language applied, in place of the token pre-fill for colour, corner radius, and contrast. The language covers that Industry's colour, corner radius, and contrast.

A codified language also satisfies a vague small-client check in that Industry. Component radius 0 or 4, and Background radius 4 or 8, still pass a vague 12–24 ask once that language is on the Project.

A big client names every element. An Exacting one pays the big fee only for Best practice. A Loose one pays the big fee when every named line is Bare minimum or better.

| Industry | Language | Background | Cards | Title | Save | Components | Background radius | Contrast |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fintech | Swiss Grid | Paper | White | Ink | Ink | 4 | 8 | Best practice is 7 to 1 or higher |
| Wellness | Warm Soft | Sand | Paper | Ink | Ink | 20 | 24 | Best practice is 7 to 1 or higher |
| Editorial | Mono Stark | White | Stone | Ink | Ink | 0 | 4 | Best practice is 7 to 1 or higher |

## Stage 3

Stage 3 is active when at least one Permanent is employed and at least one language is codified. Projects that arrive while it is active add UX on top of the UI. Ships completed while Stage 3 is active use the higher fees.

Hierarchy has three levels: Small, Body, and Primary. Title and Save must be Primary. Both cards must be Body. Background is not judged.

Copy / Clarity is judged on Title and Save. Vague or dark copy fails. "Stuff" and "Submit" fail. Clear intent passes. "Notes" and "Save note" pass.

Flow / States is the Screen. The states are Default, Empty, and Error. Empty and Error arrive broken. The Project demands that one of those two broken states be set to Fixed.

The design process is $24 a step, and the steps can be bought in Stage 3. A bought step pre-solves that requirement on later arrivals.

| Step | Pre-solves |
| --- | --- |
| User Research | Copy / Clarity |
| Wireframing | Hierarchy |
| Usability Testing | Flow / States |

Coverage stacks. Base Colour, Base Radius, and Base Contrast cover vague colour, radius, and contrast. A codified language covers that Industry's colour, radius, and contrast. A design-process step covers its UX requirement. People miss only what is still uncovered. A brief whose judged requirements are all covered is clean.

## Win

The win is one full month of 240 seconds, four weeks of 60 seconds, that began only after Stage 3 was already active. In that month at least one big client shipped. You never opened or fixed a Project by hand: no select, no element click, no requirement click, no value edit, and no Ship. Opening the Wiki does not count. Month-end payroll for the time staff were employed was paid in full. The banner does not block. Play continues.

## Form

A browser page with a fixed viewport. The page does not scroll: `html, body { height: 100%; overflow: hidden }`. The playable page is `prototype-sell-the-system.html`.

Three regions share that window.

The left HUD shows money, the 240-second month as four 60-second weeks, the payroll countdown, status, the project queue, and the open client's requirements. The requirements are grouped under Colour, Radius, and Contrast. A named row has a checkbox that fills at that client's full-fee grade. Choosing a row selects that element and does not write a value. A control on the requirements heading opens the Wiki beside the list. The same HUD holds the team, the design system, the design process, and Ship. Ship shows the fee this Screen would pay, or that it is held.

The center is the phone: Background, Title, Card A, Card B, and Save. The tool popup floats beside the phone. It does not cover the right panel.

The right panel is monospace telemetry. Its sections are PARAMETERS, LIVE, DESIGN SYSTEM, TEAM, and ELEMENTS. PARAMETERS lists the numbers in [[Game Parameters]].

## Out

A roster you pick from. Pitches. A second currency. A mood bar. Layers, Figma, paper.design, and Leadership as a Service. A real design tool. One click that restyles a layout. Selling a token, a language, or a process step as the thing the client buys. Upgrades that make one click worth more. A hire fee taken upfront. A month counted in ships. Retune.

## Open

Stage 2 and Stage 3 prices stay as written until a played hour shows the first winnable month arriving much sooner.

## How to keep this document

Update this file in the same pass as the change.

- A new or changed rule goes in the section it touches. Remove the sentence it replaces.
- A changed number goes in [[Game Parameters]] and in `PARAMS` in the prototype together.
- A renamed idea goes in [[CONTEXT]].
- A decision that reverses an ADR gets a new ADR. The old ADR stays.
- The research notes are a record of what was found. They are not edited to match the current design.

## Related

- [[Agency Index]]
- [[CONTEXT]]
- [[Game Parameters]]
- [[Incremental Loop]]
- [[Product Design Incremental One Pager]]
