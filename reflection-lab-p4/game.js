import { callApi } from './connection.js';
import { WIDTH, HEIGHT, CLASSES, LEVELS, VERSION, location, scoreFor, schoolYear, trace, validStudent } from './optics.js';

const $ = id => document.getElementById(id);
const grid = $('grid');
const beam = $('beam');
const ranking = $('ranking');
const pendingKey = 'reflection-pending-v' + VERSION;
const tabKey = 'reflection-tab-session-v' + VERSION;
const cells = [];
let student = null;
let levelIndex = 0;
let mirrors = new Map();
let changes = [];
let win = null;
let joining = false;
let syncing = false;
let reconnecting = false;
let rankFilter = '';
let rankRequest = 0;
let currentRay;
let storageFailed = false;
let pending = readPending();

for (let number = 1; number <= 25; number++) $('number').add(new Option(number + ' 號', number));
for (let key = 0; key < WIDTH * HEIGHT; key++) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.innerHTML = '<span class="dot" aria-hidden="true"></span>';
  cell.addEventListener('click', () => place(key));
  cell.addEventListener('keydown', event => {
    const steps = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    let [x, y] = location(key);
    do {
      x += step[0];
      y += step[1];
      if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
    } while (cells[y * WIDTH + x].disabled);
    cells[y * WIDTH + x].focus();
  });
  cells.push(cell);
  grid.append(cell);
}

for (const filter of ['', ...CLASSES]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button secondary';
  button.textContent = filter || '全級';
  button.addEventListener('click', () => {
    rankFilter = filter;
    loadRanking();
  });
  $('rank-filters').append(button);
}

function readPending() {
  try {
    return JSON.parse(localStorage.getItem(pendingKey)) || {};
  } catch {
    return {};
  }
}

function savePending() {
  try {
    localStorage.setItem(pendingKey, JSON.stringify(pending));
  } catch {
    storageFailed = true;
  }
}

const studentKey = profile => [profile.season, profile.group, profile.number].join('-');
const levelNumber = () => levelIndex + 1;
const getLevel = () => LEVELS[levelIndex];
const personalBest = number => student?.bests.find(row => row.level === number);
const queued = number => student && pending[studentKey(student)]?.[number];

function updateEntry() {
  const unlocked = !joining && validStudent($('group').value, Number($('number').value));
  $('start').disabled = !unlocked;
}
$('entrance').addEventListener('change', updateEntry);

async function call(path, options = {}) {
  const response = await callApi(path, options.method || 'GET', options.body, options.profile?.token);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || '暫時未能連線，請稍後再試。'), { status: response.status });
  return data;
}

$('entrance').addEventListener('submit', async event => {
  event.preventDefault();
  const group = $('group').value;
  const number = Number($('number').value);
  if (joining || !validStudent(group, number)) return;
  joining = true;
  updateEntry();
  $('entry-status').textContent = '正在載入闖關進度…';
  try {
    enter(await startSession(group, number), false);
  } catch (error) {
    $('entry-status').textContent = (error.status === 400 ? error.message : '暫時未能連線。請檢查網絡，再試一次。');
  } finally {
    joining = false;
    updateEntry();
  }
});

function startSession(group, number) {
  return call('session', { method: 'POST', body: { group, number, client: 'tab' } });
}

function remember(profile) {
  try {
    if (!profile) sessionStorage.removeItem(tabKey);
    else {
      const { group, number, season, token, stamp } = profile;
      sessionStorage.setItem(tabKey, JSON.stringify({ group, number, season, token, stamp }));
    }
  } catch {
    // Students can still use the current page when tab storage is unavailable.
  }
}

function enter(profile, restoring) {
  student = profile;
  remember(profile);
  $('identity').textContent = profile.group + '・' + profile.number + ' 號';
  for (const id of ['identity', 'switch', 'progress', 'game-tools']) $(id).hidden = false;
  $('entry').hidden = true;
  const firstUncleared = LEVELS.findIndex((level, i) => !personalBest(i + 1) && !queued(i + 1));
  const requested = Number(new URL(window.location.href).searchParams.get('level')) - 1;
  const resume = firstUncleared === -1 ? LEVELS.length - 1 : firstUncleared;
  const initial = restoring && Number.isInteger(requested) && requested >= resume && canPlay(requested + 1) ? requested : resume;
  openLevel(initial);
  sync();
}

