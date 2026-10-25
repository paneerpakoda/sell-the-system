import { chooseFork, state, takeBig, turnDownBig } from "../engine.js"

export function Decisions() {
  if (!state.studioName || state.break) return null
  if (state.event) {
    return (
      <aside className="decision">
        <h2>{state.event.client} is a big client</h2>
        <p>Take the brief, or turn it down for $6. A ship pays $6, or $3 when it is short. It does not pay $12.</p>
        <div className="decision-row">
          <button type="button" onClick={() => takeBig()}>Take it</button>
          <button type="button" onClick={() => turnDownBig()}>Turn it down</button>
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
