import { memo, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  continueMonth,
  deadlineLength,
  sellAgency,
  handShip,
  listStamp,
  openProject,
  payrollDue,
  projectWatch,
  resetView,
  shipCheck,
  startClient,
  stage,
  state,
  timeLabel,
  weekState
} from "../engine.js"
import { SkModal } from "./SkModal.jsx"
import { useClock } from "../useGame.js"
import { TargetChip, formatClock, guidingFirst, shipClickEnabled, targetFor, weekClock } from "./guidance.jsx"
import { Button } from "@/components/unlumen-ui/primitives/button"
import { FloatingTooltip } from "@/components/unlumen-ui/floating-tooltip"
import { Switch } from "@/components/unlumen-ui/switch"
import { formatMoney, moneyLabel, useCurrency } from "../ui/money.js"

function Weeks() {
  useClock()
  const { week, into } = weekState()
  const clock = weekClock(into)
  const held = state.clocksLive === false
  const weekText = held ? clock.text + " held" : clock.text + " left"
  return (
      <div className="weeks sk-panel" role="group" aria-label={"Week " + week + " of 4, " + weekText + ". Each week is one minute. The week clock waits until the first Start."} data-tip="Each week is one minute. It waits until the first Start. This is not the client's round clock.">
      <div className="meter-k sk-panel-head">Week</div>
      <div className="week-marks sk-weekbar" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => {
          const amount = index < week - 1 ? 1 : index === week - 1 ? into : 0
          return (
            <i key={index}>
              <b style={{ width: amount * 100 + "%" }} />
            </i>
          )
        })}
      </div>
      <div className="meter-v">{week}</div>
      <div className="week-clock">{weekText}</div>
    </div>
  )
}

function MonthClock() {
  const held = state.clocksLive === false
  const text = formatClock(state.monthLeft) + (held ? " held" : "")
  return (
    <div className="meter month-meter" data-tip="The month timer is on screen from month 1. Four weeks, about four minutes, then payroll. It waits with the week clock until the first Start. This is not the client's 5:00.">
      <div className="meter-k">Month</div>
      <div className="meter-v">{state.monthIndex}</div>
      <div className="week-clock">{text}</div>
    </div>
  )
}

export function WeekPause() {
  const open = !!state.break
  const [nudge, setNudge] = useState(false)
  useEffect(() => {
    if (!open) setNudge(false)
  }, [open])
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
            <p>Four weeks are done. {state.break.note} The tree stays open.</p>
            {state.break.won && <p>Selling starts a new run with one perk you already own.</p>}
          </div>
          <div className="sk-bezel-actions">
            <Button type="button" className="sk-cbtn sk-cbtn--primary" data-initial-focus onClick={() => continueMonth()}>{state.break.won ? "Keep going" : "Next month"}</Button>
            {state.break.won && <Button type="button" className="sk-cbtn sk-cbtn--secondary" onClick={() => sellAgency()}>Sell the agency</Button>}
          </div>
        </>
      )}
    </SkModal>
  )
}

