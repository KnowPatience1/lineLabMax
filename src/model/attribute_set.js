// Updated 2026-07-24 for JavaScript ES6 refactor.
function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function validateNumberArray(name, values) {
  if (!Array.isArray(values)) {
    throw new TypeError(name + " must be an array");
  }

  for (let i = 0; i < values.length; i += 1) {
    if (!isFiniteNumber(values[i])) {
      throw new TypeError(name + "[" + i + "] must be a finite number");
    }
  }
}

function copyArray(values) {
  return values.slice();
}

class AttributeSet {
  constructor(config) {
    const source = config || {};

    this.x = copyArray(source.x || []);
    this.y = copyArray(source.y || []);
    this.z = copyArray(source.z || []);

    this.r = copyArray(source.r || []);
    this.g = copyArray(source.g || []);
    this.b = copyArray(source.b || []);
    this.a = copyArray(source.a || []);

    this.width = copyArray(source.width || []);

    this._validate();
  }

  _validate() {
    validateNumberArray("x", this.x);
    validateNumberArray("y", this.y);
    validateNumberArray("z", this.z);
    validateNumberArray("r", this.r);
    validateNumberArray("g", this.g);
    validateNumberArray("b", this.b);
    validateNumberArray("a", this.a);
    validateNumberArray("width", this.width);

    const n = this.x.length;
    const names = ["y", "z", "r", "g", "b", "a", "width"];

    for (let i = 0; i < names.length; i += 1) {
      const name = names[i];
      if (this[name].length !== n) {
        throw new Error(
          name + " has length " + this[name].length + ", expected " + n
        );
      }
    }
  }

  size() {
    return this.x.length;
  }

  toObject() {
    return {
      x: copyArray(this.x),
      y: copyArray(this.y),
      z: copyArray(this.z),
      r: copyArray(this.r),
      g: copyArray(this.g),
      b: copyArray(this.b),
      a: copyArray(this.a),
      width: copyArray(this.width)
    };
  }
}

module.exports = {
  AttributeSet
};
