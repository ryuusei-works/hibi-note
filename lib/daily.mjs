import {load} from 'cheerio';

const prefectures='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split(' ');
export const regions=prefectures.map((name,i)=>{const id=String(i+1).padStart(2,'0');return {id,name,newsCode:id+'0'};});

export const regionalNewsFeeds=[{"id":"01","media":"hbcv","publisher":"HBCニュース北海道"},{"id":"02","media":"aba","publisher":"ABA青森朝日放送"},{"id":"03","media":"ibciwatev","publisher":"IBC岩手放送"},{"id":"04","media":"tbcv","publisher":"tbc東北放送"},{"id":"05","media":"absakita","publisher":"ABS秋田放送"},{"id":"06","media":"ybc","publisher":"YBC山形放送"},{"id":"07","media":"tuf","publisher":"TUFテレビユー福島"},{"id":"08","media":"ibaraki","publisher":"茨城新聞クロスアイ"},{"id":"09","media":"soon","publisher":"下野新聞デジタル"},{"id":"10","media":"gtv","publisher":"群馬テレビ"},{"id":"11","media":"saitama","publisher":"埼玉新聞"},{"id":"12","media":"chibatopi","publisher":"千葉日報オンライン"},{"id":"13","media":"tokyomxv","publisher":"TOKYO MX"},{"id":"14","media":"tvkv","publisher":"tvkニュース（テレビ神奈川）"},{"id":"15","media":"ohbsn","publisher":"BSN新潟放送"},{"id":"16","media":"knb","publisher":"北日本放送"},{"id":"17","media":"ishikawa","publisher":"石川テレビ"},{"id":"18","media":"fbc","publisher":"FBC福井放送"},{"id":"19","media":"utyv","publisher":"UTYテレビ山梨"},{"id":"20","media":"sbc","publisher":"SBC信越放送"},{"id":"21","media":"gifuweb","publisher":"岐阜新聞デジタル"},{"id":"22","media":"sbsv","publisher":"静岡放送（SBS）"},{"id":"23","media":"cbc","publisher":"CBCテレビ"},{"id":"24","media":"isenp","publisher":"伊勢新聞"},{"id":"25","media":"bbcbiwakov","publisher":"BBCびわ湖放送"},{"id":"26","media":"kbs","publisher":"KBS京都"},{"id":"27","media":"kantele","publisher":"関西テレビ"},{"id":"28","media":"suntvv","publisher":"サンテレビ"},{"id":"29","media":"naranp","publisher":"奈良新聞デジタル"},{"id":"30","media":"newswbs","publisher":"WBS和歌山放送ニュース"},{"id":"31","media":"nihonkai","publisher":"日本海新聞"},{"id":"32","media":"saninchuo","publisher":"山陰中央新報"},{"id":"33","media":"rsk","publisher":"RSK山陽放送"},{"id":"34","media":"rccv","publisher":"RCC中国放送"},{"id":"35","media":"kry","publisher":"KRY山口放送"},{"id":"36","media":"jrt","publisher":"JRT四国放送"},{"id":"37","media":"ksbv","publisher":"KSB瀬戸内海放送"},{"id":"38","media":"itv","publisher":"あいテレビ"},{"id":"39","media":"rkckochi","publisher":"RKC高知放送"},{"id":"40","media":"rkbv","publisher":"RKB毎日放送"},{"id":"41","media":"sagatv","publisher":"佐賀ニュース サガテレビ"},{"id":"42","media":"nbcv","publisher":"NBC長崎放送"},{"id":"43","media":"rkk","publisher":"RKK熊本放送"},{"id":"44","media":"obsnews","publisher":"OBS大分放送"},{"id":"45","media":"mrt","publisher":"MRT宮崎放送"},{"id":"46","media":"mbcnews","publisher":"MBC南日本放送"},{"id":"47","media":"rbc","publisher":"RBC琉球放送"}];
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const day=value=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date(value));
const numeric=value=>value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))?Number(value):null;
const safeLink=(value,host)=>{try{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host&&!u.username&&!u.password&&!u.port?u.href:null;}catch{return null;}};
async function safely(work,source){try{return {ok:true,data:await work(),source,fetchedAt:new Date().toISOString()};}catch{return {ok:false,source,error:'データを取得できませんでした。出典をご確認ください。'};}}
async function mapLimit(items,work){const result=[];for(let i=0;i<items.length;i+=4)result.push(...await Promise.all(items.slice(i,i+4).map(work)));return result;}

