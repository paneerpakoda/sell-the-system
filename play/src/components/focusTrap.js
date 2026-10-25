import { useEffect, useRef } from "react"

const stack = []

function focusables(root) {
  if (!root) return []
  return [...root.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((node) => {
    if (node.disabled) return false
    if (node.getAttribute("aria-hidden") === "true") return false
    return true
  })
}

// Keeps Tab inside the open dialog. Esc and Enter are optional.
// Only the topmost dialog handles the key.
export function useModal(active) {
  const ref = useRef(null)
  const onEscape = useRef(null)
  const onEnter = useRef(null)
  useEffect(() => {
    if (!active) return undefined
    const entry = { ref }
    stack.push(entry)
    const root = ref.current
    const nodes = focusables(root)
    const preferred = root && (root.querySelector("[data-confirm]") || nodes[0])
    preferred?.focus()
    const onKey = (event) => {
      if (stack[stack.length - 1] !== entry) return
      const dialog = ref.current
      if (!dialog) return
      if (event.key === "Escape" && onEscape.current) {
        event.preventDefault()
        event.stopPropagation()
        onEscape.current()
        return
      }
      if (event.key === "Enter" && onEnter.current) {
        const target = event.target
        if (target && (target.tagName === "TEXTAREA" || (target.tagName === "INPUT" && target.type !== "button" && target.type !== "submit"))) return
        event.preventDefault()
        event.stopPropagation()
        onEnter.current()
        return
      }
      if (event.key !== "Tab") return
      const list = focusables(dialog)
      if (!list.length) {
        event.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement
      if (event.shiftKey && (current === first || !dialog.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (current === last || !dialog.contains(current))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("keydown", onKey, true)
      const index = stack.indexOf(entry)
      if (index >= 0) stack.splice(index, 1)
    }
  }, [active])
  return { ref, onEscape, onEnter }
}
