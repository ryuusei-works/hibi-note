import test from 'node:test';
import assert from 'node:assert/strict';
import {regions,parseHeadlines,regionalNewsFeeds,parseNationalTeams,parseTeamSchedule,collectDaily,collectRivals,newsCategoryFeeds} from '../lib/daily.mjs';

const rss=()=>`<rss><channel>${[1,2,3,4].map(i=>`<item><title>見出し${i} &amp; ニュース</title><link>https://news.yahoo.co.jp/articles/${i}</link><pubDate>Sat, 10 Oct 2026 ${10+i}:00:00 +0900</pubDate></item>`).join('')}<item><title>危険なURL</title><link>javascript:alert(1)</link><pubDate>Sat, 10 Oct 2026 16:00:00 +0900</pubDate></item></channel></rss>`;
const directory=()=>({sports:[{leagues:[{teams:Array.from({length:20},(_,i)=>({team:{id:String(i+1),abbreviation:i===0?'ESP':i===1?'BRA':'AAA',displayName:'Country'}}))}]}]});
const event=(state='post',extra={})=>({id:'match',date:'2026-10-09T23:00:00Z',season:{displayName:'International Friendly'},links:[{href:'https://www.espn.com/soccer/match/_/gameId/1'},{href:'javascript:alert(1)'}],competitions:[{timeValid:true,status:{type:{state,completed:state==='post',name:'STATUS_FULL_TIME',shortDetail:'FT'}},competitors:[{homeAway:'home',team:{abbreviation:'ESP',displayName:'Spain'},score:{value:0}},{homeAway:'away',team:{abbreviation:'BRA',displayName:'Brazil'},score:{value:2}}]}],...extra});
const schedule=(events=[event()])=>({team:{abbreviation:'ESP',isNational:true},events});

test('national headlines use RSS titles only, newest three, decoded text and safe links',()=>{
 const rows=parseHeadlines(rss());assert.equal(rows.length,3);assert.equal(rows[0].title,'見出し4 & ニュース');assert.equal(rows[0].date,'2026-10-10');assert.throws(()=>parseHeadlines('<rss/>'));
});
test('regional publisher mapping covers all prefectures with unique validated Yahoo feed IDs',()=>{
 assert.equal(regionalNewsFeeds.length,47);assert.deepEqual(regionalNewsFeeds.map(feed=>feed.id),regions.map(region=>region.id));assert.equal(regionalNewsFeeds.find(feed=>feed.id==='13').media,'tokyomxv');assert.ok(regionalNewsFeeds.every(feed=>/^[a-z0-9]+$/.test(feed.media)&&feed.publisher));assert.throws(()=>parseHeadlines('<rss><item><title>NHK</title><link>https://news.web.nhk/newsweb/na/1</link><pubDate>Sat, 10 Oct 2026 16:00:00 +0900</pubDate></item></rss>'));
});
test('national team schedules validate identity, keep JST/zero/PK results and never use pregame zero as a result',()=>{
 assert.equal(parseNationalTeams(directory())[0].code,'ESP');assert.throws(()=>parseNationalTeams({}));const games=parseTeamSchedule(schedule([event(),event('pre')]),'ESP');assert.equal(games[0].date,'2026-10-10');assert.equal(games[0].homeScore,0);assert.equal(games[0].status,'finished');assert.equal(games[1].homeScore,null);assert.equal(games[1].status,'scheduled');assert.throws(()=>parseTeamSchedule(schedule(),'BRA'));
 const pk=event();pk.competitions[0].status.type.name='STATUS_FINAL_PEN';pk.competitions[0].competitors[0].score.shootoutScore=5;pk.competitions[0].competitors[1].score.shootoutScore=4;const result=parseTeamSchedule(schedule([pk]),'ESP')[0];assert.equal(result.homeScore,0);assert.equal(result.homePenalty,5);assert.equal(result.awayPenalty,4);
 const unknown=event('pre');unknown.timeValid=false;unknown.links=[{href:'https://example.org/'}];assert.equal(parseTeamSchedule(schedule([unknown]),'ESP')[0].timeKnown,false);assert.equal(parseTeamSchedule(schedule([unknown]),'ESP')[0].url,'https://www.espn.com/soccer/scoreboard');
});
test('daily collection gets category-specific public feeds, isolates failures, and never requests weather',async()=>{
 const urls=[];const get=async url=>{urls.push(url);if(url.includes('/tokyomxv/'))throw Error('offline');return url.includes('web.gekisaka.jp')?rss().replaceAll('news.yahoo.co.jp','web.gekisaka.jp'):rss();};const result=await collectDaily(get);assert.equal(result.locations['13'].news.ok,false);assert.equal(result.locations['27'].news.ok,true);assert.equal(result.nationalNews.data.length,3);assert.equal(Object.keys(result.locations).length,47);assert.equal(result.alerts,undefined);assert.equal(result.locations['13'].weather,undefined);assert.ok(urls.every(url=>['news.yahoo.co.jp','web.gekisaka.jp'].includes(new URL(url).hostname)));assert.equal(urls.length,58);assert.equal(Object.keys(result.newsCategories).length,10);assert.ok(Object.values(result.newsCategories).every(source=>source.ok&&source.data.length===3));
});
test('rivals are selected by current rank and per-country failures do not hide the remaining countries',async()=>{
 const calls=[],get=async url=>{calls.push(url);if(url.endsWith('/teams'))return JSON.stringify(directory());if(url.includes('/teams/2/'))throw Error('unavailable');return JSON.stringify(schedule([event()]));};const fifa={ok:true,data:{rows:[{rank:1,code:'ESP'},{rank:2,code:'BRA'},{rank:3,code:'JPN'},{rank:4,code:'ARG'}]}};const result=await collectRivals(get,fifa);assert.equal(result.ok,true);assert.equal(result.data.countries.length,2);assert.equal(result.data.countries[0].games.data.length,1,'past/future duplicates removed');assert.equal(result.data.countries[1].games.ok,false);assert.ok(calls.some(c=>c.endsWith('?fixture=true')));assert.equal(calls.length,5);assert.equal((await collectRivals(get,{ok:false})).ok,false);
});

