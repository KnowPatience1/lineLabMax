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

11. refreshMenus
Syntax: refreshMenus
Purpose: Repopulates aMen -> gMen -> lMen from current hierarchy and re-emits current_layer/current_group/current_line.

12. architecture
Syntax: architecture
Purpose: Emits architecture counts to the outlet as: architecture layerCount groupCount lineCount.
  Call architecture directly from Max when needed.
  Also receive fresh architecture counts automatically on hierarchy rebuild paths (generate, reshuffle, buildHierarchy, range changes).

13. set_pathName nameValue
Syntax: set_pathName pool_001
Purpose: Sets the current path name used as the storage key for immutable pool data.

14. get_pathName
Syntax: get_pathName
Purpose: Emits the current path name as: pathName nameValue.

15. save_randomPool
Syntax: save_randomPool
Purpose: Saves immutable pool-only data to pathName using a timestamped filename: randomPool_hh-mm-ss.json.

16. load_randomPool fullFilePath
Syntax: load_randomPool /full/path/randomPool_12-30-45.json
Purpose: Loads immutable pool-only data from a file saved by save_randomPool, then rebuilds and renders.

17. save_view viewId
Syntax: save_view view_001
Purpose: Saves mutable view state for the current pool, including form, point order, exact hierarchy, visibility, selections, and hierarchy ranges.

18. load_view fullFilePath
Syntax: load_view /full/path/view_view_001.json
Purpose: Loads mutable view state for the currently loaded pool and applies exact hierarchy replay.

19. get_poolId
Syntax: get_poolId
Purpose: Emits the current pool id as: pool_id idValue. Emits an empty string when no pool is currently linked.

20. list_views_for_pool poolId
Syntax: list_views_for_pool pool_2026-07-27_12-30-45
Purpose: Lists view files in pathName that belong to the given pool id.
Emits: views_begin poolId count, then view_item poolId viewId fullPath savedAt, then views_end poolId count.

21. set_poolId poolId
Syntax: set_poolId pool_2026-07-27_12-30-45
Purpose: Sets the current pool id used by view commands.

22. rebuild_from_loaded_pool
Syntax: rebuild_from_loaded_pool
Purpose: Rebuilds lines, hierarchy, menus, and render output from the currently loaded pool using sequential point order.

23. save_index
Syntax: save_index (requires pathName to be set)
Purpose: Writes or updates pools_index.json in pathName by indexing saved pools and views.

24. load_index
Syntax: load_index (requires pathName to be set)
Purpose: Loads pools_index.json from pathName into memory for quick browsing and list_views_for_pool.
Emits: index_loaded pathName poolCount viewCount

25. clear_index_cache
Syntax: clear_index_cache
Purpose: Clears the in-memory index cache so list_views_for_pool falls back to disk scan.

26. register_view viewId fullViewFilePath
Syntax: register_view view_001 /full/path/view_view_001.json
Purpose: Adds or updates a view entry in pools_index.json after external/manual view file saves.

27. unregister_view viewId
Syntax: unregister_view view_001
Purpose: Removes stale view entries from pools_index.json by view id.

28. clearMenus
Syntax: clearMenus
Purpose: Clears the aMen, gMen, and lMen menus in the Max patch and resets current selections.

29. reportArchitectureRows
Syntax: reportArchitectureRows
Purpose: Emits one row per line in layer-group-line order for direct Max routing.
Emits: architecture_rows_begin, then architecture_row layerId groupId lineId layerVisible groupVisible lineVisible, then architecture_rows_end rowCount.

30. reshuffleLineColors
Syntax: reshuffleLineColors
Purpose: Randomly reassigns line colors only while keeping line geometry, hierarchy, and line order unchanged.

31. reshuffleLineWidths
Syntax: reshuffleLineWidths
Purpose: Randomly reassigns line widths only while keeping line geometry, hierarchy, and line order unchanged.

32. setLayerPosition x y z
Syntax: setLayerPosition 0.0 0.0 0.0
Purpose: Sets position transform for the currently selected layer.

33. setLayerRotation x y z
Syntax: setLayerRotation 0 30 0
Purpose: Sets rotation transform (degrees) for the currently selected layer.

34. setLayerScale x y z
Syntax: setLayerScale 1 1 1
Purpose: Sets scale transform for the currently selected layer.

35. setLayerTransform px py pz rx ry rz sx sy sz
Syntax: setLayerTransform 0 0 0 0 0 0 1 1 1
Purpose: Sets full transform for the currently selected layer.

36. resetLayerTransform
Syntax: resetLayerTransform
Purpose: Resets currently selected layer transform to identity.

37. getLayerTransform
Syntax: getLayerTransform
Purpose: Emits the currently selected layer transform.

38. setGroupPosition x y z
Syntax: setGroupPosition 0.0 0.0 0.0
Purpose: Sets position transform for the currently selected group.

39. setGroupRotation x y z
Syntax: setGroupRotation 0 0 45
Purpose: Sets rotation transform (degrees) for the currently selected group.

40. setGroupScale x y z
Syntax: setGroupScale 1 1 1
Purpose: Sets scale transform for the currently selected group.

41. setGroupTransform px py pz rx ry rz sx sy sz
Syntax: setGroupTransform 0 0 0 0 0 0 1 1 1
Purpose: Sets full transform for the currently selected group.

42. resetGroupTransform
Syntax: resetGroupTransform
Purpose: Resets currently selected group transform to identity.

43. getGroupTransform
Syntax: getGroupTransform
Purpose: Emits the currently selected group transform.

44. reportTransforms
Syntax: reportTransforms
Purpose: Emits all layer/group transforms in a table-style stream.

45. resetAllTransforms
Syntax: resetAllTransforms
Purpose: Resets all current layer/group transforms to identity.

Important usage notes:
1. targetType must be layer, group, or line.
2. Layer ids are a1, a2, a3...
3. Group ids are g1, g2, g3...
4. For line visibility commands, pass a numeric line id.
5. User must assign a pathName before saving or loading pools and views.
   The pathName is used as the storage folder for all pool and view files.
6. User must assign a poolId before saving or loading views. 
   The poolId is used to link view files to a specific pool.
7. User must assign a viewId before saving or loading views. 
   The viewId is used to identify a specific view file for a given pool.
8. Scale values for transform commands must be non-zero finite numbers.
*/

"use strict";
autowatch = 1;
inlets = 1;
outlets = 1;

const RANDOMS_PER_POINT = 9;

const DEFAULT_LAYER_COUNT_RANGE = { min: 1, max: 4 };
const DEFAULT_GROUPS_PER_LAYER_RANGE = { min: 1, max: 5 };
const DEFAULT_LINES_PER_GROUP_RANGE = { min: 1, max: 1000 };

// declare variable for randomPool. This will hold the frozen random values and coordinates for line generation.
let randomPool = null;
// declare array for pointOrder. This array will be shuffled to create random line pairings.
let pointOrder = [];
// declare array for lineDefinitions. This array will hold the start and end point indices for each line.
let lineDefinitions = [];
// declare array for lines. This array will hold the final line objects with coordinates, color, width, and visibility.
// The line data structure is in the form of { id, start_coords, end_coords, color, line_width, visible }.
let lines = [];
let selectedFormName = "cube";
let hierarchy = null;
// declare variables for selected layer, group, and line ids. These will be used to track the current selection in the menus.
let selectedLayerId = null;
let selectedGroupId = null;
let selectedLineId = null;
let pathName = "unset";
let currentPoolId = null;
let loadedIndexData = null;
let loadedIndexPath = "";
let layerTransformsById = {};
let groupTransformsById = {};
// declare a cache object for named objects. This will be used to store references to Max objects by name for faster access.
const namedObjectCache = {};
// declare a configuration object for hierarchy ranges. This will hold the min and max values for layer count, groups per layer, and lines per group.
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

function twoDigitTime(value) {
  return value < 10 ? "0" + value : String(value);
}

function currentTimeStampHms() {
  const now = new Date();
  const hours = twoDigitTime(now.getHours());
  const minutes = twoDigitTime(now.getMinutes());
  const seconds = twoDigitTime(now.getSeconds());
  return hours + "-" + minutes + "-" + seconds;
}

function currentDateStampYmd() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = twoDigitTime(now.getMonth() + 1);
  const day = twoDigitTime(now.getDate());
  return year + "-" + month + "-" + day;
}

function joinPath(folderPath, fileName) {
  if (!folderPath || folderPath.length === 0) {
    return fileName;
  }

  const lastCharacter = folderPath.charAt(folderPath.length - 1);
  if (lastCharacter === "/" || lastCharacter === "\\") {
    return folderPath + fileName;
  }

  return folderPath + "/" + fileName;
}

function readTextFile(fullPath) {
  const file = new File(fullPath);
  if (!file || !file.isopen) {
    return null;
  }

  let content = "";
  const chunkSize = 8192;

  while (file.position < file.eof) {
    const remaining = file.eof - file.position;
    const size = remaining > chunkSize ? chunkSize : remaining;
    content += file.readstring(size);
  }

  file.close();
  return content;
}

function writeTextFileChunked(fullPath, contentText) {
  const file = new File(fullPath, "write", "TEXT");
  if (!file || !file.isopen) {
    return false;
  }

  const text = String(contentText || "");
  const chunkSize = 8192;

  for (let i = 0; i < text.length; i += chunkSize) {
    file.writestring(text.slice(i, i + chunkSize));
  }

  file.close();
  return true;
}

function cloneJsonSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function poolChecksumFromRandomValues(randomValues) {
  let hash = 2166136261;

  for (let i = 0; i < randomValues.length; i += 1) {
    const token = String(randomValues[i]);
    for (let j = 0; j < token.length; j += 1) {
      hash ^= token.charCodeAt(j);
      hash = (hash * 16777619) >>> 0;
    }
    hash ^= 124;
    hash = (hash * 16777619) >>> 0;
  }

  return ("00000000" + hash.toString(16)).slice(-8);
}

function buildRandomPoolFromValues(lineCount, randomValues) {
  const pointCount = pointCountFromLineCount(lineCount);
  const randomCount = randomValues.length;

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
    attributes.a.push(mapToRange(randomValues[cursor], 0.1, 1.0)); //original was 0.25 to 1.0, but changed to 0.1 to 1.0 for more variety
    cursor += 1;

    attributes.line_width.push(mapToRange(randomValues[cursor], 0.005, 10.5)); //original was 0.01 to 0.04, but changed to 0.005 to 0.5 for more variety
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

function isValidLoadedPoolPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.type !== "lineBaseSystem.pool") {
    return false;
  }

  if (!isFinite(Number(payload.line_count)) || !isFinite(Number(payload.point_count)) || !isFinite(Number(payload.random_count))) {
    return false;
  }

  if (!Array.isArray(payload.random_values)) {
    return false;
  }

  const lineCount = Number(payload.line_count);
  const expectedPointCount = pointCountFromLineCount(lineCount);
  const expectedRandomCount = randomCountFromLineCount(lineCount);

  if (Number(payload.randoms_per_point) !== RANDOMS_PER_POINT) {
    return false;
  }

  if (Number(payload.point_count) !== expectedPointCount) {
    return false;
  }

  if (Number(payload.random_count) !== expectedRandomCount) {
    return false;
  }

  if (payload.random_values.length !== expectedRandomCount) {
    return false;
  }

  for (let i = 0; i < payload.random_values.length; i += 1) {
    if (!isFinite(Number(payload.random_values[i]))) {
      return false;
    }
  }

  if (typeof payload.checksum !== "string" || payload.checksum.length === 0) {
    return false;
  }

  return true;
}

function isValidPointOrderForPool(order, pointCount) {
  if (!Array.isArray(order) || order.length !== pointCount) {
    return false;
  }

  const seen = {};
  for (let i = 0; i < order.length; i += 1) {
    const value = Number(order[i]);
    if (!isFinite(value)) {
      return false;
    }

    const index = Math.floor(value);
    if (index !== value || index < 0 || index >= pointCount) {
      return false;
    }

    if (seen[index]) {
      return false;
    }
    seen[index] = true;
  }

  return true;
}

function isValidTransformVector3(values, positiveOnly) {
  if (!Array.isArray(values) || values.length !== 3) {
    return false;
  }

  for (let i = 0; i < 3; i += 1) {
    const numeric = Number(values[i]);
    if (!isFinite(numeric)) {
      return false;
    }
    if (positiveOnly && numeric === 0) {
      return false;
    }
  }

  return true;
}

function isValidTransformEntry(entry, requireLayerId) {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  if (requireLayerId && (typeof entry.layer_id !== "string" || entry.layer_id.length === 0)) {
    return false;
  }

  if (!isValidTransformVector3(entry.position, false)) {
    return false;
  }

  if (!isValidTransformVector3(entry.rotation, false)) {
    return false;
  }

  if (!isValidTransformVector3(entry.scale, true)) {
    return false;
  }

  return true;
}

function isValidLoadedViewPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.type !== "lineBaseSystem.view") {
    return false;
  }

  if (typeof payload.view_id !== "string" || payload.view_id.length === 0) {
    return false;
  }

  if (typeof payload.pool_id !== "string" || payload.pool_id.length === 0) {
    return false;
  }

  if (payload.form !== "cube" && payload.form !== "sphere") {
    return false;
  }

  if (!payload.hierarchy || !Array.isArray(payload.hierarchy.layers) || !Array.isArray(payload.hierarchy.groups) || !Array.isArray(payload.hierarchy.ordered_line_ids)) {
    return false;
  }

  if (!payload.hierarchy_ranges || !payload.hierarchy_ranges.layerCount || !payload.hierarchy_ranges.groupsPerLayer || !payload.hierarchy_ranges.linesPerGroup) {
    return false;
  }

  if (!payload.visibility || !payload.selection) {
    return false;
  }

  if (!Array.isArray(payload.point_order)) {
    return false;
  }

  if (typeof payload.colors_by_line_id !== "undefined") {
    if (!payload.colors_by_line_id || typeof payload.colors_by_line_id !== "object") {
      return false;
    }

    const colorKeys = Object.keys(payload.colors_by_line_id);
    for (let i = 0; i < colorKeys.length; i += 1) {
      const value = payload.colors_by_line_id[colorKeys[i]];
      if (
        !Array.isArray(value) ||
        value.length !== 4 ||
        !isFinite(Number(value[0])) ||
        !isFinite(Number(value[1])) ||
        !isFinite(Number(value[2])) ||
        !isFinite(Number(value[3]))
      ) {
        return false;
      }
    }
  }

  if (typeof payload.line_width_by_line_id !== "undefined") {
    if (!payload.line_width_by_line_id || typeof payload.line_width_by_line_id !== "object") {
      return false;
    }

    const widthKeys = Object.keys(payload.line_width_by_line_id);
    for (let i = 0; i < widthKeys.length; i += 1) {
      if (!isFinite(Number(payload.line_width_by_line_id[widthKeys[i]]))) {
        return false;
      }
    }
  }

  if (typeof payload.transform_version !== "undefined") {
    const transformVersion = Number(payload.transform_version);
    if (!isFinite(transformVersion) || Math.floor(transformVersion) !== transformVersion || transformVersion < 1) {
      return false;
    }
  }

  if (typeof payload.layer_transforms_by_id !== "undefined") {
    if (!payload.layer_transforms_by_id || typeof payload.layer_transforms_by_id !== "object") {
      return false;
    }

    const layerTransformKeys = Object.keys(payload.layer_transforms_by_id);
    for (let i = 0; i < layerTransformKeys.length; i += 1) {
      const key = layerTransformKeys[i];
      if (!isValidTransformEntry(payload.layer_transforms_by_id[key], false)) {
        return false;
      }
    }
  }

  if (typeof payload.group_transforms_by_id !== "undefined") {
    if (!payload.group_transforms_by_id || typeof payload.group_transforms_by_id !== "object") {
      return false;
    }

    const groupTransformKeys = Object.keys(payload.group_transforms_by_id);
    for (let i = 0; i < groupTransformKeys.length; i += 1) {
      const key = groupTransformKeys[i];
      if (!isValidTransformEntry(payload.group_transforms_by_id[key], true)) {
        return false;
      }
    }
  }

  return true;
}

function isValidLoadedIndexPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.type !== "lineBaseSystem.index") {
    return false;
  }

  if (!Array.isArray(payload.pools)) {
    return false;
  }

  for (let i = 0; i < payload.pools.length; i += 1) {
    const pool = payload.pools[i];
    if (!pool || typeof pool !== "object") {
      return false;
    }

    if (typeof pool.pool_id !== "string" || pool.pool_id.length === 0) {
      return false;
    }

    if (!Array.isArray(pool.views)) {
      return false;
    }

    for (let j = 0; j < pool.views.length; j += 1) {
      const view = pool.views[j];
      if (!view || typeof view !== "object") {
        return false;
      }

      if (typeof view.view_id !== "string" || view.view_id.length === 0) {
        return false;
      }
    }
  }

  return true;
}

function applyVisibilityState(visibilityState) {
  if (!visibilityState || typeof visibilityState !== "object") {
    return;
  }

  if (visibilityState.layers && typeof visibilityState.layers === "object") {
    const layerKeys = Object.keys(visibilityState.layers);
    for (let i = 0; i < layerKeys.length; i += 1) {
      const key = layerKeys[i];
      setLayerVisible(key, !!visibilityState.layers[key]);
    }
  }

  if (visibilityState.groups && typeof visibilityState.groups === "object") {
    const groupKeys = Object.keys(visibilityState.groups);
    for (let i = 0; i < groupKeys.length; i += 1) {
      const key = groupKeys[i];
      setGroupVisible(key, !!visibilityState.groups[key]);
    }
  }

  if (visibilityState.lines && typeof visibilityState.lines === "object") {
    const lineKeys = Object.keys(visibilityState.lines);
    for (let i = 0; i < lineKeys.length; i += 1) {
      const key = lineKeys[i];
      const lineId = Number(key);
      if (isFinite(lineId)) {
        setLineVisible(lineId, !!visibilityState.lines[key]);
      }
    }
  }
}

function captureVisibilityState() {
  const visibilityState = {
    layers: {},
    groups: {},
    lines: {}
  };

  if (hierarchy && Array.isArray(hierarchy.layers)) {
    for (let i = 0; i < hierarchy.layers.length; i += 1) {
      const layer = hierarchy.layers[i];
      visibilityState.layers[layer.layer_id] = layer.visible !== false ? 1 : 0;
    }
  }

  if (hierarchy && Array.isArray(hierarchy.groups)) {
    for (let i = 0; i < hierarchy.groups.length; i += 1) {
      const group = hierarchy.groups[i];
      visibilityState.groups[group.group_id] = group.visible !== false ? 1 : 0;
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    visibilityState.lines[String(line.id)] = line.visible !== false ? 1 : 0;
  }

  return visibilityState;
}

function captureColorState() {
  const colorsByLineId = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const color = Array.isArray(line.color) ? line.color : [];

    if (color.length === 4) {
      colorsByLineId[String(line.id)] = [
        Number(color[0]),
        Number(color[1]),
        Number(color[2]),
        Number(color[3])
      ];
    }
  }

  return colorsByLineId;
}

