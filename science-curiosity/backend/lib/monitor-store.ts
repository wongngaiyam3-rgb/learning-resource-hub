import { redactPII, type Category } from './moderation.ts';
import type { Identity } from './science-api.ts';
export type EventInput={identity:Identity;question:string;answer?:string;status:'allowed'|'blocked'|'error'|'off_topic';category:Category;stage:string;reason:string};
export interface MonitorStore { record(event:EventInput):Promise<string>; paused():Promise<boolean>; quota(key:string,limit:number,ttl:number):Promise<boolean>; list(filters:URLSearchParams):Promise<unknown>; review(id:string):Promise<void>; setPaused(value:boolean):Promise<void>; }
