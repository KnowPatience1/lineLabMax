// Updated 2026-07-30 for JavaScript ES6 line/group/layer system module.
/* Here are the intended public commands in lineBaseSystem.js that you can call from Max:

1. generate numLines  
Syntax: generate 120  
Purpose: Generates and freezes the random pool, assigns a pool id, builds lines, builds hierarchy, and renders.
Emits: pool_id idValue immediately after generation.

2. reshuffleLines  
Syntax: reshuffleLines  
Purpose: Keeps the same frozen pool, reshuffles point pairing/order, rebuilds hierarchy, and rerenders.

2a. reshuffleCoords
Syntax: reshuffleCoords
Purpose: Independently reshuffles x, y, and z coordinate pools, rebuilds hierarchy, and rerenders.

2b. reshuffleAll
Syntax: reshuffleAll
Purpose: Reshuffles the full original random stream (coordinates and appearance drivers), rebuilds hierarchy, and rerenders without mutating the frozen pool.

2c. sortAllNumbers
Syntax: sortAllNumbers asc
Syntax: sortAllNumbers desc
Purpose: Sorts the full original random stream numerically (ascending or descending), rebuilds hierarchy, and rerenders without mutating the frozen pool.

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
  Also receive fresh architecture counts automatically on hierarchy rebuild paths (generate, reshuffleLines, buildHierarchy, range changes).

13. set_pathName nameValue
Syntax: set_pathName pool_001
Purpose: Sets the current path name used as the storage key for immutable pool data.

14. get_pathName
Syntax: get_pathName
Purpose: Emits the current path name as: pathName nameValue.

14a. set_erase_color r g b a
Syntax: set_erase_color 0 0 0 1
Purpose: Sets the erase color used by the system.
  erase_color is part of the View state and is saved/loaded with view files.

14b. get_erase_color
Syntax: get_erase_color
Purpose: Emits the current erase color as: erase_color r g b a.

14c. set_linewidth_range min_width max_width
Syntax: set_linewidth_range 0.005 0.5
Purpose: Sets generated line-width range (min/max) used for pool builds.
  Emits linewidth min max on success.

14d. get_linewidth_range
Syntax: get_linewidth_range
Purpose: Emits current generated line-width range as: linewidth min max.

14e. set_linewidth_multiplier multiplier
Syntax: set_linewidth_multiplier 120
Purpose: Sets render-time line-width multiplier used for sketch gllinewidth.
  Emits linewidth_multiplier value on success.

14f. get_linewidth_multiplier
Syntax: get_linewidth_multiplier
Purpose: Emits current render-time line-width multiplier as: linewidth_multiplier value.

14g. set_color_map rmin rmax gmin gmax bmin bmax amin amax
Syntax: set_color_map 0.2 0.9 0.1 0.8 0.3 1 0.4 1
Purpose: Sets the global mapped RGBA output ranges used to derive line colors from immutable pool attributes.
  Emits color_map rmin rmax gmin gmax bmin bmax amin amax on success.

14h. get_color_map
Syntax: get_color_map
Purpose: Emits current global color map as: color_map rmin rmax gmin gmax bmin bmax amin amax.

15. save_randomPool
Syntax: save_randomPool
Purpose: Saves immutable pool-only data to pathName using a timestamped filename: randomPool_hh-mm-ss.json.
Pool id behavior: reuses current pool_id when already set, otherwise creates one.

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
Purpose: Emits the current pool id as: pool_id idValue. Logs when no pool_id is currently set.

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
This is one of the few commands which does not require a pathName to be set, since it is purely a Max UI operation.

29. reportArchitectureRows
Syntax: reportArchitectureRows
Purpose: Emits one row per line in layer-group-line order for direct Max routing.
Emits: architecture_rows_begin, then architecture_row layerId groupId lineId layerVisible groupVisible lineVisible, then architecture_rows_end rowCount.

30. reshuffleLineColors
Syntax: reshuffleLineColors
Purpose: Randomly reassigns line colors by reshuffling source color-driver indices only while keeping line geometry, hierarchy, and line order unchanged.
  The reshuffle is saved as mutable View state so it can be reconstructed from the original pool.

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

38. setLayerSpace mode
Syntax: setLayerSpace local
Syntax: setLayerSpace world
Purpose: Sets transform space mode for the currently selected layer.

39. getLayerSpace
Syntax: getLayerSpace
Purpose: Emits current transform space mode for the currently selected layer.

40. setGroupPosition x y z
Syntax: setGroupPosition 0.0 0.0 0.0
Purpose: Sets position transform for the currently selected group.

41. setGroupRotation x y z
Syntax: setGroupRotation 0 0 45
Purpose: Sets rotation transform (degrees) for the currently selected group.

42. setGroupScale x y z
Syntax: setGroupScale 1 1 1
Purpose: Sets scale transform for the currently selected group.

43. setGroupTransform px py pz rx ry rz sx sy sz
Syntax: setGroupTransform 0 0 0 0 0 0 1 1 1
Purpose: Sets full transform for the currently selected group.

44. resetGroupTransform
Syntax: resetGroupTransform
Purpose: Resets currently selected group transform to identity.

45. getGroupTransform
Syntax: getGroupTransform
Purpose: Emits the currently selected group transform.

45a. setLinePosition x y z
Syntax: setLinePosition 0.0 0.0 0.0
Purpose: Sets position transform for the currently selected line.

45b. setLineRotation x y z
Syntax: setLineRotation 0 0 15
Purpose: Sets rotation transform (degrees) for the currently selected line.

45c. setLineScale x y z
Syntax: setLineScale 1 1 1
Purpose: Sets scale transform for the currently selected line.

45d. setLineTransform px py pz rx ry rz sx sy sz
Syntax: setLineTransform 0 0 0 0 0 0 1 1 1
Purpose: Sets full transform for the currently selected line.

45e. resetLineTransform
Syntax: resetLineTransform
Purpose: Resets currently selected line transform to identity.

45f. getLineTransform
Syntax: getLineTransform
Purpose: Emits the currently selected line transform.

45g selectLine 
Syntax: selectLine lineId
Purpose: Selects a line by id and updates the current_line menu selection.

46. setGroupSpace mode
Syntax: setGroupSpace local
Syntax: setGroupSpace world
Purpose: Sets transform space mode for the currently selected group.

47. getGroupSpace
Syntax: getGroupSpace
Purpose: Emits current transform space mode for the currently selected group.

48. setScenePosition x y z
Syntax: setScenePosition 0.0 0.0 0.0
Purpose: Sets scene position transform above all layers/groups.

49. setSceneRotation x y z
Syntax: setSceneRotation 0 0 0
Purpose: Sets scene rotation transform (degrees) above all layers/groups.

50. setSceneScale x y z
Syntax: setSceneScale 1 1 1
Purpose: Sets scene scale transform above all layers/groups.

51. setSceneTransform px py pz rx ry rz sx sy sz
Syntax: setSceneTransform 0 0 0 0 0 0 1 1 1
Purpose: Sets full scene transform above all layers/groups.

52. resetSceneTransform
Syntax: resetSceneTransform
Purpose: Resets scene transform to identity.

53. getSceneTransform
Syntax: getSceneTransform
Purpose: Emits current scene transform.

54. reportTransforms
Syntax: reportTransforms
Purpose: Emits scene/layer/group/line transforms in a table-style stream.

55. resetAllTransforms
Syntax: resetAllTransforms
Purpose: Resets scene/layer/group transforms to identity.

56. setSceneSpace mode
Syntax: setSceneSpace local
Syntax: setSceneSpace world
Purpose: Sets Scene transform space mode used by scene transform commands and rendering.

57. getSceneSpace
Syntax: getSceneSpace
Purpose: Emits current Scene transform space mode.

58. setSortCoords axis mode amount
Syntax: setSortCoords x asc 1
Syntax: setSortCoords xyz desc 0.5
Purpose: Stores coordinate sort intent for applySort. Axis accepts x|y|z|xyz, mode accepts asc|desc, amount is clamped to 0..1.

59. setSortColors channel mode amount
Syntax: setSortColors r asc 1
Syntax: setSortColors rgba desc 0.35
Purpose: Stores color sort intent for applySort. Channel accepts r|g|b|a|rgba, mode accepts asc|desc, amount is clamped to 0..1.

60. setSortWidth mode amount
Syntax: setSortWidth asc 1
Syntax: setSortWidth desc 0.25
Purpose: Stores width sort intent for applySort. Mode accepts asc|desc, amount is clamped to 0..1.

61. applySort
Syntax: applySort
Purpose: Applies current coordinate/color/width sort intents to mutable line state and rerenders.

62. resetSort
Syntax: resetSort
Purpose: Resets sort intents to defaults, restores unsorted mutable state from active pool + current point order, and rerenders.

63. getSortState
Syntax: getSortState
Purpose: Emits current sort configuration and applied flag.

64. reportSortRows
Syntax: reportSortRows
Purpose: Emits sort configuration rows for Max routing.

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
9. Scene space mode accepts only local or world.
10. Layer space mode accepts only local or world.
11. Group space mode accepts only local or world.

Scene transform outlet messages:
- scene_transform px py pz rx ry rz sx sy sz space
  Emitted by getSceneTransform.
- scene_space local|world
  Emitted by getSceneSpace.
- scene_transform_row px py pz rx ry rz sx sy sz space
  Emitted by reportTransforms between transforms_begin and transforms_end.
- scene_space_row local|world
  Emitted by reportTransforms between transforms_begin and transforms_end.
- transform_set scene
  Emitted by setScenePosition, setSceneRotation, setSceneScale, setSceneTransform.
- transform_reset scene
  Emitted by resetSceneTransform.
- transform_space_set scene local|world
  Emitted by setSceneSpace.

Layer transform outlet messages:
- layer_transform layerId px py pz rx ry rz sx sy sz space
  Emitted by getLayerTransform.
- layer_space layerId local|world
  Emitted by getLayerSpace.
- layer_transform_row layerId px py pz rx ry rz sx sy sz space
  Emitted by reportTransforms between transforms_begin and transforms_end.
- layer_space_row layerId local|world
  Emitted by reportTransforms between transforms_begin and transforms_end.
- transform_space_set layer layerId local|world
  Emitted by setLayerSpace.

Group transform outlet messages:
- group_transform layerId groupId px py pz rx ry rz sx sy sz space
  Emitted by getGroupTransform.
- group_space layerId groupId local|world
  Emitted by getGroupSpace.
- group_transform_row layerId groupId px py pz rx ry rz sx sy sz space
  Emitted by reportTransforms between transforms_begin and transforms_end.
- group_space_row layerId groupId local|world
  Emitted by reportTransforms between transforms_begin and transforms_end.
- transform_space_set group groupId local|world
  Emitted by setGroupSpace.

Line transform outlet messages:
- line_transform lineId px py pz rx ry rz sx sy sz
  Emitted by getLineTransform.
- line_transform_row lineId px py pz rx ry rz sx sy sz
  Emitted by reportTransforms between transforms_begin and transforms_end.
- transform_set line lineId
  Emitted by setLinePosition, setLineRotation, setLineScale, setLineTransform.
- transform_reset line lineId
  Emitted by resetLineTransform.

Sort outlet messages:
- sort_set coords axis mode amount
  Emitted by setSortCoords.
- sort_set colors channel mode amount
  Emitted by setSortColors.
- sort_set width mode amount
  Emitted by setSortWidth.
- sort_applied
  Emitted by applySort.
- sort_reset
  Emitted by resetSort.
- sort_state coordsAxis coordsMode coordsAmount colorsChannel colorsMode colorsAmount widthMode widthAmount appliedFlag
  Emitted by getSortState.
- sort_rows_begin
  Emitted by reportSortRows before row payloads.
- sort_row target key mode amount
  Emitted by reportSortRows.
- sort_rows_end rowCount
  Emitted by reportSortRows after row payloads.

Erase color outlet messages:
- erase_color r g b a
  Emitted by get_erase_color.

Line width outlet messages:
- linewidth min max
  Emitted by set_linewidth_range, get_linewidth_range, and load_view.
- linewidth_multiplier value
  Emitted by set_linewidth_multiplier, get_linewidth_multiplier, and load_view.

Color map outlet messages:
- color_map rmin rmax gmin gmax bmin bmax amin amax
  Emitted by set_color_map, get_color_map, and load_view.
*/

