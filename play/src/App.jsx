import { MotionConfig } from "motion/react"
import { useEffect } from "react"
import { FloatingTooltip } from "@/components/unlumen-ui/floating-tooltip"
import { Button } from "@/components/unlumen-ui/primitives/button"
import { Decisions } from "./components/Decisions.jsx"
import { Desk, StageShip } from "./components/Desk.jsx"
import { Dock } from "./components/Dock.jsx"
import { Gate } from "./components/Gate.jsx"
import { ClockCard, Hud, WeekPause } from "./components/Hud.jsx"
import { Inspector } from "./components/Inspector.jsx"
import { Notice, Tips } from "./components/Notice.jsx"
import { Screen } from "./components/Screen.jsx"
import { dismissNotice, ensureClient, state } from "./engine.js"
import { useGame } from "./useGame.js"
import { WorkspaceProvider, useWorkspace } from "./workspace.jsx"

function Shell() {
  const { atPc, closePc } = useWorkspace()
  useGame()
  useEffect(() => {
    const block = (event) => {
      if (event.target.closest && event.target.closest("input, textarea")) return
      event.preventDefault()
    }
    const onKey = (event) => {
      if (event.key !== "Escape" || event.defaultPrevented) return
      if (event.target.closest && event.target.closest("input, textarea")) return
      if (atPc) {
        closePc()
        return
      }
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
  }, [atPc, closePc])

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
    <div className={"app" + (atPc ? " at-pc" : " at-desk")}>
      <Hud />
      <Dock />
      <main className="stage">
        <h1 className="sr-only">Sell the system</h1>
        {atPc ? (
          <>
            <button type="button" className="leave-pc" onClick={() => closePc()}>Close laptop</button>
            <Screen />
            <StageShip />
          </>
        ) : (
          <Desk />
        )}
        <Decisions />
      </main>
      <Inspector />
      <ClockCard />
      <WeekPause />
      <Notice />
      <Tips />
      <Gate />
      {state.studioName && state.queue.length === 0 && !state.break && (
        <div className="gate">
          <div className="gate-card" role="status">
            <h1>Start your first client</h1>
            <Button type="button" className="u-btn" onClick={() => ensureClient()}>Start your first client</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <FloatingTooltip.Provider variant="outline">
        <WorkspaceProvider>
          <Shell />
        </WorkspaceProvider>
      </FloatingTooltip.Provider>
    </MotionConfig>
  )
}
