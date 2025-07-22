import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * --- Tic Tac Toe Subcomponents and Logic ---
 */

// Tic Tac Toe square
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

// Returns winner symbol ('X' or 'O') or 'draw' or null for ongoing
function calculateTicTacToeWinner(squares) {
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

function TicTacToeGame() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateTicTacToeWinner(squares);
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
    <section className="ttt-game-container" style={{minWidth: 320, minHeight: 440}}>
      <div className="ttt-status" data-testid="ttt-status">{status}</div>
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
  );
}

/**
 * --- Snake and Ladder Implementation ---
 */

// Board Layout - 10x10, numbered from 1 to 100, bottom left is 1
const BOARD_SIZE = 10;
const FINAL_SQUARE = 100;

// Defining some classic snakes and ladders positions
const SNAKES = {
  99: 7,
  92: 35,
  74: 53,
  62: 19,
  49: 11,
  46: 25,
  16: 6
};
const LADDERS = {
  2: 38,
  7: 14,
  22: 58,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
  87: 94
};
const PLAYER_COLORS = ["#1976d2", "#43a047"];

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// Render a single board square
function SnLBoardSquare({number, playersHere, isSnake, isLadder}) {
  return (
    <div
      className="snl-square"
      style={{
        background:
          playersHere.length > 0
            ? "var(--accent-bg)"
            : (isSnake
                ? "rgba(255, 152, 0, 0.14)"
                : isLadder
                  ? "rgba(67, 160, 71, 0.12)"
                  : "#fff"),
        border: "1px solid var(--border-color)",
        borderRadius: 7,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        fontWeight: 700,
        fontSize: 14,
        padding: 2,
        minHeight: "0"
      }}
    >
      <div
        style={{fontSize: 10, color: "var(--text-secondary)", alignSelf: "flex-start"}}
      >{number}</div>
      {(isSnake || isLadder) &&
        <span
          style={{
            fontSize: 13,
            color: isSnake ? "#ff9800" : "#43a047",
            fontWeight: 900
          }}
        >
          {isSnake ? "🐍" : "🪜"}
        </span>
      }
      <div style={{display:"flex",gap:1,marginBottom:2}}>
        {playersHere.map((color, idx) =>
          <span
            key={idx}
            style={{
              display: "inline-block",
              width: 16, height: 16, borderRadius: "35%",
              background: color,
              border: "2px solid #fff",
              boxShadow: "0 1px 4px #8882",
              marginLeft: 2
            }}
            title={`Player ${idx+1}`}
          ></span>
        )}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
/** Main Snake & Ladder game UI (2 player) */
function SnakeAndLadderGame() {
  const [positions, setPositions] = useState([1, 1]);
  const [turn, setTurn] = useState(0); // 0 or 1: player turn
  const [dice, setDice] = useState(null);
  const [message, setMessage] = useState("Player 1's turn! Roll the dice 🎲");
  const [winner, setWinner] = useState(null);

  // Handle dice roll
  function handleDiceRoll() {
    if (winner) return;
    const roll = rollDice();
    setDice(roll);
    setTimeout(() => {
      setPositions(positionsPrev => {
        let newPositions = [...positionsPrev];
        let pos = newPositions[turn] + roll;
        // Must land exactly on 100 to win
        if (pos > FINAL_SQUARE) pos = newPositions[turn]; // no move
        else {
          // resolve ladder/snake
          let travel = true;
          while (travel) {
            travel = false;
            if (LADDERS[pos]) {
              pos = LADDERS[pos];
              travel = true;
            } else if (SNAKES[pos]) {
              pos = SNAKES[pos];
              travel = true;
            }
          }
        }
        newPositions[turn] = pos;

        // Win detection
        if (pos === FINAL_SQUARE) {
          setWinner(turn);
          setMessage(`Player ${turn+1} wins! 🏆`);
        } else {
          setMessage(
            roll === 6
              ? `Player ${turn+1} rolled a 6! Go again.`
              : `Player ${turn === 0 ? 2 : 1}'s turn! Roll the dice 🎲`
          );
        }
        // Advance turn unless 6 and not win
        if (pos !== FINAL_SQUARE) {
          if (roll !== 6) setTurn(prev => 1-prev);
        }
        return newPositions;
      });
    }, 360); // short pause for visual effect
  }

  function handleRestart() {
    setPositions([1,1]);
    setTurn(0);
    setWinner(null);
    setDice(null);
    setMessage("Player 1's turn! Roll the dice 🎲");
  }

  // Render board as 10x10 using row-major, zigzag numbering
  function renderBoard() {
    let squares = [];
    for (let row=BOARD_SIZE-1; row>=0; row--) {
      let rowSquares = [];
      let reverse = (row % 2 === 1);
      for (let col=0; col<BOARD_SIZE; col++) {
        let n = row*BOARD_SIZE + (reverse ? (BOARD_SIZE-1-col) : col) + 1;
        if (n > 100) n = 100;
        let players = [];
        for (let i=0; i<positions.length; i++) {
          if (positions[i] === n) players.push(PLAYER_COLORS[i]);
        }
        rowSquares.push(
          <SnLBoardSquare
            key={n}
            number={n}
            playersHere={players}
            isSnake={!!SNAKES[n]}
            isLadder={!!LADDERS[n]}
          />
        );
      }
      squares.push(
        <div className="snl-board-row" key={row} style={{display:'flex',flexDirection:'row'}}>
          {rowSquares}
        </div>
      );
    }
    return squares;
  }

  return (
    <section
      className="snl-game-container"
      style={{
        background: "var(--bg-secondary)",
        borderRadius: 16,
        boxShadow: "0 2px 24px 0 rgba(16,40,77,0.07)",
        padding: "1.1rem 0.8rem 1.2rem 0.8rem",
        minWidth: 320,
        minHeight: 440,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div
        className="snl-status"
        style={{
          marginBottom: 16,
          fontSize: 17,
          fontWeight: 800,
          color: "var(--accent, #43a047)",
          letterSpacing: 0.5,
          minHeight: 24,
        }}
      >
        {message}
      </div>
      <div
        className="snl-board-outer"
        style={{
          width: "100%",
          maxWidth: 415,
          aspectRatio: "1/1",
          background: "#fff",
          borderRadius: 15,
          boxShadow: "0 1px 18px 0 #d1d7db44",
          marginBottom: 24,
          overflow: "clip",
          display: "flex",
          flexDirection: "column",
          border: "3px solid var(--border-color)"
        }}
      >
        {renderBoard()}
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
        <button
          className="ttt-restart-btn"
          disabled={!!winner}
          style={{
            width: 112,
            background: winner
              ? "var(--secondary,#ff9800)"
              : PLAYER_COLORS[turn],
            marginBottom: 10,
            color: "#fff"
          }}
          onClick={handleDiceRoll}
          aria-label="Roll dice"
        >
          {winner
            ? "Game Over"
            : (<>
                {`Roll Dice `}
                <span style={{fontWeight:900,fontSize:21}}>🎲</span>
              </>)
          }
        </button>
        <div style={{
          fontWeight:600,
          marginBottom:4,
          color: "var(--primary,#1976d2)"
        }}>
          {dice !== null && (!winner) ? `Last Dice: ${dice}` : ""}
        </div>
        <button
          className="ttt-restart-btn"
          style={{background: "var(--primary,#1976d2)", color:"#fff"}}
          onClick={handleRestart}
        >
          Restart Game
        </button>
      </div>
      <div style={{marginTop:"auto", marginBottom:4, fontSize:12, color:"#70707077"}}>
        Snakes: <span style={{color:"#ff9800"}}>🐍</span> | Ladders: <span style={{color:"#43a047"}}>🪜</span>
      </div>
    </section>
  );
}

/** --- Game Selector Tabs --- */

function GameTabs({selected, onSelect, tabs}) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        margin: "0 0 26px 0",
        marginTop: 4,
        borderBottom: "2.5px solid var(--border-color)",
        paddingBottom: 3,
        flexWrap: "wrap"
      }}
      aria-label="Game selector"
    >
    {tabs.map(tab => (
      <button
        key={tab.value}
        className="tab-btn"
        aria-selected={selected === tab.value}
        onClick={() => onSelect(tab.value)}
        style={{
          border: 'none',
          outline: 'none',
          background: selected === tab.value
            ? "linear-gradient(90deg, var(--primary,#1976d2) 60%, var(--accent,#43a047) 100%)"
            : "#fff",
          color: selected === tab.value ? "#fff" : "var(--primary,#1976d2)",
          borderRadius: 11,
          padding: "0.62rem 2.3rem",
          margin: "0 2px",
          fontSize: 17,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: selected === tab.value
            ? "0 2px 8px #1976d233"
            : "0 1px 5px #1a242c0e",
          transition: "background 0.14s,color 0.14s"
        }}
      >
        {tab.label}
      </button>
    ))}
    </nav>
  );
}

