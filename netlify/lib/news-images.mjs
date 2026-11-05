import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { clean } from './headlines.mjs';
export function publicIP(ip){if(isIP(ip)!==4)return false;const [a,b]=ip.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19));}
export function safeImage(raw,base){if(typeof raw!=='string'||!raw.trim())return null;try{const u=new URL(raw,base);if(u.protocol!=='https:'||u.username||u.password||u.port||isIP(u.hostname)||!u.hostname.includes('.')||/\.(local|internal|localhost)$/i.test(u.hostname))return null;return u.href;}catch{return null;}}
export async function publicText(raw,redirects=0,binary=false){
 const u=new URL(raw);if(!safeImage(u.href)||redirects>3)throw Error('URL rejected');
 const ips=await lookup(u.hostname,{family:4,all:true});if(!ips.length||ips.some(x=>!publicIP(x.address)))throw Error('Private address');
 return new Promise((resolve,reject)=>{const req=https.get(u,{headers:{'User-Agent':'AtlasNewsPreview/1.0','Accept':'text/html, application/rss+xml, application/xml'},lookup:(_h,opts,cb)=>opts.all?cb(null,[{address:ips[0].address,family:4}]):cb(null,ips[0].address,4)},res=>{
 if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){res.resume();publicText(new URL(res.headers.location,u).href,redirects+1,binary).then(resolve,reject);return;}
 if(binary&&!/^image\/(jpeg|png|webp|avif|gif)(?:;|$)/i.test(res.headers['content-type']||'')){res.resume();reject(Error('Not an image'));return;}
 if(res.statusCode!==200){res.resume();reject(Error('Unavailable'));return;}
 let size=0,chunks=[];res.on('data',c=>{size+=c.length;if(size>2500000){res.destroy();reject(Error('Too large'));}else chunks.push(c)});res.on('end',()=>resolve(binary?{bytes:Buffer.concat(chunks),type:res.headers['content-type']}:{text:Buffer.concat(chunks).toString('utf8'),url:u.href}));res.on('error',reject);
 });req.setTimeout(4500,()=>req.destroy(Error('Timeout')));req.on('error',reject);});
}
const decode=s=>String(s||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Math.min(Number(n),0x10ffff)));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(m=>[m[1].toLowerCase(),decode(m[3])]));
export const titleKey=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function imageMeta(html,base){const tags=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0]));for(const key of ['og:image:secure_url','og:image','twitter:image','twitter:image:src']){const tag=tags.find(a=>(a.property||a.name)?.toLowerCase()===key);const image=safeImage(tag?.content||'',base);if(tag?.content&&image&&!/(?:logo|placeholder|default[-_]?image|no[-_]?image)/i.test(new URL(image).pathname))return {url:image,alt:tags.find(a=>(a.property||a.name)==='og:image:alt')?.content||''};}return null;}
export function articleLink(html,title,base){const wanted=titleKey(title);if(wanted.length<20)return null;for(const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){const a=attrs(m[1]);if([clean(m[2]),a.title,a['aria-label']].some(t=>titleKey(t)===wanted)){const url=safeImage(a.href,base);if(url&&new URL(url).hostname.replace(/^www\./,'')===new URL(base).hostname.replace(/^www\./,''))return url;}}return null;}
export function rssMatch(xml,title,base){for(const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){const item=m[1];if(titleKey(item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1])!==titleKey(title))continue;const link=clean(item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]);const articleUrl=safeImage(link,base);let image=null;for(const tag of item.matchAll(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*>/gi)){const a=attrs(tag[0]);if(a.url&&(!a.type||a.type.startsWith('image/'))){image=safeImage(a.url,base);if(image)break;}}return {articleUrl,image};}return null;}
const homeCache=new Map(),resultCache=new Map();
async function cachedPage(url){const old=homeCache.get(url);if(old&&Date.now()-old.time<300000)return old.promise;if(homeCache.size>250)homeCache.clear();const promise=publicText(url).catch(()=>null);homeCache.set(url,{time:Date.now(),promise});return promise;}
export async function sourceImage(article){
 const old=resultCache.get(article.id);if(old&&Date.now()-old.time<600000)return old.value;
 let result=null;
 try{
 if(!article.sourceUrl)return null;
 const home=await cachedPage(article.sourceUrl);if(!home)return null;
 let link=articleLink(home.text,article.title,home.url),rssImage;
 if(!link){const feeds=[...home.text.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0])).filter(a=>/rss\+xml/.test(a.type||''));const feedUrl=feeds.map(a=>safeImage(a.href,home.url)).find(u=>u&&new URL(u).hostname===new URL(home.url).hostname);if(feedUrl){const feed=await cachedPage(feedUrl);const match=feed&&rssMatch(feed.text,article.title,feed.url);if(match){link=match.articleUrl;rssImage=match.image;}}}
 if(link&&new URL(link).hostname.replace(/^www\./,'')===new URL(home.url).hostname.replace(/^www\./,'')){
 const page=await cachedPage(link);const image=page&&imageMeta(page.text,page.url);
 if(image||rssImage)result={url:image?.url||rssImage,alt:image?.alt||'',articleUrl:link,source:article.source,method:image?'Metadatos de la publicación':'RSS del medio'};
 }
 }catch{}
 if(resultCache.size>600)resultCache.clear();resultCache.set(article.id,{time:Date.now(),value:result});return result;
}

// Resolve a publisher article even when it has no photograph.
export async function sourceArticle(article){
 if(!article.sourceUrl)return null;
 const home=await cachedPage(article.sourceUrl);if(!home)return null;
 let link=articleLink(home.text,article.title,home.url);
 if(!link){const feeds=[...home.text.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0])).filter(a=>/rss\+xml/.test(a.type||''));const feedUrl=feeds.map(a=>safeImage(a.href,home.url)).find(u=>u&&new URL(u).hostname===new URL(home.url).hostname);if(feedUrl){const feed=await cachedPage(feedUrl);link=feed&&rssMatch(feed.text,article.title,feed.url)?.articleUrl;}}
 // Follow an advertised public GET search form when the article has left the homepage.
 if(!link){
  for(const match of home.text.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)){
   const form=attrs(match[1]);if((form.method||'get').toLowerCase()!=='get')continue;
   const fields=[...match[2].matchAll(/<input\b[^>]*>/gi)].map(x=>attrs(x[0]));
   const field=fields.find(x=>x.type==='search'||x.name==='s');if(!field?.name)continue;
   const action=safeImage(form.action||home.url,home.url);if(!action||new URL(action).hostname!==new URL(home.url).hostname)continue;
   const search=new URL(action);search.searchParams.set(field.name,article.title);
   const results=await cachedPage(search.href);if(results)link=articleLink(results.text,article.title,results.url);
   break;
  }
 }
 if(!link||new URL(link).hostname.replace(/^www\./,'')!==new URL(home.url).hostname.replace(/^www\./,''))return null;
 const page=await cachedPage(link);
 if(!page||new URL(page.url).hostname.replace(/^www\./,'')!==new URL(home.url).hostname.replace(/^www\./,''))return null;
 return page;
}