function applyColorState(colorsByLineId) {
  if (!colorsByLineId || typeof colorsByLineId !== "object") {
    return;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const savedColor = colorsByLineId[String(line.id)];

    if (
      Array.isArray(savedColor) &&
      savedColor.length === 4 &&
      isFinite(Number(savedColor[0])) &&
      isFinite(Number(savedColor[1])) &&
      isFinite(Number(savedColor[2])) &&
      isFinite(Number(savedColor[3]))
    ) {
      line.color = [
        Number(savedColor[0]),
        Number(savedColor[1]),
        Number(savedColor[2]),
        Number(savedColor[3])
      ];
    }
  }
}

function captureLineWidthState() {
  const widthsByLineId = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    widthsByLineId[String(line.id)] = Number(line.line_width);
  }

  return widthsByLineId;
}

function applyLineWidthState(widthsByLineId) {
  if (!widthsByLineId || typeof widthsByLineId !== "object") {
    return;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const savedWidth = Number(widthsByLineId[String(line.id)]);

    if (isFinite(savedWidth)) {
      line.line_width = savedWidth;
    }
  }
}

function createIdentityTransform() {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  };
}

function cloneTransform(transform) {
  return {
    position: [
      Number(transform.position[0]),
      Number(transform.position[1]),
      Number(transform.position[2])
    ],
    rotation: [
      Number(transform.rotation[0]),
      Number(transform.rotation[1]),
      Number(transform.rotation[2])
    ],
    scale: [
      Number(transform.scale[0]),
      Number(transform.scale[1]),
      Number(transform.scale[2])
    ]
  };
}

function normalizeTransform(transform, fallbackLayerId) {
  const identity = createIdentityTransform();
  const source = transform && typeof transform === "object" ? transform : identity;

  const position = isValidTransformVector3(source.position, false)
    ? [Number(source.position[0]), Number(source.position[1]), Number(source.position[2])]
    : identity.position.slice();

  const rotation = isValidTransformVector3(source.rotation, false)
    ? [Number(source.rotation[0]), Number(source.rotation[1]), Number(source.rotation[2])]
    : identity.rotation.slice();

  const scale = isValidTransformVector3(source.scale, true)
    ? [Number(source.scale[0]), Number(source.scale[1]), Number(source.scale[2])]
    : identity.scale.slice();

  const normalized = {
    position,
    rotation,
    scale
  };

  if (typeof fallbackLayerId !== "undefined") {
    normalized.layer_id = typeof source.layer_id === "string" && source.layer_id.length > 0
      ? source.layer_id
      : fallbackLayerId;
  }

  return normalized;
}

function ensureLayerTransform(layerId) {
  const key = String(layerId || "");
  if (key.length === 0) {
    return null;
  }

  if (!layerTransformsById[key]) {
    layerTransformsById[key] = createIdentityTransform();
  }

  layerTransformsById[key] = normalizeTransform(layerTransformsById[key]);
  return layerTransformsById[key];
}

function ensureGroupTransform(groupId, layerId) {
  const key = String(groupId || "");
  if (key.length === 0) {
    return null;
  }

  if (!groupTransformsById[key]) {
    groupTransformsById[key] = createIdentityTransform();
  }

  groupTransformsById[key] = normalizeTransform(groupTransformsById[key], layerId);
  groupTransformsById[key].layer_id = layerId;
  return groupTransformsById[key];
}

function reconcileTransformState() {
  if (!hierarchy || !Array.isArray(hierarchy.layers) || !Array.isArray(hierarchy.groups)) {
    layerTransformsById = {};
    groupTransformsById = {};
    return;
  }

  const nextLayerTransforms = {};
  const nextGroupTransforms = {};

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    const layer = hierarchy.layers[i];
    if (!layer || typeof layer.layer_id !== "string") {
      continue;
    }

    const layerId = layer.layer_id;
    nextLayerTransforms[layerId] = normalizeTransform(layerTransformsById[layerId]);
  }

  for (let i = 0; i < hierarchy.groups.length; i += 1) {
    const group = hierarchy.groups[i];
    if (!group || typeof group.group_id !== "string") {
      continue;
    }

    const groupId = group.group_id;
    const layerId = typeof group.layer_id === "string" ? group.layer_id : "";
    nextGroupTransforms[groupId] = normalizeTransform(groupTransformsById[groupId], layerId);
    nextGroupTransforms[groupId].layer_id = layerId;
  }

  layerTransformsById = nextLayerTransforms;
  groupTransformsById = nextGroupTransforms;
}

function captureLayerTransformState() {
  const output = {};
  const keys = Object.keys(layerTransformsById || {});

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    output[key] = cloneTransform(normalizeTransform(layerTransformsById[key]));
  }

  return output;
}

function captureGroupTransformState() {
  const output = {};
  const keys = Object.keys(groupTransformsById || {});

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const source = groupTransformsById[key] || createIdentityTransform();
    const layerId = typeof source.layer_id === "string" ? source.layer_id : "";
    const normalized = normalizeTransform(source, layerId);

    output[key] = {
      layer_id: normalized.layer_id,
      position: normalized.position.slice(),
      rotation: normalized.rotation.slice(),
      scale: normalized.scale.slice()
    };
  }

  return output;
}

function applyLayerTransformState(stateById) {
  if (!stateById || typeof stateById !== "object") {
    return;
  }

  const keys = Object.keys(stateById);
  for (let i = 0; i < keys.length; i += 1) {
    const layerId = keys[i];
    if (!layerTransformsById[layerId]) {
      continue;
    }

    if (isValidTransformEntry(stateById[layerId], false)) {
      layerTransformsById[layerId] = normalizeTransform(stateById[layerId]);
    }
  }
}

function applyGroupTransformState(stateById) {
  if (!stateById || typeof stateById !== "object") {
    return;
  }

  const keys = Object.keys(stateById);
  for (let i = 0; i < keys.length; i += 1) {
    const groupId = keys[i];
    if (!groupTransformsById[groupId]) {
      continue;
    }

    if (isValidTransformEntry(stateById[groupId], true)) {
      const source = stateById[groupId];
      const normalized = normalizeTransform(source, source.layer_id);
      normalized.layer_id = groupTransformsById[groupId].layer_id;
      groupTransformsById[groupId] = normalized;
    }
  }
}

function degreesToRadians(degrees) {
  return Number(degrees) * (Math.PI / 180);
}

function applyTransformToPoint(point, transform) {
  if (!Array.isArray(point) || point.length !== 3 || !transform) {
    return point;
  }

  let x = Number(point[0]) * Number(transform.scale[0]);
  let y = Number(point[1]) * Number(transform.scale[1]);
  let z = Number(point[2]) * Number(transform.scale[2]);

  const rz = degreesToRadians(transform.rotation[2]);
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const xz = x * cosZ - y * sinZ;
  const yz = x * sinZ + y * cosZ;
  x = xz;
  y = yz;

  const ry = degreesToRadians(transform.rotation[1]);
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const xy = x * cosY + z * sinY;
  const zy = -x * sinY + z * cosY;
  x = xy;
  z = zy;

  const rx = degreesToRadians(transform.rotation[0]);
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const yx = y * cosX - z * sinX;
  const zx = y * sinX + z * cosX;
  y = yx;
  z = zx;

  return [
    x + Number(transform.position[0]),
    y + Number(transform.position[1]),
    z + Number(transform.position[2])
  ];
}

function transformedLineEndpoint(line, point) {
  if (!line || !Array.isArray(point) || point.length !== 3) {
    return point;
  }

  let transformed = point.slice();

  const group = getHierarchyGroupById(line.group_id);
  const groupTransform = group && groupTransformsById[group.group_id]
    ? normalizeTransform(groupTransformsById[group.group_id], group.layer_id)
    : null;
  if (groupTransform) {
    transformed = applyTransformToPoint(transformed, groupTransform);
  }

  const layerId = group && typeof group.layer_id === "string"
    ? group.layer_id
    : line.layer_id;
  const layerTransform = layerId && layerTransformsById[layerId]
    ? normalizeTransform(layerTransformsById[layerId])
    : null;
  if (layerTransform) {
    transformed = applyTransformToPoint(transformed, layerTransform);
  }

  return transformed;
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
      base_start_coords: startCoords.slice(),
      base_end_coords: endCoords.slice(),
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
  // pushes sequential line ids into an array and returns it. This is used to create a list of line ids for hierarchy generation.
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

  return null;
}

function getCachedNamedObject(objectName, forceRefresh) {
  if (!forceRefresh && namedObjectCache[objectName] && typeof namedObjectCache[objectName].message === "function") {
    return namedObjectCache[objectName];
  }

  const namedObject = getNamedObject(objectName);
  if (namedObject && typeof namedObject.message === "function") {
    namedObjectCache[objectName] = namedObject;
    return namedObject;
  }

  namedObjectCache[objectName] = null;
  return null;
}

function sendNamedObjectMessage(objectName, messageName, value) {
  let namedObject = getCachedNamedObject(objectName, false);

  if (!namedObject) {
    return false;
  }

  function deliver(target) {
    if (typeof value === "undefined") {
      target.message(messageName);
    } else {
      target.message(messageName, value);
    }
  }

  try {
    deliver(namedObject);
    return true;
  } catch (error) {
    namedObjectCache[objectName] = null;
  }

  namedObject = getCachedNamedObject(objectName, true);

  if (namedObject && typeof namedObject.message === "function") {
    try {
      deliver(namedObject);
      return true;
    } catch (error) {
      namedObjectCache[objectName] = null;
    }
  }

  return false;
}

