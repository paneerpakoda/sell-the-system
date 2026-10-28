import { Button } from "@/components/unlumen-ui/primitives/button"
import { FloatingTooltip } from "@/components/unlumen-ui/floating-tooltip"
import {
  clientBrief,
  handShip,
  openProject,
  projectWatch,
  resetView,
  shipCheck,
  startClient,
  state
} from "../engine.js"
import { TargetChip, guidingFirst, shipClickEnabled } from "./guidance.jsx"
import { ContractClock } from "./Hud.jsx"
import { useWorkspace } from "../workspace.jsx"
import { OfficePeople } from "./Office.jsx"

export function Desk() {
  const { openPc } = useWorkspace()
  const project = state.queue.find((item) => item.id === state.openId) || state.queue[0] || null
  const waiting = !!(project && !project.started)
  const live = shipClickEnabled(waiting, project)
  const guide = guidingFirst()
  const guideStart = !!(guide && !guide.started && waiting && project && project.id === guide.project.id)
  const watch = project ? projectWatch(project) : null

  return (
    <div className="desk">
      <div className="desk-glow" aria-hidden="true" />
      <div className="office">
        <div className="office-room">
          <div className="desk-surface">
            <div className="desk-lamp" aria-hidden="true" />
            <div className="desk-mat">
              {project ? (
                <article className="desk-brief">
                  <header>
                    <p className="desk-kicker">Contract</p>
                    <h2>{project.client}</h2>
                    <p className="desk-line">{clientBrief(project).who}</p>
                  </header>
                  <p className="desk-line">{clientBrief(project).job}</p>
                  <p className="desk-line">{watch.line}</p>
                  <TargetChip project={project} />
                  <ContractClock project={project} />
                  <div className="desk-brief-actions">
                    {waiting ? (
                      <FloatingTooltip.Trigger content="Begin this client. The round clock on this contract starts at 5:00.">
                        <Button
                          type="button"
                          className={"u-btn" + (guideStart ? " guide-pulse" : "")}
                          disabled={!live}
                          onClick={() => {
                            if (!live) return
                            resetView()
                            startClient(project)
                            openPc()
                          }}
                        >
                          Start job
                        </Button>
                      </FloatingTooltip.Trigger>
                    ) : (
                      <Button
                        type="button"
                        className="u-btn"
                        onClick={() => {
                          resetView()
                          openProject(project, null)
                          openPc()
                        }}
                      >
                        Continue on laptop
                      </Button>
                    )}
                  </div>
                </article>
              ) : (
                <article className="desk-brief empty">
                  <h2>Quiet desk</h2>
                  <p className="desk-line">A founder brief lands here — usually a college senior with an onboarding flow.</p>
                </article>
              )}

              <button type="button" className="desk-laptop" onClick={() => openPc()}>
                <span className="desk-laptop-lid" aria-hidden="true" />
                <span className="desk-laptop-base" aria-hidden="true" />
                <span className="desk-laptop-label">Open laptop</span>
              </button>
            </div>
          </div>

          <OfficePeople />
          <p className="office-badge" title="Home studio">2BHK · Mumbai</p>
        </div>
      </div>
    </div>
  )
}

export function StageShip() {
  const { atPc, openPc } = useWorkspace()
  const project = state.queue.find((item) => item.id === state.openId) || null
  const waiting = !!(project && !project.started)
  const check = waiting || !project ? null : shipCheck(project.id)
  const live = shipClickEnabled(waiting, project)
  const shipLabel = !project ? "Pick a client" : waiting ? "Start" : check.label
  const held = !!(check && check.held)
  const guide = guidingFirst()
  const guideStart = !!(guide && !guide.started && waiting && project && project.id === guide.project.id)
  const guideShip = !!(guide && guide.shipLive && !waiting && project && project.id === guide.project.id)

  if (!atPc) return null

  return (
    <div className="stage-ship">
      <FloatingTooltip.Trigger content={waiting ? "Begin this client. The round clock starts at 5:00." : check && check.reason ? shipLabel : "Ship the screen."}>
        <Button
          type="button"
          hoverScale={1.03}
          tapScale={0.98}
          className={"ship u-btn stage-ship-btn" + (held ? " held" : "") + (guideStart || guideShip ? " guide-pulse" : "")}
          disabled={!project || !live}
          aria-disabled={!project || !live}
          onClick={() => {
            if (!project || !live) return
            if (waiting) {
              startClient(project)
              openPc()
            } else handShip()
          }}
        >
          {shipLabel}
        </Button>
      </FloatingTooltip.Trigger>
    </div>
  )
}