function showEntrance(message = '') {
  student = null;
  remember(null);
  setSyncAlert('');
  history.replaceState(null, '', './');
  $('group').value = '';
  $('number').value = '';
  $('entry-status').textContent = message;
  $('entry').hidden = false;
  for (const id of ['identity', 'switch', 'progress', 'game-tools']) $(id).hidden = true;
  if (ranking.open) ranking.close();
  openLevel(0, false);
  updateEntry();
  $('group').focus();
}

$('switch').addEventListener('click', async () => {
  const profile = student;
  showEntrance();
  if (profile) {
    joining = true;
    updateEntry();
    try {
      await call('session', { method: 'DELETE', profile });
    } catch {
      // Continue switching if the connection is unavailable or the session has expired.
    } finally {
      joining = false;
      updateEntry();
    }
  }
});

function canPlay(number) {
  return number === 1 || !!personalBest(number - 1) || !!queued(number - 1);
}

function openLevel(index, updatePath = true) {
  levelIndex = index;
  mirrors = new Map();
  changes = [];
  win = null;
  $('hint').setAttribute('aria-expanded', 'false');
  $('hint-text').hidden = true;
  $('hint-text').textContent = getLevel().hint;
  if (student && updatePath) history.replaceState(null, '', '?level=' + levelNumber());
  render(false);
}

function place(key) {
  if (!student) return;
  const before = mirrors.get(key);
  const maximum = getLevel().minimum + 4;
  if (!before && mirrors.size >= maximum) {
    $('feedback').textContent = '已用完這關的鏡子。可點兩次已擺好的鏡子，或按「清空鏡子」。';
    return;
  }
  changes.push(new Map(mirrors));
  if (!before) mirrors.set(key, '/');
  else if (before === '/') mirrors.set(key, '\\');
  else mirrors.delete(key);
  render(true);
}

$('undo').addEventListener('click', () => {
  if (!changes.length) return;
  mirrors = changes.pop();
  render(true);
});
$('reset').addEventListener('click', () => openLevel(levelIndex));
$('hint').addEventListener('click', () => {
  $('hint-text').hidden = !$('hint-text').hidden;
  $('hint').setAttribute('aria-expanded', String(!$('hint-text').hidden));
});
$('next').addEventListener('click', () => {
  if (levelNumber() === LEVELS.length) return openRanking();
  openLevel(levelIndex + 1);
  $('level-title').tabIndex = -1;
  $('level-title').focus();
});

function render(allowScore) {
  const level = getLevel();
  currentRay = trace(level, mirrors);
  $('level-label').textContent = '第 ' + levelNumber() + ' 關 / 共 ' + LEVELS.length + ' 關';
  $('level-title').textContent = level.title;
  $('task').textContent = level.task;
  $('mirror-count').innerHTML = mirrors.size + '<span> / ' + (level.minimum + 4) + '</span>';
  $('undo').disabled = !changes.length;
  $('reset').disabled = !mirrors.size;

  cells.forEach((cell, key) => {
    let kind = '';
    let label = '空格';
    let icon = '';
    if (key === level.source) { kind = 'source'; label = '光源，向右照'; icon = '➜'; }
    else if (key === level.target) {
      kind = 'target' + (currentRay.status === 'target' ? ' lit' : '');
      label = currentRay.status === 'target' ? '已點亮的晶石' : '目標晶石';
      icon = '◆';
    } else if (level.walls.includes(key)) { kind = 'wall'; label = '擋板'; }
    else if (mirrors.has(key)) {
      kind = 'mirrored' + (mirrors.get(key) === '/' ? '' : ' back');
      label = mirrors.get(key) === '/' ? '鏡子，向右上斜' : '鏡子，向右下斜';
    }
    const [x, y] = location(key);
    cell.className = 'cell ' + kind;
    cell.disabled = !student || key === level.source || key === level.target || kind === 'wall';
    cell.firstChild.textContent = icon;
    cell.setAttribute('aria-label', '第 ' + (y + 1) + ' 行第 ' + (x + 1) + ' 格，' + label);
  });

  const messages = {
    exit: '光線照到棋盤外了。試試在光線經過的格子放鏡子。',
    wall: '光線被擋板截住了。試試在擋板前改變光線的方向。',
    loop: '光線在鏡子之間繞圈。試試轉動其中一塊鏡子。',
    target: '晶石亮起來了！'
  };
  $('feedback').textContent = messages[currentRay.status];
  if (student && allowScore && currentRay.status === 'target') recordWin();
  if (currentRay.status !== 'target') win = null;
  renderProgress();
  renderWin();
  drawBeam();
}

