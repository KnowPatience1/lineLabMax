// Updated 2026-07-25 for JavaScript ES6 line/group/layer system module.
/* Here are the intended public commands in lineBaseSystem.js that you can call from Max:

1. generate numLines  
Syntax: generate 120  
Purpose: Generates and freezes the random pool, builds lines, builds hierarchy, and renders.

2. reshuffle  
Syntax: reshuffle  
Purpose: Keeps the same frozen pool, reshuffles point pairing/order, rebuilds hierarchy, and rerenders.

3. setForm formName  
Syntax: setForm cube  
Syntax: setForm sphere  
Purpose: Remaps geometry form and rerenders.

4. buildHierarchy  
Syntax: buildHierarchy  
Purpose: Rebuilds layer/group structure from current lines and rerenders.

5. reportHierarchy  
Syntax: reportHierarchy  
Purpose: Emits hierarchy data to outlet messages:
hierarchy_begin, layer, group, group_line, hierarchy_end.

6. setHierarchyRanges layerMin layerMax groupsMin groupsMax linesMin linesMax  
Syntax: setHierarchyRanges 1 4 1 6 1 12  
Purpose: Sets random bounds for hierarchy generation. Rebuilds hierarchy if data already exists.

7. resetHierarchyRanges  
Syntax: resetHierarchyRanges  
Purpose: Restores default hierarchy bounds and rebuilds hierarchy if data exists.

8. setVisible targetType targetId visibleFlag  
Syntax: setVisible layer a1 0  
Syntax: setVisible group g3 1  
Syntax: setVisible line 12 0  
Purpose: Sets visibility at layer, group, or line level, then rerenders.  
Note: Use visibleFlag as 0 or 1.

9. show targetType targetId  
Syntax: show layer a2  
Syntax: show group g1  
Syntax: show line 7  
Purpose: Convenience wrapper for setVisible ... 1.

10. hide targetType targetId  
Syntax: hide layer a2  
Syntax: hide group g1  
Syntax: hide line 7  
Purpose: Convenience wrapper for setVisible ... 0.

Important usage notes:
1. targetType must be layer, group, or line.
2. Layer ids are a1, a2, a3...
3. Group ids are g1, g2, g3...
4. For line visibility commands, pass a numeric line id.
*/

"use strict";
autowatch = 1;
inlets = 1;
outlets = 1;

const RANDOMS_PER_POINT = 9;

const DEFAULT_LAYER_COUNT_RANGE = { min: 1, max: 4 };
const DEFAULT_GROUPS_PER_LAYER_RANGE = { min: 1, max: 6 };
const DEFAULT_LINES_PER_GROUP_RANGE = { min: 1, max: 12 };

let randomPool = null;
let pointOrder = [];
let lineDefinitions = [];
let lines = [];
let selectedFormName = "cube";
let hierarchy = null;
let selectedLayerId = null;
let selectedGroupId = null;
let selectedLineId = null;

const hierarchyRangeConfig = {
  layerCount: {
    min: DEFAULT_LAYER_COUNT_RANGE.min,
    max: DEFAULT_LAYER_COUNT_RANGE.max
  },
  groupsPerLayer: {
    min: DEFAULT_GROUPS_PER_LAYER_RANGE.min,
    max: DEFAULT_GROUPS_PER_LAYER_RANGE.max
  },
  linesPerGroup: {
    min: DEFAULT_LINES_PER_GROUP_RANGE.min,
    max: DEFAULT_LINES_PER_GROUP_RANGE.max
  }
};

