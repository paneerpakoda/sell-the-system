import { Button } from "@/components/unlumen-ui/primitives/button"
import {
  bigClientOffer,
  chooseFork,
  chooseMidgame,
  confirmStage3Warn,
  deferStage3Warn,
  dismissNotice,
  gameFlags,
  LANG,
  processStepFacts,
  state,
  takeBig,
  turnDownBig
} from "../engine.js"
import { SkModal } from "./SkModal.jsx"
import { undoForkChoice } from "./guidance.jsx"
import { formatMoney, useCurrency } from "../ui/money.js"

const SPECIALIST = "New clients stay in one industry, so a language comes faster. You stop seeing the other industries."
const GENERALIST = "Clients keep mixing across industries. A language takes longer, because big clients are spread out."

function publish() {
  if (state.notices.length === 0) dismissNotice()
}

function industryName() {
  // Same pick as chooseFork: specialty if set, else lastIndustry, else fintech.
  const id = state.specialty && LANG[state.specialty]
    ? state.specialty
    : state.lastIndustry && LANG[state.lastIndustry]
      ? state.lastIndustry
      : "fintech"
  return LANG[id].name
}

function focusProcessBuy() {
  const target =
    document.querySelector('[data-process-buy]') ||
    document.querySelector(".kit-buy") ||
    document.querySelector(".studio-kit .kit-tile")
  if (target && typeof target.focus === "function") target.focus()
  target?.scrollIntoView?.({ block: "nearest", behavior: "smooth" })
}

