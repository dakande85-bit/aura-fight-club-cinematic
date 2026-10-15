import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 inchesFromText, parseCareerRecord, compareBoxingProfiles, indicatorPosition
} from '../src/data/fightLabMetrics.js';
import {getCalendarDate,upcomingFightCards,getDocumentedResults,createDecisionBrief} from '../src/data/fightLabPresentation.js';

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


equal(getCalendarDate(new Date('2026-10-15T22:30:00Z'),'Atlantic/Canary'),'2026-10-15','Canary calendar before local midnight');
equal(getCalendarDate(new Date('2026-10-15T23:30:00Z'),'Atlantic/Canary'),'2026-10-16','Canary local date after midnight (DST)');
equal(getCalendarDate(new Date('2026-01-01T01:30:00Z'),'America/Los_Angeles'),'2025-12-31','other timezone crossover');
const fixtures=[
 {id:'old',date:'2026-10-14',status:'Scheduled',fighters:['A','B']},
 {id:'today',date:'2026-10-15',status:'Scheduled',fighters:['A','B']},
 {id:'cancelled',date:'2026-10-17',status:'Cancelled',fighters:['A','B']},
 {id:'future',date:'2026-10-18',status:'Scheduled',fighters:['C','D']},
 {id:'completed',date:'2026-10-20',status:'Completed',fighters:['X','Y']},
 {id:'incomplete',date:'2026-10-21',status:'Scheduled',fighters:['X']}
];
equal(upcomingFightCards(fixtures,'2026-10-15').map(x=>x.id).join(','),'today,future','only actual scheduled two-fighter fixtures appear');
const snapshots={
 'Red Corner':[
  {date:'2026-10-19',opponent:'Future',result:'W',source:'https://boxing.test/future'},
  {date:'2026-05-09',opponent:'Previous',result:'W',source:'https://boxing.test/prior'},
  {date:'2026-05-15',opponent:'Unsourced',result:'L'},
  {date:'2026-10-15',opponent:'Same Day',result:'W',source:'https://boxing.test/sameday'},
  {date:'2025-10-01',opponent:'Older',result:'L',source:'https://boxing.test/older'}
 ]
};
equal(getDocumentedResults('Red Corner',snapshots,'2026-10-15').length,2,'future, same-day and unsourced bouts excluded');
equal(getDocumentedResults('Red Corner',snapshots,'2026-10-15')[0].opponent,'Previous','latest reviewed result first');
equal(getDocumentedResults('Blue Corner',snapshots,'2026-10-15').length,0,'missing fighter data displays no assumptions');
const brief=createDecisionBrief({
 fight:{name:'A v B'},fighters:[{name:'Red Corner'},{name:'Blue Corner'}],
 pick:'Red Corner',confidence:'medium',reason:' The jab can matter.  ',
 selectedQuestions:['Which fighter finds the jab?'],model:both
});
assert.match(brief,/My pick: Red Corner/);checks++;
assert.match(brief,/Questions I am watching/);checks++;
assert.match(brief,/NOT win odds/);checks++;
const noPadded= createDecisionBrief({fight:{name:'A v B'},fighters:[{name:'Red Corner'}],pick:'Unknown',model:null});
assert.match(noPadded,/My pick: Undecided/);checks++;
assert.match(noPadded,/insufficient common data/);checks++;
const citedBrief=createDecisionBrief({fight:{name:'C v D',sourceUrl:'https://promoter.example/fight'},fighters:[
 {name:'C',sources:['https://commission.example/fighter','https://commission.example/fighter']},
 {name:'D',sources:[]}
]});
assert.match(citedBrief,/https:\/\/promoter\.example\/fight/);checks++;
assert.match(citedBrief,/https:\/\/commission\.example\/fighter/);checks++;
equal((citedBrief.match(/https:\/\/commission\.example\/fighter/g)||[]).length,1,'source URLs are deduplicated');


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
