autowatch = 1;
inlets = 1;
outlets = 1;

function loadCoreModule() {
  var candidates = [];

  // Optional override from Max object args:
  // js linelab.max.js /absolute/path/to/src/index.js
  if (jsarguments.length > 1 && jsarguments[1]) {
    candidates.push(jsarguments[1]);
  }

  // Common relative candidates
  candidates.push("../src/index.js");
  candidates.push("./src/index.js");
  candidates.push("src/index.js");
  candidates.push("../dist/index.js");
  candidates.push("./dist/index.js");
  candidates.push("dist/index.js");

  var errors = [];

  for (var i = 0; i < candidates.length; i += 1) {
    var p = candidates[i];
    try {
      return require(p);
    } catch (e) {
      errors.push(p + " -> " + e);
    }
  }

  post("[linelab] could not load core module\n");
  for (var j = 0; j < errors.length; j += 1) {
    post("[linelab] " + errors[j] + "\n");
  }

  throw new Error(
    "Could not load core module. Tried: " + candidates.join(", ")
  );
}

var core = loadCoreModule();
var api = new core.LineLabInterface();

var phase = "hide";
var hideIndex = 0;
var showIndex = -1;
var task = null;
var stepMs = 200;

function log(msg) {
  post("[linelab] " + msg + "\n");
}

function dump() {
  api.dump();
  emitState();
}

function emitState() {
  var entries = api.getEntries();

  outlet(0, "state_begin", entries.length);
  for (var i = 0; i < entries.length; i += 1) {
    outlet(
      0,
      "line",
      entries[i].lineIndex,
      entries[i].visible ? 1 : 0
    );
  }
  outlet(0, "state_end");
}

function lines(n) {
  api.init(n);
  phase = "hide";
  hideIndex = 0;
  showIndex = n - 1;
  dump();
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
    var next = api.stepSequence(phase, hideIndex, showIndex);
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