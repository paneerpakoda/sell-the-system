import { Button } from "@/components/unlumen-ui/primitives/button"
import { memo, useState } from "react"
import { SkModal } from "./SkModal.jsx"
import {
  buyLanguage,
  buyProcess,
  buyToken,
  buyTool,
  listStamp,
  openProject,
  projectWatch,
  queueState,
  stepSeconds,
  systemOwned,
  hardReset,
  resetView,
  restartGame,
  stage,
  startClient,
  state
} from "../engine.js"
import { useClock } from "../useGame.js"
import { TargetChip } from "./guidance.jsx"
import { formatMoney, useCurrency } from "../ui/money.js"
import { useWorkspace } from "../workspace.jsx"

const ClientTime = memo(function ClientTime({ project }) {
  useClock()
  const clock = !project.started ? " due" : project.onTimeLeft <= 0 ? " late" : project.onTimeLeft <= 30 ? " urgent" : ""
  return <span className={"time" + clock}>{queueState(project)}</span>
})

const ClientRow = memo(function ClientRow({ project, stamp, line, needsYou, open }) {
  void stamp
  const { openPc } = useWorkspace()
  return (
    <li>
      <button
        type="button"
        className={"client" + (open ? " on" : "") + (needsYou ? " call" : "")}
        data-tip={needsYou ? line : project.started ? "Open this client. Opening does not take a frame back." : "Start this client. The clock begins when you do."}
        onClick={() => {
          resetView()
          if (!project.started) {
            startClient(project)
            return
          }
          openProject(project, null)
          openPc()
        }}
      >
        <span className="who">{project.client}</span>
        <span className={"meta" + (needsYou ? " call" : "")}>{line}</span>
        <TargetChip project={project} />
        <ClientTime project={project} />
      </button>
    </li>
  )
})

export function Dock() {
  const [wikiOpen, setWikiOpen] = useState(false)

  return (
    <aside className="dock" aria-label="Studio">
      <section className="block clients-block sk-panel">
        <header className="block-head sk-panel-head">
          <h2>Clients</h2>
          <span className="dock-head-tools">
            <span>{state.queue.length}</span>
            <button type="button" className="wiki-btn" onClick={() => setWikiOpen(true)}>Wiki</button>
          </span>
        </header>
        <ul className="clients">
            {state.queue.map((item) => {
              const watch = projectWatch(item)
              return (
                <ClientRow
                  key={item.id}
                  project={item}
                  stamp={listStamp(item)}
                  line={watch.line}
                  needsYou={watch.needsYou}
                  open={item.id === state.openId}
                />
              )
            })}
        </ul>
      </section>

      <div className="dock-scroll">
        <StudioKit />
        <StageProgress />
        <RunControls />
      </div>
      <Wiki open={wikiOpen} onClose={() => setWikiOpen(false)} />
    </aside>
  )
}

function RunControls() {
  const [restartOpen, setRestartOpen] = useState(false)
  const [hardOpen, setHardOpen] = useState(false)
  if (!state.studioName && !state.queue.length) return null
  return (
    <section className="block run-controls">
      <header className="block-head">
        <h2>Run</h2>
      </header>
      <div className="run-actions">
        {state.studioName && (
          <button type="button" className="run-btn" tabIndex={0} data-tab-last="reset" onClick={() => setRestartOpen(true)}>Reset</button>
        )}
        <button type="button" className="run-btn danger" tabIndex={0} data-tab-last="hard-reset" onClick={() => setHardOpen(true)}>Hard reset</button>
      </div>
      <SkModal id="restart-run" open={restartOpen} scrim="soft" scrimCloses labelledBy="restart-title" onEscape={() => setRestartOpen(false)}>
        <h2 id="restart-title" className="sk-title">Start over?</h2>
        <RestartCopy />
        <div className="sk-bezel-actions">
          <Button type="button" className="u-btn secondary" onClick={() => setRestartOpen(false)}>Cancel</Button>
          <Button type="button" className="u-btn" data-initial-focus onClick={() => { setRestartOpen(false); restartGame() }}>Reset</Button>
        </div>
      </SkModal>
      <SkModal id="hard-reset" open={hardOpen} blocking role="alertdialog" scrim="hard" scrimCloses labelledBy="hard-reset-title" onEscape={() => setHardOpen(false)}>
        <h2 id="hard-reset-title" className="sk-title">Back to the title?</h2>
        <div className="sk-bezel-body">
          <p>The studio name and this run are discarded. The game starts again at the title screen.</p>
          <p className="sk-danger-note">This can't be undone.</p>
        </div>
        <div className="sk-bezel-actions">
          <Button type="button" className="u-btn secondary" data-initial-focus onClick={() => setHardOpen(false)}>Cancel</Button>
          <Button type="button" className="u-btn danger" onClick={() => { setHardOpen(false); hardReset() }}>Hard reset</Button>
        </div>
      </SkModal>
    </section>
  )
}