function clearNamedMenu(objectName) {
  return sendNamedObjectMessage(objectName, "clear");
}

function clearAllMenus() {
  const clearedA = clearNamedMenu("aMen");
  const clearedG = clearNamedMenu("gMen");
  const clearedL = clearNamedMenu("lMen");

  if (!clearedA) {
    log("clearAllMenus: could not reach aMen");
  }
  if (!clearedG) {
    log("clearAllMenus: could not reach gMen");
  }
  if (!clearedL) {
    log("clearAllMenus: could not reach lMen");
  }

  return clearedA && clearedG && clearedL;
}

function appendNamedMenuItem(objectName, itemValue) {
  return sendNamedObjectMessage(objectName, "append", itemValue);
}

function setNamedMenuSelection(objectName, selectionValue) {
  if (selectionValue === null || typeof selectionValue === "undefined") {
    return false;
  }

  return sendNamedObjectMessage(objectName, "set", selectionValue);
}

function currentSelectionValue(value) {
  if (value === null || typeof value === "undefined") {
    return "none";
  }

  return value;
}

function emitCurrentSelection() {
  outlet(0, "current_layer", currentSelectionValue(selectedLayerId));
  outlet(0, "current_group", currentSelectionValue(selectedGroupId));
  outlet(0, "current_line", currentSelectionValue(selectedLineId));
}

function resolveMenuSelection(selectionValue, values) {
  if (!values || values.length === 0) {
    return null;
  }

  if (typeof selectionValue === "undefined" || selectionValue === null || selectionValue === "") {
    return values[0];
  }

  const selectionText = String(selectionValue);

  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === selectionValue) {
      return values[i];
    }
  }

  for (let i = 0; i < values.length; i += 1) {
    if (String(values[i]) === selectionText) {
      return values[i];
    }
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
    emitCurrentSelection();
    return;
  }

  if (!hierarchy || !selectedGroupId) {
    selectedLineId = null;
    emitCurrentSelection();
    return;
  }

  const group = getHierarchyGroupById(selectedGroupId);
  if (!group || !group.line_ids || group.line_ids.length === 0) {
    selectedLineId = null;
    emitCurrentSelection();
    return;
  }

  for (let i = 0; i < group.line_ids.length; i += 1) {
    if (!appendNamedMenuItem("lMen", group.line_ids[i])) {
      log("emitLineMenu: append failed for lMen item " + group.line_ids[i]);
    }
  }

  selectedLineId = group.line_ids[0];
  setNamedMenuSelection("lMen", selectedLineId);
  emitCurrentSelection();
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
    if (!appendNamedMenuItem("gMen", groupsInLayer[i].group_id)) {
      log("emitGroupMenu: append failed for gMen item " + groupsInLayer[i].group_id);
    }
  }

  if (groupsInLayer.length > 0) {
    selectedGroupId = groupsInLayer[0].group_id;
    setNamedMenuSelection("gMen", selectedGroupId);
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
    if (!appendNamedMenuItem("aMen", hierarchy.layers[i].layer_id)) {
      log("emitLayerMenu: append failed for aMen item " + hierarchy.layers[i].layer_id);
    }
  }

  if (hierarchy.layers.length > 0) {
    selectedLayerId = hierarchy.layers[0].layer_id;
    setNamedMenuSelection("aMen", selectedLayerId);
  } else {
    selectedLayerId = null;
  }

  emitGroupMenu();
}

function buildHierarchyFromCurrentLines() {
  if (!lines || lines.length === 0) {
    hierarchy = null;
    reconcileTransformState();
    emitLayerMenu();
    architecture();
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

  reconcileTransformState();

  emitLayerMenu();
  architecture();
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
    emitCurrentSelection();
    return;
  }

  const group = getHierarchyGroupById(selectedGroupId);
  if (!group || !group.line_ids || group.line_ids.length === 0) {
    log("selectLine requires selected group with lines");
    emitCurrentSelection();
    return;
  }

  selectedLineId = resolveMenuSelection(selectionValue, group.line_ids);
  emitCurrentSelection();
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

    const baseStart = Array.isArray(line.base_start_coords) ? line.base_start_coords : line.start_coords;
    const baseEnd = Array.isArray(line.base_end_coords) ? line.base_end_coords : line.end_coords;
    const drawStart = transformedLineEndpoint(line, baseStart);
    const drawEnd = transformedLineEndpoint(line, baseEnd);

    outlet(0, "sketch", "glcolor", line.color[0], line.color[1], line.color[2], line.color[3]);
    outlet(0, "sketch", "gllinewidth", sketchWidth(line.line_width));
    outlet(0, "sketch", "moveto", drawStart[0], drawStart[1], drawStart[2]);
    outlet(0, "sketch", "lineto", drawEnd[0], drawEnd[1], drawEnd[2]);
  }

  outlet(0, "sketch", "draw");
  outlet(0, "sketch", "drawimmediate");
  outlet(0, "rendered", lines.length);
}

function architecture() {
  const layerCount = hierarchy && hierarchy.layers ? hierarchy.layers.length : 0;
  const groupCount = hierarchy && hierarchy.groups ? hierarchy.groups.length : 0;
  const lineCount = lines ? lines.length : 0;

  outlet(0, "architecture", layerCount, groupCount, lineCount);
}

function reportArchitectureRows() {
  if (!hierarchy || !Array.isArray(hierarchy.layers) || !Array.isArray(hierarchy.groups)) {
    log("reportArchitectureRows requires generated data");
    return;
  }

  let rowCount = 0;
  outlet(0, "architecture_rows_begin");

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    const layer = hierarchy.layers[i];
    const groupIds = Array.isArray(layer.group_ids) ? layer.group_ids : [];
    const layerNumber = parseInt(String(layer.layer_id || "").replace(/^a/i, ""), 10);

    for (let j = 0; j < groupIds.length; j += 1) {
      const group = getHierarchyGroupById(groupIds[j]);
      if (!group || !Array.isArray(group.line_ids)) {
        continue;
      }

      const groupNumber = parseInt(String(group.group_id || "").replace(/^g/i, ""), 10);

      for (let k = 0; k < group.line_ids.length; k += 1) {
        const lineId = group.line_ids[k];
        const line = getLineById(lineId);

        outlet(
          0,
          "architecture_row",
          layerNumber,
          groupNumber,
          lineId,
          layer.visible ? 1 : 0,
          group.visible ? 1 : 0,
          line && line.visible !== false ? 1 : 0
        );

        rowCount += 1;
      }
    }
  }

  outlet(0, "architecture_rows_end", rowCount);
}

function set_pathName(nameValue) {
  const resolvedName = String(nameValue || "").trim();

  if (resolvedName.length === 0) {
    log("set_pathName requires a non-empty name");
    return;
  }

  pathName = resolvedName;
}

function get_pathName() {
  outlet(0, "pathName", pathName);
}

function get_poolId() {
  outlet(0, "pool_id", currentPoolId || "");
}

function set_poolId(poolId) {
  const resolvedPoolId = String(poolId || "").trim();
  if (resolvedPoolId.length === 0) {
    log("set_poolId requires a non-empty poolId");
    return;
  }

  currentPoolId = resolvedPoolId;
  outlet(0, "pool_id", currentPoolId);
}

function rebuild_from_loaded_pool() {
  if (!randomPool) {
    log("rebuild_from_loaded_pool requires loaded pool data");
    return;
  }

  pointOrder = createPointOrder(randomPool.point_count);
  rebuildSystemFromCurrentState();
  emitRenderCommands();

  outlet(0, "rebuilt_from_loaded_pool", currentPoolId || "", randomPool.line_count);
}