"use strict";
autowatch = 1;
inlets = 1;
outlets = 1;
const lineBaseUtils = require("lineBaseUtils.js");
const lineBaseValidatorModule = require("lineBaseValidators.js");
const lineBaseIOModule = require("lineBaseIO.js");
const lineBaseMenusModule = require("lineBaseMenus.js");
const lineBaseMenuFlowModule = require("lineBaseMenuFlow.js");
const lineBaseStateHelpersModule = require("lineBaseStateHelpers.js");
const lineBaseReportsModule = require("lineBaseReports.js");
const lineBaseRenderModule = require("lineBaseRender.js");
const lineBaseTransformMutationsModule = require("lineBaseTransformMutations.js");
const lineBaseIndexMutationsModule = require("lineBaseIndexMutations.js");

const RANDOMS_PER_POINT = 9;

const DEFAULT_LAYER_COUNT_RANGE = { min: 1, max: 4 };
const DEFAULT_GROUPS_PER_LAYER_RANGE = { min: 1, max: 5 };
const DEFAULT_LINES_PER_GROUP_RANGE = { min: 1, max: 1000 };
const TRANSFORM_SPACE_LOCAL = "local";
const TRANSFORM_SPACE_WORLD = "world";
const SORT_MODE_ASC = "asc";
const SORT_MODE_DESC = "desc";
const SORT_AXIS_X = "x";
const SORT_AXIS_Y = "y";
const SORT_AXIS_Z = "z";
const SORT_AXIS_XYZ = "xyz";
const SORT_CHANNEL_R = "r";
const SORT_CHANNEL_G = "g";
const SORT_CHANNEL_B = "b";
const SORT_CHANNEL_A = "a";
const SORT_CHANNEL_RGBA = "rgba";
const DEFAULT_ERASE_COLOR = [0, 0, 0, 1];
const DEFAULT_COLOR_MAP = [0, 1, 0, 1, 0, 1, 0, 1];
const DEFAULT_LINE_WIDTH_RANGE_MIN = 0.005;
const DEFAULT_LINE_WIDTH_RANGE_MAX = 0.5;
const DEFAULT_LINE_WIDTH_MULTIPLIER = 120;
const lineBaseValidators = lineBaseValidatorModule.createLineBaseValidators({
  RANDOMS_PER_POINT: RANDOMS_PER_POINT,
  TRANSFORM_SPACE_LOCAL: TRANSFORM_SPACE_LOCAL,
  TRANSFORM_SPACE_WORLD: TRANSFORM_SPACE_WORLD,
  pointCountFromLineCount: pointCountFromLineCount,
  randomCountFromLineCount: randomCountFromLineCount
});

// declare variable for randomPool. This will hold the frozen random values and coordinates for line generation.
let randomPool = null;
let coordinateOverrides = null;
let poolOverrides = null;
let sortState = createDefaultSortState();
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
let eraseColor = DEFAULT_ERASE_COLOR.slice();
let colorMap = DEFAULT_COLOR_MAP.slice();
let colorDriverPermutation = null;
let lineWidthRangeMin = DEFAULT_LINE_WIDTH_RANGE_MIN;
let lineWidthRangeMax = DEFAULT_LINE_WIDTH_RANGE_MAX;
let lineWidthMultiplier = DEFAULT_LINE_WIDTH_MULTIPLIER;
let currentPoolId = null;
let loadedIndexData = null;
let loadedIndexPath = "";
let sceneTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1]
};
let sceneTransformSpace = TRANSFORM_SPACE_LOCAL;
let layerTransformsById = {};
let layerTransformSpacesById = {};
let groupTransformsById = {};
let groupTransformSpacesById = {};
let lineTransformsById = {};
let lineTransformSpacesById = {};
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

const runtime = {
  state: {},
  deps: {
    emit: function() {
      return outlet.apply(null, arguments);
    },
    postLine: function(message) {
      return post(message);
    },
    getNamedObject: function(objectName) {
      const resolvedName = String(objectName || "");
      if (resolvedName.length === 0) {
        return null;
      }

      function tryGetNamedFromPatcher(targetPatcher) {
        if (!targetPatcher || typeof targetPatcher.getnamed !== "function") {
          return null;
        }

        try {
          const namedObject = targetPatcher.getnamed(resolvedName);
          if (namedObject && typeof namedObject.message === "function") {
            return namedObject;
          }
        } catch (error) {
          // Ignore and continue searching parent patchers.
        }

        return null;
      }

      const visitedPatchers = [];
      let currentPatcher = (typeof patcher === "object" && patcher) ? patcher : null;
      let depth = 0;
      const maxDepth = 16;

      while (currentPatcher && depth < maxDepth) {
        const namedObject = tryGetNamedFromPatcher(currentPatcher);
        if (namedObject) {
          return namedObject;
        }

        visitedPatchers.push(currentPatcher);

        let parent = null;
        try {
          if (typeof currentPatcher.parentpatcher === "function") {
            parent = currentPatcher.parentpatcher();
          } else if (typeof currentPatcher.parentpatcher === "object") {
            parent = currentPatcher.parentpatcher;
          }
        } catch (error) {
          parent = null;
        }

        if (!parent) {
          break;
        }

        let isVisited = false;
        for (let i = 0; i < visitedPatchers.length; i += 1) {
          if (visitedPatchers[i] === parent) {
            isVisited = true;
            break;
          }
        }

        if (isVisited) {
          break;
        }

        currentPatcher = parent;
        depth += 1;
      }

      return null;
    },
    createFile: function(fullPath, accessMode, fileType) {
      if (typeof accessMode === "undefined") {
        return new File(fullPath);
      }

      return new File(fullPath, accessMode, fileType);
    },
    createFolder: function(folderPath) {
      return new Folder(folderPath);
    }
  }
};

const lineBaseIO = lineBaseIOModule.createLineBaseIO({
  createFile: function(fullPath, accessMode, fileType) {
    return runtime.deps.createFile(fullPath, accessMode, fileType);
  }
});

const lineBaseMenus = lineBaseMenusModule.createLineBaseMenus({
  cache: namedObjectCache,
  getNamedObject: function(objectName) {
    return runtime.deps.getNamedObject(objectName);
  },
  log: function(message) {
    log(message);
  }
});

const lineBaseMenuFlow = lineBaseMenuFlowModule.createLineBaseMenuFlow({
  emit: function() {
    return runtime.deps.emit.apply(null, arguments);
  },
  log: function(message) {
    log(message);
  },
  getHierarchy: function() {
    return hierarchy;
  },
  getSelectedLayerId: function() {
    return selectedLayerId;
  },
  setSelectedLayerId: function(value) {
    selectedLayerId = value;
  },
  getSelectedGroupId: function() {
    return selectedGroupId;
  },
  setSelectedGroupId: function(value) {
    selectedGroupId = value;
  },
  getSelectedLineId: function() {
    return selectedLineId;
  },
  setSelectedLineId: function(value) {
    selectedLineId = value;
  },
  getHierarchyGroupById: function(groupId) {
    return getHierarchyGroupById(groupId);
  },
  getGroupsForLayer: function(layerId) {
    return getGroupsForLayer(layerId);
  },
  clearNamedMenu: function(objectName) {
    return clearNamedMenu(objectName);
  },
  appendNamedMenuItem: function(objectName, itemValue) {
    return appendNamedMenuItem(objectName, itemValue);
  },
  setNamedMenuSelection: function(objectName, selectionValue) {
    return setNamedMenuSelection(objectName, selectionValue);
  }
});

const lineBaseStateHelpers = lineBaseStateHelpersModule.createLineBaseStateHelpers({
  getHierarchy: function() {
    return hierarchy;
  },
  getLines: function() {
    return lines;
  },
  setLayerVisible: function(layerId, visible) {
    setLayerVisible(layerId, visible);
  },
  setGroupVisible: function(groupId, visible) {
    setGroupVisible(groupId, visible);
  },
  setLineVisible: function(lineId, visible) {
    setLineVisible(lineId, visible);
  },
  createIdentityTransform: function() {
    return createIdentityTransform();
  },
  cloneTransform: function(transform) {
    return cloneTransform(transform);
  },
  normalizeTransform: function(transform, fallbackLayerId) {
    return normalizeTransform(transform, fallbackLayerId);
  },
  ensureLayerTransformSpace: function(layerId) {
    return ensureLayerTransformSpace(layerId);
  },
  ensureGroupTransformSpace: function(groupId) {
    return ensureGroupTransformSpace(groupId);
  },
  ensureLineTransformSpace: function(lineId) {
    return ensureLineTransformSpace(lineId);
  },
  ensureSceneTransform: function() {
    return ensureSceneTransform();
  },
  ensureSceneTransformSpace: function() {
    return ensureSceneTransformSpace();
  },
  isValidTransformEntry: function(entry, requireLayerId) {
    return isValidTransformEntry(entry, requireLayerId);
  },
  isValidSceneTransformSpaceValue: function(value) {
    return isValidSceneTransformSpaceValue(value);
  },
  normalizeSceneTransformSpace: function(value) {
    return normalizeSceneTransformSpace(value);
  },
  getLayerTransformsById: function() {
    return layerTransformsById;
  },
  getLayerTransformSpacesById: function() {
    return layerTransformSpacesById;
  },
  getGroupTransformsById: function() {
    return groupTransformsById;
  },
  getGroupTransformSpacesById: function() {
    return groupTransformSpacesById;
  },
  getLineTransformsById: function() {
    return lineTransformsById;
  },
  getLineTransformSpacesById: function() {
    return lineTransformSpacesById;
  },
  setSceneTransform: function(value) {
    sceneTransform = value;
  }
});

const lineBaseReports = lineBaseReportsModule.createLineBaseReports({
  emit: function() {
    return runtime.deps.emit.apply(null, arguments);
  },
  log: function(message) {
    log(message);
  },
  getHierarchy: function() {
    return hierarchy;
  },
  getLines: function() {
    return lines;
  },
  getHierarchyGroupById: function(groupId) {
    return getHierarchyGroupById(groupId);
  },
  getLineById: function(lineId) {
    return getLineById(lineId);
  },
  ensureLayerTransform: function(layerId) {
    return ensureLayerTransform(layerId);
  },
  ensureLayerTransformSpace: function(layerId) {
    return ensureLayerTransformSpace(layerId);
  },
  ensureGroupTransform: function(groupId, layerId) {
    return ensureGroupTransform(groupId, layerId);
  },
  ensureLineTransform: function(lineId) {
    return ensureLineTransform(lineId);
  },
  ensureGroupTransformSpace: function(groupId) {
    return ensureGroupTransformSpace(groupId);
  },
  ensureSceneTransform: function() {
    return ensureSceneTransform();
  },
  ensureSceneTransformSpace: function() {
    return ensureSceneTransformSpace();
  }
});

