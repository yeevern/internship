import React from "react";
import { Link } from "react-router-dom";
import exit from "../../assets/exit.png";
import "./style.css";

function Rules() {
  return (
    <div className="rules-container">
      <div className="rules-content">
        <h1>Connect Four RULES</h1>

        <h2>OBJECTIVE</h2>
        <p>
          A player must get FOUR discs of their color in a row (either vertically, horizontally, or diagonally). Whoever
          does it first is the winner.
        </p>
        <h2>HOW THE GAME GOES ON</h2>
        <div className="rule-list">
          1. Green goes first in the first game.
          <br />
          2. Players must take turns, and each turn can only have one disc dropped.
          <br />
          3. The game ends when there is a 4-in-a-row or a stalemate occurs.
          <br />
        </div>
        <Link to="/" className="exit-button">
          <img src={exit} alt="logo" />
        </Link>
      </div>
    </div>
  );
}

export default Rules;
