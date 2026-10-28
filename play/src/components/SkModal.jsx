import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { setModal } from "../modalGate.js"

const entries = []
const listeners = new Set()
let inertHolds = 0

function emit() {
  listeners.forEach((fn) => fn())
}

function place(id, open, blocking) {
  const rest = entries.filter((item) => item.id !== id)
  if (!open) {
    if (rest.length === entries.length) return
    entries.splice(0, entries.length, ...rest)
    setModal(id, false)
    emit()
    return
  }
  const item = { id, blocking: !!blocking }
  const next = item.blocking ? [item, ...rest] : [...rest, item]
  const same = next.length === entries.length && next.every((row, index) => row.id === entries[index].id)
  if (same) return
  entries.splice(0, entries.length, ...next)
  setModal(id, true)
  emit()
}

function holdInert() {
  inertHolds += 1
  document.querySelector(".app")?.setAttribute("inert", "")
  return () => {
    inertHolds = Math.max(0, inertHolds - 1)
    if (inertHolds === 0) document.querySelector(".app")?.removeAttribute("inert")
  }
}

function focusables(root) {
  if (!root) return []
  return [...root.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((node) => {
    if (node.disabled) return false
    if (node.getAttribute("aria-hidden") === "true") return false
    return true
  })
}

export function SkModal({
  id,
  open,
  blocking = false,
  role = "dialog",
  labelledBy,
  scrim = "soft",
  scrimCloses = false,
  onEscape,
  onScrim,
  children
}) {
  const ref = useRef(null)
  const opener = useRef(null)
  const escapeRef = useRef(onEscape)
  const scrimRef = useRef(onScrim)
  escapeRef.current = onEscape
  scrimRef.current = onScrim
  const [, setTick] = useState(0)

  useEffect(() => {
    const onStore = () => setTick((n) => n + 1)
    listeners.add(onStore)
    return () => listeners.delete(onStore)
  }, [])

  useEffect(() => {
    place(id, !!open, blocking)
    return () => place(id, false, blocking)
  }, [id, open, blocking])

  const active = !!open && entries[0]?.id === id
  const waiting = Math.max(0, entries.length - 1)

  useEffect(() => {
    if (!active) return undefined
    opener.current = document.activeElement
    const release = holdInert()
    const dialog = ref.current
    const nodes = focusables(dialog)
    const preferred = dialog?.querySelector("[data-initial-focus]") || nodes[0]
    preferred?.focus()
    const onKey = (event) => {
      if (entries[0]?.id !== id) return
      const box = ref.current
      if (!box) return
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        if (escapeRef.current) escapeRef.current()
        return
      }
      if (event.key !== "Tab") return
      const list = focusables(box)
      if (!list.length) {
        event.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement
      if (event.shiftKey && (current === first || !box.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (current === last || !box.contains(current))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("keydown", onKey, true)
      release()
      const back = opener.current
      if (back && document.contains(back) && back !== document.body) back.focus()
    }
  }, [active, id])

  if (!active) return null
  return createPortal(
    <div
      className={"sk-scrim" + (scrim === "hard" ? " sk-scrim--hard" : "")}
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (scrimRef.current) scrimRef.current()
        else if (scrimCloses && escapeRef.current) escapeRef.current()
      }}
    >
      <div
        ref={ref}
        className="sk-bezel sk-modal"
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {waiting > 0 && <p className="sk-waiting">{waiting} of {entries.length} waiting</p>}
        {children}
      </div>
    </div>,
    document.body
  )
}