function log(msg) {
  post("[lineBaseSystem] " + msg + "\n");
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

function randomIntInclusive(minValue, maxValue) {
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function sanitizeRange(minValue, maxValue, fallbackMin, fallbackMax) {
  const parsedMin = parseInt(minValue, 10);
  const parsedMax = parseInt(maxValue, 10);

  let safeMin = isFinite(parsedMin) ? parsedMin : fallbackMin;
  let safeMax = isFinite(parsedMax) ? parsedMax : fallbackMax;

  if (safeMin < 1) {
    safeMin = 1;
  }
  if (safeMax < 1) {
    safeMax = 1;
  }

  if (safeMin > safeMax) {
    const temp = safeMin;
    safeMin = safeMax;
    safeMax = temp;
  }

  return {
    min: safeMin,
    max: safeMax
  };
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

function isLineVisible(line) {
  return !!(line && line.visible !== false);
}

function isGroupVisible(group) {
  return !!(group && group.visible !== false);
}

function isLayerVisible(layer) {
  return !!(layer && layer.visible !== false);
}

function createSequentialLineIds(lineCount) {
  const lineIds = [];
  for (let i = 0; i < lineCount; i += 1) {
    lineIds.push(i);
  }
  return lineIds;
}

function buildRandomChunkSizes(totalCount, minChunkSize, maxChunkSize) {
  const chunkSizes = [];
  let remainingCount = totalCount;

  while (remainingCount > 0) {
    if (remainingCount <= maxChunkSize) {
      chunkSizes.push(remainingCount);
      remainingCount = 0;
      continue;
    }

    const maxChunkForThisStep = Math.min(maxChunkSize, remainingCount - minChunkSize);
    const nextChunkSize = randomIntInclusive(minChunkSize, maxChunkForThisStep);
    chunkSizes.push(nextChunkSize);
    remainingCount -= nextChunkSize;
  }

  return chunkSizes;
}

function buildRandomGroupSpecs(lineCount) {
  const lineRange = hierarchyRangeConfig.linesPerGroup;
  const minChunkSize = Math.max(1, lineRange.min);
  const maxChunkSize = Math.max(minChunkSize, lineRange.max);

  const chunkSizes = buildRandomChunkSizes(lineCount, minChunkSize, maxChunkSize);
  const groupSpecs = [];

  for (let i = 0; i < chunkSizes.length; i += 1) {
    groupSpecs.push({
      group_id: "g" + (i + 1),
      line_count: chunkSizes[i]
    });
  }

  return groupSpecs;
}

function buildRandomCountsForFixedBucketCount(totalCount, bucketCount, maxPerBucket) {
  const counts = [];

  if (bucketCount < 1) {
    return counts;
  }

  for (let i = 0; i < bucketCount; i += 1) {
    counts.push(1);
  }

  let remainingCount = totalCount - bucketCount;
  const effectiveMax = Math.max(maxPerBucket, Math.ceil(totalCount / bucketCount));

  while (remainingCount > 0) {
    const bucketIndex = randomIntInclusive(0, bucketCount - 1);
    if (counts[bucketIndex] >= effectiveMax) {
      continue;
    }

    counts[bucketIndex] += 1;
    remainingCount -= 1;
  }

  return counts;
}

function buildRandomLayerSpecs(groupCount) {
  const layerRange = hierarchyRangeConfig.layerCount;
  const groupRange = hierarchyRangeConfig.groupsPerLayer;

  const minLayerCount = Math.max(1, Math.min(layerRange.min, groupCount));
  const maxLayerCount = Math.max(minLayerCount, Math.min(layerRange.max, groupCount));
  const layerCount = randomIntInclusive(minLayerCount, maxLayerCount);

  const groupsPerLayerCounts = buildRandomCountsForFixedBucketCount(
    groupCount,
    layerCount,
    Math.max(1, groupRange.max)
  );

  const layerSpecs = [];
  for (let i = 0; i < groupsPerLayerCounts.length; i += 1) {
    layerSpecs.push({
      layer_id: "a" + (i + 1),
      group_count: groupsPerLayerCounts[i]
    });
  }

  return layerSpecs;
}

function assignLinesToNamedGroups(lineIds, groupSpecs) {
  const groups = [];
  let cursor = 0;

  for (let i = 0; i < groupSpecs.length; i += 1) {
    const spec = groupSpecs[i];
    const groupLineIds = [];

    for (let j = 0; j < spec.line_count && cursor < lineIds.length; j += 1) {
      groupLineIds.push(lineIds[cursor]);
      cursor += 1;
    }

    groups.push({
      group_id: spec.group_id,
      line_ids: groupLineIds,
      line_count: groupLineIds.length,
      layer_id: null,
      visible: true
    });
  }

  return groups;
}

function assignGroupsToNamedLayers(groups, layerSpecs) {
  const layers = [];
  let cursor = 0;

  for (let i = 0; i < layerSpecs.length; i += 1) {
    const spec = layerSpecs[i];
    const groupIds = [];
    const lineIds = [];

    for (let j = 0; j < spec.group_count && cursor < groups.length; j += 1) {
      const group = groups[cursor];
      group.layer_id = spec.layer_id;
      groupIds.push(group.group_id);

      for (let k = 0; k < group.line_ids.length; k += 1) {
        lineIds.push(group.line_ids[k]);
      }

      cursor += 1;
    }

    layers.push({
      layer_id: spec.layer_id,
      group_ids: groupIds,
      line_ids: lineIds,
      group_count: groupIds.length,
      line_count: lineIds.length,
      visible: true
    });
  }

  return layers;
}

function flattenLineOrderFromLayers(layers, groupsById) {
  const orderedLineIds = [];

  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];

    for (let j = 0; j < layer.group_ids.length; j += 1) {
      const groupId = layer.group_ids[j];
      const group = groupsById[groupId];

      if (!group) {
        continue;
      }

      for (let k = 0; k < group.line_ids.length; k += 1) {
        orderedLineIds.push(group.line_ids[k]);
      }
    }
  }

  return orderedLineIds;
}

function getNamedObject(objectName) {
  if (typeof patcher === "object" && patcher && typeof patcher.getnamed === "function") {
    return patcher.getnamed(objectName);
  }

  if (typeof globalThis === "object" && globalThis && globalThis.patcher && typeof globalThis.patcher.getnamed === "function") {
    return globalThis.patcher.getnamed(objectName);
  }

  return null;
}

function sendNamedObjectMessage(objectName, messageName, value) {
  const namedObject = getNamedObject(objectName);

  if (namedObject && typeof namedObject.message === "function") {
    if (typeof value === "undefined") {
      namedObject.message(messageName);
    } else {
      namedObject.message(messageName, value);
    }
    return true;
  }

  if (typeof messnamed === "function") {
    if (typeof value === "undefined") {
      messnamed(objectName, messageName);
    } else {
      messnamed(objectName, messageName, value);
    }
    return true;
  }

  return false;
}

function clearNamedMenu(objectName) {
  return sendNamedObjectMessage(objectName, "clear");
}

function appendNamedMenuItem(objectName, itemValue) {
  return sendNamedObjectMessage(objectName, "append", itemValue);
}

function resolveMenuSelection(selectionValue, values) {
  if (!values || values.length === 0) {
    return null;
  }

  if (typeof selectionValue === "undefined" || selectionValue === null || selectionValue === "") {
    return values[0];
  }

  const numericValue = Number(selectionValue);
  const isNumericSelection = isFinite(numericValue);

  if (isNumericSelection) {
    const oneBasedIndex = Math.floor(numericValue) - 1;
    if (oneBasedIndex >= 0 && oneBasedIndex < values.length) {
      return values[oneBasedIndex];
    }

    const zeroBasedIndex = Math.floor(numericValue);
    if (zeroBasedIndex >= 0 && zeroBasedIndex < values.length) {
      return values[zeroBasedIndex];
    }
  }

  const selectionText = String(selectionValue);
  for (let i = 0; i < values.length; i += 1) {
    if (String(values[i]) === selectionText) {
      return values[i];
    }
  }

  return values[0];
}

function getGroupsForLayer(layerId) {
  const groups = [];

  if (!hierarchy || !hierarchy.groups) {
    return groups;
  }

  for (let i = 0; i < hierarchy.groups.length; i += 1) {
    const group = hierarchy.groups[i];
    if (group.layer_id === layerId) {
      groups.push(group);
    }
  }

  return groups;
}

function emitLineMenu() {
  const couldClearMenu = clearNamedMenu("lMen");

  if (!couldClearMenu) {
    log("emitLineMenu: could not reach lMen");
    return;
  }

  if (!hierarchy || !selectedGroupId) {
    selectedLineId = null;
    return;
  }

  const group = getHierarchyGroupById(selectedGroupId);
  if (!group || !group.line_ids || group.line_ids.length === 0) {
    selectedLineId = null;
    return;
  }

  for (let i = 0; i < group.line_ids.length; i += 1) {
    appendNamedMenuItem("lMen", group.line_ids[i]);
  }

  selectedLineId = group.line_ids[0];
}

function emitGroupMenu() {
  const couldClearMenu = clearNamedMenu("gMen");

  if (!couldClearMenu) {
    log("emitGroupMenu: could not reach gMen");
    return;
  }

  if (!hierarchy || !hierarchy.groups || !selectedLayerId) {
    selectedGroupId = null;
    emitLineMenu();
    return;
  }

  const groupsInLayer = getGroupsForLayer(selectedLayerId);
  for (let i = 0; i < groupsInLayer.length; i += 1) {
    appendNamedMenuItem("gMen", groupsInLayer[i].group_id);
  }

  if (groupsInLayer.length > 0) {
    selectedGroupId = groupsInLayer[0].group_id;
  } else {
    selectedGroupId = null;
  }

  emitLineMenu();
}

function emitLayerMenu() {
  const couldClearMenu = clearNamedMenu("aMen");

  if (!couldClearMenu) {
    log("emitLayerMenu: could not reach aMen");
    return;
  }

  if (!hierarchy || !hierarchy.layers) {
    selectedLayerId = null;
    selectedGroupId = null;
    selectedLineId = null;
    emitGroupMenu();
    return;
  }

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    appendNamedMenuItem("aMen", hierarchy.layers[i].layer_id);
  }

  if (hierarchy.layers.length > 0) {
    selectedLayerId = hierarchy.layers[0].layer_id;
  } else {
    selectedLayerId = null;
  }

  emitGroupMenu();
}

