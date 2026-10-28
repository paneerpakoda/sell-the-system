import { formatMoney, moneyLabel, toDisplay, INR_PER_USD, moneyToken, expandMoneyText } from "../src/ui/money.js"

const cases = [0, 10, 24, 99999, 100000, 1234567, 34000000, -40]

const expected = {
  USD: {
    0: "$0",
    10: "$10",
    24: "$24",
    99999: "$99,999",
    100000: "$100,000",
    1234567: "$1,234,567",
    34000000: "$34,000,000",
    "-40": "-$40"
  },
  INR: {
    0: "₹0",
    10: "₹800",
    24: "₹1,920",
    99999: "₹79,99,920",
    100000: "₹80,00,000",
    1234567: "₹9,87,65,360",
    34000000: "₹2,72,00,00,000",
    "-40": "-₹3,200"
  }
}

let failed = 0
function check(name, actual, want) {
  const ok = actual === want
  if (!ok) failed += 1
  console.log((ok ? "ok" : "FAIL") + "  " + name + "  " + JSON.stringify(actual) + (ok ? "" : "  want " + JSON.stringify(want)))
}

check("rate", INR_PER_USD, 80)
check("toDisplay INR 24", toDisplay(24, "INR"), 1920)
check("toDisplay USD 24", toDisplay(24, "USD"), 24)

for (const currency of ["INR", "USD"]) {
  for (const value of cases) {
    check(currency + " " + value, formatMoney(value, { currency }), expected[currency][String(value)])
  }
  check(currency + " sign +10", formatMoney(10, { currency, sign: true }), currency === "INR" ? "+₹800" : "+$10")
  check(currency + " sign -40", formatMoney(-40, { currency, sign: true }), currency === "INR" ? "-₹3,200" : "-$40")
}

check("compact INR 1234567", formatMoney(1234567, { currency: "INR", compact: true }), "₹9.9Cr")
check("compact INR 34000000", formatMoney(34000000, { currency: "INR", compact: true }), "₹272Cr")
check("compact USD 1234567", formatMoney(1234567, { currency: "USD", compact: true }), "$1.2M")
check("compact below threshold USD", formatMoney(99999, { currency: "USD", compact: true }), "$99,999")
check("cents follow the code", formatMoney(2.5, { currency: "USD" }), "$2.50")
check("cents INR", formatMoney(2.5, { currency: "INR" }), "₹200")
check("label INR", moneyLabel(24, "INR"), "1,920 rupees")
check("label USD", moneyLabel(24, "USD"), "24 dollars")
check("token expand USD", expandMoneyText("paid " + moneyToken(10), "USD"), "paid $10")
check("token expand INR", expandMoneyText("paid " + moneyToken(10), "INR"), "paid ₹800")

if (failed) {
  console.error(failed + " failed")
  process.exit(1)
}
console.log("money tests passed")
