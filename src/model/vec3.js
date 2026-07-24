// Updated 2026-07-24 for JavaScript ES6 refactor.
function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function validateAxis(name, value) {
  if (!isFiniteNumber(value)) {
    throw new TypeError(name + " must be a finite number");
  }
}

class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.validate();
  }

  validate() {
    validateAxis("x", this.x);
    validateAxis("y", this.y);
    validateAxis("z", this.z);
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  copy() {
    return new Vec3(this.x, this.y, this.z);
  }
}

module.exports = {
  Vec3
};
