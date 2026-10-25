// Headless checks for play/src/engine.js.
// Run from anywhere: node play/scripts/engine-correctness.mjs
//
// Each case imports a fresh engine. This script calls nameStudio, spawn,
// advance, and state. advance(seconds) runs the same tick as the browser.
// spawn(reason) is the same arrival used in play.

import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const engineFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/engine.js")
let nonce = 0

async function load() {
  nonce += 1
  return import(pathToFileURL(engineFile).href + "?n=" + nonce)
}

const failures = []
const deferred = []

async function check(name, fn) {
  try {
    await fn()
    console.log("ok  " + name)
  } catch (error) {
    failures.push(name)
    console.error("FAIL " + name)
    console.error(error && error.stack ? error.stack : error)
  }
}

async function defer(track, name, fn) {
  try {
    await fn()
    console.log("ok  " + name)
  } catch (error) {
    deferred.push(track + ": " + name + " — passes after integration")
    console.log("defer " + name + " — passes after integration")
    void error
  }
}

function permanent(id, name) {
  return {
    id,
    name,
    role: "permanent",
    pay: 30,
    miss: 0.2,
    clean: 3,
    projectId: null,
    screenId: null,
    workLeft: 0,
    startedAt: 0
  }
}

await check("covered contrast includes Background and a Permanent ships", async () => {
  const { state, nameStudio, spawn, advance } = await load()
  nameStudio("Contrast")
  state.tokens.colour = true
  state.tokens.radius = true
  state.tokens.contrast = true
  state.staff = [permanent(1, "Ada")]
  state.nextStaffId = 2
  state.money = 500
  state.monthLeft = 10000
  // Clients 1–3 are the opening ramp. Contrast on Background is a later client.
  state.projectSeq = 3
  const project = spawn("start")
  assert.equal(project.id, 4)
  // Isolate this case from the open-project claim rule.
  state.openId = null
  let shippedAt = null
  for (let second = 1; second <= 60; second += 1) {
    advance(1)
    if (state.accepted >= 1) {
      shippedAt = second
      break
    }
  }
  assert.ok(shippedAt != null, "permanent did not ship within 60s (project " + project.client + ")")
  assert.ok(shippedAt <= 30, "expected a ship in well under a minute, took " + shippedAt + "s")
  console.log("    shipped in " + shippedAt + "s")
})

function intern(id, name, pay = 10) {
  return {
    id,
    name,
    role: "intern",
    pay,
    miss: 0.2,
    clean: 0,
    projectId: null,
    screenId: null,
    workLeft: 0,
    startedAt: 0
  }
}

await check("month pause names the people and the amounts", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("Pause")
  state.staff = [intern(1, "Ada"), permanent(2, "Ben")]
  state.nextStaffId = 3
  state.money = 0
  state.monthLeft = 0.2
  advance(1)
  assert.ok(state.break, "pause card should be open")
  assert.match(state.break.note, /Ada \(\$10\)/)
  assert.match(state.break.note, /Ben \(\$30\)/)
  assert.doesNotMatch(state.break.note, /object Object/)
  assert.equal(state.money, 0)
})

await check("a paid month lists who was paid", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("Paid")
  state.staff = [intern(1, "Ada")]
  state.nextStaffId = 2
  state.money = 24
  state.monthLeft = 0.2
  advance(1)
  assert.ok(state.break)
  assert.match(state.break.note, /Payroll paid \$10: Ada \(\$10\)/)
  assert.equal(state.money, 14)
  assert.doesNotMatch(state.break.note, /object Object/)
})

const VAGUE = { background: "paper", title: "ink", cardA: "white", cardB: "white", save: "ink" }

function paintLoose(project) {
  for (const screen of project.screens || []) {
    for (const id of Object.keys(VAGUE)) {
      const el = screen.elements[id]
      el.colour = VAGUE[id]
      el.radius = id === "background" ? 20 : 16
      el.contrast = 21
      el.ink = null
    }
  }
}

await check("Ship is disabled when the press would not ship", async () => {
  const { state, nameStudio, spawn, advance, startClient } = await load()
  nameStudio("Ship")
  const project = spawn("start")
  advance(0.05)
  assert.equal(state.shipDisabled, true)
  assert.equal(state.canShip, false)
  assert.equal(state.shipFee, null)
  startClient(project)
  paintLoose(project)
  advance(0.05)
  assert.equal(state.canShip, true)
  assert.equal(state.shipDisabled, false)
  assert.equal(typeof state.shipFee, "number")
  assert.ok(state.shipFee > 0)
  state.monthLeft = 0.05
  advance(1)
  assert.ok(state.break)
  assert.equal(state.shipDisabled, true)
  assert.equal(state.canShip, false)
  assert.equal(state.shipFee, null)
})

