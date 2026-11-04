import { headlines } from '../lib/headlines.mjs';
export default async function(req) { if(req.method!=='GET')return new Response('Method not allowed',{status:405}); const data=await headlines(); const ok=data.sources.some(s=>s.status==='ok');return Response.json(data,{status:ok?200:502,headers:{'Cache-Control':ok?'public, max-age=120, stale-while-revalidate=300':'no-store'}}); }
