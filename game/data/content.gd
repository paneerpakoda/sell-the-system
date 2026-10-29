class_name Content
extends Object
## Industries, products, palette, client names, and staff names.
## Godot Port GDD sections 7, 8, and 13.

const PARTS: PackedStringArray = ["Background", "Title", "Card A", "Card B", "Save"]

const PALETTE := {
	"Paper": {"hex": "#F4F1EA", "calm": true},
	"White": {"hex": "#FFFFFF", "calm": true},
	"Ink": {"hex": "#1C1917", "calm": true},
	"Sand": {"hex": "#F5E6D3", "calm": true},
	"Stone": {"hex": "#E7E5E4", "calm": true},
	"Hot": {"hex": "#FF4D6D", "calm": false},
	"Lime": {"hex": "#C8FF00", "calm": false},
}

## Every new screen starts broken, so the brief still fails.
const BROKEN := {
	"Background": {"fill": "Hot", "radius": 24},
	"Title": {"fill": "Lime", "radius": 0, "ink": "Ink"},
	"Card A": {"fill": "Lime", "radius": 0, "ink": "Ink"},
	"Card B": {"fill": "Hot", "radius": 32, "ink": "Ink"},
	"Save": {"fill": "Hot", "radius": 0, "ink": "White"},
}

const INDUSTRIES := {
	"Fintech": {
		"language": "Swiss Grid",
		"voice": "Tight corners. Strong contrast.",
		"background": "Paper",
		"cards": "White",
		"title": "Ink",
		"save": "Ink",
		"component_radius": 4,
		"background_radius": 8,
		"language_contrast": 9.0,
	},
	"Wellness": {
		"language": "Warm Soft",
		"voice": "Soft corners. Gentle contrast.",
		"background": "Sand",
		"cards": "Paper",
		"title": "Ink",
		"save": "Ink",
		"component_radius": 20,
		"background_radius": 24,
		"language_contrast": 5.5,
	},
	"Editorial": {
		"language": "Mono Stark",
		"voice": "Square corners. Stark contrast.",
		"background": "White",
		"cards": "Stone",
		"title": "Ink",
		"save": "Ink",
		"component_radius": 0,
		"background_radius": 4,
		"language_contrast": 12.0,
	},
}

const FRAMES := {
	"Fintech": [
		{"name": "Balance", "title": "Balance", "card_a": "Spending", "card_b": "Savings", "save": "Transfer"},
		{"name": "Transfer", "title": "Transfer", "card_a": "From", "card_b": "To", "save": "Send"},
		{"name": "Account", "title": "Account", "card_a": "Card", "card_b": "Limits", "save": "Confirm"},
	],
	"Wellness": [
		{"name": "Today", "title": "Today", "card_a": "Sleep", "card_b": "Move", "save": "Check in"},
		{"name": "Session", "title": "Session", "card_a": "Breath", "card_b": "Stretch", "save": "Start"},
		{"name": "Profile", "title": "Profile", "card_a": "Goal", "card_b": "Streak", "save": "Log"},
	],
	"Editorial": [
		{"name": "Issue", "title": "Issue", "card_a": "Essay", "card_b": "Review", "save": "Read"},
		{"name": "Story", "title": "Story", "card_a": "Lede", "card_b": "Body", "save": "Continue"},
		{"name": "Archive", "title": "Archive", "card_a": "Saved", "card_b": "Authors", "save": "Open"},
	],
}

const CLIENT_NAMES: PackedStringArray = [
	"Northwind", "Lumen", "Harbor", "Kindred", "Folio", "Aster", "Brass", "Sable",
	"Marlow", "Pebble", "Vesper", "Quill", "Hearth", "Ledger", "Nimbus",
]

const STAFF_NAMES: PackedStringArray = [
	"Ada", "Ben", "Cam", "Dia", "Eve", "Fox", "Gia", "Hal", "Ivy", "Jed", "Kim", "Lux",
]


static func color_of(swatch_name: String) -> Color:
	return Color.html(str(PALETTE[swatch_name]["hex"]))