await check("bought process steps apply to projects already queued", async () => {
  const { state, nameStudio, spawn, buyProcess, frameCopy } = await load()
  nameStudio("Process")
  state.staff = [permanent(1, "Ada")]
  state.codified.fintech = true
  state.money = 80
  state.nextStaffId = 2
  const project = spawn("start")
  assert.equal(project.hasUX, true)
  assert.equal(project.elements.title.copy, "Stuff")
  const before = state.money
  buyProcess("research")
  buyProcess("wire")
  buyProcess("test")
  assert.equal(state.money, before - 72)
  assert.equal(state.process.research && state.process.wire && state.process.test, true)
  for (const screen of project.screens) {
    const previous = project.elements
    project.elements = screen.elements
    const wanted = frameCopy(project)
    assert.equal(screen.elements.title.copy, wanted.title, screen.name + " title")
    assert.equal(screen.elements.save.copy, wanted.action, screen.name + " save")
    assert.equal(screen.elements.title.hierarchy, "primary", screen.name)
    assert.equal(screen.elements.save.hierarchy, "primary", screen.name)
    assert.equal(screen.elements.cardA.hierarchy, "body", screen.name)
    assert.equal(screen.elements.cardB.hierarchy, "body", screen.name)
    project.elements = previous
  }
  if (project.flow.demand === "empty") assert.equal(project.flow.emptyFixed, true)
  else assert.equal(project.flow.errorFixed, true)
})

await check("a big screen that is not best practice pays the short fee", async () => {
  const { state, nameStudio, spawn, feeFor, bigClientOffer } = await load()
  nameStudio("Fee")
  const project = spawn("start")
  paintLoose(project)
  project.size = "big"
  project.standard = "exacting"
  state.event = { projectId: project.id, client: project.client }
  project.size = "small"
  // A clean ship pays $10, the Intern's wage, before Stage 3.
  assert.equal(feeFor(project), 10)
  project.size = "big"
  assert.equal(feeFor(project), 3)
  assert.equal(bigClientOffer().short, 3)
  assert.equal(bigClientOffer().decline, 6)
  state.staff = [permanent(1, "Ada")]
  state.codified.editorial = true
  assert.equal(feeFor(project), 10)
  assert.equal(bigClientOffer().short, 10)
})

function close(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 0.001, (label || "money") + " " + actual + " != " + expected)
}

await check("payroll fields exist before anyone is hired", async () => {
  const { state, nameStudio } = await load()
  nameStudio("Empty")
  assert.equal(state.payroll.due, 0)
  assert.deepEqual(state.payroll.lines, [])
  assert.equal(state.nextHireCost, 10)
  assert.equal(state.payroll.nextHire, 10)
  assert.equal(state.nextHireUnpayable, false)
  assert.equal(state.payroll.reason, "")
})

await check("a full-month employee pays the full wage", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("FullWage")
  state.staff = [intern(1, "Ada")]
  state.nextStaffId = 2
  state.money = 50
  state.monthLeft = 0.2
  advance(1)
  assert.ok(state.break)
  close(state.money, 40)
  assert.match(state.break.note, /Payroll paid \$10: Ada \(\$10\)/)
})

await check("a hire midway through the month pays half", async () => {
  const { state, nameStudio, hire, advance, dismissNotice, payrollDue } = await load()
  nameStudio("Half")
  state.handShips = 3
  state.money = 100
  state.monthLeft = 120
  hire()
  while (state.notices.length) dismissNotice()
  assert.equal(state.staff[0].startedAt, 120)
  close(payrollDue(), 5)
  close(state.payroll.due, 0)
  close(state.nextHireCost, 5)
  close(state.payroll.nextHire, 5)
  state.monthLeft = 0.2
  advance(1)
  assert.ok(state.break)
  close(state.money, 95)
  assert.match(state.break.note, /Ada \(\$5\)/)
})

await check("firing just before month end keeps pay already worked", async () => {
  const { state, nameStudio, hire, fire, promote, payrollDue, advance, dismissNotice } = await load()
  nameStudio("Exploit")
  state.handShips = 3
  state.money = 200
  state.monthLeft = 240
  hire()
  state.staff[0].clean = 3
  promote(state.staff[0].id)
  hire()
  while (state.notices.length) dismissNotice()
  const internId = state.staff.find((staff) => staff.role === "intern").id
  close(payrollDue(), 40)
  state.monthLeft = 1
  nameStudio("Exploit")
  const accrued = state.payroll.due
  assert.ok(accrued > 39 && accrued < 40, "accrued " + accrued)
  fire(internId)
  close(state.payroll.due, accrued)
  const end = payrollDue()
  assert.ok(end > 39 && end < 40, "month-end after fire " + end)
  assert.notEqual(end, 30)
  state.money = 200
  state.monthLeft = 0.2
  advance(1)
  while (state.notices.length) dismissNotice()
  assert.ok(state.break)
  close(state.money, 200 - end)
  assert.match(state.break.note, /Ada/)
  assert.match(state.break.note, /Ben/)
  assert.doesNotMatch(state.break.note, /object Object/)
})

await check("the next hire can be flagged unpayable", async () => {
  const { state, nameStudio } = await load()
  nameStudio("Warn")
  state.money = 12
  state.staff = [permanent(1, "Ada")]
  state.monthLeft = 240
  nameStudio("Warn")
  close(state.payroll.atEnd, 30)
  close(state.nextHireCost, 10)
  assert.equal(state.nextHireUnpayable, true)
  assert.equal(state.payroll.nextHireUnpayable, true)
  assert.match(state.payroll.reason, /\$10/)
  assert.match(state.payroll.reason, /\$40/)
  assert.match(state.payroll.reason, /\$12/)
  state.money = 40
  nameStudio("Warn")
  assert.equal(state.nextHireUnpayable, false)
  assert.equal(state.payroll.reason, "")
})

