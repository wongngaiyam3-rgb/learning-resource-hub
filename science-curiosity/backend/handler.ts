import { handleScienceApi, type ScienceEnv } from './lib/science-api.ts';
import type { MonitorStore } from './lib/monitor-store.ts';
export const ORIGIN='https://wongngaiyam3-rgb.github.io';
// Published student sites only. Teacher operations remain GitHub-only.
export const STUDENT_ORIGINS=new Set(["https://wongngaiyam3-rgb.github.io","https://tangram-island-classroom.ilovetsr089.chatgpt.site","https://rainforest-food-chain-quest.ilovetsr089.chatgpt.site","https://fraction-kitchen-lab.ilovetsr089.chatgpt.site","https://transmission-route-detective.ilovetsr089.chatgpt.site","https://moonlight-phase-lab.ilovetsr089.chatgpt.site","https://panda-quadrilateral-rescue.ilovetsr089.chatgpt.site","https://rhombus-group-discussions.ilovetsr089.chatgpt.site","https://divisibility-small-steps.ilovetsr089.chatgpt.site","https://number-card-divisibility.ilovetsr089.chatgpt.site","https://multiply-step-lab.ilovetsr089.chatgpt.site","https://lever-explorer.ilovetsr089.chatgpt.site","https://seasons-classroom-lab.ilovetsr089.chatgpt.site","https://candy-packaging-factory.ilovetsr089.chatgpt.site","https://day-night-detective-hk.ilovetsr089.chatgpt.site","https://microbial-postcards.ilovetsr089.chatgpt.site"]);
const BASE='/functions/v1/xiaoke-science';
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});}
export function makeHandler(getRuntime:()=>Promise<{env:ScienceEnv;store:MonitorStore}>,fetcher:typeof fetch=fetch){return async(request:Request)=>{
 const origin=request.headers.get('origin'),url=new URL(request.url);
 const path=url.pathname.replace(/^\/(?:functions\/v1\/)?xiaoke-science(?=\/|$)/,'')||'/';
 const teacher=path.startsWith('/api/teacher/');
 const allowed=!!origin&&(teacher?origin===ORIGIN:STUDENT_ORIGINS.has(origin));
 const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'});
 if(allowed){headers.set('Access-Control-Allow-Origin',origin!);headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');headers.set('Access-Control-Allow-Headers','Content-Type, Authorization, x-region');headers.set('Access-Control-Max-Age','600');}
 let response:Response;
 try {
 if(origin && !allowed)response=json({error:'不允許此來源。'},403);
 else if(request.method==='OPTIONS')response=allowed?new Response(null,{status:204}):json({error:'不允許此來源。'},403);
 else if(request.method==='POST'&&!allowed)response=json({error:'請從學習問答網站操作。'},403);
 else if(!['/api/health','/api/config','/api/ask','/api/teacher/session','/api/teacher/events','/api/teacher/control'].includes(path))response=json({error:'找不到此操作。'},404);
 else if(path.startsWith('/api/teacher/')&&path!=='/api/teacher/session'&&!request.headers.get('authorization'))response=json({error:'請先登入教師監察站。'},401);
 else {
 const runtime=await getRuntime();
 if(path==='/api/health')response=json({service:'xiaoke-science',databaseReady:true,configured:!!(runtime.env.GEMINI_API_KEY&&runtime.env.TEACHER_PASSWORD_HASH&&runtime.env.TEACHER_SESSION_SECRET)});
 else if(!runtime.env.GEMINI_API_KEY||!runtime.env.TEACHER_PASSWORD_HASH||!runtime.env.TEACHER_SESSION_SECRET)response=json({error:'小科新服務已部署，正等待擁有人完成安全金鑰設定。',code:'setup_required'},503);
 else {
 const innerHeaders=new Headers(request.headers);
 // This adapter never trusts an external cookie. The teacher page sends its
 // short-lived signed session in Authorization; the shared core verifies it.
 innerHeaders.delete('cookie');
 const auth=innerHeaders.get('authorization');
 if(auth?.startsWith('Bearer ')){const token=auth.slice(7);if(/^[0-9]+\.[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(token))innerHeaders.set('cookie','science_teacher='+token);}
 innerHeaders.delete('authorization');
 // Public browser origin was checked above; normalization preserves the core's
 // existing same-origin POST checks without permitting other browser origins.
 const studentOrigin=allowed?origin!:ORIGIN;
 const normalized=new Request(studentOrigin+path+url.search,{method:request.method,headers:innerHeaders,body:['GET','HEAD'].includes(request.method)?undefined:request.body,duplex:'half'} as RequestInit);
 response=await handleScienceApi(normalized,{...runtime.env,STUDENT_ORIGIN:studentOrigin},fetcher,runtime.store);
 if(path==='/api/teacher/session'&&request.method==='POST'&&response.ok){const cookie=response.headers.get('set-cookie');const token=cookie?.match(/^science_teacher=([^;]+)/)?.[1];response=token?json({ok:true,token,expiresIn:28800}):json({error:'登入暫時未能完成。'},503);}
 }
 }
 }catch{response=json({error:'安全服務暫時未能連線，本次不會顯示 AI 回答。',code:'backend_unavailable'},503);}
 const out=new Headers(response.headers);out.delete('set-cookie');headers.forEach((v,k)=>out.set(k,v));
 return new Response(response.body,{status:response.status,headers:out});
 };}
