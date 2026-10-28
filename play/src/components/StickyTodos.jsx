import { useState } from "react"
import {
  NAMES,
  openParts,
  selectPart,
  shipCheck,
  shownGrade,
  stage,
  state
} from "../engine.js"
import { guidingFirst } from "./guidance.jsx"
import { useWorkspace } from "../workspace.jsx"
import { expandMoneyText, useCurrency } from "../ui/money.js"

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

function agencyItems() {
  const items = []
  const intern = state.staff.find((staff) => staff.role === "intern")
  const permanentOn = state.staff.some((staff) => staff.role === "permanent")
  const languageId = ["fintech", "wellness", "editorial"].find((id) => state.codified[id])

  if (!state.everHired) {
    items.push({
      id: "hand-ships",
      title: "Ship yourself",
      status: state.handShips + " / 3",
      done: state.handShips >= 3,
      tone: state.handShips >= 3 ? "tone-ok" : "tone-bare"
    })
    if (state.handShips >= 3) {
      items.push({ id: "hire", title: "Hire intern", status: "At the table", done: false, tone: "tone-bare" })
    }
  } else if (!permanentOn) {
    const clean = intern ? intern.clean : 0
    items.push({
      id: "promote",
      title: "Promote",
      status: clean + " / 3 clean",
      done: false,
      tone: clean >= 3 ? "tone-ok" : "tone-bare"
    })
  }

  if (state.everHired && !languageId) {
    items.push({ id: "language", title: "Buy a language", status: "After a big client", done: false, tone: "tone-bare" })
  }

  if (stage() >= 3) {
    ;[
      ["research", "Research"],
      ["wire", "Wire"],
      ["test", "Test"]
    ].forEach(([key, title]) => {
      if (!state.process[key]) items.push({ id: key, title, status: "Process", done: false, tone: "tone-bare" })
    })
  } else if (permanentOn && languageId) {
    items.push({ id: "stage3", title: "Stage 3 open", status: "Done", done: true, tone: "tone-ok" })
  }

  const waiting = state.queue.find((project) => !project.started)
  if (waiting) {
    items.unshift({
      id: "start-" + waiting.id,
      title: "Start " + waiting.client + "'s job",
      status: "On the desk · opens laptop",
      done: false,
      tone: "tone-bare"
    })
  }

  const live = state.queue.find((project) => project.started && project.id === state.openId)
  if (live) {
    items.unshift({
      id: "work-" + live.id,
      title: "Finish " + live.client + "'s screens",
      status: "Open laptop · fix To ship",
      done: false,
      tone: "tone-bare"
    })
  }

  return items
}

