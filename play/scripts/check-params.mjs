// Reads month, week, and deadline constants from play/src/engine.js and
// fails if Game Design Document.md, Game Parameters.md, or CONTEXT.md disagree.
// Run from the repo root: node play/scripts/check-params.mjs

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const enginePath = path.join(root, "play/src/engine.js")
const docs = [
  "Game Design Document.md",
  "Game Parameters.md",
  "CONTEXT.md"
]

const failures = []

function fail(message) {
  failures.push(message)
}

function readConst(source, name) {
  const match = source.match(new RegExp(`^const ${name} = ([^\\n]+)`, "m"))
  if (!match) {
    fail(`engine.js has no const ${name}`)
    return null
  }
  return match[1].trim()
}

function numberConst(source, name, known) {
  const expr = readConst(source, name)
  if (expr == null) return null
  if (/^\d+(?:\.\d+)?$/.test(expr)) return Number(expr)
  const divided = expr.match(/^(\w+)\s*\/\s*(\d+(?:\.\d+)?)$/)
  if (divided && Object.prototype.hasOwnProperty.call(known, divided[1])) {
    return known[divided[1]] / Number(divided[2])
  }
  fail(`cannot read ${name} from "${expr}"`)
  return null
}

function arrivalSentence(source) {
  const body = source.match(/function interval\(\) \{([\s\S]*?)\n\}/)
  if (!body) {
    fail("engine.js has no interval()")
    return null
  }
  const early = body[1].match(/if \(state\.accepted < (\d+)\) return (\d+)/)
  const later = body[1].match(/return Math\.max\((\d+),\s*(\d+) - \(state\.accepted - (\d+)\)\)/)
  if (!early || !later || early[1] !== later[3]) {
    fail("interval() is not the documented arrival shape")
    return null
  }
  const threshold = early[1]
  const earlySeconds = early[2]
  const floorSeconds = later[1]
  const baseSeconds = later[2]
  return `While the queue already holds a Project, the next arrives every ${earlySeconds} seconds until ${threshold} ships have been accepted, then every ${baseSeconds} - (acceptedShips - ${threshold}) seconds, and never faster than ${floorSeconds} seconds.`
}

function attemptSentence(source) {
  const body = source.match(/export function stepSeconds\(project\) \{\n  return Math\.round\(Math\.max\(([\d.]+), ([\d.]+) - systemCount\(project\) \* ([\d.]+)\) \* 10\) \/ 10\n\}/)
  if (!body) {
    fail("stepSeconds() is not the documented attempt shape")
    return null
  }
  return {
    floor: body[1],
    base: body[2],
    step: body[3],
    sentence: `An attempt takes ${body[2]} seconds, minus ${body[3]} seconds for each counted system, and never under ${body[1]} seconds. Interns and Permanents use that same clock.`
  }
}

function deadlineSentence(source, constants) {
  const body = source.match(/function deadlineForNext\(\) \{([\s\S]*?)\n\}/)
  if (!body) {
    fail("engine.js has no deadlineForNext()")
    return null
  }
  const text = body[1]
  const first = text.match(/if \(state\.projectSeq === 0 \|\| !state\.everHired\) return (\w+)/)
  const managed = text.match(/if \(state\.staff\.some\(\(staff\) => staff\.role === "permanent"\)\) return (\w+)/)
  const rest = text.match(/return (\w+)\s*$/)
  if (!first || !managed || !rest) {
    fail("deadlineForNext() is not the documented deadline shape")
    return null
  }
  const value = (name) => {
    if (!Object.prototype.hasOwnProperty.call(constants, name)) {
      fail(`deadlineForNext() returns unknown ${name}`)
      return null
    }
    return constants[name]
  }
  const untilHire = value(first[1])
  const withPermanent = value(managed[1])
  const afterHire = value(rest[1])
  if (untilHire == null || withPermanent == null || afterHire == null) return null
  return `On time is ${untilHire} seconds for the first Project and until an Intern is hired, ${afterHire} seconds after a hire with no Permanent, and ${withPermanent} seconds while a Permanent is employed.`
}

