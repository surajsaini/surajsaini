"use strict";

const qs = new URLSearchParams(window.location.search);
const requestedRoom = (qs.get("room") || "").trim();
// A host URL also contains ?room=..., so history.state distinguishes a host refresh
// from a true invite-link join in another browser context.
const historyState = window.history.state || {};
const isOwnHostReload = requestedRoom && historyState.peerChessHostRoom === requestedRoom;
const isJoiner = requestedRoom.length > 0 && !isOwnHostReload;

const PIECE_THEME =
  "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png";

const state = {
  peer: null,
  conn: null,
  game: null,
  board: null,
  myColor: isJoiner ? "b" : "w",
  roomId: isJoiner ? requestedRoom : "",
  inviteUrl: "",
  connected: false,
  pendingPromotion: null,
  lastMove: null,
  selectedSquare: null
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  state.game = new Chess();
  setupBoard();
  bindUi();
  updateStaticRole();
  updateGameStatus();
  startPeerSession();
});

function cacheElements() {
  [
    "board",
    "roleBadge",
    "statusBar",
    "connectionDot",
    "connectionText",
    "invitePanel",
    "inviteLink",
    "copyInviteButton",
    "copyMessage",
    "moveList",
    "chatMessages",
    "chatForm",
    "chatInput",
    "sendChatButton",
    "lobbyOverlay",
    "lobbyStatus",
    "lobbyInviteLink",
    "copyLobbyButton",
    "lobbyCopyMessage",
    "promotionOverlay"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function setupBoard() {
  state.board = Chessboard("board", {
    draggable: false,
    position: "start",
    orientation: isJoiner ? "black" : "white",
    pieceTheme: PIECE_THEME
  });

  window.addEventListener("resize", debounce(() => state.board.resize(), 120));
}

function bindUi() {
  els.copyInviteButton.addEventListener("click", () => copyInviteLink(els.copyMessage));
  els.copyLobbyButton.addEventListener("click", () => copyInviteLink(els.lobbyCopyMessage));
  els.chatForm.addEventListener("submit", handleChatSubmit);

  els.board.addEventListener("click", (e) => {
    const square = getSquareFromEvent(e);
    if (square) {
      handleSquareClick(square);
    }
  });

  document.querySelectorAll("[data-promotion]").forEach((button) => {
    button.addEventListener("click", () => completePromotion(button.dataset.promotion));
  });
}

function startPeerSession() {
  if (isJoiner) {
    setupJoiner();
    return;
  }

  setupHost();
}

function setupHost() {
  setConnectionStatus("Creating room...", "pending");
  showLobby("Creating room...");
  state.peer = new Peer();

  state.peer.on("open", (id) => {
    state.roomId = id;
    state.inviteUrl = buildInviteUrl(id);
    window.history.replaceState({ peerChessHostRoom: id }, "", state.inviteUrl);
    setInviteLinks(state.inviteUrl);
    setConnectionStatus("Waiting for opponent...", "pending");
    showLobby("Waiting for opponent...");
    appendSystemMessage("Room created. Share the invite link with the black player.");
  });

  state.peer.on("connection", (incoming) => {
    if (state.conn) {
      incoming.on("open", () => {
        incoming.send({
          type: "room-full",
          message: "This room already has two players."
        });
        incoming.close();
      });
      return;
    }

    state.conn = incoming;
    wireConnection();
  });

  state.peer.on("error", handlePeerError);
}

function setupJoiner() {
  els.invitePanel.hidden = true;
  setConnectionStatus("Connecting to host...", "pending");
  appendSystemMessage(`Joining room ${requestedRoom}.`);

  state.peer = new Peer();

  state.peer.on("open", () => {
    state.conn = state.peer.connect(requestedRoom, { reliable: true });
    wireConnection();
  });

  state.peer.on("error", handlePeerError);
}

function wireConnection() {
  const activeConnection = state.conn;

  activeConnection.on("open", () => {
    state.connected = true;
    enableChat(true);
    setConnectionStatus("Connected to opponent", "connected");
    els.lobbyOverlay.hidden = true;
    appendSystemMessage("Peer connection established.");

    if (!isJoiner) {
      sendData({ type: "sync", fen: state.game.fen() });
    }

    updateGameStatus();
  });

  activeConnection.on("data", handleIncomingData);

  activeConnection.on("close", () => {
    if (state.conn === activeConnection) {
      state.conn = null;
    }

    state.connected = false;
    enableChat(false);
    setConnectionStatus("Opponent disconnected", "error");
    appendSystemMessage("The peer connection closed.");
    showLobby("Waiting for opponent...");
    updateGameStatus();
  });

  activeConnection.on("error", (error) => {
    setConnectionStatus("Connection error", "error");
    appendSystemMessage(error.message || "Connection error.");
  });
}

function handleIncomingData(data) {
  if (!data || typeof data !== "object") {
    return;
  }

  if (data.type === "sync") {
    if (typeof data.fen === "string" && state.game.load(data.fen)) {
      state.board.position(state.game.fen(), false);
      appendSystemMessage("Game state synced with host.");
      updateGameStatus();
    }
    return;
  }

  if (data.type === "move") {
    applyRemoteMove(data.move);
    return;
  }

  if (data.type === "chat") {
    appendChatMessage("Opponent", data.text);
    return;
  }

  if (data.type === "room-full") {
    setConnectionStatus("Room is full", "error");
    appendSystemMessage(data.message || "Room is full.");
  }
}

function handleSquareClick(square) {
  if (!state.connected || state.game.game_over()) {
    return;
  }

  if (!isMyTurn()) {
    return;
  }

  const pieceOnSquare = state.game.get(square);

  if (state.selectedSquare) {
    if (state.selectedSquare === square) {
      state.selectedSquare = null;
      applyMoveHighlight();
      return;
    }

    if (pieceOnSquare && pieceOnSquare.color === state.myColor) {
      state.selectedSquare = square;
      applyMoveHighlight();
      return;
    }

    const moveRequest = { from: state.selectedSquare, to: square, promotion: "q" };
    const moves = state.game.moves({ verbose: true });
    const isLegal = moves.some((m) => m.from === moveRequest.from && m.to === moveRequest.to);

    if (isLegal) {
      if (needsPromotionChoice(state.selectedSquare, square)) {
        state.pendingPromotion = { from: state.selectedSquare, to: square };
        els.promotionOverlay.hidden = false;
      } else {
        makeLocalMove(moveRequest);
        state.board.position(state.game.fen());
      }
    }
    
    state.selectedSquare = null;
    applyMoveHighlight();
  } else {
    if (pieceOnSquare && pieceOnSquare.color === state.myColor) {
      state.selectedSquare = square;
      applyMoveHighlight();
    }
  }
}

function needsPromotionChoice(source, target) {
  return state.game
    .moves({ square: source, verbose: true })
    .some((move) => move.to === target && Boolean(move.promotion));
}

function completePromotion(piece) {
  els.promotionOverlay.hidden = true;

  if (!state.pendingPromotion) {
    return;
  }

  const moveRequest = {
    ...state.pendingPromotion,
    promotion: piece
  };

  state.pendingPromotion = null;
  makeLocalMove(moveRequest);
  state.board.position(state.game.fen(), true);
}

function makeLocalMove(moveRequest) {
  const move = state.game.move(moveRequest);

  if (!move) {
    return null;
  }

  state.lastMove = { from: move.from, to: move.to };
  sendData({
    type: "move",
    san: move.san,
    fen: state.game.fen(),
    move: {
      from: move.from,
      to: move.to,
      promotion: move.promotion || moveRequest.promotion || "q"
    }
  });
  appendSystemMessage(`You played ${move.san}.`);
  updateGameStatus();
  return move;
}

function applyRemoteMove(moveRequest) {
  const move = state.game.move(moveRequest);

  if (!move) {
    appendSystemMessage("Received an invalid move from opponent.");
    return;
  }

  state.lastMove = { from: move.from, to: move.to };
  state.board.position(state.game.fen(), true);
  appendSystemMessage(`Opponent played ${move.san}.`);
  updateGameStatus();
}

function updateGameStatus() {
  const status = getGameStatusText();
  els.statusBar.textContent = status;
  els.statusBar.classList.toggle("your-turn", state.connected && isMyTurn() && !state.game.game_over());
  els.statusBar.classList.toggle("game-over", state.game.game_over());
  renderMoveHistory();
  applyMoveHighlight();
}

function getGameStatusText() {
  if (!state.connected) {
    return isJoiner ? "Connecting to host..." : "Waiting for opponent...";
  }

  if (state.game.in_checkmate()) {
    return `Checkmate! ${state.game.turn() === "w" ? "Black" : "White"} wins.`;
  }

  if (state.game.in_stalemate()) {
    return "Draw by stalemate.";
  }

  if (state.game.in_threefold_repetition()) {
    return "Draw by threefold repetition.";
  }

  if (state.game.insufficient_material()) {
    return "Draw by insufficient material.";
  }

  if (state.game.in_draw()) {
    return "Draw.";
  }

  const turnOwner = isMyTurn() ? "Your Turn" : "Opponent's Turn";
  const sideToMove = state.game.turn() === "w" ? "White" : "Black";
  const checkSuffix = state.game.in_check() ? " - check" : "";
  return `${turnOwner} - ${sideToMove} to move${checkSuffix}.`;
}

function renderMoveHistory() {
  const history = state.game.history({ verbose: true });
  els.moveList.innerHTML = "";

  for (let i = 0; i < history.length; i += 2) {
    const item = document.createElement("li");
    const pair = document.createElement("div");
    const whiteMove = document.createElement("span");
    const blackMove = document.createElement("span");

    pair.className = "move-pair";
    whiteMove.textContent = history[i] ? history[i].san : "";
    blackMove.textContent = history[i + 1] ? history[i + 1].san : "";

    pair.append(whiteMove, blackMove);
    item.append(pair);
    els.moveList.append(item);
  }
}

function applyMoveHighlight() {
  document
    .querySelectorAll(".highlight-from, .highlight-to, .highlight-selected")
    .forEach((square) => square.classList.remove("highlight-from", "highlight-to", "highlight-selected"));

  if (state.lastMove) {
    const fromSquare = document.querySelector(`.square-${state.lastMove.from}`);
    const toSquare = document.querySelector(`.square-${state.lastMove.to}`);

    if (fromSquare) {
      fromSquare.classList.add("highlight-from");
    }

    if (toSquare) {
      toSquare.classList.add("highlight-to");
    }
  }

  if (state.selectedSquare) {
    const selectedSquareEl = document.querySelector(`.square-${state.selectedSquare}`);
    if (selectedSquareEl) {
      selectedSquareEl.classList.add("highlight-selected");
    }
  }
}

function updateStaticRole() {
  els.roleBadge.textContent = isJoiner ? "Playing Black" : "Playing White";
}

function isMyTurn() {
  return state.game.turn() === state.myColor;
}

function sendData(payload) {
  if (state.conn && state.conn.open) {
    state.conn.send(payload);
  }
}

function handleChatSubmit(event) {
  event.preventDefault();

  const text = els.chatInput.value.trim();
  if (!text) {
    return;
  }

  appendChatMessage("You", text);
  sendData({ type: "chat", text });
  els.chatInput.value = "";
}

function appendChatMessage(sender, text) {
  if (typeof text !== "string" || !text.trim()) {
    return;
  }

  clearMutedChatPlaceholder();

  const wrapper = document.createElement("div");
  const name = document.createElement("strong");
  const body = document.createElement("p");

  wrapper.className = "chat-message";
  name.textContent = sender;
  body.textContent = text.trim();

  wrapper.append(name, body);
  els.chatMessages.append(wrapper);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function appendSystemMessage(text) {
  appendChatMessage("System", text);
}

function clearMutedChatPlaceholder() {
  const placeholder = els.chatMessages.querySelector(".muted");
  if (placeholder) {
    placeholder.remove();
  }
}

function enableChat(enabled) {
  els.chatInput.disabled = !enabled;
  els.sendChatButton.disabled = !enabled;
}

function setConnectionStatus(text, kind) {
  els.connectionText.textContent = text;
  els.connectionDot.classList.toggle("connected", kind === "connected");
  els.connectionDot.classList.toggle("error", kind === "error");
}

function showLobby(text) {
  if (isJoiner) {
    return;
  }

  els.lobbyOverlay.hidden = false;
  els.lobbyStatus.textContent = text;
}

function setInviteLinks(url) {
  [els.inviteLink, els.lobbyInviteLink].forEach((input) => {
    input.value = url;
  });

  els.copyInviteButton.disabled = false;
  els.copyLobbyButton.disabled = false;
}

async function copyInviteLink(messageEl) {
  if (!state.inviteUrl) {
    return;
  }

  try {
    await navigator.clipboard.writeText(state.inviteUrl);
    messageEl.textContent = "Invite link copied.";
  } catch {
    const targetInput = messageEl === els.lobbyCopyMessage ? els.lobbyInviteLink : els.inviteLink;
    targetInput.focus();
    targetInput.select();
    document.execCommand("copy");
    messageEl.textContent = "Invite link copied.";
  }
}

function buildInviteUrl(roomId) {
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomId);
  return url.toString();
}

function handlePeerError(error) {
  const message = error && error.message ? error.message : "PeerJS error.";
  setConnectionStatus(message, "error");
  appendSystemMessage(message);
  updateGameStatus();
}

function debounce(fn, delay) {
  let timerId;

  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => fn(...args), delay);
  };
}

function getSquareFromEvent(e) {
  const squareEl = e.target.closest('[class*="square-"]');
  if (!squareEl) {
    return null;
  }
  const match = squareEl.className.match(/square-([a-h][1-8])/);
  return match ? match[1] : null;
}
