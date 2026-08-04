"use strict";

function createLineBaseRender(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  function sketchWidth(lineWidth) {
    return Math.max(2, Number(lineWidth) * 120);
  }

  function emitRenderCommands() {
    safeConfig.emit(0, "sketch", "reset");

    const lines = safeConfig.getLines();
    const groupPivotsById = safeConfig.computeGroupRenderPivotPoints();
    const layerPivotsById = safeConfig.computeLayerRenderPivotPoints(groupPivotsById);
    const scene = safeConfig.ensureSceneTransform();
    const sceneSpace = safeConfig.ensureSceneTransformSpace();
    const scenePivot = scene && sceneSpace === safeConfig.TRANSFORM_SPACE_LOCAL ? safeConfig.getRenderPivotPoint() : null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      if (!safeConfig.isLineVisibleByHierarchy(line)) {
        continue;
      }

      const baseStart = Array.isArray(line.base_start_coords) ? line.base_start_coords : line.start_coords;
      const baseEnd = Array.isArray(line.base_end_coords) ? line.base_end_coords : line.end_coords;
      const drawStart = safeConfig.transformedLineEndpoint(line, baseStart, groupPivotsById, layerPivotsById);
      const drawEnd = safeConfig.transformedLineEndpoint(line, baseEnd, groupPivotsById, layerPivotsById);
      const sceneStart = scene
        ? (sceneSpace === safeConfig.TRANSFORM_SPACE_LOCAL && scenePivot
          ? safeConfig.applyTransformToPointAroundPivot(drawStart, scene, scenePivot)
          : safeConfig.applyTransformToPoint(drawStart, scene))
        : drawStart;
      const sceneEnd = scene
        ? (sceneSpace === safeConfig.TRANSFORM_SPACE_LOCAL && scenePivot
          ? safeConfig.applyTransformToPointAroundPivot(drawEnd, scene, scenePivot)
          : safeConfig.applyTransformToPoint(drawEnd, scene))
        : drawEnd;

      safeConfig.emit(0, "sketch", "glcolor", line.color[0], line.color[1], line.color[2], line.color[3]);
      safeConfig.emit(0, "sketch", "gllinewidth", sketchWidth(line.line_width));
      safeConfig.emit(0, "sketch", "moveto", sceneStart[0], sceneStart[1], sceneStart[2]);
      safeConfig.emit(0, "sketch", "lineto", sceneEnd[0], sceneEnd[1], sceneEnd[2]);
    }

    safeConfig.emit(0, "sketch", "draw");
    safeConfig.emit(0, "sketch", "drawimmediate");
    safeConfig.emit(0, "rendered", lines.length);
  }

  return {
    sketchWidth: sketchWidth,
    emitRenderCommands: emitRenderCommands
  };
}

module.exports = {
  createLineBaseRender: createLineBaseRender
};
