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
  colour: "New screens use a Paper background, white cards, an ink title, and an ink save button.",
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
  renderKey: "",
  nextHireFloor: null,
  headOffer: null,
  headUnlocked: false,
  wikiOpen: false,
  studioName: "",
  tools: { swatches: false, radius: false, contrast: false, components: false, styles: false },
  notices: [],
  seen: {},
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
  return !state.studioName || state.notices.length > 0 || !!state.break
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
    background: blankElement({ colour: "hot", radius: 0, contrast: 1.6, hierarchy: "body" }),
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
  else if (spec.prop === "radius") base = "Radius 12–24"
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
  if (elementId !== "background" && radius > B) return "wrong"
  if (radius === 0) return "wrong"
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
  if (isVisualReq(req)) {
    if (grade(project, req.element, req.prop) !== "wrong") return false
    return project.standard === "exacting" || req.named === true
  }
  if (req.group === "type" || req.group === "flow") return !passes(project, req)
  return false
}
function holdingLine(project) {
  const exacting = project.standard === "exacting"
  for (let i = 0; i < project.reqs.length; i++) {
    const req = project.reqs[i]
    if (isVisualReq(req)) {
      const reached = grade(project, req.element, req.prop)
      if (reached === "wrong" && (req.named || exacting)) return req
    } else if ((req.group === "type" || req.group === "flow") && !passes(project, req)) {
      return req
    }
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
  return using(project, screen.elements, () => ELEMENT_IDS.some((id) => {
    const props = id === "background" ? ["colour", "radius"] : ["colour", "radius", "contrast"]
    return props.some((prop) => grade(project, id, prop) === "wrong")
  }))
}
function screenBlocks(project, screen) {
  const reference = referenceScreen(project)
  if (!reference || screen === reference) return screenFee(project, screen) == null
  if (screen.qc === "miss" || screen.qc === "returned") return true
  if (matchesLead(screen, reference)) return false
  return screenWrong(project, screen) || screenFee(project, screen) == null
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
  const screens = project.screens || []
  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i]
    const req = using(project, screen.elements, () => holdingLine(project))
    if (req) return { screen, req }
  }
  return null
}
function shipButtonLabel(project) {
  if (!project) return "Ship"
  const fee = projectFee(project)
  if (fee == null) return "Ship held"
  return "Ship · $" + fee
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
  state.money += pay
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
    if (state.handShips === 1) teach("components", "Components", "You remember this. Both cards change together. An intern sets both in one step.")
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
    const role = active.some((item) => item.staff.role === "permanent") ? "permanent" : "intern"
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
// How a Ship press counts toward the win.
//
// GDD, Win: you never opened or fixed a Project by hand. That list is no
// select, no element click, no requirement click, no value edit, and no Ship.
// Game Parameters, Win: you never selected a Project, clicked an element,
// clicked a requirement, edited a value, or pressed Ship.
// Those two win paragraphs agree. Pressing Ship counts as a hand touch.
//
// Both docs also define hands-free, and that rule is only the big-client cap:
// a clean auto-ship, or Ship pressed with nothing edited because tokens, a
// language, or the design process already met every judged requirement.
// That press does not count as a hand ship for the cap. It is not the win rule.
//
// The code today records a hand touch on every Ship press, including a press
// that does not ship and a press completeShip would treat as hands-free for
// the cap. Selecting a project does not, unless it steals work from staff,
// edits a value, or takes a screen back.
//
// WIN_HAND_TOUCH selects that current rule.
// "strict" (default): any recorded hand touch blocks the win, and a Ship press
// is one. This is what both win paragraphs say, and what handShip does today.
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
  state.arrivalLeft = interval()
  if (!tokensWereOpen && tokensUnlocked()) teach("tokens", "Base values", "You remember the base. The intern sets it on every frame in one step.")
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
  const ids = selectionIds()
  const before = JSON.stringify(project.elements) + JSON.stringify(project.flow)
  ids.forEach((id) => fn(project, project.elements[id], id))
  const after = JSON.stringify(project.elements) + JSON.stringify(project.flow)
  if (before === after) return
  project.playerEdited = true
  screen.touched = true
  if (screen.qc === "passed") screen.qc = null
  noteHand()
  state.staff.filter((staff) => staff.role === "intern").forEach((staff) => runIntern(staff, 0))
  refreshWork()
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
  const parts = []
  const seen = new Set()
  screens.forEach((screen) => {
    if (screen.qc === "passed") return
    const who = screenWorker(screen)
    if (seen.has(who)) return
    seen.add(who)
    parts.push(who + " · " + screen.name)
  })
  if (!parts.length) return { needsYou: false, line: "Ready to ship" }
  return { needsYou: false, line: parts.join(", ") }
}
function elementFailing(project, id) {
  return project.reqs.some((req) => req.focus === id && !passes(project, req))
}


function studioOpen() { return state.handShips >= 1 }
function refreshWork() { notify() }
function shipTarget() {
  return state.queue.find((item) => item.claimedBy === "player" && item.id === state.openId) || playerJob() || focused()
}
function refreshShipOffer() {
  const project = state.break ? null : shipTarget()
  const fee = project && !firstHold(project) ? projectFee(project) : null
  state.shipDisabled = fee == null
  state.canShip = fee != null
  state.shipFee = fee
}
function commit() {
  refreshPayrollOffer()
  refreshShipOffer()
  notify()
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
    if (state.monthLeft <= 0) openBreak()
  }
  refreshQualified()
  commit()
}

export const view = { z: 0.64, x: 0, y: 0, stretch: 0, springing: false }
const ZMIN = 0.2
const ZMAX = 2.4
function notifyView() { notify() }
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
function notify() {
  listeners.forEach((fn) => fn())
}
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

let started = false
export function start() {
  if (started) return
  started = true
  spawn("start")
  state.arrivalLeft = interval()
  state.status = ""
  notify()
  let last = performance.now()
  const frame = (now) => {
    const dt = Math.min(0.25, (now - last) / 1000)
    last = now
    if (dt > 0) tick(dt)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

export function openParts(project) {
  if (!project) return []
  const screen = blockingScreen(project) || activeScreen(project)
  if (!screen) return []
  return using(project, screen.elements, () => {
    const blocking = project.reqs.filter((req) => holdsShip(project, req))
    const wrong = blocking.length ? blocking : project.reqs.filter((req) => isVisualReq(req) && grade(project, req.element, req.prop) === "wrong")
    const groups = []
    ELEMENT_IDS.forEach((id) => {
      const open = wrong.filter((req) => (req.focus || req.element) === id).map((req) => Object.assign({}, req, {
        word: reqGradeWord(grade(project, req.element, req.prop))
      }))
      if (open.length) groups.push({ id, open, screenId: screen.id, screenName: screen.name })
    })
    return groups
  })
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
