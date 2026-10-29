class_name Tuning
extends Object
## Numbers for the Run. If a tuning pass changes a number, change it here.
## Money in this table is dollars. The Run stores cents.
## Godot Port GDD section 24. The studio-name length is the section 5 gate.

const STARTING_CASH := 24
const MONTH_SECONDS := 240.0
const WEEK_SECONDS := 60.0
const FRAME_CAP := 0.25
const STUDIO_NAME_MAX := 28

const ARRIVAL_BEFORE_3 := 60.0
const ARRIVAL_AFTER_BASE := 45.0
const ARRIVAL_ACCEPTED_MARK := 3
const ARRIVAL_MINIMUM := 30.0

const QUEUE_CAP_BEFORE_HIRE := 1
const QUEUE_CAP_AFTER_HIRE := 2
const QUEUE_CAP_ACCEPTED := 8
const QUEUE_CAP_AFTER_8 := 3

const BIG_CLIENT_AFTER := 3
const BIG_CHANCE := 0.25
const BIG_CHANCE_CHASING := 0.5
const BIG_CHANCE_STEADY := 0.0
const BIG_WAITING_CAP := 1

const EXACTING_CHANCE := 0.25
const EXACTING_CHANCE_AFTER_TOKENS := 0.5
const SOUND_CHANCE := 0.5
const NAMED_LINES_SMALL := 3

const ON_TIME_FIRST := 300.0
const ON_TIME_AFTER_HIRE := 180.0
const ON_TIME_PERMANENT := 120.0

const INTERN_WAGE := 10
const PERMANENT_WAGE := 30
const INTERN_CAP := 1

const MISS_MIN := 0.20
const MISS_MAX := 0.50
const MISS_FLOOR_UNSAFE := 0.05
const ON_TIME_FIT_MISS := 0.20

const STEP_BASE := 1.4
const STEP_PER_SYSTEM := 0.12
const STEP_MINIMUM := 0.4

const PROMOTE_CLEAN_FRAMES := 3
const INTERN_UNLOCK_HAND_SHIPS := 3
const TOKEN_UNLOCK_ACCEPTED := 3

const TOOL_PRICE := 12
const TOKEN_PRICE := 12
const LANGUAGE_PRICE := 15
const PROCESS_PRICE := 24

const CHASE_FEE := 8
const STEADY_BUMP := 4
const DECLINE_FEE := 6
const LATE_PAYROLL_CAP := 2.5

const FULL_FEE := 10
const FULL_FEE_STAGE3 := 16
const SHORT_FEE := 10
const SHORT_BIG_FEE := 3
const BIG_FEE := 36
const BIG_FEE_STAGE3 := 48

const CONTRAST_BEST := 7.0
const CONTRAST_ACCEPTABLE := 4.5
const CONTRAST_BARE := 3.0

const RADIUS_BARE_MIN := 8
const RADIUS_BARE_MAX := 24
const RADIUS_STEP := 4
const RADIUS_CLAMP_MIN := 0
const RADIUS_CLAMP_MAX := 32

const ZOOM_MIN := 0.2
const ZOOM_MAX := 2.4
const ZOOM_DEFAULT := 0.64


static func dollars_to_cents(dollars: int) -> int:
	return dollars * 100


## Gap before the next client while the queue already holds someone.
static func arrival_gap(accepted_ships: int) -> float:
	if accepted_ships < ARRIVAL_ACCEPTED_MARK:
		return ARRIVAL_BEFORE_3
	return maxf(ARRIVAL_MINIMUM, ARRIVAL_AFTER_BASE - float(accepted_ships - ARRIVAL_ACCEPTED_MARK))


## One staff step, in seconds.
static func step_seconds(systems: int) -> float:
	return maxf(STEP_MINIMUM, STEP_BASE - STEP_PER_SYSTEM * float(systems))
