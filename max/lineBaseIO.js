"use strict";

function createLineBaseIO(config) {
  const safeConfig = config && typeof config === "object" ? config : {};

  function createFile(fullPath, accessMode, fileType) {
    if (typeof safeConfig.createFile === "function") {
      return safeConfig.createFile(fullPath, accessMode, fileType);
    }

    if (typeof accessMode === "undefined") {
      return new File(fullPath);
    }

    return new File(fullPath, accessMode, fileType);
  }

  function joinPath(folderPath, fileName) {
    if (!folderPath || folderPath.length === 0) {
      return fileName;
    }

    const lastCharacter = folderPath.charAt(folderPath.length - 1);
    if (lastCharacter === "/" || lastCharacter === "\\") {
      return folderPath + fileName;
    }

    return folderPath + "/" + fileName;
  }

  function readTextFile(fullPath) {
    const file = createFile(fullPath);
    if (!file || !file.isopen) {
      return null;
    }

    let content = "";
    const chunkSize = 8192;

    while (file.position < file.eof) {
      const remaining = file.eof - file.position;
      const size = remaining > chunkSize ? chunkSize : remaining;
      content += file.readstring(size);
    }

    file.close();
    return content;
  }

  function writeTextFileChunked(fullPath, contentText) {
    const file = createFile(fullPath, "write", "TEXT");
    if (!file || !file.isopen) {
      return false;
    }

    const text = String(contentText || "");
    const chunkSize = 8192;

    for (let i = 0; i < text.length; i += chunkSize) {
      file.writestring(text.slice(i, i + chunkSize));
    }

    file.close();
    return true;
  }

  return {
    joinPath: joinPath,
    readTextFile: readTextFile,
    writeTextFileChunked: writeTextFileChunked
  };
}

module.exports = {
  createLineBaseIO: createLineBaseIO
};
