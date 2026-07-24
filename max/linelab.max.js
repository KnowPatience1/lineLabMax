// Updated 2026-07-24 for JavaScript ES6 refactor.
autowatch = 1;
inlets = 1;
outlets = 1;

function loadCoreModule() {
  const candidates = [];

  // Optional override from Max object args:
  // js linelab.max.js /absolute/path/to/src/index.js
  if (jsarguments.length > 1 && jsarguments[1]) {
    candidates.push(jsarguments[1]);
  }

  // Common relative candidates
  candidates.push("../src/index.js");
  candidates.push("../src/index");
  candidates.push("./src/index.js");
  candidates.push("./src/index");
  candidates.push("src/index.js");
  candidates.push("src/index");
  candidates.push("../../src/index.js");
  candidates.push("../../src/index");
  candidates.push("../dist/index.js");
  candidates.push("../dist/index");
  candidates.push("./dist/index.js");
  candidates.push("./dist/index");
  candidates.push("dist/index.js");
  candidates.push("dist/index");

  const errors = [];

  for (let i = 0; i < candidates.length; i += 1) {
    const p = candidates[i];
    try {
      return require(p);
    } catch (e) {
      errors.push(p + " -> " + e);
    }
  }

  post("[linelab] could not load core module\n");
  for (let j = 0; j < errors.length; j += 1) {
    post("[linelab] " + errors[j] + "\n");
  }

  throw new Error(
    "Could not load core module. Tried: " + candidates.join(", ")
  );
}

const core = loadCoreModule();
const api = new core.LineLabInterface();

let phase = "hide";
let hideIndex = 0;
let showIndex = -1;
let task = null;
let stepMs = 200;
const defaultPointCount = 2000;

function log(msg) {
  post("[linelab] " + msg + "\n");
}

function dump() {
  api.dump();
  emitState();
}

function emitState() {
  const entries = api.getEntries();

  outlet(0, "state_begin", entries.length);
  for (let i = 0; i < entries.length; i += 1) {
    outlet(
      0,
      "line",
      entries[i].lineIndex,
      entries[i].visible ? 1 : 0
    );
  }
  outlet(0, "state_end");
}

function emitRenderLines() {
  const lines = api.getRenderLines();

  outlet(0, "render_begin", lines.length);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    outlet(
      0,
      "render_line",
      line.id,
      line.start[0],
      line.start[1],
      line.start[2],
      line.end[0],
      line.end[1],
      line.end[2],
      line.color[0],
      line.color[1],
      line.color[2],
      line.color[3],
      line.width
    );
  }
  outlet(0, "render_end");
}

function sketchWidth(width) {
  const w = Number(width);
  if (!isFinite(w) || w <= 0) {
    return 2;
  }

  // Width values are normalized in data space; scale for visible GL strokes.
  return Math.max(2, w * 120);
}

function emitSketchLines() {
  const lines = api.getRenderLines();

  outlet(0, "sketch", "reset");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    outlet(
      0,
      "sketch",
      "glcolor",
      line.color[0],
      line.color[1],
      line.color[2],
      line.color[3]
    );

    outlet(0, "sketch", "gllinewidth", sketchWidth(line.width));

    outlet(
      0,
      "sketch",
      "moveto",
      line.start[0],
      line.start[1],
      line.start[2]
    );

    outlet(
      0,
      "sketch",
      "lineto",
      line.end[0],
      line.end[1],
      line.end[2]
    );
  }

  outlet(0, "sketch", "draw");
  outlet(0, "sketch", "drawimmediate");
  outlet(0, "rendered", lines.length);
}

function rendertest() {
  outlet(0, "sketch", "reset");

  outlet(0, "sketch", "glcolor", 1, 0, 0, 1);
  outlet(0, "sketch", "gllinewidth", 6);
  outlet(0, "sketch", "moveto", -0.9, -0.9, 0);
  outlet(0, "sketch", "lineto", 0.9, 0.9, 0);

  outlet(0, "sketch", "glcolor", 0, 1, 0, 1);
  outlet(0, "sketch", "moveto", -0.9, 0.9, 0);
  outlet(0, "sketch", "lineto", 0.9, -0.9, 0);

  outlet(0, "sketch", "glcolor", 0.4, 0.8, 1, 1);
  outlet(0, "sketch", "moveto", -1, 0, 0);
  outlet(0, "sketch", "lineto", 1, 0, 0);
  outlet(0, "sketch", "moveto", 0, -1, 0);
  outlet(0, "sketch", "lineto", 0, 1, 0);

  outlet(0, "sketch", "draw");
  outlet(0, "sketch", "drawimmediate");
  outlet(0, "rendered", 4);
}

function lines(n) {
  api.init(n);
  phase = "hide";
  hideIndex = 0;
  showIndex = n - 1;
  dump();
}

function parsePointCount(value) {
  const n = parseInt(value, 10);
  if (!isFinite(n) || n < 2) {
    return defaultPointCount;
  }
  return n;
}

function ensureGenerated(pointCount) {
  const count = parsePointCount(pointCount);

  api.generateRandom(count);

  phase = "hide";
  hideIndex = 0;
  showIndex = api.getLineCount() - 1;

  outlet(0, "generated", count, api.getDefinitionCount());
  emitState();
}

function generate(points) {
  ensureGenerated(points);
}

function build() {
  if (!api.hasGeneratedData()) {
    ensureGenerated(defaultPointCount);
  }

  api.buildRenderLines();
  emitRenderLines();
}

function emit() {
  emitRenderLines();
}

function render() {
  if (!api.hasGeneratedData()) {
    ensureGenerated(defaultPointCount);
  }

  if (api.getRenderLines().length === 0) {
    api.buildRenderLines();
  }

  emitSketchLines();
}

function show(i) {
  api.show(i);
  dump();
}

function hide(i) {
  api.hide(i);
  dump();
}

function toggle(i) {
  api.toggle(i);
  dump();
}

function showall() {
  api.showAll();
  dump();
}

function hideall() {
  api.hideAll();
  dump();
}

function interval(ms) {
  stepMs = Math.max(1, parseInt(ms, 10) || 200);
  log("interval set to " + stepMs + " ms");
}

function start() {
  stop();

  task = new Task(function () {
    const next = api.stepSequence(phase, hideIndex, showIndex);
    phase = next.phase;
    hideIndex = next.hideIndex;
    showIndex = next.showIndex;
    dump();
    outlet(0, "phase", phase);

    if (phase === "done") {
      stop();
    }
  }, this);

  task.interval = stepMs;
  task.repeat();
  log("sequence started");
  outlet(0, "phase", phase);
}

function stop() {
  if (task) {
    task.cancel();
    task = null;
    log("sequence stopped");
  }
}