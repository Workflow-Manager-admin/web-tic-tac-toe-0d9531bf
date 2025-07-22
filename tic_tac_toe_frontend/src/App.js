import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Tic Tac Toe square - a presentational button
 * @param {object} props { value: 'X' | 'O' | null, onClick: () => void, disabled: boolean }
 */
function Square({ value, onClick, disabled }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      disabled={disabled || !!value}
      aria-label={value ? value : "Empty square"}
    >
      {value}
    </button>
  );
}

/**
 * Returns winner symbol ('X' or 'O') or 'draw' or null for ongoing
 * @param {array} squares 1D array of squares
 */
function calculateWinner(squares) {
  const winLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];
  for (let line of winLines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
    ) {
      return squares[a];
    }
  }
  if (squares.every(Boolean)) return "draw";
  return null;
}

// PUBLIC_INTERFACE
/**
 * Main App - Tic Tac Toe UI
 */
function App() {
  // Set theme to light and lock to light (modern light theme as per requirements)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(squares);
  const nextPlayer = xIsNext ? "X" : "O";

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (squares[idx] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[idx] = nextPlayer;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  // Status text
  let status;
  if (winner === "X" || winner === "O") {
    status = `Winner: ${winner}`;
  } else if (winner === "draw") {
    status = "It's a draw!";
  } else {
    status = `Next player: ${nextPlayer}`;
  }

  return (
    <div className="App ttt-main-bg">
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
      </header>
      <main className="ttt-center-flex">
        <section className="ttt-game-container">
          <div className="ttt-status" data-testid="ttt-status">
            {status}
          </div>
          <div className="ttt-board" role="grid" aria-label="Tic Tac Toe Board">
            {squares.map((value, idx) => (
              <Square
                key={idx}
                value={value}
                onClick={() => handleSquareClick(idx)}
                disabled={!!winner}
              />
            ))}
          </div>
          <button
            className="ttt-restart-btn"
            onClick={handleRestart}
            aria-label="Restart game"
          >
            Restart
          </button>
        </section>
      </main>
      <footer className="ttt-footer">
        <span>Modern React &copy; 2024</span>
      </footer>
    </div>
  );
}

export default App;
