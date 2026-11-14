import { callApi } from '../connection.js';
import { LEVELS } from '../optics.js';

const $ = id => document.getElementById(id);
let token;
let activeRequest = 0;
for (let number = 1; number <= 25; number++) $('number').add(new Option(number + ' 號', number));

function logout(message = '') {
  const previous = token;
  token = undefined;
  activeRequest++;
  $('records').replaceChildren();
  $('dashboard').hidden = true;
  $('logout').hidden = true;
  $('login').hidden = false;
  $('status').textContent = message;
  if (previous) callApi('teacher-session', 'DELETE', undefined, previous).catch(() => {});
}

$('logout').addEventListener('click', () => logout('已登出。'));
$('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  $('login-button').disabled = true;
  $('status').textContent = '正在登入…';
  try {
    const response = await callApi('teacher-session', 'POST', { password: $('password').value });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || '暫時未能登入，請再試。');
    token = data.token;
    $('login').hidden = true;
    $('dashboard').hidden = false;
    $('logout').hidden = false;
    load();
  } catch (error) {
    $('status').textContent = error.message;
  } finally {
    $('password').value = '';
    $('login-button').disabled = false;
  }
});

async function load() {
  const id = ++activeRequest;
  const params = new URLSearchParams({ group: $('group').value, number: $('number').value });
  $('status').textContent = '正在載入成績…';
  $('records').replaceChildren();
  try {
    const response = await callApi('teacher-records?' + params, 'GET', undefined, token);
    if (id !== activeRequest) return;
    if (response.status === 401) return logout('請重新登入。');
    if (!response.ok) throw new Error('暫時未能載入成績，請再試。');
    const { rows, season } = await response.json();
    if (id !== activeRequest) return;
    $('school-year').textContent = season + '–' + (season + 1) + ' 學年';
    const pupils = new Map();
    for (const row of rows) {
      const label = row.student_class + '・' + row.student_number + ' 號';
      if (!pupils.has(label)) pupils.set(label, []);
      pupils.get(label).push(row);
    }
    for (const [label, results] of pupils) {
      const row = document.createElement('tr');
      const total = results.reduce((sum, level) => sum + level.score, 0);
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = '查看';
      details.append(summary);
      for (const level of results) {
        const line = document.createElement('div');
        line.textContent = '第 ' + level.level + ' 關 · ' + level.score + ' 分 · ' + level.mirrors + ' 塊';
        details.append(line);
      }
      for (const value of [label, results.length + ' / ' + LEVELS.length, total + ' 分', details]) {
        const cell = document.createElement('td');
        cell.append(value);
        row.append(cell);
      }
      $('records').append(row);
    }
    $('status').textContent = pupils.size ? '共 ' + pupils.size + ' 位學生有成績。' : '此篩選範圍還未收到過關成績。';
  } catch (error) {
    if (id === activeRequest) $('status').textContent = error.message;
  }
}
$('group').addEventListener('change', load);
$('number').addEventListener('change', load);
