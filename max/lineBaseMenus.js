"use strict";

function createLineBaseMenus(config) {
  const safeConfig = config && typeof config === "object" ? config : {};
  const cache = safeConfig.cache && typeof safeConfig.cache === "object" ? safeConfig.cache : {};

  function getNamedObject(objectName) {
    if (typeof safeConfig.getNamedObject === "function") {
      return safeConfig.getNamedObject(objectName);
    }

    return null;
  }

  function getCachedNamedObject(objectName, forceRefresh) {
    if (!forceRefresh && cache[objectName] && typeof cache[objectName].message === "function") {
      return cache[objectName];
    }

    const namedObject = getNamedObject(objectName);
    if (namedObject && typeof namedObject.message === "function") {
      cache[objectName] = namedObject;
      return namedObject;
    }

    cache[objectName] = null;
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
      cache[objectName] = null;
    }

    namedObject = getCachedNamedObject(objectName, true);

    if (namedObject && typeof namedObject.message === "function") {
      try {
        deliver(namedObject);
        return true;
      } catch (error) {
        cache[objectName] = null;
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

    if (!clearedA && typeof safeConfig.log === "function") {
      safeConfig.log("clearAllMenus: could not reach aMen");
    }
    if (!clearedG && typeof safeConfig.log === "function") {
      safeConfig.log("clearAllMenus: could not reach gMen");
    }
    if (!clearedL && typeof safeConfig.log === "function") {
      safeConfig.log("clearAllMenus: could not reach lMen");
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

  return {
    getNamedObject: getNamedObject,
    getCachedNamedObject: getCachedNamedObject,
    sendNamedObjectMessage: sendNamedObjectMessage,
    clearNamedMenu: clearNamedMenu,
    clearAllMenus: clearAllMenus,
    appendNamedMenuItem: appendNamedMenuItem,
    setNamedMenuSelection: setNamedMenuSelection,
    cache: cache
  };
}

module.exports = {
  createLineBaseMenus: createLineBaseMenus
};
