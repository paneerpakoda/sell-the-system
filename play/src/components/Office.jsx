import { useState } from "react"
import { FloatingTooltip } from "@/components/unlumen-ui/floating-tooltip"
import { Button } from "@/components/unlumen-ui/primitives/button"
import { SkModal } from "./SkModal.jsx"
import {
  canHire,
  fire,
  hire,
  promote,
  staffTask,
  state,
  stepSeconds,
  effectiveMiss
} from "../engine.js"
import { payrollFacts } from "./guidance.jsx"
import { expandMoneyText, formatMoney, useCurrency } from "../ui/money.js"

function paceText(project) {
  return stepSeconds(project).toFixed(1) + "s / step"
}

function missText(intern, project) {
  const miss = effectiveMiss(intern, project)
  if (miss <= 0) return "Clean"
  return Math.round(miss * 100) + "% miss"
}

function FireConfirm({ staff, onCancel, onFire }) {
  return (
    <SkModal id="fire-confirm" open={!!staff} blocking role="alertdialog" scrim="hard" scrimCloses labelledBy="fire-title" onEscape={onCancel}>
      {staff && (
        <>
          <h2 id="fire-title" className="sk-title">Fire {staff.name}?</h2>
          <div className="sk-bezel-body">
            <p>{staff.name} leaves now. Frames they have not finished come back to you. Pay for time already worked still comes due. Tokens, languages, and process steps stay.</p>
            <p className="sk-danger-note">This can't be undone.</p>
          </div>
          <div className="sk-bezel-actions">
            <Button type="button" className="u-btn secondary" data-initial-focus onClick={onCancel}>Cancel</Button>
            <Button type="button" className="u-btn danger" onClick={onFire}>Fire {staff.name}</Button>
          </div>
        </>
      )}
    </SkModal>
  )
}

export function OfficePeople() {
  const [pendingFire, setPendingFire] = useState(null)
  const { currency } = useCurrency()
  const money = (value) => formatMoney(value, { currency })
  const { due, next, unpayable, reason, lines } = payrollFacts()
  const locked = state.handShips < 3
  const internOnStaff = state.staff.some((staff) => staff.role === "intern")
  const affordable = canHire()
  const short = due > 0 && state.money + 0.001 < due
  const dueText = money(due)
  const nextText = money(next)
  const hireNote = state.payroll && state.payroll.hireNote
    ? expandMoneyText(state.payroll.hireNote, currency)
    : "Hire is " + nextText + " for the rest of this month."
  const warn = expandMoneyText(reason, currency) || ("This hire makes payroll " + money(due + next) + ". You have " + money(state.money) + ".")
  const hireTip = locked
    ? "Ship 3 screens yourself. Hire stays locked until then."
    : internOnStaff
      ? "One intern can be busy. They build screens someone already started."
      : !affordable
        ? warn
        : hireNote
  const lateNote = state.payroll.lateNote ? expandMoneyText(state.payroll.lateNote, currency) : ""

  const you = { id: "you", name: "You", role: "founder", task: "At the laptop" }
  const seats = [you, ...state.staff]

  return (
    <section className="office-people" aria-label="Desk mates">
      <header className="office-people-head">
        <h3>Desk mates</h3>
        {state.staff.length > 0 && (
          <span className={"office-pay" + (state.payroll.late || short ? " warn" : "")}>
            {state.payroll.late ? "Late" : short ? "Short" : "Payroll " + dueText}
          </span>
        )}
      </header>

      <ul className="office-seats">
        {seats.map((person) => {
          if (person.role === "founder") {
            return (
              <li key={person.id} className="office-seat you">
                <span className="seat-avatar" aria-hidden="true">Y</span>
                <div className="seat-copy">
                  <strong>{person.name}</strong>
                  <span>{person.task}</span>
                </div>
              </li>
            )
          }
          const project = state.queue.find((item) => item.id === person.projectId)
          return (
            <li key={person.id} className={"office-seat " + person.role}>
              <span className="seat-avatar" aria-hidden="true">{person.name.slice(0, 1)}</span>
              <div className="seat-copy">
                <strong>{person.name}</strong>
                <span>{person.role === "permanent" ? "Permanent" : "Intern"} · {money(person.pay)}</span>
                <span className="seat-task">{staffTask(person)}</span>
                {person.role === "intern" && (
                  <span className="seat-pace">{paceText(project)} · {missText(person, project)}</span>
                )}
              </div>
              <div className="seat-actions">
                <FloatingTooltip.Trigger content="They leave now. Unfinished frames come back to you.">
                  <Button type="button" className="u-btn secondary seat-btn" onClick={() => setPendingFire(person)}>Fire</Button>
                </FloatingTooltip.Trigger>
                {person.role === "intern" && (
                  <button
                    type="button"
                    className="seat-btn promote"
                    disabled={person.clean < 3}
                    onClick={() => promote(person.id)}
                    data-tip={person.clean < 3 ? "Three clean screens, then promote." : "Promote to permanent · " + money(30) + "/mo"}
                  >
                    Permanent {person.clean}/3
                  </button>
                )}
              </div>
            </li>
          )
        })}
        {seats.length < 3 && (
          <li className="office-seat empty" aria-hidden="true">
            <span className="seat-avatar ghost">+</span>
            <div className="seat-copy">
              <strong>Empty desk</strong>
              <span>Room for one more</span>
            </div>
          </li>
        )}
      </ul>

      <div className="office-hire">
        {locked && (
          <p className="office-hire-lock">
            Ship {state.handShips}/3 yourself — then hire at this table.
          </p>
        )}
        {!locked && lines.map((line) => (
          <p key={line.name} className="office-hire-line">{line.name} · {money(line.amount)}</p>
        ))}
        {lateNote && <p className="office-hire-warn">{lateNote}</p>}
        {unpayable && !lateNote && <p className="office-hire-warn">{warn}</p>}
        <FloatingTooltip.Trigger content={hireTip}>
          <Button type="button" className="u-btn office-hire-btn" disabled={!affordable} onClick={() => hire()}>
            {locked ? "Hire locked · " + state.handShips + "/3" : internOnStaff ? "Intern is hired" : "Hire intern · " + nextText}
          </Button>
          {!affordable && (
            <span className="sk-cbtn-reason">
              {locked ? "Ship 3 screens yourself" : internOnStaff ? "One intern is already hired" : "Need " + nextText}
            </span>
          )}
        </FloatingTooltip.Trigger>
      </div>

      <FireConfirm staff={pendingFire} onCancel={() => setPendingFire(null)} onFire={() => { fire(pendingFire.id); setPendingFire(null) }} />
    </section>
  )
}
