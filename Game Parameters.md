# Game Parameters

Decided 24 October 2026. These numbers are the `PARAMS` object in `prototype-sell-the-system.html`. The telemetry panel lists them so they cannot drift from this file. Rules live in [[Game Design Document]]. Words live in [[CONTEXT]].

Starting money is $24. There is one balance. It never goes below $0.

A month is 240 seconds, four weeks of 60 seconds, of wall clock. Payroll is deducted at the end of the month, pro-rated for the time each person was employed. If the queue is empty, the next Project arrives immediately. While the queue already holds a Project, the next arrives every 60 seconds until 3 ships have been accepted, then every 45 - (acceptedShips - 3) seconds, and never faster than 30 seconds.

An accepted ship is a successful hand ship or a clean auto-ship. Reputation rises by 1 for each, and only speeds that gap.

Stage 3 is active while at least one Permanent is employed and at least one language is codified. The Stage 3 fees apply to ships completed while it is active.

## Money and time

| Parameter | Value | What it does |
| --- | --- | --- |
| Starting money | $24 | The balance when a Run begins |
| Balances | 1 | Money is the only score |
| Balance floor | $0 | Payroll never drives the balance negative |
| Month | 240s | Wall-clock month, four weeks of 60 seconds. Payroll comes due at the end |
| Week | 60s | One quarter of the month. The HUD shows week 1 through week 4 |
| Payroll | Pro-rated | Time employed this month. Someone fired before the end is billed for that fraction. A full month is the full wage |
| Reputation | +1 per accepted ship | Speeds arrivals. Hiring and firing do not change it |

## Fees

| Parameter | Value | What it does |
| --- | --- | --- |
| Hand fee | $6 | You press Ship, including after you fix a miss |
| Hand fee, Stage 3 | $10 | Same ship, completed while Stage 3 is active |
| Auto-ship fee | $3 | An Intern or Permanent finishes a clean ship |
| Auto-ship fee, Stage 3 | $6 | Same clean auto-ship, completed while Stage 3 is active |
| Big fee | $36 | One big client |
| Big fee, Stage 3 | $48 | One big client, shipped while Stage 3 is active |
| Intern pay | $10 per month | Pro-rated for time employed, including idle time and time before a firing |
| Permanent pay | $30 per month | Pro-rated for time employed, including idle time and time before a firing |
| Hire fee | None | No upfront charge for an Intern or for Promote |
| Base token | $12 each | Base Colour, Base Radius, or Base Contrast |
| Codify Language | $15 | One Industry, after a big client in that Industry has shipped |
| Design process | $24 each | User Research, Wireframing, or Usability Testing |

## Arrivals

| Parameter | Value | What it does |
| --- | --- | --- |
| Empty queue | Immediate | The next Project does not wait on the timer |
| Arrival, before 3 accepted ships | 60s | Used only while the queue already holds a Project |
| Arrival, from 3 accepted ships | `45 - (acceptedShips - 3)` seconds | Subtract one second per accepted ship past the third |
| Arrival floor | 30s | The fastest gap. More accepted ships do not shorten it |
| Big client after | 3 accepted ships | Before this, arrivals are small clients |
| Big chance | 1 in 4 | Chance an arrival is a big client, once they are legal |
| Big cap | 1 waiting | Holds until a Project ships hands-free. Then uncapped |
| Cap overflow | Arrives as a small client | A big roll that would break the cap |

Hands-free is a clean auto-ship, or Ship pressed with nothing edited because tokens, a language, or the design process already met every judged requirement. Opening a miss and fixing it does not lift the cap.

## Clients

Every arrival is Exacting or Loose, and Sound or Sour. Those rolls are independent of each other and of big or small. A big client uses the same two rolls.

| Parameter | Value | What it does |
| --- | --- | --- |
| Exacting, before a token | 1 in 4 | The rest are Loose |
| Exacting, after the first token | 1 in 2 | Applies to arrivals after that purchase |
| Sound | 1 in 2 | The rest are Sour. This roll does not change |
| Small brief | 3 named lines | Drawn from Colour, Radius, and Contrast. A big client names every element |
| On time, until a hire | 300s | The first Project, and every Project until an Intern has been hired |
| On time, after a hire | 180s | After a hire, while no Permanent is employed |
| On time, with a Permanent | 120s | While a Permanent is employed. Separate from the month. A Sound client's Fit inside the window sets one miss rate to 20%. At zero the reward closes and the Project stays. The clock keeps running while the Wiki is open |
| Exacting, not Best practice | The auto-ship fee | $3, or $6 while Stage 3 is active. Same for a big client. The Screen must be Bare minimum or better. Wrong holds Ship |
| Radius step | 4 | How far a component radius sits inside its container |

On time is 300 seconds for the first Project and until an Intern is hired, 180 seconds after a hire with no Permanent, and 120 seconds while a Permanent is employed. A Loose client pays the full fee when every named line is Bare minimum or better. An Exacting client pays the full fee only for Best practice on the whole Screen. An on-time Fit does not add money and does not shorten the arrival gap.

## Staff

