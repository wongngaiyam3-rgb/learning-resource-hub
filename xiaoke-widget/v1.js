/* Public UI only. Gemini credentials and moderation stay on the existing server. */
(() => {
  'use strict';

  const script=document.currentScript;
  if(document.getElementById('xiaoke-universal-host'))return;
  const hiddenRoute=()=>/(?:^|\/)(?:teacher|admin)(?:\/|\.|$)/i.test(location.pathname)||/^#\/?(?:teacher|admin)/i.test(location.hash);
  if(hiddenRoute())return;
  let siteLabel=script?.dataset.xiaokeSite||document.title.split(/[｜|·]/)[0]||'學習網站';
  const topic=script?.dataset.xiaokeTopic||'general';
  const biome=new URLSearchParams(location.search).get('map');
  if(biome&&topic==='ecology')siteLabel=({'ocean':'海洋食物鏈探險隊','desert':'沙漠食物鏈探險隊','savanna':'草原食物鏈探險隊'})[biome]||siteLabel;
  const host=document.createElement('div');host.id='xiaoke-universal-host';
  host.setAttribute('data-xiaoke-version','20261102-1');document.body.append(host);
  const root=host.attachShadow({mode:'open'});
  root.innerHTML="<style>/* The assistant is isolated from the existing lesson's classes and state. */\n.xiaoke-launcher{display:flex;align-items:center;gap:9px;flex-shrink:0;background:#264f49;color:#fffef8;border:1px solid #143e37;border-radius:15px;padding:7px 14px 7px 8px;box-shadow:0 4px 10px #264f491c;font:inherit;font-size:14px;font-weight:750;white-space:nowrap;transition:transform .2s,box-shadow .2s}\n.xiaoke-launcher:hover{transform:translateY(-2px);box-shadow:0 7px 18px #264f492c}.xiaoke-launcher small{display:block;font-size:9px;font-weight:500;letter-spacing:.04em;opacity:.85;text-align:left}.xiaoke-spark{color:#e8efa9;font-size:17px}.xiaoke-robot{display:grid;place-items:center;width:37px;height:40px}.xiaoke-robot svg{width:40px;height:40px;stroke:#e5eece;stroke-width:2;fill:#f9fbec;stroke-linecap:round;stroke-linejoin:round}.xiaoke-robot .xiaoke-face{fill:#183f3d;stroke:#183f3d}.xiaoke-robot .xiaoke-eyes{stroke:#a2f4e6;stroke-width:3}\n\ndialog.xiaoke-panel{position:fixed;inset:90px 20px auto auto;margin:0;padding:0;width:440px;max-width:calc(100vw - 32px);height:min(760px,calc(100dvh - 110px));max-height:calc(100dvh - 110px);border:1px solid #cfdace;border-radius:23px;background:#fbfcf7;color:#243e35;box-shadow:0 22px 75px #16382c40;overflow:hidden;font:inherit;line-height:1.6}\n.xiaoke-panel[open]{display:flex;flex-direction:column}.xiaoke-panel::backdrop{background:#233f351c}.xiaoke-panel [hidden]{display:none!important}.xiaoke-panel button,.xiaoke-panel select,.xiaoke-panel textarea{font:inherit}.xiaoke-panel button{cursor:pointer}.xiaoke-panel button:disabled{cursor:default;opacity:.55}.xiaoke-panel button:focus-visible,.xiaoke-panel select:focus-visible,.xiaoke-panel textarea:focus-visible,.xiaoke-launcher:focus-visible{outline:3px solid #75a899;outline-offset:3px}\n.xiaoke-heading{display:flex;align-items:center;gap:11px;padding:17px 19px;background:#264f49;color:#fffef8;flex-shrink:0}.xiaoke-heading h2{margin:0;font-size:17px;line-height:1.5;letter-spacing:.01em}.xiaoke-heading p{margin:2px 0 0;font-size:11px;color:#dfebdb}.xiaoke-avatar{display:grid;place-items:center;width:37px;height:37px;flex-shrink:0;border-radius:13px;background:#e8efa9;color:#264f49;font-size:25px}.xiaoke-icon-button{display:grid;place-items:center;margin-left:auto;width:36px;height:36px;border:1px solid #ffffff45;border-radius:11px;color:white;font-size:25px!important;background:transparent;line-height:1}.xiaoke-privacy{margin:0;padding:10px 18px;border-bottom:1px solid #e1e7d9;background:#f0f4e7;color:#52674f;font-size:11px;line-height:1.7;flex-shrink:0}\n.xiaoke-body{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:20px;scroll-behavior:smooth}.xiaoke-entry{padding:13px 0}.xiaoke-kicker{font-size:11px;letter-spacing:.18em;color:#64806b}.xiaoke-entry h3{font-size:21px;margin:10px 0 6px}.xiaoke-entry>p{font-size:13px;color:#637365;margin:0 0 20px}.xiaoke-entry-fields{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin:21px 0 16px}.xiaoke-entry-fields label{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:650}.xiaoke-entry-fields select{height:44px;max-width:100%;border:1px solid #c9d4c6;border-radius:10px;padding:0 10px;background:white;color:#284a3c}.xiaoke-primary{border:1px solid #264f49;border-radius:10px;background:#264f49;color:#fffef8;padding:10px 17px;min-height:43px;font-size:13px!important;font-weight:700!important}.xiaoke-entry .xiaoke-primary{width:100%}.xiaoke-entry .xiaoke-note{font-size:11px;line-height:1.8;margin-top:17px}.xiaoke-entry #xiaoke-connection{margin:10px 0;font-size:12px}.xiaoke-text-button{border:0;background:transparent;color:#315f50;text-decoration:underline;text-underline-offset:3px;padding:4px 0;font-size:12px!important}\n.xiaoke-student{display:flex;justify-content:space-between;align-items:center;border-bottom:1px dashed #d5dfce;padding-bottom:10px;margin-bottom:16px;font-size:12px}.xiaoke-student strong{background:#edf1df;border-radius:8px;padding:5px 9px;font-weight:650}.xiaoke-welcome{font-size:14px;line-height:1.8;margin:0 0 13px}.xiaoke-suggestions{display:flex;flex-direction:column;align-items:flex-start;gap:7px;margin-bottom:20px}.xiaoke-suggestions button{border:1px solid #cddbc7;background:#f6f8ee;color:#305646;text-align:left;border-radius:12px;padding:8px 11px;font-size:12px;line-height:1.6}.xiaoke-suggestions button:hover{background:#e8f0dc}.xiaoke-messages{display:flex;flex-direction:column;gap:12px}.xiaoke-message{border:1px solid #e0e7d7;background:white;padding:14px;border-radius:14px;font-size:13px;overflow-wrap:anywhere;white-space:pre-wrap}.xiaoke-message.xiaoke-user{align-self:flex-end;max-width:94%;background:#eaf0dc;border-color:#d5e1c5;border-radius:14px 14px 3px 14px}.xiaoke-message.xiaoke-answer{border-radius:14px 14px 14px 3px}.xiaoke-message.xiaoke-error{background:#fff5e8;border-color:#ead5b4;color:#795b32}.xiaoke-message h3{font-size:12px;color:#3d6b55;margin:13px 0 5px}.xiaoke-message h3:first-child{margin-top:0}.xiaoke-message p{font-size:13px;line-height:1.85;margin:0}.xiaoke-message .xiaoke-answer-note{font-size:10px;color:#71806d;margin-top:13px}\n.xiaoke-composer{border-top:1px solid #dce4d4;background:#fffef9;padding:13px 18px 12px;flex-shrink:0}.xiaoke-composer label{display:block;font-size:12px;font-weight:700;margin-bottom:6px}.xiaoke-composer textarea{display:block;width:100%;resize:vertical;min-height:62px;max-height:120px;border:1px solid #cbd6c2;border-radius:10px;background:white;padding:9px 11px;color:#284a3c;font-size:14px;line-height:1.6;box-sizing:border-box}.xiaoke-compose-actions{display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:12px}.xiaoke-compose-actions span{font-size:11px;color:#72816b}.xiaoke-composer>small{display:block;margin-top:7px;font-size:10px;color:#78816f;line-height:1.5}.xiaoke-composer #xiaoke-status{font-size:12px;color:#526a52;margin:5px 0 0}.xiaoke-composer #xiaoke-status:empty{display:none}\n\n\n@media(prefers-reduced-motion:reduce){.xiaoke-launcher{transition:none}.xiaoke-body{scroll-behavior:auto}}\n@media print{.xiaoke-launcher,dialog.xiaoke-panel{display:none!important}}\n\n:host([hidden]){display:none!important}:host{all:initial;font:14px/1.6 system-ui,-apple-system,\"Noto Sans TC\",sans-serif;color:#243e35}*{box-sizing:border-box}button,select,textarea{font-family:inherit}button{cursor:pointer}p{margin:0}.xiaoke-launcher{position:fixed;top:12px;right:16px;z-index:2147483646;min-height:48px}.xiaoke-launcher small{font-size:10px}.xiaoke-panel .xiaoke-body{font-size:14px}.xiaoke-heading h2{color:#fffef8}.xiaoke-entry h3{line-height:1.5}dialog.xiaoke-panel{top:76px;max-height:calc(100dvh - 92px);height:min(760px,calc(100dvh - 92px));font:14px/1.6 system-ui,-apple-system,\"Noto Sans TC\",sans-serif}.xiaoke-suggestions button{font-size:12px}.xiaoke-composer textarea{font-size:16px}.xiaoke-panel::backdrop{background:#173b2a22}.xiaoke-panel [hidden]{display:none!important}@media(max-width:650px){.xiaoke-launcher{right:10px;padding:5px 10px;gap:6px;font-size:12px;min-height:43px}.xiaoke-launcher small,.xiaoke-spark{display:none}.xiaoke-robot,.xiaoke-robot svg{width:30px;height:33px}dialog.xiaoke-panel{inset:8px!important;width:calc(100vw - 16px)!important;max-width:calc(100vw - 16px)!important;height:calc(100dvh - 16px)!important;max-height:calc(100dvh - 16px)!important;border-radius:18px!important}.xiaoke-heading{padding:13px 15px}.xiaoke-heading h2{font-size:16px}.xiaoke-privacy{font-size:10px}.xiaoke-body{padding:16px}.xiaoke-composer{padding:10px 14px}}\n</style><button id=\"xiaoke-launcher\" class=\"xiaoke-launcher\" aria-label=\"召喚小科\" aria-haspopup=\"dialog\" aria-controls=\"xiaoke-panel\" aria-expanded=\"false\"><span class=\"xiaoke-robot\" aria-hidden=\"true\"><svg viewBox=\"0 0 48 48\"><path d=\"M24 9V5\"/><circle cx=\"24\" cy=\"4\" r=\"2\"/><rect x=\"8\" y=\"10\" width=\"32\" height=\"29\" rx=\"11\"/><rect class=\"xiaoke-face\" x=\"13\" y=\"17\" width=\"22\" height=\"15\" rx=\"6\"/><path class=\"xiaoke-eyes\" d=\"M19 22v3m10-3v3\"/><path d=\"M4 21v8m40-8v8M18 43h12\"/></svg></span><span>召喚小科<small>有問題，問問我！</small></span><span class=\"xiaoke-spark\" aria-hidden=\"true\">✦</span></button><dialog id=\"xiaoke-panel\" class=\"xiaoke-panel\" aria-labelledby=\"xiaoke-title\" aria-describedby=\"xiaoke-privacy\">\n    <header class=\"xiaoke-heading\"><span class=\"xiaoke-avatar\" aria-hidden=\"true\">✦</span><div><h2 id=\"xiaoke-title\">小科的學習問答室</h2><p>一起追蹤看不見的傳播路線</p></div><button id=\"xiaoke-close\" class=\"xiaoke-icon-button\" aria-label=\"收起小科\">×</button></header>\n    <p id=\"xiaoke-privacy\" class=\"xiaoke-privacy\">提問及回答會經安全審查，老師可查看最近30天的問答紀錄。請不要輸入姓名、電話或其他個人資料。AI 回答請與老師一起核對。</p>\n    <div class=\"xiaoke-body\">\n      <section id=\"xiaoke-entry\" class=\"xiaoke-entry\" aria-labelledby=\"xiaoke-entry-title\"><span class=\"xiaoke-kicker\">準備出發</span><h3 id=\"xiaoke-entry-title\">先讓小科認識你的班別</h3><p>選好班別和學號，就可以提問了。</p><form id=\"xiaoke-entry-form\"><div class=\"xiaoke-entry-fields\"><label>班別<select id=\"xiaoke-class\" aria-label=\"班別\" required><option value=\"\">選擇班別</option><option>4A</option><option>4B</option><option>4C</option></select></label><label>學號<select id=\"xiaoke-number\" aria-label=\"學號\" required><option value=\"\">選擇學號</option></select></label></div><button id=\"xiaoke-start\" class=\"xiaoke-primary\" type=\"submit\" disabled>開始問小科 ↗</button></form><p class=\"xiaoke-note\">班別及學號由你自選，並非登入驗證。問答紀錄會送往小科的安全伺服器。</p><p id=\"xiaoke-connection\" role=\"status\">開啟後連接小科…</p><button id=\"xiaoke-reconnect\" class=\"xiaoke-text-button\" type=\"button\" hidden>重新連線</button></section>\n      <section id=\"xiaoke-chat\" class=\"xiaoke-chat\" hidden aria-label=\"與小科提問\"><div class=\"xiaoke-student\"><strong id=\"xiaoke-student-label\"></strong><button id=\"xiaoke-switch\" class=\"xiaoke-text-button\" type=\"button\">切換學生</button></div><p class=\"xiaoke-welcome\">嗨！我是 AI 學習助手小科。先觀察，再問一個「為甚麼」吧！</p><div id=\"xiaoke-suggestions\" class=\"xiaoke-suggestions\" aria-label=\"可以問小科\"><button type=\"button\">為甚麼用梘液洗手能減少病菌？</button><button type=\"button\">病原體和病媒有甚麼不同？</button><button type=\"button\">看起來乾淨的水也可能有病原體嗎？</button></div><div id=\"xiaoke-messages\" class=\"xiaoke-messages\" role=\"log\" aria-label=\"本次問答\" aria-live=\"polite\" aria-relevant=\"additions\"></div></section>\n    </div>\n    <form id=\"xiaoke-ask-form\" class=\"xiaoke-composer\" hidden><label for=\"xiaoke-question\">想問小科的問題</label><textarea id=\"xiaoke-question\" rows=\"2\" maxlength=\"330\" placeholder=\"例如：蚊子怎樣傳播病原體？\" required></textarea><div class=\"xiaoke-compose-actions\"><span id=\"xiaoke-counter\">0 / 330 字</span><button id=\"xiaoke-send\" class=\"xiaoke-primary\" type=\"submit\" disabled>問問小科 ↑</button></div><p id=\"xiaoke-status\" role=\"status\"></p><small>每題獨立回答。關閉視窗可繼續任務；切換學生會清除本次對話。</small></form>\n  </dialog>";
  const prompts={general:['我應該怎樣先觀察，再提出好問題？','植物如何製造自己的養料？','為甚麼計算時要留意單位？'],earth:['為甚麼會有日夜？','地球的地軸傾斜與四季有甚麼關係？','為甚麼月亮看起來會發光？'],microbes:['細菌和病毒有甚麼不同？','螢光和自體發光有甚麼不同？','為甚麼洗手有助減少病原體？'],health:['病原體和病媒有甚麼不同？','為甚麼用梘液洗手能減少病菌？','看起來乾淨的水也可能有病原體嗎？'],lever:['槓桿的支點有甚麼作用？','為甚麼力臂較長可能較省力？','公平測試應保持甚麼不變？'],ecology:['食物鏈的箭頭表示甚麼？','為甚麼植物是生產者？','某種動物減少，其他生物一定會同樣減少嗎？'],number:['為甚麼能被3整除要看各位數字的和？','兩位數乘法為甚麼要分開計算？','除法的餘數為甚麼要小於除數？'],geometry:['菱形和正方形有甚麼相同和不同？','怎樣判斷兩條線是否平行？','轉動圖形後，邊長會改變嗎？'],fraction:['分數乘分數可以怎樣用面積表示？','分數乘法的積一定比原來的數小嗎？','分數約分後，數值為甚麼不變？']};
  const list=root.getElementById('xiaoke-suggestions');list.replaceChildren();
  for(const text of prompts[topic]||prompts.general){const b=document.createElement('button');b.type='button';b.textContent=text;list.append(b);}
  root.querySelector('.xiaoke-heading p').textContent=siteLabel;
  root.querySelector('.xiaoke-welcome').textContent='嗨！我是AI學習助手小科。我們先觀察、再想一想，一起探索科學與數學。';
  root.querySelector('#xiaoke-question').placeholder='寫下你想了解的科學或數學問題…';
  const selectors=['#classSelect','#class-name','select[name="class"]','select[name="className"]','#student-class'];
  const numberSelectors=['#numberSelect','#student-number','select[name="number"]','select[name="studentNo"]','#student-no'];
  function pageIdentity(){
    let c,n;for(const selector of selectors){const e=document.querySelector(selector);if(e&&/^(4A|4B|4C)$/.test(e.value)){c=e.value;break;}}
    for(const selector of numberSelectors){const e=document.querySelector(selector);if(e&&/^(?:[1-9]|1[0-9]|2[0-5])$/.test(e.value)){n=Number(e.value);break;}}
    if(c&&n)return {className:c,number:n};
    for(const selector of ['#studentTag','#student-id','.passport-strip b','#studentName']){const text=document.querySelector(selector)?.textContent||'';const m=text.match(/(4[ABC])\s*[・·．\s-]*\s*(\d{1,2})\s*號/);if(m&&Number(m[2])>=1&&Number(m[2])<=25)return {className:m[1],number:Number(m[2])};}
    return null;
  }

  const API = 'https://nltqzuhubqhwtfxwuupr.supabase.co/functions/v1/xiaoke-science';
  const SOURCE = '【'+siteLabel.slice(0,48)+'】\n';
  const byId = id => root.getElementById(id);
  const launcher = byId('xiaoke-launcher'), panel = byId('xiaoke-panel');
  const entry = byId('xiaoke-entry'), chat = byId('xiaoke-chat');
  const entryForm = byId('xiaoke-entry-form'), askForm = byId('xiaoke-ask-form');
  const classSelect = byId('xiaoke-class'), numberSelect = byId('xiaoke-number');
  const start = byId('xiaoke-start'), question = byId('xiaoke-question');
  const send = byId('xiaoke-send'), messages = byId('xiaoke-messages');
  const status = byId('xiaoke-status'), connection = byId('xiaoke-connection');
  const reconnect = byId('xiaoke-reconnect'), suggestions = byId('xiaoke-suggestions');
  let config = null, identity = null, busy = false, sequence = 0, controller = null;
  let configSequence = 0, connecting = false;

  for (let n = 1; n <= 25; n++) numberSelect.add(new Option(`${n} 號`, String(n)));
  const validEntry = () => ['4A', '4B', '4C'].includes(classSelect.value) && /^(?:[1-9]|1[0-9]|2[0-5])$/.test(numberSelect.value);
  function controls() {
    start.disabled = !config || connecting || !validEntry();
    send.disabled = !identity || busy || !question.value.trim();
    question.disabled = busy;
    suggestions.querySelectorAll('button').forEach(button => { button.disabled = busy; });
    send.textContent = busy ? '安全檢查中…' : '問問小科 ↑';
    byId('xiaoke-counter').textContent = `${question.value.length} / 330 字`;
  }
  async function connect() {
    const turn = ++configSequence;
    const abort = new AbortController(), timer = setTimeout(() => abort.abort(),15000);
    connecting = true; config = null; connection.textContent = '正在連接小科…'; reconnect.hidden = true; controls();
    try {
      const response = await fetch(API + '/api/config', {credentials:'omit', cache:'no-store', headers:{'x-region':'ap-southeast-1'}, signal:abort.signal});
      const data = await response.json();
      if (!response.ok || data.mode !== 'live' || !/^\d{4}-\d{4}$/.test(data.academicYear)) throw new Error('unavailable');
      if (turn !== configSequence) return;
      config = data; connection.textContent = '● 小科已連線・提問前後均設安全審查';
    } catch {
      if (turn !== configSequence) return;
      connection.textContent = '小科暫時未能連線。可以先繼續任務，稍後再試。'; reconnect.hidden = false;
    } finally {
      clearTimeout(timer);
      if (turn === configSequence) { connecting = false; controls(); }
    }
  }
  function open() {
    if (!panel.open) panel.showModal();
    launcher.setAttribute('aria-expanded', 'true');
    if(!identity){const p=pageIdentity();if(p){classSelect.value=p.className;numberSelect.value=String(p.number);controls();}}
    if (!identity && !connecting) connect();
    if (identity) question.focus(); else classSelect.focus();
  }
  launcher.addEventListener('click', open);
  byId('xiaoke-close').addEventListener('click', () => panel.close());
  panel.addEventListener('close', () => { launcher.setAttribute('aria-expanded','false'); launcher.focus(); });
  reconnect.addEventListener('click', connect);
  [classSelect, numberSelect].forEach(select => select.addEventListener('change', controls));
  entryForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!config || !validEntry() || connecting) return;
    identity = Object.freeze({className:classSelect.value, number:Number(numberSelect.value), academicYear:config.academicYear});
    entry.hidden = true; chat.hidden = false; askForm.hidden = false;
    byId('xiaoke-student-label').textContent = `${identity.className} ・ ${identity.number} 號`;
    controls(); question.focus();
  });
  byId('xiaoke-switch').addEventListener('click', () => {
    sequence++; controller?.abort(); controller = null; identity = null; busy = false;
    messages.replaceChildren(); status.textContent = ''; question.value = '';
    classSelect.value = ''; numberSelect.value = ''; suggestions.hidden = false;
    chat.hidden = true; askForm.hidden = true; entry.hidden = false;
    connect(); classSelect.focus();
  });
  question.addEventListener('input', controls);
  suggestions.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || busy || !identity) return;
    question.value = button.textContent; controls(); question.focus();
  });
  function addMessage(kind, text) {
    const article = document.createElement('article');
    article.className = `xiaoke-message xiaoke-${kind}`;
    if (text) article.textContent = text;
    messages.append(article);
    // Keep only the latest questions in memory, never in local/session storage.
    while (messages.children.length > 24) messages.firstElementChild.remove();
    return article;
  }
  function scrollMessages() { const body = panel.querySelector('.xiaoke-body'); body.scrollTop = body.scrollHeight; }
  askForm.addEventListener('submit', async event => {
    event.preventDefault();
    const text = question.value.trim();
    if (!identity || busy || !text || text.length > 330) return;
    const enrollment = identity, turn = ++sequence, abort = new AbortController();
    controller = abort; busy = true; suggestions.hidden = true;
    addMessage('user', text); question.value = ''; status.textContent = '小科正在檢查提問、準備解說及審查回答…'; controls(); scrollMessages();
    const timeout = setTimeout(() => abort.abort(), 145000);
    try {
      const response = await fetch(API + '/api/ask', {method:'POST', credentials:'omit', headers:{'Content-Type':'application/json','x-region':'ap-southeast-1'}, body:JSON.stringify({identity:enrollment, question:SOURCE + text}), signal:abort.signal});
      const data = await response.json();
      if (turn !== sequence || identity !== enrollment) return;
      if (!response.ok) {
        const message = typeof data.error === 'string' && data.error.length <= 700 ? data.error : '小科暫時未能完成安全檢查，請稍後再試。';
        addMessage('error', message);
        if (data.code === 'entry_required') { byId('xiaoke-switch').click(); return; }
      } else {
        if (data.mode !== 'live' || !data.answer || !['explanation','example','followup'].every(key => typeof data.answer[key] === 'string' && data.answer[key].trim() && data.answer[key].length <= 1600)) throw new Error('invalid_response');
        const article = addMessage('answer');
        for (const [key, title] of [['explanation','✦ 小科解說'],['example','生活中的例子'],['followup','換你想一想']]) {
          const heading = document.createElement('h3'), paragraph = document.createElement('p');
          heading.textContent = title; paragraph.textContent = data.answer[key]; article.append(heading, paragraph);
        }
        const note = document.createElement('p'); note.className = 'xiaoke-answer-note'; note.textContent = 'AI 回答・請與老師一起核對'; article.append(note);
      }
    } catch {
      if (turn === sequence && identity === enrollment) addMessage('error', '連線或安全檢查暫時未能完成，本次不會顯示 AI 回答。請稍後再試。');
    } finally {
      clearTimeout(timeout);
      if (turn === sequence && identity === enrollment) { busy = false; controller = null; status.textContent = ''; controls(); scrollMessages(); if (panel.open) question.focus(); }
    }
  });
  window.addEventListener('pagehide', () => {
    sequence++; controller?.abort(); controller = null; busy = false;
    status.textContent = ''; controls();
  });

  window.addEventListener('keydown',event=>{if(panel.open&&event.composedPath().includes(host))event.stopImmediatePropagation();},true);
  root.addEventListener('click',event=>event.stopPropagation());
  root.addEventListener('pointerdown',event=>event.stopPropagation());
  function clearForHostSwitch(){if(identity)byId('xiaoke-switch').click();}
  document.addEventListener('click',event=>{const b=event.target.closest?.('button,a');if(b&&b.textContent.trim().length<=24&&/切換學生|更換學生|重新報到|登出|換位同學/.test(b.textContent))clearForHostSwitch();},true);
  document.addEventListener('change',event=>{if([...selectors,...numberSelectors].some(s=>event.target.matches?.(s)))clearForHostSwitch();},true);
  function placeLauncher(){
    let top=12;const width=launcher.offsetWidth||140,right=window.innerWidth<650?10:16,left=innerWidth-right-width;
    for(let i=0;i<8;i++){const hits=[...document.querySelectorAll('button,a,input,select,[role="button"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<240&&r.right>left&&r.left<innerWidth-right&&r.bottom>top&&r.top<top+48;});if(!hits.length)break;const next=Math.max(...hits.map(e=>e.getBoundingClientRect().bottom))+8;if(next===top||next>240)break;top=next;}
    launcher.style.top=top+'px';host.hidden=hiddenRoute();if(host.hidden&&panel.open)panel.close();
  }
  window.addEventListener('resize',placeLauncher);window.addEventListener('load',placeLauncher);window.addEventListener('hashchange',placeLauncher);window.addEventListener('popstate',placeLauncher);setTimeout(placeLauncher,1200);placeLauncher();
  document.addEventListener('fullscreenchange',()=>{const target=document.fullscreenElement;if(target&&!['CANVAS','VIDEO','IFRAME'].includes(target.tagName))target.append(host);else if(!target)document.body.append(host);placeLauncher();});
  let lastRoute=location.pathname+location.hash;new MutationObserver(()=>{const route=location.pathname+location.hash;if(route!==lastRoute){lastRoute=route;placeLauncher();}}).observe(document.body,{childList:true,subtree:true});
  controls();
})();
