// Updated 2026-07-25 for JavaScript ES6 skeleton module.
// In lineBaseInForm.js, all of the top-level function declarations are visible inside the script, 
// but only a few are effectively public as Max message handlers:
// generate
// reshuffle
// setForm
// Those are the ones you can call from Max by sending those message names to the v8 object.
//
// The rest are internal helpers:
// mapToRange
// createRandomValues
// createPointOrder
// shufflePointOrder
// deepFreezeObject
// verifyPoolIsLocked
// buildRandomPool
// mapCubePoint
// mapSpherePoint
// getPointCoordinates
// buildLineDefinitionsFromPointOrder
// buildLinesFromPool
// rebuildLinesFromCurrentOrder
// emitRenderCommands
//
// So the script is not using an export system. It’s using Max’s message-dispatch convention: 
// top-level named functions become callable entry points, while the helpers stay internal by convention.

"use strict";
autowatch = 1;
inlets = 1;
outlets = 1;

const RANDOMS_PER_POINT = 9;

let randomPool = null;
let pointOrder = [];
let lineDefinitions = [];
let lines = [];
// selectedFormName is "cube" by default, but can be changed to "sphere" via the setForm() message.
let selectedFormName = "cube";

function log(msg) {
  post("[lineBaseInForm] " + msg + "\n");
}

function mapToRange(value, min, max) {
  return min + value * (max - min);
}

function sketchWidth(lineWidth) {
  return Math.max(2, Number(lineWidth) * 120);
}

function pointCountFromLineCount(lineCount) {
  return lineCount * 2;
}

function randomCountFromLineCount(lineCount) {
  return pointCountFromLineCount(lineCount) * RANDOMS_PER_POINT;
}

function createRandomValues(count) {
  const values = [];
  for (let i = 0; i < count; i += 1) {
    values.push(Math.random());
  }
  return values;
}

function createPointOrder(pointCount) {
  const order = [];
  for (let i = 0; i < pointCount; i += 1) {
    order.push(i);
  }
  return order;
}

function shufflePointOrder(order) {
  for (let i = order.length - 1; i > 0; i -= 1) {
    const randomPosition = Math.floor(Math.random() * (i + 1));
    const swapValue = order[i];
    order[i] = order[randomPosition];
    order[randomPosition] = swapValue;
  }
}

function deepFreezeObject(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  const keys = Object.getOwnPropertyNames(value);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    deepFreezeObject(value[key]);
  }

  return Object.freeze(value);
}

function verifyPoolIsLocked(pool) {
  return (
    Object.isFrozen(pool) &&
    Object.isFrozen(pool.random_values) &&
    Object.isFrozen(pool.coordinates) &&
    Object.isFrozen(pool.coordinates.x) &&
    Object.isFrozen(pool.coordinates.y) &&
    Object.isFrozen(pool.coordinates.z) &&
    Object.isFrozen(pool.attributes) &&
    Object.isFrozen(pool.attributes.r) &&
    Object.isFrozen(pool.attributes.g) &&
    Object.isFrozen(pool.attributes.b) &&
    Object.isFrozen(pool.attributes.a) &&
    Object.isFrozen(pool.attributes.line_width)
  );
}

function buildRandomPool(lineCount) {
  const pointCount = pointCountFromLineCount(lineCount);
  const randomCount = randomCountFromLineCount(lineCount);
  const randomValues = createRandomValues(randomCount);

  const coordinates = { x: [], y: [], z: [] };
  const attributes = {
    r: [],
    g: [],
    b: [],
    a: [],
    line_width: []
  };

  let cursor = 0;
  for (let i = 0; i < pointCount; i += 1) {
    coordinates.x.push(mapToRange(randomValues[cursor], 0.0, 1.0));
    cursor += 1;
    coordinates.y.push(mapToRange(randomValues[cursor], 0.0, 1.0));
    cursor += 1;
    coordinates.z.push(mapToRange(randomValues[cursor], 0.0, 1.0));
    cursor += 1;

    attributes.r.push(randomValues[cursor]);
    cursor += 1;
    attributes.g.push(randomValues[cursor]);
    cursor += 1;
    attributes.b.push(randomValues[cursor]);
    cursor += 1;
    attributes.a.push(mapToRange(randomValues[cursor], 0.25, 1.0));
    cursor += 1;

    attributes.line_width.push(mapToRange(randomValues[cursor], 0.01, 0.04));
    cursor += 1;
  }

  return {
    line_count: lineCount,
    point_count: pointCount,
    random_count: randomCount,
    random_values: randomValues,
    coordinates,
    attributes
  };
}

