// WCAG 2.x contrast for the Minimal skin token stack.
// Load order (later wins): tokens.css :root, skin.css :root,
// skin-minimal.css :root then :root:not([data-skin="chunky"]), sk-bridge.css :root.
// Top-level blocks only. The plain :root in skin-minimal.css is included because
// --focus-on-ink and --focus-on-cream live there, ahead of the not-chunky overrides.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const stylesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/styles")

const sources = [
  { file: "tokens.css", selectors: [":root"] },
  { file: "skin.css", selectors: [":root"] },
  { file: "skin-minimal.css", selectors: [":root", ':root:not([data-skin="chunky"])'] },
  { file: "sk-bridge.css", selectors: [":root"] }
]

const required = [
  ["text", "text-on-ink", "ink-900", 4.5],
  ["text", "text-on-ink", "ink-800", 4.5],
  ["text", "text-on-ink-muted", "ink-900", 4.5],
  ["text", "text-on-ink-faint", "ink-800", 4.5],
  ["text", "text-on-ink-faint", "ink-950", 4.5],
  ["text", "text-on-cream", "cream-100", 4.5],
  ["text", "text-on-cream", "cream-200", 4.5],
  ["text", "text-on-cream", "cream-300", 4.5],
  ["text", "text-on-cream-muted", "cream-100", 4.5],
  ["text", "text-on-hot", "hot", 4.5],
  ["text", "text-on-hot", "hot-hover", 4.5],
  ["text", "hot-text", "ink-900", 4.5],
  ["text", "deadline-text", "ink-900", 4.5],
  ["text", "ok-text", "ink-800", 4.5],
  ["text", "warn-text", "ink-800", 4.5],
  ["text", "text-link-on-raised", "raised", 4.5],
  ["text", "text-faint", "raised", 4.5],
  ["non-text", "focus-on-ink", "ink-900", 3],
  ["non-text", "focus-on-ink", "ink-800", 3],
  ["non-text", "focus-on-ink", "ink-700", 3],
  ["non-text", "focus-on-ink", "ink-950", 3],
  ["non-text", "focus-on-ink", "#1e1e1e", 3],
  ["non-text", "focus-on-ink", "#2c2c2c", 3],
  ["non-text", "focus-on-ink", "#383838", 3],
  ["non-text", "focus-on-ink", "#444444", 3],
  ["non-text", "focus-on-ink", "#161616", 3],
  ["non-text", "focus-on-ink", "#111111", 3],
  ["non-text", "focus-on-cream", "cream-100", 3],
  ["non-text", "focus-on-cream", "cream-200", 3],
  ["non-text", "focus-on-cream", "cream-50", 3],
  ["non-text", "outline", "cream-100", 3],
  ["non-text", "hot", "cream-100", 3],
  ["non-text", "panel-edge", "ink-900", 3],
  ["non-text", "panel-edge", "ink-950", 3],
  ["non-text", "slot-edge-m", "ink-800", 3],
  ["non-text", "slot-edge-m", "ink-900", 3],
  ["non-text", "slot-selected", "ink-800", 3],
  ["non-text", "rbtn-edge", "ink-900", 3],
  ["non-text", "text-on-ink", "rbtn-fill", 3],
  ["non-text", "disabled-edge", "cream-100", 3],
  ["non-text", "sk-track", "ink-900", 3],
  ["non-text", "line-control", "panel", 3],
  ["non-text", "track", "panel", 3]
]

const forbidden = [
  ["ok-text", "cream-100", 4.5],
  ["warn-text", "cream-100", 4.5],
  ["focus-on-ink", "cream-100", 3],
  ["focus-on-cream", "ink-900", 3]
]

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}

function topLevelBlocks(css) {
  const blocks = []
  let i = 0
  while (i < css.length) {
    const open = css.indexOf("{", i)
    if (open === -1) break
    const selector = css.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth += 1
      else if (css[j] === "}") depth -= 1
      j += 1
    }
    const body = css.slice(open + 1, j - 1)
    if (!selector.startsWith("@")) blocks.push({ selector: selector.replace(/\s+/g, " "), body })
    i = j
  }
  return blocks
}

