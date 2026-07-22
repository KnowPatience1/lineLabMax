var LineDefinition = require("../model/line_definition").LineDefinition;

function shuffleInPlace(values) {
  for (var i = values.length - 1; i > 0; i -= 1) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
  }
}

function RandomLineGenerator() {}

RandomLineGenerator.prototype.generate = function (attributes) {
  var count = attributes.size();
  var indices = [];
  var definitions = [];

  for (var i = 0; i < count; i += 1) {
    indices.push(i);
  }

  shuffleInPlace(indices);

  // Take shuffled point indices two at a time to form start/end pairs.
  for (var k = 0; k < count - 1; k += 2) {
    definitions.push(new LineDefinition(indices[k], indices[k + 1]));
  }

  return definitions;
};

module.exports = {
  RandomLineGenerator: RandomLineGenerator
};