function list_views_for_pool(poolId) {
  const resolvedPoolId = String(poolId || "").trim();
  if (resolvedPoolId.length === 0) {
    log("list_views_for_pool requires a non-empty poolId");
    return;
  }

  const targetPath = String(pathName || "").trim();
  if (targetPath.length === 0 || targetPath === "unset") {
    log("list_views_for_pool requires pathName to be set");
    return;
  }

  if (loadedIndexData && loadedIndexData.path_name === targetPath && Array.isArray(loadedIndexData.pools)) {
    let indexedPool = null;

    for (let i = 0; i < loadedIndexData.pools.length; i += 1) {
      if (loadedIndexData.pools[i].pool_id === resolvedPoolId) {
        indexedPool = loadedIndexData.pools[i];
        break;
      }
    }

    const indexedViews = indexedPool && Array.isArray(indexedPool.views) ? indexedPool.views.slice() : [];

    indexedViews.sort(function(a, b) {
      const aViewId = typeof a.view_id === "string" ? a.view_id : "";
      const bViewId = typeof b.view_id === "string" ? b.view_id : "";
      if (aViewId < bViewId) {
        return -1;
      }
      if (aViewId > bViewId) {
        return 1;
      }

      const aSavedAt = typeof a.saved_at === "string" ? a.saved_at : "";
      const bSavedAt = typeof b.saved_at === "string" ? b.saved_at : "";
      if (aSavedAt < bSavedAt) {
        return -1;
      }
      if (aSavedAt > bSavedAt) {
        return 1;
      }

      const aPath = typeof a.view_file === "string" ? a.view_file : "";
      const bPath = typeof b.view_file === "string" ? b.view_file : "";
      if (aPath < bPath) {
        return -1;
      }
      if (aPath > bPath) {
        return 1;
      }

      return 0;
    });

    outlet(0, "views_begin", resolvedPoolId, indexedViews.length);

    for (let i = 0; i < indexedViews.length; i += 1) {
      const item = indexedViews[i];
      const savedAt = typeof item.saved_at === "string" ? item.saved_at : "";
      const viewFile = typeof item.view_file === "string" ? item.view_file : "";
      const viewId = typeof item.view_id === "string" ? item.view_id : "";
      outlet(0, "view_item", resolvedPoolId, viewId, viewFile, savedAt);
    }

    outlet(0, "views_end", resolvedPoolId, indexedViews.length);
    return;
  }

  let folder;
  try {
    folder = new Folder(targetPath);
  } catch (error) {
    log("list_views_for_pool could not open folder: " + targetPath);
    return;
  }

  if (!folder) {
    log("list_views_for_pool could not open folder: " + targetPath);
    return;
  }

  const matches = [];
  let safetyCounter = 0;
  const maxEntries = 100000;

  while (!folder.end && safetyCounter < maxEntries) {
    const fileName = String(folder.filename || "");
    const lowerName = fileName.toLowerCase();
    const isViewJson =
      fileName !== "." &&
      fileName !== ".." &&
      lowerName.indexOf("view_") === 0 &&
      lowerName.slice(-5) === ".json";

    if (isViewJson) {
      const fullPath = joinPath(targetPath, fileName);
      const rawText = readTextFile(fullPath);

      if (rawText !== null) {
        try {
          const payload = JSON.parse(rawText);
          const isValidView =
            payload &&
            payload.type === "lineBaseSystem.view" &&
            payload.pool_id === resolvedPoolId;

          if (isValidView) {
            const savedAt = typeof payload.saved_at === "string" ? payload.saved_at : "";
            const viewId =
              typeof payload.view_id === "string" && payload.view_id.length > 0
                ? payload.view_id
                : fileName.replace(/^view_/i, "").replace(/\.json$/i, "");

            matches.push({
              view_id: viewId,
              full_path: fullPath,
              saved_at: savedAt
            });
          }
        } catch (error) {
          // Ignore malformed files while scanning for valid view payloads.
        }
      }
    }

    folder.next();
    safetyCounter += 1;
  }

  if (typeof folder.close === "function") {
    folder.close();
  }

  matches.sort(function(a, b) {
    if (a.view_id < b.view_id) {
      return -1;
    }
    if (a.view_id > b.view_id) {
      return 1;
    }

    if (a.saved_at < b.saved_at) {
      return -1;
    }
    if (a.saved_at > b.saved_at) {
      return 1;
    }

    if (a.full_path < b.full_path) {
      return -1;
    }
    if (a.full_path > b.full_path) {
      return 1;
    }

    return 0;
  });

  outlet(0, "views_begin", resolvedPoolId, matches.length);

  for (let i = 0; i < matches.length; i += 1) {
    const item = matches[i];
    outlet(0, "view_item", resolvedPoolId, item.view_id, item.full_path, item.saved_at);
  }

  outlet(0, "views_end", resolvedPoolId, matches.length);
}

function save_index() {
  const targetPath = String(pathName || "").trim();
  if (targetPath.length === 0 || targetPath === "unset") {
    log("save_index requires pathName to be set");
    return;
  }

  let folder;
  try {
    folder = new Folder(targetPath);
  } catch (error) {
    log("save_index could not open folder: " + targetPath);
    return;
  }

  if (!folder) {
    log("save_index could not open folder: " + targetPath);
    return;
  }

  const poolsById = {};
  const viewsByPoolId = {};
  let totalViewCount = 0;
  let safetyCounter = 0;
  const maxEntries = 100000;

  while (!folder.end && safetyCounter < maxEntries) {
    const fileName = String(folder.filename || "");
    const lowerName = fileName.toLowerCase();
    const isJsonFile =
      fileName !== "." &&
      fileName !== ".." &&
      lowerName.slice(-5) === ".json";

    if (isJsonFile) {
      const fullPath = joinPath(targetPath, fileName);
      const rawText = readTextFile(fullPath);

      if (rawText !== null) {
        let payload = null;
        try {
          payload = JSON.parse(rawText);
        } catch (error) {
          payload = null;
        }

        if (payload && payload.type === "lineBaseSystem.pool") {
          const poolId = typeof payload.pool_id === "string" ? payload.pool_id : "";
          if (poolId.length > 0 && isValidLoadedPoolPayload(payload)) {
            if (!poolsById[poolId]) {
              poolsById[poolId] = {
                pool_id: poolId,
                pool_file: fullPath,
                created_at: typeof payload.created_at === "string" ? payload.created_at : "",
                line_count: Number(payload.line_count),
                point_count: Number(payload.point_count),
                random_count: Number(payload.random_count)
              };
            } else if (fullPath < poolsById[poolId].pool_file) {
              poolsById[poolId].pool_file = fullPath;
            }
          }
        } else if (payload && payload.type === "lineBaseSystem.view") {
          const poolId = typeof payload.pool_id === "string" ? payload.pool_id : "";
          if (poolId.length > 0) {
            if (!viewsByPoolId[poolId]) {
              viewsByPoolId[poolId] = [];
            }

            const viewId =
              typeof payload.view_id === "string" && payload.view_id.length > 0
                ? payload.view_id
                : fileName.replace(/^view_/i, "").replace(/\.json$/i, "");

            viewsByPoolId[poolId].push({
              view_id: viewId,
              view_file: fullPath,
              saved_at: typeof payload.saved_at === "string" ? payload.saved_at : ""
            });
            totalViewCount += 1;
          }
        }
      }
    }

    folder.next();
    safetyCounter += 1;
  }

  if (typeof folder.close === "function") {
    folder.close();
  }

  const poolIdsByFile = Object.keys(poolsById);
  const poolIdsByView = Object.keys(viewsByPoolId);
  const poolIdLookup = {};

  for (let i = 0; i < poolIdsByFile.length; i += 1) {
    poolIdLookup[poolIdsByFile[i]] = true;
  }
  for (let i = 0; i < poolIdsByView.length; i += 1) {
    poolIdLookup[poolIdsByView[i]] = true;
  }

  const allPoolIds = Object.keys(poolIdLookup).sort();
  const pools = [];

  for (let i = 0; i < allPoolIds.length; i += 1) {
    const poolId = allPoolIds[i];
    const poolMeta = poolsById[poolId] || null;
    const viewItems = viewsByPoolId[poolId] ? viewsByPoolId[poolId].slice() : [];

    viewItems.sort(function(a, b) {
      if (a.view_id < b.view_id) {
        return -1;
      }
      if (a.view_id > b.view_id) {
        return 1;
      }

      if (a.saved_at < b.saved_at) {
        return -1;
      }
      if (a.saved_at > b.saved_at) {
        return 1;
      }

      if (a.view_file < b.view_file) {
        return -1;
      }
      if (a.view_file > b.view_file) {
        return 1;
      }

      return 0;
    });

    pools.push({
      pool_id: poolId,
      pool_file: poolMeta ? poolMeta.pool_file : "",
      created_at: poolMeta ? poolMeta.created_at : "",
      line_count: poolMeta ? poolMeta.line_count : null,
      point_count: poolMeta ? poolMeta.point_count : null,
      random_count: poolMeta ? poolMeta.random_count : null,
      view_count: viewItems.length,
      views: viewItems
    });
  }

  const indexPayload = {
    type: "lineBaseSystem.index",
    version: 1,
    saved_at: new Date().toISOString(),
    path_name: targetPath,
    pool_count: pools.length,
    view_count: totalViewCount,
    pools: pools
  };

  const indexPath = joinPath(targetPath, "pools_index.json");
  const serialized = JSON.stringify(indexPayload, null, 2);
  const didWrite = writeTextFileChunked(indexPath, serialized);
  if (!didWrite) {
    log("save_index could not open file: " + indexPath);
    return;
  }

  loadedIndexData = indexPayload;
  loadedIndexPath = indexPath;

  outlet(0, "index_saved", indexPath, indexPayload.pool_count, indexPayload.view_count);
}

function load_index() {
  const targetPath = String(pathName || "").trim();
  if (targetPath.length === 0 || targetPath === "unset") {
    log("load_index requires pathName to be set");
    return;
  }

  const indexPath = joinPath(targetPath, "pools_index.json");
  const rawText = readTextFile(indexPath);
  if (rawText === null) {
    log("load_index could not open file: " + indexPath);
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    log("load_index could not parse JSON: " + indexPath);
    return;
  }

  if (!isValidLoadedIndexPayload(parsed)) {
    log("load_index invalid index payload: " + indexPath);
    return;
  }

  parsed.path_name = targetPath;
  loadedIndexData = parsed;
  loadedIndexPath = indexPath;

  const poolCount = Array.isArray(parsed.pools) ? parsed.pools.length : 0;
  let viewCount = 0;
  for (let i = 0; i < poolCount; i += 1) {
    const views = Array.isArray(parsed.pools[i].views) ? parsed.pools[i].views : [];
    viewCount += views.length;
  }

  outlet(0, "index_loaded", loadedIndexPath, poolCount, viewCount);
}

function clear_index_cache() {
  const previousPath = loadedIndexPath || "";
  const hadCache = loadedIndexData ? 1 : 0;

  loadedIndexData = null;
  loadedIndexPath = "";

  outlet(0, "index_cache_cleared", previousPath, hadCache);
}

