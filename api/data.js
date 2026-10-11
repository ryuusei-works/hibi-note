import {getCache} from '@vercel/functions';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createLiveData,memoryCache,pack,unpack} from '../lib/live-data.mjs';
import {collectFresh} from '../lib/data.mjs';
import {readPublishedPrevious} from '../scripts/build-pages.mjs';

const cache=process.env.VERCEL==='1'?getCache({namespace:'hibi-note-news-sports-v5'}):memoryCache();
let baseline;
async function loadBaseline(){
 baseline??=JSON.parse(await readFile(resolve('dist/data/sports.json'),'utf8'));
 if(process.env.VERCEL==='1')try{
  let archive=await cache.get('published-archive-v1');
  if(!archive){const data=await readPublishedPrevious();archive=pack(data);await cache.set('published-archive-v1',archive,{ttl:1800});}
  const published=unpack(archive);if(Date.parse(published.generatedAt)>Date.parse(baseline.generatedAt))baseline=published;
 }catch{/* Bundled data remains available if Pages or the cache is down. */}
 return baseline;
}
const handle=createLiveData({cache,collect:collectFresh,loadBaseline});
export default {fetch:handle};
