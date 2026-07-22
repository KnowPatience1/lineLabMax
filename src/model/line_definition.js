function isNonNegativeInteger(value) {
  return typeof value === "number" && isFinite(value) && value >= 0 && Math.floor(value) === value;
}

function LineDefinition(start, end) {
  this.start = start;
  this.end = end;

  this.validate();
}

LineDefinition.prototype.validate = function () {
  if (!isNonNegativeInteger(this.start)) {
    throw new TypeError("start must be a non-negative integer");
  }

  if (!isNonNegativeInteger(this.end)) {
    throw new TypeError("end must be a non-negative integer");
  }
};

LineDefinition.prototype.toObject = function () {
  return {
    start: this.start,
    end: this.end
  };
};

LineDefinition.fromObject = function (obj) {
  return new LineDefinition(obj.start, obj.end);
};

module.exports = {
  LineDefinition: LineDefinition
};
