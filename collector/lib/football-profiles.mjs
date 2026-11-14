import {load} from 'cheerio';

const plain=value=>typeof value==='string'?load(value).text().replace(/\s+/g,' ').trim():'';
const nameKey=value=>plain(value).normalize('NFKC').replace(/\s/g,'');
const number=(value,min,max)=>{
  if(!/^(?:\d+)(?:\.\d+)?$/.test(String(value??'')))return null;
  const n=Number(value);return n>=min&&n<=max?n:null;
};
const count=value=>{const n=number(value,0,1000);return Number.isInteger(n)?n:null;};
const present=value=>value!==null&&value!==undefined&&value!==''&&(!Array.isArray(value)||value.length>0);

// This is the JSON endpoint used by JFA's own memberProfile widget.
export function profileUrl(id){
  if(!/^[a-z]+(?:_[a-z]+)+$/.test(id||''))throw Error('Invalid JFA player id');
  return `https://www.jfa.jp/national_team/inc/member/samuraiblue/${id}.json`;
}

export function parsePlayerProfile(payload,expectedName,today,id){
  const row=payload?.memberDescription;
  if(!row||!nameKey(row.name)||nameKey(row.name)!==nameKey(expectedName))throw Error('JFA player identity mismatch');
  const match=plain(row.birthday).match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})$/);
  const date=match?`${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`:null;
  const birthDate=date&&date>='1900-01-01'&&date<=today&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date?date:null;
  let photoUrl=null;
  try{
    const url=new URL(row.photoURL);
    if(/^[a-z]+(?:_[a-z]+)+$/.test(id||'')&&url.origin==='https://www.jfa.jp'&&!url.username&&!url.password&&!url.search&&!url.hash&&['jpg','jpeg','png','webp'].some(ext=>url.pathname===`/national_team/inc/member/samuraiblue/${id}.${ext}`))photoUrl=url.href;
  }catch{}
  return {
    profile:{englishName:plain(row.nameEng),birthDate,heightCm:number(row.height,80,250),weightKg:number(row.weight,20,200),career:plain(row.career).split(/[→⇒]/).map(v=>v.trim()).filter(Boolean),photoUrl},
    caps:count(row.record?.gamesPlayed),
    // The registry's goals column is goals scored, never goalkeeper conceded goals.
    goals:row.position==='GK'?null:count(row.record?.goals),
  };
}

export async function enrichSquadProfiles(players,getText,today){
  const result=[];
  // Limit concurrency so adding a whole new squad cannot flood the official site.
  for(let start=0;start<players.length;start+=4){
    result.push(...await Promise.all(players.slice(start,start+4).map(async player=>{
      let source;
      try{
        source=profileUrl(player.id);
        const next=parsePlayerProfile(JSON.parse(await getText(source)),player.name,today,player.id);
        const fetchedAt=new Date().toISOString();
        const fields=Object.fromEntries(Object.entries(next.profile).filter(([,value])=>present(value)));
        const profile={...player.profile,...fields,source,fetchedAt};
        // A dated official program remains authoritative for international stats.
        const useRegistry=player.caps==null;
        return {...player,profile,profileStatus:{ok:true,source,fetchedAt},
          ...(useRegistry?{caps:next.caps,goals:player.position==='GK'?null:next.goals,conceded:player.conceded??null,asOf:null,statsSource:source,statsKind:'directory'}:{})};
      }catch{
        return {...player,profileStatus:{ok:false,source,error:'JFA選手名鑑を取得できませんでした。次回更新で再試行します。'}};
      }
    })));
  }
  return result;
}

export function preserveSquadProfiles(previous,current){
  if(!current.footballSquad?.ok||!previous?.footballSquad?.ok)return;
  const saved=new Map(previous.footballSquad.data.players.map(p=>[p.id,p]));
  current.footballSquad.data.players=current.footballSquad.data.players.map(player=>{
    const old=saved.get(player.id);
    if(player.profileStatus?.ok!==false||!old?.profile||nameKey(old.name)!==nameKey(player.name))return player;
    const fields=Object.fromEntries(Object.entries(player.profile||{}).filter(([,value])=>present(value)));
    return {...player,profile:{...old.profile,...fields,stale:true},
      ...(player.caps==null&&old.caps!=null?{caps:old.caps,goals:old.goals,conceded:old.conceded,asOf:old.asOf,statsSource:old.statsSource||previous.footballSquad.data.statsSource,statsKind:old.statsKind}:{}),
    };
  });
}
