/** Shared modal open set so the engine can pause clocks without importing React. */
const openIds = new Set()

export function setModal(id, open) {
  if (!id) return
  if (open) openIds.add(id)
  else openIds.delete(id)
}

export function modalOpen() {
  return openIds.size > 0
}

export function clearModals() {
  openIds.clear()
}