function register_view(viewId, fullViewFilePath) {
  const resolvedViewId = String(viewId || "").trim();
  if (resolvedViewId.length === 0) {
    log("register_view requires a non-empty viewId");
    return;
  }

  const viewPath = String(fullViewFilePath || "").trim();
  if (viewPath.length === 0) {
    log("register_view requires a full view file path");
    return;
  }

  const targetPath = String(pathName || "").trim();
  if (targetPath.length === 0 || targetPath === "unset") {
    log("register_view requires pathName to be set");
    return;
  }

  const rawViewText = readTextFile(viewPath);
  if (rawViewText === null) {
    log("register_view could not open view file: " + viewPath);
    return;
  }

  let viewPayload;
  try {
    viewPayload = JSON.parse(rawViewText);
  } catch (error) {
    log("register_view could not parse JSON: " + viewPath);
    return;
  }

  if (!isValidLoadedViewPayload(viewPayload)) {
    log("register_view invalid view payload: " + viewPath);
    return;
  }

  const poolId = String(viewPayload.pool_id || "").trim();
  if (poolId.length === 0) {
    log("register_view missing pool_id in view file: " + viewPath);
    return;
  }

  const savedAt = typeof viewPayload.saved_at === "string" ? viewPayload.saved_at : "";
  const indexPath = joinPath(targetPath, "pools_index.json");

  let indexPayload = null;
  if (loadedIndexData && loadedIndexData.path_name === targetPath && Array.isArray(loadedIndexData.pools)) {
    indexPayload = cloneJsonSafe(loadedIndexData);
  } else {
    const rawIndexText = readTextFile(indexPath);
    if (rawIndexText !== null) {
      try {
        const parsedIndex = JSON.parse(rawIndexText);
        if (isValidLoadedIndexPayload(parsedIndex)) {
          indexPayload = parsedIndex;
        }
      } catch (error) {
        indexPayload = null;
      }
    }
  }

  if (!indexPayload) {
    indexPayload = {
      type: "lineBaseSystem.index",
      version: 1,
      saved_at: "",
      path_name: targetPath,
      pool_count: 0,
      view_count: 0,
      pools: []
    };
  }

  indexPayload.path_name = targetPath;

  let poolEntry = null;
  for (let i = 0; i < indexPayload.pools.length; i += 1) {
    if (indexPayload.pools[i].pool_id === poolId) {
      poolEntry = indexPayload.pools[i];
      break;
    }
  }

  if (!poolEntry) {
    poolEntry = {
      pool_id: poolId,
      pool_file: "",
      created_at: "",
      line_count: null,
      point_count: null,
      random_count: null,
      view_count: 0,
      views: []
    };
    indexPayload.pools.push(poolEntry);
  }

  if (!Array.isArray(poolEntry.views)) {
    poolEntry.views = [];
  }

  let updatedExisting = false;
  for (let i = 0; i < poolEntry.views.length; i += 1) {
    const existing = poolEntry.views[i];
    if ((existing && existing.view_id === resolvedViewId) || (existing && existing.view_file === viewPath)) {
      poolEntry.views[i] = {
        view_id: resolvedViewId,
        view_file: viewPath,
        saved_at: savedAt
      };
      updatedExisting = true;
      break;
    }
  }

  if (!updatedExisting) {
    poolEntry.views.push({
      view_id: resolvedViewId,
      view_file: viewPath,
      saved_at: savedAt
    });
  }

  for (let i = 0; i < indexPayload.pools.length; i += 1) {
    const entry = indexPayload.pools[i];
    if (!Array.isArray(entry.views)) {
      entry.views = [];
    }

    entry.views.sort(function(a, b) {
      const aViewId = typeof a.view_id === "string" ? a.view_id : "";
      const bViewId = typeof b.view_id === "string" ? b.view_id : "";
      if (aViewId < bViewId) {
        return -1;
      }
      if (aViewId > bViewId) {
        return 1;
      }

      const aSavedAt = typeof a.saved_at === "string" ? a.saved_at : "";
      const bSavedAt = typeof b.saved_at === "string" ? b.saved_at : "";
      if (aSavedAt < bSavedAt) {
        return -1;
      }
      if (aSavedAt > bSavedAt) {
        return 1;
      }

      const aFile = typeof a.view_file === "string" ? a.view_file : "";
      const bFile = typeof b.view_file === "string" ? b.view_file : "";
      if (aFile < bFile) {
        return -1;
      }
      if (aFile > bFile) {
        return 1;
      }

      return 0;
    });

    entry.view_count = entry.views.length;
  }

  indexPayload.pools.sort(function(a, b) {
    const aPoolId = typeof a.pool_id === "string" ? a.pool_id : "";
    const bPoolId = typeof b.pool_id === "string" ? b.pool_id : "";
    if (aPoolId < bPoolId) {
      return -1;
    }
    if (aPoolId > bPoolId) {
      return 1;
    }
    return 0;
  });

  indexPayload.pool_count = indexPayload.pools.length;
  let totalViewCount = 0;
  for (let i = 0; i < indexPayload.pools.length; i += 1) {
    totalViewCount += Array.isArray(indexPayload.pools[i].views) ? indexPayload.pools[i].views.length : 0;
  }
  indexPayload.view_count = totalViewCount;
  indexPayload.saved_at = new Date().toISOString();

  const serialized = JSON.stringify(indexPayload, null, 2);
  const didWrite = writeTextFileChunked(indexPath, serialized);
  if (!didWrite) {
    log("register_view could not open index file: " + indexPath);
    return;
  }

  loadedIndexData = indexPayload;
  loadedIndexPath = indexPath;

  outlet(0, "view_registered", resolvedViewId, viewPath, poolId, indexPath);
}

function unregister_view(viewId) {
  const resolvedViewId = String(viewId || "").trim();
  if (resolvedViewId.length === 0) {
    log("unregister_view requires a non-empty viewId");
    return;
  }

  const targetPath = String(pathName || "").trim();
  if (targetPath.length === 0 || targetPath === "unset") {
    log("unregister_view requires pathName to be set");
    return;
  }

  const indexPath = joinPath(targetPath, "pools_index.json");
  let indexPayload = null;

  if (loadedIndexData && loadedIndexData.path_name === targetPath && Array.isArray(loadedIndexData.pools)) {
    indexPayload = cloneJsonSafe(loadedIndexData);
  } else {
    const rawIndexText = readTextFile(indexPath);
    if (rawIndexText === null) {
      log("unregister_view could not open index file: " + indexPath);
      return;
    }

    try {
      const parsedIndex = JSON.parse(rawIndexText);
      if (!isValidLoadedIndexPayload(parsedIndex)) {
        log("unregister_view invalid index payload: " + indexPath);
        return;
      }
      indexPayload = parsedIndex;
    } catch (error) {
      log("unregister_view could not parse JSON: " + indexPath);
      return;
    }
  }

  let removedCount = 0;
  indexPayload.path_name = targetPath;

  for (let i = 0; i < indexPayload.pools.length; i += 1) {
    const poolEntry = indexPayload.pools[i];
    const existingViews = Array.isArray(poolEntry.views) ? poolEntry.views : [];
    const filteredViews = [];

    for (let j = 0; j < existingViews.length; j += 1) {
      const viewEntry = existingViews[j];
      if (viewEntry && viewEntry.view_id === resolvedViewId) {
        removedCount += 1;
      } else {
        filteredViews.push(viewEntry);
      }
    }

    poolEntry.views = filteredViews;
    poolEntry.view_count = filteredViews.length;
  }

  indexPayload.pool_count = Array.isArray(indexPayload.pools) ? indexPayload.pools.length : 0;
  let totalViewCount = 0;
  for (let i = 0; i < indexPayload.pools.length; i += 1) {
    totalViewCount += Array.isArray(indexPayload.pools[i].views) ? indexPayload.pools[i].views.length : 0;
  }
  indexPayload.view_count = totalViewCount;
  indexPayload.saved_at = new Date().toISOString();

  const serialized = JSON.stringify(indexPayload, null, 2);
  const didWrite = writeTextFileChunked(indexPath, serialized);
  if (!didWrite) {
    log("unregister_view could not open index file: " + indexPath);
    return;
  }

  loadedIndexData = indexPayload;
  loadedIndexPath = indexPath;

  outlet(0, "view_unregistered", resolvedViewId, removedCount, indexPath);
}

function save_randomPool() {
  if (!randomPool) {
    log("save_randomPool requires generated data");
    return;
  }

  const targetPath = String(pathName || "").trim();
  if (targetPath.length === 0 || targetPath === "unset") {
    log("save_randomPool requires pathName to be set");
    return;
  }

  const timestamp = currentTimeStampHms();
  const dateStamp = currentDateStampYmd();
  const fileName = "randomPool_" + timestamp + ".json";
  const fullPath = joinPath(targetPath, fileName);
  const poolId = "pool_" + dateStamp + "_" + timestamp;
  const sourceRandomValues = randomPool.random_values.slice();

  const payload = {
    type: "lineBaseSystem.pool",
    version: 1,
    pool_id: poolId,
    created_at: new Date().toISOString(),
    randoms_per_point: RANDOMS_PER_POINT,
    line_count: randomPool.line_count,
    point_count: randomPool.point_count,
    random_count: randomPool.random_count,
    random_values: sourceRandomValues,
    checksum: poolChecksumFromRandomValues(sourceRandomValues)
  };

  const serialized = JSON.stringify(payload, null, 2);
  const didWrite = writeTextFileChunked(fullPath, serialized);
  if (!didWrite) {
    log("save_randomPool could not open file: " + fullPath);
    return;
  }

  currentPoolId = payload.pool_id;

  outlet(0, "randomPool_saved", fullPath, payload.pool_id);
}

