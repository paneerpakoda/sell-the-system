# Changelog

## 2026-10-25

### Documentation

Aligned the clock in the Game Design Document, Game Parameters, and CONTEXT with `play/src/engine.js`. The docs had a 45-second month and a 45-second on-time window. The engine's month is 240 seconds, four weeks of 60 seconds. On time is 300 seconds for the first Project and until an Intern is hired, 180 seconds after a hire with no Permanent, and 120 seconds while a Permanent is employed.

The arrival gap was `20 - min(acceptedShips, 12)` seconds, from 20 seconds down to 8 seconds. The engine waits 60 seconds until 3 ships have been accepted, then `45 - (acceptedShips - 3)` seconds, and never faster than 30 seconds. CONTEXT had the same 45-second month, 45-second on-time window, and 20-to-8-second gap, so those sentences were updated too.

Win rules, fees, and the description of how an attempt is judged were left as written.

### Tooling

Added `play/scripts/check-params.mjs`. It reads the month, week, deadline, and arrival values from `play/src/engine.js` and exits non-zero if the Game Design Document, Game Parameters, or CONTEXT still describe the old clock. That keeps the doc fix from drifting the next time the engine constants change.