test('soccer feeds accept only HTTPS links from the selected provider',()=>{
 const xml=rss().replaceAll('news.yahoo.co.jp','web.gekisaka.jp');assert.equal(parseHeadlines(xml,'web.gekisaka.jp').length,3);assert.throws(()=>parseHeadlines(xml));assert.throws(()=>parseHeadlines(xml,'evil.example'));assert.throws(()=>parseHeadlines(xml.replaceAll('https://web.gekisaka.jp/','https://user@web.gekisaka.jp/'),'web.gekisaka.jp'));assert.ok(newsCategoryFeeds.find(f=>f.id==='domestic-soccer').feed.includes('category=domestic'));assert.ok(newsCategoryFeeds.find(f=>f.id==='overseas-soccer').feed.includes('category=foreign'));
});
test('one failed news category does not replace it with unrelated headlines',async()=>{
 const result=await collectDaily(async url=>{if(url.includes('business.xml'))throw Error('offline');return url.includes('web.gekisaka.jp')?rss().replaceAll('news.yahoo.co.jp','web.gekisaka.jp'):rss();});assert.equal(result.newsCategories.economy.ok,false);assert.equal(result.newsCategories.baseball.ok,true);assert.equal(result.nationalNews.ok,true);
});

test('feed metadata comes from item fields rather than embedded article markup',()=>{
 const xml='<rss><channel><item><title>正しい見出し</title><link>https://web.gekisaka.jp/news/1</link><pubDate>Sat, 10 Oct 2026 16:00:00 +0900</pubDate><content><title>本文内のタイトル</title><item><title>混入</title><link>https://web.gekisaka.jp/news/2</link><pubDate>Sun, 11 Oct 2026 16:00:00 +0900</pubDate></item></content></item></channel></rss>';
 const rows=parseHeadlines(xml,'web.gekisaka.jp');assert.equal(rows.length,1);assert.equal(rows[0].title,'正しい見出し');
});
