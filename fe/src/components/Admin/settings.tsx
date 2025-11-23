"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"

// Định nghĩa kiểu dữ liệu
type Piece = string | null // Ví dụ: 'wP' = white pawn, 'bK' = black king

const BOARD_SIZE = 8

// Utility function để sao chép mảng
const clone = <T,>(v: T) => JSON.parse(JSON.stringify(v)) as T

// Khởi tạo trạng thái bàn cờ ban đầu
const initialBoard = (): Piece[] => {
  // Thiết lập vị trí khởi đầu cờ vua tiêu chuẩn
  const emptyRow: Piece[] = Array(8).fill(null)
  const board: Piece[] = []

  // Hàng sau quân Đen
  board.push("bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR")
  // Quân tốt Đen
  for (let i = 0; i < 8; i++) board.push("bP")
  // Hàng trống x4
  for (let r = 0; r < 4; r++) board.push(...emptyRow)
  // Quân tốt Trắng
  for (let i = 0; i < 8; i++) board.push("wP")
  // Hàng sau quân Trắng
  board.push("wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR")

  return board
}

// Chuyển mã quân cờ sang ký tự Unicode (Emoji)
const pieceToChar = (p: Piece) => {
  if (!p) return ""
  const map: Record<string, string> = {
    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",
    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟",
  }
  return map[p] ?? ""
}

// Kiểm tra xem tọa độ có nằm trong bàn cờ không
const inside = (r: number, c: number) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
// Chuyển hàng/cột (r, c) thành chỉ mục mảng (index)
const rcToIdx = (r: number, c: number) => r * BOARD_SIZE + c
// Chuyển chỉ mục mảng thành hàng/cột
const idxToRc = (idx: number) => [Math.floor(idx / BOARD_SIZE), idx % BOARD_SIZE] as const

// Xác định đối thủ
const opponent = (color: "w" | "b") => (color === "w" ? "b" : "w")

// Hàm tạo nước đi hợp lệ cơ bản (chưa kiểm tra chiếu, nhập thành, bắt tốt qua đường)
const legalMoves = (board: Piece[], fromIdx: number): number[] => {
  const p = board[fromIdx]
  if (!p) return []
  const color = p[0] as "w" | "b"
  const kind = p[1]
  const [r, c] = idxToRc(fromIdx)
  const moves: number[] = []

  const pushIf = (nr: number, nc: number) => {
    if (!inside(nr, nc)) return
    const j = rcToIdx(nr, nc)
    const target = board[j]
    if (!target) moves.push(j)
    else if (target[0] !== color) moves.push(j) // Bắt quân đối thủ
  }

  if (kind === "P") {
    // Tốt (Pawn)
    const dir = color === "w" ? -1 : 1 // Hướng đi: Trắng đi lên (-1), Đen đi xuống (+1)
    const startRow = color === "w" ? 6 : 1
    // Đi thẳng 1 ô
    const f1r = r + dir
    if (inside(f1r, c) && !board[rcToIdx(f1r, c)]) {
      moves.push(rcToIdx(f1r, c))
      // Đi thẳng 2 ô từ vị trí xuất phát
      const f2r = r + dir * 2
      if (r === startRow && !board[rcToIdx(f2r, c)]) moves.push(rcToIdx(f2r, c))
    }
    // Bắt chéo
    for (const dc of [-1, 1]) {
      const nr = r + dir,
        nc = c + dc
      if (inside(nr, nc)) {
        const t = board[rcToIdx(nr, nc)]
        if (t && t[0] !== color) moves.push(rcToIdx(nr, nc))
      }
    }
  }

  if (kind === "N") {
    // Mã (Knight)
    const deltas = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ]
    deltas.forEach((d) => pushIf(r + d[0], c + d[1]))
  }

  if (kind === "B" || kind === "R" || kind === "Q") {
    // Tượng, Xe, Hậu (Bishop, Rook, Queen)
    const dirs: number[][] = []
    if (kind === "B" || kind === "Q") dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]) // Chéo
    if (kind === "R" || kind === "Q") dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]) // Thẳng

    dirs.forEach(([dr, dc]) => {
      let nr = r + dr,
        nc = c + dc
      while (inside(nr, nc)) {
        const j = rcToIdx(nr, nc)
        if (!board[j]) {
          moves.push(j)
          nr += dr
          nc += dc
        } // Ô trống, đi tiếp
        else {
          if (board[j]![0] !== color) moves.push(j) // Gặp quân đối thủ, bắt và dừng
          break // Gặp quân mình hoặc quân đối thủ, dừng
        }
      }
    })
  }

  if (kind === "K") {
    // Vua (King)
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        pushIf(r + dr, c + dc)
      }
  }

  return moves
}

