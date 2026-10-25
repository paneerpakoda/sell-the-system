import { useState } from "react"
import {
  NAMES,
  describe,
  fire,
  grade,
  buyLanguage,
  buyProcess,
  buyToken,
  buyTool,
  hire,
  openParts,
  openProject,
  openScreen,
  radiusNeedsBackground,
  promote,
  projectWatch,
  queueState,
  reqGradeWord,
  staffTask,
  stepSeconds,
  effectiveMiss,
  systemOwned,
  resetView,
  playerJob,
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

function wordOf(project, req) {
  if (req.group === "flow" || req.group === "type") return req.base || "Wrong"
  if (req.word) return req.word
  if (req.group === "colour" || req.group === "radius" || req.group === "contrast") {
    return reqGradeWord(grade(project, req.element, req.prop))
  }
  return "Open"
}

function tone(word) {
  if (word === "Wrong" || word === "Clear intent" || (word && (word.startsWith("Fix ") || word.startsWith("Hierarchy ")))) return "tone-wrong"
  if (word === "Bare minimum") return "tone-bare"
  if (word === "Acceptable") return "tone-ok"
  return "tone-best"
}

export function Dock() {
  const [gradesOpen, setGradesOpen] = useState(false)
  const project = playerJob() || state.queue.find((item) => item.id === state.openId) || state.queue[0]
  const parts = openParts(project)
  const blocked = project && radiusNeedsBackground(project)
  const lead = blocked ? { id: "background", open: [{ group: "radius", prop: "radius", element: "background" }] } : parts[0]
  const rest = parts.filter((group) => !lead || group.id !== lead.id)
  const leadReq = lead && lead.open[0]
  const leadWord = leadReq ? wordOf(project, leadReq) : ""
  const guide = guidingFirst()
  const guideNow = !!(guide && guide.started && !guide.shipLive && !guide.onLead && lead && project && project.id === guide.project.id && lead.id === (guide.lead && guide.lead.id))

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
            <span>{parts.length ? parts.length + (parts.length === 1 ? " part" : " parts") : "Clear"}</span>
          </header>
          {project && !parts.length && <p className="ready">Clear</p>}
          {lead && (
            <button type="button" className={"now" + (guideNow ? " guide-pulse" : "")} data-tip="This is holding the ship." onClick={() => { if (lead.screenId) openScreen(project, lead.screenId); openProject(project, lead.id) }}>
              {guideNow && <span className="sr-only">Next click. </span>}
              <span className="part">{lead.screenName && project.screens && project.screens[0] && lead.screenName !== project.screens[0].name ? lead.screenName + " · " : ""}{NAMES[lead.id]}</span>
              <span className={"prop " + tone(leadWord)}>{leadReq.group[0].toUpperCase() + leadReq.group.slice(1)} · {leadWord}</span>
            </button>
          )}
          {rest.length > 0 && (
            <ul className="more-list">
              {rest.map((group) => {
                const req = group.open[0]
                const name = req.group[0].toUpperCase() + req.group.slice(1)
                return (
                  <li key={group.id}>
                    <button type="button" className="more" onClick={() => openProject(project, group.id)}>
                      <span>{NAMES[group.id]}</span>
                      <span className="count">{name}{group.open.length > 1 ? " +" + (group.open.length - 1) : ""}</span>
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
              {GROUPS.map(([group, label]) => {
                const reqs = project.reqs.filter((req) => req.group === group)
                if (!reqs.length) return null
                return (
                  <div key={group}>
                    <h3>{label}</h3>
                    <ul>
                      {reqs.map((req) => {
                        const word = wordOf(project, req)
                        return (
                          <li key={req.element + group}>
                            <button type="button" onClick={() => openProject(project, req.focus || req.element)}>
                              <span>{NAMES[req.element]}</span>
                              <span className={tone(word)}>{word}</span>
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
  const short = due > 0 && state.money < due
  const dueText = moneyText(due)
  const nextText = moneyText(next)
  const warn = reason || ("This hire makes payroll $" + moneyText(due + next) + ". You have $" + moneyText(state.money) + ". Someone leaves at the end of the month.")
  const hireTip = locked
    ? "Ship 3 screens yourself."
    : unpayable
      ? warn
      : "Implements your frame on the others. A system makes that faster. $" + nextText + " for the rest of this month."
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
      <p className="hint">{"Payroll due $" + dueText + ". Next hire $" + nextText + "."}</p>
      {lines.map((line) => (
        <p key={line.name} className="hint">{line.name + " · $" + moneyText(line.amount)}</p>
      ))}
      {unpayable && <p className="hint payroll-warn">{warn}</p>}
      <span className="tip-wrap" data-tip={hireTip}>
        <button type="button" className={"buy" + (!locked && unpayable ? " warn" : "")} disabled={locked} onClick={() => hire()}>
          {locked ? "Intern " + state.handShips + "/3" : "Hire · $" + nextText}
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
    rows.push({ id: "intern", name: "Intern", detail: state.handShips + "/3 hand ships", done: false, locked: true, tip: "Ship 3 screens yourself." })
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
  if (!rows.length) return null
  return (
    <section className="block studio">
      <header className="block-head">
        <h2>Tree</h2>
      </header>
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
  components: "Both cards change together. An intern sets both in one step.",
  "radius-tool": "One number for this frame. An intern sets every corner in one step.",
  styles: "An intern keeps your fills, and does not miss them.",
  colour: "The intern sets every fill in one step.",
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
