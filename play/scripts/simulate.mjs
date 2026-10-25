// Policy: hands-off when possible.
// Buy process steps when that is what a competent hands-off player would do.
// Do not change prices. Three process steps total $72 if the code says so.
// The price and the step count are read from engine.js. The run prints the real total.

import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const enginePath = path.join(root, "play/src/engine.js")
const source = fs.readFileSync(enginePath, "utf8")
const debug = process.env.SIM_DEBUG === "1"
const MAX_MONTHS = 36

const prices = readPrices(source)
const flags = readFlags(source)

function readPrices(text) {
  const info = text.match(/const PROCESS_INFO = \{([\s\S]*?)\n\}/)
  const buy = text.match(/function buyProcess\(key\) \{([\s\S]*?)\n\}/)
  const token = text.match(/function buyToken\(key\) \{([\s\S]*?)\n\}/)
  const language = text.match(/function buyLanguage\(industry\) \{([\s\S]*?)\n\}/)
  const vague = text.match(/const VAGUE_COLOUR = \{([^}]+)\}/)
  const vagueRadius = text.match(/function applyVagueLook\(project\) \{[\s\S]*?radius = (\d+)/)
  const radiusStep = text.match(/radiusStep:\s*(\d+)/)
  const internWage = text.match(/^const internWage = (\d+(?:\.\d+)?)/m)
  const permanentWage = text.match(/^const permanentWage = (\d+(?:\.\d+)?)/m)
  if (!info || !buy || !token || !language || !vague || !vagueRadius || !radiusStep || !internWage || !permanentWage) {
    throw new Error("Could not read prices from engine.js")
  }
  const keys = [...info[1].matchAll(/^\s+(\w+):/gm)].map((match) => match[1])
  const cost = Number(buy[1].match(/state\.money < (\d+)/)[1])
  const debit = Number(buy[1].match(/state\.money -= (\d+)/)[1])
  if (cost !== debit) throw new Error("buyProcess check and debit disagree")
  const colours = {}
  for (const pair of vague[1].matchAll(/(\w+):\s*"(\w+)"/g)) colours[pair[1]] = pair[2]
  return {
    processKeys: keys,
    process: cost,
    processTotal: keys.length * cost,
    token: Number(token[1].match(/state\.money < (\d+)/)[1]),
    language: Number(language[1].match(/state\.money < (\d+)/)[1]),
    permanentPay: Number(permanentWage[1]),
    internPay: Number(internWage[1]),
    vagueColours: colours,
    vagueRadius: Number(vagueRadius[1]),
    radiusStep: Number(radiusStep[1])
  }
}

function readFlags(text) {
  const hand = text.match(/^const WIN_HAND_TOUCH = (\S+)/m)
  const mix = text.match(/specialtyMix:\s*(true|false)/)
  const midgame = text.match(/midgameChoice:\s*(true|false)/)
  const specialty = text.match(/^\s+specialty:\s*([^,\n]+)/m)
  return {
    handTouch: hand ? hand[1] : null,
    specialtyMix: mix ? mix[1] : null,
    midgameChoice: midgame ? midgame[1] : null,
    specialty: specialty ? specialty[1].trim() : null
  }
}