// Hàm chèn CSS để tạo hiệu ứng 3D và giao diện
const injectCSS = () => {
  const css = `
    /* Tailwind Reset/Base */
    /* Dùng tiền tố cg3d- để cách ly CSS */
    .cg3d-chess-container {
        font-family: 'Inter', sans-serif;
        background-color: #f7f7f7;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        max-width: fit-content;
        margin: 20px auto;
        box-sizing: border-box; 
        width: 100%; /* Đảm bảo nó không bị co lại quá mức trong content-right */
    }

    .cg3d-chess-scene { 
        display:flex; 
        gap: 1.5rem; 
        align-items:flex-start; 
        flex-wrap: wrap; 
        justify-content: center;
    }
    .cg3d-board-wrap { 
        perspective: 1500px; 
        width: 100%;
        max-width: 480px;
    }
    .cg3d-board3d {
      width: 100%;
      aspect-ratio: 1 / 1;
      transform-style: preserve-3d;
      transform: rotateX(60deg) rotateZ(0deg); 
      transition: transform 300ms ease-out;
      box-shadow: 0 18px 40px rgba(0,0,0,0.45);
      border-radius: 12px;
      overflow: hidden; 
      /* FIX: Đặt màu nền rõ ràng để ngăn màu hồng từ div cha bị rò rỉ */
      background: #FFFFFF; 
      display: flex;
      flex-direction: column;
    }
    .cg3d-rank { 
        display:flex; 
        width:100%; 
        height:12.5%; 
        box-sizing: border-box;
    }
    .cg3d-square {
      flex:1 1 0;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:34px;
      user-select:none;
      transform-style: preserve-3d;
      position:relative;
      transition: transform 150ms, box-shadow 150ms;
      cursor: pointer;
      background-color: transparent; 
    }
    .cg3d-square::after{
      content:''; 
      position:absolute; 
      inset:0px; 
      z-index:0; 
      transition: background 150ms;
      transform: translateZ(20px); 
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .cg3d-square.light::after{ background: #E7EBEE; } /* Màu ô sáng: gần như trắng */
    .cg3d-square.dark::after{ background: #779954; } /* Màu ô tối: xanh rêu */

    .cg3d-piece {
      z-index:2;
      transform: translateZ(40px); 
      font-size: clamp(30px, 8vw, 44px); 
      line-height:1;
      transition: transform 120ms, opacity 300ms;
      text-shadow: 0 3px 6px rgba(0,0,0,0.6);
      color: currentColor; 
    }
    .cg3d-piece[aria-label^='b'] { color: #222; }
    .cg3d-piece[aria-label^='w'] { color: #f0f0f0; }
    
    /* Fix: Xoay ngược quân cờ 180 độ khi bàn cờ bị xoay để quân cờ luôn hướng về phía người chơi */
    /* Chỉ áp dụng cho quân cờ Đen khi bàn cờ xoay 180 độ (góc nhìn Đen) */
    .cg3d-piece.cg3d-rotate-fix {
        transform: translateZ(40px) rotateZ(180deg); 
    }

    /* Hiệu ứng khi di chuột và chọn */
    .cg3d-square:hover { transform: translateZ(4px); }
    .cg3d-square.selected { 
        outline: 4px solid rgba(255,215,0,0.9); 
        outline-offset: -2px; 
        z-index: 10;
        box-shadow: 0 0 15px rgba(255,215,0,0.6);
    }
    .cg3d-square.legal::before{ 
        content:''; 
        position:absolute; 
        width:35%; 
        height:35%; 
        border-radius:50%; 
        z-index:1; 
        transform: translateZ(21px); 
        transition: background 150ms;
    }
    .cg3d-square.legal.empty::before{ background: rgba(0,0,0,0.3); } /* Dấu chấm cho ô trống */
    .cg3d-square.legal.capture::before{ 
        width: 80%; 
        height: 80%; 
        border: 4px solid rgba(255, 99, 71, 0.7); /* Viền đỏ cho bắt quân */
        background: transparent;
        border-radius: 6px;
    }
    
    .cg3d-controls { display:flex; flex-direction:column; gap:12px; padding: 16px; background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .cg3d-controls button { padding:10px 15px; border-radius:8px; border:none; background: #3b82f6; color: white; cursor:pointer; font-weight: 600; transition: background 150ms; }
    .cg3d-controls button:hover { background: #2563eb; }

    /* Class mới cho ô hiển thị trạng thái */
    .cg3d-status-box {
        padding: 8px; 
        background: #f3f4f6; 
        border-radius: 6px;
    }

    .cg3d-info { font-family: sans-serif; font-size: 16px; padding: 4px 0; }
    .cg3d-info strong { font-weight: 700; color: #1f2937; }

    /* Styling cho lượt đi */
    .cg3d-turn-w {
        color: white; 
        background: #3b82f6; 
        padding: 4px 8px; 
        border-radius: 4px;
    }
    .cg3d-turn-b {
        color: black; 
        background: #fcd34d; 
        padding: 4px 8px; 
        border-radius: 4px;
    }

    @media (max-width:640px){ 
        .cg3d-chess-container { padding: 12px; }
        .cg3d-board-wrap { max-width: 380px; margin-left: auto; margin-right: auto;}
        .cg3d-board3d { max-width: 320px; max-height: 320px; }
    }
  `
  const id = "chess-game-3d-css"
  if (!document.getElementById(id)) {
    const s = document.createElement("style")
    s.id = id
    s.innerHTML = css
    document.head.appendChild(s)
  }
}

