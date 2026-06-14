function combineAll(a, b) {
  const out = [];
  out.push({ val: a.val + b.val, expr: '(' + a.expr + '+' + b.expr + ')' });
  out.push({ val: a.val - b.val, expr: '(' + a.expr + '-' + b.expr + ')' });
  out.push({ val: b.val - a.val, expr: '(' + b.expr + '-' + a.expr + ')' });
  out.push({ val: a.val * b.val, expr: '(' + a.expr + '*' + b.expr + ')' });
  if (Math.abs(b.val) > 1e-9) out.push({ val: a.val / b.val, expr: '(' + a.expr + '/' + b.expr + ')' });
  if (Math.abs(a.val) > 1e-9) out.push({ val: b.val / a.val, expr: '(' + b.expr + '/' + a.expr + ')' });
  return out;
}

function solve24(nums) {
  const items = nums.map(n => ({ val: n, expr: String(n) }));
  function helper(list) {
    if (list.length === 1) {
      if (Math.abs(list[0].val - 24) < 1e-6) return list[0].expr;
      return null;
    }
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        const rest = list.filter((_, idx) => idx !== i && idx !== j);
        for (const c of combineAll(list[i], list[j])) {
          const res = helper([...rest, c]);
          if (res) return res;
        }
      }
    }
    return null;
  }
  return helper(items);
}

function generatePuzzle() {
  let nums, solution;
  do {
    nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 13) + 1);
    solution = solve24(nums);
  } while (!solution);
  return { nums, solution };
}

const STORAGE_KEY = 'game24_best_level';

let level = 1;
let bestLevel = parseInt(localStorage.getItem(STORAGE_KEY) || '1', 10);
let puzzle = generatePuzzle();
let tiles = [];
let selectedTileId = null;
let selectedOp = null;
let nextId = 0;
let animating = false;

function initTiles() {
  tiles = puzzle.nums.map(n => ({ id: nextId++, val: n }));
  selectedTileId = null;
  selectedOp = null;
}
initTiles();

function fmt(v) {
  const r = Math.round(v * 1000) / 1000;
  return Number.isInteger(r) ? r.toString() : r.toString();
}

function updateStats() {
  document.getElementById('levelNum').textContent = level;
  document.getElementById('bestNum').textContent = bestLevel;
}

function renderTiles(newTileId) {
  const wrapper = document.getElementById('tilesWrapper');
  const tilesDiv = document.getElementById('tiles');

  const oldRects = new Map();
  tilesDiv.querySelectorAll('.tile').forEach(el => {
    oldRects.set(el.dataset.id, el.getBoundingClientRect());
  });

  tilesDiv.innerHTML = '';
  tiles.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tile' + (t.id === selectedTileId ? ' selected' : '');
    el.dataset.id = t.id;
    el.textContent = fmt(t.val);
    el.addEventListener('click', () => onTileClick(t.id));
    tilesDiv.appendChild(el);
  });

  tilesDiv.querySelectorAll('.tile').forEach(el => {
    const id = el.dataset.id;
    const newRect = el.getBoundingClientRect();
    if (id === String(newTileId)) {
      el.style.transition = 'none';
      el.style.transform = 'scale(0.3)';
      el.style.opacity = '0';
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
        el.style.transform = 'scale(1)';
        el.style.opacity = '1';
      });
    } else if (oldRects.has(id)) {
      const old = oldRects.get(id);
      const dx = old.left - newRect.left;
      const dy = old.top - newRect.top;
      if (dx !== 0 || dy !== 0) {
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => {
          el.style.transition = 'transform 0.25s ease';
          el.style.transform = 'translate(0px, 0px)';
        });
      }
    }
  });
}

function clearOpSelection() {
  document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('selected'));
}

function setMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = type === 'success' ? 'msg-success' : (type === 'error' ? 'msg-error' : '');
}

