# LineLab Max Commands

Command contract for linelab.max.js.

## Object Setup

In Max, create:

- js linelab.max.js
- Optional explicit core path:
  js linelab.max.js /absolute/path/to/src/index.js

Script settings:

- inlets = 1
- outlets = 1

## Outlet Message Protocol

All state changes emit structured messages from outlet 0.

1. state_begin <count>
2. line <lineIndex> <visibleFlag>
3. state_end
4. phase <hide|show|done> (during sequence activity)

Notes:

- visibleFlag is 1 for visible, 0 for hidden.
- state_begin/state_end wrap a complete snapshot.

## Commands

## lines <n>

Initialize runtime with n lines and reset sequence state.

- Example: lines 20
- Effects:
- Creates a new view with n visible entries
- phase = hide
- hideIndex = 0
- showIndex = n - 1
- Emits full state snapshot

## show <i>

Set line i visible.

- Example: show 3
- Emits full state snapshot

## hide <i>

Set line i hidden.

- Example: hide 3
- Emits full state snapshot

## toggle <i>

Invert visibility of line i.

- Example: toggle 3
- Emits full state snapshot

## showall

Set all lines visible.

- Example: showall
- Emits full state snapshot

## hideall

Set all lines hidden.

- Example: hideall
- Emits full state snapshot

## dump

Emit current state snapshot and print state to Max console.

- Example: dump

## interval <ms>

Set sequence step interval in milliseconds.

- Example: interval 200
- Minimum effective value is 1

## start

Begin auto sequence task using current interval.

Behavior:

1. Stops any existing task
2. Repeats stepSequence(phase, hideIndex, showIndex)
3. Emits state snapshot each step
4. Emits phase updates
5. Stops automatically when phase becomes done

- Example: start

## stop

Cancel running sequence task, if any.

- Example: stop

## Typical Session

1. lines 20
2. interval 200
3. start
4. stop (optional interrupt)
5. showall
6. dump

## Minimal Max Routing

Recommended decoder chain:

1. js linelab.max.js
2. route state_begin line state_end phase
3. line outlet -> unpack i i

Meaning:

- first int: lineIndex
- second int: visibleFlag (1 or 0)

## Troubleshooting

## No state output

- Confirm js object points to max/linelab.max.js.
- Confirm src/index.js exports LineLabInterface.
- Send lines <n> first to initialize.

## Script edits not taking effect

- autowatch = 1 should reload edits.
- If needed, recreate the js object or reopen the patch.