await check("the strict hand rule is the default and a value edit blocks the win", async () => {
  const clean = await load()
  assert.equal(clean.WIN_HAND_TOUCH, "strict")
  clean.nameStudio("CleanWin")
  clean.state.money = 100
  clean.state.month.qualified = true
  clean.state.month.bigShipped = true
  clean.state.monthLeft = 0.2
  clean.advance(1)
  assert.equal(clean.state.break.won, true)
  assert.match(clean.state.break.note, /Won the month/)

  const held = await load()
  held.nameStudio("HeldShip")
  held.state.money = 100
  held.state.month.qualified = true
  held.state.month.bigShipped = true
  held.handShip()
  assert.equal(held.state.month.handTouches || 0, 0)
  held.state.monthLeft = 0.2
  held.advance(1)
  assert.equal(held.state.break.won, true)

  const touched = await load()
  touched.nameStudio("EditTouch")
  touched.state.money = 100
  touched.state.month.qualified = true
  touched.state.month.bigShipped = true
  const project = touched.spawn("start")
  touched.startClient(project)
  touched.openProject(project, "title")
  assert.equal(touched.state.month.handTouches || 0, 0)
  touched.edited((_, item) => { item.colour = "paper" })
  assert.equal(touched.state.month.handTouches, 1)
  touched.state.monthLeft = 0.2
  touched.advance(1)
  assert.equal(touched.state.break.won, false)
  assert.doesNotMatch(touched.state.break.note, /Won the month/)
})

await check("specialty mix stays off and does not change arrivals", async () => {
  const { state, nameStudio, spawn, setSpecialty, gameFlags } = await load()
  assert.equal(gameFlags.specialtyMix, false)
  nameStudio("Mix")
  setSpecialty("fintech")
  const open = new Set()
  for (let i = 0; i < 36; i++) open.add(spawn("timer").industry)
  assert.ok(open.size > 1, "flag off still mixed industries")
  gameFlags.specialtyMix = true
  setSpecialty("wellness")
  const forced = new Set()
  for (let i = 0; i < 12; i++) forced.add(spawn("timer").industry)
  assert.deepEqual([...forced], ["wellness"])
  setSpecialty(null)
  const general = new Set()
  for (let i = 0; i < 36; i++) general.add(spawn("timer").industry)
  assert.ok(general.size > 1, "generalist stays mixed")
  assert.equal(state.specialty, null)
})

function calmNamedColours(project, elements) {
  const wanted = new Set(elements)
  for (const screen of project.screens) {
    for (const id of ["title", "cardA", "cardB", "save"]) screen.elements[id].ink = "ink"
    for (const id of wanted) screen.elements[id].colour = "paper"
  }
}

await check("the first three clients gate Ship with one, two, and three lines", async () => {
  const { nameStudio, spawn, feeFor } = await load()
  nameStudio("Ramp")
  const [first, second, third, fourth] = [spawn("start"), spawn("timer"), spawn("timer"), spawn("timer")]
  const named = (project) => project.reqs.filter((req) => req.named)
  const elementsOf = (project) => named(project).map((req) => req.element)

  assert.equal(first.id, 1)
  assert.equal(first.screens.length, 1)
  assert.deepEqual(elementsOf(first), ["title"])
  assert.equal(first.reqs.length, 1)
  assert.equal(first.reqs[0].prop, "colour")
  assert.equal(first.reqs[0].named, true)
  assert.equal(feeFor(first), null)
  calmNamedColours(first, ["title"])
  assert.equal(first.elements.cardA.colour, "lime")
  assert.equal(first.elements.save.colour, "hot")
  assert.equal(typeof feeFor(first), "number")

  assert.equal(second.id, 2)
  assert.equal(second.screens.length, 2)
  assert.deepEqual(elementsOf(second), ["title", "cardA"])
  assert.equal(second.reqs.length, 2)
  assert.ok(second.reqs.every((req) => req.named && req.prop === "colour"))
  assert.equal(feeFor(second), null)
  calmNamedColours(second, ["title"])
  assert.equal(feeFor(second), null)
  calmNamedColours(second, ["cardA"])
  assert.equal(second.elements.save.colour, "hot")
  assert.equal(typeof feeFor(second), "number")

  assert.equal(third.id, 3)
  assert.equal(third.screens.length, 2)
  assert.deepEqual(elementsOf(third), ["title", "cardA", "save"])
  assert.equal(third.reqs.length, 3)
  assert.ok(third.reqs.every((req) => req.named && req.prop === "colour"))
  assert.equal(feeFor(third), null)
  calmNamedColours(third, ["title", "cardA"])
  assert.equal(feeFor(third), null)
  calmNamedColours(third, ["save"])
  assert.equal(third.elements.background.colour, "hot")
  assert.equal(typeof feeFor(third), "number")

  assert.equal(fourth.id, 4)
  assert.equal(fourth.screens.length, 2)
  const namedVisual = fourth.reqs.filter((req) => req.named && (req.group === "colour" || req.group === "radius" || req.group === "contrast"))
  assert.equal(namedVisual.length, 3)
  assert.ok(fourth.reqs.length > namedVisual.length)
})

await check("the queue names the screen that still holds the ship", async () => {
  const { nameStudio, spawn, startClient, projectWatch } = await load()
  nameStudio("Watch")
  spawn("start")
  const second = spawn("timer")
  startClient(second)
  for (const screen of second.screens) {
    for (const id of ["title", "cardA", "cardB", "save"]) screen.elements[id].ink = "ink"
  }
  const [lead, other] = second.screens
  assert.equal(projectWatch(second).line, "You · " + lead.name + ", You · " + other.name)
  for (const id of ["title", "cardA"]) lead.elements[id].colour = "paper"
  assert.equal(projectWatch(second).line, "You · " + other.name)
  for (const id of ["title", "cardA"]) other.elements[id].colour = "paper"
  assert.equal(projectWatch(second).line, "Ready to ship")
})

