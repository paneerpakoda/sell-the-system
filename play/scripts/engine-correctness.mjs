// Headless checks for play/src/engine.js.
// Run from anywhere: node play/scripts/engine-correctness.mjs
//
// Each case imports a fresh engine. This script calls nameStudio, spawn,
// advance, and state. advance(seconds) runs the same tick as the browser.
// spawn(reason) is the same arrival used in play.

import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const engineFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/engine.js")
let nonce = 0

async function load() {
  nonce += 1
  return import(pathToFileURL(engineFile).href + "?n=" + nonce)
}

const failures = []

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
  const { state, nameStudio, spawn, advance } = await load()
  nameStudio("Ship")
  const project = spawn("start")
  advance(0.05)
  assert.equal(state.shipDisabled, true)
  assert.equal(state.canShip, false)
  assert.equal(state.shipFee, null)
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
  const { state, nameStudio, spawn, feeFor } = await load()
  nameStudio("Fee")
  const project = spawn("start")
  paintLoose(project)
  project.size = "big"
  project.standard = "exacting"
  assert.equal(feeFor(project), 3)
  state.staff = [permanent(1, "Ada")]
  state.codified.editorial = true
  assert.equal(feeFor(project), 6)
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

await check("the strict hand rule is the default and a Ship press blocks the win", async () => {
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

  const touched = await load()
  touched.nameStudio("ShipTouch")
  touched.state.money = 100
  touched.state.month.qualified = true
  touched.state.month.bigShipped = true
  touched.handShip()
  assert.equal(touched.state.month.handTouches, 1)
  assert.equal(touched.state.month.handTouch, true)
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

if (failures.length) {
  console.error("engine-correctness: " + failures.length + " failed")
  process.exit(1)
}
console.log("engine-correctness: ok")
