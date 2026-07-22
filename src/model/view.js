function ViewEntry(lineIndex, visible) {
  this.lineIndex = lineIndex;
  this.visible = visible !== false;
}

function View(lineCount) {
  var count = Math.max(0, Math.floor(Number(lineCount) || 0));
  this.entries = [];

  for (var i = 0; i < count; i += 1) {
    this.entries.push(new ViewEntry(i, true));
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

module.exports = {
  View: View,
  ViewEntry: ViewEntry
};
