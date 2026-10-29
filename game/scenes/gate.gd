extends Control
## Name the studio. The world stays paused until the name is set.
## Godot Port GDD section 5.

@onready var field: LineEdit = $Center/Card/Column/Name
@onready var hint: Label = $Center/Card/Column/Hint
@onready var confirm_button: Button = $Center/Card/Column/Confirm


func _ready() -> void:
	confirm_button.pressed.connect(_confirm)
	field.text_submitted.connect(func(_submitted: String) -> void: _confirm())
	field.grab_focus()


func _confirm() -> void:
	if Simulation.name_studio(field.text):
		hide()
		return
	hint.text = "Enter a name."