function animateMergeAndUpdate(idA, idB, applyState) {
  const wrapper = document.getElementById('tilesWrapper');
  const wrapperRect = wrapper.getBoundingClientRect();
  const elA = wrapper.querySelector(`[data-id="${idA}"]`);
  const elB = wrapper.querySelector(`[data-id="${idB}"]`);
  const rectA = elA.getBoundingClientRect();
  const rectB = elB.getBoundingClientRect();

  const midX = (rectA.left + rectB.left) / 2 - wrapperRect.left;
  const midY = (rectA.top + rectB.top) / 2 - wrapperRect.top;

  [[elA, rectA], [elB, rectB]].forEach(([el, rect]) => {
    const ghost = el.cloneNode(true);
    ghost.classList.remove('selected');
    ghost.style.position = 'absolute';
    ghost.style.left = (rect.left - wrapperRect.left) + 'px';
    ghost.style.top = (rect.top - wrapperRect.top) + 'px';
    ghost.style.margin = '0';
    ghost.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    ghost.style.zIndex = '10';
    wrapper.appendChild(ghost);
    requestAnimationFrame(() => {
      const dx = midX - (rect.left - wrapperRect.left);
      const dy = midY - (rect.top - wrapperRect.top);
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
      ghost.style.opacity = '0';
    });
    setTimeout(() => ghost.remove(), 320);
  });

  elA.style.opacity = '0';
  elB.style.opacity = '0';

  setTimeout(() => {
    applyState();
  }, 300);
}

function onTileClick(id) {
  if (animating) return;
  if (selectedTileId === null) {
    selectedTileId = id;
    selectedOp = null;
    setMessage('', '');
    renderTiles();
    return;
  }
  if (selectedTileId === id) {
    selectedTileId = null;
    selectedOp = null;
    setMessage('', '');
    clearOpSelection();
    renderTiles();
    return;
  }
  if (selectedOp === null) {
    selectedTileId = id;
    renderTiles();
    return;
  }

  const a = tiles.find(t => t.id === selectedTileId);
  const b = tiles.find(t => t.id === id);
  let result;
  if (selectedOp === '+') result = a.val + b.val;
  else if (selectedOp === '-') result = a.val - b.val;
  else if (selectedOp === '*') result = a.val * b.val;
  else if (selectedOp === '/') {
    if (Math.abs(b.val) < 1e-9) {
      setMessage('Tidak bisa membagi dengan 0', 'error');
      selectedTileId = null;
      selectedOp = null;
      clearOpSelection();
      renderTiles();
      return;
    }
    result = a.val / b.val;
  }

  const idA = selectedTileId;
  const idB = id;
  animating = true;
  setMessage('', '');

  animateMergeAndUpdate(idA, idB, () => {
    const newTile = { id: nextId++, val: result };
    const idxA = tiles.findIndex(t => t.id === idA);
    tiles.splice(idxA, 1, newTile);
    tiles = tiles.filter(t => t.id !== idB);
    selectedTileId = null;
    selectedOp = null;

    renderTiles(newTile.id);
    clearOpSelection();
    animating = false;

    if (tiles.length === 1) {
      if (Math.abs(tiles[0].val - 24) < 1e-6) {
        level += 1;
        if (level > bestLevel) {
          bestLevel = level;
          localStorage.setItem(STORAGE_KEY, String(bestLevel));
        }
        updateStats();
        setMessage('Benar! Hasilnya 24. Lanjut ke level berikutnya...', 'success');
        setTimeout(() => {
          puzzle = generatePuzzle();
          initTiles();
          setMessage('', '');
          document.getElementById('solutionBox').style.display = 'none';
          renderTiles();
        }, 1200);
      } else {
        setMessage('Hasil akhir ' + fmt(tiles[0].val) + ', belum 24. Coba ulang level.', 'error');
      }
    }
  });
}

document.querySelectorAll('.op-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (animating) return;
    if (selectedTileId === null) {
      setMessage('Pilih ubin angka dulu', 'error');
      return;
    }
    selectedOp = (selectedOp === btn.dataset.op) ? null : btn.dataset.op;
    document.querySelectorAll('.op-btn').forEach(b => b.classList.toggle('selected', b.dataset.op === selectedOp));
  });
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (animating) return;
  initTiles();
  setMessage('', '');
  renderTiles();
});

document.getElementById('hintBtn').addEventListener('click', () => {
  const box = document.getElementById('solutionBox');
  if (box.style.display === 'none' || !box.style.display) {
    box.textContent = 'Salah satu solusi: ' + puzzle.solution + ' = 24';
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
});

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('welcomeOverlay').style.display = 'none';
  document.getElementById('gameCard').style.display = 'block';
});

document.getElementById('resetLevelBtn').addEventListener('click', () => {
  if (animating) return;
  document.getElementById('confirmOverlay').style.display = 'flex';
});

document.getElementById('confirmNoBtn').addEventListener('click', () => {
  document.getElementById('confirmOverlay').style.display = 'none';
});

document.getElementById('confirmYesBtn').addEventListener('click', () => {
  document.getElementById('confirmOverlay').style.display = 'none';
  level = 1;
  updateStats();
  initTiles();
  setMessage('', '');
  document.getElementById('solutionBox').style.display = 'none';
  renderTiles();
});

updateStats();
renderTiles();
