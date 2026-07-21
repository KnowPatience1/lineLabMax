# LineLab Max JS

JavaScript runtime for LineLab targeting the Max `js` object.

## Status

This is an early runtime scaffold focused on:

- View state control (`show`, `hide`, `toggle`, etc.)
- Sequence stepping (`hide` phase, then `show` phase)
- Max message interface via [max/linelab.max.js](max/linelab.max.js)

## Runtime Model

- Max bridge script: [max/linelab.max.js](max/linelab.max.js)
- Core API module: [src/index.js](src/index.js)
- View model: [src/view.js](src/view.js)

Current module style is CommonJS (`require` / `module.exports`).

## Quick Start

1. Open a Max patcher.
2. Add a `js` object and point it to [max/linelab.max.js](max/linelab.max.js).
3. Send these messages in order:
- `lines 20`
- `interval 200`
- `start`

You can stop at any time with:
- `stop`

## Command Reference

See [max/COMMANDS.md](max/COMMANDS.md) for full command details and examples.

## Notes

- `autowatch = 1` is enabled in [max/linelab.max.js](max/linelab.max.js), so script edits auto-reload.
- The bridge currently requires [src/index.js](src/index.js) directly.
- A build/dist step can be reintroduced later if needed.