import {getStore} from '@netlify/blobs';
import {randomUUID} from 'node:crypto';
export const usageStore=()=>getStore({name:'atlas-dev-ai-usage',consistency:'strong'});
export const usageDay=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function tokenCost(model,usage){if(!/^gpt-4\.1-mini(?:-|$)/.test(model||''))return null;const input=usage?.prompt_tokens,output=usage?.completion_tokens,cached=usage?.prompt_tokens_details?.cached_tokens||0;if(!Number.isFinite(input)||!Number.isFinite(output))return null;return (Math.max(0,input-cached)*0.4+cached*0.1+output*1.6)/1000000;}
export async function logUsage(event){try{await usageStore().setJSON(usageDay()+'/'+randomUUID(),{at:new Date().toISOString(),...event});}catch{console.warn('Atlas usage telemetry write failed');}}
