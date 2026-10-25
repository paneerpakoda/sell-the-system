import { useEffect } from "react"
import { Dock } from "./components/Dock.jsx"
import { Gate } from "./components/Gate.jsx"
import { Hud, WeekPause } from "./components/Hud.jsx"
import { Inspector } from "./components/Inspector.jsx"
import { Intro } from "./components/Intro.jsx"
import { Notice, Tips } from "./components/Notice.jsx"
import { Screen } from "./components/Screen.jsx"
import { state } from "./engine.js"
import { useGame } from "./useGame.js"

export function App() {
  useGame()
  useEffect(() => {
    const block = (event) => {
      if (event.target.closest && event.target.closest("input, textarea")) return
      event.preventDefault()
    }
    document.addEventListener("selectstart", block)
    return () => document.removeEventListener("selectstart", block)
  }, [])
  return (
    <div className="app">
      <Dock />
      <main className="stage">
        {state.studioName && <div className="studio-name">{state.studioName}</div>}
        <Hud />
        <Screen />
        <Intro />
        <WeekPause />
      </main>
      <Inspector />
      <Notice />
      <Tips />
      <Gate />
    </div>
  )
}