const Settings: React.FC = () => {
  const [board, setBoard] = useState<Piece[]>(() => initialBoard())
  const [turn, setTurn] = useState<"w" | "b">("w")
  const [selected, setSelected] = useState<number | null>(null)
  const [legal, setLegal] = useState<number[]>([])
  const [isWhiteView, setIsWhiteView] = useState(true) // Trạng thái góc nhìn
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([])
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([])

  // Chèn CSS khi component được mount
  useEffect(() => {
    injectCSS()
  }, [])

  // Tính toán nước đi hợp lệ khi quân cờ được chọn hoặc bàn cờ thay đổi
  useEffect(() => {
    if (selected === null) {
      setLegal([])
      return
    }
    setLegal(legalMoves(board, selected))
  }, [selected, board])

  // Đặt lại trò chơi
  const reset = () => {
    setBoard(initialBoard())
    setTurn("w")
    setSelected(null)
    setLegal([])
    setIsWhiteView(true)
    setCapturedWhite([])
    setCapturedBlack([])
  }

  // Xử lý click vào ô cờ
  const handleSquare = (idx: number) => {
    const p = board[idx]

    // 1. Nếu click vào quân cờ của mình (cùng màu với lượt đi) -> CHỌN
    if (p && p[0] === turn) {
      setSelected(idx)
      return
    }

    // 2. Nếu đã có quân cờ được chọn và click vào ô đích hợp lệ -> DI CHUYỂN
    if (selected !== null && legal.includes(idx)) {
      const newBoard = clone(board)

      const capturedPiece = newBoard[idx]
      if (capturedPiece) {
        if (capturedPiece[0] === "w") {
          setCapturedWhite([...capturedWhite, capturedPiece])
        } else {
          setCapturedBlack([...capturedBlack, capturedPiece])
        }
      }

      // Thực hiện di chuyển
      newBoard[idx] = newBoard[selected]
      newBoard[selected] = null

      // Phong cấp (tự động phong Hậu - Queen)
      const [tr] = idxToRc(idx)
      if (newBoard[idx] === "wP" && tr === 0) newBoard[idx] = "wQ"
      if (newBoard[idx] === "bP" && tr === 7) newBoard[idx] = "bQ"

      setBoard(newBoard)
      setTurn(opponent(turn))
      setSelected(null)
      setLegal([])

      // Tự động xoay bàn cờ sau khi di chuyển
      setIsWhiteView(!isWhiteView)

      return
    }

    // 3. Click ra ngoài hoặc không hợp lệ -> BỎ CHỌN
    setSelected(null)
    setLegal([])
  }

  // Phân chia mảng 1D thành mảng 2D (8 hàng) để render
  const boardRows = useMemo(() => {
    const rows: Piece[][] = []
    for (let r = 0; r < 8; r++) rows.push(board.slice(r * 8, r * 8 + 8))
    return rows
  }, [board])

  // Xác định góc nhìn 3D
  const board3DStyle: React.CSSProperties = {
    transform: isWhiteView
      ? "rotateX(60deg) rotateZ(0deg)" // Góc nhìn Trắng
      : "rotateX(60deg) rotateZ(180deg)", // Góc nhìn Đen (xoay 180 độ)
  }

  return (
    <div className="cg3d-chess-container">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Bàn Cờ Vua 3D</h1>
      <p className="text-center mb-8 text-gray-600">
        Trò chơi cờ vua 2 người chơi cục bộ (local). Tự động xoay bàn cờ sau mỗi nước đi.
      </p>

      <div className="cg3d-chess-scene">
        <div className="cg3d-board-wrap">
          <div className="cg3d-board3d" role="grid" aria-label="Bàn cờ vua" style={board3DStyle}>
            {/* Render các hàng từ trên (0) xuống dưới (7) */}
            {boardRows.map((row, r) => (
              <div className="cg3d-rank" key={r} role="row">
                {row.map((p, c) => {
                  const idx = rcToIdx(r, c)
                  const isLight = (r + c) % 2 === 0
                  const isSelected = selected === idx
                  const isLegal = legal.includes(idx)

                  // Kiểm tra có phải nước bắt quân hợp lệ không
                  const isCapture = !!(
                    p &&
                    selected !== null &&
                    board[selected] &&
                    board[selected]![0] !== p[0] &&
                    isLegal
                  )

                  // Dùng cg3d-square thay cho square
                  const classes = [
                    "cg3d-square",
                    isLight ? "light" : "dark",
                    isSelected ? "selected" : "",
                    isLegal ? "legal" : "",
                    isLegal && !p ? "empty" : "",
                    isCapture ? "capture" : "",
                  ].join(" ")

                  // Logic FIX: Chỉ xoay quân cờ đen khi đang ở góc nhìn của quân đen (tức là board đã xoay 180 độ)
                  const isBlackPiece = p && p[0] === "b"
                  const needsRotationFix = !isWhiteView && isBlackPiece

                  return (
                    <div key={c} className={classes} role="gridcell" onClick={() => handleSquare(idx)}>
                      {p && (
                        <div
                          className={`cg3d-piece ${needsRotationFix ? "cg3d-rotate-fix" : ""}`}
                          aria-hidden
                          aria-label={p}
                        >
                          {pieceToChar(p)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="cg3d-controls">
          {/* Cập nhật class để dùng cg3d-status-box và cg3d-turn-w/b */}
          <div className="cg3d-info cg3d-status-box">
            <strong className={`transition-colors duration-300 ${turn === "w" ? "cg3d-turn-w" : "cg3d-turn-b"}`}>
              Lượt: {turn === "w" ? "Trắng" : "Đen"}
            </strong>
          </div>
          <button onClick={() => setIsWhiteView(!isWhiteView)}>Xoay Góc Nhìn ({isWhiteView ? "Trắng" : "Đen"})</button>
          <button onClick={reset} className="bg-red-500 hover:bg-red-600">
            Đặt lại bàn cờ
          </button>

          <div className="cg3d-info">
            <strong>Ô đã chọn:</strong> {selected === null ? "—" : `${idxToRc(selected)[0]},${idxToRc(selected)[1]}`}
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "12px", marginTop: "12px" }}>
            <h4 className="font-semibold text-gray-700 mb-3">Quân Cờ Đã Ăn</h4>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-600 mb-2" style={{marginBottom: '4px'}}>Quân Trắng Bị Ăn:</div>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg min-h-12">
                {capturedWhite.length > 0 ? (
                  capturedWhite.map((piece, idx) => (
                    <div key={idx} className="text-2xl bg-white rounded px-2 py-1 shadow-sm" title={piece ?? ""}>
                      {pieceToChar(piece)}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm"></span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600 mb-2" style={{marginBottom: '4px'}}>Quân Đen Bị Ăn:</div>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg min-h-12">
                {capturedBlack.length > 0 ? (
                  capturedBlack.map((piece, idx) => (
                    <div key={idx} className="text-2xl bg-white rounded px-2 py-1 shadow-sm" title={piece ?? ""}>
                      {pieceToChar(piece)}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm"></span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#4b5563",
              borderTop: "1px solid #eee",
              paddingTop: "12px",
              marginTop: "12px",
            }}
          >
            <h4 className="font-semibold text-gray-700 mb-2">Lưu ý về Luật chơi:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chỉ bao gồm **luật di chuyển cơ bản** của từng quân cờ.</li>
              <li>**Chưa** kiểm tra chiếu (check) hoặc chiếu hết (checkmate).</li>
              <li>**Chưa** hỗ trợ nhập thành (castling) hoặc bắt tốt qua đường (en-passant).</li>
              <li>Tốt phong cấp **tự động** thành Hậu (Queen).</li>
              <li>Bàn cờ **tự động xoay** 180 độ sau mỗi nước đi.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings;
