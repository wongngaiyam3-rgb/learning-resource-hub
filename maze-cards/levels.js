export const cards = {
  F: { label: '前進一步', symbol: '↑', hint: '向箭嘴所指的方向走一格' },
  B: { label: '後退一步', symbol: '↓', hint: '向箭嘴相反的方向走一格' },
  L: { label: '左轉', symbol: '↶', hint: '在原地向左轉' },
  R: { label: '右轉', symbol: '↷', hint: '在原地向右轉' },
}

const maps = [
  ['向前出發', '看看方向箭嘴，數一數出口在前面幾格。', 1, ['####', 'S.E#', '####']],
  ['原地轉個彎', '棋子轉彎時會留在原格。', 1, ['####', 'S..#', '##E#', '####']],
  ['出口在背後', '後退時，棋子向箭嘴相反的方向走，朝向保持一樣。', 1, ['####', 'E.S#', '####', '####']],
  ['面向下方出發', '棋子面向下方。想一想它的左邊在哪裏。', 2, ['#S###', '#.###', '#...E', '#####']],
  ['連續兩個彎', '每次轉彎後，再看看棋子的新方向。', 1, ['#####', '###.E', '###.#', 'S...#', '#####']],
  ['第一次遇上岔路', '先看看岔路的兩邊，找出通往出口的一邊。', 0, ['######', '.....#', '#.##.#', '#.##E#', '#S####']],
  ['倒車出車位', '棋子面向牆壁。看看它背後通往哪裏。', 2, ['##...E', '##.###', '##...#', '####.#', '####S#', '######']],
  ['穿過彎曲走廊', '先排到第一個轉角，再想下一段路。', 1, ['##....E', '##.####', '##.####', '...#.##', '.###..#', '.....S#']],
  ['哪條路較短？', '兩條路都可到達出口。試試比較兩條路用幾張卡。', 1, ['#######', '.....E#', '.####.#', '.##...#', '.#..###', '.S.####', '#######']],
  ['終極逃脫迷宮', '出口就在附近。沿可走的格仔找出繞路的方法。', 1, ['########', '#S.....#', '###.##.#', '#E#.##.#', '#.#....#', '#.####.#', '#......#', '##.###.#']],
]

const locate = (map, mark) => {
  const row = map.findIndex(line => line.includes(mark))
  return { row, col: map[row].indexOf(mark) }
}

export const levels = maps.map(([title, hint, direction, map], index) => ({
  id: index + 1, title, hint, map, start: { ...locate(map, 'S'), direction }, exit: locate(map, 'E'),
}))

const offsets = [[-1, 0], [0, 1], [1, 0], [0, -1]]
export function move(level, position, card) {
  if (card === 'L' || card === 'R') {
    return { ...position, direction: (position.direction + (card === 'L' ? 3 : 1)) % 4 }
  }
  const [dy, dx] = offsets[position.direction]
  const sign = card === 'B' ? -1 : 1
  const row = position.row + dy * sign
  const col = position.col + dx * sign
  const tile = level.map[row]?.[col]
  return tile && tile !== '#' ? { row, col, direction: position.direction } : null
}

export function atExit(level, position) {
  return position.row === level.exit.row && position.col === level.exit.col
}
