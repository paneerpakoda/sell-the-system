import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useView } from "../useGame.js"
import { modalOpen } from "../modalGate.js"
import {
  COLOURS,
  clampRadius,
  contrastMix,
  fade,
  paintedContrast,
  focused,
  inkHex,
  openProject,
  openScreen,
  takeScreen,
  activeScreen,
  screenEditable,
  screenOwnerName,
  selectionIds,
  setRadius,
  panBy,
  setZoom,
  state,
  typeSize,
  view,
  resetView,
  zoomAt
} from "../engine.js"

const SELECT_ORDER = ["background", "title", "cardA", "cardB", "save"]

const CORNERS = ["nw", "ne", "sw", "se"]

function openEditor(project, screen, elementId) {
  openScreen(project, screen.id)
  if (screen.owner && screen.owner !== "player") return
  openProject(project, elementId)
}

function ownerFirst(screen) {
  return screenOwnerName(screen).split(" · ")[0]
}

function flowText(project) {
  const flow = project.flow
  if (!flow || flow.showing === "default") return "Default"
  if (flow.showing === "empty") return flow.emptyFixed ? "No notes yet" : "Empty"
  return flow.errorFixed ? "Couldn't save" : "Error"
}

function lowContrast(art, id) {
  if (id === "background") return false
  return paintedContrast({ elements: art }, id) + 1e-6 < 3
}

function flowClass(project) {
  const flow = project.flow
  if (!flow || flow.showing === "default") return ""
  const fixed = flow.showing === "empty" ? flow.emptyFixed : flow.errorFixed
  return fixed ? " fixed" : " broken"
}

function typingTarget(event) {
  return event.target.closest?.("input, textarea, [contenteditable='true']")
}

function swallowClick() {
  const stop = (event) => {
    event.stopPropagation()
    event.preventDefault()
    window.removeEventListener("click", stop, true)
  }
  window.addEventListener("click", stop, true)
}

function MoveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.5v13M1.5 8h13M8 1.5 6.2 3.3M8 1.5l1.8 1.8M8 14.5 6.2 12.7M8 14.5l1.8-1.8M1.5 8l1.8-1.8M1.5 8l1.8 1.8M14.5 8l-1.8-1.8M14.5 8l-1.8 1.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6.2 7.2V3.8a1 1 0 0 1 2 0V7M8.2 6.6V3.2a1 1 0 0 1 2 0v4.2M10.2 6.4V4.4a1 1 0 0 1 2 0v5.2c0 2.2-1.5 4-3.8 4H7.4c-1.6 0-2.6-.7-3.3-1.8L2.6 9.6a1 1 0 0 1 1.5-1.3l1.1 1.2V4.6a1 1 0 0 1 2 0v2.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function radiusFromCorner(node, corner, clientX, clientY) {
  const rect = node.getBoundingClientRect()
  const x = ((clientX - rect.left) / rect.width) * node.offsetWidth
  const y = ((clientY - rect.top) / rect.height) * node.offsetHeight
  const alongX = corner.includes("w") ? x : node.offsetWidth - x
  const alongY = corner.includes("n") ? y : node.offsetHeight - y
  return clampRadius(Math.min(alongX, alongY))
}

