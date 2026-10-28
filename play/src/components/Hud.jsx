import { memo, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  continueMonth,
  deadlineLength,
  sellAgency,
  listStamp,
  openProject,
  payrollDue,
  projectWatch,
  resetView,
  startClient,
  stage,
  state,
  timeLabel,
  weekState
} from "../engine.js"
import { SkModal } from "./SkModal.jsx"
import { useClock } from "../useGame.js"
import { TargetChip, formatClock, targetFor, weekClock } from "./guidance.jsx"
import { Button } from "@/components/unlumen-ui/primitives/button"
import { CurrencySwitch, expandMoneyText, formatMoney, moneyLabel, readMoneyToken, useCurrency } from "../ui/money.js"

function Weeks() {
  useClock()
  const { week, into } = weekState()
  const clock = weekClock(into)
  const held = state.clocksLive === false
  const weekText = held ? "Paused" : clock.text
  return (
    <div className="meter weeks" role="group" aria-label={"Week " + week + " of 4. " + weekText} data-tip="Studio week. Four one-minute bars. Not the client clock.">
      <span className="meter-k">Week {week}/4</span>
      <span className="week-bars" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => {
          const amount = index < week - 1 ? 1 : index === week - 1 ? into : 0
          return (
            <i key={index} className={amount > 0 ? "on" : ""}>
              <b style={{ width: amount * 100 + "%" }} />
            </i>
          )
        })}
      </span>
      <span className="meter-sub">{weekText}</span>
    </div>
  )
}

function MonthClock() {
  const held = state.clocksLive === false
  const text = formatClock(state.monthLeft)
  return (
    <div className="meter month-meter" data-tip="Countdown to payroll. Four weeks long. Pauses until the first Start.">
      <span className="meter-k">Month {state.monthIndex}</span>
      <span className="meter-v mono">{held ? "Paused" : text}</span>
    </div>
  )
}

export function ContractClock({ project }) {
  useClock()
  if (!project) return null
  const waiting = !project.started
  const left = Math.max(0, project.onTimeLeft)
  const total = project.onTimeTotal || deadlineLength
  const p = waiting ? 1 : Math.min(1, left / total)
  const late = !waiting && left <= 0
  const urgent = !waiting && !late && left <= 30
  const label = waiting ? "5:00" : late ? "Late" : timeLabel(left)
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <div
      className={"contract-clock" + (late ? " late" : urgent ? " urgent" : "")}
      data-tip={waiting ? "Client clock. Starts when you press Start job." : late ? "Late. You can still Ship." : "Round clock for this contract."}
      aria-label={"Client clock " + label}
    >
      <span className="client-ring" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle className="timer-track" cx="20" cy="20" r={r} />
          <circle
            className="timer-value"
            cx="20"
            cy="20"
            r={r}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - p)}
          />
        </svg>
        <b>{label}</b>
      </span>
      <div className="contract-clock-copy">
        <span className="contract-clock-k">Client clock</span>
        <span className="contract-clock-v">{waiting ? "Starts at Start job" : late ? "Over time · still shippable" : "On the contract"}</span>
      </div>
    </div>
  )
}

function StageMeter() {
  return (
    <div className="meter stage-meter" data-tip="How far the agency has grown. Stage 3 unlocks UX work.">
      <span className="meter-k">Stage</span>
      <span className="meter-v mono">{stage()}</span>
    </div>
  )
}

function HandMeter() {
  const hired = state.everHired
  const value = hired ? state.accepted : Math.min(state.handShips, 3)
  const tip = hired
    ? "Accepted ships this run."
    : "Ship 3 screens yourself before Hire unlocks."
  return (
    <div className="meter hand-meter" data-tip={tip}>
      <span className="meter-k">{hired ? "Shipped" : "Hire"}</span>
      {hired ? (
        <span className="meter-v mono">{value}</span>
      ) : (
        <span className="hand-dots" aria-label={value + " of 3"}>
          {[0, 1, 2].map((index) => (
            <i key={index} className={index < value ? "on" : ""} />
          ))}
        </span>
      )}
      {!hired && <span className="meter-sub">{value}/3</span>}
    </div>
  )
}