function buildHierarchyFromCurrentLines() {
  if (!lines || lines.length === 0) {
    hierarchy = null;
    emitLayerMenu();
    return;
  }

  const lineIds = createSequentialLineIds(lines.length);
  const groupSpecs = buildRandomGroupSpecs(lineIds.length);
  const groups = assignLinesToNamedGroups(lineIds, groupSpecs);
  const layerSpecs = buildRandomLayerSpecs(groups.length);
  const layers = assignGroupsToNamedLayers(groups, layerSpecs);

  const groupsById = {};
  for (let i = 0; i < groups.length; i += 1) {
    groupsById[groups[i].group_id] = groups[i];
  }

  const lineById = {};
  for (let i = 0; i < lines.length; i += 1) {
    lineById[lines[i].id] = lines[i];
  }

  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    for (let j = 0; j < group.line_ids.length; j += 1) {
      const line = lineById[group.line_ids[j]];
      if (line) {
        line.group_id = group.group_id;
        line.layer_id = group.layer_id;
      }
    }
  }

  const orderedLineIds = flattenLineOrderFromLayers(layers, groupsById);

  hierarchy = {
    layers: layers,
    groups: groups,
    meta: {
      line_count: lineIds.length,
      group_count: groups.length,
      layer_count: layers.length,
      ranges: {
        layerCount: {
          min: hierarchyRangeConfig.layerCount.min,
          max: hierarchyRangeConfig.layerCount.max
        },
        groupsPerLayer: {
          min: hierarchyRangeConfig.groupsPerLayer.min,
          max: hierarchyRangeConfig.groupsPerLayer.max
        },
        linesPerGroup: {
          min: hierarchyRangeConfig.linesPerGroup.min,
          max: hierarchyRangeConfig.linesPerGroup.max
        }
      }
    },
    ordered_line_ids: orderedLineIds
  };

  emitLayerMenu();
}

