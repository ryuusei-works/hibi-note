import {captureFifaHistory} from '../lib/enhancements.mjs';
import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectData, jstDate } from '../lib/data.mjs';

export function comparisonSnapshot(previous,current){
  if(!previous||previous.year!==current.year||!Number.isFinite(Date.parse(previous.generatedAt))||Date.parse(previous.generatedAt)>=Date.parse(current.generatedAt))return null;
  return {year:previous.year,generatedAt:previous.generatedAt,standings:previous.standings,leaders:previous.leaders};
}
export async function readPrevious(output){
  try{return JSON.parse(await readFile(resolve(output,'data/sports.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}
}
export async function readPublishedPrevious(){
 try{
  // GitHub Pages URLs change on repository rename. A committed public-statistics
  // seed preserves month/season archives during the first publication at the new URL.
  for(const repository of ['hibi-note','japan-sports-desk']){
   const response=await fetch(`https://ryuusei-works.github.io/${repository}/data/sports.json?t=${Date.now()}`,{signal:AbortSignal.timeout(12000),redirect:'error',cache:'no-store'});
   if(response.status===404)continue;
   if(!response.ok)throw Error('Previous deployment unavailable');
   const body=await response.text();if(body.length>50000000)throw Error('Previous deployment too large');return JSON.parse(body);
  }
  const draftHistory=JSON.parse(await readFile(new URL('../data/draft-history.json',import.meta.url),'utf8'));
  if(draftHistory.version!==1||!Object.keys(draftHistory.seasons).length)throw Error('Migration archive missing');
  return {draftHistory};
 }catch{throw Error('Published history unavailable; keeping previous deployment.');}
}
export function captureDraftHistory(previous,current){
 const prior=previous?.draftHistory;if(prior&&prior.version!==1)throw Error('Unsupported draft history version; preserving previous deployment.');const history=prior?.version===1?JSON.parse(JSON.stringify(prior)):{version:1,seasons:{}};
 if(!current.draft?.clubs||Object.keys(current.draft.clubs).length!==12||Object.values(current.draft.clubs).some(club=>!club.bat?.ok||!club.pit?.ok)||['avg','era'].some(id=>['c','p'].some(league=>!current.leaders?.[id]?.[league]?.ok)))return history;
 if(!Number.isFinite(Date.parse(current.generatedAt)))return history;
 const month=jstDate(new Date(current.generatedAt)).slice(0,7);if(Number(month.slice(0,4))!==current.year)return history;
 const normalize=name=>name.replace(/\s/g,'');const qualified=id=>new Set(['c','p'].flatMap(league=>current.leaders[id][league].data.map(p=>p.team+'|'+normalize(p.name))));const avg=qualified('avg'),era=qualified('era'),players=new Map();
 for(const [team,club] of Object.entries(current.draft.clubs))for(const type of ['bat','pit'])for(const player of club[type].data){const key=team+'|'+player.name;const row=players.get(key)||[team,player.name,null,null,null,null,null,null,null,avg.has(team+'|'+normalize(player.name)),era.has(team+'|'+normalize(player.name))];for(const [i,id] of ['avg','hr','h','rbi','w','era','sv'].entries())if(Object.hasOwn(player.values,id))row[i+2]=player.values[id];players.set(key,row);}
 const season=history.seasons[String(current.year)]??={latestMonth:month,months:{}};const old=season.months[month];
 if(!old||Date.parse(old.generatedAt)<Date.parse(current.generatedAt)){season.months[month]={generatedAt:current.generatedAt,seasonComplete:!!current.draft.seasonComplete,rows:[...players.values()]};if(month>=season.latestMonth)season.latestMonth=month;}
 return history;
}
export async function buildPages({collect=collectData,output=resolve('dist'),loadPrevious=readPrevious,runtime=process.env.VERCEL==='1'}={}){
  const previous=await loadPrevious(output);
  const data=await collect();
  const sources=[data.standings,data.baseballGames,data.footballGames,data.fifa,...[data.baseballResults,data.footballHistory,data.footballSquad,data.baseballStarters,data.overseas].filter(Boolean),...Object.values(data.leaders).flatMap(v=>[v.c,v.p])];
  sources.push(...Object.values(data.draft?.clubs||{}).flatMap(club=>[club.bat,club.pit]));
  sources.push(...Object.values(data.daily?.newsCategories||{}),...[data.daily?.nationalNews,data.footballRivals].filter(Boolean),...Object.values(data.daily?.locations||{}).flatMap(location=>[location.news]),...(data.footballRivals?.ok?data.footballRivals.data.countries.map(country=>country.games):[]));
  const successful=sources.filter(s=>s.ok).length;
  // Do not replace the existing deployment if every official source is unavailable.
  if(successful===0)throw new Error('All public sources unavailable; keeping the previous deployment.');
  if(successful!==sources.length)console.warn(`Public sources: ${successful}/${sources.length}. Missing sections will display an error.`);
  data.previous=comparisonSnapshot(previous,data);
  data.draftHistory=captureDraftHistory(previous,data);
  data.fifaHistory=captureFifaHistory(previous,data);
  await mkdir(resolve(output,'data'),{recursive:true});
  for(const file of ['index.html','app.js','style.css','.nojekyll'])await copyFile(resolve('public',file),resolve(output,file));
  if(runtime){const file=resolve(output,'index.html');await writeFile(file,(await readFile(file,'utf8')).replace('<html lang="ja"','<html data-data-api="./api/data" lang="ja"'));}
  await writeFile(resolve(output,'data/sports.json'),JSON.stringify(data));
  console.log(`Static site built. Public sources: ${successful}/${sources.length}. Fetched: ${data.generatedAt}`);
  return data;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  await buildPages({loadPrevious:process.env.GITHUB_ACTIONS==='true'||process.env.VERCEL==='1'?readPublishedPrevious:readPrevious});
}
