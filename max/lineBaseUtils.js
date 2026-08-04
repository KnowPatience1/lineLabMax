// Shared low-coupling utility helpers for lineBaseSystem modularization.

function twoDigitTime(value) {
  return value < 10 ? "0" + value : String(value);
}

function currentTimeStampHms() {
  const now = new Date();
  const hours = twoDigitTime(now.getHours());
  const minutes = twoDigitTime(now.getMinutes());
  const seconds = twoDigitTime(now.getSeconds());
  return hours + "-" + minutes + "-" + seconds;
}

function currentDateStampYmd() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = twoDigitTime(now.getMonth() + 1);
  const day = twoDigitTime(now.getDate());
  return year + "-" + month + "-" + day;
}

function mapToRange(value, min, max) {
  return min + value * (max - min);
}

function pointCountFromLineCount(lineCount) {
  return lineCount * 2;
}

function randomCountFromLineCount(lineCount, randomsPerPoint) {
  return pointCountFromLineCount(lineCount) * randomsPerPoint;
}

function createRandomValues(count) {
  const values = [];
  for (let i = 0; i < count; i += 1) {
    values.push(Math.random());
  }
  return values;
}

function createPointOrder(pointCount) {
  const order = [];
  for (let i = 0; i < pointCount; i += 1) {
    order.push(i);
  }
  return order;
}

function shuffleArrayInPlace(values) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const randomPosition = Math.floor(Math.random() * (i + 1));
    const swapValue = values[i];
    values[i] = values[randomPosition];
    values[randomPosition] = swapValue;
  }
}

function cloneJsonSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function poolChecksumFromRandomValues(randomValues) {
  let hash = 2166136261;

  for (let i = 0; i < randomValues.length; i += 1) {
    const token = String(randomValues[i]);
    for (let j = 0; j < token.length; j += 1) {
      hash ^= token.charCodeAt(j);
      hash = (hash * 16777619) >>> 0;
    }
    hash ^= 124;
    hash = (hash * 16777619) >>> 0;
  }

  return ("00000000" + hash.toString(16)).slice(-8);
}

function randomIntInclusive(minValue, maxValue) {
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function sanitizeRange(minValue, maxValue, fallbackMin, fallbackMax) {
  const parsedMin = parseInt(minValue, 10);
  const parsedMax = parseInt(maxValue, 10);

  let safeMin = isFinite(parsedMin) ? parsedMin : fallbackMin;
  let safeMax = isFinite(parsedMax) ? parsedMax : fallbackMax;

  if (safeMin < 1) {
    safeMin = 1;
  }
  if (safeMax < 1) {
    safeMax = 1;
  }

  if (safeMin > safeMax) {
    const temp = safeMin;
    safeMin = safeMax;
    safeMax = temp;
  }

  return {
    min: safeMin,
    max: safeMax
  };
}

module.exports = {
  twoDigitTime: twoDigitTime,
  currentTimeStampHms: currentTimeStampHms,
  currentDateStampYmd: currentDateStampYmd,
  mapToRange: mapToRange,
  pointCountFromLineCount: pointCountFromLineCount,
  randomCountFromLineCount: randomCountFromLineCount,
  createRandomValues: createRandomValues,
  createPointOrder: createPointOrder,
  shuffleArrayInPlace: shuffleArrayInPlace,
  cloneJsonSafe: cloneJsonSafe,
  poolChecksumFromRandomValues: poolChecksumFromRandomValues,
  randomIntInclusive: randomIntInclusive,
  sanitizeRange: sanitizeRange
};
