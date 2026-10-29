extends Control
## Top bar, center canvas, and right dock. The page does not scroll.
## The phone on the canvas is the phone scene, not a spawned Project.
## Godot Port GDD section 20.

@onready var studio_name: Label = $Layout/TopBar/Row/StudioName
@onready var cash: Label = $Layout/TopBar/Row/Cash
@onready var week: Label = $Layout/TopBar/Row/Week
@onready var month: Label = $Layout/TopBar/Row/Month
@onready var stage: Label = $Layout/TopBar/Row/Stage
@onready var gate: Control = $Gate
@onready var week_bars: Array[ColorRect] = [
	$Layout/TopBar/Row/WeekBars/Week1,
	$Layout/TopBar/Row/WeekBars/Week2,
	$Layout/TopBar/Row/WeekBars/Week3,
	$Layout/TopBar/Row/WeekBars/Week4,
]


func _process(_delta: float) -> void:
	var current := Simulation.run
	studio_name.text = current.studio_name if not current.studio_name.is_empty() else "Name the studio"
	cash.text = current.cash_text()
	month.text = "Month %d · %s" % [current.month, _clock(current.month_left)]
	# Stage is derived later. The starting Run is Stage 1.
	stage.text = "Stage 1"
	var week_index := _week_index(current.month_left)
	week.text = "Week %d · %s" % [week_index, _clock(_week_left(current.month_left))]
	gate.visible = current.studio_name.is_empty()
	var ink := Content.color_of("Ink")
	var stone := Content.color_of("Stone")
	for index in week_bars.size():
		week_bars[index].color = ink if index == week_index - 1 else stone


func _week_index(month_left: float) -> int:
	var elapsed := Tuning.MONTH_SECONDS - month_left
	return clampi(int(elapsed / Tuning.WEEK_SECONDS) + 1, 1, 4)


func _week_left(month_left: float) -> float:
	var elapsed := Tuning.MONTH_SECONDS - month_left
	return Tuning.WEEK_SECONDS - fmod(elapsed, Tuning.WEEK_SECONDS)


func _clock(seconds: float) -> String:
	var whole := maxi(int(seconds), 0)
	return "%d:%02d" % [whole / 60, whole % 60]
