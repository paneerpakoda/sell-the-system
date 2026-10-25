// 50 seeds, two clients, every ready / held / started / open combination.
// The button, the To Ship list, and the fee all come from shipCheck.
// Run: node play/scripts/ship-agree.mjs

import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const engineFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/engine.js")

function mulberry32(seed) {
  let state = seed >>> 0
  return function random() {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function paintReady(project) {
  const langColours = { background: "paper", title: "ink", cardA: "white", cardB: "white", save: "ink" }
  for (const screen of project.screens) {
    for (const id of Object.keys(langColours)) {
      const el = screen.elements[id]
      el.colour = langColours[id]
      el.radius = id === "background" ? 20 : 16
      el.contrast = 21
      el.ink = id === "save" || id === "title" ? "paper" : id === "background" ? null : "ink"
    }
  }
}

function paintHeld(project) {
  for (const screen of project.screens) {
    screen.elements.cardA.ink = screen.elements.cardA.colour || "lime"
  }
}

const api = await import(pathToFileURL(engineFile).href + "?agree=1")
api.nameStudio("Agree")

let checks = 0
for (let seed = 0; seed < 50; seed++) {
  Math.random = mulberry32(seed)
  api.state.projectSeq = 0
  api.state.queue = []
  api.state.openId = null
  api.state.accepted = 0
  api.state.month.qualified = false
  api.state.month.handTouch = false
  api.state.month.handTouches = 0
  api.state.break = null
  const clients = [api.spawn("start"), api.spawn("timer")]
  assert.equal(clients.length, 2)
  const opens = [null, clients[0].id, clients[1].id]
  for (const openId of opens) {
    for (const startedA of [false, true]) {
      for (const startedB of [false, true]) {
        for (const readyA of [false, true]) {
          for (const readyB of [false, true]) {
            clients[0].started = startedA
            clients[1].started = startedB
            clients[0].playerEdited = false
            clients[1].playerEdited = false
            if (readyA) paintReady(clients[0])
            else paintHeld(clients[0])
            if (readyB) paintReady(clients[1])
            else paintHeld(clients[1])
            api.state.openId = openId
            const check = api.shipCheck(openId)
            if (openId == null) {
              assert.equal(check.held, true)
              assert.match(check.label, /^Ship held · /)
              assert.ok(check.reason.length > 0)
              assert.equal(check.fee, null)
              assert.notEqual(check.label, "Ship")
            } else {
              const project = clients.find((item) => item.id === openId)
              const parts = api.openParts(project)
              assert.equal(parts.length, check.problems.length, "list " + seed + " " + openId)
              assert.equal(api.shipButtonLabel(project), check.label)
              for (const problem of check.problems) {
                assert.ok(project.screens.some((screen) => screen.id === problem.screen.id))
              }
              if (check.held) {
                assert.equal(check.fee, null)
                assert.match(check.label, /^Ship held · /)
                assert.ok(check.reason.length > 0)
                assert.ok(check.label.includes(check.reason))
              } else {
                assert.equal(typeof check.fee, "number")
                assert.match(check.label, new RegExp("\\$" + check.fee + "(?:\\b|\\.)"))
              }
              const other = clients.find((item) => item.id !== openId)
              const otherCheck = api.shipCheck(other.id)
              assert.equal(api.openParts(other).length, otherCheck.problems.length)
              assert.equal(api.shipButtonLabel(other), otherCheck.label)
            }
            checks += 1
          }
        }
      }
    }
  }
}

console.log("ship-agree: " + checks + " combinations, button, list, and fee agree")