const lineBaseRender = lineBaseRenderModule.createLineBaseRender({
  emit: function() {
    return runtime.deps.emit.apply(null, arguments);
  },
  getRenderSettings: function() {
    return {
      eraseColor: eraseColor.slice(),
      lineWidthMultiplier: Number(lineWidthMultiplier)
    };
  },
  getLines: function() {
    return lines;
  },
  computeGroupRenderPivotPoints: function() {
    return computeGroupRenderPivotPoints();
  },
  computeLayerRenderPivotPoints: function(groupPivotsById) {
    return computeLayerRenderPivotPoints(groupPivotsById);
  },
  ensureSceneTransform: function() {
    return ensureSceneTransform();
  },
  ensureSceneTransformSpace: function() {
    return ensureSceneTransformSpace();
  },
  getRenderPivotPoint: function() {
    return getRenderPivotPoint();
  },
  isLineVisibleByHierarchy: function(line) {
    return isLineVisibleByHierarchy(line);
  },
  transformedLineEndpoint: function(line, point, groupPivotsById, layerPivotsById) {
    return transformedLineEndpoint(line, point, groupPivotsById, layerPivotsById);
  },
  applyTransformToPointAroundPivot: function(point, transform, pivot) {
    return applyTransformToPointAroundPivot(point, transform, pivot);
  },
  applyTransformToPoint: function(point, transform) {
    return applyTransformToPoint(point, transform);
  },
  ensureLineTransform: function(lineId) {
    return ensureLineTransform(lineId);
  },
  ensureLineTransformSpace: function(lineId) {
    return ensureLineTransformSpace(lineId);
  },
  TRANSFORM_SPACE_LOCAL: TRANSFORM_SPACE_LOCAL
});

const lineBaseTransformMutations = lineBaseTransformMutationsModule.createLineBaseTransformMutations({
  log: function(message) {
    log(message);
  },
  emit: function() {
    return runtime.deps.emit.apply(null, arguments);
  },
  emitRenderCommands: function() {
    emitRenderCommands();
  },
  getSelectedLayerForTransformCommands: function() {
    return getSelectedLayerForTransformCommands();
  },
  getSelectedGroupForTransformCommands: function() {
    return getSelectedGroupForTransformCommands();
  },
  getSelectedLineForTransformCommands: function() {
    return getSelectedLineForTransformCommands();
  },
  ensureLayerTransformSpace: function(layerId) {
    return ensureLayerTransformSpace(layerId);
  },
  ensureGroupTransformSpace: function(groupId) {
    return ensureGroupTransformSpace(groupId);
  },
  ensureSceneTransformSpace: function() {
    return ensureSceneTransformSpace();
  },
  ensureLayerTransform: function(layerId) {
    return ensureLayerTransform(layerId);
  },
  ensureGroupTransform: function(groupId, layerId) {
    return ensureGroupTransform(groupId, layerId);
  },
  ensureLineTransform: function(lineId) {
    return ensureLineTransform(lineId);
  },
  ensureLineTransformSpace: function(lineId) {
    return ensureLineTransformSpace(lineId);
  },
  ensureSceneTransform: function() {
    return ensureSceneTransform();
  },
  isValidSceneTransformSpaceValue: function(mode) {
    return isValidSceneTransformSpaceValue(mode);
  },
  normalizeSceneTransformSpace: function(mode) {
    return normalizeSceneTransformSpace(mode);
  },
  createIdentityTransform: function() {
    return createIdentityTransform();
  },
  getLayerTransformsById: function() {
    return layerTransformsById;
  },
  getLayerTransformSpacesById: function() {
    return layerTransformSpacesById;
  },
  getGroupTransformsById: function() {
    return groupTransformsById;
  },
  getGroupTransformSpacesById: function() {
    return groupTransformSpacesById;
  },
  getLineTransformsById: function() {
    return lineTransformsById;
  },
  getLineTransformSpacesById: function() {
    return lineTransformSpacesById;
  },
  getLines: function() {
    return lines;
  },
  getHierarchy: function() {
    return hierarchy;
  },
  setSceneTransform: function(value) {
    sceneTransform = value;
  },
  setSceneTransformSpace: function(value) {
    sceneTransformSpace = value;
  },
  getSceneTransformSpace: function() {
    return sceneTransformSpace;
  },
  TRANSFORM_SPACE_LOCAL: TRANSFORM_SPACE_LOCAL
});

const lineBaseIndexMutations = lineBaseIndexMutationsModule.createLineBaseIndexMutations({
  log: function(message) {
    log(message);
  },
  emit: function() {
    return runtime.deps.emit.apply(null, arguments);
  },
  createFolder: function(path) {
    return runtime.deps.createFolder(path);
  },
  joinPath: function(folderPath, fileName) {
    return joinPath(folderPath, fileName);
  },
  readTextFile: function(fullPath) {
    return readTextFile(fullPath);
  },
  writeTextFileChunked: function(fullPath, contentText) {
    return writeTextFileChunked(fullPath, contentText);
  },
  isValidLoadedPoolPayload: function(payload) {
    return isValidLoadedPoolPayload(payload);
  },
  isValidLoadedViewPayload: function(payload) {
    return isValidLoadedViewPayload(payload);
  },
  isValidLoadedIndexPayload: function(payload) {
    return isValidLoadedIndexPayload(payload);
  },
  cloneJsonSafe: function(value) {
    return cloneJsonSafe(value);
  },
  getPathName: function() {
    return pathName;
  },
  getLoadedIndexData: function() {
    return loadedIndexData;
  },
  setLoadedIndexData: function(value) {
    loadedIndexData = value;
  },
  getLoadedIndexPath: function() {
    return loadedIndexPath;
  },
  setLoadedIndexPath: function(value) {
    loadedIndexPath = value;
  }
});

function bindRuntimeStateProperty(propertyName, getter, setter) {
  Object.defineProperty(runtime.state, propertyName, {
    enumerable: true,
    configurable: false,
    get: getter,
    set: setter
  });
}

bindRuntimeStateProperty("randomPool", function() { return randomPool; }, function(value) { randomPool = value; });
bindRuntimeStateProperty("coordinateOverrides", function() { return coordinateOverrides; }, function(value) { coordinateOverrides = value; });
bindRuntimeStateProperty("poolOverrides", function() { return poolOverrides; }, function(value) { poolOverrides = value; });
bindRuntimeStateProperty("sortState", function() { return sortState; }, function(value) { sortState = value; });
bindRuntimeStateProperty("pointOrder", function() { return pointOrder; }, function(value) { pointOrder = value; });
bindRuntimeStateProperty("lineDefinitions", function() { return lineDefinitions; }, function(value) { lineDefinitions = value; });
bindRuntimeStateProperty("lines", function() { return lines; }, function(value) { lines = value; });
bindRuntimeStateProperty("selectedFormName", function() { return selectedFormName; }, function(value) { selectedFormName = value; });
bindRuntimeStateProperty("hierarchy", function() { return hierarchy; }, function(value) { hierarchy = value; });
bindRuntimeStateProperty("selectedLayerId", function() { return selectedLayerId; }, function(value) { selectedLayerId = value; });
bindRuntimeStateProperty("selectedGroupId", function() { return selectedGroupId; }, function(value) { selectedGroupId = value; });
bindRuntimeStateProperty("selectedLineId", function() { return selectedLineId; }, function(value) { selectedLineId = value; });
bindRuntimeStateProperty("pathName", function() { return pathName; }, function(value) { pathName = value; });
bindRuntimeStateProperty("eraseColor", function() { return eraseColor; }, function(value) { eraseColor = value; });
bindRuntimeStateProperty("colorMap", function() { return colorMap; }, function(value) { colorMap = value; });
bindRuntimeStateProperty("colorDriverPermutation", function() { return colorDriverPermutation; }, function(value) { colorDriverPermutation = value; });
bindRuntimeStateProperty("lineWidthRangeMin", function() { return lineWidthRangeMin; }, function(value) { lineWidthRangeMin = value; });
bindRuntimeStateProperty("lineWidthRangeMax", function() { return lineWidthRangeMax; }, function(value) { lineWidthRangeMax = value; });
bindRuntimeStateProperty("lineWidthMultiplier", function() { return lineWidthMultiplier; }, function(value) { lineWidthMultiplier = value; });
bindRuntimeStateProperty("currentPoolId", function() { return currentPoolId; }, function(value) { currentPoolId = value; });
bindRuntimeStateProperty("loadedIndexData", function() { return loadedIndexData; }, function(value) { loadedIndexData = value; });
bindRuntimeStateProperty("loadedIndexPath", function() { return loadedIndexPath; }, function(value) { loadedIndexPath = value; });
bindRuntimeStateProperty("sceneTransform", function() { return sceneTransform; }, function(value) { sceneTransform = value; });
bindRuntimeStateProperty("sceneTransformSpace", function() { return sceneTransformSpace; }, function(value) { sceneTransformSpace = value; });
bindRuntimeStateProperty("layerTransformsById", function() { return layerTransformsById; }, function(value) { layerTransformsById = value; });
bindRuntimeStateProperty("layerTransformSpacesById", function() { return layerTransformSpacesById; }, function(value) { layerTransformSpacesById = value; });
bindRuntimeStateProperty("groupTransformsById", function() { return groupTransformsById; }, function(value) { groupTransformsById = value; });
bindRuntimeStateProperty("groupTransformSpacesById", function() { return groupTransformSpacesById; }, function(value) { groupTransformSpacesById = value; });
bindRuntimeStateProperty("lineTransformsById", function() { return lineTransformsById; }, function(value) { lineTransformsById = value; });
bindRuntimeStateProperty("lineTransformSpacesById", function() { return lineTransformSpacesById; }, function(value) { lineTransformSpacesById = value; });
bindRuntimeStateProperty("namedObjectCache", function() { return namedObjectCache; }, function() {});
bindRuntimeStateProperty("hierarchyRangeConfig", function() { return hierarchyRangeConfig; }, function() {});

function log(msg) {
  runtime.deps.postLine("[lineBaseSystem] " + msg + "\n");
}

function twoDigitTime(value) {
  return lineBaseUtils.twoDigitTime(value);
}

function currentTimeStampHms() {
  return lineBaseUtils.currentTimeStampHms();
}

function currentDateStampYmd() {
  return lineBaseUtils.currentDateStampYmd();
}

function createPoolIdFromCurrentTime() {
  return "pool_" + currentDateStampYmd() + "_" + currentTimeStampHms();
}

function joinPath(folderPath, fileName) {
  return lineBaseIO.joinPath(folderPath, fileName);
}

function readTextFile(fullPath) {
  return lineBaseIO.readTextFile(fullPath);
}

function writeTextFileChunked(fullPath, contentText) {
  return lineBaseIO.writeTextFileChunked(fullPath, contentText);
}

function cloneJsonSafe(value) {
  return lineBaseUtils.cloneJsonSafe(value);
}

function poolChecksumFromRandomValues(randomValues) {
  return lineBaseUtils.poolChecksumFromRandomValues(randomValues);
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
    attributes.a.push(mapToRange(randomValues[cursor], 0.0, 1.0));
    cursor += 1;

    attributes.line_width.push(mapToRange(randomValues[cursor], lineWidthRangeMin, lineWidthRangeMax));
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
  return lineBaseValidators.isValidLoadedPoolPayload(payload);
}

function isValidPointOrderForPool(order, pointCount) {
  return lineBaseValidators.isValidPointOrderForPool(order, pointCount);
}

function isValidTransformVector3(values, positiveOnly) {
  return lineBaseValidators.isValidTransformVector3(values, positiveOnly);
}

function isValidTransformEntry(entry, requireLayerId) {
  return lineBaseValidators.isValidTransformEntry(entry, requireLayerId);
}

function isValidSceneTransformSpaceValue(value) {
  return lineBaseValidators.isValidSceneTransformSpaceValue(value);
}

function normalizeSceneTransformSpace(value) {
  return lineBaseValidators.normalizeSceneTransformSpace(value);
}

function ensureSceneTransformSpace() {
  sceneTransformSpace = normalizeSceneTransformSpace(sceneTransformSpace);
  return sceneTransformSpace;
}

function ensureLayerTransformSpace(layerId) {
  if (layerId === null || typeof layerId === "undefined") {
    return TRANSFORM_SPACE_LOCAL;
  }

  const key = String(layerId);
  if (key.length === 0) {
    return TRANSFORM_SPACE_LOCAL;
  }

  if (!layerTransformSpacesById[key]) {
    layerTransformSpacesById[key] = TRANSFORM_SPACE_LOCAL;
  }

  layerTransformSpacesById[key] = normalizeSceneTransformSpace(layerTransformSpacesById[key]);
  return layerTransformSpacesById[key];
}