await check("a finished edit enables Ship before the next tick", async () => {
  const { state, nameStudio, spawn, startClient, openProject, edited, shipButtonLabel, shipControl } = await load()
  nameStudio("Offer")
  const first = spawn("start")
  startClient(first)
  for (const id of ["title", "cardA", "cardB", "save"]) first.elements[id].ink = "ink"
  for (const id of ["cardA", "cardB", "save", "background"]) first.elements[id].colour = "paper"
  openProject(first, "title")
  assert.equal(state.shipDisabled, true)
  edited((_, item) => { item.colour = "paper" })
  assert.equal(state.shipDisabled, false)
  assert.equal(state.canShip, true)
  assert.match(shipButtonLabel(first), /^Ship · \$/)
  assert.equal(shipControl(first).held, "false")
})

await check("a wrong radius on a judged line holds Ship and is listed", async () => {
  const { state, nameStudio, spawn, advance, openParts, shipButtonLabel, shipControl, projectWatch, grade } = await load()
  nameStudio("RadiusHold")
  state.projectSeq = 3
  const project = spawn("start")
  advance(0.05)
  for (const screen of project.screens) {
    for (const id of Object.keys(VAGUE)) {
      screen.elements[id].colour = VAGUE[id]
      screen.elements[id].radius = id === "background" ? 20 : 16
      screen.elements[id].contrast = 21
      screen.elements[id].ink = null
    }
  }
  const radiusReq = project.reqs.find((req) => req.prop === "radius")
  assert.ok(radiusReq, "client 4 should judge a radius")
  project.elements[radiusReq.element].radius = 32
  for (const screen of project.screens) screen.elements[radiusReq.element].radius = 32
  advance(0.05)
  assert.equal(grade(project, radiusReq.element, "radius"), "wrong", radiusReq.element + " " + project.elements[radiusReq.element].radius)
  assert.equal(state.canShip, false, shipButtonLabel(project))
  const control = shipControl(project)
  assert.equal(control.held, "true")
  assert.match(control.reason, /radius/i)
  assert.notEqual(control.reason, "Ship held")
  assert.notEqual(projectWatch(project).line, "Ready to ship")
  const parts = openParts(project)
  assert.ok(parts.length > 0)
  assert.ok(parts.some((part) => part.open.some((req) => req.prop === "radius")))
})

await check("copy fixed only on the lead stays listed on the other screen", async () => {
  const { state, nameStudio, spawn, advance, openParts, shipButtonLabel, shipControl, projectWatch, frameCopy } = await load()
  nameStudio("LeadOnly")
  state.staff = [permanent(1, "Ada")]
  state.codified.fintech = true
  state.nextStaffId = 2
  state.projectSeq = 3
  state.money = 100
  const project = spawn("start")
  assert.equal(project.hasUX, true)
  const lead = project.screens[0]
  const other = project.screens[1]
  const words = frameCopy(project)
  for (const id of Object.keys(VAGUE)) {
    lead.elements[id].colour = VAGUE[id]
    lead.elements[id].radius = id === "background" ? 20 : 16
    lead.elements[id].contrast = 21
    lead.elements[id].ink = null
  }
  lead.elements.title.hierarchy = "primary"
  lead.elements.save.hierarchy = "primary"
  lead.elements.cardA.hierarchy = "body"
  lead.elements.cardB.hierarchy = "body"
  lead.elements.title.copy = words.title
  lead.elements.save.copy = words.action
  if (project.flow.demand === "empty") project.flow.emptyFixed = true
  else project.flow.errorFixed = true
  advance(0.05)
  assert.equal(state.canShip, false)
  assert.notEqual(projectWatch(project).line, "Ready to ship")
  const label = shipButtonLabel(project)
  const control = shipControl(project)
  assert.equal(control.held, "true")
  assert.match(control.reason, new RegExp(other.name))
  assert.match(label, new RegExp(other.name))
  const parts = openParts(project)
  assert.ok(parts.some((part) => part.screenName === other.name))
  assert.equal(parts.some((part) => part.screenName === other.name && part.open.some((req) => req.prop === "copy" || req.prop === "hierarchy")), true)
})

await check("editorial radius 0 is not wrong, and a typed 16 is graded", async () => {
  const { state, nameStudio, spawn, grade } = await load()
  nameStudio("Grade")
  const project = spawn("start")
  project.industry = "editorial"
  project.elements.title.radius = 0
  project.elements.background.radius = 0
  assert.equal(grade(project, "title", "radius"), "best")
  assert.equal(state.tools.radius, false)
  project.elements.title.radius = 16
  project.elements.background.radius = 24
  assert.notEqual(grade(project, "title", "radius"), "wrong")
})

await check("hiring does not reset the next client or roll a second intern", async () => {
  const { state, nameStudio, hire, dismissNotice } = await load()
  nameStudio("Arrival")
  state.handShips = 3
  state.money = 100
  state.arrivalLeft = 17
  hire()
  while (state.notices.length) dismissNotice()
  const miss = state.staff[0].miss
  hire()
  assert.equal(state.staff.length, 1)
  assert.equal(state.staff[0].miss, miss)
  assert.equal(state.arrivalLeft, 17)
})

