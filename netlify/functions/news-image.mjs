import { headlines } from '../lib/headlines.mjs';
import { sourceImage } from '../lib/news-images.mjs';
export default async function(req){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const id=new URL(req.url).searchParams.get('id');if(!/^[a-f0-9]{64}$/.test(id||''))return new Response('Invalid article',{status:400});
 const data=await headlines();const article=data.articles.find(a=>a.id===id);if(!article)return new Response('Not found',{status:404});
 const image=await sourceImage(article);return Response.json({image},{headers:{'Cache-Control':'public, max-age=600','X-Content-Type-Options':'nosniff'}});
}
