// Updated 2026-07-24 for JavaScript ES6 refactor.
class ViewEntry {
  constructor(lineIndex, visible) {
    this.lineIndex = lineIndex;
    this.visible = visible !== false;
  }
}

class View {
  constructor(lineCount) {
    const count = Math.max(0, Math.floor(Number(lineCount) || 0));
    this.entries = [];

    for (let i = 0; i < count; i += 1) {
      this.entries.push(new ViewEntry(i, true));
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

module.exports = {
  View,
  ViewEntry
};
