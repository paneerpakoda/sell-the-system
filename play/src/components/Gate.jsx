import { useEffect, useRef, useState } from "react"
import { nameStudio, state } from "../engine.js"
import { useModal } from "./focusTrap.js"

export function Gate() {
  const [draft, setDraft] = useState("")
  const input = useRef(null)
  const clean = draft.trim().replace(/\s+/g, " ")
  const modal = useModal(!state.studioName)

  useEffect(() => {
    input.current?.focus()
  }, [])

  if (state.tabNote || state.studioName) return null

  return (
    <div className="gate">
      <form
        ref={modal.ref}
        className="gate-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-title"
        onSubmit={(event) => {
          event.preventDefault()
          if (clean) nameStudio(clean)
        }}
      >
        <h1 id="studio-title">Name the studio</h1>
        <p>You run a design agency. Clients arrive with phone screens to fix. Ship the work yourself, hire help, and build a system until a quiet month can win without your hand.</p>
        {state.saveNote && <p role="status">{state.saveNote}</p>}
        <div className="gate-field">
          <label htmlFor="studio-name">Studio name</label>
          <input
            ref={input}
            id="studio-name"
            value={draft}
            maxLength={28}
            autoComplete="off"
            placeholder="e.g. Northwind Studio"
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <div className="gate-actions">
          <button type="submit" className="u-btn" disabled={!clean}>Open</button>
        </div>
      </form>
    </div>
  )
}
