function tryRequireAny(candidates) {
  for (var i = 0; i < candidates.length; i += 1) {
    try {
      return require(candidates[i]);
    } catch (_e) {
      // Keep trying. Max's resolver can vary by patch/object location.
    }
  }

  return null;
}

function FallbackView(lineCount) {
  var count = Math.max(0, Math.floor(Number(lineCount) || 0));
  this.entries = [];
  for (var i = 0; i < count; i += 1) {
    this.entries.push({ lineIndex: i, visible: true });
  }
}

FallbackView.prototype.length = function () {
  return this.entries.length;
};

FallbackView.prototype.getEntries = function () {
  return this.entries;
};

FallbackView.prototype.show = function (lineIndex) {
  this.entries[lineIndex].visible = true;
};

FallbackView.prototype.hide = function (lineIndex) {
  this.entries[lineIndex].visible = false;
};

FallbackView.prototype.toggle = function (lineIndex) {
  var entry = this.entries[lineIndex];
  entry.visible = !entry.visible;
};

FallbackView.prototype.showAll = function () {
  for (var i = 0; i < this.entries.length; i += 1) {
    this.entries[i].visible = true;
  }
};

FallbackView.prototype.hideAll = function () {
  for (var i = 0; i < this.entries.length; i += 1) {
    this.entries[i].visible = false;
  }
};

function fallbackCreateRandomAttributes(pointCount) {
  var count = Math.max(0, Math.floor(Number(pointCount) || 0));
  var attrs = {
    x: [], y: [], z: [], r: [], g: [], b: [], a: [], width: []
  };

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  for (var i = 0; i < count; i += 1) {
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

function FallbackRandomLineGenerator() {}

FallbackRandomLineGenerator.prototype.generate = function (attributes) {
  var count = attributes.size();
  var indices = [];
  var definitions = [];
  var i;

  for (i = 0; i < count; i += 1) {
    indices.push(i);
  }

  for (i = indices.length - 1; i > 0; i -= 1) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  for (i = 0; i < count - 1; i += 2) {
    definitions.push({ start: indices[i], end: indices[i + 1] });
  }

  return definitions;
};

function fallbackBuildLinePayloads(attributes, definitions, view) {
  var payloads = [];
  var i;

  if (view && Array.isArray(view.entries)) {
    for (i = 0; i < view.entries.length; i += 1) {
      var entry = view.entries[i];
      if (!entry.visible) {
        continue;
      }

      var def = definitions[entry.lineIndex];
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

  for (i = 0; i < definitions.length; i += 1) {
    var def2 = definitions[i];
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

var isMaxRuntime = typeof post === "function";

var viewModule = null;
var randomAttributesModule = null;
var randomLineGeneratorModule = null;
var geometryBuilderModule = null;

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

var View = viewModule && viewModule.View ? viewModule.View : FallbackView;
var createRandomAttributes = randomAttributesModule && randomAttributesModule.createRandomAttributes
  ? randomAttributesModule.createRandomAttributes
  : fallbackCreateRandomAttributes;
var RandomLineGenerator = randomLineGeneratorModule && randomLineGeneratorModule.RandomLineGenerator
  ? randomLineGeneratorModule.RandomLineGenerator
  : FallbackRandomLineGenerator;
var buildLinePayloads = geometryBuilderModule && geometryBuilderModule.buildLinePayloads
  ? geometryBuilderModule.buildLinePayloads
  : fallbackBuildLinePayloads;

function LineLabInterface() {
  this.view = new View(0);
  this.lineCount = 0;
  this.attributes = null;
  this.definitions = [];
  this.renderLines = [];
}

LineLabInterface.prototype.log = function (message) {
  if (typeof post === "function") {
    post("[linelab] " + message + "\n");
    return;
  }
  console.log("[linelab] " + message);
};

LineLabInterface.prototype.init = function (lineCount) {
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
};

LineLabInterface.prototype.generateRandom = function (pointCount) {
  var count = Math.floor(Number(pointCount));

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
};

LineLabInterface.prototype.getDefinitionCount = function () {
  return this.definitions.length;
};

LineLabInterface.prototype.hasGeneratedData = function () {
  return !!this.attributes && this.definitions.length > 0;
};

LineLabInterface.prototype.buildRenderLines = function () {
  if (!this.hasGeneratedData()) {
    this.log("buildRenderLines: no generated data; call generateRandom first");
    return [];
  }

  this.renderLines = buildLinePayloads(this.attributes, this.definitions, this.view);
  this.log("built " + this.renderLines.length + " render lines");
  return this.renderLines;
};

LineLabInterface.prototype.getRenderLines = function () {
  return this.renderLines;
};

LineLabInterface.prototype.show = function (i) {
  if (i < 0 || i >= this.lineCount) return;
  this.view.show(Math.floor(i));
};

LineLabInterface.prototype.hide = function (i) {
  if (i < 0 || i >= this.lineCount) return;
  this.view.hide(Math.floor(i));
};

LineLabInterface.prototype.toggle = function (i) {
  if (i < 0 || i >= this.lineCount) return;
  this.view.toggle(Math.floor(i));
};

LineLabInterface.prototype.showAll = function () {
  this.view.showAll();
};

LineLabInterface.prototype.hideAll = function () {
  this.view.hideAll();
};

LineLabInterface.prototype.getEntries = function () {
  return this.view.getEntries();
};

LineLabInterface.prototype.getLineCount = function () {
  return this.lineCount;
};

LineLabInterface.prototype.dump = function () {
  var entries = this.view.getEntries();
  for (var i = 0; i < entries.length; i += 1) {
    var state = entries[i].visible ? "visible" : "hidden";
    this.log("line " + entries[i].lineIndex + " " + state);
  }
};

LineLabInterface.prototype.stepSequence = function (phase, hideIndex, showIndex) {
  if (phase === "hide") {
    if (hideIndex >= this.lineCount) {
      this.log("Hide sequence complete. Starting show sequence.");
      return {
        phase: "show",
        hideIndex: hideIndex,
        showIndex: this.lineCount - 1
      };
    }

    this.hide(hideIndex);
    return {
      phase: "hide",
      hideIndex: hideIndex + 1,
      showIndex: showIndex
    };
  }

  if (phase === "show") {
    if (showIndex < 0) {
      this.log("Show sequence complete.");
      return {
        phase: "done",
        hideIndex: hideIndex,
        showIndex: showIndex
      };
    }

    this.show(showIndex);
    return {
      phase: "show",
      hideIndex: hideIndex,
      showIndex: showIndex - 1
    };
  }

  return {
    phase: "done",
    hideIndex: hideIndex,
    showIndex: showIndex
  };
};

module.exports = {
  LineLabInterface: LineLabInterface
};