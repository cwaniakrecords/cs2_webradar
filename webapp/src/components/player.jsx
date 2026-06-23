import { useRef, useState, useEffect } from "react";
import { getRadarPosition, playerColors } from "../utilities/utilities";


const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

const calculatePlayerRotation = (eyeAngle, previousRotation) => {
  // CS2 yaw 0 faces east/right on the radar, while the marker shape points down by default.
  const targetRotation = normalizeAngle(eyeAngle + 90);
  const normalizedPreviousRotation = normalizeAngle(previousRotation);

  return (
    normalizedPreviousRotation +
    // Move to the new heading through the shortest angular distance to avoid full spins at 0/360 wraparound.
    (((targetRotation - normalizedPreviousRotation + 540) % 360) - 180)
  );
};

const Player = ({ playerData, mapData, radarImage, localTeam, settings }) => {
  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const [playerRotation, setPlayerRotation] = useState(0);
  const radarPosition = getRadarPosition(mapData, playerData.m_position) || { x: 0, y: 0 };
  const invalidPosition = radarPosition.x <= 0 && radarPosition.y <= 0;

  const playerRef = useRef();
  const playerBounding = (playerRef.current &&
    playerRef.current.getBoundingClientRect()) || { width: 0, height: 0 };

  const radarImageBounding = (radarImage !== undefined &&
    radarImage.getBoundingClientRect()) || { width: 0, height: 0 };

  const scaledSize = 0.7 * settings.dotSize;

  // Store the last known position when the player dies
  useEffect(() => {
    if (playerData.m_is_dead) {
      if (!lastKnownPosition) {
        setLastKnownPosition(radarPosition);
      }
    } else {
      setLastKnownPosition(null);
    }
  }, [playerData.m_is_dead, radarPosition, lastKnownPosition]);

  useEffect(() => {
    if (!Number.isFinite(playerData.m_eye_angle)) {
      return;
    }

    setPlayerRotation((previousRotation) =>
      calculatePlayerRotation(playerData.m_eye_angle, previousRotation)
    );
  }, [playerData.m_eye_angle]);

  const effectivePosition = playerData.m_is_dead ? lastKnownPosition || { x: 0, y: 0 } : radarPosition;

  const radarImageTranslation = {
    x: radarImageBounding.width * effectivePosition.x - playerBounding.width * 0.5,
    y: radarImageBounding.height * effectivePosition.y - playerBounding.height * 0.5,
  };

  return (
    <div
      className={`absolute origin-center rounded-[100%] left-0 top-0`}
      ref={playerRef}
      style={{
        width: `${scaledSize}vw`,
        height: `${scaledSize}vw`,
        transform: `translate(${radarImageTranslation.x}px, ${radarImageTranslation.y}px)`,
        transition: `transform 100ms linear`,
        zIndex: `${(playerData.m_is_dead && `0`) || `1`}`,
        WebkitMask: `${(playerData.m_is_dead && `url('./assets/icons/icon-enemy-death_png.png') no-repeat center / contain`) || `none`}`,
      }}
    >
      {/* Rotating container for player elements */}
      <div
        style={{
          transform: `rotate(${(playerData.m_is_dead && `0`) || playerRotation}deg)`,
          width: `${scaledSize}vw`,
          height: `${scaledSize}vw`,
          transition: `transform 100ms linear`,
          opacity: `${(playerData.m_is_dead && `0.8`) || (invalidPosition && `0`) || `1`}`,
        }}
      >
        {/* Player dot */}
        <div
          className={`w-full h-full rounded-[50%_50%_50%_0%] rotate-[315deg]`}
          style={{

            backgroundColor: `${(playerData.m_team == localTeam && playerColors[playerData.m_color]) || `red`}`,
            opacity: `${(playerData.m_is_dead && `0.8`) || (invalidPosition && `0`) || `1`}`,
          }}
        />
      </div>
    </div>
  );
};

export default Player;