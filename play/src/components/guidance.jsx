import * as engine from "../engine.js"

const {
  monthLength,
  openParts,
  payrollDue,
  radiusNeedsBackground,
  shipCheck,
  state
} = engine

// hire() writes this pay onto the new intern. Used only when no preview field is exported.
const SEEN_INTERN_PAY = 10

const HIRE_FIELDS = ["nextHireCost", "nextHirePay", "hireCost", "nextPayroll"]

function readValue(names, project) {
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const value = engine[name]
    if (typeof value === "function") {
      const result = value(project)
      if (typeof result === "boolean" || typeof result === "number") return result
    } else if (typeof value === "boolean" || typeof value === "number") {
      return value
    }
    const onState = state[name]
    if (typeof onState === "boolean" || typeof onState === "number") return onState
  }
  return null
}

export function firstClient() {
  return state.queue.find((project) => project.id === 1) || null
}

export function leadOfClient(project) {
  if (!project) return null
  if (radiusNeedsBackground(project)) {
    const req = (project.reqs || []).find((item) => (item.focus || item.element) === "background" && item.prop === "radius")
    return { id: "background", prop: "radius", base: req && req.base ? req.base : "" }
  }
  const group = openParts(project)[0]
  const req = group && group.open[0]
  if (!group || !req) return null
  return { id: group.id, prop: req.prop, base: req.base || "" }
}

export function targetFor(project) {
  if (!project || project.id !== 1) return ""
  const lead = leadOfClient(project)
  return lead && lead.base ? lead.base : ""
}

export function TargetChip({ project }) {
  const target = targetFor(project)
  if (!target) return null
  return <span className="target-chip">Target · {target}</span>
}

export function shipClickEnabled(waiting, project) {
  if (state.break) return false
  if (waiting) {
    if (!project || project.started) return false
    if (state.staff.some((staff) => staff.projectId === project.id)) return false
    return true
  }
  if (!project || !project.started) return false
  return !shipCheck(project.id).held
}

export function moneyText(value) {
  if (typeof value !== "number" || !isFinite(value)) return ""
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

export function guidingFirst() {
  const project = firstClient()
  if (!project || state.accepted > 0) return null
  const started = !!project.started
  const shipLive = started && shipClickEnabled(false, project)
  const lead = leadOfClient(project)
  const onLead = !!(lead && state.openId === project.id && state.selectedEl === lead.id)
  return { project, started, shipLive, lead, onLead }
}

export function payrollFacts() {
  const payroll = state.payroll && typeof state.payroll === "object" ? state.payroll : null
  const due = payroll && typeof payroll.atEnd === "number" ? payroll.atEnd : payrollDue()
  let next = null
  if (typeof state.nextHireCost === "number") next = state.nextHireCost
  else if (payroll && typeof payroll.nextHire === "number") next = payroll.nextHire
  else {
    const exposed = readValue(HIRE_FIELDS, null)
    next = typeof exposed === "number" ? exposed : SEEN_INTERN_PAY
  }
  const flagged = typeof state.nextHireUnpayable === "boolean"
    ? state.nextHireUnpayable
    : payroll && typeof payroll.nextHireUnpayable === "boolean"
      ? payroll.nextHireUnpayable
      : null
  return {
    due,
    next,
    unpayable: flagged != null ? flagged : state.money < due + next,
    reason: payroll && typeof payroll.reason === "string" ? payroll.reason : "",
    lines: payroll && Array.isArray(payroll.atEndLines) ? payroll.atEndLines : []
  }
}

export function weekClock(into) {
  const length = monthLength / 4
  const left = Math.max(0, (1 - into) * length)
  const whole = Math.max(0, Math.ceil(left - 1e-9))
  const minutes = Math.floor(whole / 60)
  const seconds = whole % 60
  return {
    text: minutes + ":" + String(seconds).padStart(2, "0"),
    seconds: whole
  }
}

export function monthLine() {
  const week = monthLength / 4
  if (week === 60 && monthLength === 240) {
    return "A month is four weeks, one minute each. About four minutes, then payroll."
  }
  return "A month is four " + week + "-second weeks. About " + (monthLength / 60) + " minutes, then payroll."
}
