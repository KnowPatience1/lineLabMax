// Updated 2026-07-24 for JavaScript ES6 refactor.
function isNonNegativeInteger(value) {
  return typeof value === "number" && isFinite(value) && value >= 0 && Math.floor(value) === value;
}

class LineDefinition {
  constructor(start, end) {
    this.start = start;
    this.end = end;

    this.validate();
  }

  validate() {
    if (!isNonNegativeInteger(this.start)) {
      throw new TypeError("start must be a non-negative integer");
    }

    if (!isNonNegativeInteger(this.end)) {
      throw new TypeError("end must be a non-negative integer");
    }
  }

  toObject() {
    return {
      start: this.start,
      end: this.end
    };
  }

  static fromObject(obj) {
    return new LineDefinition(obj.start, obj.end);
  }
}

module.exports = {
  LineDefinition
};
