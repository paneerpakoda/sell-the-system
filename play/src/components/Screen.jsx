import { useEffect, useLayoutEffect, useRef } from "react"
import {
  COLOURS,
  clampRadius,
  contrastMix,
  fade,
  focused,
  inkHex,
  openParts,
  openProject,
  openScreen,
  takeScreen,
  activeScreen,
  screenEditable,
  screenOwnerName,
  selectionIds,
  setRadius,
  panBy,
  state,
  typeSize,
  view,
  zoomAt
} from "../engine.js"

const CORNERS = ["nw", "ne", "sw", "se"]

function leadElement(project, screen, fallback) {
  const parts = openParts(project)
  const hit = parts.find((group) => group.screenId === screen.id) || parts[0]
  return hit ? hit.id : fallback
}

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

function flowClass(project) {
  const flow = project.flow
  if (!flow || flow.showing === "default") return ""
  const fixed = flow.showing === "empty" ? flow.emptyFixed : flow.errorFixed
  return fixed ? " fixed" : " broken"
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
  const viewport = useRef(null)
  const phoneRef = useRef(null)
  const nodes = useRef({})
  const drag = useRef(null)
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

  return (
    <div
      className="viewport"
      ref={viewport}
      onPointerDown={(event) => {
        if (event.target !== viewport.current) return
        let lastX = event.clientX
        let lastY = event.clientY
        const move = (ev) => {
          panBy(ev.clientX - lastX, ev.clientY - lastY)
          lastX = ev.clientX
          lastY = ev.clientY
        }
        const end = () => {
          window.removeEventListener("pointermove", move)
          window.removeEventListener("pointerup", end)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", end)
      }}
    >
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
                  <button type="button" className="frame-name" data-tip={locked ? "This frame is locked. Take over to edit it." : "Open this frame in the editor."} onClick={() => openEditor(project, screen, leadElement(project, screen, "title"))}>
                    {screen.name}
                    <span>{screenOwnerName(screen)}</span>
                  </button>
                  {locked && (
                    <button type="button" className="takeover" data-tip="Pull this frame back. The intern stops." onClick={() => takeScreen(project, screen.id)}>Take over</button>
                  )}
                </div>
                <div
                  className="frame-body"
                  ref={(el) => { if (live) { phoneRef.current = el; nodes.current.background = el } }}
                  onPointerDown={live && mine ? onPhonePointerDown : undefined}
                  style={{ background: COLOURS[art.background.colour].hex, borderRadius: art.background.radius }}
                  onClick={() => openEditor(project, screen, leadElement(project, screen, "background"))}
                >
                  {locked && (
                    <p className="frame-lock">{ownerFirst(screen)} has this frame. Take over to open it in the editor. They stop, and the frame comes back to you.</p>
                  )}
                  {project.hasUX && <span className={"flowchip" + flowClass(project)}>{flowText(project)}</span>}
                  <button
                    type="button"
                    ref={(el) => { if (live) nodes.current.title = el }}
                    className={"part title" + (live && picked.has("title") ? " on" : "")}
                    style={{
                      color: fade(COLOURS[art.background.colour].hex, inkHex({ elements: art }, "title"), contrastMix(art.title)),
                      borderRadius: art.title.radius,
                      fontSize: typeSize(art.title.hierarchy)
                    }}
                    onClick={(event) => { event.stopPropagation(); openEditor(project, screen, "title") }}
                  >
                    {art.title.copy}
                  </button>
                  {["cardA", "cardB"].map((id) => (
                    <button
                      key={id}
                      type="button"
                      ref={(el) => { if (live) nodes.current[id] = el }}
                      className={"part card" + (live && picked.has(id) ? " on" : "")}
                      style={{ background: COLOURS[art[id].colour].hex, borderRadius: art[id].radius }}
                      onClick={(event) => { event.stopPropagation(); openEditor(project, screen, id) }}
                    >
                      <span style={{ color: fade(COLOURS[art[id].colour].hex, inkHex({ elements: art }, id), contrastMix(art[id])), fontSize: typeSize(art[id].hierarchy) }}>
                        {art[id].copy}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    ref={(el) => { if (live) nodes.current.save = el }}
                    className={"part save" + (live && picked.has("save") ? " on" : "")}
                    style={{
                      background: COLOURS[art.save.colour].hex,
                      color: fade(COLOURS[art.save.colour].hex, inkHex({ elements: art }, "save"), contrastMix(art.save)),
                      borderRadius: art.save.radius,
                      fontSize: typeSize(art.save.hierarchy)
                    }}
                    onClick={(event) => { event.stopPropagation(); openEditor(project, screen, "save") }}
                  >
                    {art.save.copy}
                  </button>
                  {live && mine && selected && (
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