function selectLayer(selectionValue) {
  if (!hierarchy || !hierarchy.layers || hierarchy.layers.length === 0) {
    log("selectLayer requires generated data");
    return;
  }

  const layerIds = [];
  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    layerIds.push(hierarchy.layers[i].layer_id);
  }

  selectedLayerId = resolveMenuSelection(selectionValue, layerIds);
  emitGroupMenu();
}

function selectGroup(selectionValue) {
  if (!hierarchy || !selectedLayerId) {
    log("selectGroup requires selected layer");
    return;
  }

  const groupsInLayer = getGroupsForLayer(selectedLayerId);
  const groupIds = [];
  for (let i = 0; i < groupsInLayer.length; i += 1) {
    groupIds.push(groupsInLayer[i].group_id);
  }

  selectedGroupId = resolveMenuSelection(selectionValue, groupIds);
  emitLineMenu();
}

function selectLine(selectionValue) {
  if (!hierarchy || !selectedGroupId) {
    log("selectLine requires selected group");
    return;
  }

  const group = getHierarchyGroupById(selectedGroupId);
  if (!group || !group.line_ids || group.line_ids.length === 0) {
    log("selectLine requires selected group with lines");
    return;
  }

  selectedLineId = resolveMenuSelection(selectionValue, group.line_ids);
}