function ensureGroupTransformSpace(groupId) {
  if (groupId === null || typeof groupId === "undefined") {
    return TRANSFORM_SPACE_LOCAL;
  }

  const key = String(groupId);
  if (key.length === 0) {
    return TRANSFORM_SPACE_LOCAL;
  }

  if (!groupTransformSpacesById[key]) {
    groupTransformSpacesById[key] = TRANSFORM_SPACE_LOCAL;
  }

  groupTransformSpacesById[key] = normalizeSceneTransformSpace(groupTransformSpacesById[key]);
  return groupTransformSpacesById[key];
}

function ensureLineTransformSpace(lineId) {
  if (lineId === null || typeof lineId === "undefined") {
    return TRANSFORM_SPACE_LOCAL;
  }

  const key = String(lineId);
  if (key.length === 0) {
    return TRANSFORM_SPACE_LOCAL;
  }

  if (!lineTransformSpacesById[key]) {
    lineTransformSpacesById[key] = TRANSFORM_SPACE_LOCAL;
  }

  lineTransformSpacesById[key] = normalizeSceneTransformSpace(lineTransformSpacesById[key]);
  return lineTransformSpacesById[key];
}

function isValidLoadedViewPayload(payload) {
  return lineBaseValidators.isValidLoadedViewPayload(payload);
}

function isValidLoadedIndexPayload(payload) {
  return lineBaseValidators.isValidLoadedIndexPayload(payload);
}

function applyVisibilityState(visibilityState) {
  lineBaseStateHelpers.applyVisibilityState(visibilityState);
}

function captureVisibilityState() {
  return lineBaseStateHelpers.captureVisibilityState();
}

function createIdentityColorDriverPermutation(lineCount) {
  const permutation = [];
  for (let i = 0; i < lineCount; i += 1) {
    permutation.push(i);
  }

  return permutation;
}

function isIdentityColorDriverPermutation(permutation) {
  if (!Array.isArray(permutation)) {
    return false;
  }

  for (let i = 0; i < permutation.length; i += 1) {
    if (Number(permutation[i]) !== i) {
      return false;
    }
  }

  return true;
}

function isValidColorDriverPermutation(permutation, expectedLength) {
  if (!Array.isArray(permutation) || permutation.length !== expectedLength) {
    return false;
  }

  const seen = {};
  for (let i = 0; i < permutation.length; i += 1) {
    const numeric = Number(permutation[i]);
    if (!isFinite(numeric)) {
      return false;
    }

    const index = Math.floor(numeric);
    if (index !== numeric || index < 0 || index >= expectedLength) {
      return false;
    }

    if (seen[index]) {
      return false;
    }

    seen[index] = true;
  }

  return true;
}

function getEffectiveColorDriverPermutation(definitions) {
  const lineCount = Array.isArray(definitions) ? definitions.length : 0;
  if (!isValidColorDriverPermutation(colorDriverPermutation, lineCount)) {
    return createIdentityColorDriverPermutation(lineCount);
  }

  const permutation = [];
  for (let i = 0; i < colorDriverPermutation.length; i += 1) {
    permutation.push(Number(colorDriverPermutation[i]));
  }

  return permutation;
}

function captureColorDriverPermutationState() {
  if (!Array.isArray(lineDefinitions) || lineDefinitions.length === 0) {
    return null;
  }

  if (!isValidColorDriverPermutation(colorDriverPermutation, lineDefinitions.length)) {
    return null;
  }

  if (isIdentityColorDriverPermutation(colorDriverPermutation)) {
    return null;
  }

  const snapshot = [];
  for (let i = 0; i < colorDriverPermutation.length; i += 1) {
    snapshot.push(Number(colorDriverPermutation[i]));
  }

  return snapshot;
}

function restoreColorDriverPermutationState(permutation, expectedLength) {
  if (!isValidColorDriverPermutation(permutation, expectedLength)) {
    colorDriverPermutation = null;
    return;
  }

  const restored = [];
  for (let i = 0; i < permutation.length; i += 1) {
    restored.push(Number(permutation[i]));
  }

  colorDriverPermutation = isIdentityColorDriverPermutation(restored) ? null : restored;
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
  if (layerId === null || typeof layerId === "undefined") {
    return null;
  }

  const key = String(layerId);
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
  if (groupId === null || typeof groupId === "undefined") {
    return null;
  }

  const key = String(groupId);
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

function ensureLineTransform(lineId) {
  if (lineId === null || typeof lineId === "undefined") {
    return null;
  }

  const key = String(lineId);
  if (key.length === 0) {
    return null;
  }

  if (!lineTransformsById[key]) {
    lineTransformsById[key] = createIdentityTransform();
  }

  lineTransformsById[key] = normalizeTransform(lineTransformsById[key]);
  return lineTransformsById[key];
}

function ensureSceneTransform() {
  sceneTransform = normalizeTransform(sceneTransform);
  return sceneTransform;
}

function reconcileTransformState() {
  if (!hierarchy || !Array.isArray(hierarchy.layers) || !Array.isArray(hierarchy.groups)) {
    layerTransformsById = {};
    layerTransformSpacesById = {};
    groupTransformsById = {};
    groupTransformSpacesById = {};
    lineTransformsById = {};
    lineTransformSpacesById = {};
    return;
  }

  const nextLayerTransforms = {};
  const nextLayerTransformSpaces = {};
  const nextGroupTransforms = {};
  const nextGroupTransformSpaces = {};
  const nextLineTransforms = {};
  const nextLineTransformSpaces = {};

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    const layer = hierarchy.layers[i];
    if (!layer || typeof layer.layer_id !== "string") {
      continue;
    }

    const layerId = layer.layer_id;
    nextLayerTransforms[layerId] = normalizeTransform(layerTransformsById[layerId]);
    nextLayerTransformSpaces[layerId] = ensureLayerTransformSpace(layerId);
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
    nextGroupTransformSpaces[groupId] = ensureGroupTransformSpace(groupId);
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lineId = String(line.id);
    nextLineTransforms[lineId] = normalizeTransform(lineTransformsById[lineId]);
    nextLineTransformSpaces[lineId] = ensureLineTransformSpace(lineId);
  }

  layerTransformsById = nextLayerTransforms;
  layerTransformSpacesById = nextLayerTransformSpaces;
  groupTransformsById = nextGroupTransforms;
  groupTransformSpacesById = nextGroupTransformSpaces;
  lineTransformsById = nextLineTransforms;
  lineTransformSpacesById = nextLineTransformSpaces;
}

function captureLayerTransformState() {
  return lineBaseStateHelpers.captureLayerTransformState();
}

function captureLayerTransformSpaceState() {
  return lineBaseStateHelpers.captureLayerTransformSpaceState();
}

function captureGroupTransformState() {
  return lineBaseStateHelpers.captureGroupTransformState();
}

function captureGroupTransformSpaceState() {
  return lineBaseStateHelpers.captureGroupTransformSpaceState();
}

function captureLineTransformState() {
  return lineBaseStateHelpers.captureLineTransformState();
}

function captureLineTransformSpaceState() {
  return lineBaseStateHelpers.captureLineTransformSpaceState();
}

function captureRenderSettingsState() {
  return {
    erase_color: eraseColor.slice(),
    color_map: colorMap.slice(),
    linewidth_range: [Number(lineWidthRangeMin), Number(lineWidthRangeMax)],
    linewidth_multiplier: Number(lineWidthMultiplier)
  };
}

function captureSceneTransformState() {
  return lineBaseStateHelpers.captureSceneTransformState();
}

function captureSceneTransformSpaceState() {
  return lineBaseStateHelpers.captureSceneTransformSpaceState();
}

function applyLayerTransformState(stateById) {
  lineBaseStateHelpers.applyLayerTransformState(stateById);
}

function applyLayerTransformSpaceState(stateById) {
  lineBaseStateHelpers.applyLayerTransformSpaceState(stateById);
}

function applyGroupTransformState(stateById) {
  lineBaseStateHelpers.applyGroupTransformState(stateById);
}

function applyGroupTransformSpaceState(stateById) {
  lineBaseStateHelpers.applyGroupTransformSpaceState(stateById);
}

function applyLineTransformState(stateById) {
  lineBaseStateHelpers.applyLineTransformState(stateById);
}

function applyLineTransformSpaceState(stateById) {
  lineBaseStateHelpers.applyLineTransformSpaceState(stateById);
}

function isValidEraseColorArray(value) {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    isFinite(Number(value[0])) &&
    isFinite(Number(value[1])) &&
    isFinite(Number(value[2])) &&
    isFinite(Number(value[3]))
  );
}

function isValidColorMapArray(value) {
  if (!Array.isArray(value) || value.length !== 8) {
    return false;
  }

  for (let i = 0; i < value.length; i += 2) {
    const minValue = Number(value[i]);
    const maxValue = Number(value[i + 1]);

    if (!isFinite(minValue) || !isFinite(maxValue)) {
      return false;
    }

    if (minValue < 0 || minValue > 1 || maxValue < 0 || maxValue > 1) {
      return false;
    }

    if (minValue >= maxValue) {
      return false;
    }
  }

  return true;
}

function emitColorMapState() {
  outlet(
    0,
    "color_map",
    colorMap[0],
    colorMap[1],
    colorMap[2],
    colorMap[3],
    colorMap[4],
    colorMap[5],
    colorMap[6],
    colorMap[7]
  );
}

function resolveColorDriverSourceIndex(definitions, lineIndex, fallbackStartPointIndex) {
  if (!Array.isArray(definitions) || definitions.length === 0) {
    return fallbackStartPointIndex;
  }

  const permutation = getEffectiveColorDriverPermutation(definitions);
  const sourceDefinition = definitions[permutation[lineIndex]];
  if (!sourceDefinition || !isFinite(Number(sourceDefinition.start_index))) {
    return fallbackStartPointIndex;
  }

  return Number(sourceDefinition.start_index);
}

function buildMappedColorFromAttributes(attributes, definitions, lineIndex, fallbackStartPointIndex) {
  const sourceIndex = resolveColorDriverSourceIndex(definitions, lineIndex, fallbackStartPointIndex);

  return [
    mapToRange(attributes.r[sourceIndex], colorMap[0], colorMap[1]),
    mapToRange(attributes.g[sourceIndex], colorMap[2], colorMap[3]),
    mapToRange(attributes.b[sourceIndex], colorMap[4], colorMap[5]),
    mapToRange(attributes.a[sourceIndex], colorMap[6], colorMap[7])
  ];
}

function applyColorSortStateToBaselineLines(baselineLines, state) {
  const activeState = sanitizeSortState(state);

  if (!activeState.applied || Number(activeState.colors.amount) <= 0) {
    return;
  }

  const channelIndexes = activeState.colors.channel === SORT_CHANNEL_RGBA
    ? [0, 1, 2, 3]
    : [
      activeState.colors.channel === SORT_CHANNEL_R
        ? 0
        : activeState.colors.channel === SORT_CHANNEL_G
          ? 1
          : activeState.colors.channel === SORT_CHANNEL_B
            ? 2
            : 3
    ];

  for (let c = 0; c < channelIndexes.length; c += 1) {
    const colorIndex = channelIndexes[c];
    const values = [];
    for (let i = 0; i < baselineLines.length; i += 1) {
      values.push(Number(baselineLines[i].color[colorIndex]));
    }

    const blended = sortBlendValues(values, activeState.colors.mode, activeState.colors.amount);
    for (let i = 0; i < baselineLines.length; i += 1) {
      baselineLines[i].color[colorIndex] = blended[i];
    }
  }
}

function applyCurrentDerivedColorsToLines() {
  if (!randomPool || !Array.isArray(lines) || lines.length === 0) {
    return;
  }

  const baselineLines = buildBaselineLinesFromCurrentPool();
  applyColorSortStateToBaselineLines(baselineLines, sortState);

  const baselineById = {};
  for (let i = 0; i < baselineLines.length; i += 1) {
    baselineById[baselineLines[i].id] = baselineLines[i].color.slice();
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (baselineById[line.id]) {
      line.color = baselineById[line.id].slice();
    }
  }
}

