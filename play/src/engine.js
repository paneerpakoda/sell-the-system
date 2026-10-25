const ELEMENT_IDS = ["background", "title", "cardA", "cardB", "save"]
const NAMES = { background: "Background", title: "Title", cardA: "Card A", cardB: "Card B", save: "Save" }
const EL_NODES = { background: "el-background", title: "el-title", cardA: "el-card-a", cardB: "el-card-b", save: "el-save" }
const INDUSTRIES = ["fintech", "wellness", "editorial"]
const CLIENTS = ["Northwind", "Lumen", "Harbor", "Kindred", "Folio", "Aster", "Brass", "Sable", "Marlow", "Pebble", "Vesper", "Quill", "Hearth", "Ledger", "Nimbus"]
const STAFF_NAMES = ["Ada", "Ben", "Cam", "Dia", "Eve", "Fox", "Gia", "Hal", "Ivy", "Jed", "Kim", "Lux"]
const VAGUE_COLOUR = { background: "paper", title: "ink", cardA: "white", cardB: "white", save: "ink" }
const COLOURS = {
  paper: { hex: "#F4F1EA", name: "Paper", calm: true },
  white: { hex: "#FFFFFF", name: "White", calm: true },
  ink: { hex: "#1C1917", name: "Ink", calm: true },
  sand: { hex: "#F5E6D3", name: "Sand", calm: true },
  stone: { hex: "#E7E5E4", name: "Stone", calm: true },
  hot: { hex: "#FF4D6D", name: "Hot", calm: false },
  lime: { hex: "#C8FF00", name: "Lime", calm: false }
}
const monthLength = 240
const deadlineLength = 180
const firstDeadline = 300
const managedDeadline = 120
const PARAMS = {
  onTimeSeconds: deadlineLength,
  radiusStep: 4,
  exactingChance: 1 / 4,
  exactingChanceAfterToken: 1 / 2,
  soundChance: 1 / 2,
  contrastBest: 7,
  contrastAcceptable: 4.5,
  contrastBare: 3,
  namedLines: 3
}
const LANG = {
  fintech: {
    name: "Fintech",
    system: "Swiss Grid",
    voice: "Tight corners. Strong contrast.",
    colour: { background: "paper", title: "ink", cardA: "white", cardB: "white", save: "ink" },
    radius: 4,
    contrast: 9
  },
  wellness: {
    name: "Wellness",
    system: "Warm Soft",
    voice: "Soft corners. Gentle contrast.",
    colour: { background: "sand", title: "ink", cardA: "paper", cardB: "paper", save: "ink" },
    radius: 20,
    contrast: 5.5
  },
  editorial: {
    name: "Editorial",
    system: "Mono Stark",
    voice: "Square corners. Stark contrast.",
    colour: { background: "white", title: "ink", cardA: "stone", cardB: "stone", save: "ink" },
    radius: 0,
    contrast: 12
  }
}
const PRODUCTS = {
  fintech: [
    { name: "Balance", title: "Balance", cardA: "Spending", cardB: "Savings", action: "Transfer" },
    { name: "Transfer", title: "Transfer", cardA: "From", cardB: "To", action: "Send" },
    { name: "Account", title: "Account", cardA: "Card", cardB: "Limits", action: "Confirm" }
  ],
  wellness: [
    { name: "Today", title: "Today", cardA: "Sleep", cardB: "Move", action: "Check in" },
    { name: "Session", title: "Session", cardA: "Breath", cardB: "Stretch", action: "Start" },
    { name: "Profile", title: "Profile", cardA: "Goal", cardB: "Streak", action: "Log" }
  ],
  editorial: [
    { name: "Issue", title: "Issue", cardA: "Essay", cardB: "Review", action: "Read" },
    { name: "Story", title: "Story", cardA: "Lede", cardB: "Body", action: "Continue" },
    { name: "Archive", title: "Archive", cardA: "Saved", cardB: "Authors", action: "Open" }
  ]
}
const TOKEN_NAME = { colour: "Base colour", radius: "Base radius", contrast: "Base contrast" }
const TOKEN_DETAIL = {
  colour: "Fills only. New screens use a Paper background, white cards, an ink title, and an ink button. It does not set the contrast text.",
  radius: "New screens use 16px corners.",
  contrast: "New screens use contrast 21.0 (100%)."
}
const PROCESS_INFO = {
  research: ["User Research", "New projects arrive with clear copy."],
  wire: ["Wireframing", "New projects arrive with hierarchy set."],
  test: ["Usability Testing", "New projects arrive with the demanded state fixed."]
}
const state = {
  money: 24,
  accepted: 0,
  handShips: 0,
  everHired: false,
  handsFreeEver: false,
  wins: 0,
  showBanner: false,
  monthIndex: 1,
  monthLeft: monthLength,
  break: null,
  arrivalLeft: 20,
  month: { qualified: false, bigShipped: false, handTouch: false, handTouches: 0 },
  tokens: { colour: false, radius: false, contrast: false },
  codified: { fintech: false, wellness: false, editorial: false },
  process: { research: false, wire: false, test: false },
  bigDone: { fintech: false, wellness: false, editorial: false },
  staff: [],
  nextStaffId: 1,
  queue: [],
  projectSeq: 0,
  openId: null,
  selectedEl: null,
  status: "",
  saveNote: "",
  renderKey: "",
  nextHireFloor: null,
  headOffer: null,
  headUnlocked: false,
  wikiOpen: false,
  studioName: "",
  tools: { swatches: false, radius: false, contrast: false, components: false, styles: false },
  notices: [],
  seen: {},
  fork: null,
  event: null,
  eventSeen: false,
  lastIndustry: null,
  sold: 0,
  shipDisabled: true,
  canShip: false,
  shipFee: null,
  payroll: {
    due: 0,
    lines: [],
    atEnd: 0,
    atEndLines: [],
    nextHire: 10,
    nextHireUnpayable: false,
    reason: ""
  },
  nextHireCost: 10,
  nextHireUnpayable: false,
  specialty: null
}
export const gameFlags = {
  specialtyMix: false
}
const internWage = 10
const permanentWage = 30
let payrollLedger = []
export const saveVersion = 5
export const saveThrottleMs = 1000

