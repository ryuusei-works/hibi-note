import { load } from 'cheerio';
import {collectDaily,collectRivals} from './daily.mjs';
import {collectEnhancements} from './enhancements.mjs';
import {AsyncLocalStorage} from 'node:async_hooks';

export const categories = [
  {id:'avg',label:'打率',path:'lb_avg',unit:'',low:false,note:'規定打席以上'},
  {id:'hr',label:'本塁打',path:'lb_hr',unit:'本'},
  {id:'rbi',label:'打点',path:'lb_rbi',unit:'点'},
  {id:'h',label:'安打',path:'lb_h',unit:'安打'},
  {id:'sb',label:'盗塁',path:'lb_sb',unit:'個'},
  {id:'obp',label:'出塁率',path:'lb_obp',unit:'',note:'規定打席以上'},
  {id:'era',label:'防御率',path:'lp_era',unit:'',low:true,note:'規定投球回以上'},
  {id:'w',label:'勝利',path:'lp_w',unit:'勝'},
  {id:'pct',label:'勝率',path:'lp_pct',unit:'',note:'NPB公式の勝率ランキング対象者'},
  {id:'so',label:'奪三振',path:'lp_so',unit:'個'},
  {id:'sv',label:'セーブ',path:'lp_sv',unit:'S'},
  {id:'hldp',label:'ホールドポイント',path:'lp_hldp',unit:'HP'},
];
const clean = s => s.replace(/\s+/g,' ').trim();
export const jstDate = (date=new Date()) => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(date);
const allowed = new Set(['npb.jp','www.jfa.jp','inside.fifa.com','news.yahoo.co.jp','web.gekisaka.jp','site.api.espn.com','op.jfa.jp']);
const cache = new Map();
const collectionContext=new AsyncLocalStorage();
// Each manual collection has its own cache and one deadline. Never reuse hour-old
// responses while labelling a manual collection as newly fetched.
export function collectFresh(){return collectionContext.run({cache:new Map(),signal:AbortSignal.timeout(180000)},collectData);}
export async function getText(url){
  const parsed=new URL(url);if(parsed.protocol!=='https:'||!allowed.has(parsed.hostname)||parsed.username||parsed.password) throw new Error('Unsupported source');
  const context=collectionContext.getStore(),activeCache=context?.cache||cache;
  context?.signal.throwIfAborted();
  const prior=activeCache.get(url);
  if(prior && Date.now()-prior.time<3600000) return prior.text;
  const signal=context?AbortSignal.any([context.signal,AbortSignal.timeout(12000)]):AbortSignal.timeout(12000);
  const r=await fetch(url,{signal,headers:{'User-Agent':'HibiNote/1.0 (public information; cached collection)'},redirect:'error',cache:'no-store'});
  if(!r.ok){const error=new Error(`Source returned ${r.status}`);error.status=r.status;throw error;}
  const text=await r.text();
  if(text.length>6000000)throw new Error('Response too large');
  activeCache.set(url,{time:Date.now(),text});return text;
}
export function parseStandings(html){
 const $=load(html); const result={};
 for(const [i,league] of ['c','p'].entries()){
  const table=$('table').filter((i,e)=>/勝率/.test($(e).text())&&/差/.test($(e).text())).eq(i);
  const rows=table.find('tr').map((i,e)=>{
   const c=$(e).children('th,td');if(c.length<7||!$(e).find('td').length)return null;
   const team=clean(c.eq(0).find('img').attr('alt')||c.eq(0).find('.hide_sp').text()||c.eq(0).text());
   return {team,games:clean(c.eq(1).text()),wins:clean(c.eq(2).text()),losses:clean(c.eq(3).text()),draws:clean(c.eq(4).text()),pct:clean(c.eq(5).text()),gap:clean(c.eq(6).text())};
  }).get();
  if(rows.length!==6)throw new Error('Standings structure changed');result[league]=rows;
 }return result;
}
export function parseLeaders(html,league){
 const $=load(html);
 const rows=$('tr.ststats').map((i,e)=>{const c=$(e).find('td');const full=clean(c.eq(1).text());const value=clean(c.eq(2).text());return {name:full.replace(/\([^)]*\)/g,'').trim(),team:full.match(/\(([^)]+)\)/)?.[1]||'',league,value};}).get().filter(r=>r.name&&Number.isFinite(Number(r.value))&&r.value!=='');
 if(!rows.length)throw new Error('Leader structure changed');return rows;
}
// Club tables include zero totals and players below the qualifying threshold.
export function parseDraftPlayers(html,team,type){
 const $=load(html),labels=type==='bat'?{avg:'打率',hr:'本塁打',h:'安打',rbi:'打点'}:{w:'勝利',era:'防御率',sv:'セーブ'};
 const header=$('tr').filter((i,e)=>$(e).children('th,td').first().text().trim()==='選手'&&$(e).children('th,td').length>15).first();
 const headings=header.children('th,td').map((i,e)=>clean($(e).text())).get();
 if(!headings.length||Object.values(labels).some(label=>!headings.includes(label)))throw Error('Club statistics structure changed');
 const rows=header.closest('table').find('tr').map((i,e)=>{const cells=$(e).children('td');if(cells.length!==headings.length)return null;const cell=cells.eq(0).clone();cell.find('sup').remove();const name=clean(cell.text());if(!name||/合計|チーム/.test(name))return null;
 const values=Object.fromEntries(Object.entries(labels).map(([id,label])=>{const raw=clean(cells.eq(headings.indexOf(label)).text());return [id,raw!==''&&Number.isFinite(Number(raw))?raw:null];}));return {name,team,values};}).get();
 if(!rows.length)throw Error('No club players found');return rows;
}
export function rankPlayers(rows,low=false){
 const sorted=[...rows].sort((a,b)=>low?Number(a.value)-Number(b.value):Number(b.value)-Number(a.value));
 let rank=0,previous;
 return sorted.map((p,i)=>{if(Number(p.value)!==previous)rank=i+1;previous=Number(p.value);return {...p,rank};}).filter(p=>p.rank<=10);
}
export function parseBaseballGames(html,year,month){
 const $=load(html);let day;const games=[];
 $('table tr').each((i,e)=>{const r=$(e);const m=r.find('th').text().match(/(\d+)\/(\d+)/);if(m)day=`${year}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  if(!day||!r.find('.team1').length)return;
  const time=clean(r.find('.time').text()),a=clean(r.find('.score1').text()),b=clean(r.find('.score2').text()),state=clean(r.find('.state').text());
  const scored=/^\d+$/.test(a)&&/^\d+$/.test(b);
  const href=r.find('a[href*="/scores/"]').first().attr('href');const url=new URL(href||`/games/${year}/schedule_${String(month).padStart(2,'0')}_detail.html`,'https://npb.jp');
  games.push({date:day,time,home:clean(r.find('.team1').text()),away:clean(r.find('.team2').text()),venue:clean(r.find('.place').text()),homeScore:scored?Number(a):null,awayScore:scored?Number(b):null,status:/中止|延期/.test(state)?'cancelled':/回|表|裏|試合中/.test(state)?'inprogress':scored?'finished':'scheduled',url:url.origin==='https://npb.jp'?url.href:'https://npb.jp/games/'});
 });return games;
}
export function parseFootballGames(html,year){
 const $=load(html);return $('table tr').map((i,e)=>{const r=$(e);const ds=clean(r.find('.date').text());const m=ds.match(/(?:(\d{4})\/)?(\d{1,2})\/(\d{1,2})/);if(!m)return null;
  const score=clean(r.find('.score').text()).replace(/\s*PK\s*/i,' PK'),numbers=score.match(/(\d+)\s*[-－–−]\s*(\d+)/);
  const href=r.find('.score a').attr('href')||r.find('.comp_name a').attr('href')||'/samuraiblue/';const url=new URL(href,'https://www.jfa.jp');
  return {date:`${m[1]||year}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`,opponent:clean(r.find('.team').text()),competition:clean(r.find('.comp_name').text()),venue:clean(r.find('.place').text()),time:'',status:/中止|延期/.test(score)?'cancelled':numbers?'finished':'scheduled',score,japanScore:numbers?Number(numbers[1]):null,opponentScore:numbers?Number(numbers[2]):null,result:/[○〇]/.test(score)?'win':/[●×]/.test(score)?'loss':/[△▲]/.test(score)?'draw':null,url:url.origin==='https://www.jfa.jp'?url.href:'https://www.jfa.jp/samuraiblue/'};
 }).get();
}
export function parseNews(html,sport){
 const $=load(html);const base=sport==='baseball'?'https://npb.jp':'https://www.jfa.jp';
 const rows=[];
 const selector=sport==='baseball'?'.news_block': 'a:has(.text-news)';
 $(selector).each((i,e)=>{const r=$(e),a=sport==='baseball'?r.find('dd a').first():r;
  const title=clean(sport==='baseball'?a.text():r.find('.text-news').text());
  const raw=clean(r.find(sport==='baseball'?'time':'.date').text());
  const m=raw.match(/(\d{4})[年/.-](\d{1,2})[月/.-](\d{1,2})/);
  if(!title||!m)return;
  const url=new URL(a.attr('href')||'',base);if(url.origin!==base||url.protocol!=='https:')return;
  rows.push({title,url:url.href,date:`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`});
 });
 if(!rows.length)throw new Error('News structure changed');
 return [...new Map(rows.map(r=>[r.url,r])).values()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
}
async function safely(work,source){try{return {ok:true,data:await work(),fetchedAt:new Date().toISOString(),source};}catch{return {ok:false,error:'公式データを取得できませんでした。時間をおいて再取得してください。',source};}}
export async function collectData(){
 const today=jstDate();const year=Number(today.slice(0,4));const month=Number(today.slice(5,7));const stats=`https://npb.jp/bis/${year}/stats/`;
 const tasks=[
  safely(async()=>parseStandings(await getText(stats)),stats),
  safely(async()=>{const months=Array.from({length:4},(_,i)=>new Date(Date.UTC(year,month-2+i,1)));const all=(await Promise.all(months.map(async d=>{const y=d.getUTCFullYear(),m=d.getUTCMonth()+1;try{return parseBaseballGames(await getText(`https://npb.jp/games/${y}/schedule_${String(m).padStart(2,'0')}_detail.html`),y,m);}catch(e){if(e.status===404)return [];throw e;}}))).flat();return all;},`https://npb.jp/games/${year}/`),
  safely(async()=>{const url=`https://www.jfa.jp/samuraiblue/schedule_result/${year}.html`;const games=parseFootballGames(await getText(url),year);if(!games.length)throw new Error('No games parsed');return games;},`https://www.jfa.jp/samuraiblue/schedule_result/${year}.html`),
  safely(async()=>{const $=load(await getText('https://inside.fifa.com/fifa-rankings/world-ranking/men'));const data=JSON.parse($('#__NEXT_DATA__').text()).props.pageProps.pageData;const date=data.ranking.dates[0].dates[0];const query=new URLSearchParams({mode:'schedule',gender:'1',locale:'en',scheduleId:date.id,rankingType:'football'});const result=JSON.parse(await getText(`https://inside.fifa.com/api/live-world-ranking/get-rankings?${query}`));if(!result.rankings?.some(r=>r.countryCode==='JPN'))throw new Error('Japan missing');return {date:date.iso,rows:result.rankings.map(r=>({rank:r.rank,name:r.teamName,code:r.countryCode,points:r.totalPoints,previousRank:r.previousRank}))};},'https://inside.fifa.com/fifa-rankings/world-ranking/men')
 ];
 const [standings,baseballGames,footballGames,fifa]=await Promise.all(tasks);
 const [baseballResults,footballHistory]=await Promise.all([
  safely(async()=>{
   let games=[];
   for(let i=0;i<10;i++){
    const d=new Date(Date.UTC(year,month-1-i,1)),y=d.getUTCFullYear(),m=d.getUTCMonth()+1;
    try{games.push(...parseBaseballGames(await getText(`https://npb.jp/games/${y}/schedule_${String(m).padStart(2,'0')}_detail.html`),y,m).filter(g=>g.status==='finished'&&g.date<=today));}catch(e){if(e.status!==404)throw e;}
   }
   const latest=games.sort((a,b)=>b.date.localeCompare(a.date));const selected=latest.filter(g=>g.date.startsWith(String(year)));
   return [...new Map(selected.map(g=>[g.date+'|'+g.home+'|'+g.away+'|'+g.time,g])).values()];
  },`https://npb.jp/games/${year}/`),
  safely(async()=>{
   if(!footballGames.ok)throw new Error('Current football schedule unavailable');
   const past=(await Promise.all([year-1,year-2].map(async y=>{try{return parseFootballGames(await getText(`https://www.jfa.jp/samuraiblue/schedule_result/${y}.html`),y);}catch(e){if(e.status===404)return [];throw e;}}))).flat();
   const all=[...footballGames.data,...past].filter(g=>g.status==='finished'&&g.date<=today);
   return [...new Map(all.map(g=>[g.date+'|'+g.opponent,g])).values()].sort((a,b)=>b.date.localeCompare(a.date));
  },`https://www.jfa.jp/samuraiblue/schedule_result/${year}.html`)
 ]);
 const leaders={};for(let i=0;i<categories.length;i+=3)await Promise.all(categories.slice(i,i+3).map(async cat=>{
  const pair=await Promise.all(['c','p'].map(league=>safely(async()=>parseLeaders(await getText(`${stats}${cat.path}_${league}.html`),league),`${stats}${cat.path}_${league}.html`)));
  leaders[cat.id]={c:pair[0],p:pair[1]};
 }));
 const draftClubs={},clubCodes={t:'神',g:'巨',db:'デ',c:'広',s:'ヤ',d:'中',h:'ソ',l:'西',f:'日',b:'オ',m:'ロ',e:'楽'};
 const draftTasks=Object.entries(clubCodes).flatMap(([code,team])=>['bat','pit'].map(type=>({code,team,type})));
 for(let i=0;i<draftTasks.length;i+=4)await Promise.all(draftTasks.slice(i,i+4).map(async({code,team,type})=>{const url=`${stats}id${type==='bat'?'b':'p'}1_${code}.html`;const source=await safely(async()=>parseDraftPlayers(await getText(url),team,type),url);(draftClubs[team]??={})[type]=source;}));
 let seasonComplete=false;try{seasonComplete=load(await getText(stats))('body').text().includes('全日程終了');}catch{}
 const draft={clubs:draftClubs,seasonComplete};
 const [daily,footballRivals,enhancements]=await Promise.all([collectDaily(getText),collectRivals(getText,fifa),collectEnhancements(getText,{today,year,footballGames})]);
 return {year,today,generatedAt:new Date().toISOString(),standings,baseballGames,footballGames,fifa,categories,leaders,baseballResults,footballHistory,draft,daily,footballRivals,...enhancements};
}
export function fifaDelta(points,opponent,importance,result){return importance*(result-1/(1+10**((opponent-points)/600)));}
