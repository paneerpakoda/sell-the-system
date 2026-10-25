// Track A: two open clients, one shipCheck.
// node play/scripts/track-a-ship.mjs

import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const engineFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/engine.js")
let nonce = 0

async function load() {
  nonce += 1
  return import(pathToFileURL(engineFile).href + "?tracka=" + nonce)
}

const PROPS = ["colour", "radius", "contrast", "copy", "hierarchy", "flow"]

function readable(project) {
  for (const screen of project.screens) {
    for (const id of Object.keys(screen.elements)) {
      const el = screen.elements[id]
      el.colour = id === "title" ? "ink" : "paper"
      el.radius = id === "background" ? 20 : 16
      el.contrast = 21
      if (id !== "background") el.ink = "ink"
    }
    screen.qc = null
  }
  if (project.flow) {
    project.flow.emptyFixed = true
    project.flow.errorFixed = true
  }
  for (const req of project.reqs) {
    if (req.prop === "hierarchy") project.elements[req.element].hierarchy = req.value
    if (req.prop === "copy") {
      const text = req.element === "save" ? "Save note" : "Notes"
      project.screens.forEach((screen) => { screen.elements[req.element].copy = text })
    }
  }
}

function holdContrast(project) {
  const screen = project.screens[0]
  screen.elements.save.colour = "hot"
  screen.elements.save.ink = "hot"
}