function isValidLineWidthRangeValues(minWidth, maxWidth) {
  const minNumeric = Number(minWidth);
  const maxNumeric = Number(maxWidth);

  if (!isFinite(minNumeric) || !isFinite(maxNumeric)) {
    return false;
  }

  if (minNumeric <= 0 || maxNumeric <= 0) {
    return false;
  }

  if (minNumeric >= maxNumeric) {
    return false;
  }

  return true;
}

function isValidLineWidthRangeArray(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isValidLineWidthRangeValues(value[0], value[1])
  );
}

function isValidLineWidthMultiplierValue(value) {
  const numeric = Number(value);
  return isFinite(numeric) && numeric > 0;
}

function applyRenderSettingsState(renderSettings) {
  if (!renderSettings || typeof renderSettings !== "object") {
    return false;
  }

  let didApplyEraseColor = false;

  const nextEraseColor = renderSettings.erase_color;
  if (isValidEraseColorArray(nextEraseColor)) {
    eraseColor = [
      Number(nextEraseColor[0]),
      Number(nextEraseColor[1]),
      Number(nextEraseColor[2]),
      Number(nextEraseColor[3])
    ];
    didApplyEraseColor = true;
  }

  const nextColorMap = renderSettings.color_map;
  if (isValidColorMapArray(nextColorMap)) {
    colorMap = nextColorMap.slice();
  }

  const nextLineWidthRange = renderSettings.linewidth_range;
  if (isValidLineWidthRangeArray(nextLineWidthRange)) {
    lineWidthRangeMin = Number(nextLineWidthRange[0]);
    lineWidthRangeMax = Number(nextLineWidthRange[1]);
  }

  const nextLineWidthMultiplier = renderSettings.linewidth_multiplier;
  if (isValidLineWidthMultiplierValue(nextLineWidthMultiplier)) {
    lineWidthMultiplier = Number(nextLineWidthMultiplier);
  }

  return didApplyEraseColor;
}

function applySceneTransformState(state) {
  lineBaseStateHelpers.applySceneTransformState(state);
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

function applyTransformToPointAroundPivot(point, transform, pivot) {
  if (!Array.isArray(point) || point.length !== 3 || !transform || !Array.isArray(pivot) || pivot.length !== 3) {
    return point;
  }

  const offsetPoint = [
    Number(point[0]) - Number(pivot[0]),
    Number(point[1]) - Number(pivot[1]),
    Number(point[2]) - Number(pivot[2])
  ];

  const transformed = applyTransformToPoint(offsetPoint, transform);

  return [
    Number(transformed[0]) + Number(pivot[0]),
    Number(transformed[1]) + Number(pivot[1]),
    Number(transformed[2]) + Number(pivot[2])
  ];
}

function computeRenderBoundsWithoutScene() {
  const bounds = {
    minX: null,
    minY: null,
    minZ: null,
    maxX: null,
    maxY: null,
    maxZ: null
  };

  const groupPivotsById = computeGroupRenderPivotPoints();
  const layerPivotsById = computeLayerRenderPivotPoints(groupPivotsById);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!isLineVisibleByHierarchy(line)) {
      continue;
    }

    const baseStart = Array.isArray(line.base_start_coords) ? line.base_start_coords : line.start_coords;
    const baseEnd = Array.isArray(line.base_end_coords) ? line.base_end_coords : line.end_coords;
    const drawStart = transformedLineEndpoint(line, baseStart, groupPivotsById, layerPivotsById);
    const drawEnd = transformedLineEndpoint(line, baseEnd, groupPivotsById, layerPivotsById);

    const points = [drawStart, drawEnd];
    for (let j = 0; j < points.length; j += 1) {
      const point = points[j];
      if (!point) {
        continue;
      }

      if (bounds.minX === null || point[0] < bounds.minX) bounds.minX = point[0];
      if (bounds.minY === null || point[1] < bounds.minY) bounds.minY = point[1];
      if (bounds.minZ === null || point[2] < bounds.minZ) bounds.minZ = point[2];
      if (bounds.maxX === null || point[0] > bounds.maxX) bounds.maxX = point[0];
      if (bounds.maxY === null || point[1] > bounds.maxY) bounds.maxY = point[1];
      if (bounds.maxZ === null || point[2] > bounds.maxZ) bounds.maxZ = point[2];
    }
  }

  if (bounds.minX === null) {
    return null;
  }

  return bounds;
}

function getRenderPivotPoint() {
  const bounds = computeRenderBoundsWithoutScene();
  if (!bounds) {
    return [0, 0, 0];
  }

  return [
    (bounds.minX + bounds.maxX) / 2,
    (bounds.minY + bounds.maxY) / 2,
    (bounds.minZ + bounds.maxZ) / 2
  ];
}

function computeGroupRenderPivotPoints() {
  const boundsByGroupId = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!isLineVisibleByHierarchy(line)) {
      continue;
    }

    const group = getHierarchyGroupById(line.group_id);
    const groupId = group && typeof group.group_id === "string"
      ? group.group_id
      : line.group_id;

    if (typeof groupId !== "string" || groupId.length === 0) {
      continue;
    }

    if (!boundsByGroupId[groupId]) {
      boundsByGroupId[groupId] = {
        minX: null,
        minY: null,
        minZ: null,
        maxX: null,
        maxY: null,
        maxZ: null
      };
    }

    const baseStart = Array.isArray(line.base_start_coords) ? line.base_start_coords : line.start_coords;
    const baseEnd = Array.isArray(line.base_end_coords) ? line.base_end_coords : line.end_coords;
    const points = [
      lineBaseRender.applyLineTransform(line, baseStart),
      lineBaseRender.applyLineTransform(line, baseEnd)
    ];
    const groupBounds = boundsByGroupId[groupId];

    for (let j = 0; j < points.length; j += 1) {
      const point = points[j];
      if (!Array.isArray(point) || point.length !== 3) {
        continue;
      }

      if (groupBounds.minX === null || point[0] < groupBounds.minX) groupBounds.minX = point[0];
      if (groupBounds.minY === null || point[1] < groupBounds.minY) groupBounds.minY = point[1];
      if (groupBounds.minZ === null || point[2] < groupBounds.minZ) groupBounds.minZ = point[2];
      if (groupBounds.maxX === null || point[0] > groupBounds.maxX) groupBounds.maxX = point[0];
      if (groupBounds.maxY === null || point[1] > groupBounds.maxY) groupBounds.maxY = point[1];
      if (groupBounds.maxZ === null || point[2] > groupBounds.maxZ) groupBounds.maxZ = point[2];
    }
  }

  const pivotsByGroupId = {};
  const groupIds = Object.keys(boundsByGroupId);
  for (let i = 0; i < groupIds.length; i += 1) {
    const groupId = groupIds[i];
    const groupBounds = boundsByGroupId[groupId];
    if (!groupBounds || groupBounds.minX === null) {
      continue;
    }

    pivotsByGroupId[groupId] = [
      (groupBounds.minX + groupBounds.maxX) / 2,
      (groupBounds.minY + groupBounds.maxY) / 2,
      (groupBounds.minZ + groupBounds.maxZ) / 2
    ];
  }

  return pivotsByGroupId;
}

function computeLayerRenderPivotPoints(groupPivotsById) {
  const boundsByLayerId = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!isLineVisibleByHierarchy(line)) {
      continue;
    }

    const group = getHierarchyGroupById(line.group_id);
    const layerId = group && typeof group.layer_id === "string"
      ? group.layer_id
      : line.layer_id;

    if (typeof layerId !== "string" || layerId.length === 0) {
      continue;
    }

    if (!boundsByLayerId[layerId]) {
      boundsByLayerId[layerId] = {
        minX: null,
        minY: null,
        minZ: null,
        maxX: null,
        maxY: null,
        maxZ: null
      };
    }

    const groupTransform = group && groupTransformsById[group.group_id]
      ? normalizeTransform(groupTransformsById[group.group_id], group.layer_id)
      : null;
    const groupSpace = group && typeof group.group_id === "string"
      ? ensureGroupTransformSpace(group.group_id)
      : TRANSFORM_SPACE_LOCAL;
    const groupPivot = group && groupPivotsById && groupPivotsById[group.group_id]
      ? groupPivotsById[group.group_id]
      : null;
    const baseStart = Array.isArray(line.base_start_coords) ? line.base_start_coords : line.start_coords;
    const baseEnd = Array.isArray(line.base_end_coords) ? line.base_end_coords : line.end_coords;
    let drawStart = lineBaseRender.applyLineTransform(line, baseStart);
    let drawEnd = lineBaseRender.applyLineTransform(line, baseEnd);

    if (drawStart && groupTransform) {
      drawStart = groupSpace === TRANSFORM_SPACE_LOCAL && groupPivot
        ? applyTransformToPointAroundPivot(drawStart, groupTransform, groupPivot)
        : applyTransformToPoint(drawStart, groupTransform);
    }
    if (drawEnd && groupTransform) {
      drawEnd = groupSpace === TRANSFORM_SPACE_LOCAL && groupPivot
        ? applyTransformToPointAroundPivot(drawEnd, groupTransform, groupPivot)
        : applyTransformToPoint(drawEnd, groupTransform);
    }

    const points = [drawStart, drawEnd];
    const layerBounds = boundsByLayerId[layerId];
    for (let j = 0; j < points.length; j += 1) {
      const point = points[j];
      if (!point) {
        continue;
      }

      if (layerBounds.minX === null || point[0] < layerBounds.minX) layerBounds.minX = point[0];
      if (layerBounds.minY === null || point[1] < layerBounds.minY) layerBounds.minY = point[1];
      if (layerBounds.minZ === null || point[2] < layerBounds.minZ) layerBounds.minZ = point[2];
      if (layerBounds.maxX === null || point[0] > layerBounds.maxX) layerBounds.maxX = point[0];
      if (layerBounds.maxY === null || point[1] > layerBounds.maxY) layerBounds.maxY = point[1];
      if (layerBounds.maxZ === null || point[2] > layerBounds.maxZ) layerBounds.maxZ = point[2];
    }
  }

  const pivotsByLayerId = {};
  const layerIds = Object.keys(boundsByLayerId);
  for (let i = 0; i < layerIds.length; i += 1) {
    const layerId = layerIds[i];
    const layerBounds = boundsByLayerId[layerId];
    if (!layerBounds || layerBounds.minX === null) {
      continue;
    }

    pivotsByLayerId[layerId] = [
      (layerBounds.minX + layerBounds.maxX) / 2,
      (layerBounds.minY + layerBounds.maxY) / 2,
      (layerBounds.minZ + layerBounds.maxZ) / 2
    ];
  }

  return pivotsByLayerId;
}

function transformedLineEndpoint(line, point, groupPivotsById, layerPivotsById) {
  if (!line || !Array.isArray(point) || point.length !== 3) {
    return point;
  }

  let transformed = lineBaseRender.applyLineTransform(line, point);

  const group = getHierarchyGroupById(line.group_id);
  const groupTransform = group && groupTransformsById[group.group_id]
    ? normalizeTransform(groupTransformsById[group.group_id], group.layer_id)
    : null;
  if (groupTransform) {
    const groupSpace = ensureGroupTransformSpace(group.group_id);
    const groupPivot = groupPivotsById && groupPivotsById[group.group_id] ? groupPivotsById[group.group_id] : null;
    transformed = groupSpace === TRANSFORM_SPACE_LOCAL && groupPivot
      ? applyTransformToPointAroundPivot(transformed, groupTransform, groupPivot)
      : applyTransformToPoint(transformed, groupTransform);
  }

  const layerId = group && typeof group.layer_id === "string"
    ? group.layer_id
    : line.layer_id;
  const layerTransform = layerId && layerTransformsById[layerId]
    ? normalizeTransform(layerTransformsById[layerId])
    : null;
  if (layerTransform) {
    const layerSpace = ensureLayerTransformSpace(layerId);
    const layerPivot = layerPivotsById && layerPivotsById[layerId] ? layerPivotsById[layerId] : null;
    transformed = layerSpace === TRANSFORM_SPACE_LOCAL && layerPivot
      ? applyTransformToPointAroundPivot(transformed, layerTransform, layerPivot)
      : applyTransformToPoint(transformed, layerTransform);
  }

  return transformed;
}

