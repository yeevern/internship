import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/main-logo.png";
import "./style.css";

function Main() {
  return (
    <div className="main-screen">
      <img src={logo} className="main-logo" alt="logo" />
      <Link to="/game">
        <button className="main-button button-pink" type="button">
          PLAYER VS CPU
        </button>
      </Link>
      <Link to="/rules">
        <button className="main-button button-yellow" type="button">
          GAME RULES
        </button>
      </Link>
    </div>
  );
}

export default Main;