await check("payroll keeps the permanent when the intern covers the gap", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("Order")
  state.staff = [intern(1, "Ada"), permanent(2, "Ben")]
  state.nextStaffId = 3
  state.money = 30
  state.monthLeft = 0.2
  advance(1)
  assert.equal(state.staff.length, 1)
  assert.equal(state.staff[0].role, "permanent")
})

await check("starting a client does not record a hand touch", async () => {
  const { state, nameStudio, spawn, startClient, openProject, handShip } = await load()
  nameStudio("Touch")
  const project = spawn("start")
  assert.equal(state.month.handTouches || 0, 0)
  startClient(project)
  openProject(project, "title")
  handShip()
  assert.equal(state.month.handTouches || 0, 0)
  assert.equal(state.month.handTouch, false)
})

await check("a Permanent can take the open unstarted project", async () => {
  const { state, nameStudio, spawn, advance } = await load()
  nameStudio("Open")
  state.staff = [permanent(1, "Ada")]
  state.nextStaffId = 2
  state.monthLeft = 10000
  const project = spawn("start")
  assert.equal(state.openId, project.id)
  assert.equal(project.started, false)
  advance(1)
  assert.equal(state.staff[0].projectId, project.id)
  assert.equal(project.started, true)
})

await check("a $1 shortfall does not fire the permanent", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("LateGap")
  state.staff = [
    { id: 1, name: "Ada", role: "intern", pay: 10, miss: 0.2, clean: 0, projectId: null, screenId: null, workLeft: 0, startedAt: 230.4 },
    { id: 2, name: "Ben", role: "permanent", pay: 30, miss: 0.2, clean: 3, projectId: null, screenId: null, workLeft: 0, startedAt: 0 }
  ]
  state.nextStaffId = 3
  state.money = 29.4
  state.monthLeft = 0.2
  advance(1)
  assert.equal(state.staff.length, 2)
  assert.equal(state.staff.some((staff) => staff.role === "permanent"), true)
  assert.equal(state.staff.some((staff) => staff.role === "intern"), true)
  close(state.debt, 1)
  assert.match(state.break.note, /Late/)
  cents(state.money, "late money")
})

await check("an intern is cut only when their pay covers the gap", async () => {
  const covered = await load()
  covered.nameStudio("CoverGap")
  covered.state.staff = [intern(1, "Ada"), permanent(2, "Ben")]
  covered.state.nextStaffId = 3
  covered.state.money = 30
  covered.state.monthLeft = 0.2
  covered.advance(1)
  assert.equal(covered.state.staff.length, 1)
  assert.equal(covered.state.staff[0].role, "permanent")

  const tiny = await load()
  tiny.nameStudio("TinyIntern")
  tiny.state.staff = [
    { id: 1, name: "Ada", role: "intern", pay: 10, miss: 0.2, clean: 0, projectId: null, screenId: null, workLeft: 0, startedAt: 230.4 },
    { id: 2, name: "Ben", role: "permanent", pay: 30, miss: 0.2, clean: 3, projectId: null, screenId: null, workLeft: 0, startedAt: 0 }
  ]
  tiny.state.money = 20
  tiny.state.monthLeft = 0.2
  tiny.advance(1)
  assert.equal(tiny.state.staff.some((staff) => staff.role === "intern"), true, "intern pay does not cover the gap")
  assert.equal(tiny.state.staff.some((staff) => staff.role === "permanent"), true, "permanent stays when the intern cannot cover")
})

await check("the big client card shows the ship payout", async () => {
  const api = await load()
  api.nameStudio("Card")
  api.state.accepted = 3
  api.state.eventSeen = false
  api.state.queue = []
  let project = null
  for (let i = 0; i < 40; i++) {
    const made = api.spawn("timer")
    if (made.size === "big" && api.state.event) { project = made; break }
    api.state.queue = api.state.queue.filter((item) => item.id !== made.id)
    api.state.event = null
    api.state.eventSeen = false
  }
  assert.ok(project)
  const offer = api.bigClientOffer()
  assert.equal(offer.payout, 36)
  assert.equal(offer.decline, 6)
  const before = api.state.money
  api.takeBig()
  assert.equal(api.state.money, before)
  api.state.staff = [{ id: 1, name: "Ada", role: "permanent", pay: 30, miss: 0.2, clean: 3, projectId: null, screenId: null, workLeft: 0, startedAt: 0 }]
  api.state.codified.fintech = true
  api.state.event = { projectId: project.id, client: project.client }
  api.state.queue.push(project)
  assert.equal(api.bigClientOffer().payout, 48)
})

await check("turning down a big client frees the intern and leaves hire usable", async () => {
  const api = await load()
  api.nameStudio("Decline")
  api.state.handShips = 3
  api.state.money = 80
  api.state.monthLeft = 240
  api.hire()
  const internId = api.state.staff[0].id
  api.state.accepted = 3
  api.state.eventSeen = false
  api.state.queue = []
  let project = null
  for (let i = 0; i < 40; i++) {
    const made = api.spawn("timer")
    if (made.size === "big" && api.state.event) { project = made; break }
    api.state.queue = api.state.queue.filter((item) => item.id !== made.id)
    api.state.event = null
    api.state.eventSeen = false
  }
  const intern = api.state.staff.find((staff) => staff.id === internId)
  intern.projectId = project.id
  const before = api.state.money
  api.turnDownBig()
  assert.equal(api.state.queue.some((item) => item.id === project.id), false)
  assert.equal(intern.projectId, null)
  close(api.state.money - before, 6)
  api.hire()
  assert.equal(api.state.staff.length, 1)
  api.fire(internId)
  api.state.money = 80
  api.state.monthLeft = 240
  assert.equal(api.canHire(), true)
  api.hire()
  assert.equal(api.state.staff.length, 1)
})

