import React, { useState, useEffect } from "react";
import "./style.css";
import blackBoardImage from "../../assets/board-black.svg";
import whiteBoardImage from "../../assets/board-white.svg";
import Circle from "../circle";

function Game() {
  const [grid, setGrid] = useState([
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ]);

  const [player, setPlayer] = useState("player");

  function changePlayer() {
    player === "player" ? setPlayer("cpu") : setPlayer("player");
  }

  // add disc to the grid
  function addDisk(column: number) {
    let position = [0, column];

    for (let i = 0; i < grid.length; i += 1) {
      if (grid[i][column] === 0) {
        position = [i, column];
      } else {
        break;
      }
    }

    // Create a deep copy of the grid array
    const newGrid = grid.map((row) => [...row]);

    // check if the column in the grid that is clicked is full, if its full, don't add disk
    if (newGrid[0][column] === 0) {
      player === "player" ? (newGrid[position[0]][position[1]] = 1) : (newGrid[position[0]][position[1]] = 2);
      setGrid([...newGrid]);
    }
  }

  function makeCpuMove() {
    // cpu plays
    const randomColumn = Math.floor(Math.random() * 7);
    addDisk(randomColumn);
    changePlayer();
  }

  useEffect(() => {
    if (player === "cpu") {
      setTimeout(() => {
        makeCpuMove();
      }, 500);
    }
  }, [player]);

  return (
    <div className="game-screen">
      <div className="game-button">
        <button className="button" type="button">
          RESTART
        </button>
        <button className="button" type="button">
          QUIT GAME
        </button>
      </div>

      <div className="game">
        <article className="player-card player">
          <h2>PLAYER 1</h2>
          <p>0</p>
        </article>

        <div className="board">
          <img className="white-board" src={whiteBoardImage} alt="white-board" />
          <img className="black-board" src={blackBoardImage} alt="black-board" />

          <div className="grid">
            {grid.map((row, rowIndex) => (
              <div className="board-row">
                {row.map((_, colIndex) => (
                  <Circle
                    status={grid[rowIndex][colIndex]}
                    col={colIndex}
                    player={player}
                    clickHandler={() => {
                      addDisk(colIndex);
                      changePlayer();
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <article className="player-card cpu">
          <h2>CPU</h2>
          <p>0</p>
        </article>
      </div>

      <div className="display">
        <h2>PLAYER 1&apos;S TURNS</h2>
      </div>
    </div>
  );
}

export default Game;
