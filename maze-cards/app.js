import { atExit, cards, levels, move } from './levels.js?v=2'
import { rpc } from './connection.js'
import { characters, directionSprite, fallbackSprite, pokemonSprite } from './pokemon.js?v=3'

const $ = id => document.getElementById(id)
const titles = ['上方', '右方', '下方', '左方']
const directions = ['↑', '→', '↓', '←']
const option = (label, value = label) => new Option(label, value)
const button = (label, action) => {
  const node = document.createElement('button')
  node.type = 'button'
  node.textContent = label
  node.addEventListener('click', action)
  return node
}
function element(tag, className, value) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (value !== undefined) node.textContent = value
  return node
}
const sight = (row, col) => row + ',' + col
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

for (let i = 1; i <= 25; i++) $('student-number').add(option(i + ' 號', i))

let profile
let records = new Map()
let level
let program = []
let position
let visited
let active = -1
let selected = -1
let inserting = false
let ended = false
let won = false
let hit = false
let playing = false
let runVersion = 0
let teacherPassword = ''
let teacherRows = []
let teacherRequest = 0
let dirtyDrafts = new Map()
let pending = []
let saving = false
let saveTimer
let failed = false
let character = characters[0]
const characterSprites = new Map()

function switchView(name) {
  for (const view of ['welcome', 'game', 'teacher']) $(view).hidden = view !== name
  $('home').hidden = name === 'welcome'
  $('teacher-button').hidden = name !== 'welcome'
  $('identity').textContent = name === 'game' ? profile.className + ' · ' + profile.number + ' 號' : ''
  window.scrollTo(0, 0)
}

function tile(marker, marked = false) {
  const node = element('div', 'cell')
  if (marker === '#') node.classList.add('wall')
  if (marker === 'S') node.classList.add('start')
  if (marker === 'E') {
    node.classList.add('exit')
    node.append($('exit-template').content.cloneNode(true))
  }
  if (marked) node.classList.add('visited')
  return node
}

function spriteImage(item) {
  const image = element('img', 'pokemon-sprite')
  image.alt = ''
  image.referrerPolicy = 'no-referrer'
  const fallback = fallbackSprite(item)
  image.addEventListener('error', () => {
    if (image.src !== fallback) {
      image.src = fallback
    } else {
      image.hidden = true
      image.nextElementSibling.hidden = false
    }
  })
  image.src = characterSprites.get(item.id) ?? fallback
  return image
}

function tokenIcon(item) {
  if (!item.id) {
    return $('car-template').content.firstElementChild.cloneNode(true)
  }
  const icon = element('div', 'pokemon-icon')
  const initials = element('span', 'pokemon-initial', item.name[0])
  initials.hidden = true
  icon.append(spriteImage(item), initials)
  return icon
}

function addPiece(tileNode, direction) {
  const token = element('div', 'piece')
  token.dataset.direction = direction
  let icon
  if (character.id) {
    const sprite = directionSprite(character.id, direction)
    icon = element('div', 'direction-sprite')
    icon.style.backgroundImage = 'url(' + sprite.url + ')'
    icon.style.backgroundSize = sprite.size
    icon.style.backgroundPosition = sprite.position
  } else {
    icon = tokenIcon(character)
    icon.style.setProperty('--rotation', direction * 90 + 'deg')
  }
  const arrow = element('span', 'facing-arrow', directions[direction])
  token.setAttribute('aria-hidden', 'true')
  token.append(icon, arrow)
  tileNode.append(token)
}

const sample = $('sample-grid')
for (const row of ['#####', '#..E#', '#.#.#', '#S..#', '#####']) {
  for (const marker of row) sample.append(tile(marker))
}

function renderCharacter() {
  sample.querySelector('.piece')?.remove()
  addPiece(sample.querySelector('.start'), 1)
  $('welcome-character').textContent = '選擇角色 · ' + character.name
  if (position) board()
}

async function selectCharacter(item) {
  character = item
  renderCharacter()
  if (!item.id || characterSprites.has(item.id)) return
  const url = await pokemonSprite(item)
  characterSprites.set(item.id, url)
}

function openCharacterPicker() {
  const choices = characters.map(item => {
    const control = button('', () => {
      selectCharacter(item)
      $('character-picker').close()
    })
    control.setAttribute('aria-pressed', String(character === item))
    const icon = tokenIcon(item)
    icon.setAttribute('aria-hidden', 'true')
    const iconFrame = element('span', 'choice-icon')
    iconFrame.append(icon)
    control.append(iconFrame, element('span', '', item.name))
    return control
  })
  $('character-options').replaceChildren(...choices)
  $('character-picker').showModal()
}