await check("hire does not reroll and stays closed when unaffordable", async () => {
  const api = await load()
  api.nameStudio("NoReroll")
  api.state.handShips = 3
  api.state.money = 3
  api.state.monthLeft = 240
  api.nameStudio("NoReroll")
  assert.equal(api.canHire(), false)
  api.hire()
  assert.equal(api.state.staff.length, 0)
  api.state.money = 100
  const random = Math.random
  let rolls = 0
  Math.random = () => { rolls += 1; return 0.99 }
  api.hire()
  const miss = api.state.staff[0].miss
  api.fire(api.state.staff[0].id)
  api.state.money = 100
  api.state.monthLeft = 240
  api.hire()
  Math.random = random
  assert.equal(rolls, 1)
  assert.equal(api.state.staff[0].miss, miss)
  cents(api.state.money, "hire money")
})

await check("money stays in cents and does not go negative", async () => {
  const api = await load()
  api.nameStudio("Cents")
  api.state.money = 0.1 + 0.2
  api.nameStudio("Cents")
  cents(api.state.money, "commit")
  assert.ok(api.state.money >= 0)
  api.state.money = -4
  api.nameStudio("Cents")
  assert.equal(api.state.money, 0)
})

function cents(value, label) {
  assert.equal(typeof value, "number", label)
  assert.ok(Number.isFinite(value), label)
  assert.ok(Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, (label || "money") + " " + value)
}

await check("saveVersion 5 rejects an older save and says so", async () => {
  const engine = await load()
  assert.equal(engine.saveVersion, 5)
  assert.equal(engine.saveThrottleMs, 1000)
  const rejected = engine.acceptSave({ saveVersion: 4, state: { studioName: "Old" }, ledger: [] })
  assert.equal(rejected.ok, false)
  assert.equal(rejected.reason, "version")
  const accepted = engine.acceptSave({ saveVersion: 5, state: { studioName: "Kept" }, ledger: [] })
  assert.equal(accepted.ok, true)
  const store = new Map()
  const previousStorage = globalThis.localStorage
  const previousFrame = globalThis.requestAnimationFrame
  const sessions = new Map()
  const previousSession = globalThis.sessionStorage
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  }
  globalThis.sessionStorage = {
    getItem: (key) => (sessions.has(key) ? sessions.get(key) : null),
    setItem: (key, value) => sessions.set(key, value),
    removeItem: (key) => sessions.delete(key)
  }
  globalThis.requestAnimationFrame = () => 0
  try {
    const raw = JSON.stringify({ saveVersion: 4, state: { studioName: "Old" }, ledger: [] })
    store.set("sell-the-system-v4", raw)
    engine.start()
    assert.equal(engine.state.studioName, "")
    assert.equal(engine.state.saveNote, "Old save from an earlier version was discarded.")
    assert.match(engine.state.status, /Old save from an earlier version was discarded/)
    assert.equal(sessions.get("sell-the-system-discarded"), raw)
    assert.equal(store.has("sell-the-system-v4"), false)
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = previousStorage
    if (previousSession === undefined) delete globalThis.sessionStorage
    else globalThis.sessionStorage = previousSession
    if (previousFrame === undefined) delete globalThis.requestAnimationFrame
    else globalThis.requestAnimationFrame = previousFrame
  }
})

await check("the Ship control exposes held and reason attributes", async () => {
  const hud = fs.readFileSync(path.join(path.dirname(engineFile), "components/Hud.jsx"), "utf8")
  assert.match(hud, /data-ship-held=/)
  assert.match(hud, /data-ship-reason=/)
})

