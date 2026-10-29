extends Control
## One phone. Instanced once per frame. This scene is not a Project.
## Broken starting look, Godot Port GDD section 7.

func _ready() -> void:
	_paint($Background, "Background")
	_paint($Column/Title, "Title")
	_paint($Column/CardA, "Card A")
	_paint($Column/CardB, "Card B")
	_paint($Column/Save, "Save")


func _paint(panel: Control, part: String) -> void:
	var look: Dictionary = Content.BROKEN[part]
	var box := StyleBoxFlat.new()
	box.bg_color = Content.color_of(str(look["fill"]))
	box.set_corner_radius_all(int(look["radius"]))
	box.content_margin_left = 10
	box.content_margin_right = 10
	box.content_margin_top = 8
	box.content_margin_bottom = 8
	panel.add_theme_stylebox_override("panel", box)
	var label := panel.get_node_or_null("Label")
	if label is Label and look.has("ink"):
		label.add_theme_color_override("font_color", Content.color_of(str(look["ink"])))