function recordWin() {
  const number = levelNumber();
  const count = mirrors.size;
  const score = scoreFor(getLevel(), count);
  const saved = personalBest(number);
  const inQueue = queued(number);
  win = { count, score };
  if ((!saved || count < saved.mirrors) && (!inQueue || count < inQueue.mirrors.length)) {
    const key = studentKey(student);
    pending[key] ??= {};
    pending[key][number] = { level: number, version: VERSION, mirrors: [...mirrors] };
    savePending();
  }
  sync();
}

function renderWin() {
  $('win').hidden = !student || !win;
  if (!win || !student) return;
  $('win-title').textContent = '成功過關！ +' + win.score + ' 分';
  const best = personalBest(levelNumber());
  const unsynced = queued(levelNumber());
  const status = unsynced ? (storageFailed ? '成績待同步，請保持此頁開啟。' : '成績待同步。') :
    (best ? '本關最佳 ' + best.score + ' 分。' : '');
  $('win-detail').textContent = '用了 ' + win.count + ' 塊鏡子。' + status;
  $('next').textContent = levelNumber() === LEVELS.length ? '看排行榜' : '下一關 →';
}

function renderProgress() {
  if (!student) return;
  const selected = document.activeElement?.dataset?.level;
  let completed = 0;
  let total = 0;
  $('level-list').replaceChildren(...LEVELS.map((level, index) => {
    const number = index + 1;
    const saved = personalBest(number);
    const waiting = queued(number);
    if (saved || waiting) {
      completed++;
      total += Math.max(saved?.score || 0, waiting ? scoreFor(level, waiting.mirrors.length) : 0);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-link';
    button.dataset.level = String(number);
    button.textContent = '第 ' + number + ' 關' + (waiting ? ' ·' : saved ? ' ✓' : '');
    button.disabled = !canPlay(number);
    button.setAttribute('aria-label', level.title + (waiting ? '，成績待同步' : saved ? '，已過關' : ''));
    if (index === levelIndex) button.setAttribute('aria-current', 'step');
    button.addEventListener('click', () => openLevel(index));
    return button;
  }));
  if (selected) $('level-list').querySelector('[data-level="' + selected + '"]')?.focus();
  $('total-score').innerHTML = total + ' <span>分</span>';
  $('completion').textContent = completed + ' / ' + LEVELS.length + ' 關';
}

async function sync() {
  if (syncing || reconnecting || !student || student.needsSession || !navigator.onLine) return;
  const profile = student;
  const queue = pending[studentKey(profile)];
  if (!queue || !Object.keys(queue).length) return;
  syncing = true;
  try {
    while (student === profile) {
      const key = Object.keys(queue).sort((a, b) => a - b)[0];
      if (!key) break;
      const attempt = queue[key];
      const result = await call('finish', { method: 'POST', profile, body: { ...attempt, stamp: profile.stamp } });
      if (queue[key] === attempt) delete queue[key];
      savePending();
      if (student === profile) {
        profile.bests = result.bests;
        setSyncAlert('');
      }
    }
  } catch (error) {
    if (student === profile) {
      if (error.status === 401) {
        profile.needsSession = true;
        setSyncAlert('報到已過期。你可以繼續闖關，恢復同步後會補交成績。');
      } else {
        setSyncAlert('成績待同步。你可以繼續闖關，網絡恢復後會再試。');
      }
    }
  } finally {
    syncing = false;
    if (student === profile) {
      renderProgress();
      renderWin();
      if (ranking.open && !profile.needsSession) loadRanking();
    } else if (student) {
      sync();
    }
  }
}

function setSyncAlert(message) {
  $('sync-message').textContent = message;
  $('sync-alert').hidden = !message;
  $('reconnect').disabled = reconnecting;
}

$('reconnect').addEventListener('click', async () => {
  if (!student || reconnecting || syncing) return;
  const profile = student;
  if (!profile.needsSession) return sync();
  reconnecting = true;
  setSyncAlert('正在恢復成績同步…');
  try {
    const renewed = await startSession(profile.group, profile.number);
    if (student !== profile) return;
    if (renewed.season !== profile.season) {
      showEntrance('學年已更新，請重新報到。');
      return;
    }
    student = renewed;
    remember(renewed);
    setSyncAlert('');
  } catch {
    if (student === profile) setSyncAlert('暫時未能恢復同步，請稍後再試。');
  } finally {
    reconnecting = false;
    $('reconnect').disabled = false;
    if (student && student !== profile) sync();
  }
});

async function restore() {
  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem(tabKey));
  } catch {
    return;
  }
  if (!saved || !validStudent(saved.group, saved.number) || saved.season !== schoolYear() || !saved.token) return;
  joining = true;
  updateEntry();
  $('entry-status').textContent = '正在恢復闖關進度…';
  try {
    let profile;
    try {
      profile = { ...await call('session', { profile: saved }), token: saved.token };
    } catch (error) {
      if (error.status !== 401) throw error;
      profile = await startSession(saved.group, saved.number);
    }
    enter(profile, true);
  } catch {
    $('group').value = saved.group;
    $('number').value = String(saved.number);
    $('entry-status').textContent = '暫時未能恢復進度。連線後請再試。';
  } finally {
    joining = false;
    updateEntry();
  }
}

