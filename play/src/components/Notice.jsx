import { Button } from "@/components/unlumen-ui/primitives/button"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { dismissNotice, state } from "../engine.js"
import { SkModal } from "./SkModal.jsx"

export function Notice() {
  const note = state.break ? null : state.notices[0]
  return (
    <SkModal id="coach-notice" open={!!note} scrim="soft" scrimCloses labelledBy="notice-title" onEscape={() => dismissNotice()}>
      {note && (
        <>
          <h2 id="notice-title" className="sk-title">{note.title}</h2>
          <div className="sk-bezel-body"><p>{note.body}</p></div>
          <div className="sk-bezel-actions">
            <Button type="button" className="sk-cbtn sk-cbtn--primary" data-initial-focus onClick={() => dismissNotice()}>Got it</Button>
          </div>
        </>
      )}
    </SkModal>
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
