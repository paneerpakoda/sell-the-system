import { useEffect, useRef, useState } from "react"
import { nameStudio, state } from "../engine.js"

export function Gate() {
  const [draft, setDraft] = useState("")
  const input = useRef(null)
  const clean = draft.trim().replace(/\s+/g, " ")

  useEffect(() => {
    input.current?.focus()
  }, [])

  if (state.studioName) return null

  return (
    <div className="gate">
      <form
        className="gate-card"
        onSubmit={(event) => {
          event.preventDefault()
          if (clean) nameStudio(clean)
        }}
      >
        <h1>Name the studio</h1>
        <p>Click what pulses. The round clock is the client's 5:00. The bars are the month: four one-minute weeks, then payroll.</p>
        <label htmlFor="studio-name">Studio name</label>
        <input
          ref={input}
          id="studio-name"
          value={draft}
          maxLength={28}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={!clean}>Open</button>
      </form>
    </div>
  )
}
