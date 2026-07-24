// Updated 2026-07-24 for JavaScript ES6 refactor.
function tryRequireAny(candidates) {
  for (let i = 0; i < candidates.length; i += 1) {
    try {
      return require(candidates[i]);
    } catch (_e) {
      // Keep trying. Max's resolver can vary by patch/object location.
    }
  }

  return null;
}

class FallbackView {
  constructor(lineCount) {
    const count = Math.max(0, Math.floor(Number(lineCount) || 0));
    this.entries = [];
    for (let i = 0; i < count; i += 1) {
      this.entries.push({ lineIndex: i, visible: true });
    }
  }

  length() {
    return this.entries.length;
  }

  getEntries() {
    return this.entries;
  }

  show(lineIndex) {
    this.entries[lineIndex].visible = true;
  }

  hide(lineIndex) {
    this.entries[lineIndex].visible = false;
  }

  toggle(lineIndex) {
    const entry = this.entries[lineIndex];
    entry.visible = !entry.visible;
  }

  showAll() {
    for (let i = 0; i < this.entries.length; i += 1) {
      this.entries[i].visible = true;
    }
  }

  hideAll() {
    for (let i = 0; i < this.entries.length; i += 1) {
      this.entries[i].visible = false;
    }
  }
}

function fallbackCreateRandomAttributes(pointCount) {
  const count = Math.max(0, Math.floor(Number(pointCount) || 0));
  const attrs = {
    x: [], y: [], z: [], r: [], g: [], b: [], a: [], width: []
  };

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  for (let i = 0; i < count; i += 1) {
    attrs.x.push(randomBetween(-1.0, 1.0));
    attrs.y.push(randomBetween(-1.0, 1.0));
    attrs.z.push(randomBetween(-1.0, 1.0));

    attrs.r.push(Math.random());
    attrs.g.push(Math.random());
    attrs.b.push(Math.random());
    attrs.a.push(randomBetween(0.05, 1.0));
    attrs.width.push(0.02);
  }

  attrs.size = function () {
    return this.x.length;
  };

  return attrs;
}

class FallbackRandomLineGenerator {
  generate(attributes) {
    const count = attributes.size();
    const indices = [];
    const definitions = [];

    for (let i = 0; i < count; i += 1) {
      indices.push(i);
    }

    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }

    for (let i = 0; i < count - 1; i += 2) {
      definitions.push({ start: indices[i], end: indices[i + 1] });
    }

    return definitions;
  }
}

function fallbackBuildLinePayloads(attributes, definitions, view) {
  const payloads = [];

  if (view && Array.isArray(view.entries)) {
    for (let i = 0; i < view.entries.length; i += 1) {
      const entry = view.entries[i];
      if (!entry.visible) {
        continue;
      }

      const def = definitions[entry.lineIndex];
      if (!def) {
        continue;
      }

      payloads.push({
        id: payloads.length,
        startIndex: def.start,
        endIndex: def.end,
        start: [attributes.x[def.start], attributes.y[def.start], attributes.z[def.start]],
        end: [attributes.x[def.end], attributes.y[def.end], attributes.z[def.end]],
        color: [attributes.r[def.start], attributes.g[def.start], attributes.b[def.start], attributes.a[def.start]],
        width: attributes.width[def.start],
        visible: true
      });
    }

    return payloads;
  }

  for (let i = 0; i < definitions.length; i += 1) {
    const def2 = definitions[i];
    payloads.push({
      id: i,
      startIndex: def2.start,
      endIndex: def2.end,
      start: [attributes.x[def2.start], attributes.y[def2.start], attributes.z[def2.start]],
      end: [attributes.x[def2.end], attributes.y[def2.end], attributes.z[def2.end]],
      color: [attributes.r[def2.start], attributes.g[def2.start], attributes.b[def2.start], attributes.a[def2.start]],
      width: attributes.width[def2.start],
      visible: true
    });
  }

  return payloads;
}

const isMaxRuntime = typeof post === "function";

let viewModule = null;
let randomAttributesModule = null;
let randomLineGeneratorModule = null;
let geometryBuilderModule = null;

if (!isMaxRuntime) {
  viewModule = tryRequireAny([
    "./model/view.js",
    "./model/view",
    "model/view.js",
    "model/view",
    "./src/model/view.js",
    "./src/model/view",
    "../src/model/view.js",
    "../src/model/view"
  ]);

  randomAttributesModule = tryRequireAny([
    "./generators/random_attributes.js",
    "./generators/random_attributes",
    "generators/random_attributes.js",
    "generators/random_attributes",
    "./src/generators/random_attributes.js",
    "./src/generators/random_attributes",
    "../src/generators/random_attributes.js",
    "../src/generators/random_attributes"
  ]);

  randomLineGeneratorModule = tryRequireAny([
    "./generators/random_line_generator.js",
    "./generators/random_line_generator",
    "generators/random_line_generator.js",
    "generators/random_line_generator",
    "./src/generators/random_line_generator.js",
    "./src/generators/random_line_generator",
    "../src/generators/random_line_generator.js",
    "../src/generators/random_line_generator"
  ]);

  geometryBuilderModule = tryRequireAny([
    "./builders/geometry_builder.js",
    "./builders/geometry_builder",
    "builders/geometry_builder.js",
    "builders/geometry_builder",
    "./src/builders/geometry_builder.js",
    "./src/builders/geometry_builder",
    "../src/builders/geometry_builder.js",
    "../src/builders/geometry_builder"
  ]);
}

