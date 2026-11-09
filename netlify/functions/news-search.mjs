import {searchNews,searchQuery} from '../lib/news-search.mjs';
export default async function(req){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 let q;try{q=searchQuery(new URL(req.url).searchParams.get('q'));}catch{return new Response('Query must contain 2 to 160 characters',{status:400});}
 try{return Response.json(await searchNews(q),{headers:{'Cache-Control':'public, max-age=120','X-Content-Type-Options':'nosniff'}});}catch{return Response.json({error:'search_unavailable'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
export const config={rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