function mulberry32(seed) {
  let state = seed >>> 0
  return function random() {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function installShims() {
  globalThis.performance = { now: () => 0 }
  globalThis.requestAnimationFrame = () => 0
  globalThis.cancelAnimationFrame = () => {}
  globalThis.setTimeout = () => 0
  globalThis.clearTimeout = () => {}
}

async function loadEngine(seed, nonce) {
  Math.random = mulberry32(seed)
  installShims()
  const href = pathToFileURL(enginePath).href + "?sim=" + nonce
  const api = await import(href)
  if (typeof api.advance !== "function" || typeof api.spawn !== "function") {
    throw new Error("engine.js must export advance(seconds) and spawn(reason) for a headless run")
  }
  return api
}

function lookFor(api, project) {
  if (project.size === "big" || project.standard === "exacting") {
    const lang = api.LANG[project.industry]
    const look = {}
    for (const id of api.ELEMENT_IDS) {
      look[id] = {
        colour: lang.colour[id],
        radius: id === "background" ? lang.radius + prices.radiusStep : lang.radius
      }
    }
    return look
  }
  const look = {}
  for (const id of api.ELEMENT_IDS) {
    look[id] = { colour: prices.vagueColours[id], radius: prices.vagueRadius }
  }
  return look
}

function matchesLook(screen, look, ids) {
  return ids.every((id) => {
    const el = screen.elements[id]
    if (el.colour !== look[id].colour || el.radius !== look[id].radius) return false
    return id === "background" || !el.ink
  })
}

function applyLook(screen, look, ids) {
  for (const id of ids) {
    const el = screen.elements[id]
    el.colour = look[id].colour
    el.radius = look[id].radius
    el.contrast = 21
    if (id !== "background") el.ink = null
  }
}

let pace = { edit: 0, screen: 0 }
const pacedScreens = new Set()

function spend(api, seconds) {
  if (!(seconds > 0) || api.state.break) return
  api.advance(seconds)
}

function paintScreen(api, project, screen, look) {
  // The intern claims the next screen as soon as an edit lands. Take it back
  // between elements, then write the finished look again so a half-step cannot
  // leave hot ink on a card. Screen time is spent after the look lands, so an
  // intern can copy a finished lead during that time.
  const screenKey = project.id + ":" + screen.id
  for (const id of api.ELEMENT_IDS) {
    if (screen.owner && screen.owner !== "player") api.takeScreen(project, screen.id)
    api.openScreen(project, screen.id)
    api.openProject(project, id)
    api.edited((_, item) => {
      item.colour = look[id].colour
      item.radius = look[id].radius
      item.contrast = 21
      if (id !== "background") item.ink = null
    })
    spend(api, pace.edit)
    if (api.state.break) return
  }
  if (screen.owner && screen.owner !== "player") api.takeScreen(project, screen.id)
  applyLook(screen, look, api.ELEMENT_IDS)
  if (project.hasUX) {
    api.openScreen(project, screen.id)
    const copy = api.frameCopy(project)
    screen.elements.title.hierarchy = "primary"
    screen.elements.save.hierarchy = "primary"
    screen.elements.cardA.hierarchy = "body"
    screen.elements.cardB.hierarchy = "body"
    screen.elements.title.copy = copy.title
    screen.elements.save.copy = copy.action
    if (project.flow.demand === "empty") project.flow.emptyFixed = true
    if (project.flow.demand === "error") project.flow.errorFixed = true
  }
  if (pace.screen > 0 && !pacedScreens.has(screenKey) && !api.state.break) {
    pacedScreens.add(screenKey)
    spend(api, pace.screen)
  }
}

function tokensOwned(state) {
  return state.tokens.colour && state.tokens.radius && state.tokens.contrast
}

function languageOwned(state) {
  return state.codified.fintech || state.codified.wellness || state.codified.editorial
}

function processOwned(state) {
  return prices.processKeys.every((key) => state.process[key])
}

function playerProject(state) {
  return state.queue.find((project) => project.claimedBy === "player") || null
}

function reserveFor(opts) {
  return (opts.buyProcess ? prices.processTotal : 0) + prices.permanentPay
}

function readyToPromote(state, opts) {
  const intern = state.staff.find((staff) => staff.role === "intern" && staff.clean >= 3)
  return !!(intern && languageOwned(state) && state.money >= reserveFor(opts))
}

function handsOff(api, opts) {
  if (api.stage() < 3) return false
  if (!opts.buyProcess) return true
  return processOwned(api.state)
}

function note(bag, message) {
  bag.trace.push(message)
  if (bag.trace.length > 80) bag.trace.shift()
  if (debug) console.log(message)
}

function staffLine(state) {
  if (!state.staff.length) return "none"
  return state.staff.map((staff) => staff.name + " " + staff.role + " $" + staff.pay + " clean " + staff.clean).join(", ")
}

function purchase(api, opts, bag) {
  const state = api.state
  let did = false
  if (!opts.noHire && state.handShips >= 3 && state.staff.length === 0 && state.money >= prices.internPay && !(opts.fireInterns && bag.fired)) {
    api.hire()
    note(bag, "hire " + staffLine(state) + " $" + state.money)
    did = true
  }
  if (state.everHired && state.accepted >= 3) {
    for (const key of ["colour", "radius", "contrast"]) {
      if (state.tokens[key]) continue
      if (state.money - prices.token < api.payrollDue()) continue
      api.buyToken(key)
      if (state.tokens[key]) {
        note(bag, "token " + key + " $" + state.money)
        did = true
      }
    }
  }
  if (!languageOwned(state)) {
    const industry = ["fintech", "wellness", "editorial"].find((id) => state.bigDone[id])
    if (industry && state.money - prices.language >= api.payrollDue()) {
      api.buyLanguage(industry)
      note(bag, "language " + industry + " $" + state.money)
      did = true
    }
  }
  const busy = playerProject(state)
  const intern = state.staff.find((staff) => staff.role === "intern" && staff.clean >= 3)
  if (!busy && intern && languageOwned(state) && state.money >= reserveFor(opts) && !(opts.deferPromote && !bag.payrollDone)) {
    api.promote(intern.id)
    note(bag, "promote $" + state.money + " stage " + api.stage())
    did = true
  }
  if (opts.buyProcess && api.stage() >= 3) {
    for (const key of prices.processKeys) {
      if (state.process[key]) continue
      if (state.money - prices.process < api.payrollDue()) continue
      api.buyProcess(key)
      if (state.process[key]) {
        note(bag, "process " + key + " $" + state.money)
        did = true
      }
    }
  }
  return did
}

function shipNow(api, project, bag) {
  const label = api.shipButtonLabel(project)
  if (api.shipControl(project).held === "true") return false
  const clean = api.state.staff.find((staff) => staff.role === "intern")
  api.handShip()
  note(bag, "ship " + label + " -> $" + api.state.money + " clean " + (clean ? clean.clean : "-"))
  bag.waits = 0
  return true
}

function finishByHand(api, project, bag) {
  const look = lookFor(api, project)
  for (let pass = 0; pass < 8; pass++) {
    for (const screen of project.screens) {
      if (screen.owner && screen.owner !== "player") api.takeScreen(project, screen.id)
      if (!matchesLook(screen, look, api.ELEMENT_IDS)) paintScreen(api, project, screen, look)
    }
    if (shipNow(api, project, bag)) return true
  }
  if (bag.heldClient !== project.client) {
    bag.heldClient = project.client
    const detail = project.screens.map((screen) => {
      api.openScreen(project, screen.id)
      const bits = api.ELEMENT_IDS.map((id) => {
        const el = screen.elements[id]
        const props = id === "background" ? ["colour", "radius"] : ["colour", "radius", "contrast"]
        const grades = props.map((prop) => prop[0] + ":" + api.grade(project, id, prop)).join("/")
        return id + "=" + el.colour + "/" + el.radius + "/ink=" + (el.ink || "-") + " " + grades
      }).join(" ")
      return screen.name + "{" + bits + "}"
    }).join(" ")
    note(bag, "held " + project.client + " " + project.size + " " + project.standard + " " + project.industry + " " + detail)
  }
  return false
}

function manual(api, opts, bag) {
  const state = api.state
  let project = playerProject(state)
  if (!project) {
    if (readyToPromote(state, opts) && !(opts.deferPromote && !bag.payrollDone)) return false
    project = state.queue.find((item) => !item.started && !item.flagged && !state.staff.some((staff) => staff.projectId === item.id))
    if (!project) return false
    api.startClient(project)
    note(bag, "start " + project.client + " " + project.size + " " + project.standard + " " + project.industry)
    return true
  }
  const intern = state.staff.find((staff) => staff.role === "intern")
  const look = lookFor(api, project)
  const safeToWait = intern && tokensOwned(state) && intern.clean < 3 && state.money >= api.payrollDue() + prices.internPay && state.monthLeft > 20
  if (!safeToWait) return finishByHand(api, project, bag)
  const missed = project.screens.find((screen) => screen.qc === "miss" || screen.qc === "returned")
  if (missed) {
    api.takeScreen(project, missed.id)
    paintScreen(api, project, missed, look)
    note(bag, "fix " + project.client + " " + missed.name)
    bag.waits = 0
    return true
  }
  const lead = project.screens[0]
  if (lead.owner && lead.owner !== "player") api.takeScreen(project, lead.id)
  if (!matchesLook(lead, look, api.ELEMENT_IDS)) {
    paintScreen(api, project, lead, look)
    note(bag, "paint lead " + project.client)
    bag.waits = 0
    return true
  }
  if (shipNow(api, project, bag)) return true
  bag.waits = (bag.waits || 0) + 1
  if (bag.waits >= 80) return finishByHand(api, project, bag)
  return false
}

function rememberPayroll(api, bag, opts) {
  const state = api.state
  if (bag.payrollDone || state.break) return
  const internOnStaff = state.staff.some((staff) => staff.role === "intern")
  if (opts.capturePayroll && !bag.fired && internOnStaff && state.monthLeft <= 1 && state.monthLeft > 0) {
    bag.window = {
      money: state.money,
      due: api.payrollDue(),
      month: state.monthIndex,
      staff: state.staff.map((staff) => ({ name: staff.name, role: staff.role, pay: staff.pay }))
    }
    if (opts.fireInterns) {
      for (const staff of state.staff.filter((person) => person.role === "intern")) api.fire(staff.id)
    }
    bag.fired = true
    bag.afterDecision = { money: state.money, due: api.payrollDue() }
    note(bag, (opts.fireInterns ? "fired" : "kept") + " at monthLeft " + state.monthLeft + " due " + bag.afterDecision.due)
  }
  if (state.monthLeft <= 0.25 && state.monthLeft > 0) {
    bag.beforeEnd = {
      money: state.money,
      due: api.payrollDue(),
      month: state.monthIndex,
      staff: state.staff.map((staff) => staff.name + " " + staff.role + " $" + staff.pay).join(", ")
    }
  }
}

let nonceSerial = 0

function finishPayrollMonth(api, bag, opts) {
  let guard = 0
  while (!api.state.break && guard < 4000) {
    guard++
    while (api.state.notices.length) api.dismissNotice()
    const left = api.state.monthLeft
    if (!bag.fired && left <= 1 && left > 0 && api.state.staff.some((staff) => staff.role === "intern")) {
      bag.window = {
        money: api.state.money,
        due: api.payrollDue(),
        monthLeft: Math.round(left * 1000) / 1000,
        month: api.state.monthIndex,
        staff: api.state.staff.map((staff) => staff.name + " " + staff.role + " $" + staff.pay).join(", ")
      }
      if (opts.fireInterns) {
        for (const staff of api.state.staff.filter((person) => person.role === "intern")) api.fire(staff.id)
      }
      bag.fired = true
    }
    if (api.state.break) break
    const stride = !bag.fired && left > 1 ? Math.max(0.05, Math.min(1, left - 1)) : 0.25
    api.advance(stride)
  }
  if (api.state.break) {
    bag.payroll = {
      note: api.state.break.note,
      won: api.state.break.won,
      money: api.state.money,
      window: bag.window || null
    }
    bag.payrollDone = true
  }
}

async function runGame(seed, opts) {
  const nonce = opts.name + "-" + seed + "-" + (++nonceSerial)
  pace = { edit: Number(opts.editSeconds) || 0, screen: Number(opts.screenSeconds) || 0 }
  pacedScreens.clear()
  const api = await loadEngine(seed, nonce)
  const bag = { trace: [], wins: 0, fired: false, payrollDone: false, waits: 0 }
  api.nameStudio("Studio")
  api.start()
  let steps = 0
  const maxSteps = 90000
  while (steps < maxSteps && api.state.monthIndex <= MAX_MONTHS) {
    steps++
    const state = api.state
    if (state.break) {
      if (bag.fired && !bag.payrollDone) {
        bag.payroll = {
          note: state.break.note,
          won: state.break.won,
          money: state.money,
          before: bag.beforeEnd || null,
          window: bag.window || null
        }
        bag.payrollDone = true
        if (opts.stopOnPayroll) break
      }
      if (state.break.won && bag.winMonth == null) {
        bag.winMonth = state.monthIndex
        bag.winNote = state.break.note
        note(bag, "WIN month " + state.monthIndex + " " + state.break.note)
        if (opts.stopOnWin) break
      }
      if (state.monthIndex >= MAX_MONTHS) break
      note(bag, "month " + state.monthIndex + " end $" + state.money + " " + state.break.note + " | " + staffLine(state))
      if (opts.untilMonth && state.monthIndex >= opts.untilMonth) break
      api.continueMonth()
      continue
    }
    if (bag.qualifiedAt == null && api.stage() >= 3) {
      const spent = (state.monthIndex - 1) * 240 + (240 - state.monthLeft)
      bag.qualifiedAt = Math.round(spent)
    }
    rememberPayroll(api, bag, opts)
    purchase(api, opts, bag)
    if (opts.decideWell && api.gameFlags.midgameChoice && !state.midgame && state.everHired && state.accepted >= 3) {
      api.chooseMidgame("chase")
      note(bag, "midgame chase $" + state.money)
    }
    while (state.notices.length) api.dismissNotice()
    if (opts.capturePayroll && state.staff.some((staff) => staff.role === "intern") && !bag.payrollDone) {
      finishPayrollMonth(api, bag, opts)
      break
    }
    if (!handsOff(api, opts) && manual(api, opts, bag)) {
      if (opts.actionSeconds) spend(api, opts.actionSeconds)
      continue
    }
    const stride = state.monthLeft <= 2 ? 0.25 : 1
    api.advance(stride)
  }
  return {
    seed,
    winMonth: bag.winMonth ?? null,
    winNote: bag.winNote || "",
    payroll: bag.payroll || null,
    month: api.state.monthIndex,
    money: api.state.money,
    stage: api.stage(),
    accepted: api.state.accepted,
    handShips: api.state.handShips,
    wins: api.state.wins,
    staff: staffLine(api.state),
    process: prices.processKeys.filter((key) => api.state.process[key]).join(",") || "none",
    qualified: api.state.month.qualified,
    qualifiedAt: bag.qualifiedAt ?? null,
    trace: bag.trace
  }
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (!sorted.length) return null
  if (sorted.length % 2) return sorted[mid]
  return (sorted[mid - 1] + sorted[mid]) / 2
}

function summarise(label, results) {
  const wins = results.filter((result) => result.winMonth != null)
  console.log("")
  console.log(label)
  for (const result of results) {
    if (result.winMonth != null) {
      console.log("  seed " + result.seed + ": win month " + result.winMonth + " (" + result.winNote + ")")
    } else {
      console.log("  seed " + result.seed + ": no win by month " + result.month + " stage " + result.stage + " $" + result.money + " accepted " + result.accepted + " process " + result.process + " staff " + result.staff)
    }
  }
  const rate = wins.length + "/" + results.length
  console.log("  win rate: " + rate)
  console.log("  median win month: " + (wins.length ? median(wins.map((result) => result.winMonth)) : "n/a"))
  return { label, wins: wins.length, runs: results.length, median: wins.length ? median(wins.map((result) => result.winMonth)) : null }
}

function payrollPaid(result) {
  if (!result.payroll) return null
  const match = result.payroll.note.match(/Payroll paid \$(\d+(?:\.\d+)?)/)
  if (match) return Number(match[1])
  if (/No payroll due/.test(result.payroll.note)) return 0
  return result.payroll.note
}

function paceLine(label, results) {
  const wins = results.filter((result) => result.winMonth != null)
  const months = wins.map((result) => result.winMonth)
  const qualify = results.map((result) => result.qualifiedAt).filter((value) => value != null)
  const minute = qualify.length ? Math.round(median(qualify) / 60 * 10) / 10 : null
  const monthCount = {}
  months.forEach((month) => { monthCount[month] = (monthCount[month] || 0) + 1 })
  const peak = Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0]
  console.log(label + ": wins " + wins.length + "/" + results.length + (peak ? " month " + peak[0] + " " + peak[1] + "/" + results.length : "") + " median month " + (months.length ? median(months) : "n/a") + " stage 3 median " + (minute == null ? "n/a" : minute + " min"))
  const lost = results.filter((result) => result.winMonth == null)
  if (lost.length) console.log("  lost " + lost.map((result) => result.seed + " mo" + result.month + " $" + result.money + " st" + result.stage + " " + result.process).join(" | "))
}

async function paceTable() {
  const limit = Number(process.env.SIM_PACE_LIMIT || 200)
  const seeds = []
  for (let seed = 0; seed < limit; seed++) seeds.push(seed)
  const allModes = [
    ["instant", 0, 0],
    ["4s/edit", 4, 0],
    ["100s/screen", 0, 100]
  ]
  const picked = process.env.SIM_PACE_MODE
  const modes = picked ? allModes.filter((mode) => mode[0] === picked) : allModes
  for (const [name, editSeconds, screenSeconds] of modes) {
    const started = Date.now()
    const results = []
    for (const seed of seeds) {
      results.push(await runGame(seed, {
        name: "pace-" + name,
        buyProcess: true,
        stopOnWin: true,
        editSeconds,
        screenSeconds,
        untilMonth: process.env.SIM_UNTIL ? Number(process.env.SIM_UNTIL) : 0
      }))
    }
    paceLine(name, results)
    console.log("  " + ((Date.now() - started) / 1000).toFixed(1) + "s")
  }
}

async function payback() {
  const limit = Number(process.env.SIM_PACE_LIMIT || 12)
  const until = Number(process.env.SIM_UNTIL || 3)
  const modes = [
    ["instant", 0, 0],
    ["4s/edit", 4, 0],
    ["100s/screen", 0, 100]
  ]
  const picked = process.env.SIM_PACE_MODE
  const list = picked ? modes.filter((mode) => mode[0] === picked) : modes
  for (const [name, editSeconds, screenSeconds] of list) {
    let sum = 0
    for (let seed = 0; seed < limit; seed++) {
      const hired = await runGame(seed, { name: "pb-h-" + name, buyProcess: false, untilMonth: until, editSeconds, screenSeconds, actionSeconds: name === "instant" ? 1 : 0 })
      const solo = await runGame(seed, { name: "pb-s-" + name, buyProcess: false, noHire: true, untilMonth: until, editSeconds, screenSeconds, actionSeconds: name === "instant" ? 1 : 0 })
      const delta = hired.money - solo.money
      sum += delta
      console.log(name + " seed " + seed + " hire $" + hired.money + " ships " + hired.accepted + " solo $" + solo.money + " ships " + solo.accepted + " delta " + delta.toFixed(2) + " | " + hired.staff)
    }
    console.log(name + " mean delta $" + (sum / limit).toFixed(2) + " at month " + until)
  }
}

async function main() {
  if (process.env.SIM_PAYBACK === "1") {
    await payback()
    return
  }
  if (process.env.SIM_PACE === "1") {
    await paceTable()
    return
  }
  const digest = createHash("sha256").update(source).digest("hex").slice(0, 12)
  const asked = process.env.SIM_SEEDS
  const seeds = asked ? asked.split(",").map((value) => Number(value)) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const only = process.env.SIM_ONLY || "all"
  console.log("engine sha256 " + digest)
  console.log("process steps: " + prices.processKeys.join(", ") + " × $" + prices.process + " = $" + prices.processTotal)
  console.log("WIN_HAND_TOUCH = " + (flags.handTouch || "not defined") + " (left on the default)")
  console.log("gameFlags.specialtyMix = " + (flags.specialtyMix || "not defined") + " (left off)")
  console.log("gameFlags.midgameChoice = " + (flags.midgameChoice || "not defined") + " (left on)")
  console.log("state.specialty = " + (flags.specialty || "not defined") + " (left unset)")
  console.log("seeds: " + seeds.join(" "))
  console.log("win check: month started qualified, the mid-game choice is made, its win is met, handTouch is false, payroll fully paid")

  if (only === "all" || only === "win") {
    const competent = []
    for (const seed of seeds) competent.push(await runGame(seed, { name: "hands", buyProcess: true, stopOnWin: true }))
    const hands = summarise("competent hands-off", competent)
    const decided = []
    for (const seed of seeds) decided.push(await runGame(seed, { name: "choice", buyProcess: true, stopOnWin: true, decideWell: true }))
    const good = summarise("chooses big clients", decided)
    const handsRate = hands.wins / hands.runs
    const goodRate = good.wins / good.runs
    if (!(handsRate < 0.6)) throw new Error("hands-off won " + hands.wins + "/" + hands.runs + ", expected under 60%")
    if (!(goodRate > 0.9)) throw new Error("good choice won " + good.wins + "/" + good.runs + ", expected above 90%")
    console.log("midgame rates: hands-off " + hands.wins + "/" + hands.runs + ", chooses well " + good.wins + "/" + good.runs)
  }
  if (only === "all" || only === "noprocess") {
    const blocked = []
    for (const seed of seeds) blocked.push(await runGame(seed, { name: "noprocess", buyProcess: false, stopOnWin: true }))
    summarise("no process steps", blocked)
  }
  if (only === "all" || only === "payroll") {
    const kept = []
    const fired = []
    for (const seed of seeds) {
      kept.push(await runGame(seed, { name: "keep", buyProcess: true, deferPromote: true, capturePayroll: true, stopOnPayroll: true, fireInterns: false }))
      fired.push(await runGame(seed, { name: "fire", buyProcess: true, deferPromote: true, capturePayroll: true, stopOnPayroll: true, fireInterns: true }))
    }
    console.log("")
    console.log("fire interns about 1s before month end, versus not firing")
    for (let i = 0; i < kept.length; i++) {
      const stay = kept[i]
      const cut = fired[i]
      const stayPaid = payrollPaid(stay)
      const cutPaid = payrollPaid(cut)
      const stayFrom = stay.payroll && stay.payroll.window ? stay.payroll.window.money : "?"
      const cutFrom = cut.payroll && cut.payroll.window ? cut.payroll.window.money : "?"
      console.log("  seed " + stay.seed + ": kept payroll " + stayPaid + " (" + (stay.payroll ? stay.payroll.note : "none") + ", $" + stayFrom + " -> $" + (stay.payroll ? stay.payroll.money : "?") + "); fired payroll " + cutPaid + " (" + (cut.payroll ? cut.payroll.note : "none") + ", $" + cutFrom + " -> $" + (cut.payroll ? cut.payroll.money : "?") + ")")
    }
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