export function WeekPause() {
  const open = !!state.break
  const { currency } = useCurrency()
  const [nudge, setNudge] = useState(false)
  useEffect(() => {
    if (!open) setNudge(false)
  }, [open])
  const note = open ? expandMoneyText(state.break.note, currency) : ""
  return (
    <SkModal
      id="month-end"
      open={open}
      blocking
      scrim="hard"
      labelledBy="month-end-title"
      onScrim={() => setNudge(true)}
    >
      {open && (
        <>
          {nudge && <p className="finish-nudge" role="status">Finish this first</p>}
          <h1 id="month-end-title" className="sk-title">Month {state.monthIndex}</h1>
          <div className="sk-bezel-body">
            <p>Four weeks are done. {note} The tree stays open.</p>
            {state.break.won && <p>Selling starts a new run with one perk you already own.</p>}
          </div>
          <div className="sk-bezel-actions">
            <Button type="button" className="u-btn" data-initial-focus onClick={() => continueMonth()}>{state.break.won ? "Keep going" : "Next month"}</Button>
            {state.break.won && <Button type="button" className="u-btn secondary" onClick={() => sellAgency()}>Sell the agency</Button>}
          </div>
        </>
      )}
    </SkModal>
  )
}

const CLOCK_STEPS = [
  {
    id: "client",
    title: "Client clock",
    line: "Lives on the desk contract. 5:00 starts at Start job.",
    note: "Hits 0 → Late. You can still Ship.",
    visual: "client"
  },
  {
    id: "week",
    title: "Week",
    line: "Four bars. Each bar is one minute.",
    note: "Waits until your first Start.",
    visual: "week"
  },
  {
    id: "month",
    title: "Month",
    line: "Four weeks, then payroll.",
    note: "Same wait as the week clock.",
    visual: "month"
  }
]

function ClockStepVisual({ kind }) {
  if (kind === "client") {
    return (
      <div className="clock-viz client" aria-hidden="true">
        <svg viewBox="0 0 72 72" width="72" height="72">
          <circle cx="36" cy="36" r="28" className="clock-viz-track" />
          <circle cx="36" cy="36" r="28" className="clock-viz-arc" pathLength="100" />
        </svg>
        <span>5:00</span>
      </div>
    )
  }
  if (kind === "week") {
    return (
      <div className="clock-viz week" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <i key={index} className={index === 0 ? "on" : ""}>
            <b style={{ width: index === 0 ? "55%" : "0%" }} />
          </i>
        ))}
      </div>
    )
  }
  return (
    <div className="clock-viz month" aria-hidden="true">
      <span className="clock-viz-num">1</span>
      <span className="clock-viz-time">4:00</span>
    </div>
  )
}

export function ClockCard() {
  const [closed, setClosed] = useState(false)
  const [step, setStep] = useState(0)
  const show = !closed && !!state.studioName && !state.tabNote && state.queue.length > 0 && state.clocksLive === false
  const current = CLOCK_STEPS[step]
  const last = step >= CLOCK_STEPS.length - 1
  useEffect(() => {
    if (!show) {
      document.body.removeAttribute("data-clock-coach")
      return undefined
    }
    document.body.setAttribute("data-clock-coach", current.visual)
    return () => document.body.removeAttribute("data-clock-coach")
  }, [show, current.visual])
  return (
    <SkModal
      id="coach-clocks"
      open={show}
      scrim="soft"
      scrimCloses
      labelledBy="clock-card-title"
      onEscape={() => setClosed(true)}
    >
      <p className="clock-step-kicker">Clocks · {step + 1} of {CLOCK_STEPS.length}</p>
      <h2 id="clock-card-title" className="sk-title">{current.title}</h2>
      <div className="sk-bezel-body clock-coach">
        <ClockStepVisual kind={current.visual} />
        <p className="clock-step-line">{current.line}</p>
        <p className="clock-step-note">{current.note}</p>
        <div className="clock-step-dots" aria-hidden="true">
          {CLOCK_STEPS.map((item, index) => (
            <i key={item.id} className={index === step ? "on" : index < step ? "done" : ""} />
          ))}
        </div>
      </div>
      <div className="sk-bezel-actions">
        {step > 0 && (
          <Button type="button" className="u-btn secondary" onClick={() => setStep((n) => n - 1)}>Back</Button>
        )}
        {last ? (
          <Button type="button" className="u-btn" data-initial-focus onClick={() => setClosed(true)}>Got it</Button>
        ) : (
          <Button type="button" className="u-btn" data-initial-focus onClick={() => setStep((n) => n + 1)}>Next</Button>
        )}
      </div>
    </SkModal>
  )
}

