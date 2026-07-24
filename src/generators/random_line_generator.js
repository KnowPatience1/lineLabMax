// Updated 2026-07-24 for JavaScript ES6 refactor.
const { LineDefinition } = require("../model/line_definition");

function shuffleInPlace(values) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
  }
}

class RandomLineGenerator {
  generate(attributes) {
    const count = attributes.size();
    const indices = [];
    const definitions = [];

    for (let i = 0; i < count; i += 1) {
      indices.push(i);
    }

    shuffleInPlace(indices);

    // Take shuffled point indices two at a time to form start/end pairs.
    for (let k = 0; k < count - 1; k += 2) {
      definitions.push(new LineDefinition(indices[k], indices[k + 1]));
    }

    return definitions;
  }
}

module.exports = {
  RandomLineGenerator
};