function mapToRange(value, min, max) {
  return lineBaseUtils.mapToRange(value, min, max);
}

function createDefaultSortState() {
  return {
    coords: {
      axis: SORT_AXIS_XYZ,
      mode: SORT_MODE_ASC,
      amount: 0
    },
    colors: {
      channel: SORT_CHANNEL_RGBA,
      mode: SORT_MODE_ASC,
      amount: 0
    },
    width: {
      mode: SORT_MODE_ASC,
      amount: 0
    },
    applied: 0
  };
}

function cloneSortState(state) {
  return {
    coords: {
      axis: state.coords.axis,
      mode: state.coords.mode,
      amount: Number(state.coords.amount)
    },
    colors: {
      channel: state.colors.channel,
      mode: state.colors.mode,
      amount: Number(state.colors.amount)
    },
    width: {
      mode: state.width.mode,
      amount: Number(state.width.amount)
    },
    applied: state.applied ? 1 : 0
  };
}

function clampSortAmount(amount) {
  const numeric = Number(amount);
  if (!isFinite(numeric)) {
    return 0;
  }

  if (numeric < 0) {
    return 0;
  }

  if (numeric > 1) {
    return 1;
  }

  return numeric;
}

function isValidSortMode(mode) {
  return mode === SORT_MODE_ASC || mode === SORT_MODE_DESC;
}

function isValidSortAxis(axis) {
  return axis === SORT_AXIS_X || axis === SORT_AXIS_Y || axis === SORT_AXIS_Z || axis === SORT_AXIS_XYZ;
}

function isValidSortChannel(channel) {
  return (
    channel === SORT_CHANNEL_R ||
    channel === SORT_CHANNEL_G ||
    channel === SORT_CHANNEL_B ||
    channel === SORT_CHANNEL_A ||
    channel === SORT_CHANNEL_RGBA
  );
}

function sanitizeSortMode(mode, fallback) {
  const normalized = String(mode || "").toLowerCase();
  return isValidSortMode(normalized) ? normalized : fallback;
}

function sanitizeSortAxis(axis) {
  const normalized = String(axis || "").toLowerCase();
  return isValidSortAxis(normalized) ? normalized : SORT_AXIS_XYZ;
}

function sanitizeSortChannel(channel) {
  const normalized = String(channel || "").toLowerCase();
  return isValidSortChannel(normalized) ? normalized : SORT_CHANNEL_RGBA;
}

function sanitizeSortState(rawState) {
  const fallback = createDefaultSortState();
  const source = rawState && typeof rawState === "object" ? rawState : {};
  const coords = source.coords && typeof source.coords === "object" ? source.coords : {};
  const colors = source.colors && typeof source.colors === "object" ? source.colors : {};
  const width = source.width && typeof source.width === "object" ? source.width : {};

  return {
    coords: {
      axis: sanitizeSortAxis(coords.axis),
      mode: sanitizeSortMode(coords.mode, fallback.coords.mode),
      amount: clampSortAmount(coords.amount)
    },
    colors: {
      channel: sanitizeSortChannel(colors.channel),
      mode: sanitizeSortMode(colors.mode, fallback.colors.mode),
      amount: clampSortAmount(colors.amount)
    },
    width: {
      mode: sanitizeSortMode(width.mode, fallback.width.mode),
      amount: clampSortAmount(width.amount)
    },
    applied: source.applied ? 1 : 0
  };
}

function hasActiveSortAmounts(state) {
  return (
    Number(state.coords.amount) > 0 ||
    Number(state.colors.amount) > 0 ||
    Number(state.width.amount) > 0
  );
}

function ensureSortDataAvailable(commandName) {
  if (!randomPool || !lines || lines.length === 0) {
    log(commandName + " requires generated data");
    return false;
  }

  return true;
}

function sortBlendValues(values, mode, amount) {
  const sourceValues = values.slice();
  const blendedAmount = clampSortAmount(amount);

  if (blendedAmount <= 0) {
    return sourceValues;
  }

  const sortedValues = values.slice().sort(function(a, b) {
    return mode === SORT_MODE_DESC ? b - a : a - b;
  });

  if (blendedAmount >= 1) {
    return sortedValues;
  }

  const blendedValues = [];
  for (let i = 0; i < sourceValues.length; i += 1) {
    blendedValues.push(sourceValues[i] + (sortedValues[i] - sourceValues[i]) * blendedAmount);
  }

  return blendedValues;
}

function buildBaselineLinesFromCurrentPool() {
  if (!randomPool) {
    return [];
  }

  const definitions = buildLineDefinitionsFromPointOrder(pointOrder);
  const activeAttributes = getActiveAttributes(randomPool);
  const baselineLines = [];

  for (let i = 0; i < definitions.length; i += 1) {
    const definition = definitions[i];
    const startPointIndex = definition.start_index;
    const endPointIndex = definition.end_index;
    const startCoords = getPointCoordinates(randomPool, startPointIndex);
    const endCoords = getPointCoordinates(randomPool, endPointIndex);

    baselineLines.push({
      id: definition.id,
      start_coords: startCoords,
      end_coords: endCoords,
      color: buildMappedColorFromAttributes(activeAttributes, definitions, i, startPointIndex),
      line_width: activeAttributes.line_width[startPointIndex]
    });
  }

  return baselineLines;
}

function applySortedStateToBaselineLines(baselineLines, state) {
  const activeState = sanitizeSortState(state);

  if (Number(activeState.coords.amount) > 0) {
    const endpointEntries = [];
    for (let i = 0; i < baselineLines.length; i += 1) {
      endpointEntries.push({ line: baselineLines[i], key: "start_coords" });
      endpointEntries.push({ line: baselineLines[i], key: "end_coords" });
    }

    const axisList = activeState.coords.axis === SORT_AXIS_XYZ
      ? [SORT_AXIS_X, SORT_AXIS_Y, SORT_AXIS_Z]
      : [activeState.coords.axis];

    for (let axisIndex = 0; axisIndex < axisList.length; axisIndex += 1) {
      const axisName = axisList[axisIndex];
      const coordinateIndex = axisName === SORT_AXIS_X ? 0 : (axisName === SORT_AXIS_Y ? 1 : 2);
      const values = [];

      for (let i = 0; i < endpointEntries.length; i += 1) {
        values.push(Number(endpointEntries[i].line[endpointEntries[i].key][coordinateIndex]));
      }

      const blended = sortBlendValues(values, activeState.coords.mode, activeState.coords.amount);
      for (let i = 0; i < endpointEntries.length; i += 1) {
        endpointEntries[i].line[endpointEntries[i].key][coordinateIndex] = blended[i];
      }
    }
  }

  applyColorSortStateToBaselineLines(baselineLines, activeState);

  if (Number(activeState.width.amount) > 0) {
    const widths = [];
    for (let i = 0; i < baselineLines.length; i += 1) {
      widths.push(Number(baselineLines[i].line_width));
    }

    const blendedWidths = sortBlendValues(widths, activeState.width.mode, activeState.width.amount);
    for (let i = 0; i < baselineLines.length; i += 1) {
      baselineLines[i].line_width = blendedWidths[i];
    }
  }
}

function applyBaselineLinesToCurrentLines(baselineLines) {
  const baselineById = {};
  for (let i = 0; i < baselineLines.length; i += 1) {
    baselineById[baselineLines[i].id] = baselineLines[i];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const targetLine = lines[i];
    const baseline = baselineById[targetLine.id];
    if (!baseline) {
      continue;
    }

    targetLine.base_start_coords = baseline.start_coords.slice();
    targetLine.base_end_coords = baseline.end_coords.slice();
    targetLine.start_coords = baseline.start_coords.slice();
    targetLine.end_coords = baseline.end_coords.slice();
    targetLine.color = baseline.color.slice();
    targetLine.line_width = Number(baseline.line_width);
  }
}

function applyCurrentSortStateToLines() {
  const baselineLines = buildBaselineLinesFromCurrentPool();
  applySortedStateToBaselineLines(baselineLines, sortState);
  applyBaselineLinesToCurrentLines(baselineLines);
}

function sketchWidth(lineWidth) {
  return lineBaseRender.sketchWidth(lineWidth);
}

function pointCountFromLineCount(lineCount) {
  return lineBaseUtils.pointCountFromLineCount(lineCount);
}

function randomCountFromLineCount(lineCount) {
  return lineBaseUtils.randomCountFromLineCount(lineCount, RANDOMS_PER_POINT);
}

function createRandomValues(count) {
  return lineBaseUtils.createRandomValues(count);
}

function createPointOrder(pointCount) {
  return lineBaseUtils.createPointOrder(pointCount);
}

function shufflePointOrder(order) {
  lineBaseUtils.shuffleArrayInPlace(order);
}

function getActiveCoordinates(pool) {
  if (
    poolOverrides &&
    poolOverrides.coordinates &&
    poolOverrides.coordinates.x &&
    poolOverrides.coordinates.y &&
    poolOverrides.coordinates.z &&
    poolOverrides.coordinates.x.length === pool.point_count &&
    poolOverrides.coordinates.y.length === pool.point_count &&
    poolOverrides.coordinates.z.length === pool.point_count
  ) {
    return poolOverrides.coordinates;
  }

  if (
    coordinateOverrides &&
    coordinateOverrides.x &&
    coordinateOverrides.y &&
    coordinateOverrides.z &&
    coordinateOverrides.x.length === pool.point_count &&
    coordinateOverrides.y.length === pool.point_count &&
    coordinateOverrides.z.length === pool.point_count
  ) {
    return coordinateOverrides;
  }

  return pool.coordinates;
}

function getActiveAttributes(pool) {
  if (
    poolOverrides &&
    poolOverrides.attributes &&
    poolOverrides.attributes.r &&
    poolOverrides.attributes.g &&
    poolOverrides.attributes.b &&
    poolOverrides.attributes.a &&
    poolOverrides.attributes.line_width &&
    poolOverrides.attributes.r.length === pool.point_count &&
    poolOverrides.attributes.g.length === pool.point_count &&
    poolOverrides.attributes.b.length === pool.point_count &&
    poolOverrides.attributes.a.length === pool.point_count &&
    poolOverrides.attributes.line_width.length === pool.point_count
  ) {
    return poolOverrides.attributes;
  }

  return pool.attributes;
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
  return lineBaseUtils.randomIntInclusive(minValue, maxValue);
}

function sanitizeRange(minValue, maxValue, fallbackMin, fallbackMax) {
  return lineBaseUtils.sanitizeRange(minValue, maxValue, fallbackMin, fallbackMax);
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
    attributes.a.push(mapToRange(randomValues[cursor], 0.0, 1.0));
    cursor += 1;

    attributes.line_width.push(mapToRange(randomValues[cursor], lineWidthRangeMin, lineWidthRangeMax));
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
  const coordinates = getActiveCoordinates(pool);
  return [
    mapToRange(coordinates.x[pointIndex], -1.0, 1.0),
    mapToRange(coordinates.y[pointIndex], -1.0, 1.0),
    mapToRange(coordinates.z[pointIndex], -1.0, 1.0)
  ];
}

function mapSpherePoint(pool, pointIndex) {
  const coordinates = getActiveCoordinates(pool);
  const radius = Math.cbrt(coordinates.x[pointIndex]);
  const theta = coordinates.y[pointIndex] * Math.PI * 2;
  const phi = Math.acos(2.0 * coordinates.z[pointIndex] - 1.0);

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
  const attributes = getActiveAttributes(pool);

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
      color: buildMappedColorFromAttributes(attributes, definitions, i, startPointIndex),
      line_width: attributes.line_width[startPointIndex],
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
  return lineBaseMenus.getNamedObject(objectName);
}