function mulberry32(seed) {
  let state = seed >>> 0
  return function random() {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

await check("brief-only fixes enable Ship on clients 1 to 3", async () => {
  const api = await load()
  api.nameStudio("Defaults")
  const random = Math.random
  try {
    for (let seed = 0; seed < 200; seed++) {
      Math.random = mulberry32(seed)
      api.state.projectSeq = 0
      api.state.queue = []
      api.state.openId = null
      api.state.accepted = 0
      for (let n = 1; n <= 3; n++) {
        const project = api.spawn("start")
        const lang = api.LANG[project.industry]
        for (const screen of project.screens) {
          for (const req of project.reqs) {
            if (!req.named || req.prop !== "colour") continue
            screen.elements[req.element].colour = lang.colour[req.element]
          }
        }
        const check = api.shipCheck(project.id)
        assert.equal(check.held, false, "seed " + seed + " client " + n + " " + check.label)
      }
    }
  } finally {
    Math.random = random
  }
  const project = api.state.queue[0]
  for (const screen of project.screens) screen.elements.cardA.ink = screen.elements.cardA.colour
  const bad = api.shipCheck(project.id)
  assert.equal(bad.held, true)
  assert.match(bad.reason, /Card A contrast \d/)
  assert.match(bad.reason, /under 3/)
  assert.doesNotMatch(bad.reason, /^Contrast under 3$/)
})

await check("stop 8 is inside bare minimum and a miss names the target", async () => {
  const api = await load()
  api.nameStudio("Band")
  const random = Math.random
  let named = 0
  try {
    for (let seed = 0; seed < 50; seed++) {
      Math.random = mulberry32(seed + 20)
      api.state.projectSeq = 3
      api.state.queue = []
      api.state.openId = null
      const project = api.spawn("start")
      assert.equal(project.id, 4)
      const lang = api.LANG[project.industry]
      for (const screen of project.screens) {
        for (const id of Object.keys(lang.colour)) {
          screen.elements[id].colour = lang.colour[id]
          if (id === "title") screen.elements[id].ink = "ink"
          else if (id !== "background") screen.elements[id].ink = lang.colour[id] === "ink" ? "paper" : "ink"
        }
        screen.elements.background.radius = 24
        for (const id of ["title", "cardA", "cardB", "save"]) screen.elements[id].radius = 8
      }
      for (const id of ["title", "cardA", "cardB", "save"]) {
        assert.notEqual(api.grade(project, id, "radius"), "wrong", "seed " + seed + " " + id)
      }
      const req = project.reqs.find((item) => item.prop === "radius")
      if (!req) continue
      for (const screen of project.screens) screen.elements[req.element].radius = 0
      if (api.grade(project, req.element, "radius") !== "wrong") continue
      api.startClient(project)
      const check = api.shipCheck(project.id)
      assert.equal(check.held, true)
      assert.match(check.reason, /target \d+/)
      named += 1
    }
  } finally {
    Math.random = random
  }
  assert.ok(named > 0, "expected some client 4 radius holds")
})

await check("a $1.01 shortfall with a late intern keeps the permanent", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("Penny")
  state.staff = [
    { id: 1, name: "Ada", role: "intern", pay: 10, miss: 0.2, clean: 0, projectId: null, screenId: null, workLeft: 0, startedAt: 230.4 },
    { id: 2, name: "Ben", role: "permanent", pay: 30, miss: 0.2, clean: 3, projectId: null, screenId: null, workLeft: 0, startedAt: 0 }
  ]
  state.money = 29.39
  state.monthLeft = 30
  nameStudio("Penny")
  assert.match(state.payroll.lateNote, /Ship the next screen/)
  state.monthLeft = 0.2
  advance(1)
  assert.equal(state.staff.length, 2)
  assert.equal(state.staff.some((staff) => staff.role === "permanent"), true)
  close(state.debt, 1.01)
  assert.match(state.break.note, /Owed \$30\.40: Ada \(\$0\.40\), Ben \(\$30\)/)
  assert.match(state.break.note, /Paid \$29\.39/)
  assert.doesNotMatch(state.break.note, /Paid \$29\.39:/)
  assert.match(state.break.note, /Ship the next screen/)
})

await check("a $15 shortfall does not fire the permanent", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("Fifteen")
  state.staff = [intern(1, "Ada"), permanent(2, "Ben")]
  state.nextStaffId = 3
  state.money = 25
  state.monthLeft = 0.2
  advance(1)
  assert.equal(state.staff.length, 2)
  assert.equal(state.staff.some((staff) => staff.role === "permanent"), true)
  assert.match(state.break.note, /Owed \$40: Ada \(\$10\), Ben \(\$30\)\. Paid \$25/)
  assert.match(state.break.note, /Ship the next screen/)
  assert.notEqual(state.money === 0 && state.staff.length === 0, true)
})

await check("shipping the next screen pays a Late debt", async () => {
  const api = await load()
  api.nameStudio("Recover")
  api.state.staff = [intern(1, "Ada"), permanent(2, "Ben")]
  api.state.nextStaffId = 3
  api.state.money = 25
  api.state.monthLeft = 0.2
  api.advance(1)
  assert.ok(api.state.debt >= 15)
  api.continueMonth()
  api.state.queue = []
  api.state.projectSeq = 0
  const project = api.spawn("start")
  paintLoose(project)
  api.startClient(project)
  const before = api.state.debt
  api.handShip()
  assert.ok(api.state.debt < before, "debt " + api.state.debt + " from " + before)
})

await check("an enabled Ship press does not spend a hands-off month", async () => {
  const api = await load()
  api.nameStudio("Trap")
  const project = api.spawn("start")
  api.startClient(project)
  paintLoose(project)
  project.playerEdited = true
  api.state.month.qualified = true
  api.state.month.handTouch = false
  api.state.month.handTouches = 0
  const check = api.shipCheck(project.id)
  assert.equal(check.held, false, check.label)
  assert.equal(typeof check.fee, "number")
  api.handShip()
  assert.equal(api.state.month.handTouches || 0, 0)
  assert.equal(api.state.month.handTouch, false)
})

