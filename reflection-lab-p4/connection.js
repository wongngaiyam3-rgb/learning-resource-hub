export const apiBase = 'https://nltqzuhubqhwtfxwuupr.supabase.co/functions/v1/reflection-lab';

export function callApi(path, method = 'GET', body, token) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers['x-reflection-token'] = token;
  return fetch(apiBase + '/' + path, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12000)
  });
}
