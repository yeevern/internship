import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Game from "./component/game/game";
import Main from "./component/main/main";
import Rules from "./component/rules/rules";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/game" element={<Game />} />
      <Route path="/rules" element={<Rules />} />
    </Routes>
  );
}

export default App;
