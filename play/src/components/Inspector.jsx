import { useEffect, useRef, useState } from "react"
import {
  COLOURS,
  activeScreen,
  clientBrief,
  focused,
  edited,
  frameCopy,
  paintedContrast,
  radiusHint,
  screenEditable,
  setRadius,
  shownGrade,
  LANG,
  NAMES,
  openProject,
  state,
} from "../engine.js"
import { guidingFirst } from "./guidance.jsx"

const SWATCHES = ["paper", "white", "ink", "sand", "stone", "hot", "lime"]
const ORDER = ["colour", "radius", "contrast"]
const RADIUS_STOPS = [0, 4, 8, 12, 16, 20]
const RADIUS_PARTS = ["title", "cardA", "cardB", "save"]

function RadiusSlider({ project }) {
  const track = useRef(null)
  const industry = LANG[project.industry].radius
  const parts = RADIUS_PARTS.map((id) => project.elements[id].radius)
  const uniform = parts.every((radius) => radius === parts[0]) ? parts[0] : null
  const selectedId = state.selectedEl && project.elements[state.selectedEl] ? state.selectedEl : null
  const selectedValue = selectedId ? project.elements[selectedId].radius : uniform
  const choose = (event) => {
    const node = track.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const across = rect.width <= 1 ? 0 : (event.clientX - rect.left) / rect.width
    const index = Math.round(Math.min(1, Math.max(0, across)) * (RADIUS_STOPS.length - 1))
    setRadius(RADIUS_STOPS[index])
  }
  const drag = (event) => {
    if (event.target.closest("button")) return
    event.preventDefault()
    choose(event)
    const move = (ev) => choose(ev)
    const end = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
  }
  return (
    <div className="radius-slider" ref={track} onPointerDown={drag}>
      {RADIUS_STOPS.map((stop) => (
        <button
          key={stop}
          type="button"
          className={"radius-stop" + (selectedValue === stop ? " on" : "") + (industry === stop ? " industry" : "")}
          aria-label={"Radius " + stop + " on every corner"}
          aria-pressed={selectedValue === stop}
          onClick={() => setRadius(stop)}
          onPointerDown={(event) => { event.stopPropagation(); setRadius(stop) }}
        >
          <i />
          <span>{stop}</span>
        </button>
      ))}
      <span className="fig-sub">Selected {selectedValue}</span>
    </div>
  )
}

function scrubRadius(event, start, fromBackground) {
  event.preventDefault()
  const startX = event.clientX
  const move = (ev) => {
    setRadius(start + Math.round((ev.clientX - startX) / 2), fromBackground)
  }
  const end = () => {
    window.removeEventListener("pointermove", move)
    window.removeEventListener("pointerup", end)
  }
  window.addEventListener("pointermove", move)
  window.addEventListener("pointerup", end)
}

function Brief({ project }) {
  const brief = clientBrief(project)
  return (
    <div className="brief">
      <p className="fig-title">{brief.system}</p>
      <p className="brief-note">{brief.voice}</p>
      <div className="lib-list">
        {brief.colours.map((name) => (
          <div key={name} className="lib-row">
            <i data-colour={name} />
            {COLOURS[name].name}
          </div>
        ))}
      </div>
    </div>
  )
}

function ColourLibrary({ anchor, selected, onPick }) {
  const [box, setBox] = useState(null)
  useEffect(() => {
    const place = () => {
      const node = anchor.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      setBox({ top: Math.max(8, rect.top), right: window.innerWidth - rect.left + 8 })
    }
    place()
    window.addEventListener("resize", place)
    return () => window.removeEventListener("resize", place)
  }, [anchor])
  if (!box) return null
  return (
    <div className="library" style={{ top: box.top, right: box.right }} role="listbox" aria-label="Colours">
      {SWATCHES.map((name) => (
        <button
          key={name}
          type="button"
          role="option"
          aria-selected={selected === name}
          className={"lib-row" + (selected === name ? " on" : "")}
          onClick={() => onPick(name)}
        >
          <i data-colour={name} />
          {COLOURS[name].name}
        </button>
      ))}
    </div>
  )
}

function FillRow({ colour, open, onToggle, onPick, label, pulse }) {
  const anchor = useRef(null)
  const name = colour && COLOURS[colour] ? COLOURS[colour].name : "Auto"
  const dot = colour && COLOURS[colour] ? colour : null
  return (
    <div className="fig-anchor" ref={anchor}>
      <button type="button" className={"fill-row" + (open ? " on" : "") + (pulse ? " guide-pulse" : "")} aria-expanded={open} onClick={onToggle}>
        <i className="fill-dot" data-colour={dot || undefined} style={dot ? undefined : { background: "#fff" }} />
        <span>{label ? label + " " : ""}{name}</span>
        {pulse && <span className="sr-only">Next click.</span>}
      </button>
      {open && <ColourLibrary anchor={anchor} selected={colour} onPick={onPick} />}
    </div>
  )
}