export function Screen() {
  useView()
  const viewport = useRef(null)
  const phoneRef = useRef(null)
  const nodes = useRef({})
  const drag = useRef(null)
  const space = useRef(false)
  const [tool, setTool] = useState("move")
  const [panning, setPanning] = useState(false)
  const [spaceDown, setSpaceDown] = useState(false)
  const project = focused()

  useEffect(() => {
    const node = viewport.current
    if (!node) return undefined
    const onWheel = (event) => {
      event.preventDefault()
      const rect = node.getBoundingClientRect()
      const cx = event.clientX - rect.left - rect.width / 2
      const cy = event.clientY - rect.top - rect.height / 2
      if (event.ctrlKey || event.metaKey) zoomAt(event.deltaY, cx, cy)
      else panBy(-event.deltaX, -event.deltaY)
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [project && project.id])

  const zoomToNode = (node) => {
    const viewportNode = viewport.current
    if (!node || !viewportNode) return
    const vr = viewportNode.getBoundingClientRect()
    const nr = node.getBoundingClientRect()
    if (nr.width < 2 || nr.height < 2) return
    const nodeCx = nr.left + nr.width / 2 - (vr.left + vr.width / 2)
    const nodeCy = nr.top + nr.height / 2 - (vr.top + vr.height / 2)
    panBy(-nodeCx, -nodeCy)
    const fit = Math.min((vr.width - 140) / (nr.width / view.z), (vr.height - 140) / (nr.height / view.z))
    setZoom(Number.isFinite(fit) ? fit : 1)
  }
  const zoomToNodeRef = useRef(zoomToNode)
  zoomToNodeRef.current = zoomToNode

  useEffect(() => {
    const onKeyDown = (event) => {
      if (typingTarget(event) || modalOpen()) return
      if (event.code === "Space") {
        if (event.target.closest?.("button, a, [role='button']")) return
        event.preventDefault()
        if (!event.repeat) {
          space.current = true
          setSpaceDown(true)
        }
        return
      }
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "=" || event.key === "+") {
          event.preventDefault()
          setZoom(view.z * 1.25)
        } else if (event.key === "-") {
          event.preventDefault()
          setZoom(view.z / 1.25)
        }
        return
      }
      if (event.altKey) return
      if (event.key === "Escape" && state.selectedEl) {
        const current = focused()
        if (!current) return
        event.preventDefault()
        openProject(current, null)
        return
      }
      if (event.key === "v" || event.key === "V") {
        setTool("move")
        return
      }
      if (event.key === "h" || event.key === "H") {
        setTool("hand")
        return
      }
      if (event.shiftKey && event.code === "Digit1") {
        event.preventDefault()
        resetView()
        return
      }
      if (event.shiftKey && event.code === "Digit0") {
        event.preventDefault()
        setZoom(1)
        return
      }
      if (event.shiftKey && event.code === "Digit2") {
        event.preventDefault()
        const id = state.selectedEl
        const node = !id || id === "background" ? phoneRef.current : nodes.current[id]
        zoomToNodeRef.current(node || phoneRef.current)
        return
      }
      if (event.key === "Tab") {
        if (event.target.closest?.(".dock, .inspector, .topbar, .editor-chrome, .gate")) return
        const current = focused()
        if (!current) return
        event.preventDefault()
        const index = SELECT_ORDER.indexOf(state.selectedEl)
        const dir = event.shiftKey ? -1 : 1
        const nextIndex = index < 0 ? (dir > 0 ? 0 : SELECT_ORDER.length - 1) : (index + dir + SELECT_ORDER.length) % SELECT_ORDER.length
        openProject(current, SELECT_ORDER[nextIndex])
      }
    }
    const onKeyUp = (event) => {
      if (event.code !== "Space") return
      space.current = false
      setSpaceDown(false)
    }
    const clearSpace = () => {
      space.current = false
      setSpaceDown(false)
    }
    window.addEventListener("keydown", onKeyDown, true)
    window.addEventListener("keyup", onKeyUp, true)
    window.addEventListener("blur", clearSpace)
    return () => {
      window.removeEventListener("keydown", onKeyDown, true)
      window.removeEventListener("keyup", onKeyUp, true)
      window.removeEventListener("blur", clearSpace)
    }
  }, [project && project.id])

  const transform = `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.z * (1 + view.stretch)}, ${view.z})`

  useLayoutEffect(() => {
    const phone = phoneRef.current
    const current = focused()
    const selected = current && state.openId === current.id ? state.selectedEl : null
    const node = selected ? nodes.current[selected] : null
    if (!phone || !node) return
    let x = 0
    let y = 0
    let el = node
    while (el && el !== phone) {
      x += el.offsetLeft
      y += el.offsetTop
      el = el.offsetParent
    }
    const w = node.offsetWidth
    const h = node.offsetHeight
    const inset = Math.min(current.elements[selected].radius, w / 2, h / 2)
    const corners = {
      nw: [x + inset, y + inset],
      ne: [x + w - inset, y + inset],
      sw: [x + inset, y + h - inset],
      se: [x + w - inset, y + h - inset]
    }
    phone.querySelectorAll(".handle").forEach((handle) => {
      const corner = handle.dataset.corner
      handle.style.left = corners[corner][0] + "px"
      handle.style.top = corners[corner][1] + "px"
    })
  })

  if (!project) {
    return <div className="viewport" ref={viewport} />
  }

  const selected = state.openId === project.id ? state.selectedEl : null
  const picked = new Set(selected ? selectionIds() : [])

  const onPhonePointerDown = (event) => {
    const handle = event.target.closest?.(".handle")
    if (!handle || !selected) return
    event.preventDefault()
    event.stopPropagation()
    const pointerId = event.pointerId
    const corner = handle.dataset.corner
    drag.current = { corner, pointerId }
    const move = (ev) => {
      if (ev.pointerId !== pointerId) return
      const node = nodes.current[state.selectedEl]
      if (!node) return
      setRadius(radiusFromCorner(node, corner, ev.clientX, ev.clientY), state.selectedEl === "background")
    }
    const end = (ev) => {
      if (ev.pointerId !== pointerId) return
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
      drag.current = null
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
  }

  const startPan = (event) => {
    event.preventDefault()
    setPanning(true)
    let lastX = event.clientX
    let lastY = event.clientY
    let moved = false
    const pointerId = event.pointerId
    const move = (ev) => {
      if (ev.pointerId !== pointerId) return
      const dx = ev.clientX - lastX
      const dy = ev.clientY - lastY
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true
      panBy(dx, dy)
      lastX = ev.clientX
      lastY = ev.clientY
    }
    const end = (ev) => {
      if (ev.pointerId !== pointerId) return
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
      setPanning(false)
      if (moved) swallowClick()
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
  }

  const hand = tool === "hand" || spaceDown

  return (
    <div
      className={"viewport tool-" + tool + (hand ? " tool-hand" : "") + (panning ? " panning" : "")}
      ref={viewport}
      onPointerDownCapture={(event) => {
        if (event.button !== 1 && tool !== "hand" && !space.current) return
        if (event.target.closest?.(".editor-chrome")) return
        event.stopPropagation()
        startPan(event)
      }}
      onPointerDown={(event) => {
        if (event.target !== viewport.current) return
        if (event.button === 1 || tool === "hand" || space.current) return
        const pointerId = event.pointerId
        const startX = event.clientX
        const startY = event.clientY
        let moved = false
        const move = (ev) => {
          if (ev.pointerId !== pointerId) return
          if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 3) moved = true
        }
        const end = (ev) => {
          if (ev.pointerId !== pointerId) return
          window.removeEventListener("pointermove", move)
          window.removeEventListener("pointerup", end)
          window.removeEventListener("pointercancel", end)
          if (!moved) openProject(project, null)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", end)
        window.addEventListener("pointercancel", end)
      }}
    >
      <div className="editor-chrome tool-rail" role="toolbar" aria-label="Tools">
        <button type="button" aria-pressed={tool === "move"} data-tip="Move. Click a layer. V" onClick={() => setTool("move")}>
          <MoveIcon />
        </button>
        <button type="button" aria-pressed={tool === "hand"} data-tip="Hand. Drag the canvas. H, or hold Space" onClick={() => setTool("hand")}>
          <HandIcon />
        </button>
      </div>
      <div className="editor-chrome zoom-bar" role="group" aria-label="Zoom">
        <button type="button" aria-label="Zoom out" data-tip="Zoom out" onClick={() => setZoom(view.z / 1.25)}>−</button>
        <button type="button" className="zoom-pct" data-tip="Zoom to 100%. Shift 0" onClick={() => setZoom(1)}>{Math.round(view.z * 100)}%</button>
        <button type="button" aria-label="Zoom in" data-tip="Zoom in" onClick={() => setZoom(view.z * 1.25)}>+</button>
        <button type="button" data-tip="Zoom to fit. Shift 1" onClick={() => resetView()}>Fit</button>
      </div>
      <div className="world" style={{ transform }}>
        <div className="frames">
          {(project.screens && project.screens.length ? project.screens : [activeScreen(project)]).map((screen, index) => {
            const live = screen.id === (activeScreen(project) && activeScreen(project).id)
            const mine = screenEditable(project, screen)
            const locked = !!(screen.owner && screen.owner !== "player")
            const art = screen.elements
            return (
              <div key={screen.id} className={"figma-frame" + (live ? " on" : "") + (locked ? " locked" : "")} style={{ left: index * 490 }}>
                <div className="frame-head">
                  <button type="button" className={"frame-name" + (live && picked.has("background") ? " on" : "")} data-tip={locked ? "This frame is locked. Take over to edit it." : "Select this frame."} onClick={() => openEditor(project, screen, "background")}>
                    {screen.name}
                    <span>{screenOwnerName(screen)}</span>
                  </button>
                  {locked && (
                    <button type="button" className="takeover" data-tip="Pull this frame back. The intern stops." onClick={() => takeScreen(project, screen.id)}>Take over</button>
                  )}
                </div>
                <div
                  className={"frame-body" + (live && picked.has("background") ? " is-selected" : "")}
                  ref={(el) => { if (live) { phoneRef.current = el; nodes.current.background = el } }}
                  onPointerDown={live && mine ? onPhonePointerDown : undefined}
                  style={{ background: COLOURS[art.background.colour].hex, borderRadius: art.background.radius }}
                  onClick={() => openEditor(project, screen, "background")}
                >
                  {locked && (
                    <p className="frame-lock">{ownerFirst(screen)} has this frame. Take over to open it in the editor. They stop, and the frame comes back to you.</p>
                  )}
                  {project.hasUX && <span className={"flowchip" + flowClass(project)}>{flowText(project)}</span>}
                  <p className="onboard-kicker" aria-hidden="true">Onboarding</p>
                  <button
                    type="button"
                    ref={(el) => { if (live) nodes.current.title = el }}
                    className={"part title" + (lowContrast(art, "title") ? " low-contrast" : "") + (live && picked.has("title") ? " on" : "")}
                    style={{
                      color: fade(COLOURS[art.background.colour].hex, inkHex({ elements: art }, "title"), contrastMix(art.title)),
                      fontSize: typeSize(art.title.hierarchy)
                    }}
                    onClick={(event) => { event.stopPropagation(); openEditor(project, screen, "title") }}
                  >
                    {art.title.copy || "Headline"}
                  </button>
                  <div className="choice-stack">
                    {["cardA", "cardB"].map((id) => (
                      <button
                        key={id}
                        type="button"
                        ref={(el) => { if (live) nodes.current[id] = el }}
                        className={"part card" + (lowContrast(art, id) ? " low-contrast" : "") + (live && picked.has(id) ? " on" : "")}
                        style={{ background: COLOURS[art[id].colour].hex, borderRadius: art[id].radius }}
                        onClick={(event) => { event.stopPropagation(); openEditor(project, screen, id) }}
                      >
                        <span className="card-label" style={{ color: fade(COLOURS[art[id].colour].hex, inkHex({ elements: art }, id), contrastMix(art[id])), fontSize: typeSize(art[id].hierarchy) }}>
                          {art[id].copy}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    ref={(el) => { if (live) nodes.current.save = el }}
                    className={"part save" + (lowContrast(art, "save") ? " low-contrast" : "") + (live && picked.has("save") ? " on" : "")}
                    style={{
                      background: COLOURS[art.save.colour].hex,
                      color: fade(COLOURS[art.save.colour].hex, inkHex({ elements: art }, "save"), contrastMix(art.save)),
                      borderRadius: art.save.radius,
                      fontSize: typeSize(art.save.hierarchy)
                    }}
                    onClick={(event) => { event.stopPropagation(); openEditor(project, screen, "save") }}
                  >
                    {art.save.copy || "Continue"}
                  </button>
                  {live && mine && selected && selected !== "title" && (
                    <div className="handles">
                      {CORNERS.map((corner) => (
                        <button key={corner} type="button" className={"handle " + corner} data-corner={corner} aria-label="Corner radius" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
