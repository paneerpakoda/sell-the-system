import { useEffect, useState } from "react"
import { start, subscribe } from "./engine.js"

export function useGame() {
  const [, setTick] = useState(0)
  useEffect(() => {
    start()
    return subscribe(() => setTick((n) => n + 1))
  }, [])
}
