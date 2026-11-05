import {parse} from './headlines.mjs';
import {publicText,sourceArticle} from './news-images.mjs';
import {extractArticle} from './news-summary.mjs';
export function coverageCandidates(original,rows){
 const date=Date.parse(original.publishedAt),seen=new Set([original.sourceUrl]);
 return rows.filter(a=>a.id!==original.id&&a.source!==original.source&&a.sourceUrl&&Math.abs(Date.parse(a.publishedAt)-date)<7*86400000).filter(a=>{if(seen.has(a.sourceUrl))return false;seen.add(a.sourceUrl);return true;}).slice(0,4);
}
export async function findCoverage(article,{read=publicText,resolve=sourceArticle}={}){
 // Search is fixed to the public RSS service, never a URL supplied by the client.
 const q=article.title.replace(/[^\p{L}\p{N}\s]/gu,' ').trim().slice(0,220);
 const keywords=q.split(/\s+/).filter(w=>w.length>3&&!/^(para|como|desde|sobre|entre|tendrá|serán|esta|este|estos|estas|tras|ante|contra)$/i.test(w)).slice(0,4).join(' ');
 try{const groups=await Promise.all([...new Set([q,keywords])].filter(Boolean).map(async query=>{try{const url='https://news.google.com/rss/search?'+new URLSearchParams({q:query,hl:'es-419',gl:'CL',ceid:'CL:es-419'});const rss=await read(url);return parse(rss.text,'coverage');}catch{return [];}}));const candidates=coverageCandidates(article,groups.flat());
 return (await Promise.all(candidates.map(async a=>{try{const page=await resolve(a);if(!page)return null;const paragraphs=extractArticle(page.text,a.title);return paragraphs?.length?{article:a,url:page.url,paragraphs}:null;}catch{return null;}}))).filter(Boolean);
 }catch{return [];}
}
export function combineCoverage(documents){
 const sources=[],paragraphs=[];
 for(const doc of documents){const source=sources.length+1;sources.push({id:source,name:doc.article.source,url:doc.url,publishedAt:doc.article.publishedAt,title:doc.article.title});for(const p of doc.paragraphs)paragraphs.push({id:paragraphs.length+1,text:p.text,source});}
 return {sources,paragraphs};
}
