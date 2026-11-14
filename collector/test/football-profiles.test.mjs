import test from 'node:test';
import assert from 'node:assert/strict';
import {profileUrl,parsePlayerProfile,enrichSquadProfiles,preserveSquadProfiles} from '../lib/football-profiles.mjs';
import {collectEnhancements} from '../lib/enhancements.mjs';

const today='2026-11-14';
const payload=(name='追加 選手')=>({memberDescription:{name,nameEng:'NEW Player',position:'MF/FW',birthday:'2004.04.08',height:'178',weight:'70',career:'ユース→クラブA<br>→クラブB',record:{gamesPlayed:'0',goals:'0'},matchList:[{date:'2026.11.14',card:'相手'}]}});

test('JFA registry fills a debutant profile and explicit zero stats without inferring a debut from registered matches',()=>{
  const p=parsePlayerProfile(payload(),'追加　選手',today);
  assert.equal(p.profile.birthDate,'2004-04-08');
  assert.equal(p.profile.heightCm,178);
  assert.equal(p.profile.weightKg,70);
  assert.deepEqual(p.profile.career,['ユース','クラブA','クラブB']);
  assert.equal(p.caps,0);assert.equal(p.goals,0);
  assert.equal(p.profile.debut,undefined);
  assert.equal(p.profile.birthplace,undefined);
  assert.throws(()=>parsePlayerProfile(payload(),'別 選手',today),/identity/);
  assert.throws(()=>profileUrl('../../bad'),/Invalid/);
  assert.throws(()=>profileUrl('new_player?url=evil'),/Invalid/);
});

test('invalid, absent and goalkeeper values are never invented or interpreted as conceded goals',()=>{
  const data=payload();Object.assign(data.memberDescription,{birthday:'2004.02.31',height:'',weight:'NaN',position:'GK'});
  data.memberDescription.record={gamesPlayed:'',goals:'4'};
  const p=parsePlayerProfile(data,'追加 選手',today);
  assert.equal(p.profile.birthDate,null);assert.equal(p.profile.heightCm,null);assert.equal(p.profile.weightKg,null);
  assert.equal(p.caps,null);assert.equal(p.goals,null);
  data.memberDescription.birthday='2099.01.01';assert.equal(parsePlayerProfile(data,'追加 選手',today).profile.birthDate,null);
});

test('automatically enriches each roster member with bounded requests and isolates individual failures',async()=>{
  const roster=Array.from({length:9},(_,i)=>({id:`new_${String.fromCharCode(97+i)}`,name:`選手 ${i}`,position:'MF/FW',club:'現在クラブ'}));
  roster[1]={...roster[1],caps:8,goals:2,asOf:'2026-10-01',statsSource:'https://op.jfa.jp/samuraiblue20261005/',profile:{birthplace:'公式出身地',debut:'公式デビュー',heightCm:180}};
  let active=0,peak=0;const requests=[];
  const enriched=await enrichSquadProfiles(roster,async url=>{
    requests.push(url);peak=Math.max(peak,++active);
    await new Promise(resolve=>setImmediate(resolve));active--;
    const player=roster.find(p=>profileUrl(p.id)===url);
    if(player.id==='new_c')throw Error('offline');
    const data=payload(player.name);if(player.id==='new_b')data.memberDescription.height='';
    return JSON.stringify(data);
  },today);
  assert.equal(requests.length,9);assert.ok(peak<=4);
  assert.equal(enriched[0].profile.birthDate,'2004-04-08');assert.equal(enriched[0].caps,0);assert.equal(enriched[0].statsKind,'directory');assert.equal(enriched[0].asOf,null);
  assert.equal(enriched[1].profile.heightCm,180);assert.equal(enriched[1].profile.birthplace,'公式出身地');assert.equal(enriched[1].caps,8);assert.equal(enriched[1].asOf,'2026-10-01');assert.equal(enriched[1].club,'現在クラブ');
  assert.equal(enriched[2].profileStatus.ok,false);assert.equal(enriched[2].profile,undefined);
  assert.equal(enriched[8].profileStatus.ok,true);
});

test('failed re-fetches preserve previously verified player data without keeping removed players or changing roster club',()=>{
  const old={id:'new_player',name:'追加 選手',club:'旧クラブ',caps:0,goals:0,statsKind:'directory',statsSource:profileUrl('new_player'),profile:{birthDate:'2004-04-08',heightCm:178,source:profileUrl('new_player'),fetchedAt:'2026-11-13T00:00:00Z'}};
  const previous={footballSquad:{ok:true,data:{players:[old,{id:'removed_player',name:'離脱 選手'}]}}};
  const current={footballSquad:{ok:true,data:{players:[{id:old.id,name:old.name,club:'現在クラブ',profileStatus:{ok:false}}]}}};
  preserveSquadProfiles(previous,current);
  assert.equal(current.footballSquad.data.players.length,1);
  const p=current.footballSquad.data.players[0];assert.equal(p.profile.birthDate,old.profile.birthDate);assert.equal(p.profile.fetchedAt,old.profile.fetchedAt);assert.equal(p.profile.stale,true);assert.equal(p.club,'現在クラブ');assert.equal(p.caps,0);
});

test('a newly called-up squad is enriched even when no completed-match program exists',async()=>{
  const roster=Array.from({length:11},(_,i)=>({id:`new_${String.fromCharCode(97+i)}`,name:`選手 ${i}`}));
  const getText=async url=>{
    if(url.includes('/samuraiblue_2026/member/'))return '<table><tr><td>11/10</td><td><a href="/samuraiblue/current/member.html">招集メンバー</a></td></tr></table>';
    if(url.includes('/current/member.html'))return '<div class="section-block"><h4>MF/FW</h4><div class="competition-member">'+roster.map(p=>`<a href="/samuraiblue/member/${p.id}.html"><span class="name">${p.name}</span><span class="status">クラブ</span></a>`).join('')+'</div></div>';
    const player=roster.find(p=>profileUrl(p.id)===url);
    if(player)return JSON.stringify(payload(player.name));
    throw Error('No other source available');
  };
  const result=await collectEnhancements(getText,{today,year:2026,footballGames:{ok:true,data:[]}});
  assert.equal(result.footballSquad.ok,true);
  assert.equal(result.footballSquad.data.players.length,11);
  assert.ok(result.footballSquad.data.players.every(p=>p.profile.birthDate==='2004-04-08'&&p.caps===0));
});
