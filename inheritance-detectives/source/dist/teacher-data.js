import {levels,questions,summarize,csvCell} from './content.js';
export function roster(data){
 const bySession=new Map();for(const a of data.answers){if(!bySession.has(a.session_id))bySession.set(a.session_id,[]);bySession.get(a.session_id).push(a);}
 const result=[];
 for(const cls of ['4A','4B','4C'])for(let n=1;n<=25;n++){
  const sessions=data.sessions.filter(s=>s.class===cls&&s.student_no===n).map(s=>({...s,events:bySession.get(s.id)||[]})).sort((a,b)=>a.created_at.localeCompare(b.created_at));
  const latest=sessions.at(-1);const summary=summarize(latest?.events||[]);
  result.push({class:cls,no:n,sessions,latest,summary,started:!!latest,completed:summary.levels.every(Boolean),best:Math.max(0,...sessions.map(s=>summarize(s.events).firstCorrect)),at:latest?.events.at(-1)?.created_at||latest?.created_at||''});
 }
 return result;
}
export const dateTime=t=>t?new Date(t).toLocaleString('zh-HK',{timeZone:'Asia/Hong_Kong',hour12:false}):'—';
export function exportRows(rows){
 const data=[['班別','學號','狀態','最新一輪已完成關卡','最新一輪已答對題數','最新一輪首次答對題數','歷次最佳首次答對題數','最新一輪作答次數','進入次數',...levels.map(l=>l.name),'最後活動時間（香港）']];
 for(const r of rows)data.push([r.class,r.no,!r.started?'未開始':r.completed?'全部完成':'進行中',r.summary.levels.filter(Boolean).length,r.summary.solved.length,r.summary.firstCorrect,r.best,r.summary.attempts,r.sessions.length,...r.summary.levels.map(x=>x?'完成':'未完成'),dateTime(r.at)]);
 return '\uFEFF'+data.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
export function exportDetails(rows){
 const data=[['班別','學號','學習輪次','題號','關卡','題目','所選答案','是否答對','作答時間（香港）']];
 for(const r of rows)r.sessions.forEach((s,i)=>s.events.forEach(e=>{const q=questions.find(q=>q.id===e.question_id);data.push([r.class,r.no,i+1,e.question_id,levels[q?.level]?.name,q?.title,q?.options[e.choice]?.label,e.correct?'是':'否',dateTime(e.created_at)]);}));
 return '\uFEFF'+data.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
