export const WIDTH = 8;
export const HEIGHT = 7;
export const VERSION = 1;
export const CLASSES = ['4A', '4B', '4C'];
export const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const turns = { '/': [3, 2, 1, 0], '\\': [1, 0, 3, 2] };

export function validStudent(group, number) {
  return CLASSES.includes(group) && Number.isInteger(number) && number >= 1 && number <= 25;
}

export function schoolYear(now = new Date()) {
  const date = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return date.getUTCFullYear() - Number(date.getUTCMonth() < 8);
}

export const cellKey = (x, y) => y * WIDTH + x;
export const location = key => [key % WIDTH, Math.floor(key / WIDTH)];
export function scoreFor(level, count) {
  return 100 - 10 * (count - level.minimum);
}

export function trace(level, mirrors) {
  let [x, y] = location(level.source);
  let direction = level.direction;
  const points = [[x, y, 'source']];
  const seen = new Set();
  while (true) {
    const [dx, dy] = DIRECTIONS[direction];
    x += dx;
    y += dy;
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
      points.push([x - dx / 2, y - dy / 2, 'exit']);
      return { points, status: 'exit' };
    }
    const cell = cellKey(x, y);
    const state = cell * 4 + direction;
    if (cell === level.target) {
      points.push([x, y, 'target']);
      return { points, status: 'target' };
    }
    if (cell === level.source || level.walls.includes(cell)) {
      points.push([x - dx * .42, y - dy * .42, 'wall']);
      return { points, status: 'wall' };
    }
    if (seen.has(state)) return { points, status: 'loop' };
    seen.add(state);
    const mirror = mirrors.get(cell);
    if (mirror) {
      points.push([x, y, 'mirror']);
      direction = turns[mirror][direction];
    } else {
      points.push([x, y, 'pass']);
    }
  }
}

export function readMirrors(level, entries) {
  if (!Array.isArray(entries) || entries.length > level.minimum + 4) return null;
  const mirrors = new Map();
  for (const entry of entries) {
    if (!Array.isArray(entry) || entry.length !== 2) return null;
    const [cell, type] = entry;
    if (!Number.isInteger(cell) || cell < 0 || cell >= WIDTH * HEIGHT ||
        (type !== '/' && type !== '\\') || mirrors.has(cell) ||
        cell === level.source || cell === level.target || level.walls.includes(cell)) return null;
    mirrors.set(cell, type);
  }
  return mirrors;
}

const map = (source, target, walls, minimum, title, task, hint) => ({
  source: cellKey(...source), target: cellKey(...target), walls: walls.map(pair => cellKey(...pair)),
  direction: 0, minimum, title, task, hint
});

export const LEVELS = [
  map([0,3], [4,1], [], 1, '第一次反射', '用鏡子把光線轉向，點亮紫色晶石。', '看看晶石下方，哪一格同時在光線經過的那一行？'),
  map([0,2], [6,5], [[6,2],[0,5],[7,2]], 2, '繞開擋板', '擋板截住去路。試試轉動鏡子，讓光線向下走。', '在擋板前放一塊鏡子，再點一次，看看光線會否向下走。'),
  map([0,5], [6,1], [[3,5],[1,1],[2,1],[3,3],[5,2],[7,5]], 3, '三級轉向', '用多次反射，把光線送到遠處的晶石。', '先在第一塊擋板前向上轉，再找一條能一路向右的通道。'),
  map([0,5], [5,1], [[1,0],[1,2],[1,4],[2,3],[3,5],[4,4],[5,0],[5,4],[6,1],[6,6],[7,0],[7,1],[7,3]], 4, '狹窄通道', '在擋板之間找出可通過的路徑。', '起點右方第二格可以向上走一格。看看能否在下一塊擋板前向右轉。'),
  map([0,4], [6,2], [[1,1],[1,2],[2,0],[2,4],[3,0],[3,3],[3,4],[4,0],[4,4],[5,2],[6,0],[6,3],[6,5],[7,0],[7,4],[7,5]], 5, '晶石的上方', '觀察晶石四周，找出光線可以進入的方向。', '試試先把光線送到晶石上方，再讓它向下照。'),
  map([0,2], [6,3], [[1,0],[1,3],[1,4],[2,2],[2,4],[3,2],[3,3],[3,5],[4,0],[4,3],[4,5],[4,6],[5,2],[5,3],[6,1],[6,2],[6,6],[7,4]], 6, '光線迷宮', '找出通往晶石的路，再挑戰用最少的鏡子。', '由晶石往外看，最右一列可以接通上方與晶石所在的一行。')
];
