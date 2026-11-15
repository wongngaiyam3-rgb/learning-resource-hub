import assert from 'node:assert/strict';import {questions} from '../dist/content.js';
const API='https://eoweuhjuazcjjztnugoi.supabase.co/functions/v1/inheritance-api';
async function call(action,data={},token=''){const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action,...data})});return {status:r.status,data:await r.json()};}
assert.equal((await call('teacher-data')).status,401);
assert.equal((await call('teacher-login',{password:'incorrect-test-value'})).status,401);
assert.equal((await call('start',{class:'4D',student_no:26})).status,400);
const s=(await call('start',{class:'4C',student_no:25})).data;
console.log('QA_SESSION='+s.id);
assert.ok(s.token);
assert.equal((await call('answer',{question_id:'f1',choice:0,event_id:crypto.randomUUID()},s.token)).status,400);
let q=questions[0],event=crypto.randomUUID();
const payload={question_id:q.id,choice:(q.answer+1)%3,event_id:event};
let r=await call('answer',payload,s.token);assert.equal(r.data.correct,false);
r=await call('answer',payload,s.token);assert.equal(r.data.events.length,1);
for(const q of questions){r=await call('answer',{question_id:q.id,choice:q.answer,event_id:crypto.randomUUID()},s.token);assert.equal(r.status,200);assert.equal(r.data.correct,true);}
assert.equal(r.data.events.length,19);
assert.equal((await call('progress',{},s.token)).data.events.length,19);
console.log('API checks passed: invalid login, invalid roster, locked level, idempotent retry, all 18 answers, persisted progress.');
