import { useState } from "react"
import {
  NAMES,
  describe,
  fire,
  buyLanguage,
  buyProcess,
  buyToken,
  buyTool,
  hire,
  openParts,
  openProject,
  selectPart,
  shipCheck,
  promote,
  projectWatch,
  queueState,
  radiusHint,
  shownGrade,
  stageProgress,
  staffTask,
  stepSeconds,
  effectiveMiss,
  systemOwned,
  resetView,
  stage,
  startClient,
  state,
  studioOpen
} from "../engine.js"
import { TargetChip, guidingFirst, moneyText, payrollFacts } from "./guidance.jsx"

const GROUPS = [
  ["colour", "Colour"],
  ["radius", "Radius"],
  ["contrast", "Contrast"]
]

function propertyName(req) {
  if (req.prop === "copy") return "Copy"
  if (req.prop === "hierarchy") return "Hierarchy"
  if (req.prop === "flow") return "Flow"
  const name = req.prop || ""
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Part"
}

function wordOf(project, req) {
  if (req.group === "flow" || req.group === "type") return req.base || "Wrong"
  if (req.word) return req.word
  if (req.group === "colour" || req.group === "radius" || req.group === "contrast") {
    return shownGrade(project, req.element, req.prop)
  }
  return "Open"
}

function tone(word) {
  if (word === "Not judged") return "tone-bare"
  if (word === "Wrong" || word === "Clear intent" || (word && (word.startsWith("Fix ") || word.startsWith("Hierarchy ")))) return "tone-wrong"
  if (word === "Bare minimum") return "tone-bare"
  if (word === "Acceptable") return "tone-ok"
  return "tone-best"
}

