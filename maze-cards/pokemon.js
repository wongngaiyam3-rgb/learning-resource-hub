const spriteRoot = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'
const cache = new Map()

export const characters = [
  { id: 25, name: '比卡超' },
  { id: 133, name: '伊貝' },
  { id: 1, name: '奇異種子' },
  { id: 4, name: '小火龍' },
  { id: 7, name: '車厘龜' },
  { id: 143, name: '卡比獸' },
  { id: 0, name: '小車' },
]

// Each sheet uses eight compass rows. The maze uses north, east, south and west.
const directionRows = [4, 2, 0, 6]
const walkSheets = {
  // Image width and height, row height, and square crop (left, top, size).
  1: [240, 320, 40, 7, 4, 25],
  4: [128, 256, 32, 2, 0, 26],
  7: [128, 256, 32, 1, 0, 29],
  25: [128, 320, 40, 1, 0, 30],
  133: [280, 384, 48, 7, 6, 26],
  143: [128, 384, 48, 0, 0, 32],
}

export function directionSprite(id, direction) {
  const [width, height, rowHeight, left, top, size] = walkSheets[id]
  const y = directionRows[direction] * rowHeight + top
  return {
    url: './sprites/' + String(id).padStart(4, '0') + '.png',
    size: (100 * width / size) + '% ' + (100 * height / size) + '%',
    position: (100 * left / (width - size)) + '% ' + (100 * y / (height - size)) + '%',
  }
}

export function fallbackSprite(character) {
  return spriteRoot + character.id + '.png'
}

function allowedSprite(url, id) {
  return url === fallbackSprite({ id }) || url === spriteRoot + 'other/home/' + id + '.png'
}

async function loadSprite(id) {
  const key = 'maze-pokeapi-sprite-v1-' + id
  try {
    const stored = sessionStorage.getItem(key)
    if (allowedSprite(stored, id)) return stored
  } catch {
    // The game also works with the browser's storage disabled.
  }

  const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id + '/', {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  })
  if (!response.ok) throw new Error('PokéAPI request failed')
  const { sprites } = await response.json()
  const image = [sprites?.other?.home?.front_default, sprites?.front_default]
    .find(url => allowedSprite(url, id))
  if (!image) throw new Error('PokéAPI response has no supported sprite')
  try {
    sessionStorage.setItem(key, image)
  } catch {
    // A memory cache still prevents duplicate requests within the page.
  }
  return image
}

export function pokemonSprite(character) {
  if (!cache.has(character.id)) {
    const request = loadSprite(character.id).catch(() => {
      cache.delete(character.id)
      return fallbackSprite(character)
    })
    cache.set(character.id, request)
  }
  return cache.get(character.id)
}