function getHierarchyGroupById(groupId) {
  if (!hierarchy || !hierarchy.groups) {
    return null;
  }

  for (let i = 0; i < hierarchy.groups.length; i += 1) {
    if (hierarchy.groups[i].group_id === groupId) {
      return hierarchy.groups[i];
    }
  }

  return null;
}

function getLineById(lineId) {
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].id === lineId) {
      return lines[i];
    }
  }

  return null;
}

function getHierarchyLayerById(layerId) {
  if (!hierarchy || !hierarchy.layers) {
    return null;
  }

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    if (hierarchy.layers[i].layer_id === layerId) {
      return hierarchy.layers[i];
    }
  }

  return null;
}

function setLayerVisible(layerId, visible) {
  const layer = getHierarchyLayerById(layerId);
  if (!layer) {
    log("setLayerVisible: unknown layer " + layerId);
    return;
  }

  layer.visible = !!visible;
}

function setGroupVisible(groupId, visible) {
  const group = getHierarchyGroupById(groupId);
  if (!group) {
    log("setGroupVisible: unknown group " + groupId);
    return;
  }

  group.visible = !!visible;
}

function setLineVisible(lineId, visible) {
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].id === lineId) {
      lines[i].visible = !!visible;
      return;
    }
  }

  log("setLineVisible: unknown line " + lineId);
}

function isLineVisibleByHierarchy(line) {
  if (!isLineVisible(line)) {
    return false;
  }

  if (!hierarchy) {
    return true;
  }

  const group = getHierarchyGroupById(line.group_id);
  const layer = group ? getHierarchyLayerById(group.layer_id) : null;

  return isGroupVisible(group) && isLayerVisible(layer);
}

function applyHierarchyLineOrder() {
  if (!hierarchy || !hierarchy.ordered_line_ids || hierarchy.ordered_line_ids.length === 0) {
    return;
  }

  const lineById = {};
  for (let i = 0; i < lines.length; i += 1) {
    lineById[lines[i].id] = lines[i];
  }

  const orderedLines = [];
  for (let j = 0; j < hierarchy.ordered_line_ids.length; j += 1) {
    const lineId = hierarchy.ordered_line_ids[j];
    const line = lineById[lineId];
    if (line) {
      orderedLines.push(line);
    }
  }

  lines = orderedLines;
}

function rebuildLinesFromCurrentOrder() {
  lineDefinitions = buildLineDefinitionsFromPointOrder(pointOrder);
  buildLinesFromPool(randomPool, lineDefinitions);
}

function rebuildSystemFromCurrentState() {
  rebuildLinesFromCurrentOrder();
  buildHierarchyFromCurrentLines();
  applyHierarchyLineOrder();
}

function emitRenderCommands() {
  outlet(0, "sketch", "reset");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!isLineVisibleByHierarchy(line)) {
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

function reportHierarchy() {
  if (!hierarchy) {
    log("reportHierarchy requires generated data");
    return;
  }

  outlet(
    0,
    "hierarchy_begin",
    hierarchy.meta.layer_count,
    hierarchy.meta.group_count,
    hierarchy.meta.line_count
  );

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    const layer = hierarchy.layers[i];
    outlet(0, "layer", layer.layer_id, layer.group_count, layer.line_count, layer.visible ? 1 : 0);
  }

  for (let j = 0; j < hierarchy.groups.length; j += 1) {
    const group = hierarchy.groups[j];
    outlet(0, "group", group.group_id, group.layer_id, group.line_count, group.visible ? 1 : 0);

    for (let k = 0; k < group.line_ids.length; k += 1) {
      const lineId = group.line_ids[k];
      const line = getLineById(lineId);
      outlet(0, "group_line", group.group_id, lineId, line && line.visible !== false ? 1 : 0);
    }
  }

  outlet(0, "hierarchy_end");
}

