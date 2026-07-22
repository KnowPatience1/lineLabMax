function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function validateAxis(name, value) {
  if (!isFiniteNumber(value)) {
    throw new TypeError(name + " must be a finite number");
  }
}

function Vec3(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;

  this.validate();
}

Vec3.prototype.validate = function () {
  validateAxis("x", this.x);
  validateAxis("y", this.y);
  validateAxis("z", this.z);
};

Vec3.prototype.toArray = function () {
  return [this.x, this.y, this.z];
};

Vec3.prototype.copy = function () {
  return new Vec3(this.x, this.y, this.z);
};

module.exports = {
  Vec3: Vec3
};
