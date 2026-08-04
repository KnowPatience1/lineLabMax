"use strict";

function createLineBaseIndexMutations(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  function save_index() {
    const targetPath = String(safeConfig.getPathName() || "").trim();
    if (targetPath.length === 0 || targetPath === "unset") {
      safeConfig.log("save_index requires pathName to be set");
      return;
    }

    let folder;
    try {
      folder = safeConfig.createFolder(targetPath);
    } catch (error) {
      safeConfig.log("save_index could not open folder: " + targetPath);
      return;
    }

    if (!folder) {
      safeConfig.log("save_index could not open folder: " + targetPath);
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
        const fullPath = safeConfig.joinPath(targetPath, fileName);
        const rawText = safeConfig.readTextFile(fullPath);

        if (rawText !== null) {
          let payload = null;
          try {
            payload = JSON.parse(rawText);
          } catch (error) {
            payload = null;
          }

          if (payload && payload.type === "lineBaseSystem.pool") {
            const poolId = typeof payload.pool_id === "string" ? payload.pool_id : "";
            if (poolId.length > 0 && safeConfig.isValidLoadedPoolPayload(payload)) {
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

    const indexPath = safeConfig.joinPath(targetPath, "pools_index.json");
    const serialized = JSON.stringify(indexPayload, null, 2);
    const didWrite = safeConfig.writeTextFileChunked(indexPath, serialized);
    if (!didWrite) {
      safeConfig.log("save_index could not open file: " + indexPath);
      return;
    }

    safeConfig.setLoadedIndexData(indexPayload);
    safeConfig.setLoadedIndexPath(indexPath);

    safeConfig.emit(0, "index_saved", indexPath, indexPayload.pool_count, indexPayload.view_count);
  }

  function load_index() {
    const targetPath = String(safeConfig.getPathName() || "").trim();
    if (targetPath.length === 0 || targetPath === "unset") {
      safeConfig.log("load_index requires pathName to be set");
      return;
    }

    const indexPath = safeConfig.joinPath(targetPath, "pools_index.json");
    const rawText = safeConfig.readTextFile(indexPath);
    if (rawText === null) {
      safeConfig.log("load_index could not open file: " + indexPath);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      safeConfig.log("load_index could not parse JSON: " + indexPath);
      return;
    }

    if (!safeConfig.isValidLoadedIndexPayload(parsed)) {
      safeConfig.log("load_index invalid index payload: " + indexPath);
      return;
    }

    parsed.path_name = targetPath;
    safeConfig.setLoadedIndexData(parsed);
    safeConfig.setLoadedIndexPath(indexPath);

    const poolCount = Array.isArray(parsed.pools) ? parsed.pools.length : 0;
    let viewCount = 0;
    for (let i = 0; i < poolCount; i += 1) {
      const views = Array.isArray(parsed.pools[i].views) ? parsed.pools[i].views : [];
      viewCount += views.length;
    }

    safeConfig.emit(0, "index_loaded", indexPath, poolCount, viewCount);
  }

  function clear_index_cache() {
    const previousPath = safeConfig.getLoadedIndexPath() || "";
    const hadCache = safeConfig.getLoadedIndexData() ? 1 : 0;

    safeConfig.setLoadedIndexData(null);
    safeConfig.setLoadedIndexPath("");

    safeConfig.emit(0, "index_cache_cleared", previousPath, hadCache);
  }

  function register_view(viewId, fullViewFilePath) {
    const resolvedViewId = String(viewId || "").trim();
    if (resolvedViewId.length === 0) {
      safeConfig.log("register_view requires a non-empty viewId");
      return;
    }

    const viewPath = String(fullViewFilePath || "").trim();
    if (viewPath.length === 0) {
      safeConfig.log("register_view requires a full view file path");
      return;
    }

    const targetPath = String(safeConfig.getPathName() || "").trim();
    if (targetPath.length === 0 || targetPath === "unset") {
      safeConfig.log("register_view requires pathName to be set");
      return;
    }

    const rawViewText = safeConfig.readTextFile(viewPath);
    if (rawViewText === null) {
      safeConfig.log("register_view could not open view file: " + viewPath);
      return;
    }

    let viewPayload;
    try {
      viewPayload = JSON.parse(rawViewText);
    } catch (error) {
      safeConfig.log("register_view could not parse JSON: " + viewPath);
      return;
    }

    if (!safeConfig.isValidLoadedViewPayload(viewPayload)) {
      safeConfig.log("register_view invalid view payload: " + viewPath);
      return;
    }

    const poolId = String(viewPayload.pool_id || "").trim();
    if (poolId.length === 0) {
      safeConfig.log("register_view missing pool_id in view file: " + viewPath);
      return;
    }

    const savedAt = typeof viewPayload.saved_at === "string" ? viewPayload.saved_at : "";
    const indexPath = safeConfig.joinPath(targetPath, "pools_index.json");

    let indexPayload = null;
    const loadedIndexData = safeConfig.getLoadedIndexData();

    if (loadedIndexData && loadedIndexData.path_name === targetPath && Array.isArray(loadedIndexData.pools)) {
      indexPayload = safeConfig.cloneJsonSafe(loadedIndexData);
    } else {
      const rawIndexText = safeConfig.readTextFile(indexPath);
      if (rawIndexText !== null) {
        try {
          const parsedIndex = JSON.parse(rawIndexText);
          if (safeConfig.isValidLoadedIndexPayload(parsedIndex)) {
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
    const didWrite = safeConfig.writeTextFileChunked(indexPath, serialized);
    if (!didWrite) {
      safeConfig.log("register_view could not open index file: " + indexPath);
      return;
    }

    safeConfig.setLoadedIndexData(indexPayload);
    safeConfig.setLoadedIndexPath(indexPath);

    safeConfig.emit(0, "view_registered", resolvedViewId, viewPath, poolId, indexPath);
  }

  function unregister_view(viewId) {
    const resolvedViewId = String(viewId || "").trim();
    if (resolvedViewId.length === 0) {
      safeConfig.log("unregister_view requires a non-empty viewId");
      return;
    }

    const targetPath = String(safeConfig.getPathName() || "").trim();
    if (targetPath.length === 0 || targetPath === "unset") {
      safeConfig.log("unregister_view requires pathName to be set");
      return;
    }

    const indexPath = safeConfig.joinPath(targetPath, "pools_index.json");
    let indexPayload = null;

    const loadedIndexData = safeConfig.getLoadedIndexData();
    if (loadedIndexData && loadedIndexData.path_name === targetPath && Array.isArray(loadedIndexData.pools)) {
      indexPayload = safeConfig.cloneJsonSafe(loadedIndexData);
    } else {
      const rawIndexText = safeConfig.readTextFile(indexPath);
      if (rawIndexText === null) {
        safeConfig.log("unregister_view could not open index file: " + indexPath);
        return;
      }

      try {
        const parsedIndex = JSON.parse(rawIndexText);
        if (!safeConfig.isValidLoadedIndexPayload(parsedIndex)) {
          safeConfig.log("unregister_view invalid index payload: " + indexPath);
          return;
        }
        indexPayload = parsedIndex;
      } catch (error) {
        safeConfig.log("unregister_view could not parse JSON: " + indexPath);
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
    const didWrite = safeConfig.writeTextFileChunked(indexPath, serialized);
    if (!didWrite) {
      safeConfig.log("unregister_view could not open index file: " + indexPath);
      return;
    }

    safeConfig.setLoadedIndexData(indexPayload);
    safeConfig.setLoadedIndexPath(indexPath);

    safeConfig.emit(0, "view_unregistered", resolvedViewId, removedCount, indexPath);
  }

  return {
    save_index: save_index,
    load_index: load_index,
    clear_index_cache: clear_index_cache,
    register_view: register_view,
    unregister_view: unregister_view
  };
}

module.exports = {
  createLineBaseIndexMutations: createLineBaseIndexMutations
};