function mapCubePoint(pool, pointIndex) {
  return [
    mapToRange(pool.coordinates.x[pointIndex], -1.0, 1.0),
    mapToRange(pool.coordinates.y[pointIndex], -1.0, 1.0),
    mapToRange(pool.coordinates.z[pointIndex], -1.0, 1.0)
  ];
}

function mapSpherePoint(pool, pointIndex) {
  const radius = Math.cbrt(pool.coordinates.x[pointIndex]);
  const theta = pool.coordinates.y[pointIndex] * Math.PI * 2;
  const phi = Math.acos(2.0 * pool.coordinates.z[pointIndex] - 1.0);

  const sinPhi = Math.sin(phi);

  return [
    radius * sinPhi * Math.cos(theta),
    radius * sinPhi * Math.sin(theta),
    radius * Math.cos(phi)
  ];
}

function getPointCoordinates(pool, pointIndex) {
  if (selectedFormName === "sphere") {
    return mapSpherePoint(pool, pointIndex);
  }

  return mapCubePoint(pool, pointIndex);
}

function buildLineDefinitionsFromPointOrder(order) {
  const definitions = [];
  for (let i = 0; i < order.length - 1; i += 2) {
    definitions.push({
      id: definitions.length,
      start_index: order[i],
      end_index: order[i + 1]
    });
  }

  return definitions;
}

function buildLinesFromPool(pool, definitions) {
  lines = [];

  for (let i = 0; i < definitions.length; i += 1) {
    const definition = definitions[i];
    const startPointIndex = definition.start_index;
    const endPointIndex = definition.end_index;
    const startCoords = getPointCoordinates(pool, startPointIndex);
    const endCoords = getPointCoordinates(pool, endPointIndex);

    lines.push({
      id: definition.id,
      start_coords: startCoords,
      end_coords: endCoords,
      color: [
        pool.attributes.r[startPointIndex],
        pool.attributes.g[startPointIndex],
        pool.attributes.b[startPointIndex],
        pool.attributes.a[startPointIndex]
      ],
      line_width: pool.attributes.line_width[startPointIndex],
      visible: true
    });
  }
}

function rebuildLinesFromCurrentOrder() {
  lineDefinitions = buildLineDefinitionsFromPointOrder(pointOrder);
  buildLinesFromPool(randomPool, lineDefinitions);
}

function emitRenderCommands() {
  outlet(0, "sketch", "reset");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!line.visible) {
      continue;
    }

    outlet(0, "sketch", "glcolor", line.color[0], line.color[1], line.color[2], line.color[3]);
    outlet(0, "sketch", "gllinewidth", sketchWidth(line.line_width));
    outlet(0, "sketch", "moveto", line.start_coords[0], line.start_coords[1], line.start_coords[2]);
    outlet(0, "sketch", "lineto", line.end_coords[0], line.end_coords[1], line.end_coords[2]);
  }

  outlet(0, "sketch", "draw");
  outlet(0, "sketch", "drawimmediate");
  outlet(0, "rendered", lines.length);
}

function reshuffle() {
  if (!randomPool) {
    log("reshuffle requires generated data");
    return;
  }

  shufflePointOrder(pointOrder);
  rebuildLinesFromCurrentOrder();
  emitRenderCommands();
}

function setForm(formName) {
  const normalizedFormName = String(formName || "").toLowerCase();

  if (normalizedFormName !== "cube" && normalizedFormName !== "sphere") {
    log("setForm requires cube or sphere");
    return;
  }

  selectedFormName = normalizedFormName;

  if (randomPool) {
    rebuildLinesFromCurrentOrder();
    // not sure if this is necessary, but it seems like a good idea at the moment to re-render after changing the form
    emitRenderCommands();
  }
}

function generate(numLines) {
  const count = parseInt(numLines, 10);

  if (!isFinite(count) || count < 1) {
    log("generate requires a positive integer count");
    return;
  }

  randomPool = deepFreezeObject(buildRandomPool(count));

  if (!verifyPoolIsLocked(randomPool)) {
    log("randomPool lock failed");
    return;
  }

  pointOrder = createPointOrder(randomPool.point_count);
  shufflePointOrder(pointOrder);
  rebuildLinesFromCurrentOrder();

  log(
    "generated pool with " + randomPool.random_count +
    " random values for " + lines.length + " lines"
  );

  emitRenderCommands();
}