$('welcome-character').addEventListener('click', openCharacterPicker)
$('game-character').addEventListener('click', openCharacterPicker)
selectCharacter(character)

for (const [code, card] of Object.entries(cards)) {
  const control = button('', () => addCard(code))
  control.className = 'card-' + code
  control.title = card.hint
  control.append(element('span', 'symbol', card.symbol), element('span', '', card.label))
  control.firstChild.setAttribute('aria-hidden', 'true')
  $('palette').append(control)
}

function board() {
  const grid = $('board')
  grid.style.setProperty('--cols', level.map[0].length)
  $('facing').textContent = directions[position.direction] + ' ' + character.name + '朝' + titles[position.direction]
  grid.setAttribute('aria-label', character.name + '在第 ' + (position.row + 1) + ' 行第 ' + (position.col + 1) +
    ' 格，朝向' + titles[position.direction] + '。出口在第 ' + (level.exit.row + 1) +
    ' 行第 ' + (level.exit.col + 1) + ' 格。')
  const cells = level.map.flatMap((row, y) => Array.from(row, (marker, x) => {
    const cell = tile(marker, visited.has(sight(y, x)))
    if (y === position.row && x === position.col) {
      addPiece(cell, position.direction)
      if (hit) cell.classList.add('crash')
    }
    return cell
  }))
  grid.replaceChildren(...cells)
}

function renderLevels() {
  let total = 0
  const choices = levels.map(item => {
    const row = records.get(item.id)
    const done = row?.best != null
    const state = done ? '已完成' : row?.draft || row?.attempts ? '練習中' : '未開始'
    if (done) total++
    const control = button(item.id + (done ? ' ✓' : ''), () => openLevel(item.id))
    control.title = item.title
    control.setAttribute('aria-label', '第 ' + item.id + ' 關 ' + item.title + '，' + state)
    if (item.id === level?.id) control.setAttribute('aria-current', 'true')
    if (done) control.classList.add('done')
    return control
  })
  $('levels').replaceChildren(...choices)
  $('completed-total').textContent = '已完成 ' + total + ' / 10'
}

function renderSequence() {
  const sequence = $('sequence')
  const controls = program.map((code, index) => {
    const card = cards[code]
    const control = button('', () => {
      selected = selected === index ? -1 : index
      inserting = false
      renderSequence()
      sequence.children[index]?.focus({ preventScroll: true })
    })
    control.className = 'card-' + code
    control.setAttribute('aria-label', '第 ' + (index + 1) + ' 張，' + card.label)
    control.setAttribute('aria-pressed', String(index === selected))
    control.append(element('span', '', index + 1), element('span', 'symbol', card.symbol))
    control.disabled = playing
    if (index === active) control.classList.add(hit ? 'error' : 'active')
    if (index === selected) control.classList.add('selected')
    return control
  })
  if (!controls.length) controls.push(element('p', '', '點選上面的卡牌來排列指令。'))
  const previousScroll = sequence.scrollTop
  sequence.replaceChildren(...controls)
  sequence.scrollTop = previousScroll
  if (active >= 0 && sequence.children[active]) {
    const current = sequence.children[active]
    if (current.offsetTop + current.offsetHeight > sequence.offsetTop + sequence.scrollTop + sequence.clientHeight) {
      sequence.scrollTop = current.offsetTop - sequence.offsetTop
    }
  }
  $('edits').hidden = selected < 0 || playing
  $('edit-hint').hidden = !inserting
  $('card-count').textContent = program.length + ' 張卡'
  for (const control of $('palette').children) control.disabled = playing
  $('run').disabled = playing || !program.length
  $('step').disabled = playing || !program.length
  $('clear').disabled = playing || !program.length
}

function feedback(text, kind = '') {
  $('feedback').textContent = text
  $('feedback').dataset.kind = kind
}

function rewind() {
  runVersion++
  playing = false
  position = { ...level.start }
  visited = new Set([sight(position.row, position.col)])
  active = -1
  ended = false
  hit = false
  won = false
  selected = -1
  inserting = false
  $('success-controls').hidden = true
  feedback('排好指令後，按「執行全部」或「逐步執行」。')
  board()
  renderSequence()
}

function openLevel(id) {
  flushDrafts()
  level = levels[id - 1]
  program = Array.from(dirtyDrafts.get(id)?.p_cards ?? records.get(id)?.draft ?? '')
  $('level-number').textContent = '第 ' + level.id + ' 關'
  $('level-title').textContent = level.title
  $('hint').textContent = level.hint
  rewind()
  renderLevels()
}