function DeadlineClock({ project, alert }) {
  useClock()
  const waiting = !project.started
  const left = Math.max(0, project.onTimeLeft)
  const total = project.onTimeTotal || deadlineLength
  const p = waiting ? 1 : Math.min(1, left / total)
  const r = 18
  const c = 2 * Math.PI * r
  const late = !waiting && left <= 0
  const urgent = !waiting && !late && left <= 30
  const label = waiting ? "Start" : late ? "Late" : timeLabel(left)
  const tone = alert || late ? " late" : urgent ? " urgent" : ""
  return (
    <div className={"widget-clock" + tone}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="timer-track" cx="24" cy="24" r={r} />
        <circle
          className="timer-value"
          cx="24"
          cy="24"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <b className={urgent || late ? "sk-deadline" : undefined}>{label}</b>
    </div>
  )
}

const ClientWidget = memo(function ClientWidget({ project, stamp, line, needsYou, open, waiting, target }) {
  void stamp
  return (
    <button
      type="button"
      data-id={project.id}
      className={"client-widget" + (open ? " on" : "") + (needsYou ? " call" : "") + (target ? " has-target" : "")}
      aria-current={open ? "true" : undefined}
      aria-label={project.client + (target ? ", target " + target : "") + ", " + line}
      data-tip={needsYou ? line : waiting ? "Start this client. The round clock starts at 5:00. That is the client's time, not the week or the month." : project.onTimeLeft <= 0 ? "Late means this client's clock hit 0. The project stays. Ship still pays. This is not the month clock." : "On time if you ship within " + timeLabel(project.onTimeTotal) + "."}
      onClick={() => { resetView(); if (waiting) startClient(project); else openProject(project, null) }}
    >
      <span className="widget-copy">
        <span className="widget-client">{project.client}</span>
        <TargetChip project={project} />
        <span className={"widget-meta" + (needsYou ? " call" : "")}>{line}</span>
      </span>
      <DeadlineClock project={project} alert={needsYou} />
    </button>
  )
})

function payrollTip(money, currency) {
  const late = state.payroll.lateNote ? expandMoneyText(state.payroll.lateNote, currency) : ""
  return late || ("Due when week 4 ends. A gap up to " + money(2.5) + ", one week of intern pay, is Late. The permanent stays. Ship the next screen to pay it down.")
}

function feeTip(money) {
  return "Paid fees. Payroll comes out when week 4 ends. A full ship is " + money(10) + ", or " + money(16) + " in Stage 3. A short ship is " + money(10) + ". A big client is " + money(36) + ", or " + money(48) + ". A short big-client ship is " + money(3) + " before Stage 3."
}

function PayrollMeter() {
  useClock()
  const { currency } = useCurrency()
  const money = (value, options) => formatMoney(value, { currency, ...options })
  const due = payrollDue()
  if (!(due > 0)) return null
  return (
    <div className="meter" data-tip={payrollTip(money, currency)}>
      <div className="meter-k">{state.payroll.late ? "Late" : "Payroll"}</div>
      <div className={"meter-v sk-num" + (state.money + 0.001 < due ? " urgent" : "")}>{money(due)}</div>
    </div>
  )
}