function cap(value) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : "" }
function teach(id, title, body) {
  if (state.seen[id]) return
  state.seen[id] = true
  state.notices.push({ id, title, body })
}
function teachProcess() {
  if (!stage3Active()) return
  teach("process", "Design process", "You remember the work before the screen. New briefs include UX.")
}
export function dismissNotice() {
  state.notices.shift()
  commit()
}
export function nameStudio(name) {
  const clean = String(name || "").trim().replace(/\s+/g, " ").slice(0, 28)
  if (!clean) return
  state.studioName = clean
  commit()
}
function pick(list) { return list[Math.floor(Math.random() * list.length)] }
function shuffle(list) {
  const copy = list.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = copy[i]
    copy[i] = copy[j]
    copy[j] = swap
  }
  return copy
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function mix(fromHex, toHex, t) {
  const from = hexToRgb(fromHex)
  const to = hexToRgb(toHex)
  const channel = (a, b) => Math.round(a + (b - a) * t).toString(16).padStart(2, "0")
  return "#" + channel(from.r, to.r) + channel(from.g, to.g) + channel(from.b, to.b)
}
function fade(bg, ink, ratio) {
  const t = Math.max(0, Math.min(1, (ratio - 1) / 20))
  return mix(bg, ink, t)
}
function bestInk(hex) {
  const rgb = hexToRgb(hex)
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
  return luminance > 0.62 ? "#161616" : "#FFFFFF"
}
function typeSize(level) {
  if (level === "primary") return "32px"
  if (level === "body") return "20px"
  return "15px"
}
function clampRadius(value) { return Math.min(32, Math.max(0, Math.round(Number(value)))) }
function targetRadius(lang, elementId) {
  return elementId === "background" ? lang.radius + PARAMS.radiusStep : lang.radius
}
function clampContrast(value) {
  const snapped = Math.round(Number(value) * 10) / 10
  return Math.min(21, Math.max(1, snapped))
}
function stage3Active() {
  return state.staff.some((staff) => staff.role === "permanent") && INDUSTRIES.some((id) => state.codified[id])
}
function stage() {
  if (stage3Active()) return 3
  if (state.everHired) return 2
  return 1
}
function interval() {
  if (state.accepted < 3) return 60
  return Math.max(30, 45 - (state.accepted - 3))
}
function waitingCap() {
  if (!state.everHired) return 1
  if (state.accepted < 8) return 2
  return 3
}
function deadlineForNext() {
  if (state.projectSeq === 0 || !state.everHired) return firstDeadline
  if (state.staff.some((staff) => staff.role === "permanent")) return managedDeadline
  return deadlineLength
}
function worldPaused() {
  if (!state.studioName || state.break) return true
  return typeof document !== "undefined" && document.hidden
}
const weekLength = monthLength / 4
export function weekState() {
  if (state.break) return { week: 4, into: 1 }
  const spent = Math.max(0, Math.min(monthLength, monthLength - state.monthLeft))
  const week = Math.min(4, Math.floor(spent / weekLength) + 1)
  const into = Math.min(1, (spent - (week - 1) * weekLength) / weekLength)
  return { week, into }
}
function shipPay(project) {
  if (project && project.size === "big") return stage3Active() ? 48 : 36
  return stage3Active() ? 10 : 6
}
function autoPay() {
  return stage3Active() ? 6 : 3
}
function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}
function moneyText(value) {
  const rounded = roundMoney(value)
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}
function monthElapsed() {
  return Math.max(0, Math.min(monthLength, monthLength - state.monthLeft))
}
function employmentAmount(staff, until) {
  const start = Number.isFinite(staff.startedAt) ? staff.startedAt : 0
  const end = Math.max(start, Math.min(monthLength, until))
  return roundMoney(staff.pay * (end - start) / monthLength)
}
function combineLines(lines) {
  const order = []
  const sums = new Map()
  lines.forEach((line) => {
    if (!line || !(line.amount > 0)) return
    if (!sums.has(line.name)) order.push(line.name)
    sums.set(line.name, roundMoney((sums.get(line.name) || 0) + line.amount))
  })
  return order.map((name) => ({ name, amount: sums.get(name) }))
}
function payrollPreview(until) {
  const closeLines = payrollLedger.map((line) => ({ name: line.name, amount: line.amount }))
  const endLines = payrollLedger.map((line) => ({ name: line.name, amount: line.amount }))
  state.staff.forEach((staff) => {
    closeLines.push({ name: staff.name, amount: employmentAmount(staff, until) })
    endLines.push({ name: staff.name, amount: employmentAmount(staff, monthLength) })
  })
  const lines = combineLines(closeLines)
  const atEndLines = combineLines(endLines)
  return {
    due: roundMoney(lines.reduce((sum, line) => sum + line.amount, 0)),
    lines,
    atEnd: roundMoney(atEndLines.reduce((sum, line) => sum + line.amount, 0)),
    atEndLines
  }
}
function nextHireAmount(until) {
  const elapsed = Math.max(0, Math.min(monthLength, until))
  return roundMoney(internWage * (monthLength - elapsed) / monthLength)
}
function refreshPayrollOffer() {
  const until = monthElapsed()
  const preview = payrollPreview(until)
  const next = nextHireAmount(until)
  const bill = roundMoney(preview.atEnd + next)
  const unpayable = bill - state.money > 0.001
  state.payroll = {
    due: preview.due,
    lines: preview.lines,
    atEnd: preview.atEnd,
    atEndLines: preview.atEndLines,
    nextHire: next,
    nextHireUnpayable: unpayable,
    reason: unpayable
      ? "Hiring adds $" + moneyText(next) + " for the rest of this month. Payroll would be $" + moneyText(bill) + " and you have $" + moneyText(state.money) + "."
      : ""
  }
  state.nextHireCost = next
  state.nextHireUnpayable = unpayable
}
function payrollDue() {
  return payrollPreview(monthElapsed()).atEnd
}
function rememberPay(staff, until) {
  const amount = employmentAmount(staff, until)
  if (amount > 0) payrollLedger.push({ name: staff.name, amount })
}
function formatPeople(lines) {
  return (lines || []).filter((line) => line && line.amount > 0).map((line) => line.name + " ($" + moneyText(line.amount) + ")").join(", ")
}
function payrollNote(result) {
  const owed = formatPeople(result.paidLines)
  const gone = formatPeople(result.left)
  if (!result.fullyPaid) {
    const paidBit = "Paid $" + moneyText(result.paid) + (result.paid > 0 && owed ? ": " + owed : "") + "."
    if (gone) return gone + " left unpaid. Payroll was short. " + paidBit
    return "Payroll was short. " + paidBit
  }
  if (result.paid > 0) return "Payroll paid $" + moneyText(result.paid) + ": " + owed + "."
  return "No payroll due."
}
function tokensUnlocked() { return state.everHired && state.accepted >= 3 }
function playerJob() {
  return state.queue.find((project) => project.claimedBy === "player") || null
}
function focused() {
  if (state.openId) {
    const open = state.queue.find((project) => project.id === state.openId)
    if (open) return open
  }
  return playerJob() || state.queue[0] || null
}
function describe(project) {
  const lang = LANG[project.industry]
  const size = project.size === "big" ? "Big" : "Small"
  return project.client + " · " + lang.name + " · " + lang.system + " · " + size
}
function clientBrief(project) {
  const lang = LANG[project.industry]
  const used = new Set(Object.values(lang.colour))
  const colours = ["paper", "white", "ink", "sand", "stone"].filter((name) => used.has(name))
  return { system: lang.system, voice: lang.voice, colours }
}
function blankElement(partial) {
  return Object.assign({ colour: "hot", radius: 0, contrast: 1.6, hierarchy: "body", copy: "" }, partial)
}
function blankElements() {
  return {
    background: blankElement({ colour: "hot", radius: 24, contrast: 1.6, hierarchy: "body" }),
    title: blankElement({ colour: "lime", radius: 0, contrast: 1.6, hierarchy: "primary", copy: "" }),
    cardA: blankElement({ colour: "lime", radius: 0, contrast: 1.6, hierarchy: "body", ink: "lime" }),
    cardB: blankElement({ colour: "hot", radius: 32, contrast: 1.6, hierarchy: "body", ink: "hot" }),
    save: blankElement({ colour: "hot", radius: 0, contrast: 1.6, hierarchy: "primary", copy: "", ink: "hot" })
  }
}
function makeReq(project, spec) {
  const lang = LANG[project.industry]
  let base = ""
  if (spec.prop === "colour" && spec.mode === "strict") base = "Colour " + COLOURS[lang.colour[spec.element]].name
  else if (spec.prop === "colour") base = "Calm colour"
  else if (spec.prop === "radius" && spec.mode === "strict") base = "Radius " + targetRadius(lang, spec.element)
  else if (spec.prop === "radius") base = "Radius 12–24 · target " + targetRadius(lang, spec.element)
  else if (spec.prop === "contrast" && spec.mode === "strict") base = "Contrast ≥ " + lang.contrast.toFixed(1)
  else if (spec.prop === "contrast") base = "Contrast ≥ 4.5"
  else if (spec.prop === "hierarchy") base = "Hierarchy " + cap(spec.value)
  else if (spec.prop === "copy") base = "Clear intent"
  else if (spec.prop === "flow") base = "Fix " + cap(spec.value)
  const group = spec.group || (spec.prop === "hierarchy" || spec.prop === "copy" ? "type" : spec.prop === "flow" ? "flow" : spec.prop)
  return {
    element: spec.prop === "flow" ? "background" : spec.element,
    focus: spec.prop === "flow" ? "background" : spec.element,
    prop: spec.prop,
    mode: spec.mode || "ux",
    value: spec.value || null,
    title: spec.prop === "flow" ? "Flow" : NAMES[spec.element],
    base,
    group,
    named: spec.named === true
  }
}
function buildReqs(project) {
  const mode = project.size === "big" ? "strict" : "vague"
  const visual = []
  ELEMENT_IDS.forEach((id) => {
    visual.push({ element: id, prop: "colour", mode, group: "colour" })
    visual.push({ element: id, prop: "radius", mode, group: "radius" })
    if (id !== "background") visual.push({ element: id, prop: "contrast", mode, group: "contrast" })
  })
  const namedVisual = project.size === "big" ? visual : shuffle(visual).slice(0, PARAMS.namedLines)
  const named = new Set(namedVisual)
  const reqs = visual.map((spec) => makeReq(project, Object.assign({}, spec, { named: named.has(spec) })))
  if (project.hasUX) {
    reqs.push(makeReq(project, { element: "title", prop: "hierarchy", mode: "ux", value: "primary", group: "type", named: true }))
    reqs.push(makeReq(project, { element: "save", prop: "hierarchy", mode: "ux", value: "primary", group: "type", named: true }))
    reqs.push(makeReq(project, { element: "cardA", prop: "hierarchy", mode: "ux", value: "body", group: "type", named: true }))
    reqs.push(makeReq(project, { element: "cardB", prop: "hierarchy", mode: "ux", value: "body", group: "type", named: true }))
    reqs.push(makeReq(project, { element: "title", prop: "copy", mode: "ux", group: "type", named: true }))
    reqs.push(makeReq(project, { element: "save", prop: "copy", mode: "ux", group: "type", named: true }))
    reqs.push(makeReq(project, { element: "background", prop: "flow", mode: "ux", value: project.flow.demand, group: "flow", named: true }))
  }
  return reqs
}
function productScreens(project) {
  return PRODUCTS[project.industry] || PRODUCTS.fintech
}
function screenSpec(project) {
  const specs = productScreens(project)
  const screen = (project.screens || []).find((item) => item.elements === project.elements)
  if (screen) {
    const match = specs.find((item) => item.name === screen.name)
    if (match) return match
  }
  return specs[0]
}
export function frameCopy(project) {
  const spec = screenSpec(project)
  return { title: spec.title, action: spec.action }
}
function paintCopy(elements, spec, preserveBroken) {
  elements.cardA.copy = spec.cardA
  elements.cardB.copy = spec.cardB
  const broken = (value) => value === "Stuff" || value === "Submit"
  if (!(preserveBroken && broken(elements.title.copy))) elements.title.copy = spec.title
  if (!(preserveBroken && broken(elements.save.copy))) elements.save.copy = spec.action
}
function writeClearCopy(project) {
  const spec = productScreens(project)[0]
  project.elements.title.copy = spec.title
  project.elements.save.copy = spec.action
}
function passes(project, req) {
  if (req.prop === "flow") return req.value === "empty" ? project.flow.emptyFixed : project.flow.errorFixed
  if (req.prop === "copy") {
    const spec = screenSpec(project)
    const wanted = req.element === "save" ? spec.action : spec.title
    return project.elements[req.element].copy === wanted
  }
  if (req.prop === "hierarchy") return project.elements[req.element].hierarchy === req.value
  const el = project.elements[req.element]
  const lang = LANG[project.industry]
  const codified = state.codified[project.industry]
  if (req.prop === "colour") {
    if (req.mode === "strict") return el.colour === lang.colour[req.element]
    if (codified && el.colour === lang.colour[req.element]) return true
    return COLOURS[el.colour].calm
  }
  if (req.prop === "radius") {
    const target = targetRadius(lang, req.element)
    if (req.mode === "strict") return el.radius === target
    if (codified && el.radius === target) return true
    return el.radius >= 12 && el.radius <= 24
  }
  if (req.prop === "contrast") {
    const ratio = paintedContrast(project, req.element)
    if (req.mode === "strict") return ratio + 1e-6 >= lang.contrast
    if (codified && ratio + 1e-6 >= lang.contrast) return true
    return ratio + 1e-6 >= 4.5
  }
  return false
}
const GRADE_RANK = { best: 0, acceptable: 1, bare: 2, wrong: 3 }
function isVisualReq(req) {
  return req.group === "colour" || req.group === "radius" || req.group === "contrast"
}
function srgbChannel(channel) {
  const s = channel / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
function relativeLuminance(hex) {
  const rgb = hexToRgb(hex)
  return 0.2126 * srgbChannel(rgb.r) + 0.7152 * srgbChannel(rgb.g) + 0.0722 * srgbChannel(rgb.b)
}
function contrastRatio(aHex, bHex) {
  const left = relativeLuminance(aHex)
  const right = relativeLuminance(bHex)
  const lighter = Math.max(left, right)
  const darker = Math.min(left, right)
  return (lighter + 0.05) / (darker + 0.05)
}
function contrastBand(ratio) {
  if (ratio >= PARAMS.contrastBest) return "best"
  if (ratio >= PARAMS.contrastAcceptable) return "acceptable"
  if (ratio >= PARAMS.contrastBare) return "bare"
  return "wrong"
}
function nearestSwatch(hex) {
  const rgb = hexToRgb(hex)
  let best = "paper"
  let bestD = Infinity
  Object.keys(COLOURS).forEach((id) => {
    const colour = hexToRgb(COLOURS[id].hex)
    const distance = (colour.r - rgb.r) ** 2 + (colour.g - rgb.g) ** 2 + (colour.b - rgb.b) ** 2
    if (distance < bestD) {
      bestD = distance
      best = id
    }
  })
  return best
}
function contrastMix() {
  return 21
}
function surfaceHex(project, elementId) {
  if (elementId === "title") return COLOURS[project.elements.background.colour].hex
  return COLOURS[project.elements[elementId].colour].hex
}
function inkHex(project, elementId) {
  const el = project.elements[elementId]
  if (el.ink && COLOURS[el.ink]) return COLOURS[el.ink].hex
  if (elementId === "title") return COLOURS[el.colour].hex
  return bestInk(COLOURS[el.colour].hex)
}
function paintedContrast(project, elementId) {
  const el = project.elements[elementId]
  const behind = surfaceHex(project, elementId)
  const ink = fade(behind, inkHex(project, elementId), contrastMix(el))
  return contrastRatio(ink, behind)
}
function colourGrade(project, elementId) {
  const chosen = project.elements[elementId].colour
  if (chosen === LANG[project.industry].colour[elementId]) return "best"
  if (COLOURS[chosen].calm) return "bare"
  return "wrong"
}
function radiusFault(project, elementId) {
  const reached = radiusGrade(project, elementId)
  const radius = project.elements[elementId].radius
  const background = project.elements.background.radius
  if (reached === "best") return "Industry radius."
  if (reached === "acceptable") return "The parts share a radius. Background is 4 larger."
  if (radius > 24) return "Too round. Drag this corner back between 12 and 24."
  if (radius === 0) return "Square. Drag this corner inward."
  if (elementId !== "background" && radius > background) return "Rounder than the Background. Raise that corner first."
  if (radius < 12) return "Too sharp. Drag this corner inward."
  if (reached === "bare") return "In range. Title, both cards, and Save still need the same radius."
  return "Title, both cards, and Save need the same radius. Background is 4 larger."
}
function radiusNeedsBackground(project) {
  const background = project.elements.background.radius
  return ["title", "cardA", "cardB", "save"].some((id) => {
    const radius = project.elements[id].radius
    if (radius <= background || radius < 12 || radius > 24) return false
    return project.reqs.some((req) => (req.focus || req.element) === id && req.prop === "radius" && holdsShip(project, req))
  })
}
function radiusHint(project, elementId) {
  const target = targetRadius(LANG[project.industry], elementId)
  return "Target " + target + ". A loose client also passes 12–24."
}
function radiusGrade(project, elementId) {
  const lang = LANG[project.industry]
  const industryC = lang.radius
  const industryB = targetRadius(lang, "background")
  const components = ["title", "cardA", "cardB", "save"]
  const componentRadii = components.map((id) => project.elements[id].radius)
  const shared = componentRadii.every((radius) => radius === componentRadii[0])
  const C = componentRadii[0]
  const B = project.elements.background.radius
  if (shared && C === industryC && B === industryB) return "best"
  if (shared && B === C + PARAMS.radiusStep) return "acceptable"
  const radius = project.elements[elementId].radius
  const industry = elementId === "background" ? industryB : industryC
  // The industry number is never Wrong on its own. Editorial's 0 is that number.
  if (radius === industry) return "bare"
  if (elementId !== "background" && radius > B) return "wrong"
  if (radius < 12 || radius > 24) return "wrong"
  return "bare"
}
function grade(project, elementId, prop) {
  if (prop === "colour") return colourGrade(project, elementId)
  if (prop === "radius") return radiusGrade(project, elementId)
  if (prop === "contrast") {
    if (elementId === "background") return "wrong"
    return contrastBand(paintedContrast(project, elementId))
  }
  return "wrong"
}
function screenGrade(project) {
  let lowest = "best"
  ELEMENT_IDS.forEach((id) => {
    const props = id === "background" ? ["colour", "radius"] : ["colour", "radius", "contrast"]
    props.forEach((prop) => {
      const reached = grade(project, id, prop)
      if (GRADE_RANK[reached] > GRADE_RANK[lowest]) lowest = reached
    })
  })
  return lowest
}
function clientBar(project) {
  return project.standard === "exacting" ? "best" : "bare"
}
function meetsBar(reached, bar) {
  if (reached === "wrong") return false
  return GRADE_RANK[reached] <= GRADE_RANK[bar]
}
function typeFlowMet(project) {
  return project.reqs.every((req) => (req.group !== "type" && req.group !== "flow") || passes(project, req))
}
function holdsShip(project, req) {
  if (req.prop === "radius" || req.prop === "contrast") {
    if (req.element === "background" && req.prop === "contrast") return false
    return grade(project, req.element, req.prop) === "wrong"
  }
  if (isVisualReq(req)) {
    if (grade(project, req.element, req.prop) !== "wrong") return false
    return project.standard === "exacting" || req.named === true
  }
  if (req.group === "type" || req.group === "flow") return !passes(project, req)
  return false
}
function holdingLine(project) {
  for (let i = 0; i < project.reqs.length; i++) {
    if (holdsShip(project, project.reqs[i])) return project.reqs[i]
  }
  return null
}
function feeFor(project) {
  if (holdingLine(project)) return null
  const full = shipPay(project)
  const shortFee = autoPay()
  const uxMet = typeFlowMet(project)
  if (project.standard === "loose") {
    const namedOk = project.reqs.every((req) => !isVisualReq(req) || !req.named || meetsBar(grade(project, req.element, req.prop), "bare"))
    if (namedOk && uxMet) return full
    return null
  }
  if (screenGrade(project) === "best" && uxMet) return full
  return shortFee
}
function using(project, elements, fn) {
  const previous = project.elements
  project.elements = elements
  try { return fn() } finally { project.elements = previous }
}
function screenFee(project, screen) {
  if (!screen) return null
  return using(project, screen.elements, () => feeFor(project))
}
function screenWrong(project, screen) {
  return using(project, screen.elements, () => project.reqs.some((req) => {
    if (!isVisualReq(req)) return false
    return grade(project, req.element, req.prop) === "wrong"
  }))
}
function screenBlocks(project, screen) {
  if (!screen) return false
  if (screen.qc === "miss" || screen.qc === "returned") return true
  // A matching look does not excuse copy, hierarchy, or a null fee.
  if (screenFee(project, screen) == null) return true
  const reference = referenceScreen(project)
  if (!reference || screen === reference) return false
  if (matchesLead(screen, reference)) return false
  return screenWrong(project, screen)
}
function projectFee(project) {
  const screens = project.screens || []
  if (!screens.length) return feeFor(project)
  if (screens.some((screen) => screenBlocks(project, screen))) return null
  let lowest = Infinity
  for (let i = 0; i < screens.length; i++) {
    const fee = screenFee(project, screens[i])
    if (fee == null) return null
    if (fee < lowest) lowest = fee
  }
  return lowest
}
function firstHold(project) {
  const problem = shipProblems(project)[0]
  if (!problem) return null
  return { screen: problem.screen, req: problem.req }
}
function shipButtonLabel(project) {
  if (!project) return "Ship"
  const problem = shipProblems(project)[0]
  if (problem) {
    const part = NAMES[problem.req.element] || problem.req.title || "Part"
    const prop = problem.req.group || problem.req.prop || "part"
    return "Ship held · " + problem.screen.name + " · " + part + " " + prop
  }
  const fee = projectFee(project)
  if (fee == null) return "Ship held"
  return "Ship · $" + fee
}
// Selector for the Ship control. Track A replaces this with shipCheck(clientId)
// for the button, the To Ship list, and the fee. Until then the attributes
// follow the same label the button already shows.
export function shipControl(project) {
  const label = shipButtonLabel(project)
  const held = typeof label === "string" && label.indexOf("held") !== -1
  let reason = ""
  if (held) {
    reason = label.replace(/^Ship held\s*·?\s*/, "").trim()
    if (!reason) reason = "Still needs work"
  }
  return { held: held ? "true" : "false", reason }
}
export function listStamp(project) {
  if (!project) return ""
  const screens = project.screens && project.screens.length ? project.screens : []
  return screens.map((screen) => {
    const elements = screen.elements || {}
    const look = Object.keys(elements).map((id) => {
      const item = elements[id] || {}
      return id + ":" + (item.colour || "") + ":" + (item.radius ?? "") + ":" + (item.hierarchy || "") + ":" + (item.copy || "") + ":" + (item.contrast ?? "")
    }).join(",")
    const flow = project.flow || {}
    return [
      screen.id,
      screen.owner || "",
      screen.qc || "",
      screen.held ? 1 : 0,
      look,
      flow.showing || "",
      flow.emptyFixed ? 1 : 0,
      flow.errorFixed ? 1 : 0
    ].join("|")
  }).join(";")
}
function isCovered(project, req) {
  if (req.prop === "copy") return state.process.research
  if (req.prop === "hierarchy") return state.process.wire
  if (req.prop === "flow") return state.process.test
  return false
}
function clearInk(project) {
  ELEMENT_IDS.forEach((id) => { project.elements[id].ink = null })
}
function applyLanguage(project) {
  const lang = LANG[project.industry]
  ELEMENT_IDS.forEach((id) => {
    project.elements[id].colour = lang.colour[id]
    project.elements[id].radius = targetRadius(lang, id)
    project.elements[id].contrast = 21
  })
  clearInk(project)
}
function applyVagueLook(project) {
  ELEMENT_IDS.forEach((id) => {
    project.elements[id].colour = VAGUE_COLOUR[id]
    project.elements[id].radius = 16
    project.elements[id].contrast = 21
  })
  clearInk(project)
}
function applyBrokenUX(project) {
  project.elements.title.hierarchy = "small"
  project.elements.save.hierarchy = "small"
  project.elements.cardA.hierarchy = "primary"
  project.elements.cardB.hierarchy = "small"
  project.elements.title.copy = "Stuff"
  project.elements.save.copy = "Submit"
  project.flow.demand = Math.random() < 0.5 ? "empty" : "error"
  project.flow.showing = project.flow.demand
  project.flow.emptyFixed = false
  project.flow.errorFixed = false
}
function applyPrefill(project) {
  if (!project.hasUX) return
  if (state.process.research) writeClearCopy(project)
  if (state.process.wire) {
    project.elements.title.hierarchy = "primary"
    project.elements.save.hierarchy = "primary"
    project.elements.cardA.hierarchy = "body"
    project.elements.cardB.hierarchy = "body"
  }
  if (state.process.test) {
    if (project.flow.demand === "empty") project.flow.emptyFixed = true
    if (project.flow.demand === "error") project.flow.errorFixed = true
  }
}
function applyPassing(project) {
  if (project.size === "big" || state.codified[project.industry]) applyLanguage(project)
  else applyVagueLook(project)
  if (!project.hasUX) return
  project.elements.title.hierarchy = "primary"
  project.elements.save.hierarchy = "primary"
  project.elements.cardA.hierarchy = "body"
  project.elements.cardB.hierarchy = "body"
  writeClearCopy(project)
  if (project.flow.demand === "empty") project.flow.emptyFixed = true
  if (project.flow.demand === "error") project.flow.errorFixed = true
}
function writeWrong(project, req) {
  if (req.prop === "flow") {
    if (req.value === "empty") project.flow.emptyFixed = false
    else project.flow.errorFixed = false
    project.flow.showing = req.value
  } else if (req.prop === "copy") {
    project.elements[req.element].copy = Math.random() < 0.5 ? "Stuff" : "Submit"
  } else if (req.prop === "hierarchy") {
    project.elements[req.element].hierarchy = req.value === "primary" ? "small" : "primary"
  } else if (req.prop === "colour") {
    project.elements[req.element].colour = Math.random() < 0.5 ? "hot" : "lime"
  } else if (req.prop === "radius") {
    project.elements[req.element].radius = 32
  } else if (req.prop === "contrast") {
    project.elements[req.element].contrast = 1.6
    project.elements[req.element].ink = project.elements[req.element].colour
  }
  project.missNote = req.title + " · " + req.base
  project.missElement = req.focus
}
function nextClient() {
  const index = state.projectSeq - 1
  const name = CLIENTS[index % CLIENTS.length]
  const lap = Math.floor(index / CLIENTS.length)
  return lap ? name + " " + (lap + 1) : name
}
function rollIndustry() {
  if (state.fork === "specialist" && state.specialty && LANG[state.specialty]) return state.specialty
  if (!gameFlags.specialtyMix || !state.specialty || !LANG[state.specialty]) return pick(INDUSTRIES)
  return state.specialty
}
export function setSpecialty(industry) {
  state.specialty = LANG[industry] ? industry : null
}
function makeProject() {
  const industry = rollIndustry()
  let size = "small"
  if (state.accepted >= 3 && Math.random() < 0.25) size = "big"
  const waitingBig = state.queue.filter((project) => project.size === "big").length
  if (size === "big" && !state.handsFreeEver && waitingBig >= 1) size = "small"
  const exactingChance = tokensUnlocked() ? PARAMS.exactingChanceAfterToken : PARAMS.exactingChance
  const standard = Math.random() < exactingChance ? "exacting" : "loose"
  const temper = Math.random() < PARAMS.soundChance ? "sound" : "sour"
  const span = deadlineForNext()
  const project = {
    id: ++state.projectSeq,
    client: nextClient(),
    industry,
    size,
    standard,
    temper,
    onTimeTotal: span,
    onTimeLeft: span,
    deadlineTold: false,
    attemptedBy: null,
    hasUX: stage3Active(),
    elements: blankElements(),
    flow: { showing: "default", emptyFixed: false, errorFixed: false, demand: null },
    reqs: [],
    claimedBy: null,
    started: false,
    staffId: null,
    working: false,
    flagged: false,
    flaggedBy: "",
    missNote: "",
    missElement: null,
    playerEdited: false,
    screens: [],
    screenId: null
  }
  if (project.hasUX) applyBrokenUX(project)
  applyPrefill(project)
  if (project.id <= 3) applyOpening(project)
  else {
    project.reqs = buildReqs(project)
    attachScreens(project)
  }
  return project
}
function openingLines(step) {
  if (step === 1) return ["title"]
  if (step === 2) return ["title", "cardA"]
  return ["title", "cardA", "save"]
}
function applyOpening(project) {
  const mode = project.size === "big" ? "strict" : "vague"
  project.reqs = openingLines(project.id).map((element) => makeReq(project, {
    element,
    prop: "colour",
    mode,
    group: "colour",
    named: true
  }))
  attachScreens(project, project.id === 1 ? 1 : null)
}
function cloneElements(elements) {
  const copy = {}
  Object.keys(elements).forEach((id) => { copy[id] = Object.assign({}, elements[id]) })
  return copy
}
function attachScreens(project, count) {
  const specs = productScreens(project)
  const total = count == null ? (project.size === "big" ? 3 : 2) : count
  project.screens = specs.slice(0, total).map((spec, index) => {
    const elements = index === 0 ? project.elements : cloneElements(project.elements)
    paintCopy(elements, spec, index === 0)
    return {
      id: project.id + "-" + spec.name,
      name: spec.name,
      elements,
      owner: "player",
      announced: false,
      copied: false,
      qc: null,
      cool: 0
    }
  })
  project.screenId = project.screens[0].id
}
function activeScreen(project) {
  if (!project) return null
  if (!project.screens || !project.screens.length) attachScreens(project)
  return project.screens.find((screen) => screen.id === project.screenId) || project.screens[0]
}
function screenStaff(screen) {
  if (!screen || screen.owner === "player" || screen.owner == null) return null
  return state.staff.find((staff) => staff.id === screen.owner) || null
}
function screenOwnerName(screen) {
  if (!screen || screen.owner === "player" || screen.owner == null) return "You"
  const staff = screenStaff(screen)
  const name = staff ? staff.name : "Intern"
  if (screen.qc === "passed") return name + " · passed"
  if (screen.qc === "returned") return name + " · sent back"
  if (screen.qc === "miss") return name + " · missed"
  return name
}
function staffTask(staff) {
  if (!staff) return ""
  const project = state.queue.find((item) => item.id === staff.projectId)
  if (!project) {
    if (staff.role === "intern") return "Waiting for a finished screen"
    return "Waiting for a project"
  }
  const reference = project.screens[0]
  if (staff.role === "permanent") {
    if (reference && reference.owner === staff.id && !reference.done) return "Designing " + reference.name + " · " + project.client
    if (!state.staff.some((item) => item.role === "intern")) return "Designing the other screens · " + project.client
    if (!state.staff.some((item) => item.role === "intern" && item.projectId === project.id)) return "Waiting for an intern"
    return "Checking " + project.client
  }
  const source = referenceScreen(project)
  if (!source) return "Waiting for a finished screen"
  const screen = project.screens.find((item) => item.owner === staff.id && item.qc !== "passed")
  if (!screen) return "Waiting for a finished screen"
  if (screen.qc === "returned") return "Redoing " + screen.name
  if (screen.qc === "miss") return screen.name + " needs a fix"
  return "Designing " + screen.name + " from " + source.name
}
function leadOf(project) {
  return project.screens[0]
}
function leadReady(project) {
  const screen = leadOf(project)
  if (!screen || screenFee(project, screen) == null) return false
  if (screen.owner !== "player" && !screen.done) return false
  return true
}
function screenReady(project, screen) {
  if (!screen) return false
  if (screenFee(project, screen) == null && screenWrong(project, screen)) return false
  if (screen.owner === "player" || screen.owner == null) return true
  return !!screen.done || screen.qc === "passed"
}
function referenceScreen(project) {
  const screens = project.screens || []
  const ready = screens.filter((screen) => screenReady(project, screen))
  const touched = ready.find((screen) => screen.touched && (screen.owner === "player" || screen.owner == null))
  if (touched) return touched
  const mine = ready.find((screen) => screen.owner === "player" || screen.owner == null)
  if (mine) return mine
  return ready.find((screen) => screen.done || screen.qc === "passed") || null
}
function goalFrom(elements) {
  const goal = {}
  ELEMENT_IDS.forEach((id) => {
    goal[id] = {
      colour: elements[id].colour,
      radius: elements[id].radius,
      ink: elements[id].ink || null,
      contrast: elements[id].contrast
    }
  })
  return goal
}
function paintLook(elements, project, accurate) {
  const lang = LANG[project.industry]
  const strict = project.size === "big" || !!state.codified[project.industry]
  ELEMENT_IDS.forEach((id) => {
    elements[id].colour = strict ? lang.colour[id] : VAGUE_COLOUR[id]
    elements[id].radius = strict ? targetRadius(lang, id) : (id === "background" ? 20 : 16)
    elements[id].contrast = 21
    if (id !== "background") elements[id].ink = null
  })
  if (!accurate) {
    elements.cardA.colour = "hot"
    elements.cardA.radius = 0
    elements.cardA.ink = "hot"
    elements.cardA.contrast = 1.6
  }
}
function passingGoal(project, accurate) {
  const look = cloneElements(leadOf(project).elements)
  paintLook(look, project, accurate)
  return goalFrom(look)
}
function referenceGoal(project, accurate) {
  return copyGoal(leadOf(project).elements, accurate, project)
}
function hasLanguage(project) {
  return !!(project && state.codified[project.industry])
}
function colourSafe(project) {
  return state.tools.styles || state.tokens.colour || hasLanguage(project)
}
function radiusSafe(project) {
  return state.tools.radius || state.tokens.radius || hasLanguage(project)
}
function contrastSafe(project) {
  return state.tokens.contrast || hasLanguage(project)
}
function systemCount(project) {
  let count = 0
  if (state.tools.components) count += 1
  if (state.tools.radius) count += 1
  if (state.tools.styles) count += 1
  if (state.tokens.colour) count += 1
  if (state.tokens.radius) count += 1
  if (state.tokens.contrast) count += 1
  if (hasLanguage(project)) count += 2
  return count
}
export function stepSeconds(project) {
  return Math.round(Math.max(0.4, 1.4 - systemCount(project) * 0.12) * 10) / 10
}
export function effectiveMiss(intern, project) {
  if (!intern) return 0
  if (colourSafe(project) && radiusSafe(project) && contrastSafe(project)) return 0
  return Math.max(0.05, intern.miss - systemCount(project) * 0.04)
}
export function systemOwned() {
  const rows = []
  if (state.tools.components) rows.push({ id: "components", name: "Components", effect: "Both cards in one step" })
  if (state.tools.radius) rows.push({ id: "radius-tool", name: "Radius variable", effect: "Every corner in one step" })
  if (state.tools.styles) rows.push({ id: "styles", name: "Colour styles", effect: "Fills are not missed" })
  if (state.tokens.colour) rows.push({ id: "colour", name: "Base colour", effect: "All fills in one step" })
  if (state.tokens.radius) rows.push({ id: "radius", name: "Base radius", effect: "All corners in one step" })
  if (state.tokens.contrast) rows.push({ id: "contrast", name: "Base contrast", effect: "Contrast in one step" })
  INDUSTRIES.forEach((id) => {
    if (!state.codified[id]) return
    rows.push({ id, name: LANG[id].system, effect: LANG[id].name + " is faster and clean" })
  })
  return rows
}
function copyGoal(elements, accurate, project) {
  const look = cloneElements(elements)
  if (!accurate) {
    if (!colourSafe(project)) {
      look.cardA.colour = "hot"
      look.cardA.ink = "hot"
    }
    if (!radiusSafe(project)) look.cardA.radius = 0
    if (!contrastSafe(project)) look.cardA.contrast = 1.6
  }
  return goalFrom(look)
}
function batchIds(project, id, prop) {
  if (prop === "radius" && radiusSafe(project)) return ELEMENT_IDS.slice()
  if ((prop === "colour" || prop === "ink") && colourSafe(project)) {
    return prop === "ink" ? ELEMENT_IDS.filter((item) => item !== "background") : ELEMENT_IDS.slice()
  }
  if (prop === "contrast" && contrastSafe(project)) return ELEMENT_IDS.slice()
  if (state.tools.components && (id === "cardA" || id === "cardB")) return ["cardA", "cardB"]
  return [id]
}
function applyProp(screen, goal, id, prop) {
  const el = screen.elements[id]
  const target = goal[id]
  if (!el || !target) return
  if (prop === "colour") el.colour = target.colour
  else if (prop === "radius") el.radius = target.radius
  else if (prop === "ink" && id !== "background") el.ink = target.ink
  else if (prop === "contrast") el.contrast = target.contrast
}
function stepToward(goal, screen, project) {
  for (let i = 0; i < ELEMENT_IDS.length; i++) {
    const id = ELEMENT_IDS[i]
    const el = screen.elements[id]
    const target = goal[id]
    let prop = ""
    if (el.colour !== target.colour) prop = "colour"
    else if (el.radius !== target.radius) prop = "radius"
    else if (id !== "background" && (el.ink || null) !== target.ink) prop = "ink"
    else if (el.contrast !== target.contrast) prop = "contrast"
    if (!prop) continue
    batchIds(project, id, prop).forEach((other) => applyProp(screen, goal, other, prop))
    return false
  }
  return true
}
function matchesLead(screen, reference) {
  return ELEMENT_IDS.every((id) => {
    const left = screen.elements[id]
    const right = reference.elements[id]
    if (left.colour !== right.colour || left.radius !== right.radius) return false
    if (id !== "background" && (left.ink || null) !== (right.ink || null)) return false
    return true
  })
}
function goalsEqual(left, right) {
  if (!left || !right) return false
  return ELEMENT_IDS.every((id) => {
    const a = left[id]
    const b = right[id]
    if (!a || !b) return false
    if (a.colour !== b.colour || a.radius !== b.radius || a.contrast !== b.contrast) return false
    if (id !== "background" && (a.ink || null) !== (b.ink || null)) return false
    return true
  })
}
function parkIntern(intern) {
  state.queue.forEach((project) => {
    ;(project.screens || []).forEach((screen) => {
      if (screen.owner !== intern.id || screen.qc === "passed") return
      screen.owner = project.claimedBy === "player" ? "player" : null
      screen.goal = null
    })
  })
  intern.projectId = null
  intern.screenId = null
}
function releaseStaff(staff) {
  if (!staff) return
  state.queue.forEach((project) => {
    ;(project.screens || []).forEach((screen) => {
      if (screen.owner !== staff.id) return
      if (screen.qc !== "passed") {
        screen.goal = null
        screen.done = false
      }
      screen.owner = "player"
    })
    if (project.staffId === staff.id) project.staffId = null
  })
  staff.projectId = null
  staff.screenId = null
  staff.workLeft = 0
}
function giveBack(project, note, staff) {
  project.flagged = true
  project.flaggedBy = staff ? staff.name : ""
  project.missNote = note
  project.claimedBy = "player"
  project.staffId = null
  project.working = false
  ;(project.screens || []).forEach((screen) => {
    if (screen.qc !== "passed") {
      screen.owner = "player"
      screen.goal = null
      screen.qc = null
      screen.done = false
    }
  })
  state.staff.forEach((person) => {
    if (person.projectId === project.id) {
      person.projectId = null
      person.screenId = null
    }
  })
  state.status = (staff ? staff.name + " flagged " : "Flagged ") + project.client + ". " + note + "."
}
function maybeShipStaff(project) {
  if (!project || project.claimedBy === "player" || project.flagged) return
  if (project.screens.some((screen) => screen.qc !== "passed")) return
  if (projectFee(project) == null) return
  const permanent = state.staff.find((staff) => staff.role === "permanent" && staff.projectId === project.id)
  state.staff.forEach((staff) => {
    if (staff.projectId !== project.id) return
    staff.projectId = null
    staff.screenId = null
  })
  project.staffId = null
  completeShip(project, "auto", permanent || null)
}
function takeUnclaimed(staff) {
  return state.queue.find((project) => {
    if (project.started || project.claimedBy === "player" || project.flagged) return false
    if (state.staff.some((other) => other.projectId === project.id)) return false
    return true
  }) || null
}
function internOnTeam() {
  return state.staff.some((staff) => staff.role === "intern")
}
function lockFinished(project) {
  project.screens.forEach((screen) => {
    if (screen.qc === "passed" || screen.qc === "miss") return
    if (screen.owner !== "player" && screen.owner != null) return
    if (screenFee(project, screen) != null) screen.qc = "passed"
  })
}
function startLead(permanent, project) {
  const reference = leadOf(project)
  reference.owner = permanent.id
  reference.done = false
  reference.qc = null
  const leadMiss = effectiveMiss(permanent, project)
  reference.accurate = leadMiss <= 0 || Math.random() > leadMiss
  reference.goal = passingGoal(project, reference.accurate)
  reference.cool = 0
  permanent.projectId = project.id
  permanent.screenId = reference.id
  project.staffId = permanent.id
  project.started = true
  project.working = true
  state.status = permanent.name + " is designing " + reference.name + " for " + project.client + "."
}
function runPermanent(permanent, dt) {
  let project = state.queue.find((item) => item.id === permanent.projectId)
  if (!project || project.claimedBy === "player") {
    permanent.projectId = null
    permanent.screenId = null
    project = takeUnclaimed(permanent)
    if (!project) return
    startLead(permanent, project)
    return
  }
  const screen = project.screens.find((item) => item.id === permanent.screenId)
  if (!screen) {
    if (!leadReady(project)) return
    if (internOnTeam()) {
      maybeShipStaff(project)
      return
    }
    const next = project.screens.find((item) => item.qc !== "passed" && !item.held)
    if (!next) {
      maybeShipStaff(project)
      return
    }
    next.owner = permanent.id
    next.done = false
    next.qc = null
    next.accurate = true
    next.goal = referenceGoal(project, true)
    next.cool = 0
    permanent.screenId = next.id
    state.status = permanent.name + " is designing " + next.name + " from " + leadOf(project).name + "."
    return
  }
  if (!screen.goal) screen.goal = screen === leadOf(project) ? passingGoal(project, screen.accurate !== false) : referenceGoal(project, true)
  screen.cool = (screen.cool || 0) + dt
  if (screen.cool < stepSeconds(project)) return
  screen.cool = 0
  if (!stepToward(screen.goal, screen, project)) return
  screen.done = true
  permanent.screenId = null
  if (screenFee(project, screen) == null || screenWrong(project, screen)) {
    giveBack(project, screen.name + " needs you", permanent)
    return
  }
  screen.qc = "passed"
  state.status = permanent.name + " finished " + screen.name + "."
  if (!internOnTeam() || project.screens.every((item) => item.qc === "passed")) maybeShipStaff(project)
}
function screenOpenForIntern(project, intern, screen, reference) {
  if (!screen || screen === reference || screen.held) return false
  if (screen.qc === "miss") return false
  if (screen.qc === "passed" && matchesLead(screen, reference)) return false
  if (screen.owner === intern.id) return true
  if (screen.owner !== "player" && screen.owner != null) return false
  return true
}
function internJob(intern) {
  const ready = (project) => {
    const reference = referenceScreen(project)
    return !!reference && project.screens.some((screen) => screenOpenForIntern(project, intern, screen, reference))
  }
  const mine = state.queue.find((project) => {
    if (project.claimedBy !== "player" || !ready(project)) return false
    return !state.staff.some((staff) => staff !== intern && staff.role === "intern" && staff.projectId === project.id)
  })
  if (mine) return mine
  return state.queue.find((project) => {
    if (project.claimedBy === "player" || project.flagged || !ready(project)) return false
    if (!state.staff.some((staff) => staff.role === "permanent" && staff.projectId === project.id)) return false
    return !state.staff.some((staff) => staff !== intern && staff.role === "intern" && staff.projectId === project.id)
  }) || null
}
function runIntern(intern, dt) {
  let project = state.queue.find((item) => item.id === intern.projectId)
  if (project && !referenceScreen(project)) {
    parkIntern(intern)
    project = null
  }
  if (!project) {
    project = internJob(intern)
    if (!project) return
    intern.projectId = project.id
  }
  const reference = referenceScreen(project)
  if (!reference) return
  lockFinished(project)
  const screen = project.screens.find((item) => screenOpenForIntern(project, intern, item, reference))
  if (!screen) {
    maybeShipStaff(project)
    const held = project.screens.some((item) => item.qc === "miss" || item.qc === "returned")
    if (!held) {
      intern.projectId = null
      intern.screenId = null
    }
    return
  }
  if (screen.qc === "returned") {
    screen.qc = null
    screen.accurate = true
    screen.goal = copyGoal(reference.elements, true, project)
    screen.cool = 0
    screen.tries = (screen.tries || 0) + 1
    intern.screenId = screen.id
    state.status = intern.name + " is redoing " + screen.name + "."
    return
  }
  if (screen.owner !== intern.id) {
    screen.owner = intern.id
    const miss = effectiveMiss(intern, project)
    screen.accurate = miss <= 0 || Math.random() > miss
    screen.goal = copyGoal(reference.elements, screen.accurate, project)
    screen.qc = null
    screen.done = false
    screen.cool = 0
    intern.screenId = screen.id
    if (project.screenId === screen.id) state.selectedEl = null
    state.status = intern.name + " is designing " + screen.name + " from " + reference.name + "."
    return
  }
  const nextGoal = copyGoal(reference.elements, screen.accurate !== false, project)
  if (!goalsEqual(screen.goal, nextGoal)) {
    screen.goal = nextGoal
    screen.done = false
    if (screen.qc === "passed") screen.qc = null
  }
  screen.cool = (screen.cool || 0) + dt
  if (screen.cool < stepSeconds(project)) return
  screen.cool = 0
  if (!stepToward(screen.goal, screen, project)) return
  const permanent = state.staff.find((staff) => staff.role === "permanent" && staff.projectId === project.id)
  const clear = screenFee(project, screen) != null && matchesLead(screen, reference)
  if (permanent && project.claimedBy !== "player") {
    if (clear) {
      screen.qc = "passed"
      intern.clean += 1
      intern.screenId = null
      state.status = permanent.name + " passed " + screen.name + "."
      maybeShipStaff(project)
      return
    }
    if ((screen.tries || 0) < 1 && Math.random() > permanent.miss) {
      screen.qc = "returned"
      state.status = permanent.name + " sent " + screen.name + " back."
      return
    }
    giveBack(project, screen.name + " still misses", permanent)
    return
  }
  if (clear) {
    screen.qc = "passed"
    intern.clean += 1
    state.status = intern.name + " finished " + screen.name + "."
  } else {
    screen.qc = "miss"
    state.status = intern.name + " missed " + screen.name + "."
  }
  intern.screenId = null
}
function runScreens(dt) {
  state.staff.filter((staff) => staff.role === "permanent").forEach((staff) => runPermanent(staff, dt))
  state.staff.filter((staff) => staff.role === "intern").forEach((staff) => runIntern(staff, dt))
}
function spawn(reason) {
  const project = makeProject()
  state.queue.push(project)
  if (!state.openId) state.openId = project.id
  if (project.size === "big" && !state.eventSeen) {
    state.eventSeen = true
    state.event = { projectId: project.id, client: project.client }
  }
  if (reason === "timer") state.status = "New client · " + describe(project) + ". Start it when you are ready."
  return project
}
export function startClient(project) {
  if (state.break) {
    state.status = "The month is paused."
    commit()
    return
  }
  if (!project || project.started) return
  if (state.staff.some((staff) => staff.projectId === project.id)) return
  noteHand()
  project.started = true
  project.claimedBy = "player"
  state.openId = project.id
  state.status = project.client + " started. " + timeLabel(project.onTimeLeft) + " on the clock."
  commit()
}
function completeShip(project, method, staff) {
  const pay = projectFee(project)
  if (pay == null) return
  const named = project.reqs.filter((req) => req.named)
  const pressedFree = !project.playerEdited && named.length > 0 && named.every((req) => {
    if (!isCovered(project, req)) return false
    if (isVisualReq(req)) return meetsBar(grade(project, req.element, req.prop), clientBar(project))
    return (req.group === "type" || req.group === "flow") && passes(project, req)
  })
  const handsFree = method === "auto" || pressedFree
  const firstFree = handsFree && !state.handsFreeEver
  state.money = roundMoney(state.money + pay)
  state.lastIndustry = project.industry
  const onTimeLeft = project.onTimeLeft
  const fit = screenGrade(project) === "best" && typeFlowMet(project)
  if (fit && project.temper === "sound" && onTimeLeft > 0) {
    if (project.attemptedBy != null) {
      const attempter = state.staff.find((item) => item.id === project.attemptedBy)
      if (attempter) attempter.miss = 0.2
    } else if (!state.everHired) {
      state.nextHireFloor = 0.2
    }
  }
  if (method === "hand" && fit && project.temper === "sound") {
    state.headUnlocked = true
    state.headOffer = project.elements.background.colour
  }
  const tokensWereOpen = tokensUnlocked()
  state.accepted += 1
  if (method === "hand") {
    state.handShips += 1
    if (state.handShips === 1) teach("components", "Components", "Components are for sale in the tree. After you buy them, an intern sets both cards in one step.")
    if (state.handShips === 3) teach("intern", "Intern", "Someone else can take the other frames. You are starting to manage.")
  }
  if (project.size === "big") {
    state.bigDone[project.industry] = true
    state.month.bigShipped = true
    teach("lang-" + project.industry, LANG[project.industry].system, "You remember this one. The intern implements it faster, and does not miss.")
  }
  if (!tokensWereOpen && tokensUnlocked()) teach("tokens", "Base values", "You remember the base. The intern sets it on every frame in one step.")
  if (handsFree) state.handsFreeEver = true
  if (method === "auto" && staff) staff.clean += 1
  state.staff.forEach((person) => {
    if (person.projectId !== project.id) return
    person.projectId = null
    person.screenId = null
  })
  const who = method === "auto" && staff ? staff.name + " shipped " : "Shipped "
  state.status = who + project.client + " · $" + pay + "."
  if (firstFree) state.status += " Big-client cap is off."
  state.queue = state.queue.filter((item) => item.id !== project.id)
  if (state.openId === project.id) {
    state.openId = null
    state.selectedEl = null
  }
  if (!state.queue.length) spawn("fill")
}
function handShip() {
  if (state.break) {
    state.status = "The month is paused."
    commit()
    return
  }
  noteHand()
  const project = state.queue.find((item) => item.claimedBy === "player" && item.id === state.openId) || playerJob() || focused()
  if (!project) {
    state.status = "No client to ship."
    commit()
    return
  }
  state.openId = project.id
  const held = firstHold(project)
  if (held) {
    state.status = "Ship held. " + held.screen.name + " · " + (NAMES[held.req.element] || held.req.element) + " " + held.req.group + " is Wrong."
    commit()
    return
  }
  if (projectFee(project) == null) {
    const screen = blockingScreen(project)
    state.status = "Ship held. " + (screen ? screen.name : "A screen") + " still needs work."
    commit()
    return
  }
  completeShip(project, "hand", null)
  commit()
}
function runArrival(dt) {
  if (state.queue.length >= waitingCap()) return
  if (!state.queue.length && state.accepted >= 1) {
    spawn("fill")
    state.arrivalLeft = interval()
    return
  }
  state.arrivalLeft -= dt
  if (state.arrivalLeft <= 0) {
    spawn(state.queue.length ? "timer" : "fill")
    state.arrivalLeft = interval()
  }
}
function settlePayroll() {
  const until = monthLength
  const departed = payrollLedger.map((line) => ({ name: line.name, amount: line.amount }))
  const active = state.staff.map((staff) => ({
    staff,
    name: staff.name,
    amount: employmentAmount(staff, until)
  }))
  const owed = () => roundMoney(
    departed.reduce((sum, line) => sum + line.amount, 0) +
    active.reduce((sum, line) => sum + line.amount, 0)
  )
  const left = []
  const dismiss = (role) => {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].staff.role !== role) continue
      const gone = active.splice(i, 1)[0]
      const index = state.staff.findIndex((staff) => staff.id === gone.staff.id)
      if (index >= 0) {
        const removed = state.staff.splice(index, 1)[0]
        releaseStaff(removed)
      }
      if (gone.amount > 0) left.push({ name: gone.name, amount: gone.amount })
      return true
    }
    return false
  }
  while (active.length && owed() - state.money > 0.001) {
    const shortfall = roundMoney(owed() - state.money)
    const internPay = roundMoney(active.filter((item) => item.staff.role === "intern").reduce((sum, item) => sum + item.amount, 0))
    const internsCover = internPay + 0.001 >= shortfall && active.some((item) => item.staff.role === "intern")
    const role = internsCover ? "intern" : active.some((item) => item.staff.role === "permanent") ? "permanent" : "intern"
    if (!dismiss(role)) break
  }
  const paidLines = combineLines(departed.concat(active.map((item) => ({ name: item.name, amount: item.amount }))))
  const payable = roundMoney(paidLines.reduce((sum, line) => sum + line.amount, 0))
  const paid = roundMoney(Math.min(state.money, payable))
  state.money = roundMoney(Math.max(0, state.money - paid))
  payrollLedger = []
  state.staff.forEach((staff) => { staff.startedAt = monthLength })
  const fullyPaid = left.length === 0 && paid + 0.001 >= payable
  return { paid, payable, left, paidLines, fullyPaid }
}
function refreshQualified() {
  if (!stage3Active()) state.month.qualified = false
}
// How a hand touch counts toward the win.
//
// Round 5 target: pressing Ship while it is held, selecting a client, opening
// it, and Start do not increment the hand counter. Only a real value change
// does. Take-back counts as a hand touch only when it changes a value back.
// This branch still calls noteHand on select, open, Start, held Ship, and
// take-back. Track A makes those call sites match the target.
//
// Hands-free is only the big-client cap: a clean auto-ship, or Ship pressed
// with nothing edited because tokens, a language, or the design process
// already met every judged requirement. That press does not count as a hand
// ship for the cap.
//
// WIN_HAND_TOUCH selects the win rule.
// "strict" (default): any recorded hand touch blocks the win.
// "one": a single hand action in the win month still wins. A second one blocks it.
//
// Simulation evidence, not a reason to change the default: allowing one hand
// action in the win month gives about a 99.5% hands-off win rate. The strict
// rule gives about 85%.
const WIN_HAND_TOUCH = "strict"
function noteHand() {
  state.month.handTouches = (state.month.handTouches || 0) + 1
  state.month.handTouch = true
}
function handsBlockWin() {
  const touches = state.month.handTouches || 0
  if (WIN_HAND_TOUCH === "one") return touches > 1
  return touches > 0
}
function openBreak() {
  if (state.break) return
  const qualified = state.month.qualified
  const big = state.month.bigShipped
  const hands = handsBlockWin()
  const payroll = settlePayroll()
  const won = qualified && big && !hands && payroll.fullyPaid
  if (won) {
    state.wins += 1
    state.showBanner = true
  }
  let note = payrollNote(payroll)
  if (won) note = "Won the month. " + note
  state.break = { note, won }
  state.status = note
  state.monthLeft = 0
}
export function continueMonth() {
  if (!state.break) return
  state.break = null
  state.monthIndex += 1
  state.month = { qualified: stage3Active(), bigShipped: false, handTouch: false, handTouches: 0 }
  state.monthLeft = monthLength
  payrollLedger = []
  state.staff.forEach((staff) => { staff.startedAt = 0 })
  state.status = "Month " + state.monthIndex + ". Week 1."
  commit()
}
function hire() {
  if (state.handShips < 3) return
  if (state.staff.some((staff) => staff.role === "intern")) {
    state.status = "One intern at a time. They build the other screens. Promote them before the next hire."
    commit()
    return
  }
  let pct
  let miss
  if (typeof state.nextHireFloor === "number") {
    miss = state.nextHireFloor
    pct = Math.round(miss * 100)
    state.nextHireFloor = null
  } else {
    pct = 20 + Math.floor(Math.random() * 31)
    miss = pct / 100
  }
  const name = STAFF_NAMES[state.nextStaffId - 1] || ("Intern " + state.nextStaffId)
  state.staff.push({
    id: state.nextStaffId++,
    name,
    role: "intern",
    pay: internWage,
    miss,
    clean: 0,
    projectId: null,
    screenId: null,
    workLeft: 0,
    startedAt: monthElapsed()
  })
  const tokensWereOpen = tokensUnlocked()
  state.everHired = true
  if (!tokensWereOpen && tokensUnlocked()) teach("tokens", "Base values", "You remember the base. The intern sets fills, corners, or contrast in one step. Base colour does not set the contrast text.")
  state.status = name + " hired. $" + internWage + " a month. They design the other screens from yours."
  if (!state.break) state.staff.filter((staff) => staff.role === "intern").forEach((staff) => runIntern(staff, 0))
  commit()
}
function fire(id) {
  const index = state.staff.findIndex((staff) => staff.id === id)
  if (index < 0) return
  const staff = state.staff[index]
  rememberPay(staff, monthElapsed())
  releaseStaff(staff)
  state.staff.splice(index, 1)
  state.status = staff.name + " is fired. Future pay stops."
  commit()
}
function promote(id) {
  const staff = state.staff.find((item) => item.id === id)
  if (!staff || staff.role !== "intern" || staff.clean < 3) return
  const project = state.queue.find((item) => item.id === staff.projectId)
  if (project) {
    project.screens.forEach((screen) => {
      if (screen.owner !== staff.id || screen.qc === "passed") return
      screen.owner = "player"
      screen.goal = null
      screen.qc = null
      screen.done = false
    })
  }
  rememberPay(staff, monthElapsed())
  staff.role = "permanent"
  staff.pay = permanentWage
  staff.startedAt = monthElapsed()
  staff.projectId = null
  staff.screenId = null
  state.status = staff.name + " is permanent. $" + permanentWage + " a month. They start clients you have not started."
  teach("permanent", "Permanent", "They start the clients. You do not have to walk in first.")
  teachProcess()
  commit()
}
function buyHead() {
  if (!state.headUnlocked || !state.headOffer || !COLOURS[state.headOffer]) return
  const price = shipPay({ size: "small" })
  if (state.money < price) return
  state.money -= price
  state.status = "Head start offers " + COLOURS[state.headOffer].name + "."
  commit()
}
function buyTool(key) {
  if (!studioOpen() || state.tools[key] || state.money < 12) return
  state.money -= 12
  state.tools[key] = true
  const names = { swatches: "Swatches", radius: "Radius variable", contrast: "Contrast slider", components: "Components", styles: "Colour styles" }
  state.status = (names[key] || key) + " is on."
  if (key === "components") teach("radius-offer", "Radius variable", "One number for every corner. You remember the frame being 4 larger.")
  if (key === "radius") teach("styles-offer", "Colour styles", "The fills hold. An intern does not miss them.")
  commit()
}
function buyToken(key) {
  if (!tokensUnlocked() || state.tokens[key] || state.money < 12) return
  state.money -= 12
  state.tokens[key] = true
  state.status = TOKEN_NAME[key] + " is on. The intern sets it in one step."
  commit()
}
function buyLanguage(industry) {
  if (!state.bigDone[industry] || state.codified[industry] || state.money < 15) return
  state.money -= 15
  state.codified[industry] = true
  state.status = LANG[industry].system + " is on. The intern implements it faster."
  teachProcess()
  commit()
}
function applyProcessToProject(project) {
  if (!project || !project.hasUX) return
  const screens = project.screens || []
  if (!screens.length) {
    applyPrefill(project)
    return
  }
  screens.forEach((screen) => {
    const apply = () => applyPrefill(project)
    if (screen.elements === project.elements) apply()
    else using(project, screen.elements, apply)
    if (state.process.research && screen.elements !== project.elements) {
      const specs = productScreens(project)
      const spec = specs.find((item) => item.name === screen.name) || specs[0]
      paintCopy(screen.elements, spec, false)
    }
  })
}
function buyProcess(key) {
  if (!stage3Active() || state.process[key] || state.money < 24) return
  state.money -= 24
  state.process[key] = true
  state.queue.forEach(applyProcessToProject)
  state.status = PROCESS_INFO[key][0] + " is on."
  commit()
}
function claimProject(project) {
  const stole = state.staff.some((staff) => staff.projectId === project.id)
  state.staff.forEach((staff) => {
    if (staff.projectId !== project.id) return
    staff.projectId = null
    staff.screenId = null
  })
  ;(project.screens || []).forEach((screen) => {
    if (screen.qc === "passed") return
    screen.owner = "player"
    screen.goal = null
    screen.done = false
  })
  project.claimedBy = "player"
  project.staffId = null
  project.working = false
  project.flagged = false
  if (stole) noteHand()
}
function watching(project) {
  return !!project && project.claimedBy !== "player" && state.staff.some((staff) => staff.projectId === project.id)
}
function screenEditable(project, screen) {
  if (!project || !screen || !project.started) return false
  if (watching(project)) return false
  if (screen.owner && screen.owner !== "player") return false
  return true
}
const SAME_TYPE = { cardA: ["cardA", "cardB"], cardB: ["cardA", "cardB"] }
function selectionIds() {
  const id = state.selectedEl
  if (!id) return []
  if (state.tools.components && SAME_TYPE[id]) return SAME_TYPE[id].slice()
  return [id]
}
function openProject(project, element) {
  if (!project) return
  state.openId = project.id
  const screen = activeScreen(project)
  if (watching(project) || (screen && screen.owner && screen.owner !== "player")) {
    state.selectedEl = null
    commit()
    return
  }
  if (element && project.claimedBy !== "player") claimProject(project)
  const current = activeScreen(project)
  if (current && (current.owner === "player" || current.owner == null)) {
    current.owner = "player"
    project.elements = current.elements
  }
  state.selectedEl = element || null
  noteHand()
  commit()
}
export function setRadius(value, fromBackground) {
  const radius = clampRadius(value)
  if (!state.tools.radius) {
    edited((_, item) => { item.radius = radius })
    return
  }
  const component = fromBackground ? clampRadius(radius - PARAMS.radiusStep) : radius
  edited((project) => {
    const screen = activeScreen(project)
    if (!screen) return
    ;["title", "cardA", "cardB", "save"].forEach((id) => { screen.elements[id].radius = component })
    screen.elements.background.radius = clampRadius(component + PARAMS.radiusStep)
  })
}
function edited(fn) {
  const project = state.queue.find((item) => item.id === state.openId)
  if (!project || !state.selectedEl) return
  const screen = activeScreen(project)
  if (!screenEditable(project, screen)) return
  if (screen.elements !== project.elements) project.elements = screen.elements
  const ids = selectionIds()
  const before = JSON.stringify(screen.elements) + JSON.stringify(project.flow)
  ids.forEach((id) => fn(project, screen.elements[id], id))
  const after = JSON.stringify(screen.elements) + JSON.stringify(project.flow)
  if (before === after) return
  project.playerEdited = true
  screen.touched = true
  if (screen.qc === "passed") screen.qc = null
  noteHand()
  state.staff.filter((staff) => staff.role === "intern").forEach((staff) => runIntern(staff, 0))
  commit()
}
function reqGradeWord(reached) {
  if (reached === "best") return "Best practice"
  if (reached === "acceptable") return "Acceptable"
  if (reached === "bare") return "Bare minimum"
  return "Wrong"
}
function reqShowsMatch(project, req) {
  const el = project.elements[req.element]
  if (!el) return false
  const lang = LANG[project.industry]
  const codified = !!state.codified[project.industry]
  if (req.prop === "colour") {
    if (state.tokens.colour && el.colour === VAGUE_COLOUR[req.element]) return true
    return codified && el.colour === lang.colour[req.element]
  }
  if (req.prop === "radius") {
    if (state.tokens.radius && el.radius === 16) return true
    return codified && el.radius === targetRadius(lang, req.element)
  }
  if (req.prop === "contrast") {
    if (state.tokens.contrast && el.contrast === 21) return true
    if (!codified || req.element === "background") return false
    const painted = { elements: {} }
    ELEMENT_IDS.forEach((id) => {
      painted.elements[id] = { colour: lang.colour[id], contrast: 21 }
    })
    return Math.abs(paintedContrast(project, req.element) - paintedContrast(painted, req.element)) < 1e-6
  }
  return false
}
function nowText() {
  return ""
}
function timeLabel(seconds) {
  const left = Math.ceil(seconds)
  if (left >= 60) {
    const m = Math.floor(left / 60)
    const s = left % 60
    return m + ":" + String(s).padStart(2, "0")
  }
  return left + "s"
}
function queueState(project) {
  if (!project.started) return "Start"
  if (project.onTimeLeft > 0) return timeLabel(project.onTimeLeft)
  return "Late"
}
function screenWorker(screen) {
  if (!screen || !screen.owner || screen.owner === "player") return "You"
  const staff = state.staff.find((item) => item.id === screen.owner)
  return staff ? staff.name : "Intern"
}
function needsYourFrame(project) {
  if (!project.started || project.claimedBy !== "player" || project.flagged) return false
  if (!state.staff.some((staff) => staff.role === "intern")) return false
  if (referenceScreen(project)) return false
  return (project.screens || []).some((screen) => screenWorker(screen) === "You" && screen.qc !== "passed")
}
export function projectWatch(project) {
  if (!project) return { needsYou: false, line: "" }
  const screens = project.screens || []
  if (!project.started) return { needsYou: true, line: "Waiting for you" }
  if (project.flagged) return { needsYou: true, line: project.missNote || "Needs you" }
  const missed = screens.find((screen) => screen.qc === "miss")
  if (missed) return { needsYou: true, line: "Needs you · " + missed.name }
  if (needsYourFrame(project)) {
    const intern = state.staff.find((staff) => staff.role === "intern")
    const name = intern ? intern.name : "Your intern"
    return { needsYou: true, line: name + " is waiting on your frame" }
  }
  const blocking = screens.filter((screen) => screenBlocks(project, screen))
  if (blocking.length) return { needsYou: false, line: blocking.map((screen) => screenWorker(screen) + " · " + screen.name).join(", ") }
  if (shipProblems(project).length || projectFee(project) == null) return { needsYou: false, line: "Ship held" }
  return { needsYou: false, line: "Ready to ship" }
}
function elementFailing(project, id) {
  return project.reqs.some((req) => req.focus === id && !passes(project, req))
}


