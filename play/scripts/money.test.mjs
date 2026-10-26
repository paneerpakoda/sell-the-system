import { formatMoney, moneyLabel } from "../src/ui/money.js"

const cases = [0, 10, 99999, 100000, 1234567, 34000000, -40]

const expected = {
  INR: {
    0: "₹0",
    10: "₹10",
    99999: "₹99,999",
    100000: "₹1,00,000",
    1234567: "₹12,34,567",
    34000000: "₹3,40,00,000",
    "-40": "-₹40"
  },
  USD: {
    0: "$0",
    10: "$10",
    99999: "$99,999",
    100000: "$100,000",
    1234567: "$1,234,567",
    34000000: "$34,000,000",
    "-40": "-$40"
  }
}

let failed = 0
function check(name, actual, want) {
  const ok = actual === want
  if (!ok) failed += 1
  console.log((ok ? "ok" : "FAIL") + "  " + name + "  " + JSON.stringify(actual) + (ok ? "" : "  want " + JSON.stringify(want)))
}

for (const currency of ["INR", "USD"]) {
  for (const value of cases) {
    check(currency + " " + value, formatMoney(value, { currency }), expected[currency][String(value)])
  }
  check(currency + " sign +10", formatMoney(10, { currency, sign: true }), currency === "INR" ? "+₹10" : "+$10")
  check(currency + " sign -40", formatMoney(-40, { currency, sign: true }), currency === "INR" ? "-₹40" : "-$40")
}

check("compact INR 1234567", formatMoney(1234567, { currency: "INR", compact: true }), "₹12.3L")
check("compact INR 34000000", formatMoney(34000000, { currency: "INR", compact: true }), "₹3.4Cr")
check("compact USD 1234567", formatMoney(1234567, { currency: "USD", compact: true }), "$1.2M")
check("compact below threshold", formatMoney(99999, { currency: "INR", compact: true }), "₹99,999")
check("cents follow the code", formatMoney(2.5, { currency: "INR" }), "₹2.50")
check("same digits", formatMoney(1234567, { currency: "INR" }).replace(/[^\d]/g, ""), formatMoney(1234567, { currency: "USD" }).replace(/[^\d]/g, ""))
check("label INR", moneyLabel(1234567, "INR"), "12,34,567 rupees")
check("label USD", moneyLabel(1234567, "USD"), "1,234,567 dollars")

if (failed) {
  console.error(failed + " failed")
  process.exit(1)
}
console.log("money tests passed")
