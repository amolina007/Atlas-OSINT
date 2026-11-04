import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import headlinesHandler from '../netlify/functions/headlines.mjs';
import { handler } from '../netlify/functions/observatory.mjs';
const root=resolve('dist');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.geojson':'application/json'};
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/.netlify/functions/headlines'){const r=await headlinesHandler(new Request(u));res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());return;}if(u.pathname==='/.netlify/functions/observatory'){const result=await handler();res.writeHead(result.statusCode,result.headers);res.end(result.body);return;}const path=resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/observatorio.html':u.pathname));if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('No encontrado');}}).listen(Number(process.env.ATLAS_PORT || 3998),'127.0.0.1',()=>console.log('Observatorio: http://127.0.0.1:'+(process.env.ATLAS_PORT || 3998)+'/observatorio.html'));
