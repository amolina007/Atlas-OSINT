import { headlines } from '../lib/headlines.mjs';
import { sourceImage,publicText } from '../lib/news-images.mjs';
export default async function(req){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const id=new URL(req.url).searchParams.get('id');if(!/^[a-f0-9]{64}$/.test(id||''))return new Response('Invalid article',{status:400});
 try{const data=await headlines();const article=data.articles.find(a=>a.id===id);if(!article)return new Response('Not found',{status:404});const image=await sourceImage(article);if(!image)return new Response('No image',{status:404});const file=await publicText(image.url,0,true);return new Response(file.bytes,{headers:{'Content-Type':file.type,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});}catch{return new Response('Image unavailable',{status:404,headers:{'Cache-Control':'public, max-age=120'}});}
}