function saveState() {
  failed = false
  $('retry-save').hidden = true
  $('sync-status').textContent = '正在儲存…'
  const draft = program.join('')
  records.set(level.id, { ...records.get(level.id), draft })
  dirtyDrafts.set(level.id, {
    p_class: profile.className, p_number: profile.number, p_level: level.id, p_cards: draft,
  })
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flushDrafts, 450)
}

function flushDrafts() {
  clearTimeout(saveTimer)
  pending.push(...dirtyDrafts.values())
  dirtyDrafts.clear()
  if (pending.length && !failed) sync()
}

async function sync() {
  if (saving || !pending.length) return
  saving = true
  $('retry-save').hidden = true
  $('sync-status').textContent = '正在儲存…'
  try {
    while (pending.length) {
      const request = pending[0]
      const row = await rpc('save', request)
      pending.shift()
      const laterDraft = dirtyDrafts.get(row.level_id) ?? [...pending].reverse().find(item => item.p_level === row.level_id)
      records.set(row.level_id, { ...row, draft: laterDraft?.p_cards ?? row.draft })
    }
    failed = false
    $('sync-status').textContent = dirtyDrafts.size ? '正在儲存…' : '已儲存至雲端'
    renderLevels()
  } catch {
    failed = true
    $('sync-status').textContent = '暫未儲存，請重試。'
    $('retry-save').hidden = false
  } finally {
    saving = false
  }
}

function addCard(code) {
  if (program.length >= 100) {
    feedback('最多可排列 100 張卡。刪除一張卡後再加入。', 'error')
    return
  }
  program.splice(inserting ? selected : program.length, 0, code)
  rewind()
  $('sequence').scrollTop = $('sequence').scrollHeight
  saveState()
}

function finish(success, text) {
  ended = true
  won = success
  feedback(text, success ? 'success' : 'error')
  if (won && level.id < levels.length) $('success-controls').hidden = false
  pending.push({
    p_class: profile.className, p_number: profile.number, p_level: level.id,
    p_cards: program.join(''), p_attempt: crypto.randomUUID(),
  })
  if (!failed) sync()
}

function advance() {
  active++
  const nextPosition = move(level, position, program[active])
  if (!nextPosition) {
    hit = true
    finish(false, '第 ' + (active + 1) + ' 張卡令' + character.name + '碰到牆壁或邊界。點這張卡來修改。')
  } else {
    position = nextPosition
    visited.add(sight(position.row, position.col))
    if (atExit(level, position)) {
      const next = level.id === 10 ? '已到達最後一關的出口！' : '到達出口！'
      finish(true, next + ' 這次用了 ' + (active + 1) + ' 張卡。')
    } else if (active + 1 === program.length) {
      finish(false, character.name + '已走完所有指令。它還未到出口，再加入或修改卡牌。')
    } else {
      feedback('已執行第 ' + (active + 1) + ' 張卡：' + cards[program[active]].label + '。現在朝向' + titles[position.direction] + '。')
    }
  }
  board()
  renderSequence()
}

$('student-form').addEventListener('submit', async event => {
  event.preventDefault()
  const submit = event.submitter
  submit.disabled = true
  $('login-status').textContent = '正在讀取進度…'
  const className = $('student-class').value
  const number = Number($('student-number').value)
  try {
    const rows = await rpc('progress', { p_class: className, p_number: number })
    profile = { className, number }
    records = new Map(rows.map(row => [row.level_id, row]))
    const unfinished = rows.filter(row => row.best == null && row.draft).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]
    openLevel(unfinished?.level_id ?? levels.find(item => records.get(item.id)?.best == null)?.id ?? 1)
    switchView('game')
    $('login-status').textContent = ''
  } catch {
    $('login-status').textContent = '暫時無法讀取進度，請檢查連線後再試。'
  } finally {
    submit.disabled = false
  }
})