function ClientWidgets() {
  const railRef = useRef(null)
  const trackRef = useRef(null)
  const placed = useRef(new Map())
  const ids = state.queue.map((project) => project.id).join("|")

  useLayoutEffect(() => {
    const rail = railRef.current
    const track = trackRef.current
    if (!rail || !track) return
    rail.scrollLeft = rail.scrollWidth
    const next = new Map()
    ;[...track.children].forEach((node) => {
      const left = node.getBoundingClientRect().left
      const before = placed.current.get(node.dataset.id)
      next.set(node.dataset.id, left)
      if (before == null) return
      const dx = before - left
      if (Math.abs(dx) < 1) return
      node.animate(
        [{ transform: `translateX(${dx}px)` }, { transform: "translateX(0)" }],
        { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      )
    })
    placed.current = next
  }, [ids])

  function onPointerDown(event) {
    const rail = railRef.current
    if (!rail || event.button !== 0) return
    const startX = event.clientX
    const startScroll = rail.scrollLeft
    let moved = false
    const move = (ev) => {
      const dx = ev.clientX - startX
      if (Math.abs(dx) > 6) moved = true
      if (moved) rail.scrollLeft = startScroll - dx
    }
    const end = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      if (!moved) return
      const stop = (click) => {
        click.preventDefault()
        click.stopPropagation()
        window.removeEventListener("click", stop, true)
      }
      window.addEventListener("click", stop, true)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
  }

  return (
    <div className="widget-rail" ref={railRef}>
      <div className="widget-track" ref={trackRef} onPointerDown={onPointerDown}>
        {state.queue.map((project) => {
          const watch = projectWatch(project)
          return (
            <ClientWidget
              key={project.id}
              project={project}
              stamp={listStamp(project)}
              line={watch.line}
              needsYou={watch.needsYou}
              open={project.id === state.openId}
              waiting={!project.started}
              target={targetFor(project)}
            />
          )
        })}
      </div>
    </div>
  )
}

export function Hud() {
  const { currency } = useCurrency()
  const money = (value, options) => formatMoney(value, { currency, ...options })
  const due = payrollDue()
  return (
    <header className="topbar">
      <div className="topbar-side topbar-left" aria-label="Studio clocks">
        {state.studioName && <div className="studio-name">{state.studioName}</div>}
        <div className="meter-group time-group">
          <Weeks />
          <MonthClock />
          {due > 0 && (
            <div className={"meter payroll-meter" + (state.money + 0.001 < due ? " urgent" : "")}>
              <span className="meter-k">{state.payroll.late ? "Late" : "Due"}</span>
              <span className="meter-v mono">{money(due)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="topbar-center">
        <div className="money-hero">
          <div className="money" aria-label={Math.abs(state.money) >= 100000 ? moneyLabel(state.money, currency) : undefined}>{money(state.money, { compact: true })}</div>
          <CurrencySwitch />
        </div>
      </div>
      <div className="topbar-side topbar-right" aria-label="Growth">
        <div className="meter-group growth-group">
          <StageMeter />
          <HandMeter />
        </div>
      </div>
      {(state.payroll.lateNote || state.status) && (
        <p className="status-line">{expandMoneyText(state.payroll.lateNote || state.status, currency)}</p>
      )}
      <ShipMoment />
    </header>
  )
}

function ShipMoment() {
  const { currency } = useCurrency()
  const seen = useRef(state.accepted)
  const [moment, setMoment] = useState(null)
  useEffect(() => {
    if (state.accepted <= seen.current) return undefined
    seen.current = state.accepted
    const status = state.status || ""
    const match = /(?:^Shipped | shipped )(.+?) · /.exec(status)
    const amount = readMoneyToken(status)
    if (!match || amount == null) return undefined
    setMoment({ client: match[1], amount })
    const timer = window.setTimeout(() => setMoment(null), 1500)
    return () => window.clearTimeout(timer)
  }, [state.accepted])
  if (!moment) return null
  return (
    <>
      <p className="sk-stamp">Shipped!</p>
      <p className="sk-toast" role="status">Shipped {moment.client} {formatMoney(moment.amount, { currency, sign: true })}</p>
    </>
  )
}