function studioOpen() { return state.handShips >= 1 }
function shipTarget() {
  return state.queue.find((item) => item.claimedBy === "player" && item.id === state.openId) || playerJob() || focused()
}
function refreshShipOffer() {
  const project = state.break ? null : shipTarget()
  const held = project && firstHold(project)
  const fee = held || !project ? null : projectFee(project)
  state.shipDisabled = fee == null
  state.canShip = fee != null
  state.shipFee = fee
}
// Headless clock. Browser play uses start(), which calls this same tick.
// Scripts call advance(seconds) and spawn(reason). The slice defaults to the
// browser frame cap so a headless second matches a played second.
export function advance(seconds, step) {
  let left = Number(seconds) || 0
  const slice = Math.max(0.05, Number(step) || 0.25)
  while (left > 1e-9) {
    const dt = Math.min(slice, left)
    tick(dt)
    left -= dt
  }
}
function tick(dt) {
  if (!worldPaused()) {
    runScreens(dt)
    runArrival(dt)
    state.monthLeft -= dt
    for (const project of state.queue) {
      if (project.started && project.onTimeLeft > 0) {
        project.onTimeLeft = Math.max(0, project.onTimeLeft - dt)
        if (project.onTimeLeft === 0 && !project.deadlineTold) {
          project.deadlineTold = true
          state.status = project.client + " missed the deadline. Ship still pays."
        }
      }
    }
    if (state.monthLeft <= 0 && !state.break) {
      openBreak()
      saveNow()
    }
  }
  refreshQualified()
  const stamp = structuralStamp()
  if (stamp !== lastStamp) {
    lastStamp = stamp
    refreshPayrollOffer()
    refreshShipOffer()
    notify()
  }
  if (!worldPaused()) notifyClock()
  scheduleSave()
}

