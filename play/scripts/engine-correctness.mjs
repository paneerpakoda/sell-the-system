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
  const project = spawn("start")
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
