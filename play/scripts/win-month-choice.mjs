// Specialty versus generalist, flag forced on only in this process.
// Run from anywhere: node play/scripts/win-month-choice.mjs
//
// Policy, the same for both arms:
// - Name the studio. Dismiss notes as they appear. Continue the month pause.
// - Keep cash at or above the month-end payroll before a purchase. Do not buy
//   tokens or tools. A codified language is what makes a client safe to ship.
// - Codify the first language a big client unlocks ($15), and no later one.
//   Hire one intern after 3 hand ships, that language, and $24 on hand.
//   Promote at 3 clean screens. Buy the three process steps ($24) only when the
//   purchase still leaves month-end payroll plus $36.
// - Before a language is codified, press Ship about every 8 seconds. After that,
//   start a covered client, paint only its lead, and press Ship once the intern
//   has finished the other screens. Press Ship on an uncovered or flagged client
//   about every 50 seconds so the queue can move. Once a Permanent is employed,
//   press Ship only to clear a client the player still holds or a flagged client.
// - Stop touching in the last 8 seconds of a month once a Permanent is employed,
//   every process step is owned, one language is codified, cash covers month-end
//   payroll plus $36, and nothing is held or flagged. If that Permanent is fired,
//   start touching again. The specialist receives only the chosen industry, so
//   the language covers every arrival. The generalist still receives all three.
// - Time advances 1 second per act, in the browser's 0.25s ticks.
// - Stop at the first win, or at month 42.
//
// The specialty arm sets specialty to fintech, so every arrival is fintech.
// The generalist arm sets no specialty, so arrivals stay the uniform three-industry mix.
// gameFlags.specialtyMix is false in the game. This script sets it true after import.
// Both arms share a seed list and the same mulberry32 stand-in for Math.random.

import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const engineFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/engine.js")
const SEEDS = process.argv[2] && process.argv[2] !== "trace" ? [Number(process.argv[2])] : [11, 23, 37, 41, 53, 67, 71, 83, 97]
const MONTH_CAP = 42
const SETUP_GAP = 8
const COLLECT_GAP = 50
const VAGUE = { background: "paper", title: "ink", cardA: "white", cardB: "white", save: "ink" }

let nonce = 0
async function load() {
  nonce += 1
  return import(pathToFileURL(engineFile).href + "?win=" + nonce)
}

function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function median(values) {
  const nums = values.filter((value) => typeof value === "number").sort((a, b) => a - b)
  if (!nums.length) return null
  const mid = Math.floor(nums.length / 2)
  if (nums.length % 2) return nums[mid]
  return (nums[mid - 1] + nums[mid]) / 2
}

function paintScreen(engine, project, screen) {
  const { LANG, ELEMENT_IDS, frameCopy, state } = engine
  const lang = LANG[project.industry]
  const strict = project.size === "big" || state.codified[project.industry]
  for (const id of ELEMENT_IDS) {
    const el = screen.elements[id]
    if (strict) {
      el.colour = lang.colour[id]
      el.radius = id === "background" ? lang.radius + 4 : lang.radius
    } else {
      el.colour = VAGUE[id]
      el.radius = id === "background" ? 20 : 16
    }
    el.contrast = 21
    el.ink = null
    if (id === "title" || id === "save") el.hierarchy = "primary"
    if (id === "cardA" || id === "cardB") el.hierarchy = "body"
  }
  const previous = project.elements
  project.elements = screen.elements
  const copy = frameCopy(project)
  screen.elements.title.copy = copy.title
  screen.elements.save.copy = copy.action
  project.elements = previous
}

function paint(engine, project, leadOnly) {
  const screens = project.screens || []
  const list = leadOnly ? screens.slice(0, 1) : screens
  list.forEach((screen) => paintScreen(engine, project, screen))
  project.flow.emptyFixed = true
  project.flow.errorFixed = true
  if (project.flow.demand) project.flow.showing = project.flow.demand
}

function afford(engine, cost) {
  return engine.state.money - cost >= engine.payrollDue()
}

function cushion(engine, cost) {
  return engine.state.money - cost >= engine.state.payroll.atEnd + 36
}

function processReady(state) {
  return state.process.research && state.process.wire && state.process.test
}

function anyCodified(state) {
  return Object.values(state.codified).some(Boolean)
}

function requiredIndustries(engine) {
  if (engine.gameFlags.specialtyMix && engine.state.specialty) return [engine.state.specialty]
  return ["fintech", "wellness", "editorial"]
}

function covered(state, project) {
  return !!state.codified[project.industry]
}

function handsOff(engine) {
  const { state } = engine
  if (!state.staff.some((staff) => staff.role === "permanent")) return false
  if (!processReady(state)) return false
  if (!anyCodified(state)) return false
  if (state.money < state.payroll.atEnd + 36) return false
  if (state.queue.some((item) => item.claimedBy === "player" || item.flagged)) return false
  return true
}

function buy(engine) {
  const { state, buyLanguage, buyProcess, hire, promote } = engine
  const intern = state.staff.find((staff) => staff.role === "intern")
  if (intern && intern.clean >= 3) promote(intern.id)
  if (!anyCodified(state)) {
    for (const id of requiredIndustries(engine)) {
      if (!state.bigDone[id] || !afford(engine, 15)) continue
      buyLanguage(id)
      break
    }
  }
  if (state.handShips >= 3 && !state.staff.length && anyCodified(state) && state.money >= 24 && !state.nextHireUnpayable) hire()
  if (state.staff.some((staff) => staff.role === "permanent") && anyCodified(state)) {
    for (const key of ["research", "wire", "test"]) {
      if (!state.process[key] && cushion(engine, 24)) {
        buyProcess(key)
        break
      }
    }
  }
}

