// Shared payload and transform validation helpers for lineBaseSystem modularization.

function createLineBaseValidators(config) {
  const randomsPerPoint = Number(config.RANDOMS_PER_POINT);
  const transformSpaceLocal = String(config.TRANSFORM_SPACE_LOCAL);
  const transformSpaceWorld = String(config.TRANSFORM_SPACE_WORLD);
  const pointCountFromLineCount = config.pointCountFromLineCount;
  const randomCountFromLineCount = config.randomCountFromLineCount;

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

  function isValidSceneTransformSpaceValue(value) {
    const normalized = String(value || "").toLowerCase();
    return normalized === transformSpaceLocal || normalized === transformSpaceWorld;
  }

  function normalizeSceneTransformSpace(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized === transformSpaceWorld) {
      return transformSpaceWorld;
    }
    return transformSpaceLocal;
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

    if (Number(payload.randoms_per_point) !== randomsPerPoint) {
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

    if (typeof payload.sort_version !== "undefined") {
      const sortVersion = Number(payload.sort_version);
      if (!isFinite(sortVersion) || Math.floor(sortVersion) !== sortVersion || sortVersion < 1) {
        return false;
      }
    }

    if (typeof payload.sort_state !== "undefined") {
      if (!payload.sort_state || typeof payload.sort_state !== "object") {
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

    if (typeof payload.layer_spaces_by_id !== "undefined") {
      if (!payload.layer_spaces_by_id || typeof payload.layer_spaces_by_id !== "object") {
        return false;
      }

      const layerSpaceKeys = Object.keys(payload.layer_spaces_by_id);
      for (let i = 0; i < layerSpaceKeys.length; i += 1) {
        const key = layerSpaceKeys[i];
        if (!isValidSceneTransformSpaceValue(payload.layer_spaces_by_id[key])) {
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

    if (typeof payload.group_spaces_by_id !== "undefined") {
      if (!payload.group_spaces_by_id || typeof payload.group_spaces_by_id !== "object") {
        return false;
      }

      const groupSpaceKeys = Object.keys(payload.group_spaces_by_id);
      for (let i = 0; i < groupSpaceKeys.length; i += 1) {
        const key = groupSpaceKeys[i];
        if (!isValidSceneTransformSpaceValue(payload.group_spaces_by_id[key])) {
          return false;
        }
      }
    }

    if (typeof payload.line_transforms_by_id !== "undefined") {
      if (!payload.line_transforms_by_id || typeof payload.line_transforms_by_id !== "object") {
        return false;
      }

      const lineTransformKeys = Object.keys(payload.line_transforms_by_id);
      for (let i = 0; i < lineTransformKeys.length; i += 1) {
        const key = lineTransformKeys[i];
        if (!isValidTransformEntry(payload.line_transforms_by_id[key], false)) {
          return false;
        }
      }
    }

    if (typeof payload.line_spaces_by_id !== "undefined") {
      if (!payload.line_spaces_by_id || typeof payload.line_spaces_by_id !== "object") {
        return false;
      }

      const lineSpaceKeys = Object.keys(payload.line_spaces_by_id);
      for (let i = 0; i < lineSpaceKeys.length; i += 1) {
        const key = lineSpaceKeys[i];
        if (!isValidSceneTransformSpaceValue(payload.line_spaces_by_id[key])) {
          return false;
        }
      }
    }

    if (typeof payload.scene_transform !== "undefined") {
      if (!isValidTransformEntry(payload.scene_transform, false)) {
        return false;
      }
    }

    if (typeof payload.scene_space !== "undefined") {
      if (!isValidSceneTransformSpaceValue(payload.scene_space)) {
        return false;
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
        const view = payload.pools[i].views[j];
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

  return {
    isValidLoadedPoolPayload: isValidLoadedPoolPayload,
    isValidPointOrderForPool: isValidPointOrderForPool,
    isValidTransformVector3: isValidTransformVector3,
    isValidTransformEntry: isValidTransformEntry,
    isValidSceneTransformSpaceValue: isValidSceneTransformSpaceValue,
    normalizeSceneTransformSpace: normalizeSceneTransformSpace,
    isValidLoadedViewPayload: isValidLoadedViewPayload,
    isValidLoadedIndexPayload: isValidLoadedIndexPayload
  };
}

module.exports = {
  createLineBaseValidators: createLineBaseValidators
};
