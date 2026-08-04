"use strict";

function createLineBaseStateHelpers(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  function applyVisibilityState(visibilityState) {
    if (!visibilityState || typeof visibilityState !== "object") {
      return;
    }

    if (visibilityState.layers && typeof visibilityState.layers === "object") {
      const layerKeys = Object.keys(visibilityState.layers);
      for (let i = 0; i < layerKeys.length; i += 1) {
        const key = layerKeys[i];
        safeConfig.setLayerVisible(key, !!visibilityState.layers[key]);
      }
    }

    if (visibilityState.groups && typeof visibilityState.groups === "object") {
      const groupKeys = Object.keys(visibilityState.groups);
      for (let i = 0; i < groupKeys.length; i += 1) {
        const key = groupKeys[i];
        safeConfig.setGroupVisible(key, !!visibilityState.groups[key]);
      }
    }

    if (visibilityState.lines && typeof visibilityState.lines === "object") {
      const lineKeys = Object.keys(visibilityState.lines);
      for (let i = 0; i < lineKeys.length; i += 1) {
        const key = lineKeys[i];
        const lineId = Number(key);
        if (isFinite(lineId)) {
          safeConfig.setLineVisible(lineId, !!visibilityState.lines[key]);
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

    const hierarchy = safeConfig.getHierarchy();
    const lines = safeConfig.getLines();

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

  function captureLayerTransformState() {
    const output = {};
    const layerTransformsById = safeConfig.getLayerTransformsById();
    const keys = Object.keys(layerTransformsById || {});

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      output[key] = safeConfig.cloneTransform(safeConfig.normalizeTransform(layerTransformsById[key]));
    }

    return output;
  }

  function captureLayerTransformSpaceState() {
    const output = {};
    const layerTransformSpacesById = safeConfig.getLayerTransformSpacesById();
    const keys = Object.keys(layerTransformSpacesById || {});

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      output[key] = safeConfig.ensureLayerTransformSpace(key);
    }

    return output;
  }

  function captureGroupTransformState() {
    const output = {};
    const groupTransformsById = safeConfig.getGroupTransformsById();
    const keys = Object.keys(groupTransformsById || {});

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const source = groupTransformsById[key] || safeConfig.createIdentityTransform();
      const layerId = typeof source.layer_id === "string" ? source.layer_id : "";
      const normalized = safeConfig.normalizeTransform(source, layerId);

      output[key] = {
        layer_id: normalized.layer_id,
        position: normalized.position.slice(),
        rotation: normalized.rotation.slice(),
        scale: normalized.scale.slice()
      };
    }

    return output;
  }

  function captureGroupTransformSpaceState() {
    const output = {};
    const groupTransformSpacesById = safeConfig.getGroupTransformSpacesById();
    const keys = Object.keys(groupTransformSpacesById || {});

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      output[key] = safeConfig.ensureGroupTransformSpace(key);
    }

    return output;
  }

  function captureSceneTransformState() {
    return safeConfig.cloneTransform(safeConfig.ensureSceneTransform());
  }

  function captureSceneTransformSpaceState() {
    return safeConfig.ensureSceneTransformSpace();
  }

  function applyLayerTransformState(stateById) {
    if (!stateById || typeof stateById !== "object") {
      return;
    }

    const layerTransformsById = safeConfig.getLayerTransformsById();
    const keys = Object.keys(stateById);
    for (let i = 0; i < keys.length; i += 1) {
      const layerId = keys[i];
      if (!layerTransformsById[layerId]) {
        continue;
      }

      if (safeConfig.isValidTransformEntry(stateById[layerId], false)) {
        layerTransformsById[layerId] = safeConfig.normalizeTransform(stateById[layerId]);
      }
    }
  }

  function applyLayerTransformSpaceState(stateById) {
    if (!stateById || typeof stateById !== "object") {
      return;
    }

    const layerTransformsById = safeConfig.getLayerTransformsById();
    const layerTransformSpacesById = safeConfig.getLayerTransformSpacesById();
    const keys = Object.keys(stateById);
    for (let i = 0; i < keys.length; i += 1) {
      const layerId = keys[i];
      if (!layerTransformsById[layerId]) {
        continue;
      }

      if (safeConfig.isValidSceneTransformSpaceValue(stateById[layerId])) {
        layerTransformSpacesById[layerId] = safeConfig.normalizeSceneTransformSpace(stateById[layerId]);
      }
    }
  }

  function applyGroupTransformState(stateById) {
    if (!stateById || typeof stateById !== "object") {
      return;
    }

    const groupTransformsById = safeConfig.getGroupTransformsById();
    const keys = Object.keys(stateById);
    for (let i = 0; i < keys.length; i += 1) {
      const groupId = keys[i];
      if (!groupTransformsById[groupId]) {
        continue;
      }

      if (safeConfig.isValidTransformEntry(stateById[groupId], true)) {
        const source = stateById[groupId];
        const normalized = safeConfig.normalizeTransform(source, source.layer_id);
        normalized.layer_id = groupTransformsById[groupId].layer_id;
        groupTransformsById[groupId] = normalized;
      }
    }
  }

  function applyGroupTransformSpaceState(stateById) {
    if (!stateById || typeof stateById !== "object") {
      return;
    }

    const groupTransformsById = safeConfig.getGroupTransformsById();
    const groupTransformSpacesById = safeConfig.getGroupTransformSpacesById();
    const keys = Object.keys(stateById);
    for (let i = 0; i < keys.length; i += 1) {
      const groupId = keys[i];
      if (!groupTransformsById[groupId]) {
        continue;
      }

      if (safeConfig.isValidSceneTransformSpaceValue(stateById[groupId])) {
        groupTransformSpacesById[groupId] = safeConfig.normalizeSceneTransformSpace(stateById[groupId]);
      }
    }
  }

  function applySceneTransformState(state) {
    if (!state || typeof state !== "object") {
      return;
    }

    if (safeConfig.isValidTransformEntry(state, false)) {
      safeConfig.setSceneTransform(safeConfig.normalizeTransform(state));
    }
  }

  return {
    applyVisibilityState: applyVisibilityState,
    captureVisibilityState: captureVisibilityState,
    captureLayerTransformState: captureLayerTransformState,
    captureLayerTransformSpaceState: captureLayerTransformSpaceState,
    captureGroupTransformState: captureGroupTransformState,
    captureGroupTransformSpaceState: captureGroupTransformSpaceState,
    captureSceneTransformState: captureSceneTransformState,
    captureSceneTransformSpaceState: captureSceneTransformSpaceState,
    applyLayerTransformState: applyLayerTransformState,
    applyLayerTransformSpaceState: applyLayerTransformSpaceState,
    applyGroupTransformState: applyGroupTransformState,
    applyGroupTransformSpaceState: applyGroupTransformSpaceState,
    applySceneTransformState: applySceneTransformState
  };
}

module.exports = {
  createLineBaseStateHelpers: createLineBaseStateHelpers
};