function declarations(body) {
  const found = []
  const re = /(--[\w-]+)\s*:\s*([^;]+)/g
  let match
  while ((match = re.exec(body))) found.push([match[1], match[2].trim()])
  return found
}

function collect() {
  const vars = new Map()
  for (const source of sources) {
    const css = stripComments(fs.readFileSync(path.join(stylesDir, source.file), "utf8"))
    const wanted = new Set(source.selectors)
    for (const block of topLevelBlocks(css)) {
      if (!wanted.has(block.selector)) continue
      for (const [name, value] of declarations(block.body)) vars.set(name, value)
    }
  }
  return vars
}

function resolveValue(raw, vars, stack) {
  let current = raw.trim()
  for (let hop = 0; hop < 12; hop += 1) {
    const match = current.match(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/)
    if (!match) return current.trim()
    const name = match[1]
    if (stack.has(name)) throw new Error("cycle at " + name)
    const next = vars.get(name)
    const replacement = next == null
      ? (match[2] || "").trim()
      : resolveValue(next, vars, new Set([...stack, name]))
    current = current.replace(match[0], replacement)
  }
  return current.trim()
}

function parseColor(value) {
  const text = value.trim()
  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h.split("").map((c) => c + c).join("")
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }
  const rgba = text.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i)
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] == null ? 1 : Number(rgba[4])
    }
  }
  return null
}

function composite(fg, bg) {
  const a = fg.a
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a)
  }
}

function channel(c) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(rgb) {
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

function contrast(fg, bg) {
  const over = composite(fg, bg)
  const a = luminance(over)
  const b = luminance(bg)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

function colorOf(token, vars) {
  const raw = token.startsWith("#") ? token : resolveValue(vars.get("--" + token) || "", vars, new Set())
  const color = parseColor(raw)
  if (!color) throw new Error("not a color: " + token + " = " + raw)
  if (color.a !== 1 && token.startsWith("#") === false) {
    // foregrounds may be translucent; backgrounds used as the pair base must be opaque
  }
  return color
}

function pairContrast(fgName, bgName, vars) {
  const fg = colorOf(fgName, vars)
  let bg = colorOf(bgName, vars)
  if (bg.a !== 1) throw new Error("background is translucent: " + bgName)
  return contrast(fg, bg)
}

const vars = collect()
let failed = 0
const rows = []

for (const [kind, fg, bg, min] of required) {
  let ratio
  try {
    ratio = pairContrast(fg, bg, vars)
  } catch (error) {
    failed += 1
    rows.push({ kind, pair: fg + "/" + bg, ratio: "ERR " + error.message, min, ok: false })
    continue
  }
  const ok = ratio + 1e-9 >= min
  if (!ok) failed += 1
  rows.push({ kind, pair: fg + "/" + bg, ratio: ratio.toFixed(2), min, ok })
}

console.log("kind      pair                              ratio   min   result")
for (const row of rows) {
  const line = [
    row.kind.padEnd(9),
    row.pair.padEnd(33),
    String(row.ratio).padStart(6),
    String(row.min).padStart(5),
    row.ok ? "pass" : "FAIL"
  ].join("  ")
  console.log(line)
}

console.log("")
console.log("forbidden (must stay below the minimum)")
for (const [fg, bg, min] of forbidden) {
  const ratio = pairContrast(fg, bg, vars)
  const ok = ratio < min
  if (!ok) {
    failed += 1
    console.log("WARN  " + fg + "/" + bg + " " + ratio.toFixed(2) + " is not below " + min + " (docs may be stale)")
  } else {
    console.log("ok    " + fg + "/" + bg + " " + ratio.toFixed(2) + " < " + min)
  }
}

if (failed) {
  console.error("\n" + failed + " contrast check(s) failed")
  process.exit(1)
}
console.log("\ncheck:contrast ok")