function drawBeam() {
  if (!currentRay) return;
  const { width, height } = beam.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  beam.width = Math.round(width * ratio);
  beam.height = Math.round(height * ratio);
  const ctx = beam.getContext('2d');
  ctx.scale(ratio, ratio);
  const dx = width / WIDTH;
  const dy = height / HEIGHT;
  const points = currentRay.points.map(([x, y, type]) => [(x + .5) * dx, (y + .5) * dy, type]);
  const [startX, startY] = points[0];
  const [endX, endY] = points.at(-1);
  ctx.beginPath();
  ctx.moveTo(startX + dx * .27, startY);
  for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#ffb93444';
  ctx.lineWidth = 9;
  ctx.shadowColor = '#ffab23';
  ctx.shadowBlur = 9;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffd275';
  ctx.lineWidth = 2.7;
  ctx.stroke();
  ctx.fillStyle = '#fff0a7';
  for (let index = 1; index < points.length; index++) {
    const [x, y, type] = points[index];
    if (type !== 'pass' || index % 2 !== 0) continue;
    const [prevX, prevY] = points[index - 1];
    const angle = Math.atan2(y - prevY, x - prevX);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-3, 3);
    ctx.lineTo(-3, -3);
    ctx.fill();
    ctx.restore();
  }
  if (currentRay.status === 'target') {
    ctx.strokeStyle = '#ffe79e';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(endX, endY, Math.min(dx, dy) * .33, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function openRanking() {
  if (!ranking.open) ranking.showModal();
  loadRanking();
}

async function loadRanking() {
  const id = ++rankRequest;
  $('table-wrap').hidden = true;
  $('rank-filters').hidden = !student;
  if (!student) {
    $('rank-status').textContent = '請先選擇班別和學號，再查看排行榜。';
    return;
  }
  [...$('rank-filters').children].forEach((control, i) => {
    control.setAttribute('aria-pressed', String(rankFilter === (['', ...CLASSES][i])));
  });
  $('rank-status').textContent = '正在載入排名…';
  const profile = student;
  try {
    const { rows } = await call('leaderboard?group=' + rankFilter, { profile });
    if (rankRequest !== id || profile !== student || !ranking.open) return;
    $('rank-rows').replaceChildren(...rows.map(row => {
      const tr = document.createElement('tr');
      if (row.mine) tr.className = 'mine';
      for (const value of [row.rank, row.mine ? row.group + '・' + profile.number + ' 號（你）' : row.group, row.levels + ' / ' + LEVELS.length, row.mirrors, row.score]) {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      }
      return tr;
    }));
    $('table-wrap').hidden = rows.length === 0;
    $('rank-status').textContent = rows.length ? '' : '暫時未有過關紀錄。快來挑戰第一關！';
  } catch (error) {
    if (rankRequest !== id || profile !== student || !ranking.open) return;
    if (error.status === 401) {
      profile.needsSession = true;
      setSyncAlert('報到已過期。你可以繼續闖關，恢復同步後可看排行榜。');
      $('rank-status').textContent = '請關閉排行榜，然後按「恢復成績同步」。';
    } else $('rank-status').textContent = '暫時未能載入排名。請關閉後再試。';
  }
}

$('leader').addEventListener('click', openRanking);
$('close').addEventListener('click', () => ranking.close());
ranking.addEventListener('close', () => { rankRequest++; });
window.addEventListener('online', sync);
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
window.setInterval(sync, 20000);
new ResizeObserver(drawBeam).observe(beam);
openLevel(0, false);
const year = schoolYear();
for (const key of Object.keys(pending)) {
  if (!key.startsWith(year + '-')) delete pending[key];
}
savePending();

restore();
