# LineLab Max Commands

Command contract for [linelab.max.js](linelab.max.js).

## Object Setup

In Max, create:

- `js linalab.max.js` (or full path to this file)

Script settings:

- `inlets = 1`
- `outlets = 1`

## Commands

## `lines <n>`

Initialize the runtime with `n` lines and reset sequence state.

- Example: `lines 20`
- Effect:
- Creates a new view with 20 visible entries
- Sets sequence phase to `hide`
- Sets hide index to `0`
- Sets show index to `n - 1`

---

## `show <i>`

Set line `i` visible and dump current state.

- Example: `show 3`

---

## `hide <i>`

Set line `i` hidden and dump current state.

- Example: `hide 3`

---

## `toggle <i>`

Invert visibility of line `i` and dump current state.

- Example: `toggle 3`

---

## `showall`

Set all lines visible and dump current state.

- Example: `showall`

---

## `hideall`

Set all lines hidden and dump current state.

- Example: `hideall`

---

## `dump`

Print visibility state for all lines.

- Example: `dump`
- Output shape:
- `line 0 visible`
- `line 1 hidden`
- ...

---

## `interval <ms>`

Set sequence step interval in milliseconds.

- Example: `interval 200`
- Minimum effective value is `1`

---

## `start`

Begin auto sequence task using current interval.

Behavior:

1. Stops any existing task
2. Repeats `stepSequence(...)`
3. Dumps state after each step
4. Stops automatically when phase becomes `done`

- Example: `start`

---

## `stop`

Cancel the running sequence task, if any.

- Example: `stop`

## Typical Session

1. `lines 20`
2. `interval 200`
3. `start`
4. `stop` (optional interrupt)
5. `showall`
6. `dump`

## Troubleshooting

## No output changes

- Confirm `js` object path points to [linelab.max.js](linelab.max.js).
- Confirm [src/index.js](../src/index.js) exports `LineLabInterface`.

## Script edits not taking effect

- `autowatch = 1` should reload edits.
- If needed, close/reopen patch or recreate the `js` object.