export function ClockCard() {
  const [closed, setClosed] = useState(false)
  const show = !closed && !!state.studioName && !state.tabNote && state.queue.length > 0 && state.clocksLive === false
  return (
    <SkModal id="coach-clocks" open={show} scrim="soft" scrimCloses labelledBy="clock-card-title" onEscape={() => setClosed(true)}>
      <h2 id="clock-card-title" className="sk-title">Three clocks</h2>
      <div className="sk-bezel-body">
        <ul>
          <li><b>Client, 5:00.</b> The round clock on a client. It starts when you press Start. Late means that clock reached 0. The project stays, and Ship still pays. The on-time reward is closed.</li>
          <li><b>Week.</b> Each bar is one minute. The week clock waits until the first Start.</li>
          <li><b>Month.</b> Four weeks, about four minutes, then payroll. The month timer is on screen from month 1. It waits with the week clock until the first Start.</li>
        </ul>
        <p className="sk-clock-note">Clock is running</p>
      </div>
      <div className="sk-bezel-actions">
        <Button type="button" className="sk-cbtn sk-cbtn--primary" data-initial-focus onClick={() => setClosed(true)}>Got it</Button>
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

function payrollTip(money) {
  return state.payroll.lateNote || ("Due when week 4 ends. A gap up to " + money(2.5) + ", one week of intern pay, is Late. The permanent stays. Ship the next screen to pay it down.")
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
    <div className="meter" data-tip={payrollTip(money)}>
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
  const { currency, setCurrency } = useCurrency()
  const money = (value, options) => formatMoney(value, { currency, ...options })
  const due = payrollDue()
  const open = state.queue.find((item) => item.id === state.openId) || null
  const waiting = !!(open && !open.started)
  const check = waiting ? null : shipCheck(open ? open.id : null)
  const live = shipClickEnabled(waiting, open)
  const shipLabel = waiting ? "Start" : check.label
  const held = !!(check && check.held)
  const guide = guidingFirst()
  const guideStart = !!(guide && !guide.started && waiting && open && open.id === guide.project.id)
  const guideShip = !!(guide && guide.shipLive && !waiting && open && open.id === guide.project.id)
  return (
    <>
      <header className="hud">
        <div className="score">
          <div className="money sk-num" data-tip={feeTip(money)} aria-label={Math.abs(state.money) >= 100000 ? moneyLabel(state.money, currency) : undefined}>{money(state.money, { compact: true })}</div>
          <span className="sk-currency-switch">
            <Switch
              checked={currency === "USD"}
              onCheckedChange={(dollars) => setCurrency(dollars ? "USD" : "INR")}
              label={currency === "USD" ? "Dollars" : "Rupees"}
            />
          </span>
          <div className="meters">
            <Weeks />
            <MonthClock />
            <div className="meter" data-tip="1 is by hand. 2 is a team. 3 adds UX. Stage 3 needs a permanent and a codified language.">
              <div className="meter-k">Stage</div>
              <div className="meter-v">{stage()}</div>
            </div>
            <div className="meter" data-tip={state.everHired ? "Clients shipped." : "Screens you ship yourself. Hire unlocks at 3, and the count stops there."}>
              <div className="meter-k">{state.everHired ? "Ships" : "Hand"}</div>
              <div className="meter-v">{state.everHired ? state.accepted : Math.min(state.handShips, 3) + "/3"}</div>
            </div>
            {due > 0 && (
              <div className="meter" data-tip={payrollTip(money)}>
                <div className="meter-k">{state.payroll.late ? "Late" : "Payroll"}</div>
                <div className={"meter-v sk-num" + (state.money + 0.001 < due ? " urgent" : "")}>{money(due)}</div>
              </div>
            )}
          </div>
          <p className="goal-strip">
            <span className="goal-win">Win a Stage 3 month with a big client, no hand touch, and payroll paid.</span>
          </p>
          {state.payroll.lateNote && <p className="status-line">{state.payroll.lateNote}</p>}
          {state.status && <p className="status-line">{state.status}</p>}
        </div>
      </header>
      <div className="sk-bezel sk-ship-plate">
        <FloatingTooltip.Trigger content={waiting ? "Begin this client. The round clock starts at 5:00. That is the client's time, not the month." : check && check.reason ? shipLabel : "Full fee " + money(10) + ", or " + money(16) + " in Stage 3. A short ship is " + money(10) + ". A big client is " + money(36) + ", or " + money(48) + ". A short big-client ship is " + money(3) + " before Stage 3."}>
        <Button
          type="button"
          tabIndex={1}
          className={"ship sk-cbtn sk-cbtn--primary" + (held ? " held" : "") + (guideStart || guideShip ? " guide-pulse" : "")}
          disabled={!live}
          aria-disabled={!live}
          data-ship-held={held ? "true" : "false"}
          data-ship-reason={check && check.reason ? check.reason : ""}
          onClick={() => { if (!live) return; if (waiting) startClient(open); else handShip() }}
        >
          {shipLabel}
          {(guideStart || guideShip) && <span className="sr-only"> Next click.</span>}
        </Button>
        </FloatingTooltip.Trigger>
        {!live && check && check.reason && <p className="sk-cbtn-reason">{check.reason}</p>}
      </div>
      <ClientWidgets />
      <ShipMoment />
    </>
  )
}

function ShipMoment() {
  const { currency } = useCurrency()
  const seen = useRef(state.accepted)
  const [moment, setMoment] = useState(null)
  useEffect(() => {
    if (state.accepted <= seen.current) return undefined
    seen.current = state.accepted
    const match = /(?:^Shipped | shipped )(.+?) · \$(\d+(?:\.\d+)?)/.exec(state.status || "")
    if (!match) return undefined
    setMoment({ client: match[1], amount: Number(match[2]) })
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
