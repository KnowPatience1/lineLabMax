"use strict";

function createLineBaseRender(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  const DEFAULT_LINE_WIDTH_MULTIPLIER = 120;

  function normalizeLineWidthMultiplier(candidate) {
    const numeric = Number(candidate);
    if (!isFinite(numeric) || numeric <= 0) {
      return DEFAULT_LINE_WIDTH_MULTIPLIER;
    }

    return numeric;
  }

  function sketchWidth(lineWidth, lineWidthMultiplier) {
    const multiplier = normalizeLineWidthMultiplier(lineWidthMultiplier);
    return Math.max(1, Number(lineWidth) * multiplier);
  }

  function normalizeEraseColor(candidate) {
    if (
      Array.isArray(candidate) &&
      candidate.length === 4 &&
      isFinite(Number(candidate[0])) &&
      isFinite(Number(candidate[1])) &&
      isFinite(Number(candidate[2])) &&
      isFinite(Number(candidate[3]))
    ) {
      return [
        Number(candidate[0]),
        Number(candidate[1]),
        Number(candidate[2]),
        Number(candidate[3])
      ];
    }

    return [0, 0, 0, 1];
  }

  function emitRenderCommands() {
    const renderSettings = safeConfig.getRenderSettings ? safeConfig.getRenderSettings() : {};
    const eraseColor = normalizeEraseColor(renderSettings && renderSettings.eraseColor);
    const lineWidthMultiplier = normalizeLineWidthMultiplier(renderSettings && renderSettings.lineWidthMultiplier);

    safeConfig.emit(0, "erase_color", eraseColor[0], eraseColor[1], eraseColor[2], eraseColor[3]);
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
      safeConfig.emit(0, "sketch", "gllinewidth", sketchWidth(line.line_width, lineWidthMultiplier));
      safeConfig.emit(0, "sketch", "moveto", sceneStart[0], sceneStart[1], sceneStart[2]);
      safeConfig.emit(0, "sketch", "lineto", sceneEnd[0], sceneEnd[1], sceneEnd[2]);
    }

    safeConfig.emit(0, "sketch", "draw");
    safeConfig.emit(0, "sketch", "drawimmediate");
    safeConfig.emit(0, "rendered", lines.length);
  }

  function applyLineTransform(line, point) {
    if (!line || !Array.isArray(point) || point.length !== 3) {
      return point;
    }

    const lineTransform = safeConfig.ensureLineTransform(line.id);
    if (!lineTransform) {
      return point;
    }

    const lineSpace = safeConfig.ensureLineTransformSpace(line.id);
    const lineStart = Array.isArray(line.base_start_coords) ? line.base_start_coords : line.start_coords;
    const lineEnd = Array.isArray(line.base_end_coords) ? line.base_end_coords : line.end_coords;

    if (
      lineSpace === safeConfig.TRANSFORM_SPACE_LOCAL &&
      Array.isArray(lineStart) &&
      lineStart.length === 3 &&
      Array.isArray(lineEnd) &&
      lineEnd.length === 3
    ) {
      const linePivot = [
        (Number(lineStart[0]) + Number(lineEnd[0])) / 2,
        (Number(lineStart[1]) + Number(lineEnd[1])) / 2,
        (Number(lineStart[2]) + Number(lineEnd[2])) / 2
      ];
      return safeConfig.applyTransformToPointAroundPivot(point, lineTransform, linePivot);
    }

    return safeConfig.applyTransformToPoint(point, lineTransform);
  }

  return {
    sketchWidth: sketchWidth,
    emitRenderCommands: emitRenderCommands,
    applyLineTransform: applyLineTransform
  };
}

module.exports = {
  createLineBaseRender: createLineBaseRender
};
