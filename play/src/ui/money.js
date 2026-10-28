import { createElement, useEffect, useState } from "react"

export const CURRENCIES = {
  INR: { locale: "en-IN", code: "INR", symbol: "₹" },
  USD: { locale: "en-US", code: "USD", symbol: "$" }
}
export const DEFAULT_CURRENCY = "INR"
/** Engine money is stored in dollars. INR display multiplies by this rate. */
export const INR_PER_USD = 80
export const COMPACT_FROM = { INR: 100000, USD: 100000 }
export const CURRENCY_KEY = "sts.currency"

const formatters = new Map()
const listeners = new Set()

function specFor(currency) {
  return CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY]
}

function readCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY)
    if (saved === "INR" || saved === "USD") return saved
  } catch {
    /* private mode */
  }
  return DEFAULT_CURRENCY
}

function formatter(currency, fraction, compact, sign) {
  const spec = specFor(currency)
  const key = [spec.code, fraction, compact, sign].join("|")
  let cached = formatters.get(key)
  if (!cached) {
    cached = new Intl.NumberFormat(spec.locale, {
      style: "currency",
      currency: spec.code,
      maximumFractionDigits: fraction,
      minimumFractionDigits: fraction === 2 ? 2 : 0,
      notation: compact ? "compact" : "standard",
      signDisplay: sign ? "exceptZero" : "auto"
    })
    formatters.set(key, cached)
  }
  return cached
}

/** Convert engine dollars into the amount shown for a currency. */
export function toDisplay(value, currency = DEFAULT_CURRENCY) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 0
  return currency === "INR" ? amount * INR_PER_USD : amount
}

// moneyText already shows cents (2.50). Zero fraction digits would turn that into 3.
export function formatMoney(value, { currency = DEFAULT_CURRENCY, compact = false, sign = false } = {}) {
  const amount = toDisplay(value, currency)
  if (!Number.isFinite(Number(value))) return ""
  const rounded = Math.round(amount * 100) / 100
  const useCompact = !!(compact && Math.abs(rounded) >= (COMPACT_FROM[currency] || COMPACT_FROM.INR))
  const cents = Math.round(Math.abs(rounded) * 100) % 100
  const fraction = useCompact ? 1 : cents === 0 ? 0 : 2
  return formatter(currency, fraction, useCompact, sign).format(rounded)
}

/** Private-use delimiters: engine stores amounts without a currency symbol. */
export const MONEY_OPEN = "\uFFF0"
export const MONEY_CLOSE = "\uFFF1"
const MONEY_TOKEN_RE = /\uFFF0(-?\d+(?:\.\d+)?)\uFFF1/g

/** Embed an engine (dollar-unit) amount in status / notes for later formatting. */
export function moneyToken(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ""
  const rounded = Math.round(amount * 100) / 100
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
  return MONEY_OPEN + text + MONEY_CLOSE
}

/** Replace money tokens with formatMoney for the active currency. */
export function expandMoneyText(text, currency = DEFAULT_CURRENCY) {
  if (text == null || text === "") return text
  return String(text).replace(MONEY_TOKEN_RE, (_, raw) => formatMoney(Number(raw), { currency }))
}

/** Parse the first money token in a status string (engine dollar units). */
export function readMoneyToken(text) {
  const match = MONEY_TOKEN_RE.exec(String(text || ""))
  MONEY_TOKEN_RE.lastIndex = 0
  return match ? Number(match[1]) : null
}

export function moneyLabel(value, currency = DEFAULT_CURRENCY) {
  const spec = specFor(currency)
  const amount = toDisplay(value, currency)
  if (!Number.isFinite(Number(value))) return ""
  const rounded = Math.round(amount * 100) / 100
  const digits = Number.isInteger(rounded) ? 0 : 2
  const num = new Intl.NumberFormat(spec.locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(Math.abs(rounded))
  const word = spec.code === "INR" ? "rupees" : "dollars"
  return (rounded < 0 ? "minus " : "") + num + " " + word
}

export function useCurrency() {
  const [currency, setCurrency] = useState(readCurrency)
  useEffect(() => {
    const onStore = (event) => {
      if (event.key && event.key !== CURRENCY_KEY) return
      setCurrency(readCurrency())
    }
    listeners.add(setCurrency)
    window.addEventListener("storage", onStore)
    return () => {
      listeners.delete(setCurrency)
      window.removeEventListener("storage", onStore)
    }
  }, [])
  const choose = (next) => {
    if (next !== "INR" && next !== "USD") return
    try {
      localStorage.setItem(CURRENCY_KEY, next)
    } catch {
      /* private mode */
    }
    listeners.forEach((fn) => fn(next))
  }
  return { currency, setCurrency: choose }
}

export function Money({ value, compact = false, sign = false, className = "" }) {
  const { currency } = useCurrency()
  const text = formatMoney(value, { currency, compact, sign })
  const announced = compact && Math.abs(toDisplay(value, currency)) >= (COMPACT_FROM[currency] || COMPACT_FROM.INR)
  return createElement(
    "span",
    {
      className: className ? "sk-num " + className : "sk-num",
      "aria-label": announced ? moneyLabel(value, currency) : undefined
    },
    text
  )
}

export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency()
  return createElement(
    "div",
    { className: "currency-switch", role: "group", "aria-label": "Currency" },
    createElement(
      "button",
      { type: "button", "aria-pressed": currency === "INR", onClick: () => setCurrency("INR") },
      "₹"
    ),
    createElement(
      "button",
      { type: "button", "aria-pressed": currency === "USD", onClick: () => setCurrency("USD") },
      "$"
    )
  )
}
