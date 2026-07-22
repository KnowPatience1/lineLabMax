function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function assertDefinitionInRange(definition, attributeSize) {
  if (!definition || !isFiniteNumber(definition.start) || !isFiniteNumber(definition.end)) {
    throw new TypeError("definition must contain numeric start/end indices");
  }

  var start = Math.floor(definition.start);
  var end = Math.floor(definition.end);

  if (start < 0 || start >= attributeSize) {
    throw new RangeError("definition.start out of range: " + start);
  }

  if (end < 0 || end >= attributeSize) {
    throw new RangeError("definition.end out of range: " + end);
  }
}

function buildLinePayload(attributes, definition, lineId) {
  var size = attributes.size();
  assertDefinitionInRange(definition, size);

  var startIndex = Math.floor(definition.start);
  var endIndex = Math.floor(definition.end);

  return {
    id: lineId,
    startIndex: startIndex,
    endIndex: endIndex,
    start: [
      attributes.x[startIndex],
      attributes.y[startIndex],
      attributes.z[startIndex]
    ],
    end: [
      attributes.x[endIndex],
      attributes.y[endIndex],
      attributes.z[endIndex]
    ],
    color: [
      attributes.r[startIndex],
      attributes.g[startIndex],
      attributes.b[startIndex],
      attributes.a[startIndex]
    ],
    width: attributes.width[startIndex],
    visible: true
  };
}

function buildLinePayloads(attributes, definitions, view) {
  if (!Array.isArray(definitions)) {
    throw new TypeError("definitions must be an array");
  }

  var payloads = [];
  var i;

  if (view && Array.isArray(view.entries)) {
    for (i = 0; i < view.entries.length; i += 1) {
      var entry = view.entries[i];

      if (!entry.visible) {
        continue;
      }

      var def = definitions[entry.lineIndex];
      payloads.push(buildLinePayload(attributes, def, payloads.length));
    }

    return payloads;
  }

  for (i = 0; i < definitions.length; i += 1) {
    payloads.push(buildLinePayload(attributes, definitions[i], i));
  }

  return payloads;
}

module.exports = {
  buildLinePayload: buildLinePayload,
  buildLinePayloads: buildLinePayloads
};