const source = fs.readFileSync(enginePath, "utf8")
const constants = {}
constants.monthLength = numberConst(source, "monthLength", constants)
constants.deadlineLength = numberConst(source, "deadlineLength", constants)
constants.firstDeadline = numberConst(source, "firstDeadline", constants)
constants.managedDeadline = numberConst(source, "managedDeadline", constants)
constants.weekLength = numberConst(source, "weekLength", constants)

const engine = await import(pathToFileURL(enginePath).href)
if (engine.monthLength !== constants.monthLength) {
  fail(`imported monthLength ${engine.monthLength} != parsed ${constants.monthLength}`)
}
if (engine.deadlineLength !== constants.deadlineLength) {
  fail(`imported deadlineLength ${engine.deadlineLength} != parsed ${constants.deadlineLength}`)
}

const monthPhrase = `${constants.monthLength} seconds, four weeks of ${constants.weekLength} seconds`
const arrivals = arrivalSentence(source)
const deadlines = deadlineSentence(source, constants)
const attempt = attemptSentence(source)

const stale = [
  [/\b45 seconds\b/, "45 seconds"],
  [/\b45s\b/, "45s"],
  [/45-second/, "45-second"],
  [/forty-five seconds/i, "forty-five seconds"],
  [/20 - min\(acceptedShips, 12\)/, "arrival formula 20 - min(acceptedShips, 12)"],
  [/8 seconds once/, "8 seconds once 12 ships"],
  [/down to 8 seconds/, "down to 8 seconds"],
  [/from 20 seconds to 8 seconds/, "gap from 20 seconds to 8 seconds"],
  [/attempt takes 8 seconds/, "an attempt takes 8 seconds"],
  [/attempts take 4 seconds/, "attempts take 4 seconds"],
  [/attempts of 4 seconds/, "attempts of 4 seconds"],
  [/\| Intern attempt \| 8s \|/, "intern attempt 8s"],
  [/\| Permanent attempt \| 4s \|/, "permanent attempt 4s"]
]

for (const name of docs) {
  const file = path.join(root, name)
  const text = fs.readFileSync(file, "utf8")
  if (monthPhrase && !text.includes(monthPhrase)) fail(`${name} is missing "${monthPhrase}"`)
  if (arrivals && !text.includes(arrivals)) fail(`${name} is missing "${arrivals}"`)
  if (deadlines && !text.includes(deadlines)) fail(`${name} is missing "${deadlines}"`)
  if (attempt && !text.includes(attempt.sentence)) fail(`${name} is missing "${attempt.sentence}"`)
  for (const [pattern, label] of stale) {
    if (pattern.test(text)) fail(`${name} still says ${label}`)
  }
}

const parameters = fs.readFileSync(path.join(root, "Game Parameters.md"), "utf8")
const rows = [
  `| Month | ${constants.monthLength}s |`,
  `| Week | ${constants.weekLength}s |`,
  `| On time, until a hire | ${constants.firstDeadline}s |`,
  `| On time, after a hire | ${constants.deadlineLength}s |`,
  `| On time, with a Permanent | ${constants.managedDeadline}s |`,
  attempt ? `| Intern attempt | ${attempt.base}s to ${attempt.floor}s |` : null,
  attempt ? `| Permanent attempt | ${attempt.base}s to ${attempt.floor}s |` : null
]
for (const row of rows) {
  if (row && constants.monthLength != null && !parameters.includes(row)) {
    fail(`Game Parameters.md is missing table row ${row}`)
  }
}

if (failures.length) {
  console.error("check-params: failed")
  for (const message of failures) console.error(" - " + message)
  process.exit(1)
}

console.log("check-params: ok")
console.log(`monthLength ${constants.monthLength}s`)
console.log(`weekLength ${constants.weekLength}s`)
console.log(`firstDeadline ${constants.firstDeadline}s`)
console.log(`deadlineLength ${constants.deadlineLength}s`)
console.log(`managedDeadline ${constants.managedDeadline}s`)
if (attempt) console.log(`stepSeconds ${attempt.base}s minus ${attempt.step}s per system, floor ${attempt.floor}s`)
console.log("Game Design Document.md, Game Parameters.md, and CONTEXT.md match the engine.")
