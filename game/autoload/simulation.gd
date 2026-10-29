extends Node
## The one clock. Scenes read this autoload. They do not reimplement fees, grades, or staff.
## Godot Port GDD section 4 and section 22.

var run: Run
var project: Project
var grade: Grade
var staff: Staff
var arrival: Arrival
var tree: SystemTree
var save_game: GameSave

var month_break_open := false
var window_focused := true


func _init() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	run = Run.new()
	project = Project.new()
	grade = Grade.new()
	staff = Staff.new()
	arrival = Arrival.new()
	tree = SystemTree.new()
	save_game = GameSave.new()


func _ready() -> void:
	var window := get_window()
	if window == null:
		return
	window.focus_entered.connect(_on_focus_entered)
	window.focus_exited.connect(_on_focus_exited)


func _process(delta: float) -> void:
	var step := minf(delta, Tuning.FRAME_CAP)
	if world_paused() or not run.clocks_live:
		return
	_advance(step)


func _advance(_step: float) -> void:
	# Clocks stay held until a later Start. Nothing else ticks.
	pass


func world_paused() -> bool:
	return run.studio_name.is_empty() or month_break_open or not window_focused


func name_studio(raw: String) -> bool:
	var name := run.normalize_studio_name(raw)
	if name.is_empty():
		return false
	run.studio_name = name
	return true


func _on_focus_entered() -> void:
	window_focused = true


func _on_focus_exited() -> void:
	window_focused = false