function shipNow(engine, project) {
  paint(engine, project, false)
  engine.state.openId = project.id
  const id = project.id
  engine.handShip()
  return !engine.state.queue.some((item) => item.id === id)
}

function restDone(project) {
  const screens = project.screens || []
  return screens.length > 1 && screens.slice(1).every((screen) => screen.qc === "passed")
}

function work(engine, clock) {
  const { state } = engine
  if (!state.queue.length || handsOff(engine)) return
  const intern = state.staff.find((staff) => staff.role === "intern")
  const permanent = state.staff.some((staff) => staff.role === "permanent")
  if (state.handShips < 3 || !anyCodified(state)) {
    if (clock.now - clock.lastShip < SETUP_GAP) return
    if (shipNow(engine, state.queue[0])) clock.lastShip = clock.now
    return
  }
  if (!permanent && intern) {
    for (const item of state.queue) {
      if (!covered(state, item)) continue
      if (!item.started) engine.startClient(item)
      if (item.flagged) item.flagged = false
      if (item.leadPainted) continue
      paint(engine, item, true)
      item.leadPainted = true
    }
    const ready = state.queue.find((item) => covered(state, item) && restDone(item))
    if (ready && clock.now - clock.lastShip >= 2) {
      if (shipNow(engine, ready)) clock.lastShip = clock.now
      return
    }
    const other = state.queue.find((item) => !covered(state, item) || item.flagged)
    if (other && clock.now - clock.lastShip >= COLLECT_GAP) {
      if (shipNow(engine, other)) clock.lastShip = clock.now
    }
    return
  }
  if (!permanent) {
    if (clock.now - clock.lastShip < SETUP_GAP) return
    if (shipNow(engine, state.queue[0])) clock.lastShip = clock.now
    return
  }
  const claimed = state.queue.find((item) => item.claimedBy === "player" || item.flagged)
  if (!claimed || clock.now - clock.lastShip < 2) return
  if (shipNow(engine, claimed)) clock.lastShip = clock.now
}

async function play(seed, specialty) {
  const engine = await load()
  const random = Math.random
  Math.random = mulberry32(seed)
  try {
    engine.gameFlags.specialtyMix = true
    engine.setSpecialty(specialty)
    engine.nameStudio(specialty || "General")
    if (!engine.state.queue.length) engine.spawn("start")
    const clock = { lastShip: -100, now: 0 }
    let stopped = false
    let steps = 0
    const limit = MONTH_CAP * 240 + 50
    while (steps < limit) {
      steps += 1
      clock.now = (engine.state.monthIndex - 1) * 240 + (240 - engine.state.monthLeft)
      while (engine.state.notices.length) engine.dismissNotice()
      if (engine.state.break) {
        const won = engine.state.break.won
        const month = engine.state.monthIndex
        if (process.argv.includes("trace")) {
          const staff = engine.state.staff.map((person) => person.role + ":" + person.clean).join(",") || "none"
          console.log([
            specialty || "general",
            "month", month,
            won ? "WIN" : engine.state.break.note,
            "money", engine.state.money,
            "ships", engine.state.accepted,
            "hands", engine.state.handShips,
            "staff", staff,
            "codified", JSON.stringify(engine.state.codified),
            "process", JSON.stringify(engine.state.process),
            "queue", engine.state.queue.length
          ].join(" "))
        }
        if (won) return month
        engine.continueMonth()
        if (engine.state.monthIndex > MONTH_CAP) return null
        continue
      }
      const employed = engine.state.staff.some((staff) => staff.role === "permanent")
      if (stopped && !employed) stopped = false
      if (!stopped && handsOff(engine) && engine.state.monthLeft < 8) stopped = true
      if (!stopped) {
        buy(engine)
        work(engine, clock)
      }
      while (engine.state.notices.length) engine.dismissNotice()
      if (engine.state.break) continue
      engine.advance(1)
    }
    return null
  } finally {
    Math.random = random
  }
}

function line(label, months) {
  const shown = months.map((month) => (month == null ? "none" : String(month))).join(", ")
  console.log(label + " months: " + shown)
  console.log(label + " median: " + median(months))
  console.log(label + " wins: " + months.filter((month) => month != null).length + "/" + months.length)
}

const specialist = []
const generalist = []
for (const seed of SEEDS) {
  const started = Date.now()
  const specialMonth = await play(seed, "fintech")
  const generalMonth = await play(seed, null)
  specialist.push(specialMonth)
  generalist.push(generalMonth)
  console.log("seed " + seed + " specialist " + specialMonth + " generalist " + generalMonth + " (" + ((Date.now() - started) / 1000).toFixed(1) + "s)")
}

line("specialist", specialist)
line("generalist", generalist)
const specialMedian = median(specialist)
const generalMedian = median(generalist)
if (specialMedian == null || generalMedian == null) {
  console.error("win-month-choice: a median is missing")
  process.exit(1)
}
const gap = Math.abs(specialMedian - generalMedian)
console.log("median gap: " + gap + " month" + (gap === 1 ? "" : "s"))
if (gap < 1) {
  console.error("win-month-choice: medians differ by less than one month")
  process.exit(1)
}
console.log("win-month-choice: ok")