function AgencySticky() {
  const items = agencyItems()
  const open = items.filter((item) => !item.done)

  return (
    <section className="sticky-pad sticky-agency" aria-label="Agency">
      <div className="sticky-tape" aria-hidden="true" />
      <header className="sticky-head">
        <h2>Agency</h2>
        <span className="sticky-count">{open.length || "Clear"}</span>
      </header>
      {!items.length && <p className="sticky-empty">Nothing on the board.</p>}
      {items.length > 0 && (
        <ul className="sticky-stack">
          {items.map((item, index) => (
            <li key={item.id} className="sticky-leaf">
              <div className={"sticky-note" + (item.done ? " done" : index === 0 ? " now" : "")}>
                <span className="sticky-title">{item.title}</span>
                <span className={"sticky-status " + item.tone}>{item.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function compactParts(project, parts) {
  const groups = []
  const indexOf = new Map()
  parts.forEach((part) => {
    const key = (part.screenId || "") + ":" + part.id
    let group = groups[indexOf.get(key)]
    if (!group) {
      indexOf.set(key, groups.length)
      group = {
        id: part.id,
        screenId: part.screenId,
        screenName: part.screenName,
        open: []
      }
      groups.push(group)
    }
    part.open.forEach((req) => group.open.push(req))
  })
  return groups.map((group) => {
    const labels = group.open.map((req) => propertyName(req) + " · " + wordOf(project, req))
    const worst = group.open[0]
    return {
      ...group,
      summary: labels.slice(0, 2).join(" · ") + (labels.length > 2 ? " · +" + (labels.length - 2) : ""),
      tone: tone(wordOf(project, worst))
    }
  })
}

function ClientSticky() {
  const { atPc, openPc } = useWorkspace()
  const { currency } = useCurrency()
  const [gradesOpen, setGradesOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const project = state.queue.find((item) => item.id === state.openId) || null
  const check = project ? shipCheck(project.id) : null
  const parts = compactParts(project, openParts(project))
  const heldShip = !!(check && check.held)
  const guide = guidingFirst()
  const guideNow = !!(guide && guide.started && !guide.shipLive && !guide.onLead && parts[0] && project && project.id === guide.project.id && parts[0].id === (guide.lead && guide.lead.id))
  const visible = expanded ? parts : parts.slice(0, 5)
  const hidden = Math.max(0, parts.length - visible.length)
  const countLabel = !project ? "" : parts.length ? String(parts.length) : heldShip ? "Held" : "Clear"
  const readyLabel = check && check.reason ? expandMoneyText(check.label, currency) : "Clear — ready to ship"

  if (!atPc) return null

  return (
    <section className="sticky-pad sticky-client" aria-label="Client design">
      <div className="sticky-tape" aria-hidden="true" />
      <header className="sticky-head">
        <h2>To ship</h2>
        {countLabel && <span className="sticky-count">{countLabel}</span>}
      </header>

      {!project && <p className="sticky-empty">No frame open.</p>}
      {project && !parts.length && (
        <p className="sticky-ready">{readyLabel}</p>
      )}

      {parts.length > 0 && (
        <ul className="sticky-stack sticky-stack-compact">
          {visible.map((group, index) => {
            const pulse = index === 0 && guideNow
            return (
              <li key={(group.screenId || "") + ":" + group.id} className="sticky-leaf">
                <button
                  type="button"
                  className={"sticky-note" + (index === 0 ? " now" : "") + (pulse ? " guide-pulse" : "")}
                  onClick={() => {
                    if (!atPc) openPc()
                    selectPart(project, group.screenId, group.id)
                  }}
                >
                  {pulse && <span className="sr-only">Next click. </span>}
                  <span className="sticky-title">{group.screenName ? group.screenName + " · " : ""}{NAMES[group.id]}</span>
                  <span className={"sticky-status " + group.tone}>{group.summary}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {hidden > 0 && (
        <button type="button" className="sticky-grades" onClick={() => setExpanded(true)}>
          +{hidden} more on this job
        </button>
      )}
      {expanded && parts.length > 5 && (
        <button type="button" className="sticky-grades" onClick={() => setExpanded(false)}>
          Show fewer
        </button>
      )}

      {project && (
        <>
          <button type="button" className="sticky-grades" aria-expanded={gradesOpen} onClick={() => setGradesOpen((open) => !open)}>
            {gradesOpen ? "Hide grades" : "All grades"}
          </button>
          {gradesOpen && (
            <div className="grades sticky-grades-panel">
              {GROUPS.map(([group, label]) => {
                const reqs = project.reqs.filter((req) => req.group === group)
                if (!reqs.length) return null
                return (
                  <div key={group}>
                    <h3>{label}</h3>
                    <ul>
                      {reqs.map((req) => (
                        <li key={req.element + group}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!atPc) openPc()
                              selectPart(project, null, req.focus || req.element)
                            }}
                          >
                            <span>{NAMES[req.element]}</span>
                            <span className={tone(wordOf(project, req))}>{wordOf(project, req)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export function StickyTodos() {
  const { atPc } = useWorkspace()
  return (
    <>
      {!atPc && <AgencySticky />}
      {atPc && <ClientSticky />}
    </>
  )
}
