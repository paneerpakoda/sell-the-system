import { createContext, useContext, useMemo, useState } from "react"

const WorkspaceContext = createContext({
  atPc: false,
  openPc: () => {},
  closePc: () => {}
})

export function WorkspaceProvider({ children }) {
  const [atPc, setAtPc] = useState(false)
  const value = useMemo(() => ({
    atPc,
    openPc: () => setAtPc(true),
    closePc: () => setAtPc(false)
  }), [atPc])
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
