"use strict";

function createLineBaseMenuFlow(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  function currentSelectionValue(value) {
    if (value === null || typeof value === "undefined") {
      return "none";
    }

    return value;
  }

  function emitCurrentSelection() {
    if (typeof safeConfig.emit !== "function") {
      return;
    }

    safeConfig.emit(0, "current_layer", currentSelectionValue(safeConfig.getSelectedLayerId()));
    safeConfig.emit(0, "current_group", currentSelectionValue(safeConfig.getSelectedGroupId()));
    safeConfig.emit(0, "current_line", currentSelectionValue(safeConfig.getSelectedLineId()));
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

  function emitLineMenu() {
    const couldClearMenu = typeof safeConfig.clearNamedMenu === "function"
      ? safeConfig.clearNamedMenu("lMen")
      : false;

    if (!couldClearMenu) {
      if (typeof safeConfig.log === "function") {
        safeConfig.log("emitLineMenu: could not reach lMen");
      }
      emitCurrentSelection();
      return;
    }

    const hierarchy = safeConfig.getHierarchy();
    const selectedGroupId = safeConfig.getSelectedGroupId();
    if (!hierarchy || !selectedGroupId) {
      safeConfig.setSelectedLineId(null);
      emitCurrentSelection();
      return;
    }

    const group = typeof safeConfig.getHierarchyGroupById === "function"
      ? safeConfig.getHierarchyGroupById(selectedGroupId)
      : null;

    if (!group || !group.line_ids || group.line_ids.length === 0) {
      safeConfig.setSelectedLineId(null);
      emitCurrentSelection();
      return;
    }

    for (let i = 0; i < group.line_ids.length; i += 1) {
      if (!safeConfig.appendNamedMenuItem("lMen", group.line_ids[i]) && typeof safeConfig.log === "function") {
        safeConfig.log("emitLineMenu: append failed for lMen item " + group.line_ids[i]);
      }
    }

    safeConfig.setSelectedLineId(group.line_ids[0]);
    safeConfig.setNamedMenuSelection("lMen", safeConfig.getSelectedLineId());
    emitCurrentSelection();
  }

  function emitGroupMenu() {
    const couldClearMenu = typeof safeConfig.clearNamedMenu === "function"
      ? safeConfig.clearNamedMenu("gMen")
      : false;

    if (!couldClearMenu) {
      if (typeof safeConfig.log === "function") {
        safeConfig.log("emitGroupMenu: could not reach gMen");
      }
      return;
    }

    const hierarchy = safeConfig.getHierarchy();
    const selectedLayerId = safeConfig.getSelectedLayerId();

    if (!hierarchy || !hierarchy.groups || !selectedLayerId) {
      safeConfig.setSelectedGroupId(null);
      emitLineMenu();
      return;
    }

    const groupsInLayer = typeof safeConfig.getGroupsForLayer === "function"
      ? safeConfig.getGroupsForLayer(selectedLayerId)
      : [];

    for (let i = 0; i < groupsInLayer.length; i += 1) {
      if (!safeConfig.appendNamedMenuItem("gMen", groupsInLayer[i].group_id) && typeof safeConfig.log === "function") {
        safeConfig.log("emitGroupMenu: append failed for gMen item " + groupsInLayer[i].group_id);
      }
    }

    if (groupsInLayer.length > 0) {
      safeConfig.setSelectedGroupId(groupsInLayer[0].group_id);
      safeConfig.setNamedMenuSelection("gMen", safeConfig.getSelectedGroupId());
    } else {
      safeConfig.setSelectedGroupId(null);
    }

    emitLineMenu();
  }

  function emitLayerMenu() {
    const couldClearMenu = typeof safeConfig.clearNamedMenu === "function"
      ? safeConfig.clearNamedMenu("aMen")
      : false;

    if (!couldClearMenu) {
      if (typeof safeConfig.log === "function") {
        safeConfig.log("emitLayerMenu: could not reach aMen");
      }
      return;
    }

    const hierarchy = safeConfig.getHierarchy();

    if (!hierarchy || !hierarchy.layers) {
      safeConfig.setSelectedLayerId(null);
      safeConfig.setSelectedGroupId(null);
      safeConfig.setSelectedLineId(null);
      emitGroupMenu();
      return;
    }

    for (let i = 0; i < hierarchy.layers.length; i += 1) {
      if (!safeConfig.appendNamedMenuItem("aMen", hierarchy.layers[i].layer_id) && typeof safeConfig.log === "function") {
        safeConfig.log("emitLayerMenu: append failed for aMen item " + hierarchy.layers[i].layer_id);
      }
    }

    if (hierarchy.layers.length > 0) {
      safeConfig.setSelectedLayerId(hierarchy.layers[0].layer_id);
      safeConfig.setNamedMenuSelection("aMen", safeConfig.getSelectedLayerId());
    } else {
      safeConfig.setSelectedLayerId(null);
    }

    emitGroupMenu();
  }

  return {
    currentSelectionValue: currentSelectionValue,
    emitCurrentSelection: emitCurrentSelection,
    resolveMenuSelection: resolveMenuSelection,
    emitLineMenu: emitLineMenu,
    emitGroupMenu: emitGroupMenu,
    emitLayerMenu: emitLayerMenu
  };
}

module.exports = {
  createLineBaseMenuFlow: createLineBaseMenuFlow
};