const View = viewModule && viewModule.View ? viewModule.View : FallbackView;
const createRandomAttributes = randomAttributesModule && randomAttributesModule.createRandomAttributes
  ? randomAttributesModule.createRandomAttributes
  : fallbackCreateRandomAttributes;
const RandomLineGenerator = randomLineGeneratorModule && randomLineGeneratorModule.RandomLineGenerator
  ? randomLineGeneratorModule.RandomLineGenerator
  : FallbackRandomLineGenerator;
const buildLinePayloads = geometryBuilderModule && geometryBuilderModule.buildLinePayloads
  ? geometryBuilderModule.buildLinePayloads
  : fallbackBuildLinePayloads;

class LineLabInterface {
  constructor() {
    this.view = new View(0);
    this.lineCount = 0;
    this.attributes = null;
    this.definitions = [];
    this.renderLines = [];
  }

  log(message) {
    if (typeof post === "function") {
      post("[linelab] " + message + "\n");
      return;
    }
    console.log("[linelab] " + message);
  }

  init(lineCount) {
    if (!isFinite(lineCount) || lineCount < 0) {
      this.log("init: invalid line count");
      return;
    }

    this.lineCount = Math.floor(lineCount);
    this.view = new View(this.lineCount);
    this.attributes = null;
    this.definitions = [];
    this.renderLines = [];
    this.log("initialized with " + this.lineCount + " lines");
  }

  generateRandom(pointCount) {
    const count = Math.floor(Number(pointCount));

    if (!isFinite(count) || count < 2) {
      this.log("generateRandom: point count must be >= 2");
      return;
    }

    this.attributes = createRandomAttributes(count);
    this.definitions = new RandomLineGenerator().generate(this.attributes);
    this.lineCount = this.definitions.length;
    this.view = new View(this.lineCount);
    this.renderLines = [];

    this.log(
      "generated " + count + " points and " + this.lineCount + " line definitions"
    );
  }

  getDefinitionCount() {
    return this.definitions.length;
  }

  hasGeneratedData() {
    return !!this.attributes && this.definitions.length > 0;
  }

  buildRenderLines() {
    if (!this.hasGeneratedData()) {
      this.log("buildRenderLines: no generated data; call generateRandom first");
      return [];
    }

    this.renderLines = buildLinePayloads(this.attributes, this.definitions, this.view);
    this.log("built " + this.renderLines.length + " render lines");
    return this.renderLines;
  }

  getRenderLines() {
    return this.renderLines;
  }

  show(i) {
    if (i < 0 || i >= this.lineCount) return;
    this.view.show(Math.floor(i));
  }

  hide(i) {
    if (i < 0 || i >= this.lineCount) return;
    this.view.hide(Math.floor(i));
  }

  toggle(i) {
    if (i < 0 || i >= this.lineCount) return;
    this.view.toggle(Math.floor(i));
  }

  showAll() {
    this.view.showAll();
  }

  hideAll() {
    this.view.hideAll();
  }

  getEntries() {
    return this.view.getEntries();
  }

  getLineCount() {
    return this.lineCount;
  }

  dump() {
    const entries = this.view.getEntries();
    for (let i = 0; i < entries.length; i += 1) {
      const state = entries[i].visible ? "visible" : "hidden";
      this.log("line " + entries[i].lineIndex + " " + state);
    }
  }

  stepSequence(phase, hideIndex, showIndex) {
    if (phase === "hide") {
      if (hideIndex >= this.lineCount) {
        this.log("Hide sequence complete. Starting show sequence.");
        return {
          phase: "show",
          hideIndex,
          showIndex: this.lineCount - 1
        };
      }

      this.hide(hideIndex);
      return {
        phase: "hide",
        hideIndex: hideIndex + 1,
        showIndex
      };
    }

    if (phase === "show") {
      if (showIndex < 0) {
        this.log("Show sequence complete.");
        return {
          phase: "done",
          hideIndex,
          showIndex
        };
      }

      this.show(showIndex);
      return {
        phase: "show",
        hideIndex,
        showIndex: showIndex - 1
      };
    }

    return {
      phase: "done",
      hideIndex,
      showIndex
    };
  }
}

module.exports = {
  LineLabInterface
};