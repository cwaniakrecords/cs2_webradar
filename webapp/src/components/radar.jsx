import { useEffect, useRef, useState } from "react";
import Player from "./player";
import Bomb from "./bomb";
import {
  getPlayerMarkerRotation,
  getSmoothedRotation,
} from "../utilities/utilities";

const Radar = ({
  playerArray,
  radarImage,
  mapData,
  localTeam,
  localPlayer,
  bombData,
  settings
}) => {
  const radarImageRef = useRef();
  const [radarRotation, setRadarRotation] = useState(0);

  useEffect(() => {
    if (
      typeof localPlayer?.m_eye_angle !== "number" ||
      !Number.isFinite(localPlayer.m_eye_angle)
    ) {
      return;
    }

    setRadarRotation((previousRotation) =>
      getSmoothedRotation(
        180 - getPlayerMarkerRotation(localPlayer.m_eye_angle),
        previousRotation
      )
    );
  }, [localPlayer?.m_eye_angle]);

  return (
    <div id="radar" className={`relative overflow-hidden origin-center`}>
      <div
        className={`relative origin-center`}
        style={{
          transform: `rotate(${radarRotation}deg)`,
          transition: `transform 100ms linear`,
        }}
      >
        <img ref={radarImageRef} className={`w-full h-auto`} src={radarImage} />

        {playerArray.map((player) => (
          <Player
            key={player.m_idx}
            playerData={player}
            mapData={mapData}
            radarImage={radarImageRef.current}
            localTeam={localTeam}
            settings={settings}
          />
        ))}

        {bombData && (
          <Bomb
            bombData={bombData}
            mapData={mapData}
            radarImage={radarImageRef.current}
            localTeam={localTeam}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
};

export default Radar;