function getCachedNamedObject(objectName, forceRefresh) {
  return lineBaseMenus.getCachedNamedObject(objectName, forceRefresh);
}

function sendNamedObjectMessage(objectName, messageName, value) {
  return lineBaseMenus.sendNamedObjectMessage(objectName, messageName, value);
}

function clearNamedMenu(objectName) {
  return lineBaseMenus.clearNamedMenu(objectName);
}

function clearAllMenus() {
  return lineBaseMenus.clearAllMenus();
}

function appendNamedMenuItem(objectName, itemValue) {
  return lineBaseMenus.appendNamedMenuItem(objectName, itemValue);
}

function setNamedMenuSelection(objectName, selectionValue) {
  return lineBaseMenus.setNamedMenuSelection(objectName, selectionValue);
}

function currentSelectionValue(value) {
  return lineBaseMenuFlow.currentSelectionValue(value);
}

function emitCurrentSelection() {
  lineBaseMenuFlow.emitCurrentSelection();
}

function resolveMenuSelection(selectionValue, values) {
  return lineBaseMenuFlow.resolveMenuSelection(selectionValue, values);
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
  lineBaseMenuFlow.emitLineMenu();
}

function emitGroupMenu() {
  lineBaseMenuFlow.emitGroupMenu();
}

function emitLayerMenu() {
  lineBaseMenuFlow.emitLayerMenu();
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
  lineBaseRender.emitRenderCommands();
}

function architecture() {
  lineBaseReports.architecture();
}

function reportArchitectureRows() {
  lineBaseReports.reportArchitectureRows();
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

function set_erase_color(r, g, b, a) {
  const nextColor = [Number(r), Number(g), Number(b), Number(a)];

  for (let i = 0; i < nextColor.length; i += 1) {
    if (!isFinite(nextColor[i])) {
      log("set_erase_color requires four finite numeric values");
      return;
    }
  }

  eraseColor = nextColor;
}

function get_erase_color() {
  outlet(0, "erase_color", eraseColor[0], eraseColor[1], eraseColor[2], eraseColor[3]);
}

function set_color_map(rmin, rmax, gmin, gmax, bmin, bmax, amin, amax) {
  const nextColorMap = [
    Number(rmin), Number(rmax), Number(gmin), Number(gmax),
    Number(bmin), Number(bmax), Number(amin), Number(amax)
  ];

  if (!isValidColorMapArray(nextColorMap)) {
    log("set_color_map requires eight finite values in range 0..1 with min < max for each channel pair");
    return;
  }

  colorMap = nextColorMap;
  emitColorMapState();

  if (randomPool && lines.length > 0) {
    applyCurrentDerivedColorsToLines();
    emitRenderCommands();
  }
}

function get_color_map() {
  emitColorMapState();
}

function set_linewidth_range(min_width, max_width) {
  if (!isValidLineWidthRangeValues(min_width, max_width)) {
    log("set_linewidth_range requires finite values where min > 0, max > 0, and min < max");
    return;
  }

  lineWidthRangeMin = Number(min_width);
  lineWidthRangeMax = Number(max_width);
  outlet(0, "linewidth", lineWidthRangeMin, lineWidthRangeMax);

  if (randomPool && lines.length > 0) {
    emitRenderCommands();
  }
}

function get_linewidth_range() {
  outlet(0, "linewidth", lineWidthRangeMin, lineWidthRangeMax);
}

function set_linewidth_multiplier(multiplier) {
  if (!isValidLineWidthMultiplierValue(multiplier)) {
    log("set_linewidth_multiplier requires a finite value greater than 0");
    return;
  }

  lineWidthMultiplier = Number(multiplier);
  outlet(0, "linewidth_multiplier", lineWidthMultiplier);

  if (randomPool && lines.length > 0) {
    emitRenderCommands();
  }
}

function get_linewidth_multiplier() {
  outlet(0, "linewidth_multiplier", lineWidthMultiplier);
}

function get_poolId() {
  if (currentPoolId === null || currentPoolId === undefined || currentPoolId === "") {
    log("get_poolId: no poolId is currently set");
    return;
  }
  outlet(0, "pool_id", currentPoolId);
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

  coordinateOverrides = null;
  poolOverrides = null;
  colorDriverPermutation = null;
  sortState = createDefaultSortState();
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
    folder = runtime.deps.createFolder(targetPath);
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
  lineBaseIndexMutations.save_index();
}

function load_index() {
  lineBaseIndexMutations.load_index();
}

function clear_index_cache() {
  lineBaseIndexMutations.clear_index_cache();
}

function register_view(viewId, fullViewFilePath) {
  lineBaseIndexMutations.register_view(viewId, fullViewFilePath);
}

function unregister_view(viewId) {
  lineBaseIndexMutations.unregister_view(viewId);
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
  const fileName = "randomPool_" + timestamp + ".json";
  const fullPath = joinPath(targetPath, fileName);
  const poolId =
    typeof currentPoolId === "string" && currentPoolId.length > 0
      ? currentPoolId
      : createPoolIdFromCurrentTime();
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

  coordinateOverrides = null;
  poolOverrides = null;
  sortState = createDefaultSortState();
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
    sort_version: 1,
    view_id: resolvedViewId,
    pool_id: currentPoolId,
    saved_at: new Date().toISOString(),
    form: selectedFormName,
    point_order: pointOrder.slice(),
    hierarchy: cloneJsonSafe(hierarchy),
    hierarchy_ranges: cloneJsonSafe(hierarchyRangeConfig),
    visibility: captureVisibilityState(),
    line_width_by_line_id: captureLineWidthState(),
    render_settings: captureRenderSettingsState(),
    scene_transform: captureSceneTransformState(),
    scene_space: captureSceneTransformSpaceState(),
    layer_transforms_by_id: captureLayerTransformState(),
    layer_spaces_by_id: captureLayerTransformSpaceState(),
    group_transforms_by_id: captureGroupTransformState(),
    group_spaces_by_id: captureGroupTransformSpaceState(),
    line_transforms_by_id: captureLineTransformState(),
    line_spaces_by_id: captureLineTransformSpaceState(),
    sort_state: cloneSortState(sortState),
    selection: {
      layer_id: selectedLayerId,
      group_id: selectedGroupId,
      line_id: selectedLineId
    }
  };

  const savedColorDriverPermutation = captureColorDriverPermutationState();
  if (Array.isArray(savedColorDriverPermutation)) {
    payload.color_driver_permutation = savedColorDriverPermutation;
  }

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
  coordinateOverrides = null;
  poolOverrides = null;
  sortState = sanitizeSortState(parsed.sort_state);
  pointOrder = parsed.point_order.slice();
  restoreColorDriverPermutationState(parsed.color_driver_permutation, Math.floor(parsed.point_order.length / 2));
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
  sceneTransform = createIdentityTransform();
  sceneTransformSpace = TRANSFORM_SPACE_LOCAL;
  layerTransformSpacesById = {};
  groupTransformSpacesById = {};
  lineTransformSpacesById = {};

  if (parsed.layer_transforms_by_id && typeof parsed.layer_transforms_by_id === "object") {
    applyLayerTransformState(parsed.layer_transforms_by_id);
  }

  if (parsed.layer_spaces_by_id && typeof parsed.layer_spaces_by_id === "object") {
    applyLayerTransformSpaceState(parsed.layer_spaces_by_id);
  }

  if (parsed.group_transforms_by_id && typeof parsed.group_transforms_by_id === "object") {
    applyGroupTransformState(parsed.group_transforms_by_id);
  }

  if (parsed.group_spaces_by_id && typeof parsed.group_spaces_by_id === "object") {
    applyGroupTransformSpaceState(parsed.group_spaces_by_id);
  }

  if (parsed.line_transforms_by_id && typeof parsed.line_transforms_by_id === "object") {
    applyLineTransformState(parsed.line_transforms_by_id);
  }

  if (parsed.line_spaces_by_id && typeof parsed.line_spaces_by_id === "object") {
    applyLineTransformSpaceState(parsed.line_spaces_by_id);
  }

  if (parsed.scene_transform && typeof parsed.scene_transform === "object") {
    applySceneTransformState(parsed.scene_transform);
  }

  if (typeof parsed.scene_space !== "undefined") {
    sceneTransformSpace = normalizeSceneTransformSpace(parsed.scene_space);
  }

  eraseColor = DEFAULT_ERASE_COLOR.slice();
  colorMap = DEFAULT_COLOR_MAP.slice();
  lineWidthRangeMin = DEFAULT_LINE_WIDTH_RANGE_MIN;
  lineWidthRangeMax = DEFAULT_LINE_WIDTH_RANGE_MAX;
  lineWidthMultiplier = DEFAULT_LINE_WIDTH_MULTIPLIER;
  let didApplyRenderSettings = false;

  if (parsed.render_settings && typeof parsed.render_settings === "object") {
    didApplyRenderSettings = applyRenderSettingsState(parsed.render_settings);
  }

  // Backward compatibility for older view payloads that stored erase_color at top level.
  if (!didApplyRenderSettings && isValidEraseColorArray(parsed.erase_color)) {
    applyRenderSettingsState({ erase_color: parsed.erase_color });
  }

  emitColorMapState();
  outlet(0, "linewidth", lineWidthRangeMin, lineWidthRangeMax);
  outlet(0, "linewidth_multiplier", lineWidthMultiplier);

  applyHierarchyLineOrder();
  applyVisibilityState(parsed.visibility);

  if (parsed.line_width_by_line_id && typeof parsed.line_width_by_line_id === "object") {
    applyLineWidthState(parsed.line_width_by_line_id);
  }

  if (sortState.applied) {
    applyCurrentSortStateToLines();
  } else {
    applyCurrentDerivedColorsToLines();
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
  lineBaseReports.reportHierarchy();
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

function reshuffleLines() {
  if (!randomPool) {
    log("reshuffleLines requires generated data");
    return;
  }

  shufflePointOrder(pointOrder);
  rebuildSystemFromCurrentState();
  emitRenderCommands();
}

function reshuffleCoords() {
  if (!randomPool) {
    log("reshuffleCoords requires generated data");
    return;
  }

  const source = getActiveCoordinates(randomPool);
  const reshuffled = {
    x: source.x.slice(),
    y: source.y.slice(),
    z: source.z.slice()
  };

  shufflePointOrder(reshuffled.x);
  shufflePointOrder(reshuffled.y);
  shufflePointOrder(reshuffled.z);

  coordinateOverrides = reshuffled;
  poolOverrides = null;

  rebuildSystemFromCurrentState();
  emitRenderCommands();
  log("reshuffleCoords applied independent axis shuffle");
}

function reshuffleAll() {
  if (!randomPool) {
    log("reshuffleAll requires generated data");
    return;
  }

  const reshuffledRandomValues = randomPool.random_values.slice();
  shufflePointOrder(reshuffledRandomValues);

  poolOverrides = buildRandomPoolFromValues(randomPool.line_count, reshuffledRandomValues);
  coordinateOverrides = null;

  rebuildSystemFromCurrentState();
  emitRenderCommands();
  outlet(0, "reshuffle_all_applied", randomPool.line_count, randomPool.random_count);
  log("reshuffleAll applied full random-stream shuffle");
}

function sortAllNumbers(direction) {
  if (!randomPool) {
    log("sortAllNumbers requires generated data");
    return;
  }

  const normalizedDirection = String(direction || "").toLowerCase();
  if (normalizedDirection !== "asc" && normalizedDirection !== "desc") {
    log("sortAllNumbers requires asc or desc");
    return;
  }

  const sortedRandomValues = randomPool.random_values.slice();
  sortedRandomValues.sort(function(a, b) {
    return normalizedDirection === "asc" ? a - b : b - a;
  });

  poolOverrides = buildRandomPoolFromValues(randomPool.line_count, sortedRandomValues);
  coordinateOverrides = null;

  rebuildSystemFromCurrentState();
  emitRenderCommands();
  outlet(0, "sort_all_numbers_applied", normalizedDirection, randomPool.line_count, randomPool.random_count);
  log("sortAllNumbers applied full random-stream sort " + normalizedDirection);
}

function setSortCoords(axis, mode, amount) {
  if (!ensureSortDataAvailable("setSortCoords")) {
    return;
  }

  const normalizedAxis = String(axis || "").toLowerCase();
  const normalizedMode = String(mode || "").toLowerCase();

  if (!isValidSortAxis(normalizedAxis)) {
    log("setSortCoords axis must be x, y, z, or xyz");
    return;
  }

  if (!isValidSortMode(normalizedMode)) {
    log("setSortCoords mode must be asc or desc");
    return;
  }

  sortState.coords.axis = normalizedAxis;
  sortState.coords.mode = normalizedMode;
  sortState.coords.amount = clampSortAmount(amount);
  sortState.applied = 0;

  outlet(0, "sort_set", "coords", sortState.coords.axis, sortState.coords.mode, sortState.coords.amount);
}

function setSortColors(channel, mode, amount) {
  if (!ensureSortDataAvailable("setSortColors")) {
    return;
  }

  const normalizedChannel = String(channel || "").toLowerCase();
  const normalizedMode = String(mode || "").toLowerCase();

  if (!isValidSortChannel(normalizedChannel)) {
    log("setSortColors channel must be r, g, b, a, or rgba");
    return;
  }

  if (!isValidSortMode(normalizedMode)) {
    log("setSortColors mode must be asc or desc");
    return;
  }

  sortState.colors.channel = normalizedChannel;
  sortState.colors.mode = normalizedMode;
  sortState.colors.amount = clampSortAmount(amount);
  sortState.applied = 0;

  outlet(0, "sort_set", "colors", sortState.colors.channel, sortState.colors.mode, sortState.colors.amount);
}

function setSortWidth(mode, amount) {
  if (!ensureSortDataAvailable("setSortWidth")) {
    return;
  }

  const normalizedMode = String(mode || "").toLowerCase();
  if (!isValidSortMode(normalizedMode)) {
    log("setSortWidth mode must be asc or desc");
    return;
  }

  sortState.width.mode = normalizedMode;
  sortState.width.amount = clampSortAmount(amount);
  sortState.applied = 0;

  outlet(0, "sort_set", "width", sortState.width.mode, sortState.width.amount);
}

function applySort() {
  if (!ensureSortDataAvailable("applySort")) {
    return;
  }

  const hasActiveAmounts = hasActiveSortAmounts(sortState);
  sortState.applied = hasActiveAmounts ? 1 : 0;

  if (!hasActiveAmounts) {
    outlet(0, "sort_applied");
    return;
  }

  applyCurrentSortStateToLines();
  emitRenderCommands();

  outlet(0, "sort_applied");
}

function resetSort() {
  if (!ensureSortDataAvailable("resetSort")) {
    return;
  }

  sortState = createDefaultSortState();
  applyCurrentSortStateToLines();
  emitRenderCommands();

  outlet(0, "sort_reset");
}

function getSortState() {
  if (!ensureSortDataAvailable("getSortState")) {
    return;
  }

  outlet(
    0,
    "sort_state",
    sortState.coords.axis,
    sortState.coords.mode,
    sortState.coords.amount,
    sortState.colors.channel,
    sortState.colors.mode,
    sortState.colors.amount,
    sortState.width.mode,
    sortState.width.amount,
    sortState.applied ? 1 : 0
  );
}

function reportSortRows() {
  if (!ensureSortDataAvailable("reportSortRows")) {
    return;
  }

  let rowCount = 0;

  outlet(0, "sort_rows_begin");

  outlet(0, "sort_row", "coords", sortState.coords.axis, sortState.coords.mode, sortState.coords.amount);
  rowCount += 1;

  outlet(0, "sort_row", "colors", sortState.colors.channel, sortState.colors.mode, sortState.colors.amount);
  rowCount += 1;

  outlet(0, "sort_row", "width", "width", sortState.width.mode, sortState.width.amount);
  rowCount += 1;

  outlet(0, "sort_rows_end", rowCount);
}

function reshuffleLineColors() {
  if (!randomPool || !Array.isArray(lineDefinitions) || lineDefinitions.length === 0 || !lines || lines.length === 0) {
    log("reshuffleLineColors requires generated data");
    return;
  }

  const nextPermutation = getEffectiveColorDriverPermutation(lineDefinitions);

  for (let i = nextPermutation.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = nextPermutation[i];
    nextPermutation[i] = nextPermutation[j];
    nextPermutation[j] = temp;
  }

  colorDriverPermutation = isIdentityColorDriverPermutation(nextPermutation) ? null : nextPermutation;

  applyCurrentDerivedColorsToLines();
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

function getSelectedLineForTransformCommands() {
  if (!lines || lines.length === 0) {
    log("transform command requires generated data");
    return null;
  }

  if (selectedLineId === null || typeof selectedLineId === "undefined") {
    log("transform command requires selected line");
    return null;
  }

  const line = getLineById(Number(selectedLineId));
  if (!line) {
    log("transform command unknown selected line " + selectedLineId);
    return null;
  }

  return line;
}

function emitLayerTransformRow(layerId) {
  lineBaseReports.emitLayerTransformRow(layerId);
}

function emitLayerSpaceRow(layerId) {
  lineBaseReports.emitLayerSpaceRow(layerId);
}

function emitGroupTransformRow(groupId, layerId) {
  lineBaseReports.emitGroupTransformRow(groupId, layerId);
}

function emitGroupSpaceRow(groupId, layerId) {
  lineBaseReports.emitGroupSpaceRow(groupId, layerId);
}

function emitLineTransformRow(lineId) {
  lineBaseReports.emitLineTransformRow(lineId);
}

function emitSceneTransformRow() {
  lineBaseReports.emitSceneTransformRow();
}

function emitSceneSpaceRow() {
  lineBaseReports.emitSceneSpaceRow();
}

function setLayerPosition(x, y, z) {
  lineBaseTransformMutations.setLayerPosition(x, y, z);
}

function setLayerRotation(x, y, z) {
  lineBaseTransformMutations.setLayerRotation(x, y, z);
}

function setLayerScale(x, y, z) {
  lineBaseTransformMutations.setLayerScale(x, y, z);
}

function setLayerTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
  lineBaseTransformMutations.setLayerTransform(px, py, pz, rx, ry, rz, sx, sy, sz);
}

function resetLayerTransform() {
  lineBaseTransformMutations.resetLayerTransform();
}

function getLayerTransform() {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  emitLayerTransformRow(layer.layer_id);
}

function setLayerSpace(mode) {
  lineBaseTransformMutations.setLayerSpace(mode);
}

function getLayerSpace() {
  const layer = getSelectedLayerForTransformCommands();
  if (!layer) {
    return;
  }

  emitLayerSpaceRow(layer.layer_id);
}

function setGroupPosition(x, y, z) {
  lineBaseTransformMutations.setGroupPosition(x, y, z);
}

function setGroupRotation(x, y, z) {
  lineBaseTransformMutations.setGroupRotation(x, y, z);
}

function setGroupScale(x, y, z) {
  lineBaseTransformMutations.setGroupScale(x, y, z);
}

function setGroupTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
  lineBaseTransformMutations.setGroupTransform(px, py, pz, rx, ry, rz, sx, sy, sz);
}

function resetGroupTransform() {
  lineBaseTransformMutations.resetGroupTransform();
}

function getGroupTransform() {
  log("getGroupTransform");
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  emitGroupTransformRow(group.group_id, group.layer_id);
}

function setGroupSpace(mode) {
  lineBaseTransformMutations.setGroupSpace(mode);
}

function getGroupSpace() {
  const group = getSelectedGroupForTransformCommands();
  if (!group) {
    return;
  }

  emitGroupSpaceRow(group.group_id, group.layer_id);
}

function setLinePosition(x, y, z) {
  lineBaseTransformMutations.setLinePosition(x, y, z);
}

function setLineRotation(x, y, z) {
  lineBaseTransformMutations.setLineRotation(x, y, z);
}

function setLineScale(x, y, z) {
  lineBaseTransformMutations.setLineScale(x, y, z);
}

function setLineTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
  lineBaseTransformMutations.setLineTransform(px, py, pz, rx, ry, rz, sx, sy, sz);
}

