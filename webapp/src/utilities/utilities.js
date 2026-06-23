const hasFiniteCoordinatePair = (coords) =>
  coords &&
  Number.isFinite(coords.x) &&
  Number.isFinite(coords.y);

export const getRadarPosition = (mapData, entityCoords) => {
  if (!hasFiniteCoordinatePair(entityCoords)) {
    return { x: 0, y: 0 };
  }

  if (
    !hasFiniteCoordinatePair(mapData) ||
    !Number.isFinite(mapData.scale) ||
    mapData.scale === 0
  ) {
    return { x: 0, y: 0 };
  }

  const position = {
    x: (entityCoords.x - mapData.x) / mapData.scale / 1024,
    y: (((entityCoords.y - mapData.y) / mapData.scale) * -1.0) / 1024,
  };

  return position;
};

export const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

export const getSmoothedRotation = (targetRotation, previousRotation) => {
  const normalizedTargetRotation = normalizeAngle(targetRotation);
  const normalizedPreviousRotation = normalizeAngle(previousRotation);

  return (
    normalizedPreviousRotation +
    // Rotate through the shortest arc so headings stay smooth when crossing 0/360.
    (((normalizedTargetRotation - normalizedPreviousRotation + 540) % 360) - 180)
  );
};

export const getPlayerMarkerRotation = (eyeAngle) => normalizeAngle(eyeAngle + 90);

export const playerColors = [
  // blue
  "#84c8ed",

  // green
  "#009a7d",

  // yellow
  "#eadd40",

  // orange
  "#df7d29",

  // purple
  "#b72b92",

  // white
  "#ffffff",
];

export const teamEnum = {
  none: 0,
  spectator: 1,
  terrorist: 2,
  counterTerrorist: 3,
};
