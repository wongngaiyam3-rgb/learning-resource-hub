import {questions,summarize} from './content.js';
const url=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type, authorization, apikey','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const encode=new TextEncoder();
async function hash(value:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encode.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function db(path:string,method='GET',body?:unknown,extra={}){
 const r=await fetch(url+'/rest/v1/'+path,{method,headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'return=representation',...extra},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){console.error('Database request failed',r.status,path.split('?')[0]);throw new Error('儲存服務暫時未能使用，請稍後再試。');}
 return r.status===204?[]:await r.json();
}
function fail(message:string,status=400){return new Response(JSON.stringify({error:message}),{status,headers});}
function bearer(req:Request){return (req.headers.get('authorization')||'').replace(/^Bearer /,'');}
async function student(req:Request){const h=await hash(bearer(req));const rows=await db('inheritance_sessions?token_hash=eq.'+h+'&select=id,class,student_no,created_at');return rows[0];}
async function events(id:string){return db('inheritance_answers?session_id=eq.'+id+'&select=event_id,question_id,choice,correct,created_at,seq&order=seq.asc');}
async function teacher(req:Request){const h=await hash(bearer(req));const rows=await db('inheritance_teacher_sessions?token_hash=eq.'+h+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=token_hash');return rows.length>0;}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return fail('只支援 POST。',405);
 try{
 if(Number(req.headers.get('content-length')||0)>8192)return fail('資料過大。',413);
 const raw=await req.text();if(raw.length>8192)return fail('資料過大。',413);
 const data=JSON.parse(raw);const action=data.action;
 const ok=(value:unknown)=>new Response(JSON.stringify(value),{headers});
 if(action==='start'){
  if(!['4A','4B','4C'].includes(data.class)||!Number.isInteger(data.student_no)||data.student_no<1||data.student_no>25)return fail('請選擇正確班別和學號。');
  const token=crypto.randomUUID()+crypto.randomUUID();
  const row=(await db('inheritance_sessions','POST',{class:data.class,student_no:data.student_no,token_hash:await hash(token)}))[0];
  return ok({token,id:row.id,class:row.class,student_no:row.student_no,events:[]});
 }
 if(action==='teacher-login'){
  if(typeof data.password!=='string'||data.password.length>128)return fail('密碼不正確。',401);
  const ip=(req.headers.get('x-forwarded-for')||req.headers.get('cf-connecting-ip')||'unknown').split(',')[0].trim();
  const ipHash=await hash('inheritance-login:'+ip);
  const recent=await db('inheritance_login_attempts?ip_hash=eq.'+ipHash+'&created_at=gt.'+encodeURIComponent(new Date(Date.now()-600000).toISOString())+'&select=id');
  if(recent.length>=8)return fail('嘗試次數太多，請於十分鐘後再試。',429);
  await db('inheritance_login_attempts','POST',{ip_hash:ipHash});
  const settings=(await db('inheritance_settings?id=eq.teacher&select=salt,password_hash,iterations'))[0];
  if(!settings)return fail('教師平台尚未設定。',503);
  const base=await crypto.subtle.importKey('raw',encode.encode(data.password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:encode.encode(settings.salt),iterations:settings.iterations,hash:'SHA-256'},base,256);
  const candidate=[...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,'0')).join('');
  let mismatch=candidate.length^settings.password_hash.length;for(let i=0;i<candidate.length;i++)mismatch|=candidate.charCodeAt(i)^settings.password_hash.charCodeAt(i);
  if(mismatch)return fail('密碼不正確，請再試。',401);
  await db('inheritance_login_attempts?ip_hash=eq.'+ipHash,'DELETE');
  const token=crypto.randomUUID()+crypto.randomUUID();
  await db('inheritance_teacher_sessions','POST',{token_hash:await hash(token),expires_at:new Date(Date.now()+14400000).toISOString()});
  return ok({token});
 }
 if(action==='teacher-data'||action==='teacher-logout'){
  if(!await teacher(req))return fail('教師登入已過期，請重新登入。',401);
  if(action==='teacher-logout'){await db('inheritance_teacher_sessions?token_hash=eq.'+await hash(bearer(req)),'DELETE');return ok({ok:true});}
  // Explicit pagination avoids PostgREST's default 1000-row response truncation.
  const sessions=[];for(let offset=0;;offset+=500){const page=await db('inheritance_sessions?select=id,class,student_no,created_at&order=created_at.asc,id.asc&offset='+offset+'&limit=500');sessions.push(...page);if(page.length<500)break;}
  const answers=[];for(let offset=0;;offset+=500){const page=await db('inheritance_answers?select=event_id,session_id,question_id,choice,correct,created_at,seq&order=seq.asc&offset='+offset+'&limit=500');answers.push(...page);if(page.length<500)break;}
  return ok({sessions,answers,at:new Date().toISOString()});
 }
 const s=await student(req);if(!s)return fail('學生登入已失效，請重新進入。',401);
 if(action==='progress')return ok({events:await events(s.id)});
 if(action==='answer'){
  const q=questions.find(q=>q.id===data.question_id);
  if(!q||!Number.isInteger(data.choice)||data.choice<0||data.choice>2||typeof data.event_id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.event_id))return fail('答案格式不正確。');
  const prior=await events(s.id),summary=summarize(prior);
  if(q.level>0&&!summary.levels[q.level-1])return fail('請先完成上一關。');
  const existing=prior.find(e=>e.event_id===data.event_id);
  if(existing&&(existing.question_id!==q.id||existing.choice!==data.choice))return fail('重複紀錄不一致。',409);
  if(!existing&&!summary.solved.includes(q.id))await db('inheritance_answers?on_conflict=event_id','POST',{event_id:data.event_id,session_id:s.id,question_id:q.id,choice:data.choice,correct:q.answer===data.choice},{Prefer:'resolution=ignore-duplicates,return=representation'});
  return ok({correct:q.answer===data.choice,why:q.why,events:await events(s.id)});
 }
 return fail('找不到此操作。',404);
 }catch(error){console.error('inheritance-api',error instanceof Error?error.message:'unknown');return fail('連線或儲存暫時失敗，請重試。',500);}
});
