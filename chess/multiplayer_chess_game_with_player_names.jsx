export default function ChessGame() {
  const initialBoard = [
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
  ];

  const { useState } = React;

  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("White");
  const [player1, setPlayer1] = useState("Player 1");
  const [player2, setPlayer2] = useState("Player 2");

  const isWhitePiece = (piece) => "♙♖♘♗♕♔".includes(piece);
  const isBlackPiece = (piece) => "♟♜♞♝♛♚".includes(piece);

  const handleClick = (row, col) => {
    const piece = board[row][col];

    if (!selected) {
      if (
        piece &&
        ((turn === "White" && isWhitePiece(piece)) ||
          (turn === "Black" && isBlackPiece(piece)))
      ) {
        setSelected([row, col]);
      }
      return;
    }

    const [selRow, selCol] = selected;
    const newBoard = board.map((r) => [...r]);

    newBoard[row][col] = newBoard[selRow][selCol];
    newBoard[selRow][selCol] = "";

    setBoard(newBoard);
    setSelected(null);
    setTurn(turn === "White" ? "Black" : "White");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6">♟ Chess Game</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6 w-full max-w-3xl">
        <div>
          <label className="block mb-2 text-lg">White Player Name</label>
          <input
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="w-full p-3 rounded-xl text-black"
          />
        </div>

        <div>
          <label className="block mb-2 text-lg">Black Player Name</label>
          <input
            type="text"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="w-full p-3 rounded-xl text-black"
          />
        </div>
      </div>

      <div className="mb-4 text-2xl font-semibold">
        Turn: {turn === "White" ? player1 : player2} ({turn})
      </div>

      <div className="grid grid-cols-8 border-4 border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1;
            const isSelected =
              selected &&
              selected[0] === rowIndex &&
              selected[1] === colIndex;

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleClick(rowIndex, colIndex)}
                className={`w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl flex items-center justify-center transition-all duration-200
                  ${isDark ? "bg-green-700" : "bg-green-200 text-black"}
                  ${isSelected ? "ring-4 ring-yellow-400" : ""}`}
              >
                {piece}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-2xl max-w-2xl text-center shadow-lg">
        <h2 className="text-xl font-bold mb-2">How to Play</h2>
        <p>
          Click on your chess piece first, then click on the destination box to move it.
          This is a simple 2-player chess board UI with player names and turn switching.
        </p>
      </div>
    </div>
  );
}