function load_randomPool(fullFilePath) {
  const sourcePath = String(fullFilePath || "").trim();

  if (sourcePath.length === 0) {
    log("load_randomPool requires a full file path");
    return;
  }

  const rawText = readTextFile(sourcePath);
  if (rawText === null) {
    log("load_randomPool could not open file: " + sourcePath);
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    log("load_randomPool could not parse JSON: " + sourcePath);
    return;
  }

  if (!isValidLoadedPoolPayload(parsed)) {
    log("load_randomPool invalid pool payload: " + sourcePath);
    return;
  }

  const expectedChecksum = poolChecksumFromRandomValues(parsed.random_values);
  if (expectedChecksum !== parsed.checksum) {
    log("load_randomPool checksum mismatch: " + sourcePath);
    return;
  }

  const lineCount = Number(parsed.line_count);
  const sourceRandomValues = parsed.random_values.slice();
  const rebuiltPool = buildRandomPoolFromValues(lineCount, sourceRandomValues);

  randomPool = deepFreezeObject(rebuiltPool);
  if (!verifyPoolIsLocked(randomPool)) {
    log("load_randomPool lock verification failed: " + sourcePath);
    return;
  }

  pointOrder = createPointOrder(randomPool.point_count);
  rebuildSystemFromCurrentState();
  emitRenderCommands();

  currentPoolId = parsed.pool_id;

  outlet(0, "randomPool_loaded", sourcePath, parsed.pool_id, randomPool.line_count);
}

function save_view(viewId) {
  if (!randomPool || !hierarchy) {
    log("save_view requires generated data");
    return;
  }

  if (!currentPoolId) {
    log("save_view requires a loaded/saved pool_id");
    return;
  }

  const targetPath = String(pathName || "").trim();
  if (targetPath.length === 0 || targetPath === "unset") {
    log("save_view requires pathName to be set");
    return;
  }

  const resolvedViewId = String(viewId || "").trim();
  if (resolvedViewId.length === 0) {
    log("save_view requires a non-empty viewId");
    return;
  }

  const fileName = "view_" + resolvedViewId + ".json";
  const fullPath = joinPath(targetPath, fileName);

  const payload = {
    type: "lineBaseSystem.view",
    version: 1,
    transform_version: 1,
    view_id: resolvedViewId,
    pool_id: currentPoolId,
    saved_at: new Date().toISOString(),
    form: selectedFormName,
    point_order: pointOrder.slice(),
    hierarchy: cloneJsonSafe(hierarchy),
    hierarchy_ranges: cloneJsonSafe(hierarchyRangeConfig),
    visibility: captureVisibilityState(),
    colors_by_line_id: captureColorState(),
    line_width_by_line_id: captureLineWidthState(),
    layer_transforms_by_id: captureLayerTransformState(),
    group_transforms_by_id: captureGroupTransformState(),
    selection: {
      layer_id: selectedLayerId,
      group_id: selectedGroupId,
      line_id: selectedLineId
    }
  };

  const serialized = JSON.stringify(payload, null, 2);
  const didWrite = writeTextFileChunked(fullPath, serialized);
  if (!didWrite) {
    log("save_view could not open file: " + fullPath);
    return;
  }

  outlet(0, "view_saved", fullPath, payload.view_id, payload.pool_id);
}

function load_view(fullFilePath) {
  if (!randomPool) {
    log("load_view requires loaded pool data");
    return;
  }

  const sourcePath = String(fullFilePath || "").trim();
  if (sourcePath.length === 0) {
    log("load_view requires a full file path");
    return;
  }

  const rawText = readTextFile(sourcePath);
  if (rawText === null) {
    log("load_view could not open file: " + sourcePath);
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    log("load_view could not parse JSON: " + sourcePath);
    return;
  }

  if (!isValidLoadedViewPayload(parsed)) {
    log("load_view invalid view payload: " + sourcePath);
    return;
  }

  if (!currentPoolId || parsed.pool_id !== currentPoolId) {
    log("load_view pool_id mismatch: expected " + currentPoolId + " got " + parsed.pool_id);
    return;
  }

  if (!isValidPointOrderForPool(parsed.point_order, randomPool.point_count)) {
    log("load_view invalid point order: " + sourcePath);
    return;
  }

  selectedFormName = parsed.form;
  pointOrder = parsed.point_order.slice();
  rebuildLinesFromCurrentOrder();

  hierarchy = cloneJsonSafe(parsed.hierarchy);

  const safeLayerRange = sanitizeRange(
    parsed.hierarchy_ranges.layerCount.min,
    parsed.hierarchy_ranges.layerCount.max,
    DEFAULT_LAYER_COUNT_RANGE.min,
    DEFAULT_LAYER_COUNT_RANGE.max
  );

  const safeGroupRange = sanitizeRange(
    parsed.hierarchy_ranges.groupsPerLayer.min,
    parsed.hierarchy_ranges.groupsPerLayer.max,
    DEFAULT_GROUPS_PER_LAYER_RANGE.min,
    DEFAULT_GROUPS_PER_LAYER_RANGE.max
  );

  const safeLineRange = sanitizeRange(
    parsed.hierarchy_ranges.linesPerGroup.min,
    parsed.hierarchy_ranges.linesPerGroup.max,
    DEFAULT_LINES_PER_GROUP_RANGE.min,
    DEFAULT_LINES_PER_GROUP_RANGE.max
  );

  hierarchyRangeConfig.layerCount = safeLayerRange;
  hierarchyRangeConfig.groupsPerLayer = safeGroupRange;
  hierarchyRangeConfig.linesPerGroup = safeLineRange;

  const lineById = {};
  for (let i = 0; i < lines.length; i += 1) {
    lineById[lines[i].id] = lines[i];
  }

  if (hierarchy && Array.isArray(hierarchy.groups)) {
    for (let i = 0; i < hierarchy.groups.length; i += 1) {
      const group = hierarchy.groups[i];
      if (!Array.isArray(group.line_ids)) {
        group.line_ids = [];
      }

      for (let j = 0; j < group.line_ids.length; j += 1) {
        const lineId = Number(group.line_ids[j]);
        const line = lineById[lineId];
        if (line) {
          line.group_id = group.group_id;
          line.layer_id = group.layer_id;
        }
      }
    }
  }

  reconcileTransformState();

  if (parsed.layer_transforms_by_id && typeof parsed.layer_transforms_by_id === "object") {
    applyLayerTransformState(parsed.layer_transforms_by_id);
  }

  if (parsed.group_transforms_by_id && typeof parsed.group_transforms_by_id === "object") {
    applyGroupTransformState(parsed.group_transforms_by_id);
  }

  applyHierarchyLineOrder();
  applyVisibilityState(parsed.visibility);

  if (parsed.colors_by_line_id && typeof parsed.colors_by_line_id === "object") {
    applyColorState(parsed.colors_by_line_id);
  }

  if (parsed.line_width_by_line_id && typeof parsed.line_width_by_line_id === "object") {
    applyLineWidthState(parsed.line_width_by_line_id);
  }

  emitLayerMenu();

  if (parsed.selection && parsed.selection.layer_id) {
    selectLayer(parsed.selection.layer_id);
  }
  if (parsed.selection && parsed.selection.group_id) {
    selectGroup(parsed.selection.group_id);
  }
  if (parsed.selection && parsed.selection.line_id !== null && typeof parsed.selection.line_id !== "undefined") {
    selectLine(parsed.selection.line_id);
  }

  architecture();
  emitRenderCommands();

  outlet(0, "view_loaded", sourcePath, parsed.view_id, parsed.pool_id);
}

