import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 inchesFromText, parseCareerRecord, compareBoxingProfiles, indicatorPosition
} from '../src/data/fightLabMetrics.js';

const n=(f,metric)=>metric==='power'?f.stats?.finish:metric==='form'?f.stats?.winshare:f.reachIn;
let checks=0;
const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++};
const close=(actual,expected,message)=>{assert.ok(Math.abs(actual-expected)<1e-7,message+' got '+actual);checks++};

equal(inchesFromText('74½ in (189 cm)'),74.5,'fractional reach');
equal(inchesFromText('67½ in'),67.5,'another fractional reach');
equal(inchesFromText('78.7 in (200 cm)'),78.7,'decimal reach');
equal(inchesFromText('80 in (203 cm)'),80,'integer reach');
equal(inchesFromText('unknown'),null,'missing reach stays null');
const dubois=parseCareerRecord('23–3 (22 KO)');
const wardley=parseCareerRecord('20–1–1 (19 KO)');
const fundora=parseCareerRecord('24–1–1 (16 KO)');
equal(dubois.wins,23,'wins');
equal(dubois.losses,3,'losses');
equal(wardley.draws,1,'draws');
equal(fundora.kos,16,'Fundora KOs');
close(dubois.finish,22/23*100,'KO wins / total wins, not win probability');
close(wardley.winshare,20/22*100,'career wins / all bouts');
equal(parseCareerRecord(''),null,'empty career record rejected');
equal(parseCareerRecord('6–1 (7 KO)'),null,'more KOs than wins rejected');
equal(parseCareerRecord('0–0 (0 KO)'),null,'no professional bouts');

const left={name:'Red Corner',stats:dubois,reachIn:78};
const right={name:'Blue Corner',stats:wardley,reachIn:79};
const both=compareBoxingProfiles([left,right],{power:40,form:25,range:35});
equal(both.rows.length,3,'all three documented common metrics included');
equal(both.rows.find(row=>row.metric==='range').lead,'Blue Corner','higher reach leads the reach descriptor');
equal(compareBoxingProfiles([left,right],{power:0,form:0,range:0}),null,'all-zero sliders yield no result');
const missing=compareBoxingProfiles([left,{name:'Newcomer',stats:null,reachIn:null}],{power:50,range:50});
equal(missing,null,'missing one fighter produces no fictitious comparison');
const partial=compareBoxingProfiles([left,{name:'Reach Only',stats:null,reachIn:81}],{power:40,form:20,range:40});
equal(partial.rows.length,1,'unsupported metrics excluded');
equal(partial.rows[0].metric,'range','only common metric used');
equal(indicatorPosition(0),50,'neutral pointer centered');
equal(indicatorPosition(.2),30,'red-corner advantage shifts left');
equal(indicatorPosition(-.2),70,'blue-corner advantage shifts right');
equal(indicatorPosition(2),10,'pointer clamped to the track');
equal(indicatorPosition(-2),90,'pointer clamped symmetrically');

const eventData=JSON.parse(readFileSync(new URL('../public/news/fights.json',import.meta.url),'utf8'));
for(const event of eventData.fights){
 assert.match(event.id,/^[a-z0-9-]+$/); checks++;
 if(event.officialVideo){
  assert.match(event.officialVideo.youtubeId,/^[a-zA-Z0-9_-]{11}$/); checks++;
  assert.match(event.officialVideo.sourceUrl,/^https:\/\//); checks++;
 }
}
const punch=JSON.parse(readFileSync(new URL('../src/data/licensedPunchStats.json',import.meta.url),'utf8'));
const bets=JSON.parse(readFileSync(new URL('../public/news/betting-partners.json',import.meta.url),'utf8'));
equal(punch.licensedForDisplay,false,'no fictional punch data can go live by default');
equal(bets.enabled,false,'bookmaker affiliate content remains disabled');
equal(bets.operatorDataConnected,false,'bookmaker data is not connected');
equal(bets.ageVerificationConnected,false,'age verification is not connected');

console.log('Fight Lab QA: '+checks+' assertions passed. Metrics remain descriptive; licensed and commercial feeds disabled.');
