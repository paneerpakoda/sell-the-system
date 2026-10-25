import { useEffect, useRef, useState } from "react"
import { nameStudio, state } from "../engine.js"

const BEATS = [
  {
    title: "AI took the jobs.",
    body: "Every tech role went with them. You stopped waiting and opened a design studio."
  },
  {
    title: "It took the craft too.",
    body: "You can see a screen. You can't remember how to design one. You learn it again, by hand."
  }
]

export function Gate() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState("")
  const input = useRef(null)
  const button = useRef(null)
  const naming = step >= BEATS.length
  const clean = draft.trim().replace(/\s+/g, " ")

  useEffect(() => {
    if (naming) input.current?.focus()
    else button.current?.focus()
  }, [naming, step])

  if (state.studioName) return null

  function next() {
    if (!naming) {
      setStep(step + 1)
      return
    }
    if (clean) nameStudio(clean)
  }

  return (
    <div className="gate">
      <form
        className="gate-card"
        onSubmit={(event) => {
          event.preventDefault()
          next()
        }}
      >
        {naming ? (
          <>
            <label htmlFor="studio-name">Name the studio</label>
            <input
              ref={input}
              id="studio-name"
              value={draft}
              maxLength={28}
              autoComplete="off"
              onChange={(event) => setDraft(event.target.value)}
            />
          </>
        ) : (
          <>
            <h1>{BEATS[step].title}</h1>
            <p>{BEATS[step].body}</p>
          </>
        )}
        <button ref={button} type="submit" disabled={naming && !clean}>{naming ? "Open" : "Continue"}</button>
      </form>
    </div>
  )
}
