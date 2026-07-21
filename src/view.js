class View {
  constructor(lineCount) {
    this.entries = [];
    for (var i = 0; i < lineCount; i += 1) {
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
    var entry = this.entries[lineIndex];
    entry.visible = !entry.visible;
  }

  showAll() {
    for (var i = 0; i < this.entries.length; i += 1) {
      this.entries[i].visible = true;
    }
  }

  hideAll() {
    for (var i = 0; i < this.entries.length; i += 1) {
      this.entries[i].visible = false;
    }
  }
}

module.exports = { View };