export function Inspector() {
  const project = focused()
  const [open, setOpen] = useState(null)
  const root = useRef(null)
  useEffect(() => {
    const onEscape = () => setOpen(null)
    window.addEventListener("close-popovers", onEscape)
    return () => window.removeEventListener("close-popovers", onEscape)
  }, [])
  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (root.current && root.current.contains(event.target)) return
      if (event.target.closest && event.target.closest(".library")) return
      setOpen(null)
    }
    window.addEventListener("pointerdown", close)
    return () => window.removeEventListener("pointerdown", close)
  }, [open])

  if (!project) return <aside className="inspector" aria-label="Editor" />
  const screen = activeScreen(project)
  if (!screenEditable(project, screen) || !state.selectedEl || state.openId !== project.id) {
    return (
      <aside className="inspector" aria-label="Editor">
        <Brief project={project} />
      </aside>
    )
  }

  const id = state.selectedEl
  const el = project.elements[id]
  const component = state.tools.components && (id === "cardA" || id === "cardB")
  const radiusValue = el.radius
  const colourWord = shownGrade(project, id, "colour")
  const radiusWord = shownGrade(project, id, "radius")
  const contrastWord = id === "background" ? "" : shownGrade(project, id, "contrast")
  const contrastValue = id === "background" ? paintedContrast(project, "title") : paintedContrast(project, id)
  const contrastGrade = id === "background" ? shownGrade(project, "title", "contrast") : contrastWord
  const inkName = el.ink && COLOURS[el.ink] ? el.ink : null
  const showText = id !== "background"
  const contrastTitle = id === "background" ? "Title contrast" : "Contrast"
  const guide = guideProp(project, id)

  const sections = {
    colour: (
      <section key="colour" className="fig-section" data-tip="Calm colours pass. Hot and Lime are wrong.">
        <header className="fig-head">
          <h3>Fill</h3>
          <b className={tone(colourWord)}>{colourWord}</b>
        </header>
        <FillRow
          colour={el.colour}
          open={open === "fill"}
          pulse={guide === "colour" || (guide === "contrast" && !showText)}
          onToggle={() => setOpen(open === "fill" ? null : "fill")}
          onPick={(name) => { edited((_, item) => { item.colour = name }); setOpen(null) }}
        />
      </section>
    ),
    radius: (
      <section key="radius" className="fig-section" data-tip={state.tools.radius ? "Variable radius. One number for every corner on this frame. The frame is 4 larger." : "This corner only. You can also drag the handles on the frame."}>
        <header className="fig-head">
          <h3>Radius</h3>
          <b className={tone(radiusWord)}>{radiusWord}</b>
        </header>
        <p className="fig-sub">{radiusHint(project, id)}</p>
        <label className={"fig-field" + (state.tools.radius ? " wide" : "") + (guide === "radius" ? " guide-pulse" : "")}>
          <button type="button" className="scrub" aria-label="Scrub corner radius" onPointerDown={(event) => scrubRadius(event, radiusValue, id === "background" && state.tools.radius)}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 11.5V6.5a4 4 0 0 1 4-4h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
          {state.tools.radius && <span className="var-name">radius</span>}
          <input
            className="num"
            type="number"
            min="0"
            max="32"
            value={radiusValue}
            aria-label={state.tools.radius ? "Radius variable" : "Corner radius"}
            onChange={(event) => setRadius(event.target.value, id === "background" && state.tools.radius)}
          />
        </label>
        {state.tools.radius && <RadiusSlider project={project} />}
      </section>
    ),
    contrast: (
      <section key="contrast" className="fig-section" data-tip="Comes from the text colour and the fill behind it.">
        <header className="fig-head">
          <h3>{contrastTitle}</h3>
          <b className={tone(contrastGrade)}>{contrastGrade}</b>
        </header>
        <div className="fig-field read">
          <span className="fig-sub">Ratio</span>
          <span className="num">{contrastValue.toFixed(1)}:1</span>
        </div>
        {showText && (
          <>
            <p className="fig-sub">Text</p>
            <FillRow
              colour={inkName}
              open={open === "text"}
              pulse={guide === "contrast"}
              onToggle={() => setOpen(open === "text" ? null : "text")}
              onPick={(name) => { edited((_, item) => { item.ink = name }); setOpen(null) }}
            />
          </>
        )}
      </section>
    )
  }

  return (
    <aside className="inspector" aria-label="Editor" ref={root}>
      <Brief project={project} />
      <div className="layer-name">
        <h2 data-tip={component ? "Both cards take this edit." : undefined}>{component ? "Card" : NAMES[id]}</h2>
        <button type="button" className="icon-x" aria-label="Close" onClick={() => openProject(project, null)}>×</button>
      </div>
      {project.hasUX && id === "background" && project.flow && project.flow.demand && <FlowSection project={project} />}
      {project.hasUX && id !== "background" && <TypeSection project={project} id={id} el={el} />}
      {ORDER.map((key) => sections[key])}
    </aside>
  )
}

