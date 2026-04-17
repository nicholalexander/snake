(() => {
  'use strict';

  // =============================
  // Snake (Canvas) — classic edition
  // - HTML/CSS/JS only
  // - Works on GitHub Pages
  // - Teachable concepts: state, loops, coordinate grids, events, randomness
  // =============================

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');

  const scoreEl = document.getElementById('score');
  const bestScoreEl = document.getElementById('bestScore');

  const speedSelect = document.getElementById('speed');
  const sizeSelect = document.getElementById('size');
  const soundToggle = document.getElementById('sound');

  // Defaults requested
  sizeSelect.value = '25';
  speedSelect.value = 'slow';

  // LocalStorage key for best score
  const BEST_KEY = 'snake.bestScore.v1';

  // Game state
  let gridSize = 25;           // cells across and down
  let cellSizePx = 16;         // computed from canvas size
  let snake = [];              // array of {x,y}, index 0 is head
  let dir = { x: 1, y: 0 };    // current direction
  let nextDir = { x: 1, y: 0 };// buffered direction (prevents double-turn glitches)
  let food = { x: 0, y: 0 };
  let score = 0;
  let bestScore = 0;
  let running = false;
  let paused = false;
  let tickMs = 140;            // slow
  let lastTick = 0;
  let rafId = 0;
  let gameOver = false;

  // Simple sound using WebAudio (no assets)
  let audioCtx = null;
  function beep(freq = 660, durationMs = 50, type = 'square', gain = 0.03) {
    if (!soundToggle.checked) return;
    if (!window.AudioContext && !window.webkitAudioContext) return;

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;

    osc.connect(g);
    g.connect(audioCtx.destination);

    osc.start();
    setTimeout(() => {
      osc.stop();
      osc.disconnect();
      g.disconnect();
    }, durationMs);
  }

  function loadBest() {
    const raw = localStorage.getItem(BEST_KEY);
    bestScore = raw ? Number(raw) || 0 : 0;
    bestScoreEl.textContent = String(bestScore);
  }

  function saveBestIfNeeded() {
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(BEST_KEY, String(bestScore));
      bestScoreEl.textContent = String(bestScore);
    }
  }

  function setSpeedFromUI() {
    const v = speedSelect.value;
    // Slower = larger ms per tick
    tickMs = v === 'slow' ? 140 : v === 'normal' ? 95 : 70;
  }

  function setBoardFromUI() {
    gridSize = Number(sizeSelect.value);
    // Keep canvas fixed in pixels, compute cell size
    cellSizePx = Math.floor(canvas.width / gridSize);
  }

  function resetState() {
    setBoardFromUI();
    setSpeedFromUI();

    score = 0;
    scoreEl.textContent = '0';

    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };

    gameOver = false;

    // Start snake in middle, length 4
    const mid = Math.floor(gridSize / 2);
    snake = [
      { x: mid + 1, y: mid },
      { x: mid,     y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];

    placeFood();
  }

  function cellsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function inBounds(p) {
    return p.x >= 0 && p.y >= 0 && p.x < gridSize && p.y < gridSize;
  }

  function placeFood() {
    // Find a random empty cell
    while (true) {
      const p = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      const onSnake = snake.some(s => cellsEqual(s, p));
      if (!onSnake) {
        food = p;
        return;
      }
    }
  }

  function setDirectionFromKey(key) {
    // Prevent reversing into itself: you can't go from (1,0) to (-1,0) etc.
    let desired = null;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') desired = { x: 0, y: -1 };
    if (key === 'ArrowDown' || key === 's' || key === 'S') desired = { x: 0, y: 1 };
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') desired = { x: -1, y: 0 };
    if (key === 'ArrowRight' || key === 'd' || key === 'D') desired = { x: 1, y: 0 };

    if (!desired) return;

    // If snake length > 1, disallow direct reversal
    if (snake.length > 1) {
      const rev = { x: -dir.x, y: -dir.y };
      if (desired.x === rev.x && desired.y === rev.y) return;
    }

    nextDir = desired;
  }

  function step() {
    // Apply buffered direction exactly once per tick
    dir = nextDir;

    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // Wall collision
    if (!inBounds(newHead)) {
      endGame();
      return;
    }

    // Self collision (note: allow moving into the tail IF it moves away this tick)
    const willEat = cellsEqual(newHead, food);
    const tail = snake[snake.length - 1];

    for (let i = 0; i < snake.length; i++) {
      const segment = snake[i];
      const isTail = cellsEqual(segment, tail);
      const tailMovesAway = !willEat; // if not eating, tail will be removed
      if (cellsEqual(newHead, segment)) {
        if (isTail && tailMovesAway) {
          // ok
        } else {
          endGame();
          return;
        }
      }
    }

    // Move
    snake.unshift(newHead);

    if (willEat) {
      score += 1;
      scoreEl.textContent = String(score);
      beep(880, 45, 'square', 0.04);
      placeFood();
    } else {
      snake.pop();
    }
  }

  function endGame() {
    gameOver = true;
    running = false;
    paused = false;
    saveBestIfNeeded();
    beep(220, 120, 'sawtooth', 0.05);
    render();
  }

  function drawCell(x, y, fill, stroke = null) {
    const px = x * cellSizePx;
    const py = y * cellSizePx;
    ctx.fillStyle = fill;
    ctx.fillRect(px, py, cellSizePx, cellSizePx);

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, cellSizePx - 1, cellSizePx - 1);
    }
  }

  function render() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.fillStyle = '#060b06';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      const p = i * cellSizePx;
      ctx.beginPath();
      ctx.moveTo(p + 0.5, 0);
      ctx.lineTo(p + 0.5, gridSize * cellSizePx);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, p + 0.5);
      ctx.lineTo(gridSize * cellSizePx, p + 0.5);
      ctx.stroke();
    }

    // Food
    drawCell(food.x, food.y, '#ff3b3b', 'rgba(0,0,0,0.25)');

    // Snake
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      const isHead = i === 0;
      const fill = isHead ? '#39ff14' : '#26b80e';
      drawCell(s.x, s.y, fill, 'rgba(0,0,0,0.25)');
    }

    // Overlay text
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, 36);
    ctx.fillStyle = '#d7fbd0';
    ctx.font = 'bold 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Arrows / WASD — Start: Enter — Pause: Space — Restart: R', 10, 22);

    if (paused) {
      overlayMessage('Paused');
    } else if (gameOver) {
      overlayMessage('Game Over — Press R to restart');
    } else if (!running) {
      overlayMessage('Press Start or Enter');
    }
  }

  function overlayMessage(text) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
    ctx.fillStyle = '#39ff14';
    ctx.font = 'bold 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 8);
    ctx.textAlign = 'start';
  }

  function loop(ts) {
    rafId = requestAnimationFrame(loop);

    if (!running || paused) {
      // Keep rendering so pause / overlays show
      return;
    }

    if (!lastTick) lastTick = ts;
    const elapsed = ts - lastTick;
    if (elapsed >= tickMs) {
      lastTick = ts;
      step();
      render();
    }
  }

  function start() {
    if (gameOver) resetState();
    running = true;
    paused = false;
    lastTick = 0;
    render();
  }

  function pauseToggle() {
    if (!running) return;
    paused = !paused;
    beep(paused ? 440 : 660, 50, 'square', 0.03);
    render();
  }

  function restart() {
    running = true;
    paused = false;
    resetState();
    render();
  }

  // Events
  window.addEventListener('keydown', (e) => {
    // prevent arrow keys from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      start();
      return;
    }
    if (e.key === ' ') {
      pauseToggle();
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      restart();
      return;
    }

    setDirectionFromKey(e.key);
  }, { passive: false });

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pauseToggle);
  restartBtn.addEventListener('click', restart);

  speedSelect.addEventListener('change', () => {
    setSpeedFromUI();
  });

  sizeSelect.addEventListener('change', () => {
    const wasRunning = running;
    resetState();
    render();
    running = wasRunning;
  });

  // Init
  loadBest();
  resetState();
  render();
  rafId = requestAnimationFrame(loop);
})();