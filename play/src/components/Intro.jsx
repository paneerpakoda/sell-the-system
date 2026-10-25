import { useEffect, useRef, useState } from "react"
import { state } from "../engine.js"

export function Intro() {
  const [open, setOpen] = useState(true)
  const button = useRef(null)
  const show = open && !!state.studioName && state.accepted < 1

  useEffect(() => {
    if (!show) return undefined
    button.current?.focus()
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [show])

  if (!show) return null

  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="gate-card">
        <h1 id="intro-title">Click what pulses.</h1>
        <p>The first client is waiting. Fix that part, then ship.</p>
        <button ref={button} type="button" onClick={() => setOpen(false)}>Continue</button>
      </div>
    </section>
  )
}