function RestartCopy() {
  const { currency } = useCurrency()
  return (
    <div className="sk-bezel-body">
      <p>This run is discarded. {state.studioName} keeps its name and starts again at {formatMoney(24, { currency })}. The clocks stay held until you press Start.</p>
    </div>
  )
}

const LANG_NAME = { fintech: "Swiss Grid", wellness: "Warm Soft", editorial: "Mono Stark" }

function stageSteps() {
  const intern = state.staff.find((staff) => staff.role === "intern")
  const permanentOn = state.staff.some((staff) => staff.role === "permanent")
  const clean = permanentOn ? 3 : Math.min(3, intern ? intern.clean : 0)
  const languageId = ["fintech", "wellness", "editorial"].find((id) => state.codified[id])
  return [
    {
      id: "permanent",
      short: "Permanent " + clean + "/3",
      done: permanentOn,
      fill: clean / 3,
      text: "Three clean screens unlock Promote. A permanent, together with a language, opens Stage 3."
    },
    {
      id: "language",
      short: languageId ? LANG_NAME[languageId] : "Language 0/1",
      done: !!languageId,
      fill: languageId ? 1 : 0,
      text: "A big client in an industry unlocks that language. Buying it covers colour, radius, and contrast. With a permanent, Stage 3 opens."
    },
    {
      id: "research",
      short: "Research",
      done: !!state.process.research,
      fill: state.process.research ? 1 : 0,
      text: "Unlocks once Stage 3 is on. Later clients arrive with Copy / Clarity solved."
    },
    {
      id: "wire",
      short: "Wire",
      done: !!state.process.wire,
      fill: state.process.wire ? 1 : 0,
      text: "Unlocks once Stage 3 is on. Later clients arrive with Hierarchy set."
    },
    {
      id: "test",
      short: "Test",
      done: !!state.process.test,
      fill: state.process.test ? 1 : 0,
      text: "Unlocks once Stage 3 is on. Later clients arrive with Flow / States fixed."
    }
  ]
}

function cleanProgressDetail(step) {
  const match = /Permanent (\d+)\/3/.exec(step.short || "")
  if (!match) return step.short
  return match[1] + " / 3 clean ships"
}