function Choice({ on, label, onPick }) {
  return (
    <button type="button" className={"choice" + (on ? " on" : "")} aria-pressed={on} onClick={onPick}>
      {label}
    </button>
  )
}

function FlowSection({ project }) {
  const flow = project.flow
  const demand = flow.demand === "error" ? "error" : "empty"
  const demandFixed = demand === "empty" ? flow.emptyFixed : flow.errorFixed
  const showing = flow.showing
  return (
    <section className="fig-section" data-tip="Show the state this client asked for, then mark it fixed.">
      <header className="fig-head">
        <h3>Flow</h3>
        <b className={demandFixed ? "tone-best" : "tone-wrong"}>{demandFixed ? "Fixed" : "Wrong"}</b>
      </header>
      <p className="fig-sub">This client needs {demand} fixed.</p>
      <div className="choice-row" role="group" aria-label="State on the screen">
        {["default", "empty", "error"].map((name) => (
          <Choice key={name} label={name[0].toUpperCase() + name.slice(1)} on={showing === name} onPick={() => edited((item) => { item.flow.showing = name })} />
        ))}
      </div>
      <div className="choice-row" role="group" aria-label={demand + " state"}>
        <Choice label="Broken" on={!demandFixed} onPick={() => edited((item) => { item.flow[demand + "Fixed"] = false; item.flow.showing = demand })} />
        <Choice label="Fixed" on={demandFixed} onPick={() => edited((item) => { item.flow[demand + "Fixed"] = true; item.flow.showing = demand })} />
      </div>
    </section>
  )
}

function TypeSection({ project, id, el }) {
  const hierarchy = project.reqs.find((req) => req.element === id && req.prop === "hierarchy")
  const copyReq = project.reqs.find((req) => req.element === id && req.prop === "copy")
  const hierarchyOk = !hierarchy || el.hierarchy === hierarchy.value
  const words = frameCopy(project)
  const wanted = id === "save" ? words.action : words.title
  const copyOk = !copyReq || el.copy === wanted
  const options = [wanted, "Stuff", "Submit"].filter((value, index, list) => list.indexOf(value) === index)
  return (
    <>
      {hierarchy && (
        <section className="fig-section" data-tip="Primary on the title and the button. Body on the cards.">
          <header className="fig-head">
            <h3>Type</h3>
            <b className={hierarchyOk ? "tone-best" : "tone-wrong"}>{hierarchyOk ? cap(el.hierarchy) : "Wrong"}</b>
          </header>
          <div className="choice-row" role="group" aria-label="Hierarchy">
            {["small", "body", "primary"].map((name) => (
              <Choice key={name} label={cap(name)} on={el.hierarchy === name} onPick={() => edited((_, item) => { item.hierarchy = name })} />
            ))}
          </div>
        </section>
      )}
      {copyReq && (
        <section className="fig-section" data-tip="The frame's own words. Stuff and Submit are wrong.">
          <header className="fig-head">
            <h3>Copy</h3>
            <b className={copyOk ? "tone-best" : "tone-wrong"}>{copyOk ? "Clear" : "Wrong"}</b>
          </header>
          <div className="choice-row" role="group" aria-label="Copy">
            {options.map((value) => (
              <Choice key={value} label={value} on={el.copy === value} onPick={() => edited((_, item) => { item.copy = value })} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function cap(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : ""
}

function guideProp(project, id) {
  const guide = guidingFirst()
  if (!guide || !guide.started || guide.shipLive || !guide.onLead || !guide.lead) return ""
  if (project.id !== guide.project.id || id !== guide.lead.id) return ""
  return guide.lead.prop
}

function tone(word) {
  if (word === "Not judged") return "tone-bare"
  if (word === "Wrong") return "tone-wrong"
  if (word === "Bare minimum") return "tone-bare"
  if (word === "Acceptable") return "tone-ok"
  return "tone-best"
}
