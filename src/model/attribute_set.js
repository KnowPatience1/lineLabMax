function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function validateNumberArray(name, values) {
  if (!Array.isArray(values)) {
    throw new TypeError(name + " must be an array");
  }

  for (var i = 0; i < values.length; i += 1) {
    if (!isFiniteNumber(values[i])) {
      throw new TypeError(name + "[" + i + "] must be a finite number");
    }
  }
}

function copyArray(values) {
  return values.slice();
}

function AttributeSet(config) {
  var source = config || {};

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

AttributeSet.prototype._validate = function () {
  validateNumberArray("x", this.x);
  validateNumberArray("y", this.y);
  validateNumberArray("z", this.z);
  validateNumberArray("r", this.r);
  validateNumberArray("g", this.g);
  validateNumberArray("b", this.b);
  validateNumberArray("a", this.a);
  validateNumberArray("width", this.width);

  var n = this.x.length;
  var names = ["y", "z", "r", "g", "b", "a", "width"];

  for (var i = 0; i < names.length; i += 1) {
    var name = names[i];
    if (this[name].length !== n) {
      throw new Error(
        name + " has length " + this[name].length + ", expected " + n
      );
    }
  }
};

AttributeSet.prototype.size = function () {
  return this.x.length;
};

AttributeSet.prototype.toObject = function () {
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
};

module.exports = {
  AttributeSet: AttributeSet
};