function labelFee(label) {
  const match = String(label).match(/\$(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

function agrees(api, project) {
  const check = api.shipCheck(project.id)
  const parts = api.openParts(project)
  const label = api.shipButtonLabel(project)
  assert.equal(label, check.label)
  if (!project.started) {
    assert.equal(api.state.canShip, false)
    assert.equal(api.state.shipFee, null)
  } else {
    assert.equal(api.state.shipFee, check.held ? null : check.fee)
    assert.equal(api.state.canShip, !check.held)
    assert.equal(api.state.shipDisabled, check.held)
  }
  if (check.held) {
    assert.notEqual(parts.length, 0, "held client listed Clear")
    assert.match(check.reason, /.+ · .+/)
    const named = PROPS.some((prop) => check.reason.indexOf(prop) !== -1)
    assert.equal(named, true, "reason names a property: " + check.reason)
    assert.match(check.label, /^Ship held · /)
    assert.equal(labelFee(check.label), null)
  } else {
    assert.equal(parts.length, 0, check.label)
    assert.equal(check.reason, "")
    assert.equal(labelFee(check.label), check.fee)
  }
  return check
}

const modes = ["ready", "held"]
const started = [false, true]
let cases = 0

for (const firstMode of modes) {
  for (const secondMode of modes) {
    for (const firstStarted of started) {
      for (const secondStarted of started) {
        for (const openFirst of [true, false]) {
          const api = await load()
          api.nameStudio("TrackA")
          api.state.monthLeft = 10000
          const first = api.spawn("start")
          const second = api.spawn("timer")
          first.standard = "loose"
          second.standard = "loose"
          first.size = "small"
          second.size = "small"
          readable(first)
          readable(second)
          if (firstMode === "held") holdContrast(first)
          if (secondMode === "held") holdContrast(second)
          if (firstStarted) api.startClient(first)
          if (secondStarted) api.startClient(second)
          const open = openFirst ? first : second
          api.state.openId = open.id
          api.advance(0.05)
          const check = agrees(api, open)
          if (firstStarted && secondStarted && !openFirst && firstMode === "ready" && secondMode === "held") {
            assert.equal(check.held, true)
            assert.equal(api.shipCheck(first.id).held, false)
            assert.equal(api.state.canShip, false)
            assert.notEqual(api.openParts(second).length, 0)
          }
          if (firstStarted && secondStarted && !openFirst && firstMode === "held" && secondMode === "ready") {
            assert.equal(check.held, false)
            assert.equal(api.state.canShip, true)
            assert.equal(labelFee(check.label), check.fee)
            assert.equal(api.shipCheck(first.id).held, true)
          }
          const touches = api.state.month.handTouches || 0
          api.handShip()
          if (check.held || !open.started) {
            assert.equal(api.state.month.handTouches || 0, touches)
            assert.equal(api.state.queue.some((item) => item.id === open.id), true)
          } else {
            assert.equal(api.state.month.handTouches || 0, touches)
            assert.equal(api.state.queue.some((item) => item.id === open.id), false)
            assert.match(api.state.status, new RegExp("\\$" + check.fee + "\\."))
          }
          cases += 1
        }
      }
    }
  }
}

const api = await load()
api.nameStudio("Hands")
api.state.monthLeft = 10000
const project = api.spawn("start")
const before = api.state.month.handTouches || 0
api.startClient(project)
api.openProject(project, "title")
api.selectPart(project, project.screens[0].id, "save")
api.handShip()
assert.equal(api.state.month.handTouches || 0, before)
assert.equal(api.state.selectedEl, "save")
api.edited((_, item) => { item.colour = item.colour })
assert.equal(api.state.month.handTouches || 0, before)
api.edited((_, item) => { item.colour = "paper" })
assert.equal(api.state.month.handTouches, before + 1)

const radius = await load()
radius.nameStudio("Radius")
radius.state.projectSeq = 3
const client4 = radius.spawn("start")
const wellness = radius.spawn("timer")
wellness.industry = "wellness"
wellness.elements.title.radius = 20
wellness.elements.cardA.radius = 0
assert.equal(radius.grade(wellness, "title", "radius"), "best")
assert.match(radius.radiusHint(wellness, "title"), /Target 20/)
assert.match(radius.radiusHint(wellness, "title"), /Selected 20/)
radius.startClient(client4)
radius.state.openId = client4.id
radius.advance(0.05)
const held4 = radius.shipCheck(client4.id)
assert.equal(held4.held, true)
assert.match(held4.reason, /radius|contrast|colour/)
const failing = radius.openParts(client4)
assert.ok(failing.length > 1, "client 4 lists every failing part")
for (const screen of client4.screens) {
  for (const id of Object.keys(screen.elements)) {
    screen.elements[id].colour = id === "title" || id === "save" ? "ink" : "paper"
    screen.elements[id].radius = radius.LANG[client4.industry].radius + (id === "background" ? 4 : 0)
    screen.elements[id].contrast = 21
    if (id !== "background") screen.elements[id].ink = "ink"
  }
}
radius.advance(0.05)
const fixed = radius.shipCheck(client4.id)
if (client4.standard === "exacting" && radius.grade(client4, "title", "colour") !== "best") {
  assert.equal(fixed.held, true)
} else if (!client4.hasUX) {
  assert.equal(radius.grade(client4, "title", "radius"), "best")
}

const hot = await load()
hot.nameStudio("Hot")
const hidden = hot.spawn("start")
hidden.elements.title.colour = "ink"
hidden.elements.title.ink = "ink"
hidden.elements.background.colour = "paper"
hidden.elements.save.colour = "hot"
hidden.elements.save.ink = "hot"
hot.startClient(hidden)
hot.state.openId = hidden.id
hot.advance(0.05)
const hotCheck = hot.shipCheck(hidden.id)
assert.equal(hotCheck.held, true)
assert.match(hotCheck.reason, /contrast/)
assert.ok(hotCheck.reason.indexOf(hidden.screens[0].name) !== -1, hotCheck.reason)
const hotParts = hot.openParts(hidden)
assert.ok(hotParts.some((part) => part.id === "save" && part.open[0].prop === "contrast"))
assert.equal(hot.shownGrade(hidden, "save", "contrast"), "Wrong")
hot.selectPart(hidden, hotParts.find((part) => part.id === "save").screenId, "save")
assert.equal(hot.state.selectedEl, "save")
assert.equal(hot.state.openId, hidden.id)

console.log("track-a-ship: " + cases + " two-client cases ok")