| Parameter | Value | What it does |
| --- | --- | --- |
| Intern after | 3 hand ships | Hand ships required before an Intern can be hired |
| Intern miss | 20–50%, rolled per Intern | Shown on that Intern's card. A miss hits one uncovered judged property |
| Intern attempt | 1.4s to 0.4s | An attempt takes 1.4 seconds, minus 0.12 seconds for each counted system, and never under 0.4 seconds. Interns and Permanents use that same clock. The count is the components tool, the radius tool, styles, each bought token, and two for a codified language |
| Promote after | 3 clean ships | Counted on that Intern's own clean auto-ships |
| Permanent attempt | 1.4s to 0.4s | Same clock as an Intern |
| Permanent miss, covered | 0% | Properties covered by a token, a codified language, or the design process |
| Permanent miss, uncovered | The rolled rate | Still applies to a judged property nothing covers |
| Fire | Immediate | Intern or Permanent. Pay already spent stays spent |
| Insolvency | Permanents, then Interns | Unpaid Permanents leave first. If the rest fit the balance, pay them and keep them |

A fully covered brief is always clean. People miss only uncovered properties.

## Design system

Unlocked once an Intern has been hired and accepted ships are at least 3. Each token is $12. Later arrivals are pre-filled with what you have bought. The defaults below satisfy a vague small-client UI ask.

| Token | Value | Covers |
| --- | --- | --- |
| Base Colour | Paper background, White cards, Ink title, Ink Save | Vague colour |
| Base Radius | 16 | Vague corner radius |
| Base Contrast | 21.0 | Vague contrast. This value is the 100% contrast default |

## Grades

The Screen's grade is the lowest of colour, radius, and contrast. A Loose client pays the full fee when every named line is Bare minimum or better. An Exacting client pays the full fee only for Best practice on the whole Screen. Acceptable or Bare minimum pays the auto-ship fee. A Wrong named line holds Ship. Any Wrong line holds Ship for an Exacting client. The Wiki lists these values. It opens from the requirements heading, on the Industry of the open Project, and only when the Designer asks. A named requirement has a checkbox that fills at that client's full-fee grade, and it shows the grade. An unnamed row shows the element and the grade, with no checkbox. A row does not print the target. Match means the value equals a token or a language you own. Ship shows the fee this Screen would pay, or that it is held.

| Grade | Colour | Radius | Contrast |
| --- | --- | --- | --- |
| Best practice | That element's Industry colour | Industry radius on Title, both cards, and Save. Background is 4 larger | 7 to 1 or higher |
| Acceptable | None. Any other calm swatch is Bare minimum | Components match and the Background is 4 larger, at a radius other than the Industry pair | 4.5 to 1, under 7 to 1 |
| Bare minimum | Any calm swatch | 12–24 on that element | 3 to 1, under 4.5 to 1 |
| Wrong | Hot or Lime | A component rounder than the Background, or a radius outside 12–24 that is not the Industry pair | Under 3 to 1 |

Contrast is the painted text against the colour behind it. Title against the Background. A card's label against that card. Save's label against Save.

## Industries

Every Project has one. A big client names every element. Codify Language is $15, unlocked by shipping a big client in that Industry. Later Projects in that Industry arrive with the language applied, in place of the token pre-fill for colour, corner radius, and contrast. The language covers that Industry's colour, corner radius, and contrast, and those values also pass a vague check in that Industry. Component radius 0 or 4, and Background radius 4 or 8, still pass a vague 12–24 ask once the language is on the Project. Title, both cards, and Save use the component radius. The Background is that radius plus 4.

| Industry | Language | Background | Cards | Title | Save | Components | Background radius | Contrast |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fintech | Swiss Grid | Paper | White | Ink | Ink | 4 | 8 | Best practice is 7 to 1 or higher |
| Wellness | Warm Soft | Sand | Paper | Ink | Ink | 20 | 24 | Best practice is 7 to 1 or higher |
| Editorial | Mono Stark | White | Stone | Ink | Ink | 0 | 4 | Best practice is 7 to 1 or higher |

## Design process

Available while Stage 3 is active. $24 each. A bought step pre-solves that requirement on later arrivals.

| Step | Pre-solves |
| --- | --- |
| User Research | Copy / Clarity |
| Wireframing | Hierarchy |
| Usability Testing | Flow / States |

Stage 3 UX, on later arrivals:

| Requirement | Rule |
| --- | --- |
| Hierarchy | Small, Body, or Primary. Title and Save are Primary. Both cards are Body. Background is not judged |
| Copy / Clarity | Title and Save. "Stuff" and "Submit" fail. "Notes" and "Save note" pass |
| Flow / States | Screen-level: Default, Empty, Error. Empty and Error arrive broken. The Project demands one of those two be set to Fixed |

## Palette

These are the swatches already on the phone in `prototype-sell-the-system.html`. Calm colours are Paper, White, Ink, Sand, and Stone. Hot and Lime are not calm.

| Name | Hex | Calm |
| --- | --- | --- |
| Paper | #F4F1EA | Yes |
| White | #FFFFFF | Yes |
| Ink | #1C1917 | Yes |
| Sand | #F5E6D3 | Yes |
| Stone | #E7E5E4 | Yes |
| Hot | #FF4D6D | No |
| Lime | #C8FF00 | No |

## Win

A full month is 240 seconds, four weeks of 60 seconds. It began only after Stage 3 was already active. In that month at least one big client shipped. You never selected a Project, clicked an element, clicked a requirement, edited a value, or pressed Ship. Month-end payroll for the time staff were employed was paid in full. The banner does not block. Play continues.

## Related

- [[Game Design Document]]
- [[Agency Index]]
- [[CONTEXT]]