function resetLineTransform() {
  lineBaseTransformMutations.resetLineTransform();
}

function getLineTransform() {
  const line = getSelectedLineForTransformCommands();
  if (!line) {
    return;
  }

  emitLineTransformRow(line.id);
}

function setScenePosition(x, y, z) {
  lineBaseTransformMutations.setScenePosition(x, y, z);
}

function setSceneRotation(x, y, z) {
  lineBaseTransformMutations.setSceneRotation(x, y, z);
}

function setSceneScale(x, y, z) {
  lineBaseTransformMutations.setSceneScale(x, y, z);
}

function setSceneTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
  lineBaseTransformMutations.setSceneTransform(px, py, pz, rx, ry, rz, sx, sy, sz);
}

function resetSceneTransform() {
  lineBaseTransformMutations.resetSceneTransform();
}

function getSceneTransform() {
  emitSceneTransformRow();
}

function setSceneSpace(mode) {
  lineBaseTransformMutations.setSceneSpace(mode);
}

function getSceneSpace() {
  emitSceneSpaceRow();
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

  const scene = ensureSceneTransform();
  const sceneSpace = ensureSceneTransformSpace();
  if (scene) {
    outlet(0, "scene_space_row", sceneSpace);
    rowCount += 1;

    outlet(
      0,
      "scene_transform_row",
      scene.position[0],
      scene.position[1],
      scene.position[2],
      scene.rotation[0],
      scene.rotation[1],
      scene.rotation[2],
      scene.scale[0],
      scene.scale[1],
      scene.scale[2],
      sceneSpace
    );
    rowCount += 1;
  }

  for (let i = 0; i < hierarchy.layers.length; i += 1) {
    const layer = hierarchy.layers[i];
    const transform = ensureLayerTransform(layer.layer_id);
    const layerSpace = ensureLayerTransformSpace(layer.layer_id);
    if (!transform) {
      continue;
    }

    outlet(0, "layer_space_row", layer.layer_id, layerSpace);
    rowCount += 1;

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
      transform.scale[2],
      layerSpace
    );
    rowCount += 1;
  }

  for (let i = 0; i < hierarchy.groups.length; i += 1) {
    const group = hierarchy.groups[i];
    const transform = ensureGroupTransform(group.group_id, group.layer_id);
    const groupSpace = ensureGroupTransformSpace(group.group_id);
    if (!transform) {
      continue;
    }

    outlet(0, "group_space_row", group.layer_id, group.group_id, groupSpace);
    rowCount += 1;

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
      transform.scale[2],
      groupSpace
    );
    rowCount += 1;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const transform = ensureLineTransform(line.id);
    if (!transform) {
      continue;
    }

    outlet(
      0,
      "line_transform_row",
      line.id,
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
  lineBaseTransformMutations.resetAllTransforms();
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
  coordinateOverrides = null;
  poolOverrides = null;
  colorDriverPermutation = null;
  sortState = createDefaultSortState();

  if (!verifyPoolIsLocked(randomPool)) {
    log("randomPool lock failed");
    return;
  }

  currentPoolId = createPoolIdFromCurrentTime();
  outlet(0, "pool_id", currentPoolId);

  pointOrder = createPointOrder(randomPool.point_count);
  shufflePointOrder(pointOrder);
  rebuildSystemFromCurrentState();

  log(
    "generated pool with " + randomPool.random_count +
      " random values for " + lines.length + " lines"
  );

  emitRenderCommands();
}
