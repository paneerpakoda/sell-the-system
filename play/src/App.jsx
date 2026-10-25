import { useEffect } from "react"
import { Decisions } from "./components/Decisions.jsx"
import { Dock } from "./components/Dock.jsx"
import { Gate } from "./components/Gate.jsx"
import { ClockCard, Hud, WeekPause } from "./components/Hud.jsx"
import { Inspector } from "./components/Inspector.jsx"
import { Notice, Tips } from "./components/Notice.jsx"
import { Screen } from "./components/Screen.jsx"
import { dismissNotice, ensureClient, state } from "./engine.js"
import { useGame } from "./useGame.js"

export function App() {
  useGame()
  useEffect(() => {
    const block = (event) => {
      if (event.target.closest && event.target.closest("input, textarea")) return
      event.preventDefault()
    }
    const onKey = (event) => {
      if (event.key !== "Escape" || event.defaultPrevented) return
      if (event.target.closest && event.target.closest("input, textarea")) return
      dismissNotice()
      window.dispatchEvent(new Event("close-popovers"))
      window.dispatchEvent(new Event("close-cards"))
    }
    document.addEventListener("selectstart", block)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("selectstart", block)
      window.removeEventListener("keydown", onKey)
    }
  }, [])
  if (state.tabNote) {
    return (
      <div className="gate">
        <div className="gate-card" role="status">
          <h1>This game is open in another tab</h1>
        </div>
      </div>
    )
  }
  return (
    <div className="app">
      <Dock />
      <main className="stage">
        <h1 className="sr-only">Sell the system</h1>
        {state.studioName && <div className="studio-name">{state.studioName}</div>}
        <Hud />
        <Screen />
        <ClockCard />
        <Decisions />
        <WeekPause />
      </main>
      <Inspector />
      <Notice />
      <Tips />
      <Gate />
      {state.studioName && state.queue.length === 0 && !state.break && (
        <div className="gate">
          <div className="gate-card" role="status">
            <h1>Start your first client</h1>
            <button type="button" onClick={() => ensureClient()}>Start your first client</button>
          </div>
        </div>
      )}
    </div>
  )
}
