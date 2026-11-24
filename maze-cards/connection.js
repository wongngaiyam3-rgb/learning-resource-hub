const endpoint = 'https://eoweuhjuazcjjztnugoi.supabase.co/rest/v1/rpc/'
const apiKey = 'sb_publishable_J-QQNbSeUsya0w7-PK1GWA_TdSDpJ7k'

export async function rpc(name, payload) {
  const response = await fetch(endpoint + 'maze_cards_' + name, {
    method: 'POST',
    headers: { apikey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error('連線失敗')
  return response.json()
}
