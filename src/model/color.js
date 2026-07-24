// Updated 2026-07-24 for JavaScript ES6 refactor.
function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function validateChannel(name, value) {
  if (!isFiniteNumber(value)) {
    throw new TypeError(name + " must be a finite number");
  }

  if (value < 0.0 || value > 1.0) {
    throw new RangeError(name + " must lie between 0.0 and 1.0");
  }
}

class Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    this.validate();
  }

  validate() {
    validateChannel("r", this.r);
    validateChannel("g", this.g);
    validateChannel("b", this.b);
    validateChannel("a", this.a);
  }

  toArray() {
    return [this.r, this.g, this.b, this.a];
  }

  copy() {
    return new Color(this.r, this.g, this.b, this.a);
  }
}

module.exports = {
  Color
};
