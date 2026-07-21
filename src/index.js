function View(lineCount) {
  this.entries = [];
  for (var i = 0; i < lineCount; i += 1) {
    this.entries.push({ lineIndex: i, visible: true });
  }
}

View.prototype.length = function () {
  return this.entries.length;
};

View.prototype.getEntries = function () {
  return this.entries;
};

View.prototype.show = function (lineIndex) {
  this.entries[lineIndex].visible = true;
};

View.prototype.hide = function (lineIndex) {
  this.entries[lineIndex].visible = false;
};

View.prototype.toggle = function (lineIndex) {
  var entry = this.entries[lineIndex];
  entry.visible = !entry.visible;
};

View.prototype.showAll = function () {
  for (var i = 0; i < this.entries.length; i += 1) {
    this.entries[i].visible = true;
  }
};

View.prototype.hideAll = function () {
  for (var i = 0; i < this.entries.length; i += 1) {
    this.entries[i].visible = false;
  }
};

function LineLabInterface() {
  this.view = new View(0);
  this.lineCount = 0;
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
  this.log("initialized with " + this.lineCount + " lines");
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