function reportHierarchy() {
  //emits the current hierarchy to the outlet for external use (e.g., menu building) in blocks.
  //for streaming large hierarchies, this is more efficient than sending the entire hierarchy as a single JSON object.
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

function reshuffleLineColors() {
  if (!lines || lines.length === 0) {
    log("reshuffleLineColors requires generated data");
    return;
  }

  const colorPool = [];
  for (let i = 0; i < lines.length; i += 1) {
    const color = Array.isArray(lines[i].color) ? lines[i].color.slice() : [1, 1, 1, 1];
    colorPool.push(color);
  }

  for (let i = colorPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = colorPool[i];
    colorPool[i] = colorPool[j];
    colorPool[j] = temp;
  }

  for (let i = 0; i < lines.length; i += 1) {
    lines[i].color = colorPool[i];
  }

  emitRenderCommands();
}

function reshuffleLineWidths() {
  if (!lines || lines.length === 0) {
    log("reshuffleLineWidths requires generated data");
    return;
  }

  const widthPool = [];
  for (let i = 0; i < lines.length; i += 1) {
    widthPool.push(Number(lines[i].line_width));
  }

  for (let i = widthPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = widthPool[i];
    widthPool[i] = widthPool[j];
    widthPool[j] = temp;
  }

  for (let i = 0; i < lines.length; i += 1) {
    lines[i].line_width = widthPool[i];
  }

  emitRenderCommands();
}

function parseTransformNumber(value) {
  const numeric = Number(value);
  return isFinite(numeric) ? numeric : null;
}

function getSelectedLayerForTransformCommands() {
  if (!hierarchy || !Array.isArray(hierarchy.layers) || hierarchy.layers.length === 0) {
    log("transform command requires generated data");
    return null;
  }

  if (!selectedLayerId) {
    log("transform command requires selected layer");
    return null;
  }

  const layer = getHierarchyLayerById(selectedLayerId);
  if (!layer) {
    log("transform command unknown selected layer " + selectedLayerId);
    return null;
  }

  return layer;
}

function getSelectedGroupForTransformCommands() {
  if (!hierarchy || !Array.isArray(hierarchy.groups) || hierarchy.groups.length === 0) {
    log("transform command requires generated data");
    return null;
  }

  if (!selectedGroupId) {
    log("transform command requires selected group");
    return null;
  }

  const group = getHierarchyGroupById(selectedGroupId);
  if (!group) {
    log("transform command unknown selected group " + selectedGroupId);
    return null;
  }

  return group;
}

function emitLayerTransformRow(layerId) {
  const transform = ensureLayerTransform(layerId);
  if (!transform) {
    return;
  }

  outlet(
    0,
    "layer_transform",
    layerId,
    transform.position[0],
    transform.position[1],
    transform.position[2],
    transform.rotation[0],
    transform.rotation[1],
    transform.rotation[2],
    transform.scale[0],
    transform.scale[1],
    transform.scale[2]
  );
}

function emitGroupTransformRow(groupId, layerId) {
  const transform = ensureGroupTransform(groupId, layerId);
  if (!transform) {
    return;
  }

  outlet(
    0,
    "group_transform",
    layerId,
    groupId,
    transform.position[0],
    transform.position[1],
    transform.position[2],
    transform.rotation[0],
    transform.rotation[1],
    transform.rotation[2],
    transform.scale[0],
    transform.scale[1],
    transform.scale[2]
  );
}

function setLayerPosition(x, y, z) {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  const px = parseTransformNumber(x);
  const py = parseTransformNumber(y);
  const pz = parseTransformNumber(z);
  if (px === null || py === null || pz === null) {
    log("setLayerPosition requires finite numeric values");
    return;
  }

  const transform = ensureLayerTransform(layer.layer_id);
  transform.position = [px, py, pz];
  emitRenderCommands();
  outlet(0, "transform_set", "layer", layer.layer_id);
}

function setLayerRotation(x, y, z) {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  const rx = parseTransformNumber(x);
  const ry = parseTransformNumber(y);
  const rz = parseTransformNumber(z);
  if (rx === null || ry === null || rz === null) {
    log("setLayerRotation requires finite numeric values");
    return;
  }

  const transform = ensureLayerTransform(layer.layer_id);
  transform.rotation = [rx, ry, rz];
  emitRenderCommands();
  outlet(0, "transform_set", "layer", layer.layer_id);
}

function setLayerScale(x, y, z) {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  const sx = parseTransformNumber(x);
  const sy = parseTransformNumber(y);
  const sz = parseTransformNumber(z);
  if (sx === null || sy === null || sz === null || sx === 0 || sy === 0 || sz === 0) {
    log("setLayerScale requires non-zero numeric values");
    return;
  }

  const transform = ensureLayerTransform(layer.layer_id);
  transform.scale = [sx, sy, sz];
  emitRenderCommands();
  outlet(0, "transform_set", "layer", layer.layer_id);
}

function setLayerTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  const position = [parseTransformNumber(px), parseTransformNumber(py), parseTransformNumber(pz)];
  const rotation = [parseTransformNumber(rx), parseTransformNumber(ry), parseTransformNumber(rz)];
  const scale = [parseTransformNumber(sx), parseTransformNumber(sy), parseTransformNumber(sz)];

  if (
    position[0] === null || position[1] === null || position[2] === null ||
    rotation[0] === null || rotation[1] === null || rotation[2] === null ||
    scale[0] === null || scale[1] === null || scale[2] === null ||
    scale[0] === 0 || scale[1] === 0 || scale[2] === 0
  ) {
    log("setLayerTransform requires finite position/rotation and non-zero scale values");
    return;
  }

  const transform = ensureLayerTransform(layer.layer_id);
  transform.position = position;
  transform.rotation = rotation;
  transform.scale = scale;
  emitRenderCommands();
  outlet(0, "transform_set", "layer", layer.layer_id);
}

function resetLayerTransform() {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  layerTransformsById[layer.layer_id] = createIdentityTransform();
  emitRenderCommands();
  outlet(0, "transform_reset", "layer", layer.layer_id);
}

function getLayerTransform() {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  emitLayerTransformRow(layer.layer_id);
}

function setGroupPosition(x, y, z) {
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  const px = parseTransformNumber(x);
  const py = parseTransformNumber(y);
  const pz = parseTransformNumber(z);
  if (px === null || py === null || pz === null) {
    log("setGroupPosition requires finite numeric values");
    return;
  }

  const transform = ensureGroupTransform(group.group_id, group.layer_id);
  transform.position = [px, py, pz];
  emitRenderCommands();
  outlet(0, "transform_set", "group", group.group_id);
}

function setGroupRotation(x, y, z) {
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  const rx = parseTransformNumber(x);
  const ry = parseTransformNumber(y);
  const rz = parseTransformNumber(z);
  if (rx === null || ry === null || rz === null) {
    log("setGroupRotation requires finite numeric values");
    return;
  }

  const transform = ensureGroupTransform(group.group_id, group.layer_id);
  transform.rotation = [rx, ry, rz];
  emitRenderCommands();
  outlet(0, "transform_set", "group", group.group_id);
}

function setGroupScale(x, y, z) {
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  const sx = parseTransformNumber(x);
  const sy = parseTransformNumber(y);
  const sz = parseTransformNumber(z);
  if (sx === null || sy === null || sz === null || sx === 0 || sy === 0 || sz === 0) {
    log("setGroupScale requires non-zero numeric values");
    return;
  }

  const transform = ensureGroupTransform(group.group_id, group.layer_id);
  transform.scale = [sx, sy, sz];
  emitRenderCommands();
  outlet(0, "transform_set", "group", group.group_id);
}

function setGroupTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  const position = [parseTransformNumber(px), parseTransformNumber(py), parseTransformNumber(pz)];
  const rotation = [parseTransformNumber(rx), parseTransformNumber(ry), parseTransformNumber(rz)];
  const scale = [parseTransformNumber(sx), parseTransformNumber(sy), parseTransformNumber(sz)];

  if (
    position[0] === null || position[1] === null || position[2] === null ||
    rotation[0] === null || rotation[1] === null || rotation[2] === null ||
    scale[0] === null || scale[1] === null || scale[2] === null ||
    scale[0] === 0 || scale[1] === 0 || scale[2] === 0
  ) {
    log("setGroupTransform requires finite position/rotation and non-zero scale values");
    return;
  }

  const transform = ensureGroupTransform(group.group_id, group.layer_id);
  transform.position = position;
  transform.rotation = rotation;
  transform.scale = scale;
  emitRenderCommands();
  outlet(0, "transform_set", "group", group.group_id);
}

function resetGroupTransform() {
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  const identity = createIdentityTransform();
  identity.layer_id = group.layer_id;
  groupTransformsById[group.group_id] = identity;
  emitRenderCommands();
  outlet(0, "transform_reset", "group", group.group_id);
}

function getGroupTransform() {
  log("getGroupTransform");
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  emitGroupTransformRow(group.group_id, group.layer_id);
}

function reportTransforms() {
  if (!hierarchy || !Array.isArray(hierarchy.layers) || !Array.isArray(hierarchy.groups)) {
    log("reportTransforms requires generated data");
    return;
  }

  reconcileTransformState();

  const layerCount = hierarchy.layers.length;
  const groupCount = hierarchy.groups.length;
  let rowCount = 0;

  outlet(0, "transforms_begin", layerCount, groupCount);

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    const layer = hierarchy.layers[i];
    const transform = ensureLayerTransform(layer.layer_id);
    if (!transform) {
      continue;
    }

    outlet(
      0,
      "layer_transform_row",
      layer.layer_id,
      transform.position[0],
      transform.position[1],
      transform.position[2],
      transform.rotation[0],
      transform.rotation[1],
      transform.rotation[2],
      transform.scale[0],
      transform.scale[1],
      transform.scale[2]
    );
    rowCount += 1;
  }

  for (let i = 0; i < hierarchy.groups.length; i += 1) {
    const group = hierarchy.groups[i];
    const transform = ensureGroupTransform(group.group_id, group.layer_id);
    if (!transform) {
      continue;
    }

    outlet(
      0,
      "group_transform_row",
      group.layer_id,
      group.group_id,
      transform.position[0],
      transform.position[1],
      transform.position[2],
      transform.rotation[0],
      transform.rotation[1],
      transform.rotation[2],
      transform.scale[0],
      transform.scale[1],
      transform.scale[2]
    );
    rowCount += 1;
  }

  outlet(0, "transforms_end", rowCount);
}

function resetAllTransforms() {
  if (!hierarchy || !Array.isArray(hierarchy.layers) || !Array.isArray(hierarchy.groups)) {
    log("resetAllTransforms requires generated data");
    return;
  }

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    layerTransformsById[hierarchy.layers[i].layer_id] = createIdentityTransform();
  }

  for (let i = 0; i < hierarchy.groups.length; i += 1) {
    const group = hierarchy.groups[i];
    const identity = createIdentityTransform();
    identity.layer_id = group.layer_id;
    groupTransformsById[group.group_id] = identity;
  }

  emitRenderCommands();
  outlet(0, "transforms_reset_all");
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

function refreshMenus() {
  emitLayerMenu();
}

function clearMenus() {
  clearAllMenus();

  selectedLayerId = null;
  selectedGroupId = null;
  selectedLineId = null;
  emitCurrentSelection();

  outlet(0, "menus_cleared");
}

function generate(numLines) {
  const count = parseInt(numLines, 10);

  if (!isFinite(count) || count < 1) {
    log("generate requires a positive integer count");
    return;
  }

  randomPool = deepFreezeObject(buildRandomPool(count));
  currentPoolId = null;

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
