# Short Form Incremental Mechanics

Noted 24 October 2026. This is a mechanical reading of short active incrementals, for the loop in [[Game Design Document]] and the numbers in [[Game Parameters]]. It does not change those files. Where this note and the design differ, the design wins.

The climb those notes already use is the one mapped at the end: UI grunt work by hand, then a team and a design system, then a later process tier. In the current words that is the Designer setting colour, corner radius, and contrast, then an Intern, then a Machine. [[Incremental Loop]] still describes the later spikes. [0004](docs/adr/0004-studio-run.md) leaves Figma, Paper, Layers, and Leadership out of this Run.

## What was checked

Hands were not played for this pass. A download of a Nodebuster package did not parse, so internal frame timings and per-level price tables for that game are left out.

| Source | What it supports |
| --- | --- |
| [Find The Needle demo archive catalog](https://findtheneedle.gamedumpwiki.com/browse/) | Constants from `FindTheNeedle.pck`. The catalog says a recorded value is not proof of live behavior. |
| [afinira wiki](https://w.atwiki.jp/afinira/pages/48.html), [TheGamer](https://www.thegamer.com/a-game-about-digging-a-hole-best-upgrades/) | Digging rules, ore prices, the 3-slot bag. Upgrade dollar costs are not on these pages. |
| [Gnorp wiki](https://gnorp.wiki.gg/wiki/Mechanics), [Myco, Game Developer, 7 Mar 2024](https://www.gamedeveloper.com/design/interview-the-gnorp-apologue), [Gnorp News #1](https://gnorp.dev/news/1-A-New-Incremental/) | Pile, reclamation, housing, the upgrade blueprint. |
| [Digseum speedrun notes](https://www.speedrun.com/Digseum/forums/3o1hf) | Early shop prices and the $1,000,000 first-prestige talk. |
| [LightUpSky on Magic Archery](https://lightupsky.com/archives/lusgame01) | One sitting: craft, quests, the 1,500-gold auto-craft, city, level 168, about 1.5 hours, no reset. |
| [Black Hole itch page](https://aarimous.itch.io/a-game-about-feeding-a-black-hole) and [demo post](https://www.reddit.com/r/incremental_games/comments/1nqjxdu/steam_demo_released_a_game_about_feeding_a_black/) | 2–3 hour main mode, 200+ upgrades, a round, something always waiting in the tree. |
| [Nodebuster beginners guide](https://game-vault.net/wiki/Guide:Nodebuster_Beginners_Guide) | Hover combat, the ~60-second boss threshold, currencies, dial-back farming. |
| [Game Dev Tycoon wiki](https://gamedevtycoon.fandom.com/wiki/Game_Development_Based_on_Experience/1.4.3), [Bugs](https://gamedevtycoon.fandom.com/wiki/Bugs), [Training](https://gamedevtycoon.fandom.com/wiki/Training), [Engine](https://gdtwiki.miraheze.org/wiki/Engine) | The studio loop: solo garage, sliders, staff defect rate, custom engine. |
| [Game Dev Studio store page](https://store.steampowered.com/app/773580/Game_Dev_Studio/) | What that page advertises. Not a playthrough. |

## 1. The first three minutes

The opening purchase is priced like one successful action, and it arrives before the helper does.

| Game | Verb at the start | First thing the money can buy | What keeps the first two minutes full |
| --- | --- | --- | --- |
| **Find The Needle** | One click takes 1 strand. Hay sells at $0.0222 a strand. | **Bigger Handful** rank 1 is $0.10, and it raises the grab from 1 strand to 2. Five strands are about $0.11. Ranks then go $0.15, $0.25, $0.35, $0.50, up to 15 strands. The toy shovel is $3.25, after those ranks. | A new rank is ready inside the first minute. The $3.25 tool is not the first price. |
| **Digging A Hole** | One click digs. Each click spends battery. The bag holds **3** ores. A stone sells for **$1**, so a full bag is $3. A full bag destroys the next ore. | The workbench sells a wider shovel, more slots, a larger battery, and the jetpack. Dollar prices for those tiers were not on the pages checked. The bag of 3 means the first haul cannot clear a price above $3. | You are either digging or walking the few steps to sell. The bag, not a timer, ends the trip. |
| **Feeding A Black Hole** | Hover. The cursor pulses on its own. A round ends, then a report, then the tree. | Players on the itch page say a round almost always affords a buy. The demo post says the tree was tuned so something is always unlockable. A beginner guide says buy session time, then damage, then radius, and only then more rocks. Exact opening seconds and the first dollar were not re-timed here. | The round is short, the orbit stays populated, and the shop is the place the round dumps you. |
| **Nodebuster** | Hover. Pulses are on a timer. A hit hurts you. Drops vanish if you have not hovered them when the round ends. | The first runs are short. Bits from red squares buy damage, health, and armor. The published target is enough of those to last **about 60 seconds**, which is when the boss becomes the point of the run. | Two jobs at once: stay on the square until the pulse, then sweep the drop before the round dies. |
| **Gnorp Apologue** | Click the rock. Separately, sweep shards into the stash. Shards on the ground are not money yet. | First housing is **12 shards** if S(n) = 4 + 8 × 1.5ⁿ and n starts at 0. One house holds 2 gnorps. Runners and slammers are the next buys, at the Express and the Slam Club. | The cursor alternates between the rock and the pile while housed gnorps are still walking out. |
| **Digseum** | Click a tile in the free mud pit. | First stamina buy **150**, then **1,500**, then **8,000**. Strength **700**, then **10,000**, then **42,000**. Area **1,000**, then **6,000**, then **30,000**. | A dig is a handful of clicks. Repeating the mud pit levels that map by +30% gold a level. |
| **Magic Archery** | Click Craft Target. The archer fires. | Herb Gathering starts paying coins. The next skill costs coins. **Auto Craft Target is 1,500.** | Tabs and quests open over the first minute or two. Wooden targets then make each craft last longer, so the click rate falls before the 1,500-gold handoff. |

Find The Needle is the cleanest ratio. Rank 1 costs one starting grab, within a rounding error ($0.10 against about $0.11). The shovel that changes the verb costs about thirty times that, and the handful ranks exist so you never do the one-strand grab long enough to afford the shovel by hand.

Digging uses the other trick. The constraint that ends the trip is the thing the shop improves. Three slots send you home. A wider shovel is what you wanted while you were clicking. Battery is shared with the jetpack, and hitting zero battery or zero health drops you on the surface and deletes the bag.

Black Hole's own players mark the edge of "always something to buy." On the itch page, one player said they felt spoiled buying after nearly every round, and wanted a little more earning. Another wished the round did not exist, because a live screen lets a price tick from too expensive to affordable in front of you. The demo post still chose the round, and chose a tree that always has a next node.

## 2. From the hand to the helper

The helper is worse than the hand, on purpose. The player's correction is the valuable action.

**Gnorp.** Damage and collection are different meters, each a one-minute average. Slammers knock shards toward the rock. Runners have to walk that distance, and they turn around when their hands are full. From the second tier the rock reclaims shards, and the rate scales with the height of the tallest column. Myco's note on the first units says the same thing in plain language: runners spend their time walking, and mountaineers exist to throw the pile downhill. The player's click still matters. Sweeping the pile is collection. Clicking the rock is damage. Meditation, on the Slam Club, changes where slammers throw. Myco's blueprint for an upgrade is: it changes that unit's behavior, it is not mandatory, and it combines with a talent.

**Find The Needle.** A piston rake costs 120, further rakes grow by ×1.35, and the cap is 16. It throws 35 strands every 2.4 seconds, reaches 2.55 m, and keeps 6 wads on the pad behind it. A needle comes out on **1 in 10** throws. The scanner draws a **9-second alarm** and holds **8** needles. Those constants are the interrupt: the rake is blind to the thing the game is about, and a find calls the player over. The archive does not, by itself, prove that the belt hard-stops. The alarm duration and the 10% needle rate are enough.

**Digging.** There is no helper. The handoff is the tool in the same hands. Clicks become a held drill. The judgment stays. A full bag destroys ore, so the late trip is choosing what to touch. Dynamite clears a rock the drill cannot, and it also destroys ore in the blast. The jetpack starts weak and spends the same battery as the shovel, so going deeper without turning around deletes the haul.

**Nodebuster.** The guide's order is the handoff. Survive about 60 seconds with damage, health, and armor. Then spawn rate, then attack size, then blue squares, then the percent that scales with how many enemies sit inside the cursor. Auto-pulsers are a blue-node buy, later. Drops still have to be hovered or they vanish with the round. A hit still hurts, so parking in a crowd is a decision even after the screen is busy. If a new prestige kills you, you dial back one level and farm. The helper does not replace the push.

**Magic Archery.** Auto Craft at 1,500 gold removes the craft click. The remaining verb is the radio: one skill trains at a time, and the next quest asks for a different skill. The same play note says that after the city unlock, leaving the game up for a coffee and a shower still reached the finish, six skills at level 168, in about an hour and a half, with no prestige. That is the failure mode for a studio game whose joke is the work. The handoff came early, and the rest was waiting.

**Black Hole.** The main mode stays a cursor. A beginner guide tells you to let electric asteroids work, and also tells you not to add rocks until damage can break them. Session time and damage come before radius, and radius before a denser orbit. The itch page's scope is a 2–3 hour mode and over 200 upgrades, with planets, stars, and comets as later objects, not as idle turrets in the first hour. A reported postmortem, not re-watched here, says passive minions and lingering clouds were cut from the main mode because they were not instant. Treat that as a lead, not a checked transcript.

The pattern across the set: the first helper is weak, slow, or wrong. The player's intervention is either more money (Digging's high-grading), the only way to catch the rare object (a needle, a boss, a drop), or a visible stall you caused by letting the helper run unbalanced (the pile).

## 3. Quiet buys and spikes

Two ratios show up, and they are not the same kind of count.

**By purchase.** Find The Needle's first five buys are quiet handful ranks. The shovel is the spike. Digseum's early shop is four ladders. Magic Archery is many skill levels, then a few breaks: wooden targets, auto-craft at 1,500, the city, magic, level 168. Black Hole advertises 200-plus upgrades across 2–3 hours, and its players describe buying on almost every round. Nodebuster's guide is the same shape: long ladders of damage, health, and armor, then a new toy (size, blue squares, drones).

**By design intent.** Myco tried to make each upgrade a behavior change, and he treated a mandatory percent as a failure. Gnorp still has an exponential count underneath: housing at ×1.5, and a prestige gate of about ×2.29 on the collection rate you must show for the next talent point, P(tp) = 5.5 × 2.286ᵗᵖ + 6. The spikes sit on a curve that still walls you.

A spike in this set changes what is on screen or what the hand does. A quiet buy makes the current verb slightly larger. Digging's quiet track is radius, slots, battery, and thrust. Its spikes are the jetpack appearing, and the click becoming a held drill. The ore table is the other spike, and it is not a shop item. Sell prices run 1, 2, 5, 10, 20, 50, 100, 250. The wiki's speed note says each deeper ore is about double, so hauling the cheap ones is the mistake.

**Cost steps that make a wall.** Digseum is the clearest published ladder:

| Buy | Prices seen | Step |
| --- | --- | --- |
| Stamina | 150, then 1,500, then 8,000 | ×10, then ×5.3 |
| Strength | 700, then 10,000, then 42,000 | ×14, then ×4.2 |
| Area | 1,000, then 6,000, then 30,000 | ×6, then ×5 |
| First prestige, as discussed | 1,000,000 | a target you grind toward, not a single dig |

Find The Needle's extra rakes grow at ×1.35, which is a softer wall: the second and third copy are an annoyance, not a new era. The era changes when a new machine exists (the shovel, the bucket at 25, the wheelbarrow at 80, the detector at 390).

Black Hole's players asked for slightly more tension than "a buy every round." The working band in this set is: a quiet buy every cycle or two, a price that takes two to four cycles when it is meant as a wall, and a screen-changing spike on a slower clock. For a 1–2 hour game that is a spike every several minutes, not a spike as the only thing in the shop, and not 300 copies of one percent. [[Incremental Loop]] already says that last part.

## 4. What forces the rhythm

**The round ends, and the shop is the next screen.**

- Nodebuster: the round ends when health hits zero, the boss dies, or you terminate. You need about 60 seconds of survival before the boss is the game. Uncollected drops die with the round, so the last seconds are a sweep.
- Black Hole: the timer ends, a report shows, then the tree. Growth inside a round is the pressure to have bought enough damage and time.
- Digging: the bag or the battery ends the trip. Early trips are short because 3 ores is nothing. Deeper trips get longer because the return costs the same battery you spent digging.
- Digseum: stamina ends the dig. The speed notes treat a mud-pit dig as a few clicks once area is leveled, then you are back on the shop. Museum gold ticks while you dig. First prestige is a $1,000,000 conversation, on the order of minutes into a tuned run, not the first dig.

**The screen never closes, and something on it stalls.**

- Gnorp: you buy on the live pile. The two bar graphs tell you whether the last change helped. A tall column starts eating shards. Housing has a standby before the new bodies appear, so there is always a moment of watching.
- Find The Needle: once belts sell the hay, the walk to the booth is gone. The rhythm is the alarm, the rake's short reach, and the pad filling up.
- Magic Archery: one screen. After auto-craft, the rhythm is the next quest's stat requirement, which forces a hand on the skill radio. Past the city, that pressure fades and the game can be left running.
- Agency, as specified: one window, list and Screen together, no scroll. Projects keep arriving during a fix, and a waiting Project is kept. Nothing in the rules deletes a Project you ignore. Payroll is the hard beat, and a month is 4 accepted ships, not a wall clock.

The month is the round this design already has. It is easy to miss, because the canvas does not kick you out. Black Hole's report screen is what a month can be: what shipped, what was missed, what payroll took, what you can afford now.

Empty time is the other half. Digging never has an empty hole; the bag is what makes you leave. Nodebuster puts squares on screen immediately. Black Hole pairs a bigger cursor with more rocks so the orbit does not go blank. The Agency list "usually one," with 40 seconds between arrivals, is a blank canvas whenever a ship takes less than 40 seconds.

## 4a. A design studio, as a reference

The hole, the hay, and the black hole are the feel of a short incremental. A game-development studio is the nearer subject. The work is a brief, a few named parts, a person who is worse than you, and a system you reuse until it is wrong.

Two titles sit on that subject. **Game Dev Tycoon** (Greenheart, 2013) is the one with a published development model. **Game Dev Studio** (Explosive Squat, 2018) is the one whose page says the quiet part about a system that rots. A third game, **Game Dev Simulator** (Jasper Seed, 14 Apr 2026), uses the words and is a different object: a VR story where you are the new QA hire at a desk, answering mail and playing the studio's games. You do not hire, and you do not keep a system. It is the grunt-work desk, not the climb.

### Game Dev Tycoon

You start in a garage. Hiring is locked until you take the one-time Staff Management training (0 research, 25,000 credits) and move to an office. The first games are you alone.

A game is not a freeform editor. It is three stages, and each stage is three sliders:

| Stage | Sliders | Design share | Tech share |
| --- | --- | --- | --- |
| 1 | Engine | 20% | 80% |
| 1 | Gameplay | 80% | 20% |
| 1 | Story / Quests | 80% | 20% |
| 2 | Dialogues | 90% | 10% |
| 2 | Level Design | 40% | 60% |
| 2 | AI | 20% | 80% |
| 3 | World Design | 60% | 40% |
| 3 | Graphics | 50% | 50% |
| 3 | Sound | 60% | 40% |

You set how much time each slider gets. Staff emit design points and tech points in that mix. The genre wants a particular balance, and a bad topic-and-genre pair caps the review before the sliders can save it. After release, a game report is how you learn which pair failed. The same pair twice in a row scores worse. That is an Industry: the elements stay, the recipe changes, and repeating the last recipe is a mistake.

Staff are the miss, with a published rate. A level-1 employee turns a point into a bug **31%** of the time. A level-1 manager is **16%**. The floor is **6%**, at employee level 4 or manager level 3. Bugs wait until a finishing stage, which takes from a couple of weeks to a month of game time, and that stage is there to clear them. A new hire also starts near useless: welcome training moves efficiency from **0.05** to **0.28**. Hiring several strong people at once is a known way to go broke. Their salaries hit immediately, their output does not, and a sudden high score becomes the bar the next game is judged against. The guide's answer is four cheap level-1 hires, trained, and a small game you can afford to fail before a larger one.

From medium games up, you assign one person to each of the nine fields. A medium game wants **3** people if nobody is overloaded, a large game **5**, a AAA game **6**. Overload cuts the points they produce. Keeping everyone under the line pays a **30%** experience bonus and does not change the review. One late test on a medium game found that a fitting assignment beat a mismatched one by about **5%** of total points (2536 against 2404). The assignment matters. It is not the whole score. The slider mix and the topic-genre pair carry more.

The engine is the reusable system. Creating one is research, **50** points, available after the first release. You put features into it. Some features exclude each other (a linear story and a branching story). The engine's tech level averages its graphics features, so leaving an old graphics version in beside a new one pulls the average down. You build a new engine when a better graphics version exists. The player still sets the sliders after the engine and the staff exist. The staff produce the points. The hand decides the mix.

### Game Dev Studio

The store page, not a playthrough, describes the same three layers in studio language. Employees have skills and knowledge of topics. You can run more than one project, with more than one team, or put everyone on one. You will not keep every employee. An engine is built, updated, and **revamped when the code is too messy**. The page also sells offices, rivals, and marketing. Those are the parts this design already set aside. The part that matches is the messy engine and the person who knows a topic and still leaves.

### What that adds to the five lessons

The 1-in-3 Intern miss is a level-1 employee. Tycoon's published rate is 31%. The 6% floor is the trained person. A clean month that stops the misses entirely is more generous than that floor, and it is what makes a month with no opened Project possible. Copying the 6% floor would leave a fix on the list forever.

A big Project names every line. In Tycoon that is the larger game, and it wants more than one person (3, then 5, then 6) or the assigned people overload and produce less. One Intern on a big Project is that overload. The miss can stay 1 in 3. The fix is the long one, because every line is named. The first Intern's early work wants the small Projects. The big one is the boss month, and it wants a Machine already covering some of the lines, or a second Intern.

A Machine is an engine feature: it holds one decision so the hand stops making it. Tycoon still makes you rebuild the engine, because an old feature lowers the average and a new brief wants a different exclusive. Retune, at $12, is that rebuild. It copies the last ship, including one you fixed. The next Project can still make that copy wrong, because a small Project names fewer lines and a big one uses a harder recipe. The wrong Machine value coming back to you is the review you did not need a separate report screen to read.

The garage is the four hand ships. Tycoon does not let you hire on day one, and the training you buy first is your own. That supports a quiet buy on the first $6 that improves the hand, with the Intern still waiting at ship 4. It also supports the payroll cliff already in the table. A month of small ships cannot pay CTC. Tycoon's version of the same mistake is hiring the expensive people before a small game has landed: the cost arrives, the output does not.

The hand does not leave in the middle of Tycoon. Staff emit the points, and you still allocate the nine sliders. Magic Archery's early auto-craft is the other reference, and it ends in a game you can leave running. The studio sim says the interesting hour is still the allocation: which lines this brief named, which Machine is now wrong, which Project the Intern should not be on. The month you never open stays the ending.

## 5. Five lessons for this game

The live numbers, from [[Game Parameters]]: a hand ship pays **$6**, an Intern ship pays **$3**, an Intern costs **$10** a month, a Permanent costs **$30**, a big Project pays **$36**, a Machine is **$12**, a retune is **$12**. The first Intern waits for **4** hand ships. A Machine waits for that Intern and for **4** ships that named its property. Arrivals are **40 seconds**, then **15 seconds** after **12** ships. An Intern attempts every **8 seconds** and misses **1 in 3**. A month is **4** ships. A big client is **1 in 5**, and only after those 4 hand ships.

### 1. Put a quiet buy on the first $6

Find The Needle charges $0.10 for the first rank because one grab pays about $0.11. The verb-changing shovel waits at $3.25.

This game's first ship pays $6, and nothing in the table costs $6 or less. The Intern is free and locked until ship 4. The Machine is $12 and locked behind the Intern. Four ships at a 40-second arrival is on the order of three minutes with a purse and an empty shop, if the player is faster than the timer.

The Intern should stay the first person, and it should stay behind those 4 ships. The first purchase should be earlier, cost at most one hand fee, and change the grunt work without raising the fee. [[Incremental Loop]] already bans a buy that makes one click worth more money. The legal quiet buy is reach or memory: the printed target easier to read, a value that sits on the element as a suggestion, one less trip through the popup. It is the handful rank, not the shovel.

Ship 4 is then the spike, in the same slot as Gnorp's first house: a weak second body, a few minutes in, after the hand has already been upgraded once.

### 2. Keep the 2× fix, and make the miss an alarm

A hand ship pays double an Intern ship. That is the right reward. Digging pays you for touching the rich ore and punishes you for filling the bag with stone. Nodebuster pays you for hovering the drop and hurts you for hovering the crowd. Find The Needle's rake finds a needle one time in ten, and the scanner alarm lasts 9 seconds.

Eight seconds is a visible attempt. It sits in the same band as a short pulse or a short runner trip: you can watch this one finish. One miss in three is a fair tax while the list is one Project every 40 seconds. About one Project in three comes back, and the $6 is worth walking over.

It is a high tax once arrivals are 15 seconds, unless a Machine already covers the lines the Intern would miss. Those Machines can be legal before ship 12, because they only need the Intern plus 4 named ships. The Nodebuster guide buys spawn rate after it can survive 60 seconds. The Black Hole guide adds rocks after damage can break them. Reputation should not be the thing that outruns the Machines. Twelve ships is three months. If the Machines are still unbought, a 1-in-3 miss on an 8-second attempt becomes a queue, and the double fee starts to feel like homework.

The miss has to stop that Project on the Screen. A clearly wrong value is already the rule. It earns the $6 only if it reads like the scanner alarm: obvious, on the card, waiting. A near-miss contrast does not.

The clean month is the behavior spike Myco asked for. The person stops missing. That is a change in what they do, and it is allowed to be free, because the cost is the CTC that starts with it. A dirty month that still starts CTC is the pile reclaiming shards: you pay for a helper you did not correct.

### 3. Step the prices, and do not sell all three Machines in one breath

Digseum's early steps are about ×5 to ×10. A wall is several digs. Find The Needle's first spike costs about ×30 the first quiet rank. Black Hole's players found a buy on every round slightly too generous.

This table is almost all spikes, at flat prices. Colour, radius, and contrast are each $12. The only real multiple is Intern pay $10 to CTC $30, which is ×3, and one big Project pays $36. That single arrival clears the only cliff and leaves a hand fee over.

For a run that wants an hour or two, each Machine should be its own beat, a few minutes apart, with a cost that takes more than one ship once the first Machine exists. A ×3 to ×6 step against the current income does that. A flat $12 lets a player who has been banking $6 ships buy the whole system the moment the gates open, which collapses "corners, then colour, then contrast" into one shopping trip.

Quiet buys stay off the fee. They are the ranks between spikes: every ship or two, something small, emptying the purse the way a Black Hole round does, without handing over the next era. The itch comment is the caution. If every month affords three buys, add tension on the spike, not another percent on the hand fee.

A big Project can keep covering the next payroll. It should not also be the thing that buys the next two Machines, or the wall never lasts a month.

### 4. Treat the month as the round, and do not let the list hit zero

A month of 4 ships is the report screen. Early on, 4 arrivals at 40 seconds is about three minutes if the player is waiting on the timer. That is a sane round length next to Nodebuster's 60-second boss threshold and Black Hole's short sessions. Late, 15-second arrivals make a month about a minute of arrivals plus the fixes. Payroll coming due is the throw-out: who shipped, whose miss you fixed, whether the month was clean, what the $10 or the $30 took, what you can afford.

Between reports, the canvas needs a stall you can see. Gnorp uses the pile. This game can use the Intern's wrong value and a Machine that wrote a stale recipe. Both already return the Project to the Designer and pay the hand fee. They work as rhythm only if the write is visible while the list and the Screen share the window.

The list should not be empty in the first two minutes. "Usually one" plus a ship that takes less than 40 seconds is dead air. Digging fills that gap with more dirt. The matching fix here is a second Project already waiting when the first ships, so finishing one reveals the next, or a first Project whose named lines take most of the 40 seconds. The 15-second arrival is the crowding buy. It belongs with a Machine or a second Intern already in reach, which the gates allow, and it will flood a studio that delayed those buys. Kept Projects do not punish that delay by themselves. Nodebuster deletes the drops. Digging destroys the extra ore. Gnorp eats the tall pile. A kept list needs the payroll beat and the visible miss to do that job.

One Intern at 8 seconds, missing one attempt in three, can keep a 15-second arrival only while misses stay rare. A big Project, which names every line, is the boss of that month. It is already gated, already 1 in 5, and already the fee that covers CTC. That is the right spike. It wants to be unmistakable on the list when it lands, the way the boss ends the Nodebuster round.

### 5. Show the handoff on the Screen, and leave the process tier until the system already ships

Myco's reason for buildings was that a growing unit list had bloated a menu, and the bodies belonged on the field. The same rule fits this window.

- **UI grunt work.** One named line should resolve quickly once a second Project is waiting. The early, single Project can be the slow careful set, the way the first shovel clicks are small. The moment the list is deeper than one, a long popup per element is the scanner backing up the belt. Ship the hand fee and the Intern fee so they read as different numbers. The double pay is the lesson, and it has to be seen.
- **Design system and team.** A Machine locks the tool on that element and shows the stored value. An Intern's 8-second attempt writes onto the Screen you are looking at, right or wrong. Promote changes the person. It does not add a percent. Retune, at $12, is the judgment buy: you spend to copy a ship you actually finished, including one you fixed. That matches high-grading. The Machine should be able to be wrong, and the fix should be one Project, which is already the rule.
- **UX process.** Magic Archery removes the craft click at 1,500 gold, early, and a player can then leave it running through to level 168. That is a finished idle game. This game's win is a month that ships without the Designer opening a Project, with payroll covered and a big Project already shipped. That win is the same handoff, so it belongs at the end of the run, not at the first Intern. The Intern at ship 4 is the weak helper. The Machines are the system. The month you never open is the ending spike.

If a process tier comes back later, the references say it is one change of the job, after the current system already runs: Digging's drill, Black Hole's later objects, Gnorp's compression, Digseum's prestige once the retention upgrades exist. It starts weak, the way electric asteroids and the first jetpack start weak, and the player buys it into power. It is not a second currency, and it is not a fee multiplier wearing a new name. [0004](docs/adr/0004-studio-run.md) leaves that tier out. With it out, the hour has to come from lesson 3's price steps and lesson 4's month, not from a longer tree.

## What this says about the two open questions

Opening an element still feels like the job while Projects wait if two things stay true. The set itself stays short once the list is deeper than one. And the reason you open a Project, after the Intern exists, is a wrong value you can see before you open it.

An 8-second attempt is the right tempo to watch. A 1-in-3 miss is the right amount of fixing before a Machine exists, while arrivals are 40 seconds and the list is short. It is too much fixing after arrivals are 15 seconds, unless the Machines already took the lines.

## Sources

- Find The Needle demo constants: [hay price](https://findtheneedle.gamedumpwiki.com/page/configuration-hay/), [bigger handful](https://findtheneedle.gamedumpwiki.com/page/research-hand_carry/), [tool prices](https://findtheneedle.gamedumpwiki.com/page/configuration-price/), [scanner](https://findtheneedle.gamedumpwiki.com/page/configuration-scanner/), [rake](https://findtheneedle.gamedumpwiki.com/page/configuration-rake/)
- Digging A Hole: [afinira](https://w.atwiki.jp/afinira/pages/48.html), [TheGamer](https://www.thegamer.com/a-game-about-digging-a-hole-best-upgrades/)
- Gnorp Apologue: [Mechanics](https://gnorp.wiki.gg/wiki/Mechanics), [Housing](https://gnorp.wiki.gg/wiki/Housing), [Myco interview](https://www.gamedeveloper.com/design/interview-the-gnorp-apologue), [Gnorp News #1](https://gnorp.dev/news/1-A-New-Incremental/)
- Digseum: [speedrun forum](https://www.speedrun.com/Digseum/forums/3o1hf)
- Magic Archery: [LightUpSky](https://lightupsky.com/archives/lusgame01)
- Feeding A Black Hole: [itch.io](https://aarimous.itch.io/a-game-about-feeding-a-black-hole), [demo announcement](https://www.reddit.com/r/incremental_games/comments/1nqjxdu/steam_demo_released_a_game_about_feeding_a_black/), [beginner guide](https://gamerblurb.com/articles/a-game-about-feeding-a-black-hole-tips-and-beginner-guide)
- Nodebuster: [beginners guide](https://game-vault.net/wiki/Guide:Nodebuster_Beginners_Guide)
- Game Dev Tycoon: [development model](https://gamedevtycoon.fandom.com/wiki/Game_Development_Based_on_Experience/1.4.3), [bugs](https://gamedevtycoon.fandom.com/wiki/Bugs), [training](https://gamedevtycoon.fandom.com/wiki/Training), [engine](https://gdtwiki.miraheze.org/wiki/Engine), [1.7.8 guide](https://www.reddit.com/r/GameDevTycoon/comments/1oge8gy/simpleish_guide_for_178_expanded/)
- Game Dev Studio: [Steam](https://store.steampowered.com/app/773580/Game_Dev_Studio/)
- [[Service Business Incremental Games]]

## Related

- [[Agency Index]]
- [[Game Design Document]]
- [[Game Parameters]]
- [[Incremental Loop]]
- [[Product Design Incremental]]
- [[Service Business Incremental Games]]