$('run').addEventListener('click', async () => {
  rewind()
  const version = runVersion
  playing = true
  renderSequence()
  while (!ended && runVersion === version) {
    advance()
    if (!ended) await sleep(435)
  }
  if (runVersion !== version) return
  playing = false
  renderSequence()
})
$('step').addEventListener('click', () => {
  if (ended) rewind()
  advance()
})
$('reset').addEventListener('click', rewind)
$('clear').addEventListener('click', () => {
  program = []
  rewind()
  saveState()
})
$('delete-card').addEventListener('click', () => {
  program.splice(selected, 1)
  rewind()
  saveState()
})
$('insert-card').addEventListener('click', () => { inserting = true; renderSequence() })
$('cancel-edit').addEventListener('click', () => { inserting = false; selected = -1; renderSequence() })
$('next').addEventListener('click', () => openLevel(level.id + 1))
$('retry-save').addEventListener('click', () => { failed = false; flushDrafts() })
window.addEventListener('beforeunload', event => {
  if (!dirtyDrafts.size && !pending.length) return
  event.preventDefault()
  event.returnValue = ''
})
$('home').addEventListener('click', () => {
  flushDrafts()
  if (saving || pending.length) {
    $('sync-status').textContent = failed ? '返回首頁前，請先重試儲存。' : '正在儲存，完成後可返回首頁。'
    return
  }
  runVersion++
  teacherPassword = ''
  teacherRows = []
  teacherRequest++
  $('teacher-form').hidden = false
  $('roster').hidden = true
  $('teacher-status').textContent = ''
  $('results').replaceChildren()
  $('sync-status').textContent = ''
  $('student-form').reset()
  switchView('welcome')
})

function classRows() {
  const grouped = Map.groupBy ? Map.groupBy(teacherRows, row => row.student_number) : new Map()
  if (!Map.groupBy) {
    for (const row of teacherRows) {
      const group = grouped.get(row.student_number) ?? []
      group.push(row)
      grouped.set(row.student_number, group)
    }
  }
  return Array.from({ length: 25 }, (_, i) => {
    const byLevel = new Map((grouped.get(i + 1) ?? []).map(row => [row.level_id, row]))
    return { number: i + 1, levels: levels.map(item => byLevel.get(item.id)) }
  })
}

function table() {
  const header = element('thead')
  const heading = header.insertRow()
  for (const label of ['學號', '已完成', ...levels.map(item => '第 ' + item.id + ' 關')]) {
    const cell = element('th', '', label)
    cell.scope = 'col'
    heading.append(cell)
  }
  const body = element('tbody')
  for (const row of classRows()) {
    const tr = body.insertRow()
    tr.insertCell().textContent = row.number
    tr.insertCell().textContent = row.levels.filter(item => item?.best != null).length + ' / 10'
    for (const item of row.levels) {
      tr.insertCell().textContent = item?.best != null
        ? item.best + ' 張／' + item.attempts + ' 次'
        : item ? '未過關／' + item.attempts + ' 次' : '—'
    }
  }
  $('results').replaceChildren(header, body)
}

async function loadTeacher(password) {
  const request = ++teacherRequest
  const className = $('teacher-class').value
  $('teacher-status').textContent = '正在讀取紀錄…'
  $('download').disabled = true
  try {
    const rows = await rpc('teacher', { p_password: password, p_class: className })
    if (request !== teacherRequest) return
    if (rows === null) {
      $('teacher-status').textContent = '密碼不正確。'
      return
    }
    teacherPassword = password
    $('teacher-form').reset()
    $('teacher-form').hidden = true
    $('roster').hidden = false
    teacherRows = rows
    $('teacher-status').textContent = ''
    table()
    $('download').disabled = false
  } catch {
    if (request === teacherRequest) $('teacher-status').textContent = '暫時無法讀取紀錄，請重試。'
  }
}

$('teacher-button').addEventListener('click', () => switchView('teacher'))
$('teacher-form').addEventListener('submit', async event => {
  event.preventDefault()
  const submit = event.submitter
  submit.disabled = true
  await loadTeacher($('teacher-password').value)
  submit.disabled = false
})
$('teacher-class').addEventListener('change', () => {
  $('results').replaceChildren()
  loadTeacher(teacherPassword)
})
$('refresh').addEventListener('click', () => loadTeacher(teacherPassword))
$('teacher-logout').addEventListener('click', () => $('home').click())
$('download').addEventListener('click', () => {
  const className = $('teacher-class').value
  const lines = [['班別', '學號', '關卡', '狀態', '嘗試次數', '最少用卡數', '最近練習時間']]
  const dateFormat = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Hong_Kong', dateStyle: 'short', timeStyle: 'medium',
  })
  for (const row of classRows()) {
    for (const [index, item] of row.levels.entries()) {
      lines.push([
        className, row.number, index + 1, item?.best != null ? '已完成' : item ? '練習中' : '未開始',
        item?.attempts ?? 0, item?.best ?? '', item ? dateFormat.format(new Date(item.updated_at)) : '',
      ])
    }
  }
  const output = '\ufeff' + lines.map(line => line.join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([output], { type: 'text/csv;charset=utf-8' }))
  const link = element('a')
  link.href = url
  link.download = 'maze-cards-' + className + '.csv'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
})
