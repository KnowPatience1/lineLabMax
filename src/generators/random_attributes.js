var AttributeSet = require("../model/attribute_set").AttributeSet;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createRandomAttributes(pointCount) {
  var count = Math.max(0, Math.floor(Number(pointCount) || 0));

  var x = [];
  var y = [];
  var z = [];
  var r = [];
  var g = [];
  var b = [];
  var a = [];
  var width = [];

  for (var i = 0; i < count; i += 1) {
    x.push(randomBetween(-1.0, 1.0));
    y.push(randomBetween(-1.0, 1.0));
    z.push(randomBetween(-1.0, 1.0));

    r.push(Math.random());
    g.push(Math.random());
    b.push(Math.random());
    a.push(randomBetween(0.05, 1.0));

    width.push(0.02);
  }

  return new AttributeSet({
    x: x,
    y: y,
    z: z,
    r: r,
    g: g,
    b: b,
    a: a,
    width: width
  });
}

module.exports = {
  createRandomAttributes: createRandomAttributes
};