function StageProgress() {
  const steps = stageSteps()
  const pct = Math.round(steps.reduce((sum, step) => sum + step.fill, 0) / steps.length * 100)
  const next = steps.find((step) => !step.done)
  const nextTitle = !next
    ? "Stage 3 is open"
    : next.id === "permanent"
      ? "Next: promote after 3 clean ships"
      : next.id === "language"
        ? "Next: buy a language"
        : "Next: unlock " + next.short
  const needsProcess = stage() >= 3 && !state.process.research && !state.process.wire && !state.process.test
  const marks = [
    {
      id: "permanent",
      label: "Promote intern",
      detail: steps[0].done ? "Permanent hired" : cleanProgressDetail(steps[0]),
      fill: steps[0].fill,
      done: steps[0].done,
      tip: steps[0].text
    },
    {
      id: "language",
      label: "Buy a language",
      detail: steps[1].done ? steps[1].short : "After a big client",
      fill: steps[1].fill,
      done: steps[1].done,
      tip: steps[1].text
    },
    { id: "research", label: "Research", detail: steps[2].done ? "Unlocked" : "Opens with Stage 3", fill: steps[2].fill, done: steps[2].done, tip: steps[2].text },
    { id: "wire", label: "Wire", detail: steps[3].done ? "Unlocked" : "Opens with Stage 3", fill: steps[3].fill, done: steps[3].done, tip: steps[3].text },
    { id: "test", label: "Test", detail: steps[4].done ? "Unlocked" : "Opens with Stage 3", fill: steps[4].fill, done: steps[4].done, tip: steps[4].text }
  ]
  return (
    <section className="block stage-progress sk-panel">
      <header className="block-head sk-panel-head">
        <h2>Stage 3</h2>
        <span className="stage-pct">{pct}%</span>
      </header>
      <p className="stage-next">{nextTitle}</p>
      {needsProcess && <p className="stage-next">Hands-off needs process steps.</p>}
      <ol className="stage-ladder" aria-label={nextTitle}>
        {marks.map((mark) => {
          const isNext = next && next.id === mark.id
          const amount = Math.round(mark.fill * 100)
          return (
            <li
              key={mark.id}
              className={"stage-rung" + (mark.done ? " done" : "") + (isNext ? " next" : "")}
              data-tip={mark.tip}
            >
              <span className="stage-rung-mark" aria-hidden="true">{mark.done ? "✓" : isNext ? "→" : "·"}</span>
              <div className="stage-rung-copy">
                <strong>{mark.label}</strong>
                <span>{mark.detail}</span>
                <span className="stage-rung-bar" aria-hidden="true"><i style={{ width: amount + "%" }} /></span>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Wiki({ open, onClose }) {
  const { currency } = useCurrency()
  const money = (value) => formatMoney(value, { currency })
  const steps = stageSteps()
  return (
    <SkModal id="wiki" open={open} scrim="soft" scrimCloses labelledBy="wiki-title" onEscape={onClose}>
      <h2 id="wiki-title" className="sk-title">Wiki</h2>
      <div className="sk-bezel-body wiki-body">
        <section>
          <h3>How to win</h3>
          <p>Win a month that begins after Stage 3 is already on. Payroll for that month has to be paid.</p>
          <ul>
            <li>
              <b>The choice.</b> After you hire, pick big clients or a steady book. Until you pick, a month cannot be won. Chase: big clients arrive twice as often, and each month costs {money(8)}. Steady: big clients stop, a small ship pays {money(4)} more, and four small ships win the month.
            </li>
            <li>
              <b>Big client.</b> After 3 ships, some arrivals name every element and pay the higher fee. Ship at least one in the winning month, unless you kept a steady book.
            </li>
            <li>
              <b>No hand touch.</b> In that month, do not edit a value on a screen. Start, open, and Ship do not count. The team ships it.
            </li>
            <li>
              <b>Late.</b> The client's round clock hit 0. The project stays, and Ship still pays. The on-time reward is closed. Late is not the week or the month.
            </li>
          </ul>
        </section>
        <section>
          <h3>Stage 3</h3>
          <ul>
            {steps.map((step) => (
              <li key={step.id}>
                <b>{step.short}{step.done ? " · done" : ""}.</b> {step.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="sk-bezel-actions">
        <Button type="button" className="u-btn" data-initial-focus onClick={onClose}>Close</Button>
      </div>
    </SkModal>
  )
}

const TOKEN_ROWS = [
  ["colour", "Base colour", "Aa"],
  ["radius", "Base radius", "◯"],
  ["contrast", "Base contrast", "▣"]
]
const PROCESS_ROWS = [
  ["research", "User research", "R"],
  ["wire", "Wireframing", "W"],
  ["test", "Usability testing", "T"]
]

function upgradeRows() {
  const tokensReady = state.everHired && state.accepted >= 3
  const rows = []
  if (state.handShips >= 1 && !state.tools.components) {
    rows.push(node({ id: "components", name: "Components", cost: 12, glyph: "⧉", buy: () => buyTool("components") }))
  } else if (state.handShips >= 1 && !state.tools.radius) {
    rows.push(node({ id: "radius-tool", name: "Radius variable", cost: 12, glyph: "◠", buy: () => buyTool("radius") }))
  } else if (state.tools.radius && !state.tools.styles) {
    rows.push(node({ id: "styles", name: "Colour styles", cost: 12, glyph: "●", buy: () => buyTool("styles") }))
  }
  if (tokensReady) {
    TOKEN_ROWS.forEach(([key, name, glyph]) => {
      if (state.tokens[key]) return
      rows.push(node({ id: key, name, cost: 12, glyph, buy: () => buyToken(key) }))
    })
  }
  ;["fintech", "wellness", "editorial"].forEach((id) => {
    if (!state.bigDone[id] || state.codified[id]) return
    const system = id === "fintech" ? "Swiss Grid" : id === "wellness" ? "Warm Soft" : "Mono Stark"
    const glyph = id === "fintech" ? "▦" : id === "wellness" ? "◎" : "▤"
    rows.push(node({ id, name: system, cost: 15, glyph, buy: () => buyLanguage(id) }))
  })
  if (stage() >= 3) {
    PROCESS_ROWS.forEach(([key, name, glyph]) => {
      if (state.process[key]) return
      rows.push(node({ id: key, name, cost: 24, glyph, buy: () => buyProcess(key), processBuy: true }))
    })
  }
  return rows
}

function StudioKit() {
  const { currency } = useCurrency()
  const money = (value) => formatMoney(value, { currency })
  const [open, setOpen] = useState(false)
  const shop = upgradeRows()
  const owned = systemOwned()
  const next = shop[0] || null
  const badge = shop.length
  if (!shop.length && !owned.length) return null
  return (
    <section className="block studio-kit sk-panel">
      <header className="block-head sk-panel-head">
        <h2>Studio kit</h2>
        <span className="kit-pace">{stepSeconds(null).toFixed(1)}s</span>
      </header>
      <div className="kit-rail" role="toolbar" aria-label="Studio kit">
        <button
          type="button"
          className={"kit-tile" + (open ? " on" : "") + (badge ? " has-buy" : "")}
          aria-pressed={open}
          aria-expanded={open}
          data-tip={badge ? (badge + " ready to buy") : "Owned systems"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="kit-glyph" aria-hidden="true">{badge ? (next && next.glyph) || "+" : "✓"}</span>
          <span className="kit-label">{badge ? "Buy" : "Kit"}</span>
          {badge > 0 && <span className="kit-badge">{badge}</span>}
        </button>
        {owned.slice(0, 4).map((row) => (
          <span key={row.id} className="kit-chip" data-tip={row.effect} title={row.name}>
            <span className="kit-chip-mark" aria-hidden="true">·</span>
            <span>{row.name}</span>
          </span>
        ))}
        {owned.length > 4 && <span className="kit-chip more">+{owned.length - 4}</span>}
      </div>
      {open && (
        <div className="kit-drawer">
          {next && (
            <div className="kit-next">
              <p className="kit-next-k">Next buy</p>
              <button
                type="button"
                className="kit-buy"
                disabled={state.money < next.cost}
                data-tip={next.tip}
                data-process-buy={next.processBuy ? "true" : undefined}
                onClick={() => next.buy()}
              >
                <span className="kit-buy-glyph" aria-hidden="true">{next.glyph}</span>
                <span className="kit-buy-copy">
                  <strong>{next.name}</strong>
                  <span>{TREE_TIPS[next.id] || "Speeds the studio"}</span>
                </span>
                <span className="kit-buy-cost">{money(next.cost)}</span>
              </button>
              {state.money < next.cost && <p className="kit-need">Need {money(next.cost)}</p>}
            </div>
          )}
          {shop.length > 1 && (
            <ul className="kit-list">
              {shop.slice(1).map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className="kit-list-row"
                    disabled={state.money < row.cost}
                    data-tip={row.tip}
                    onClick={() => row.buy()}
                  >
                    <span className="kit-buy-glyph" aria-hidden="true">{row.glyph}</span>
                    <span>{row.name}</span>
                    <span className="mono">{money(row.cost)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {owned.length > 0 && (
            <div className="kit-owned">
              <p className="kit-next-k">Owned</p>
              <ul>
                {owned.map((row) => (
                  <li key={row.id}>
                    <strong>{row.name}</strong>
                    <span>{row.effect}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!shop.length && !owned.length && <p className="hint">Nothing to buy yet.</p>}
        </div>
      )}
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
    glyph: spec.glyph || "+",
    buy: spec.buy,
    processBuy: !!spec.processBuy,
    tip: TREE_TIPS[spec.id] || ""
  }
}
