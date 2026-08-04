"use strict";

function createLineBaseTransformMutations(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  function parseTransformNumber(value) {
    const numeric = Number(value);
    return isFinite(numeric) ? numeric : null;
  }

  function setLayerPosition(x, y, z) {
    const layer = safeConfig.getSelectedLayerForTransformCommands();
    if (!layer) {
      return;
    }

    safeConfig.ensureLayerTransformSpace(layer.layer_id);

    const px = parseTransformNumber(x);
    const py = parseTransformNumber(y);
    const pz = parseTransformNumber(z);
    if (px === null || py === null || pz === null) {
      safeConfig.log("setLayerPosition requires finite numeric values");
      return;
    }

    const transform = safeConfig.ensureLayerTransform(layer.layer_id);
    transform.position = [px, py, pz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "layer", layer.layer_id);
  }

  function setLayerRotation(x, y, z) {
    const layer = safeConfig.getSelectedLayerForTransformCommands();
    if (!layer) {
      return;
    }

    safeConfig.ensureLayerTransformSpace(layer.layer_id);

    const rx = parseTransformNumber(x);
    const ry = parseTransformNumber(y);
    const rz = parseTransformNumber(z);
    if (rx === null || ry === null || rz === null) {
      safeConfig.log("setLayerRotation requires finite numeric values");
      return;
    }

    const transform = safeConfig.ensureLayerTransform(layer.layer_id);
    transform.rotation = [rx, ry, rz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "layer", layer.layer_id);
  }

  function setLayerScale(x, y, z) {
    const layer = safeConfig.getSelectedLayerForTransformCommands();
    if (!layer) {
      return;
    }

    safeConfig.ensureLayerTransformSpace(layer.layer_id);

    const sx = parseTransformNumber(x);
    const sy = parseTransformNumber(y);
    const sz = parseTransformNumber(z);
    if (sx === null || sy === null || sz === null || sx === 0 || sy === 0 || sz === 0) {
      safeConfig.log("setLayerScale requires non-zero numeric values");
      return;
    }

    const transform = safeConfig.ensureLayerTransform(layer.layer_id);
    transform.scale = [sx, sy, sz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "layer", layer.layer_id);
  }

  function setLayerTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
    const layer = safeConfig.getSelectedLayerForTransformCommands();
    if (!layer) {
      return;
    }

    safeConfig.ensureLayerTransformSpace(layer.layer_id);

    const position = [parseTransformNumber(px), parseTransformNumber(py), parseTransformNumber(pz)];
    const rotation = [parseTransformNumber(rx), parseTransformNumber(ry), parseTransformNumber(rz)];
    const scale = [parseTransformNumber(sx), parseTransformNumber(sy), parseTransformNumber(sz)];

    if (
      position[0] === null || position[1] === null || position[2] === null ||
      rotation[0] === null || rotation[1] === null || rotation[2] === null ||
      scale[0] === null || scale[1] === null || scale[2] === null ||
      scale[0] === 0 || scale[1] === 0 || scale[2] === 0
    ) {
      safeConfig.log("setLayerTransform requires finite position/rotation and non-zero scale values");
      return;
    }

    const transform = safeConfig.ensureLayerTransform(layer.layer_id);
    transform.position = position;
    transform.rotation = rotation;
    transform.scale = scale;
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "layer", layer.layer_id);
  }

  function resetLayerTransform() {
    const layer = safeConfig.getSelectedLayerForTransformCommands();
    if (!layer) {
      return;
    }

    const layerTransformsById = safeConfig.getLayerTransformsById();
    layerTransformsById[layer.layer_id] = safeConfig.createIdentityTransform();
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_reset", "layer", layer.layer_id);
  }

  function setLayerSpace(mode) {
    const layer = safeConfig.getSelectedLayerForTransformCommands();
    if (!layer) {
      return;
    }

    if (!safeConfig.isValidSceneTransformSpaceValue(mode)) {
      safeConfig.log("setLayerSpace requires local or world");
      return;
    }

    const layerTransformSpacesById = safeConfig.getLayerTransformSpacesById();
    layerTransformSpacesById[layer.layer_id] = safeConfig.normalizeSceneTransformSpace(mode);
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_space_set", "layer", layer.layer_id, layerTransformSpacesById[layer.layer_id]);
  }

  function setGroupPosition(x, y, z) {
    const group = safeConfig.getSelectedGroupForTransformCommands();
    if (!group) {
      return;
    }

    safeConfig.ensureGroupTransformSpace(group.group_id);

    const px = parseTransformNumber(x);
    const py = parseTransformNumber(y);
    const pz = parseTransformNumber(z);
    if (px === null || py === null || pz === null) {
      safeConfig.log("setGroupPosition requires finite numeric values");
      return;
    }

    const transform = safeConfig.ensureGroupTransform(group.group_id, group.layer_id);
    transform.position = [px, py, pz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "group", group.group_id);
  }

  function setGroupRotation(x, y, z) {
    const group = safeConfig.getSelectedGroupForTransformCommands();
    if (!group) {
      return;
    }

    safeConfig.ensureGroupTransformSpace(group.group_id);

    const rx = parseTransformNumber(x);
    const ry = parseTransformNumber(y);
    const rz = parseTransformNumber(z);
    if (rx === null || ry === null || rz === null) {
      safeConfig.log("setGroupRotation requires finite numeric values");
      return;
    }

    const transform = safeConfig.ensureGroupTransform(group.group_id, group.layer_id);
    transform.rotation = [rx, ry, rz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "group", group.group_id);
  }

  function setGroupScale(x, y, z) {
    const group = safeConfig.getSelectedGroupForTransformCommands();
    if (!group) {
      return;
    }

    safeConfig.ensureGroupTransformSpace(group.group_id);

    const sx = parseTransformNumber(x);
    const sy = parseTransformNumber(y);
    const sz = parseTransformNumber(z);
    if (sx === null || sy === null || sz === null || sx === 0 || sy === 0 || sz === 0) {
      safeConfig.log("setGroupScale requires non-zero numeric values");
      return;
    }

    const transform = safeConfig.ensureGroupTransform(group.group_id, group.layer_id);
    transform.scale = [sx, sy, sz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "group", group.group_id);
  }

  function setGroupTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
    const group = safeConfig.getSelectedGroupForTransformCommands();
    if (!group) {
      return;
    }

    safeConfig.ensureGroupTransformSpace(group.group_id);

    const position = [parseTransformNumber(px), parseTransformNumber(py), parseTransformNumber(pz)];
    const rotation = [parseTransformNumber(rx), parseTransformNumber(ry), parseTransformNumber(rz)];
    const scale = [parseTransformNumber(sx), parseTransformNumber(sy), parseTransformNumber(sz)];

    if (
      position[0] === null || position[1] === null || position[2] === null ||
      rotation[0] === null || rotation[1] === null || rotation[2] === null ||
      scale[0] === null || scale[1] === null || scale[2] === null ||
      scale[0] === 0 || scale[1] === 0 || scale[2] === 0
    ) {
      safeConfig.log("setGroupTransform requires finite position/rotation and non-zero scale values");
      return;
    }

    const transform = safeConfig.ensureGroupTransform(group.group_id, group.layer_id);
    transform.position = position;
    transform.rotation = rotation;
    transform.scale = scale;
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "group", group.group_id);
  }

  function resetGroupTransform() {
    const group = safeConfig.getSelectedGroupForTransformCommands();
    if (!group) {
      return;
    }

    const groupTransformsById = safeConfig.getGroupTransformsById();
    const identity = safeConfig.createIdentityTransform();
    identity.layer_id = group.layer_id;
    groupTransformsById[group.group_id] = identity;
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_reset", "group", group.group_id);
  }

  function setGroupSpace(mode) {
    const group = safeConfig.getSelectedGroupForTransformCommands();
    if (!group) {
      return;
    }

    if (!safeConfig.isValidSceneTransformSpaceValue(mode)) {
      safeConfig.log("setGroupSpace requires local or world");
      return;
    }

    const groupTransformSpacesById = safeConfig.getGroupTransformSpacesById();
    groupTransformSpacesById[group.group_id] = safeConfig.normalizeSceneTransformSpace(mode);
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_space_set", "group", group.group_id, groupTransformSpacesById[group.group_id]);
  }

  function setScenePosition(x, y, z) {
    safeConfig.ensureSceneTransformSpace();

    const px = parseTransformNumber(x);
    const py = parseTransformNumber(y);
    const pz = parseTransformNumber(z);
    if (px === null || py === null || pz === null) {
      safeConfig.log("setScenePosition requires finite numeric values");
      return;
    }

    const transform = safeConfig.ensureSceneTransform();
    transform.position = [px, py, pz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "scene");
  }

  function setSceneRotation(x, y, z) {
    safeConfig.ensureSceneTransformSpace();

    const rx = parseTransformNumber(x);
    const ry = parseTransformNumber(y);
    const rz = parseTransformNumber(z);
    if (rx === null || ry === null || rz === null) {
      safeConfig.log("setSceneRotation requires finite numeric values");
      return;
    }

    const transform = safeConfig.ensureSceneTransform();
    transform.rotation = [rx, ry, rz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "scene");
  }

  function setSceneScale(x, y, z) {
    safeConfig.ensureSceneTransformSpace();

    const sx = parseTransformNumber(x);
    const sy = parseTransformNumber(y);
    const sz = parseTransformNumber(z);
    if (sx === null || sy === null || sz === null || sx === 0 || sy === 0 || sz === 0) {
      safeConfig.log("setSceneScale requires non-zero numeric values");
      return;
    }

    const transform = safeConfig.ensureSceneTransform();
    transform.scale = [sx, sy, sz];
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "scene");
  }

  function setSceneTransform(px, py, pz, rx, ry, rz, sx, sy, sz) {
    safeConfig.ensureSceneTransformSpace();

    const position = [parseTransformNumber(px), parseTransformNumber(py), parseTransformNumber(pz)];
    const rotation = [parseTransformNumber(rx), parseTransformNumber(ry), parseTransformNumber(rz)];
    const scale = [parseTransformNumber(sx), parseTransformNumber(sy), parseTransformNumber(sz)];

    if (
      position[0] === null || position[1] === null || position[2] === null ||
      rotation[0] === null || rotation[1] === null || rotation[2] === null ||
      scale[0] === null || scale[1] === null || scale[2] === null ||
      scale[0] === 0 || scale[1] === 0 || scale[2] === 0
    ) {
      safeConfig.log("setSceneTransform requires finite position/rotation and non-zero scale values");
      return;
    }

    const transform = safeConfig.ensureSceneTransform();
    transform.position = position;
    transform.rotation = rotation;
    transform.scale = scale;
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_set", "scene");
  }

  function resetSceneTransform() {
    safeConfig.setSceneTransform(safeConfig.createIdentityTransform());
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_reset", "scene");
  }

  function setSceneSpace(mode) {
    if (!safeConfig.isValidSceneTransformSpaceValue(mode)) {
      safeConfig.log("setSceneSpace requires local or world");
      return;
    }

    safeConfig.setSceneTransformSpace(safeConfig.normalizeSceneTransformSpace(mode));
    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transform_space_set", "scene", safeConfig.getSceneTransformSpace());
  }

  function resetAllTransforms() {
    const hierarchy = safeConfig.getHierarchy();
    if (!hierarchy || !Array.isArray(hierarchy.layers) || !Array.isArray(hierarchy.groups)) {
      safeConfig.log("resetAllTransforms requires generated data");
      return;
    }

    const layerTransformsById = safeConfig.getLayerTransformsById();
    const layerTransformSpacesById = safeConfig.getLayerTransformSpacesById();
    for (let i = 0; i < hierarchy.layers.length; i += 1) {
      layerTransformsById[hierarchy.layers[i].layer_id] = safeConfig.createIdentityTransform();
      layerTransformSpacesById[hierarchy.layers[i].layer_id] = safeConfig.TRANSFORM_SPACE_LOCAL;
    }

    const groupTransformsById = safeConfig.getGroupTransformsById();
    const groupTransformSpacesById = safeConfig.getGroupTransformSpacesById();
    for (let i = 0; i < hierarchy.groups.length; i += 1) {
      const group = hierarchy.groups[i];
      const identity = safeConfig.createIdentityTransform();
      identity.layer_id = group.layer_id;
      groupTransformsById[group.group_id] = identity;
      groupTransformSpacesById[group.group_id] = safeConfig.TRANSFORM_SPACE_LOCAL;
    }

    safeConfig.setSceneTransform(safeConfig.createIdentityTransform());

    safeConfig.emitRenderCommands();
    safeConfig.emit(0, "transforms_reset_all");
  }

  return {
    setLayerPosition: setLayerPosition,
    setLayerRotation: setLayerRotation,
    setLayerScale: setLayerScale,
    setLayerTransform: setLayerTransform,
    resetLayerTransform: resetLayerTransform,
    setLayerSpace: setLayerSpace,
    setGroupPosition: setGroupPosition,
    setGroupRotation: setGroupRotation,
    setGroupScale: setGroupScale,
    setGroupTransform: setGroupTransform,
    resetGroupTransform: resetGroupTransform,
    setGroupSpace: setGroupSpace,
    setScenePosition: setScenePosition,
    setSceneRotation: setSceneRotation,
    setSceneScale: setSceneScale,
    setSceneTransform: setSceneTransform,
    resetSceneTransform: resetSceneTransform,
    setSceneSpace: setSceneSpace,
    resetAllTransforms: resetAllTransforms
  };
}

module.exports = {
  createLineBaseTransformMutations: createLineBaseTransformMutations
};
