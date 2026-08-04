"use strict";

function createLineBaseReports(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  function architecture() {
    const hierarchy = safeConfig.getHierarchy();
    const lines = safeConfig.getLines();
    const layerCount = hierarchy && hierarchy.layers ? hierarchy.layers.length : 0;
    const groupCount = hierarchy && hierarchy.groups ? hierarchy.groups.length : 0;
    const lineCount = lines ? lines.length : 0;

    safeConfig.emit(0, "architecture", layerCount, groupCount, lineCount);
  }

  function reportArchitectureRows() {
    const hierarchy = safeConfig.getHierarchy();
    if (!hierarchy || !Array.isArray(hierarchy.layers) || !Array.isArray(hierarchy.groups)) {
      safeConfig.log("reportArchitectureRows requires generated data");
      return;
    }

    let rowCount = 0;
    safeConfig.emit(0, "architecture_rows_begin");

    for (let i = 0; i < hierarchy.layers.length; i += 1) {
      const layer = hierarchy.layers[i];
      const groupIds = Array.isArray(layer.group_ids) ? layer.group_ids : [];
      const layerNumber = parseInt(String(layer.layer_id || "").replace(/^a/i, ""), 10);

      for (let j = 0; j < groupIds.length; j += 1) {
        const group = safeConfig.getHierarchyGroupById(groupIds[j]);
        if (!group || !Array.isArray(group.line_ids)) {
          continue;
        }

        const groupNumber = parseInt(String(group.group_id || "").replace(/^g/i, ""), 10);

        for (let k = 0; k < group.line_ids.length; k += 1) {
          const lineId = group.line_ids[k];
          const line = safeConfig.getLineById(lineId);

          safeConfig.emit(
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

    safeConfig.emit(0, "architecture_rows_end", rowCount);
  }

  function reportHierarchy() {
    const hierarchy = safeConfig.getHierarchy();
    if (!hierarchy) {
      safeConfig.log("reportHierarchy requires generated data");
      return;
    }

    safeConfig.emit(
      0,
      "hierarchy_begin",
      hierarchy.meta.layer_count,
      hierarchy.meta.group_count,
      hierarchy.meta.line_count
    );

    for (let i = 0; i < hierarchy.layers.length; i += 1) {
      const layer = hierarchy.layers[i];
      safeConfig.emit(0, "layer", layer.layer_id, layer.group_count, layer.line_count, layer.visible ? 1 : 0);
    }

    for (let j = 0; j < hierarchy.groups.length; j += 1) {
      const group = hierarchy.groups[j];
      safeConfig.emit(0, "group", group.group_id, group.layer_id, group.line_count, group.visible ? 1 : 0);

      for (let k = 0; k < group.line_ids.length; k += 1) {
        const lineId = group.line_ids[k];
        const line = safeConfig.getLineById(lineId);
        safeConfig.emit(0, "group_line", group.group_id, lineId, line && line.visible !== false ? 1 : 0);
      }
    }

    safeConfig.emit(0, "hierarchy_end");
  }

  function emitLayerTransformRow(layerId) {
    const transform = safeConfig.ensureLayerTransform(layerId);
    const layerSpace = safeConfig.ensureLayerTransformSpace(layerId);
    if (!transform) {
      return;
    }

    safeConfig.emit(
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
      transform.scale[2],
      layerSpace
    );
  }

  function emitLayerSpaceRow(layerId) {
    safeConfig.emit(0, "layer_space", layerId, safeConfig.ensureLayerTransformSpace(layerId));
  }

  function emitGroupTransformRow(groupId, layerId) {
    const transform = safeConfig.ensureGroupTransform(groupId, layerId);
    const groupSpace = safeConfig.ensureGroupTransformSpace(groupId);
    if (!transform) {
      return;
    }

    safeConfig.emit(
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
      transform.scale[2],
      groupSpace
    );
  }

  function emitGroupSpaceRow(groupId, layerId) {
    safeConfig.emit(0, "group_space", layerId, groupId, safeConfig.ensureGroupTransformSpace(groupId));
  }

  function emitSceneTransformRow() {
    const transform = safeConfig.ensureSceneTransform();
    const sceneSpace = safeConfig.ensureSceneTransformSpace();
    if (!transform) {
      return;
    }

    safeConfig.emit(
      0,
      "scene_transform",
      transform.position[0],
      transform.position[1],
      transform.position[2],
      transform.rotation[0],
      transform.rotation[1],
      transform.rotation[2],
      transform.scale[0],
      transform.scale[1],
      transform.scale[2],
      sceneSpace
    );
  }

  function emitSceneSpaceRow() {
    safeConfig.emit(0, "scene_space", safeConfig.ensureSceneTransformSpace());
  }

  return {
    architecture: architecture,
    reportArchitectureRows: reportArchitectureRows,
    reportHierarchy: reportHierarchy,
    emitLayerTransformRow: emitLayerTransformRow,
    emitLayerSpaceRow: emitLayerSpaceRow,
    emitGroupTransformRow: emitGroupTransformRow,
    emitGroupSpaceRow: emitGroupSpaceRow,
    emitSceneTransformRow: emitSceneTransformRow,
    emitSceneSpaceRow: emitSceneSpaceRow
  };
}

module.exports = {
  createLineBaseReports: createLineBaseReports
};
