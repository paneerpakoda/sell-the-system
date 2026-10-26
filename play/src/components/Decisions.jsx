import { bigClientOffer, chooseFork, chooseMidgame, dismissNotice, gameFlags, LANG, state, takeBig, turnDownBig } from "../engine.js"
import { useModal } from "./focusTrap.js"
import { undoForkChoice } from "./guidance.jsx"
import { formatMoney, useCurrency } from "../ui/money.js"

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
  const { currency } = useCurrency()
  const money = (value, options) => formatMoney(value, { currency, ...options })
  const chase = "Big clients arrive twice as often. Each new month costs " + money(8) + ". The winning month is still one big client, with payroll paid and no hand touch."
  const steady = "Big clients stop arriving. A small ship pays " + money(4) + " more. The winning month is four small ships, with payroll paid and no hand touch."
  const noticeUp = state.notices.length > 0
  const offer = bigClientOffer()
  const eventOpen = !noticeUp && !!offer && !state.eventClosed && !!state.studioName && !state.break
  const midgameOpen = gameFlags.midgameChoice && !eventOpen && !noticeUp && !state.break && !!state.studioName && !state.midgame && !state.midgameClosed && state.everHired && state.accepted >= 3
  const forkOpen = !midgameOpen && !eventOpen && !noticeUp && !state.break && !!state.studioName && !state.fork && !state.forkClosed && state.everHired && state.accepted >= 3
  const undoOpen = !midgameOpen && !eventOpen && !noticeUp && !state.break && !!state.studioName && !!state.fork && !state.forkClosed
  const open = eventOpen || midgameOpen || forkOpen || undoOpen
  const modal = useModal(open)
  modal.onEscape.current = () => {
    if (eventOpen) state.eventClosed = true
    else if (midgameOpen) state.midgameClosed = true
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
        <p>Take the brief. A full ship pays {money(offer.payout)}. A short ship pays {money(offer.short)}. Turn it down for {money(offer.decline)}.</p>
        <p className="clock-running">Clock is running</p>
        <div className="decision-row">
          <button type="button" data-confirm onClick={() => takeBig()}>Take it · {money(offer.payout)}</button>
          <button type="button" onClick={() => turnDownBig()}>Turn it down · {money(offer.decline)}</button>
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
  if (midgameOpen) {
    return (
      <div ref={modal.ref} className="decision" role="dialog" aria-modal="true" aria-labelledby="midgame-title">
        <h2 id="midgame-title">Big clients or a steady book</h2>
        <p><b>Chase big clients.</b> {chase}</p>
        <p><b>Keep a steady book.</b> {steady}</p>
        <p className="clock-running">Clock is running</p>
        <div className="decision-row">
          <button type="button" data-confirm onClick={() => chooseMidgame("chase")}>Chase big clients</button>
          <button type="button" onClick={() => chooseMidgame("steady")}>Keep a steady book</button>
        </div>
      </div>
    )
  }
  if (!state.midgame && state.midgameClosed && gameFlags.midgameChoice && state.everHired && state.accepted >= 3) {
    return (
      <button type="button" className="decision-reopen" onClick={() => { state.midgameClosed = false; publish() }}>
        Big clients or a steady book
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