export const view = { z: 0.64, x: 0, y: 0, stretch: 0, springing: false }
const ZMIN = 0.2
const ZMAX = 2.4
function notifyView() {
  viewListeners.forEach((fn) => fn())
}
export function resetView() {
  view.z = 0.64
  view.x = 0
  view.y = 0
  view.stretch = 0
  notifyView()
}
let springTimer = 0
function scheduleSpring() {
  clearTimeout(springTimer)
  springTimer = setTimeout(() => {
    if (view.stretch > 0.2 && neighborProject(1)) popView(1)
    else if (view.stretch < -0.2 && neighborProject(-1)) popView(-1)
    else springStretch()
  }, 180)
}
function springStretch() {
  if (view.springing) return
  view.springing = true
  const step = () => {
    view.stretch *= 0.8
    if (Math.abs(view.stretch) < 0.01) {
      view.stretch = 0
      view.springing = false
      notifyView()
      return
    }
    notifyView()
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
function neighborProject(dir) {
  if (!state.staff.length) return null
  const ring = []
  const mine = state.queue.find((project) => project.claimedBy === "player") || focused()
  if (mine) ring.push(mine)
  state.staff.forEach((staff) => {
    const project = state.queue.find((item) => item.id === staff.projectId || item.staffId === staff.id)
    if (project && ring.every((item) => item.id !== project.id)) ring.push(project)
  })
  if (ring.length < 2) return null
  const current = focused()
  let index = ring.findIndex((project) => current && project.id === current.id)
  if (index < 0) index = 0
  const next = ring[(index + dir + ring.length) % ring.length]
  if (!next || (current && next.id === current.id)) return null
  return next
}
function popView(dir) {
  const next = neighborProject(dir)
  view.stretch = 0
  view.springing = false
  if (!next) {
    springStretch()
    return
  }
  resetView()
  openProject(next, null)
}
export function panBy(dx, dy) {
  view.x += dx
  view.y += dy
  notifyView()
}
export function zoomAt(deltaY, cx, cy) {
  const next = Math.min(ZMAX, Math.max(ZMIN, view.z * Math.exp(-deltaY * 0.0016)))
  const wx = (cx - view.x) / view.z
  const wy = (cy - view.y) / view.z
  view.z = next
  view.x = cx - wx * next
  view.y = cy - wy * next
  view.stretch = 0
  notifyView()
}
export function openScreen(project, screenId) {
  if (!project) return
  const screen = (project.screens || []).find((item) => item.id === screenId) || activeScreen(project)
  if (!screen) return
  state.openId = project.id
  project.screenId = screen.id
  noteHand()
  if (screen.owner === "player" || screen.owner == null) {
    screen.owner = "player"
    project.elements = screen.elements
  } else state.selectedEl = null
  commit()
}
export function takeScreen(project, screenId) {
  if (!project) return
  const screen = (project.screens || []).find((item) => item.id === screenId)
  if (!screen) return
  if (screen.owner && screen.owner !== "player") {
    const staff = state.staff.find((item) => item.id === screen.owner)
    if (staff) {
      if (staff.screenId === screen.id) staff.screenId = null
      const still = (project.screens || []).some((item) => item.id !== screen.id && item.owner === staff.id && item.qc !== "passed")
      if (!still) {
        staff.projectId = null
        if (project.staffId === staff.id) project.staffId = null
      }
    }
    screen.owner = "player"
    screen.held = true
    screen.qc = null
    screen.goal = null
    screen.done = false
    screen.touched = true
    project.claimedBy = "player"
    project.playerEdited = true
    noteHand()
    state.status = "You took " + screen.name + " back."
  }
  project.screenId = screen.id
  project.elements = screen.elements
  state.openId = project.id
  commit()
}
export function blockingScreen(project) {
  if (!project || !project.screens) return null
  return project.screens.find((screen) => screenBlocks(project, screen)) || null
}

const listeners = new Set()
const clockListeners = new Set()
const viewListeners = new Set()
let lastStamp = ""
let saveTimer = null
let lastSaveAt = 0

function notify() {
  listeners.forEach((fn) => fn())
}
function notifyClock() {
  refreshPayrollOffer()
  clockListeners.forEach((fn) => fn())
}
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export function subscribeClock(fn) {
  clockListeners.add(fn)
  return () => clockListeners.delete(fn)
}
export function subscribeView(fn) {
  viewListeners.add(fn)
  return () => viewListeners.delete(fn)
}

function timeBucket(project) {
  if (!project || !project.started) return "wait"
  if (project.onTimeLeft <= 0) return "late"
  if (project.onTimeLeft <= 30) return "urgent"
  return "ok"
}
function structuralStamp() {
  const queue = state.queue.map((project) => [
    project.id,
    project.started ? 1 : 0,
    project.client,
    project.claimedBy || "",
    project.flagged ? 1 : 0,
    project.missNote || "",
    project.screenId || "",
    timeBucket(project),
    listStamp(project)
  ].join("~")).join("#")
  const staff = state.staff.map((member) => [
    member.id,
    member.role,
    member.pay,
    member.projectId || "",
    member.screenId || "",
    member.clean,
    member.miss,
    member.name
  ].join(":")).join(",")
  return [
    queue,
    staff,
    state.money,
    state.status,
    state.saveNote,
    state.openId || "",
    state.selectedEl || "",
    state.break ? 1 : 0,
    state.studioName,
    state.monthIndex,
    state.wins,
    state.handShips,
    state.accepted,
    state.canShip ? 1 : 0,
    state.shipDisabled ? 1 : 0,
    state.shipFee ?? "",
    state.notices.length,
    state.showBanner ? 1 : 0,
    state.month.handTouches,
    state.month.qualified ? 1 : 0,
    state.month.bigShipped ? 1 : 0,
    state.everHired ? 1 : 0,
    state.wikiOpen ? 1 : 0,
    state.headUnlocked ? 1 : 0,
    state.sold,
    state.specialty || "",
    JSON.stringify(state.tokens),
    JSON.stringify(state.process),
    JSON.stringify(state.codified),
    JSON.stringify(state.tools),
    JSON.stringify(state.bigDone)
  ].join("||")
}

let started = false
const SAVE_KEY = "sell-the-system-v4"

function writeSave() {
  if (!started || typeof localStorage === "undefined") return
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ saveVersion, state, ledger: payrollLedger }))
    lastSaveAt = Date.now()
  } catch (error) {
    void error
  }
}
function scheduleSave() {
  if (!started) return
  const now = Date.now()
  if (now - lastSaveAt >= saveThrottleMs) {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    writeSave()
    return
  }
  if (saveTimer) return
  const wait = Math.max(0, saveThrottleMs - (now - lastSaveAt))
  saveTimer = setTimeout(() => {
    saveTimer = null
    writeSave()
  }, wait)
  if (saveTimer && typeof saveTimer.unref === "function") saveTimer.unref()
}
function saveNow() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  writeSave()
}
export function acceptSave(data) {
  if (!data || typeof data !== "object") return { ok: false, reason: "corrupt" }
  if (data.saveVersion !== saveVersion) return { ok: false, reason: "version" }
  if (!data.state || !data.state.studioName) return { ok: false, reason: "empty" }
  return { ok: true }
}
function restore() {
  if (typeof localStorage === "undefined") return false
  let raw = null
  try {
    raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    const accepted = acceptSave(data)
    if (!accepted.ok) {
      state.saveNote = accepted.reason === "version"
        ? "A saved game from another version was not loaded."
        : "A saved game could not be read and was not loaded."
      return false
    }
    Object.assign(state, data.state)
    state.saveNote = ""
    payrollLedger = Array.isArray(data.ledger) ? data.ledger : []
    return true
  } catch (error) {
    void error
    if (raw) state.saveNote = "A saved game could not be read and was not loaded."
    return false
  }
}
export function start() {
  if (started) return
  started = true
  const restored = restore()
  if (!restored) {
    spawn("start")
    state.arrivalLeft = interval()
    state.status = state.saveNote || ""
  }
  refreshPayrollOffer()
  refreshShipOffer()
  lastStamp = structuralStamp()
  notify()
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveNow()
    })
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", () => saveNow())
  }
  let last = performance.now()
  const frame = (now) => {
    const dt = Math.min(0.25, (now - last) / 1000)
    last = now
    if (dt > 0) tick(dt)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
function commit() {
  refreshPayrollOffer()
  refreshShipOffer()
  lastStamp = structuralStamp()
  scheduleSave()
  notify()
}

function hiddenWrongs(project, held) {
  const seen = new Set(held.map((req) => (req.focus || req.element) + ":" + req.prop))
  const found = []
  const add = (req) => {
    const key = (req.focus || req.element) + ":" + req.prop
    if (seen.has(key)) return
    seen.add(key)
    found.push(req)
  }
  ELEMENT_IDS.forEach((id) => {
    const props = id === "background" ? ["colour", "radius"] : ["colour", "radius", "contrast"]
    props.forEach((prop) => {
      if (grade(project, id, prop) !== "wrong") return
      const existing = project.reqs.find((req) => (req.focus || req.element) === id && req.prop === prop)
      if (existing) add(existing)
      else add({
        element: id,
        focus: id,
        prop,
        group: prop,
        title: NAMES[id],
        base: prop === "radius" ? radiusHint(project, id) : prop === "contrast" ? "Contrast under 3" : "Hot colour",
        named: false
      })
    })
  })
  project.reqs.forEach((req) => {
    if ((req.group === "type" || req.group === "flow") && !passes(project, req)) add(req)
  })
  return found
}
function explainBlocked(project, screen) {
  const held = project.reqs.filter((req) => holdsShip(project, req))
  if (project.id <= 3 && held.length) return held
  const rows = held.concat(hiddenWrongs(project, held))
  if (rows.length) return rows
  const qc = screen && screen.qc
  return [{
    element: "background",
    focus: "background",
    prop: "flow",
    group: "flow",
    title: screen ? screen.name : "Screen",
    base: qc === "returned" ? "Sent back" : qc === "miss" ? "Missed" : "Still blocking Ship",
    named: true
  }]
}
export function shipProblems(project) {
  if (!project) return []
  const screens = project.screens && project.screens.length ? project.screens : []
  const problems = []
  const push = (screen, req) => {
    const word = req.group === "type" || req.group === "flow"
      ? (req.base || "Wrong")
      : reqGradeWord(grade(project, req.element, req.prop))
    problems.push({ screen, req, word })
  }
  screens.forEach((screen) => {
    if (!screenBlocks(project, screen)) return
    using(project, screen.elements, () => {
      explainBlocked(project, screen).forEach((req) => push(screen, req))
    })
  })
  return problems
}
export function shownGrade(project, elementId, prop) {
  const reached = grade(project, elementId, prop)
  if (reached !== "wrong") return reqGradeWord(reached)
  const judged = (project.reqs || []).some((req) => (req.focus || req.element) === elementId && req.prop === prop)
  if (judged) return "Wrong"
  const blocking = shipProblems(project).some((problem) => (problem.req.focus || problem.req.element) === elementId && problem.req.prop === prop)
  return blocking ? "Wrong" : "Not judged"
}
export function stageProgress() {
  if (stage() >= 3) return "Stage 3 is open. New clients include UX."
  const permanent = state.staff.some((staff) => staff.role === "permanent")
  const language = INDUSTRIES.filter((id) => state.codified[id]).map((id) => LANG[id].system)
  const intern = state.staff.find((staff) => staff.role === "intern")
  const clean = intern ? intern.clean : 0
  const people = permanent ? "A permanent is on the team." : "Promote an intern after 3 clean screens (" + clean + "/3)."
  const system = language.length ? language.join(", ") + " is codified." : "Ship a big client, then buy that system."
  return "Stage 3 needs a permanent and a codified language. " + people + " " + system
}
export function chooseFork(choice) {
  if (state.fork) return
  if (choice === "specialist") {
    const industry = state.lastIndustry && LANG[state.lastIndustry] ? state.lastIndustry : "fintech"
    state.specialty = industry
    state.fork = "specialist"
    state.status = "Specialist. New clients are " + LANG[industry].name + "."
  } else {
    state.specialty = null
    state.fork = "generalist"
    state.status = "Generalist. Clients keep mixing."
  }
  commit()
}
export function takeBig() {
  if (!state.event) return
  const name = state.event.client
  state.event = null
  state.status = name + " stays. A big ship pays $36, or $48 once Stage 3 is open. A small ship pays $6, or $3 when it is short."
  commit()
}
export function turnDownBig() {
  if (!state.event) return
  const name = state.event.client
  const id = state.event.projectId
  state.event = null
  state.queue = state.queue.filter((project) => project.id !== id)
  if (state.openId === id) {
    state.openId = state.queue[0] ? state.queue[0].id : null
    state.selectedEl = null
  }
  state.money = roundMoney(state.money + 6)
  state.status = "Turned " + name + " down. $6 for the time. A ship fee is $6 or $3, not $12."
  if (!state.queue.length) spawn("fill")
  commit()
}
export function sellAgency() {
  const name = state.studioName
  const wins = state.wins
  const sold = (state.sold || 0) + 1
  const keptLang = INDUSTRIES.find((id) => state.codified[id]) || null
  let keptToken = null
  if (!keptLang) {
    if (state.tokens.colour) keptToken = "colour"
    else if (state.tokens.radius) keptToken = "radius"
    else if (state.tokens.contrast) keptToken = "contrast"
  }
  const keptTool = !keptLang && !keptToken && state.tools.components
  payrollLedger = []
  state.money = 24
  state.accepted = 0
  state.handShips = 0
  state.everHired = false
  state.handsFreeEver = false
  state.showBanner = false
  state.monthIndex = 1
  state.monthLeft = monthLength
  state.break = null
  state.arrivalLeft = interval()
  state.month = { qualified: false, bigShipped: false, handTouch: false, handTouches: 0 }
  state.tokens = { colour: keptToken === "colour", radius: keptToken === "radius", contrast: keptToken === "contrast" }
  state.codified = { fintech: keptLang === "fintech", wellness: keptLang === "wellness", editorial: keptLang === "editorial" }
  state.process = { research: false, wire: false, test: false }
  state.bigDone = { fintech: false, wellness: false, editorial: false }
  state.staff = []
  state.nextStaffId = 1
  state.queue = []
  state.projectSeq = 0
  state.openId = null
  state.selectedEl = null
  state.nextHireFloor = null
  state.headOffer = null
  state.headUnlocked = false
  state.wikiOpen = false
  state.studioName = name
  state.tools = { swatches: false, radius: false, contrast: false, components: !!keptTool, styles: false }
  state.notices = []
  state.fork = null
  state.event = null
  state.eventSeen = false
  state.lastIndustry = keptLang
  state.specialty = null
  state.sold = sold
  state.wins = wins
  spawn("fill")
  const perk = keptLang ? LANG[keptLang].system : keptToken ? TOKEN_NAME[keptToken] : keptTool ? "Components" : "the screens"
  state.status = "Sold the agency. " + perk + " came with you."
  commit()
}

export function openParts(project) {
  return shipProblems(project).map((problem) => ({
    id: problem.req.focus || problem.req.element,
    screenId: problem.screen.id,
    screenName: problem.screen.name,
    open: [Object.assign({}, problem.req, { word: problem.word })]
  }))
}

export {
  state,
  WIN_HAND_TOUCH,
  COLOURS,
  NAMES,
  ELEMENT_IDS,
  LANG,
  focused,
  describe,
  clientBrief,
  queueState,
  grade,
  reqGradeWord,
  holdsShip,
  radiusFault,
  radiusHint,
  radiusNeedsBackground,
  feeFor,
  shipButtonLabel,
  studioOpen,
  nearestSwatch,
  openProject,
  playerJob,
  activeScreen,
  screenEditable,
  selectionIds,
  screenOwnerName,
  staffTask,
  monthLength,
  deadlineLength,
  timeLabel,
  edited,
  handShip,
  spawn,
  buyTool,
  hire,
  fire,
  promote,
  buyHead,
  buyToken,
  buyLanguage,
  buyProcess,
  fade,
  inkHex,
  contrastMix,
  paintedContrast,
  typeSize,
  payrollDue,
  stage,
  clampRadius,
  clampContrast,
  bestInk
}