function buildHierarchy() {
  if (!randomPool || lines.length === 0) {
    log("buildHierarchy requires generated data");
    return;
  }

  buildHierarchyFromCurrentLines();
  applyHierarchyLineOrder();
  emitRenderCommands();
}

function setVisible(targetType, targetId, visible) {
  const normalizedType = String(targetType || "").toLowerCase();
  const isVisible = !!visible;

  if (normalizedType === "layer") {
    setLayerVisible(targetId, isVisible);
  } else if (normalizedType === "group") {
    setGroupVisible(targetId, isVisible);
  } else if (normalizedType === "line") {
    setLineVisible(targetId, isVisible);
  } else {
    log("setVisible requires layer, group, or line");
    return;
  }

  if (randomPool && lines.length > 0) {
    emitRenderCommands();
  }
}

function show(targetType, targetId) {
  setVisible(targetType, targetId, true);
}

function hide(targetType, targetId) {
  setVisible(targetType, targetId, false);
}

function reshuffle() {
  if (!randomPool) {
    log("reshuffle requires generated data");
    return;
  }

  shufflePointOrder(pointOrder);
  rebuildSystemFromCurrentState();
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
    rebuildSystemFromCurrentState();
    emitRenderCommands();
  }
}

function setHierarchyRanges(
  layerMin,
  layerMax,
  groupsMin,
  groupsMax,
  linesMin,
  linesMax
) {
  const safeLayerRange = sanitizeRange(
    layerMin,
    layerMax,
    DEFAULT_LAYER_COUNT_RANGE.min,
    DEFAULT_LAYER_COUNT_RANGE.max
  );

  const safeGroupRange = sanitizeRange(
    groupsMin,
    groupsMax,
    DEFAULT_GROUPS_PER_LAYER_RANGE.min,
    DEFAULT_GROUPS_PER_LAYER_RANGE.max
  );

  const safeLineRange = sanitizeRange(
    linesMin,
    linesMax,
    DEFAULT_LINES_PER_GROUP_RANGE.min,
    DEFAULT_LINES_PER_GROUP_RANGE.max
  );

  hierarchyRangeConfig.layerCount = safeLayerRange;
  hierarchyRangeConfig.groupsPerLayer = safeGroupRange;
  hierarchyRangeConfig.linesPerGroup = safeLineRange;

  log(
    "setHierarchyRanges layer=" + safeLayerRange.min + ".." + safeLayerRange.max +
      " groups=" + safeGroupRange.min + ".." + safeGroupRange.max +
      " lines=" + safeLineRange.min + ".." + safeLineRange.max
  );

  if (randomPool && lines.length > 0) {
    buildHierarchy();
  }
}

function resetHierarchyRanges() {
  hierarchyRangeConfig.layerCount = {
    min: DEFAULT_LAYER_COUNT_RANGE.min,
    max: DEFAULT_LAYER_COUNT_RANGE.max
  };

  hierarchyRangeConfig.groupsPerLayer = {
    min: DEFAULT_GROUPS_PER_LAYER_RANGE.min,
    max: DEFAULT_GROUPS_PER_LAYER_RANGE.max
  };

  hierarchyRangeConfig.linesPerGroup = {
    min: DEFAULT_LINES_PER_GROUP_RANGE.min,
    max: DEFAULT_LINES_PER_GROUP_RANGE.max
  };

  log("resetHierarchyRanges to defaults");

  if (randomPool && lines.length > 0) {
    buildHierarchy();
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
  rebuildSystemFromCurrentState();

  log(
    "generated pool with " + randomPool.random_count +
      " random values for " + lines.length + " lines"
  );

  emitRenderCommands();
}
