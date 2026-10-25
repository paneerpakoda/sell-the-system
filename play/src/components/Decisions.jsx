import { bigClientOffer, chooseFork, state, takeBig, turnDownBig } from "../engine.js"

export function Decisions() {
  if (!state.studioName || state.break) return null
  if (state.event) {
    const offer = bigClientOffer()
    if (!offer) return null
    return (
      <aside className="decision">
        <h2>{offer.client} is a big client</h2>
        <p>Take the brief. A full ship pays ${offer.payout}. A short ship pays ${offer.short}. Turn it down for ${offer.decline}.</p>
        <div className="decision-row">
          <button type="button" onClick={() => takeBig()}>Take it · ${offer.payout}</button>
          <button type="button" onClick={() => turnDownBig()}>Turn it down · ${offer.decline}</button>
        </div>
      </aside>
    )
  }
  if (!state.fork && state.everHired && state.accepted >= 3) {
    return (
      <aside className="decision">
        <h2>Specialist or generalist</h2>
        <p>Specialist: new clients stay in one industry, so a language comes faster. Generalist: the mix stays.</p>
        <div className="decision-row">
          <button type="button" onClick={() => chooseFork("specialist")}>Specialist</button>
          <button type="button" onClick={() => chooseFork("generalist")}>Generalist</button>
        </div>
      </aside>
    )
  }
  return null
}
