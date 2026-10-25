import { useLayoutEffect, useRef } from "react"
import {
  continueMonth,
  deadlineLength,
  sellAgency,
  handShip,
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
import { TargetChip, guidingFirst, moneyText, shipClickEnabled, targetFor, weekClock } from "./guidance.jsx"

function Weeks() {
  const { week, into } = weekState()
  const clock = weekClock(into)
  return (
      <div className="weeks" role="group" aria-label={"Week " + week + " of 4, " + clock.text + " left. Each week is one minute. A month is about four minutes."} data-tip="Each week is one minute. Four weeks make a month, about four minutes. Then payroll is due. This is not the client's clock.">
      <div className="meter-k">Week</div>
      <div className="week-marks" aria-hidden="true">
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
      <div className="week-clock">{clock.text} left</div>
    </div>
  )
}

export function WeekPause() {
  if (!state.break) return null
  return (
    <div className="week-pause">
      <form className="gate-card" onSubmit={(event) => { event.preventDefault(); continueMonth() }}>
        <h1>Month {state.monthIndex}</h1>
        <p>Four weeks are done. {state.break.note} The tree stays open.</p>
        <button type="submit">{state.break.won ? "Keep going" : "Next month"}</button>
        {state.break.won && <button type="button" onClick={() => sellAgency()}>Sell the agency</button>}
        {state.break.won && <p>Selling starts a new run with one perk you already own.</p>}
      </form>
    </div>
  )
}

function DeadlineClock({ project, alert }) {
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
      <b>{label}</b>
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
          const open = project.id === state.openId
          const waiting = !project.started
          const watch = projectWatch(project)
          const target = targetFor(project)
          return (
            <button
              key={project.id}
              type="button"
              data-id={project.id}
              className={"client-widget" + (open ? " on" : "") + (watch.needsYou ? " call" : "") + (target ? " has-target" : "")}
              aria-current={open ? "true" : undefined}
              aria-label={project.client + (target ? ", target " + target : "") + ", " + watch.line}
              data-tip={watch.needsYou ? watch.line : waiting ? "Start this client. The clock begins when you do." : "On time if you ship within " + timeLabel(project.onTimeTotal) + "."}
              onClick={() => { resetView(); if (waiting) startClient(project); else openProject(project, null) }}
            >
              <span className="widget-copy">
                <span className="widget-client">{project.client}</span>
                <TargetChip project={project} />
                <span className={"widget-meta" + (watch.needsYou ? " call" : "")}>{watch.line}</span>
              </span>
              <DeadlineClock project={project} alert={watch.needsYou} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Hud() {
  const due = payrollDue()
  const open = state.queue.find((item) => item.id === state.openId) || null
  const waiting = !!(open && !open.started)
  const check = !waiting && open ? shipCheck(open.id) : null
  const live = shipClickEnabled(waiting, open)
  const shipLabel = waiting ? "Start" : check ? check.label : "Ship"
  const held = !!(check && check.held)
  const guide = guidingFirst()
  const guideStart = !!(guide && !guide.started && waiting && open && open.id === guide.project.id)
  const guideShip = !!(guide && guide.shipLive && !waiting && open && open.id === guide.project.id)
  return (
    <>
      <header className="hud">
        <div className="score">
          <div className="money" data-tip="Paid fees. Payroll comes out when week 4 ends. A full ship is $6, or $10 in Stage 3. A short ship is $3, or $6. A ship does not pay $12.">${moneyText(state.money)}</div>
          <div className="meters">
            <Weeks />
            <div className="meter" data-tip="1 is by hand. 2 is a team. 3 adds UX. Stage 3 needs a permanent and a codified language.">
              <div className="meter-k">Stage</div>
              <div className="meter-v">{stage()}</div>
            </div>
            <div className="meter" data-tip={state.everHired ? "Clients shipped." : "Screens you ship yourself. Hire unlocks at 3, and the count stops there."}>
              <div className="meter-k">{state.everHired ? "Ships" : "Hand"}</div>
              <div className="meter-v">{state.everHired ? state.accepted : Math.min(state.handShips, 3) + "/3"}</div>
            </div>
            {due > 0 && (
              <div className="meter" data-tip="Due when week 4 ends. If the balance is short, people leave.">
                <div className="meter-k">Payroll</div>
                <div className={"meter-v" + (state.money < due ? " urgent" : "")}>${moneyText(due)}</div>
              </div>
            )}
          </div>
          <p className="goal-strip">
            <span className="goal-win">Win a Stage 3 month with a big client, no hand touch, and payroll paid.</span>
            <span className="goal-month">The round clock is the client, 5:00 the first time. The bars are the month.</span>
          </p>
          {state.status && <p className="status-line">{state.status}</p>}
        </div>
      </header>
      <button
        type="button"
        className={"ship" + (held ? " held" : "") + (guideStart || guideShip ? " guide-pulse" : "")}
        disabled={!live}
        aria-disabled={!live}
        data-ship-held={held ? "true" : "false"}
        data-ship-reason={held && check ? check.reason : ""}
        data-tip={waiting ? "Begin this client. The round clock starts at 5:00. That is the client's time, not the month." : held ? shipLabel : "Full fee $6, or $10 in Stage 3. Short fee $3, or $6. A ship does not pay $12."}
        onClick={() => { if (!live) return; if (waiting) startClient(open); else handShip() }}
      >
        {shipLabel}
        {(guideStart || guideShip) && <span className="sr-only"> Next click.</span>}
      </button>
      <ClientWidgets />
    </>
  )
}
