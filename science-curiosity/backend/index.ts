import postgres from 'npm:postgres@3.4.3';
import { makeHandler } from './handler.ts';
import { PostgresMonitorStore } from './postgres-store.ts';
const sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{prepare:false,max:1,idle_timeout:10,connect_timeout:15});
const store=new PostgresMonitorStore(sql);
async function runtime(){
 const secrets=await sql`select name,decrypted_secret from vault.decrypted_secrets where name in ('xiaoke_gemini_key_v1','xiaoke_teacher_hash_v1','xiaoke_session_secret_v1')`;
 const values=Object.fromEntries(secrets.map(s=>[s.name,s.decrypted_secret]));
 return {store,env:{GEMINI_API_KEY:values.xiaoke_gemini_key_v1,GEMINI_MODEL:'gemini-3.5-flash-lite',TEACHER_PASSWORD_HASH:values.xiaoke_teacher_hash_v1,TEACHER_SESSION_SECRET:values.xiaoke_session_secret_v1}};
}
Deno.serve(makeHandler(runtime));