export function Dock() {
  const [gradesOpen, setGradesOpen] = useState(false)
  const project = state.queue.find((item) => item.id === state.openId) || null
  const check = project ? shipCheck(project.id) : null
  const parts = openParts(project)
  const heldShip = !!(check && check.held)
  const guide = guidingFirst()
  const guideNow = !!(guide && guide.started && !guide.shipLive && !guide.onLead && parts[0] && project && project.id === guide.project.id && parts[0].id === (guide.lead && guide.lead.id))

  return (
    <aside className="dock">
      <section className="block clients-block">
        <header className="block-head">
          <h2>Clients</h2>
          <span>{state.queue.length}</span>
        </header>
        <ul className="clients">
            {state.queue.map((item) => {
              const watch = projectWatch(item)
              const clock = !item.started ? " due" : item.onTimeLeft <= 0 ? " late" : item.onTimeLeft <= 30 ? " urgent" : ""
              return (
              <li key={item.id}>
                <button
                  type="button"
                  className={"client" + (item.id === state.openId ? " on" : "") + (watch.needsYou ? " call" : "")}
                  data-tip={watch.needsYou ? watch.line : item.started ? "Open this client. Opening does not take a frame back." : "Start this client. The clock begins when you do."}
                  onClick={() => { resetView(); if (!item.started) startClient(item); else openProject(item, null) }}
                >
                  <span className="who">{item.client}</span>
                  <span className={"meta" + (watch.needsYou ? " call" : "")}>{watch.line}</span>
                  <TargetChip project={item} />
                  <span className={"time" + clock}>{queueState(item)}</span>
                </button>
              </li>
              )
            })}
        </ul>
      </section>

      <div className="dock-scroll">
        <section className="block">
          <header className="block-head">
          <h2>To Ship</h2>
          <span>{parts.length ? parts.length + (parts.length === 1 ? " part" : " parts") : heldShip ? "Held" : "Clear"}</span>
        </header>
        {project && !parts.length && <p className="ready">{heldShip ? check.label : "Clear"}</p>}
        {parts.length > 0 && (
          <ul className="more-list">
            {parts.map((group, index) => {
              const req = group.open[0]
              const name = propertyName(req)
              const word = wordOf(project, req)
              const pulse = index === 0 && guideNow
              return (
                <li key={(group.screenId || "") + ":" + group.id + ":" + req.prop}>
                  <button type="button" className={(index === 0 ? "now" : "more") + (pulse ? " guide-pulse" : "")} data-tip="This is holding the ship." onClick={() => selectPart(project, group.screenId, group.id)}>
                    {pulse && <span className="sr-only">Next click. </span>}
                    <span className="part">{group.screenName ? group.screenName + " · " : ""}{NAMES[group.id]}</span>
                    <span className={"prop " + tone(word)}>{name} · {word}{req.prop === "radius" ? " · " + (req.hint || radiusHint(project, group.id)) : ""}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
          <button type="button" className="grades-toggle" aria-expanded={gradesOpen} data-tip="Colour, radius, and contrast on this screen." onClick={() => setGradesOpen((open) => !open)}>
            <span className="grades-label">{gradesOpen ? "Hide grades" : "All grades"}</span>
          </button>
          {gradesOpen && project && (
            <div className="grades">
              {!project.reqs.some((req) => req.group === "radius") && (
                <p className="hint">{radiusHint(project, "title")} Background is already round, so a corner from 12 to 24 is not Wrong.</p>
              )}
              {GROUPS.map(([group, label]) => {
                const reqs = project.reqs.filter((req) => req.group === group)
                if (!reqs.length) return null
                return (
                  <div key={group}>
                    <h3>{label}</h3>
                    <ul>
                      {reqs.map((req) => {
                        const word = wordOf(project, req)
                        const target = group === "radius" ? " · " + radiusHint(project, req.element) : ""
                        return (
                          <li key={req.element + group}>
                            <button type="button" onClick={() => selectPart(project, null, req.focus || req.element)}>
                              <span>{NAMES[req.element]}</span>
                              <span className={tone(word)}>{word}{target}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {studioOpen() && <People />}
        <System />
        <Tree />
      </div>
    </aside>
  )
}

function People() {
  const { due, next, unpayable, reason, lines } = payrollFacts()
  const locked = state.handShips < 3
  const internOnStaff = state.staff.some((staff) => staff.role === "intern")
  const short = due > 0 && state.money < due
  const dueText = moneyText(due)
  const nextText = moneyText(next)
  const warn = reason || ("This hire makes payroll $" + moneyText(due + next) + ". You have $" + moneyText(state.money) + ". Someone leaves at the end of the month.")
  const hireTip = locked
    ? "Ship 3 screens yourself. Hire stays locked until then."
    : internOnStaff
      ? "One intern at a time. They build the other screens. Promote them, then you can hire again."
      : unpayable
        ? warn
        : "They build the screens you are not designing. $" + nextText + " is the rest of this month at $10. The price falls as the month runs. Next month a hire is $10 again."
  return (
    <section className="block studio">
      <header className="block-head">
        <h2>People</h2>
        {state.staff.length > 0 && <span>{short ? "Short" : "$" + dueText}</span>}
      </header>
      {state.staff.map((staff) => (
        <div key={staff.id} className="staff">
          <p>{staff.name} · {staff.role === "permanent" ? "Permanent" : "Intern"} · ${staff.pay}</p>
          <p className="hint">{staffTask(staff)}</p>
          {staff.role === "intern" && <p className="pace">{paceText(state.queue.find((item) => item.id === staff.projectId))} · {missText(staff, state.queue.find((item) => item.id === staff.projectId))}</p>}
          <div className="staff-actions">
            <span className="tip-wrap" data-tip="They leave now. Unfinished frames come back to you.">
              <button type="button" onClick={() => fire(staff.id)}>Fire</button>
            </span>
            {staff.role === "intern" && (
              <span className="tip-wrap" data-tip={staff.clean < 3 ? "Three clean screens, then they start clients for you." : "Starts clients you have not started, then checks the intern. $30 a month."}>
                <button type="button" disabled={staff.clean < 3} onClick={() => promote(staff.id)}>Permanent {staff.clean}/3</button>
              </span>
            )}
          </div>
        </div>
      ))}
      <p className="hint">{"Payroll due $" + dueText + ". Next hire $" + nextText + " for the rest of this month. It falls as the month runs."}</p>
      {lines.map((line) => (
        <p key={line.name} className="hint">{line.name + " · $" + moneyText(line.amount)}</p>
      ))}
      {unpayable && <p className="hint payroll-warn">{warn}</p>}
      <span className="tip-wrap" data-tip={hireTip}>
        <button type="button" className={"buy" + (!locked && !internOnStaff && unpayable ? " warn" : "")} disabled={locked || internOnStaff} onClick={() => hire()}>
          {locked ? "Hire locked · " + state.handShips + "/3" : internOnStaff ? "Intern is hired" : "Hire · $" + nextText}
        </button>
      </span>
    </section>
  )
}

function paceText(project) {
  return stepSeconds(project).toFixed(1) + "s / step"
}
function missText(intern, project) {
  const miss = effectiveMiss(intern, project)
  if (miss <= 0) return "Clean"
  return Math.round(miss * 100) + "% miss"
}
function System() {
  const rows = systemOwned()
  if (!rows.length) return null
  return (
    <section className="block studio">
      <header className="block-head">
        <h2>System</h2>
        <span>{paceText(null)}</span>
      </header>
      {rows.map((row) => (
        <div key={row.id} className="node done" data-tip={row.effect}>
          <span>{row.name}</span>
          <span className="detail">{row.effect}</span>
        </div>
      ))}
    </section>
  )
}
const TOKEN_ROWS = [
  ["colour", "Base colour"],
  ["radius", "Base radius"],
  ["contrast", "Base contrast"]
]
const PROCESS_ROWS = [
  ["research", "User research"],
  ["wire", "Wireframing"],
  ["test", "Usability testing"]
]

function Tree() {
  const tokensReady = state.everHired && state.accepted >= 3
  const rows = []
  if (!state.everHired && state.handShips < 1) {
    rows.push({ id: "intern", name: "Hire", detail: state.handShips + "/3 screens", done: false, locked: true, tip: "Ship 3 screens yourself. Hire stays locked until then." })
  }
  if (state.handShips >= 1 && !state.tools.components) {
    rows.push(node({ id: "components", name: "Components", cost: 12, done: false, locked: null, buy: () => buyTool("components") }))
  } else if (state.handShips >= 1 && !state.tools.radius) {
    rows.push(node({ id: "radius-tool", name: "Radius variable", cost: 12, done: false, locked: null, buy: () => buyTool("radius") }))
  } else if (state.tools.radius && !state.tools.styles) {
    rows.push(node({ id: "styles", name: "Colour styles", cost: 12, done: false, locked: null, buy: () => buyTool("styles") }))
  }
  if (tokensReady) {
    TOKEN_ROWS.forEach(([key, name]) => {
      if (state.tokens[key]) return
      rows.push(node({ id: key, name, cost: 12, done: false, locked: null, buy: () => buyToken(key) }))
    })
  }
  ;["fintech", "wellness", "editorial"].forEach((id) => {
    if (!state.bigDone[id] || state.codified[id]) return
    const system = id === "fintech" ? "Swiss Grid" : id === "wellness" ? "Warm Soft" : "Mono Stark"
    rows.push(node({ id, name: system, cost: 15, done: false, locked: null, buy: () => buyLanguage(id) }))
  })
  if (stage() >= 3) {
    PROCESS_ROWS.forEach(([key, name]) => {
      if (state.process[key]) return
      rows.push(node({ id: key, name, cost: 24, done: false, locked: null, buy: () => buyProcess(key) }))
    })
  }
  const progress = stageProgress()
  if (!rows.length && state.accepted < 1 && !state.everHired) return null
  return (
    <section className="block studio">
      <header className="block-head">
        <h2>Tree</h2>
      </header>
      <p className="hint">{progress}</p>
      {!rows.length && <p className="hint">Nothing to buy until that line moves.</p>}
      {rows.map((row) => row.locked ? (
        <div key={row.id} className="node locked" data-tip={row.tip}>
          <span>{row.name}</span>
          {row.detail && <span className="detail">{row.detail}</span>}
        </div>
      ) : (
        <span key={row.id} className="tip-wrap" data-tip={row.tip}>
          <button type="button" className="node" disabled={state.money < row.cost} onClick={row.buy}>
            {row.name} · ${row.cost}
          </button>
        </span>
      ))}
    </section>
  )
}

const TREE_TIPS = {
  components: "An intern sets both cards in one step.",

  "radius-tool": "One number for this frame. An intern sets every corner in one step.",
  styles: "An intern keeps your fills, and does not miss them.",
  colour: "Fills only. Paper, white cards, an ink title, and an ink button. It does not set the contrast text.",
  radius: "The intern sets every corner in one step.",
  contrast: "The intern sets contrast in one step.",
  fintech: "The intern implements Swiss Grid faster, and does not miss.",
  wellness: "The intern implements Warm Soft faster, and does not miss.",
  editorial: "The intern implements Mono Stark faster, and does not miss.",
  research: "New projects arrive with clear copy.",
  wire: "New projects arrive with hierarchy set.",
  test: "New projects arrive with the demanded state fixed."
}

function node(spec) {
  return {
    id: spec.id,
    name: spec.name,
    detail: spec.detail,
    cost: spec.cost,
    done: spec.done,
    locked: spec.locked,
    buy: spec.buy,
    tip: TREE_TIPS[spec.id] || ""
  }
}
