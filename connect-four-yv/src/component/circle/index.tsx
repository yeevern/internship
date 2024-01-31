/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from "react";
import player2Disk from "../../assets/cpuDisc.svg";
import marker2 from "../../assets/cpuMarker.svg";
import player1Disk from "../../assets/playerDisc.svg";
import marker1 from "../../assets/playerMarker.svg";
import "./style.css";

function Circle({
  status,
  col,
  player,
  clickHandler,
}: {
  status: number;
  col: number;
  player: string;
  clickHandler: () => void;
}) {
  const [hover, setHover] = useState(-1);
  const gridPositionColumn = [-7, 62, 132, 202, 271, 340, 408];

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="circle"
      onMouseOver={() => setHover(col)}
      onMouseOut={() => setHover(-1)}
      onClick={clickHandler}
      onFocus={() => setHover(col)}
      onBlur={() => setHover(-1)}
    >
      {status === 1 && <img src={player1Disk} alt="player1-disk" />}
      {status === 2 && <img src={player2Disk} alt="player2-disk" />}

      {hover !== -1 && player === "player" && status === 0 && (
        <img className="marker" src={marker1} style={{ left: gridPositionColumn[hover] + 15 }} alt="marker-1" />
      )}

      {hover !== -1 && player === "cpu" && status === 0 && (
        <img className="marker" src={marker2} style={{ left: gridPositionColumn[hover] + 15 }} alt="marker-2" />
      )}
    </div>
  );
}

export default Circle;