export const newsCategoryFeeds=[
 {id:'domestic',label:'国内',publisher:'Yahoo!ニュース',feed:'https://news.yahoo.co.jp/rss/categories/domestic.xml',source:'https://news.yahoo.co.jp/categories/domestic'},
 {id:'world',label:'国際',publisher:'Yahoo!ニュース',feed:'https://news.yahoo.co.jp/rss/categories/world.xml',source:'https://news.yahoo.co.jp/categories/world'},
 {id:'technology',label:'IT・テクノロジー',publisher:'Yahoo!ニュース',feed:'https://news.yahoo.co.jp/rss/categories/it.xml',source:'https://news.yahoo.co.jp/categories/it'},
 {id:'science',label:'科学',publisher:'Yahoo!ニュース',feed:'https://news.yahoo.co.jp/rss/categories/science.xml',source:'https://news.yahoo.co.jp/categories/science'},
 {id:'life',label:'暮らし',publisher:'Yahoo!ニュース',feed:'https://news.yahoo.co.jp/rss/categories/life.xml',source:'https://news.yahoo.co.jp/categories/life'},
 {id:'economy',label:'経済',publisher:'Yahoo!ニュース',feed:'https://news.yahoo.co.jp/rss/categories/business.xml',source:'https://news.yahoo.co.jp/categories/business'},
 {id:'baseball',label:'野球',publisher:'Yahoo!ニュース / Full-Count',feed:'https://news.yahoo.co.jp/rss/media/fullcount/all.xml',source:'https://news.yahoo.co.jp/media/fullcount'},
 {id:'domestic-soccer',label:'国内サッカー',publisher:'ゲキサカ',feed:'https://web.gekisaka.jp/feed?category=domestic',source:'https://web.gekisaka.jp/domestic'},
 {id:'overseas-soccer',label:'海外サッカー',publisher:'ゲキサカ',feed:'https://web.gekisaka.jp/feed?category=foreign',source:'https://web.gekisaka.jp/foreign'},
 {id:'entertainment',label:'エンタメ',publisher:'Yahoo!ニュース',feed:'https://news.yahoo.co.jp/rss/categories/entertainment.xml',source:'https://news.yahoo.co.jp/categories/entertainment'}
];
export function parseHeadlines(xml,host='news.yahoo.co.jp'){
 if(!['news.yahoo.co.jp','web.gekisaka.jp'].includes(host))throw Error('Unsupported news provider');
 const $=load(xml,{xml:true}),rows=$('rss > channel > item').map((_,e)=>{const title=clean($(e).children('title').text()),url=safeLink($(e).children('link').text().trim(),host),publishedAt=new Date($(e).children('pubDate').text());return title&&url&&Number.isFinite(publishedAt.getTime())?{title,url,publishedAt:publishedAt.toISOString(),date:day(publishedAt)}:null;}).get();
 if(!rows.length)throw Error('News feed changed');return [...new Map(rows.map(r=>[r.url,r])).values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,3);
}
export function parseNationalTeams(payload){
 const teams=payload?.sports?.[0]?.leagues?.[0]?.teams;if(!Array.isArray(teams)||teams.length<20)throw Error('National team directory missing');
 return teams.map(({team})=>({id:team.id,code:team.abbreviation,name:team.displayName})).filter(t=>/^\d+$/.test(t.id)&&/^[A-Z]{3}$/.test(t.code));
}
export function parseTeamSchedule(payload,code){
 if(payload?.team?.abbreviation!==code||payload.team.isNational!==true||!Array.isArray(payload.events))throw Error('National team schedule mismatch');
 return payload.events.map(event=>{
  const c=event.competitions?.[0],status=c?.status?.type,home=c?.competitors?.find(p=>p.homeAway==='home'),away=c?.competitors?.find(p=>p.homeAway==='away');
  if(!home||!away||![home.team?.abbreviation,away.team?.abbreviation].includes(code)||!Number.isFinite(Date.parse(event.date))||!['pre','post','in'].includes(status?.state))return null;
  const score=person=>numeric(typeof person.score==='object'?person.score?.value:person.score),finished=status.state==='post'&&status.completed===true;
  const url=(event.links||[]).map(link=>safeLink(link.href,'www.espn.com')).find(Boolean)||'https://www.espn.com/soccer/scoreboard';
  return {id:event.id,date:day(event.date),kickoff:event.date,timeKnown:c.timeValid!==false&&event.timeValid!==false,home:{code:home.team.abbreviation,name:home.team.displayName},away:{code:away.team.abbreviation,name:away.team.displayName},homeScore:finished||status.state==='in'?score(home):null,awayScore:finished||status.state==='in'?score(away):null,homePenalty:/PEN/.test(status.name||'')?numeric(home.score?.shootoutScore??home.shootoutScore):null,awayPenalty:/PEN/.test(status.name||'')?numeric(away.score?.shootoutScore??away.shootoutScore):null,status:/POSTPONED|CANCELED|CANCELLED|ABANDONED/.test(status.name||'')?'cancelled':finished?'finished':status.state==='in'?'inprogress':'scheduled',competition:clean(event.season?.displayName||event.leagues?.[0]?.name||''),detail:clean(status.shortDetail||''),url};
 }).filter(Boolean);
}
export async function collectRivals(getText,fifa){
 const source='https://www.espn.com/soccer/scoreboard';if(!fifa.ok)return {ok:false,source,error:'FIFAランキングを取得できないため上位国を特定できません。'};
 return safely(async()=>{
  const teams=parseNationalTeams(JSON.parse(await getText('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.friendly/teams'))),jp=fifa.data.rows.find(r=>r.code==='JPN');if(!jp)throw Error('Japan missing');
  const countries=await mapLimit(fifa.data.rows.filter(r=>r.rank<jp.rank).sort((a,b)=>a.rank-b.rank),async country=>{
   const team=teams.find(t=>t.code===country.code),teamSource=team?`https://www.espn.com/soccer/team/fixtures/_/id/${team.id}`:source;
   const games=await safely(async()=>{if(!team)throw Error('Team not matched');const base=`https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/${team.id}/schedule`;const results=await Promise.all([base,base+'?fixture=true'].map(async url=>parseTeamSchedule(JSON.parse(await getText(url)),country.code)));return [...new Map(results.flat().map(g=>[g.id,g])).values()].sort((a,b)=>a.kickoff.localeCompare(b.kickoff));},teamSource);
   return {code:country.code,games};
  });return {countries};
 },source);
}
export async function collectDaily(getText){
 const nationalPromise=safely(async()=>parseHeadlines(await getText('https://news.yahoo.co.jp/rss/topics/top-picks.xml')),'https://news.yahoo.co.jp/');
 const categoriesPromise=mapLimit(newsCategoryFeeds,async feed=>[feed.id,{...await safely(async()=>parseHeadlines(await getText(feed.feed),new URL(feed.feed).hostname),feed.source),publisher:feed.publisher}]);
 const locations=await mapLimit(regions,async region=>{
  const feed=regionalNewsFeeds.find(feed=>feed.id===region.id),newsSource=`https://news.yahoo.co.jp/media/${feed.media}`;
  const news=await safely(async()=>({coverage:region.name,publisher:feed.publisher,items:parseHeadlines(await getText(`https://news.yahoo.co.jp/rss/media/${feed.media}/all.xml`))}),newsSource);
  return [region.id,{news}];
 });return {regions:regions.map(({id,name})=>({id,name})),nationalNews:await nationalPromise,newsCategories:Object.fromEntries(await categoriesPromise),locations:Object.fromEntries(locations)};
}
