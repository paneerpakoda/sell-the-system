import { useEffect, useState } from "react"
import { start, subscribe, subscribeClock, subscribeView } from "./engine.js"

export function useGame() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const stop = subscribe(() => setTick((n) => n + 1))
    start()
    return stop
  }, [])
}

export function useClock() {
  const [, setTick] = useState(0)
  useEffect(() => subscribeClock(() => setTick((n) => n + 1)), [])
}

export function useView() {
  const [, setTick] = useState(0)
  useEffect(() => subscribeView(() => setTick((n) => n + 1)), [])
}