await check("reload keeps the studio and the next start still paints", async () => {
  const engine = await load()
  const store = new Map()
  const sessions = new Map()
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  }
  globalThis.sessionStorage = {
    getItem: (key) => (sessions.has(key) ? sessions.get(key) : null),
    setItem: (key, value) => sessions.set(key, value),
    removeItem: (key) => sessions.delete(key)
  }
  globalThis.requestAnimationFrame = () => 0
  store.set("sell-the-system-v4", JSON.stringify({
    saveVersion: 5,
    state: { studioName: "Kept", money: 0.1 + 0.2, queue: [{ id: 1, client: "Northwind" }] },
    ledger: []
  }))
  let paints = 0
  const stop = engine.subscribe(() => { paints += 1 })
  engine.start()
  assert.equal(engine.state.studioName, "Kept")
  assert.equal(engine.state.money, 0.3)
  assert.equal(engine.state.queue[0].client, "Northwind")
  assert.equal(engine.state.saveNote, "")
  assert.ok(paints >= 1, "reload painted before a click")
  stop()
  let again = 0
  engine.subscribe(() => { again += 1 })
  engine.start()
  assert.equal(again, 1)
})

await check("a second tab does not replace the save", async () => {
  const engine = await load()
  const store = new Map()
  const saved = JSON.stringify({ saveVersion: 5, state: { studioName: "Kept", money: 24 }, ledger: [] })
  store.set("sell-the-system-v4", saved)
  store.set("sell-the-system-lock", JSON.stringify({ tabId: "other", at: Date.now() }))
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  }
  globalThis.sessionStorage = {
    getItem: (key) => (key === "sell-the-system-tab" ? "me" : null),
    setItem: () => {},
    removeItem: () => {}
  }
  globalThis.requestAnimationFrame = () => 0
  engine.start()
  assert.equal(engine.state.tabNote, "This game is open in another tab")
  assert.equal(engine.state.studioName, "")
  assert.equal(store.get("sell-the-system-v4"), saved)
})

await check("a nameless save is a new game, not an error", async () => {
  const engine = await load()
  const store = new Map()
  store.set("sell-the-system-v4", JSON.stringify({ saveVersion: 5, state: {}, ledger: [] }))
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  }
  globalThis.sessionStorage = {
    getItem: () => "solo",
    setItem: () => {},
    removeItem: () => {}
  }
  globalThis.requestAnimationFrame = () => 0
  engine.start()
  assert.equal(engine.state.saveNote, "")
  assert.equal(engine.state.status, "")
  assert.equal(engine.state.studioName, "")
  assert.equal(store.has("sell-the-system-v4"), false)
})

await check("hire price stays put until the first Start", async () => {
  const { state, nameStudio, advance } = await load()
  nameStudio("HoldHire")
  state.clocksLive = false
  state.monthLeft = 240
  nameStudio("HoldHire")
  assert.equal(state.nextHireCost, 10)
  advance(30)
  assert.equal(state.monthLeft, 240)
  assert.equal(state.nextHireCost, 10)
})

await check("an empty queue can start the first client", async () => {
  const { state, nameStudio, ensureClient } = await load()
  nameStudio("Empty")
  state.queue = []
  state.openId = null
  ensureClient()
  assert.equal(state.queue.length, 1)
  assert.ok(state.queue[0].client)
})

await check("a fixed line moves the selection, and a hidden Save is not Clear", async () => {
  const api = await load()
  api.nameStudio("Select")
  const project = api.spawn("start")
  api.startClient(project)
  api.state.openId = project.id
  const colour = project.reqs.find((req) => req.prop === "colour")
  api.state.selectedEl = colour.element
  const target = api.LANG[project.industry].colour[colour.element]
  api.edited((_, item) => { item.colour = target })
  if (api.shipCheck(project.id).held) {
    const next = api.openParts(project)[0]
    assert.equal(api.state.selectedEl, next.id)
  } else {
    assert.equal(api.state.selectedEl, null)
  }
  project.elements.cardA.colour = "lime"
  project.elements.cardA.ink = "lime"
  assert.equal(api.shownGrade(project, "cardA", "contrast"), "Wrong")
  assert.notEqual(api.shownGrade(project, "cardA", "contrast"), "Not judged")
  project.elements.save.colour = "hot"
  project.elements.save.ink = "hot"
  const hidden = api.shipCheck(project.id)
  assert.equal(hidden.held, true)
  assert.doesNotMatch(hidden.label, /Clear/)
  assert.ok(api.openParts(project).some((part) => part.id === "save"))
  api.selectPart(project, project.screens[0].id, "save")
  assert.equal(api.state.selectedEl, "save")
})

await check("a click stays under 200ms with 30 clients", async () => {
  const api = await load()
  api.nameStudio("Rows")
  api.state.queue = []
  api.state.projectSeq = 0
  for (let i = 0; i < 30; i++) api.spawn("fill")
  for (const project of api.state.queue) api.startClient(project)
  const started = performance.now()
  for (const project of api.state.queue) {
    api.projectWatch(project)
    api.shipCheck(project.id)
  }
  const ms = performance.now() - started
  console.log("30-row click path " + ms.toFixed(1) + "ms")
  assert.ok(ms < 200, "click path " + ms)
})

await check("a disabled Ship names a reason when no client is open", async () => {
  const api = await load()
  api.nameStudio("NoOpen")
  const project = api.spawn("start")
  api.state.openId = null
  const check = api.shipCheck(null)
  assert.equal(check.held, true)
  assert.match(check.label, /^Ship held · /)
  assert.ok(check.reason.length > 0)
  assert.notEqual(check.label, "Ship")
  api.state.openId = project.id
  const named = api.shipCheck(project.id)
  assert.match(named.label, /^Ship held · /)
  assert.ok(named.reason.length > 0)
})

if (failures.length) {
  console.error("engine-correctness: " + failures.length + " failed")
  process.exit(1)
}
console.log("engine-correctness: ok")
