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

function Color(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;

  this.validate();
}

Color.prototype.validate = function () {
  validateChannel("r", this.r);
  validateChannel("g", this.g);
  validateChannel("b", this.b);
  validateChannel("a", this.a);
};

Color.prototype.toArray = function () {
  return [this.r, this.g, this.b, this.a];
};

Color.prototype.copy = function () {
  return new Color(this.r, this.g, this.b, this.a);
};

module.exports = {
  Color: Color
};
