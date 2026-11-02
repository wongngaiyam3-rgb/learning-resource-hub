import { classify, geminiJSON, localScreen, redactPII, answerSchema, scienceInstruction, supportMessage, SafetyBlocked, SafetyUnavailable, type GeminiConfig, type Category } from './moderation.ts';
import type { MonitorStore, EventInput } from './monitor-store.ts';
import { digest, checkPassword, newSession, isTeacher, teacherCookie, type TeacherSecrets } from './teacher-auth.ts';
export type Identity = { className: string; number: number; academicYear: string };
export type Answer = { explanation: string; example: string; followup: string };
export type ScienceEnv = GeminiConfig & TeacherSecrets & { DB?: unknown; STUDENT_ORIGIN?:string };
const APP_ID = 'appgprj_6ae739c4817c8191af69ec46530db418';
export const DEMOS: Record<string, Answer> = {
  '為甚麼月亮看起來會發光？': { explanation: '月球本身不會發光。太陽光照到月球後，部分光會被反射到地球，進入我們的眼睛，所以我們能看見明亮的月亮。', example: '在較暗的房間，用電筒照向灰色的球。球沒有自己發光，但反射了電筒的光，所以你能看見它。請由成人陪同，不要把電筒照向眼睛。', followup: '如果沒有太陽光照到月球，我們還能看見明亮的月亮嗎？' },
  '為甚麼會有日夜？': { explanation: '地球不斷自轉。面向太陽的一面受到陽光照射，是白天；背向太陽的一面沒有受到陽光直接照射，是黑夜。地球大約每 24 小時自轉一圈。', example: '想像你站在一個慢慢轉動的地球儀上。轉向燈光時像白天，轉到背光的一面就像黑夜。', followup: '地球上的所有地方，會在同一時間都是白天嗎？' },
  '為甚麼仙人掌的葉子像刺？': { explanation: '很多仙人掌的葉已變成刺狀。刺的表面積較小，有助減少水分散失，也能減少動物啃食。仙人掌的綠色莖可以進行光合作用，肥厚的莖還能儲水。', example: '沙漠長時間缺水。就像水壺的開口越小越容易保留水分，較小的葉表面有助植物保存水分；不過植物散失水分的過程和水壺並不完全相同。', followup: '如果把闊大而薄的葉子放在乾熱的沙漠，可能有甚麼問題？' },
  '植物需要吃東西嗎？': { explanation: '植物需要養分，但大多數綠色植物不用像動物一樣吃食物。它們利用光、水和空氣中的二氧化碳，透過光合作用製造糖等養料。根會吸收水和礦物質。', example: '植物像小小的食物工場：葉子接收光，根吸收水，再利用空氣中的二氧化碳製造養料。泥土並不是植物的主要食物。', followup: '如果一株綠色植物長時間得不到光，生長可能會有甚麼變化？' },
  '為甚麼電線外面包着塑膠？': { explanation: '電線內層通常用容易導電的金屬，讓電流通過。外層用一般不容易導電的塑膠作絕緣保護，減少觸電和短路的風險。破損的電線仍然很危險。', example: '電線的金屬內層像讓電流通過的道路，塑膠外層像保護道路的圍欄。只觀察完整的電線外觀，不要拆開電線或接觸插座。', followup: '如果電線的金屬內層也改成塑膠，電器還能正常運作嗎？' },
  '粗糙的鋁箔也會反光嗎？': { explanation: '會。光滑和粗糙的鋁箔都能反射光。光滑的表面讓很多光線朝較整齊的方向反射；粗糙的表面讓光線朝不同方向反射，所以通常較難形成清晰影像。', example: '平整鋁箔和揉皺後攤開的鋁箔都看得見，因為都有光反射進入眼睛。揉皺的鋁箔有很多朝向不同的小表面。', followup: '為甚麼鏡子的表面通常很平滑？' },
  '為甚麼運動後心跳會加快？': { explanation: '運動時，肌肉需要更多氧氣和養料來釋放能量。心臟跳得較快，能把更多血液送到肌肉，並運走二氧化碳等物質。休息後，心跳一般會慢慢回復。', example: '心臟像運送物資的幫手。肌肉工作忙起來，心臟也要更忙，把所需物資送過去。', followup: '運動前和休息後量度心跳，你預計會有甚麼分別？' },
  '為甚麼要洗手？': { explanation: '手可能沾上引起疾病的微生物。我們觸摸眼、鼻、口或拿食物時，微生物可能進入身體。用梘液和清水仔細洗手，有助移走污垢和微生物，減低感染機會。', example: '洗手時要照顧手掌、手背、指縫、指尖和拇指。不要只把手快速沾一下水。', followup: '吃東西前和如廁後，為甚麼特別需要洗手？' },
  '食物鏈的箭頭指向哪裏？': { explanation: '食物鏈的箭頭由被吃的生物，指向吃牠的生物，表示食物中能量傳遞的方向。例如：草 → 蚱蜢 → 青蛙 → 蛇。', example: '蚱蜢吃草，從草獲得能量，所以箭頭由草指向蚱蜢。箭頭不是表示「誰去捉誰」。', followup: '如果毛毛蟲被小鳥吃掉，箭頭應該由誰指向誰？' },
  '所有細菌都會令人患病嗎？': { explanation: '不是。只有部分細菌會引起疾病。有些細菌能幫助分解生物遺體，有些可用來製作食品；人體內也有對我們有益的細菌。不能單靠外觀判斷是否有害。', example: '製作乳酪會用到特定的細菌。不過這不代表可以接觸或食用不明的微生物。', followup: '如果沒有幫助分解的微生物，自然環境可能會有甚麼改變？' },
  '水蒸氣和白色水霧一樣嗎？': { explanation: '不一樣。水蒸氣是氣態的水，通常看不見。白色水霧是很多微小液態水滴聚在一起。水蒸氣遇冷，可能凝結成這些小水滴。', example: '熱水上方看到的白色水霧，是微小水滴，不是看得見的水蒸氣。請保持距離，不要靠近熱水或水壺口。', followup: '冷水杯外面的水珠，可能是由哪裏的水形成的？' },
  '為甚麼沙土排水比較快？': { explanation: '一般而言，沙土的顆粒較大，顆粒之間的空隙也較大，水比較容易通過，所以排水較快。實際速度也會受土壤壓得多緊和有機物含量等因素影響。', example: '比較不同土壤時，使用相同的土壤量、加水量、容器和壓實程度，才能作較公平的測試。', followup: '測試不同土壤的排水速度時，應該改變甚麼？又要保持甚麼不變？' },
};
export function academicYear(date = new Date()) { const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: 'numeric' }).formatToParts(date); const year = Number(parts.find(p => p.type === 'year')!.value); const month = Number(parts.find(p => p.type === 'month')!.value); const start = month >= 9 ? year : year - 1; return `${start}-${start + 1}`; }
export function validIdentity(value: unknown): value is Identity { if (!value || typeof value !== 'object') return false; const v = value as Identity; return ['4A', '4B', '4C'].includes(v.className) && Number.isInteger(v.number) && v.number >= 1 && v.number <= 25 && v.academicYear === academicYear(); }
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
function json(value:unknown,status=200,extra:Record<string,string>={}){return new Response(JSON.stringify(value),{status,headers:{...JSON_HEADERS,...extra}});}
export function configured(env:ScienceEnv){return !!(env.GEMINI_API_KEY && env.GEMINI_MODEL);}
async function readBody(request:Request){const reader=request.body?.getReader();if(!reader)throw Error('invalid_body');let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();throw Error('too_large');}chunks.push(value);}const joined=new Uint8Array(size);let pos=0;for(const chunk of chunks){joined.set(chunk,pos);pos+=chunk.length;}const body=JSON.parse(new TextDecoder().decode(joined));if(!body||typeof body!=='object'||Array.isArray(body))throw Error('invalid_body');return body as Record<string,unknown>;}
function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin;}
export async function handleScienceApi(request:Request,env:ScienceEnv,fetcher:typeof fetch=fetch,storeOverride?:MonitorStore):Promise<Response>{
 const path=new URL(request.url).pathname;const origin=request.headers.get('origin');
 const studentRoute=path==='/api/config'||path==='/api/ask';
 const allowed=!!origin&&!!env.STUDENT_ORIGIN&&origin===env.STUDENT_ORIGIN;
 if(request.method==='OPTIONS')return studentRoute&&allowed?new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin!,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}}):json({error:'不允許此來源。'},403);
 const response=await handleScienceApiCore(request,env,fetcher,storeOverride);
 if(studentRoute&&allowed){const headers=new Headers(response.headers);headers.set('Access-Control-Allow-Origin',origin!);headers.set('Vary','Origin');return new Response(response.body,{status:response.status,headers});}
 return response;
}
async function handleScienceApiCore(request:Request,env:ScienceEnv,fetcher:typeof fetch,storeOverride?:MonitorStore):Promise<Response>{
 const url=new URL(request.url);const path=url.pathname;
 const store=storeOverride || null;
 if(path==='/api/config'&&request.method==='GET')return json({mode:configured(env)?'live':'demo',academicYear:academicYear(),monitoring:true,retentionDays:30});
 if(!path.startsWith('/api/teacher')&&path!=='/api/ask')return json({error:'找不到這個頁面。'},404);
 const allowedStudentOrigin=path==='/api/ask'&&!!env.STUDENT_ORIGIN&&request.headers.get('origin')===env.STUDENT_ORIGIN;
 if(request.method==='POST'&&(!(sameOrigin(request)||allowedStudentOrigin)||!request.headers.get('content-type')?.includes('application/json')))return json({error:'請從研究所網頁操作。'},403);
 if(!store)return json({error:'安全監察系統暫時未能連線，請稍後再試。',code:'monitoring_unavailable'},503);
 if(path.startsWith('/api/teacher')){
  try {
   if(path==='/api/teacher/session'&&request.method==='POST'){
    const ip=await digest(request.headers.get('cf-connecting-ip')||'local');if(!await store.quota(`login:${ip}`,8,600000))return json({error:'嘗試次數過多，請十分鐘後再試。'},429);
    const body=await readBody(request);if(typeof body.password!=='string'||body.password.length>200||!await checkPassword(body.password,env))return json({error:'教師密碼不正確。'},401);
    return json({ok:true},200,{'Set-Cookie':teacherCookie(await newSession(env))});
   }
   if(!await isTeacher(request,env))return json({error:'請先登入教師監察站。'},401);
   if(path==='/api/teacher/events'&&request.method==='GET'){
    const f=url.searchParams;if(!f.has('year'))f.set('year',academicYear());
    if(f.get('year')!==academicYear()||f.get('class')&&!['4A','4B','4C'].includes(f.get('class')!)||f.get('number')&&!/^(?:[1-9]|1[0-9]|2[0-5])$/.test(f.get('number')!)||f.get('status')&&!['allowed','blocked','error','off_topic'].includes(f.get('status')!)||f.get('category')&&!['safe','violence','self_harm','sexual','other'].includes(f.get('category')!))return json({error:'篩選條件不正確。'},400);
    return json(await store.list(f));
   }
   if(path==='/api/teacher/control'&&request.method==='POST'){
    const body=await readBody(request);
    if(body.action==='review'&&typeof body.id==='string'&&/^[0-9a-f-]{36}$/.test(body.id)){await store.review(body.id);return json({ok:true});}
    if(body.action==='pause'&&typeof body.paused==='boolean'){await store.setPaused(body.paused);return json({ok:true,paused:body.paused});}
    if(body.action==='logout')return json({ok:true},200,{'Set-Cookie':'science_teacher=; Path=/api/teacher; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
    return json({error:'操作格式不正確。'},400);
   }
   return json({error:'操作不存在。'},404);
  }catch{return json({error:'監察站暫時未能完成操作，請稍後再試。'},503);}
 }
 if(request.method!=='POST')return json({error:'請使用提問表格。'},405);
 let body:Record<string,unknown>;try{body=await readBody(request);}catch(e){return json({error:'提問格式不正確或內容過長。'},e instanceof Error&&e.message==='too_large'?413:400);}
 if(!validIdentity(body.identity))return json({error:'請先選擇班別和學號，再開始學習。',code:'entry_required'},400);
 if(typeof body.question!=='string'||!body.question.trim()||body.question.length>400)return json({error:'請輸入 1 至 400 字的科學問題。'},400);
 const identity=body.identity;const rawQuestion=body.question.trim();const question=redactPII(rawQuestion);let stage='input';
 const record=(fields:Omit<EventInput,'identity'|'question'>)=>store.record({identity,question,...fields});
 const blocked=async(category:Category,reason:string)=>{const eventId=await record({status:'blocked',category,stage,reason});return json({error:supportMessage(category),code:'safety_blocked',category,eventId},422);};
 try{
  const ip=await digest(request.headers.get('cf-connecting-ip')||'local');
  if(!await store.quota(`ip:${ip}`,20,60000)||!await store.quota(`${identity.academicYear}:${identity.className}:${identity.number}:minute`,6,60000)||!await store.quota(`${identity.academicYear}:${identity.className}:${identity.number}:day`,60,86400000))return json({error:'先整理剛才的發現，稍後再提問。每分鐘最多6題，每日最多60題。'},429);
  const local=localScreen(rawQuestion);if(local)return await blocked(local,'輸入規則攔截');
  if(await store.paused())return json({error:'老師暫停了 AI 問答，請先和老師討論。',code:'paused'},503);
  if(!configured(env)){const answer=DEMOS[question];if(!answer)return json({error:'目前是示範模式，請先選擇下方的問題。',code:'demo_only'},503);await record({status:'allowed',category:'safe',stage:'demo',reason:'預先編寫的示範解說',answer:JSON.stringify(answer)});return json({answer,mode:'demo'});}
  // Do not trust client-supplied conversation history. Each question is independently screened.
  const inputDecision=await classify(env,question,fetcher);if(!inputDecision.allowed)return await blocked(inputDecision.category,inputDecision.reason);
  if(!inputDecision.science){await record({status:'off_topic',category:'safe',stage:'input',reason:'非科學或數學提問'});return json({error:'小科解答科學與小學數學問題。可以問問大自然、地球、乘除、分數或圖形！',code:'off_topic'},422);}
  stage='generation';
  const answer=await geminiJSON(env,scienceInstruction,[{role:'user',parts:[{text:question}]}],answerSchema,4096,fetcher,'high');
  if(!['explanation','example','followup'].every(k=>typeof answer[k]==='string'&&String(answer[k]).trim()&&String(answer[k]).length<=1600))throw new SafetyUnavailable();
  stage='output';const output=JSON.stringify(answer);const outputDecision=await classify(env,output,fetcher);if(!outputDecision.allowed)return await blocked(outputDecision.category,'回答未通過安全審查');
  await record({status:'allowed',category:'safe',stage:'complete',reason:'輸入與輸出審查通過',answer:output});
  return json({answer,mode:'live'});
 }catch(e){
  if(e instanceof SafetyBlocked){try{return await blocked(e.category,'Gemini 原生安全過濾器攔截');}catch{return json({error:'安全監察系統未能保存紀錄，本次回答已停止。',code:'monitoring_unavailable'},503);}}
  try{await record({status:'error',category:'other',stage,reason:'審查、連線或紀錄服務暫時不可用；未釋出回答'});}catch{}
  return json({error:'安全檢查或連線暫時未能完成，本次不會顯示 AI 回答，請稍後再試。',code:'safety_unavailable'},503);
 }
}
