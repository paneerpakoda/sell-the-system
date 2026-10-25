import { bigClientOffer, chooseFork, dismissNotice, LANG, state, takeBig, turnDownBig } from "../engine.js"
import { useModal } from "./focusTrap.js"
import { undoForkChoice } from "./guidance.jsx"

const SPECIALIST = "New clients stay in one industry, so a language comes faster. You stop seeing the other industries."
const GENERALIST = "Clients keep mixing across industries. A language takes longer, because big clients are spread out."

function publish() {
  if (state.notices.length === 0) dismissNotice()
}

function industryName() {
  const id = state.specialty && LANG[state.specialty] ? state.specialty : "fintech"
  return LANG[id].name
}

export function Decisions() {
  const noticeUp = state.notices.length > 0
  const offer = bigClientOffer()
  const eventOpen = !noticeUp && !!offer && !state.eventClosed && !!state.studioName && !state.break
  const forkOpen = !eventOpen && !noticeUp && !state.break && !!state.studioName && !state.fork && !state.forkClosed && state.everHired && state.accepted >= 3
  const undoOpen = !eventOpen && !noticeUp && !state.break && !!state.studioName && !!state.fork && !state.forkClosed
  const open = eventOpen || forkOpen || undoOpen
  const modal = useModal(open)
  modal.onEscape.current = () => {
    if (eventOpen) state.eventClosed = true
    else state.forkClosed = true
    publish()
  }
  modal.onEnter.current = () => {
    const current = document.activeElement
    if (current && modal.ref.current && modal.ref.current.contains(current) && current.tagName === "BUTTON") current.click()
  }
  if (state.tabNote || !state.studioName || state.break || noticeUp) return null
  if (eventOpen) {
    return (
      <div ref={modal.ref} className="decision" role="dialog" aria-modal="true" aria-labelledby="big-client-title">
        <h2 id="big-client-title">{offer.client} is a big client</h2>
        <p>Take the brief. A full ship pays ${offer.payout}. A short ship pays ${offer.short}. Turn it down for ${offer.decline}.</p>
        <div className="decision-row">
          <button type="button" data-confirm onClick={() => takeBig()}>Take it · ${offer.payout}</button>
          <button type="button" onClick={() => turnDownBig()}>Turn it down · ${offer.decline}</button>
        </div>
      </div>
    )
  }
  if (state.event && state.eventClosed) {
    return (
      <button type="button" className="decision-reopen" onClick={() => { state.eventClosed = false; publish() }}>
        {state.event.client} is waiting
      </button>
    )
  }
  if (forkOpen) {
    return (
      <div ref={modal.ref} className="decision" role="dialog" aria-modal="true" aria-labelledby="fork-title">
        <h2 id="fork-title">Specialist or generalist</h2>
        <p><b>Specialist.</b> {SPECIALIST} This run would stay in {industryName()}.</p>
        <p><b>Generalist.</b> {GENERALIST}</p>
        <div className="decision-row">
          <button type="button" data-confirm onClick={() => chooseFork("specialist")}>Specialist</button>
          <button type="button" onClick={() => chooseFork("generalist")}>Generalist</button>
        </div>
      </div>
    )
  }
  if (undoOpen) {
    const picked = state.fork === "specialist"
    return (
      <div ref={modal.ref} className="decision" role="dialog" aria-modal="true" aria-labelledby="fork-title">
        <h2 id="fork-title">{picked ? "Specialist" : "Generalist"}</h2>
        <p>{picked ? "You chose specialist. " + SPECIALIST + " New clients are " + industryName() + "." : "You chose generalist. " + GENERALIST}</p>
        <div className="decision-row">
          <button type="button" data-confirm onClick={() => undoForkChoice()}>Undo</button>
          <button type="button" onClick={() => { state.forkClosed = true; publish() }}>Close</button>
        </div>
      </div>
    )
  }
  if (!state.fork && state.forkClosed && state.everHired && state.accepted >= 3) {
    return (
      <button type="button" className="decision-reopen" onClick={() => { state.forkClosed = false; publish() }}>
        Specialist or generalist
      </button>
    )
  }
  if (state.fork && state.forkClosed) {
    return (
      <button type="button" className="decision-reopen" onClick={() => undoForkChoice()}>
        Undo {state.fork}
      </button>
    )
  }
  return null
}
