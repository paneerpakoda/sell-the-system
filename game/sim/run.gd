class_name Run
extends RefCounted
## Cash, debt, month, reputation, choices, win, and sell.
## Money is dollars, stored as cents. The cash balance never goes below $0.
## Godot Port GDD section 5.

var studio_name := ""
var cash_cents := Tuning.dollars_to_cents(Tuning.STARTING_CASH)
var debt_cents := 0
var month := 1
var month_left := Tuning.MONTH_SECONDS
var clocks_live := false
var accepted_ships := 0
var hand_ships := 0
var staff: Array = []


func cash_text() -> String:
	return cents_text(cash_cents)


func cents_text(cents: int) -> String:
	var negative := cents < 0
	var abs_cents := absi(cents)
	var text := "$%d.%02d" % [abs_cents / 100, abs_cents % 100]
	if negative:
		return "-" + text
	return text


## 28 characters after trimming and collapsing whitespace.
func normalize_studio_name(raw: String) -> String:
	var pattern := RegEx.new()
	pattern.compile("\\s+")
	var collapsed := pattern.sub(raw.strip_edges(), " ", true)
	return collapsed.left(Tuning.STUDIO_NAME_MAX)
