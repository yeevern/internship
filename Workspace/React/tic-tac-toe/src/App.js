import './App.css';
import { useState } from 'react';

function Square({ value, onSquareClick, winning=false }) {
  let className = 'square' + (winning ? '-winning' : "");
  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) return; // if there is a winner or the square is already filled, return the game

    if (squares[i]) return; // if the square is already filled, do nothing

    const nextSquares = squares.slice();  // creates a shallow copy of the original `squares` array
    
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);  /// update the state
  }

  // calculate the winner
  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo[0] : null;
  const winningLine = winnerInfo ? winnerInfo[1] : [];

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (squares.every(square => square)) {  // if every square is filled
    status = 'Draw';
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className="board">
      <div className="status">{status}</div>
      {[0, 1, 2].map(row => (
        <div className="row" key={row}>
          {[0, 1, 2].map(col => (
            <Square key={col} value={squares[row * 3 + col]} onSquareClick={() => handleClick(row * 3 + col)} winning={winningLine.includes(row * 3 + col)}/>
          ))}
        </div>
      ))}
    </div>
  );

  // return (
  //   <div className="board">
  //     <div className="status">{status}</div>
  //     <div className="row">
  //       <Square value={squares[0]} onSquareClick={() => handleClick(0)} winning={winningLine.includes(0)}/>
  //       <Square value={squares[1]} onSquareClick={() => handleClick(1)} winning={winningLine.includes(1)}/>
  //       <Square value={squares[2]} onSquareClick={() => handleClick(2)} winning={winningLine.includes(2)}/>
  //     </div>
  //     <div className="row">
  //       <Square value={squares[3]} onSquareClick={() => handleClick(3)} winning={winningLine.includes(3)}/>
  //       <Square value={squares[4]} onSquareClick={() => handleClick(4)} winning={winningLine.includes(4)}/>
  //       <Square value={squares[5]} onSquareClick={() => handleClick(5)} winning={winningLine.includes(5)}/>
  //     </div>
  //     <div className="row">
  //       <Square value={squares[6]} onSquareClick={() => handleClick(6)} winning={winningLine.includes(6)}/>
  //       <Square value={squares[7]} onSquareClick={() => handleClick(7)} winning={winningLine.includes(7)}/>
  //       <Square value={squares[8]} onSquareClick={() => handleClick(8)} winning={winningLine.includes(8)}/>
  //     </div>
  //   </div>
  // );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);  // why after setCurrentMove, the board is updated
  }

  const moves = history.map((step, move) => {
    let desc;
    if (move > 0) {
      desc = `Go to move #${move}`;
    } else {
      desc = 'Go to game start';
    }
    return (
      <li key={move}>
        {/* <button onClick={() => jumpTo(move)}>{desc}</button> */}
        <button onClick={() => jumpTo(move)}>{move === currentMove ? <b>{desc}</b> : desc}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
      </div>

      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],  // horizontal
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],  // vertical
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],  // diagonal 
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return null;
}