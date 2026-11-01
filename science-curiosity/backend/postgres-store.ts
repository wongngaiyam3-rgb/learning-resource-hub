import { redactPII } from './lib/moderation.ts';
import type { EventInput, MonitorStore } from './lib/monitor-store.ts';
const APP_ID='appgprj_6ae739c4817c8191af69ec46530db418';
// Postgres.js tagged templates bind every value as a parameter.
export class PostgresMonitorStore implements MonitorStore {
 constructor(private sql:any){}
 async cleanup(sql=this.sql){const now=Date.now();await sql`delete from xiaoke_private.moderation_events where created_at < ${now-30*86400000}`;await sql`delete from xiaoke_private.rate_buckets where expires_at < ${now}`;}
 async record(e:EventInput){const id=crypto.randomUUID();await this.sql.begin(async(sql:any)=>{await sql`insert into xiaoke_private.moderation_events (id,app_id,academic_year,class_name,student_number,created_at,question,answer,status,category,stage,reason) values (${id},${APP_ID},${e.identity.academicYear},${e.identity.className},${e.identity.number},${Date.now()},${redactPII(e.question).slice(0,400)},${e.answer?redactPII(e.answer).slice(0,3000):null},${e.status},${e.category},${e.stage},${redactPII(e.reason).slice(0,200)})`;await this.cleanup(sql);});return id;}
 async paused(){const rows=await this.sql`select value from xiaoke_private.site_settings where key='ai_paused'`;return rows[0]?.value==='true';}
 async quota(key:string,limit:number,ttl:number){const bucket=`${APP_ID}:${key}:${Math.floor(Date.now()/ttl)}`;const rows=await this.sql`insert into xiaoke_private.rate_buckets (key,count,expires_at) values (${bucket},1,${Date.now()+ttl*2}) on conflict(key) do update set count=xiaoke_private.rate_buckets.count+1 where xiaoke_private.rate_buckets.count < ${limit} returning count`;return rows.length===1;}
 async list(f:URLSearchParams){await this.cleanup();const sql=this.sql;
 const where=sql`app_id=${APP_ID} and academic_year=${f.get('year')} ${f.get('class')?sql`and class_name=${f.get('class')}`:sql``} ${f.get('number')?sql`and student_number=${Number(f.get('number'))}`:sql``} ${f.get('status')?sql`and status=${f.get('status')}`:sql``} ${f.get('category')?sql`and category=${f.get('category')}`:sql``} ${f.get('pending')==='true'?sql`and reviewed_at is null and status='blocked'`:sql``}`;
 const events=await sql`select id,academic_year,class_name,student_number,created_at,question,answer,status,category,stage,reason,reviewed_at from xiaoke_private.moderation_events where ${where} order by created_at desc,id desc limit 100`;
 const counts=await sql`select status,category,count(*)::integer as count from xiaoke_private.moderation_events where ${where} group by status,category`;
 return {events:events.map((e:any)=>({...e,created_at:Number(e.created_at),reviewed_at:e.reviewed_at===null?null:Number(e.reviewed_at)})),counts,paused:await this.paused(),retentionDays:30,limit:100,updatedAt:Date.now()};}
 async review(id:string){await this.sql`update xiaoke_private.moderation_events set reviewed_at=${Date.now()} where id=${id} and app_id=${APP_ID}`;}
 async setPaused(value:boolean){await this.sql`insert into xiaoke_private.site_settings(key,value) values ('ai_paused',${String(value)}) on conflict(key) do update set value=excluded.value`;}
}