export function Decisions() {
  const { currency } = useCurrency()
  const money = (value, options) => formatMoney(value, { currency, ...options })
  const chase = "Big clients arrive twice as often. Each new month costs " + money(8) + ". The winning month is still one big client, with payroll paid and no hand touch."
  const steady = "Big clients stop arriving. A small ship pays " + money(4) + " more. The winning month is four small ships, with payroll paid and no hand touch."
  const ready = !!state.studioName && !state.tabNote
  const offer = bigClientOffer()
  const warnOpen = ready && !!state.stage3Warn
  const facts = processStepFacts()
  const eventOpen = ready && !warnOpen && !!offer && !state.eventClosed
  const midgameOpen = ready && !warnOpen && gameFlags.midgameChoice && !eventOpen && !state.midgame && !state.midgameClosed && state.everHired && state.accepted >= 3
  const forkOpen = ready && !warnOpen && !midgameOpen && !eventOpen && !state.fork && !state.forkClosed && state.everHired && state.accepted >= 3
  const undoOpen = ready && !warnOpen && !midgameOpen && !eventOpen && !!state.fork && !state.forkClosed
  const open = eventOpen || midgameOpen || forkOpen || undoOpen
  const later = () => {
    if (eventOpen) state.eventClosed = true
    else if (midgameOpen) state.midgameClosed = true
    else state.forkClosed = true
    publish()
  }
  const titleId = eventOpen ? "big-client-title" : midgameOpen ? "midgame-title" : "fork-title"
  if (!ready) return null
  const picked = state.fork === "specialist"
  return (
    <>
      <SkModal
        id="stage3-warn"
        open={warnOpen}
        blocking
        scrim="soft"
        labelledBy="stage3-warn-title"
        onEscape={() => { deferStage3Warn(); publish() }}
      >
        {warnOpen && (
          <>
            <h2 id="stage3-warn-title" className="sk-title">Stage 3 needs process steps</h2>
            <div className="sk-bezel-body">
              <p>
                Stage 3 briefs need UX. Your team can only cover it once you buy the process steps ({facts.count} steps, cost {money(facts.cost)} each). Without them you will do it by hand and payroll can go late.
              </p>
              <p className="sk-clock-note">Clocks are paused while this card is open</p>
            </div>
            <div className="sk-bezel-actions">
              <Button
                type="button"
                className="u-btn"
                data-initial-focus
                onClick={() => {
                  deferStage3Warn()
                  publish()
                  window.setTimeout(focusProcessBuy, 0)
                }}
              >
                Buy process steps first
              </Button>
              <Button
                type="button"
                className="u-btn secondary"
                onClick={() => {
                  confirmStage3Warn()
                  publish()
                }}
              >
                Enter Stage 3 anyway
              </Button>
            </div>
          </>
        )}
      </SkModal>
      <SkModal id="decision" open={open} scrim="soft" labelledBy={titleId} onEscape={later}>
        {eventOpen && (
          <>
            <h2 id="big-client-title" className="sk-title">{offer.client} is a big client</h2>
            <div className="sk-bezel-body">
              <p>Take the brief. A full ship pays {money(offer.payout)}. A short ship pays {money(offer.short)}. Turn it down for {money(offer.decline)}.</p>
              <p className="sk-clock-note">Clocks are paused while this card is open</p>
            </div>
            <div className="sk-bezel-actions">
              <Button type="button" className="u-btn" data-initial-focus onClick={() => takeBig()}>Take it · {money(offer.payout)}</Button>
              <Button type="button" className="u-btn secondary" onClick={() => turnDownBig()}>Turn it down · {money(offer.decline)}</Button>
            </div>
          </>
        )}
        {midgameOpen && (
          <>
            <h2 id="midgame-title" className="sk-title">Big clients or a steady book</h2>
            <div className="sk-bezel-body">
              <p><b>Chase big clients.</b> {chase}</p>
              <p><b>Keep a steady book.</b> {steady}</p>
              <p className="sk-clock-note">Clocks are paused while this card is open</p>
            </div>
            <div className="sk-bezel-actions">
              <Button type="button" className="u-btn" data-initial-focus onClick={() => chooseMidgame("chase")}>Chase big clients</Button>
              <Button type="button" className="u-btn secondary" onClick={() => chooseMidgame("steady")}>Keep a steady book</Button>
            </div>
          </>
        )}
        {forkOpen && (
          <>
            <h2 id="fork-title" className="sk-title">Specialist or generalist</h2>
            <div className="sk-bezel-body">
              <p><b>Specialist.</b> {SPECIALIST} This run would stay in {industryName()}.</p>
              <p><b>Generalist.</b> {GENERALIST}</p>
            </div>
            <div className="sk-bezel-actions">
              <Button type="button" className="u-btn" data-initial-focus onClick={() => chooseFork("specialist")}>Specialist</Button>
              <Button type="button" className="u-btn secondary" onClick={() => chooseFork("generalist")}>Generalist</Button>
            </div>
          </>
        )}
        {undoOpen && (
          <>
            <h2 id="fork-title" className="sk-title">{picked ? "Specialist" : "Generalist"}</h2>
            <div className="sk-bezel-body">
              <p>{picked ? "You chose specialist. " + SPECIALIST + " New clients are " + industryName() + "." : "You chose generalist. " + GENERALIST}</p>
            </div>
            <div className="sk-bezel-actions">
              <Button type="button" className="u-btn secondary" data-initial-focus onClick={() => undoForkChoice()}>Undo</Button>
              <Button type="button" className="u-btn" onClick={() => { state.forkClosed = true; publish() }}>Close</Button>
            </div>
          </>
        )}
      </SkModal>
      <div className="reopen-row">
      {state.event && state.eventClosed && (
        <button type="button" className="decision-reopen" onClick={() => { state.eventClosed = false; publish() }}>
          {state.event.client} is waiting
        </button>
      )}
      {!state.midgame && state.midgameClosed && gameFlags.midgameChoice && state.everHired && state.accepted >= 3 && (
        <button type="button" className="decision-reopen" onClick={() => { state.midgameClosed = false; publish() }}>
          Big clients or a steady book
        </button>
      )}
      {!state.fork && state.forkClosed && state.everHired && state.accepted >= 3 && (
        <button type="button" className="decision-reopen" onClick={() => { state.forkClosed = false; publish() }}>
          Specialist or generalist
        </button>
      )}
      {state.fork && state.forkClosed && (
        <button type="button" className="decision-reopen" onClick={() => undoForkChoice()}>
          Undo {state.fork}
        </button>
      )}
      </div>
    </>
  )
}