/** --- Main App Wrapper & Layout --- */

// PUBLIC_INTERFACE
/**
 * Main App - Game selector for Tic Tac Toe and Snake & Ladder
 */
function App() {
  // Set theme to light and lock to light (modern light theme as per requirements)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const [selectedGame, setSelectedGame] = useState("ttt");

  return (
    <div className="App ttt-main-bg">
      <header className="ttt-header">
        <h1 className="ttt-title">
          Play Tic Tac Toe <span style={{
            color: "var(--secondary,#ff9800)",
            fontSize: "80%",
            fontWeight: 900,
            marginRight: 7,
          }}>&</span>
          Snake <span style={{color: "#43a047"}}>&</span> Ladder
        </h1>
      </header>
      <GameTabs
        selected={selectedGame}
        onSelect={setSelectedGame}
        tabs={[
          { value: "ttt", label: "Tic Tac Toe" },
          { value: "snl", label: "Snake & Ladder" }
        ]}
      />
      <main className="ttt-center-flex" style={{paddingBottom:16}}>
        {selectedGame === "ttt" && <TicTacToeGame />}
        {selectedGame === "snl" && <SnakeAndLadderGame />}
      </main>
      <footer className="ttt-footer">
        <span>
          Modern React Fun &copy; 2024 &mdash; <span style={{
            color:"var(--primary,#1976d2)",
            fontWeight:600
          }}>KAVIA</span>
        </span>
      </footer>
    </div>
  );
}

export default App;
