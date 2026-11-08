import {territorySources} from '../../dist/observatorio-territory-sources.mjs';
export function createTerritoryMapHandler(fetcher=fetch){return async req=>{
 if(globalThis.Netlify?.env.get('CONTEXT')==='production')return new Response('Dev only',{status:404});
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const key=new URL(req.url).searchParams.get('map');if(!['gaza','sudan'].includes(key))return new Response('Unknown map',{status:404});
 try{const r=await fetcher(territorySources[key].image,{signal:AbortSignal.timeout(15000),redirect:'error'});const type=(r.headers.get('content-type')||'').split(';')[0];if(!r.ok||!['image/png','image/svg+xml'].includes(type))throw Error();const bytes=await r.arrayBuffer();if(bytes.byteLength>4000000)throw Error();return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=86400','Content-Security-Policy':"default-src 'none'; sandbox",'X-Content-Type-Options':'nosniff'}});}catch{return new Response('Source image unavailable',{status:502,headers:{'Cache-Control':'no-store'}});}
};}
export default createTerritoryMapHandler();
export const config={rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
