import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { dismissNotice, state } from "../engine.js"
import { useModal } from "./focusTrap.js"

export function Notice() {
  const note = state.notices[0]
  const modal = useModal(!!note)
  modal.onEscape.current = () => dismissNotice()
  modal.onEnter.current = () => dismissNotice()
  if (!note) return null
  return (
    <div className="modal-back" onClick={() => dismissNotice()}>
      <div
        ref={modal.ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="notice-title">{note.title}</h2>
        <p>{note.body}</p>
        <button type="button" data-confirm onClick={() => dismissNotice()}>Got it</button>
      </div>
    </div>
  )
}

export function Tips() {
  const [tip, setTip] = useState(null)
  useEffect(() => {
    let current = null
    let timer = 0
    const place = (host) => {
      const rect = host.getBoundingClientRect()
      const above = rect.top > window.innerHeight * 0.62
      setTip({
        text: host.dataset.tip,
        x: Math.min(window.innerWidth - 16, Math.max(16, rect.left + rect.width / 2)),
        y: above ? rect.top - 8 : rect.bottom + 8,
        above
      })
    }
    const over = (event) => {
      const host = event.target.closest?.("[data-tip]")
      if (host === current) return
      current = host
      clearTimeout(timer)
      if (!host) {
        setTip(null)
        return
      }
      timer = setTimeout(() => place(host), 360)
    }
    document.addEventListener("pointerover", over)
    document.addEventListener("focusin", over)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("pointerover", over)
      document.removeEventListener("focusin", over)
    }
  }, [])
  if (!tip) return null
  return createPortal(
    <div className={"tip" + (tip.above ? " above" : "")} role="tooltip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>,
    document.body
  )
}
