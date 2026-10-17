/*
 * Curated original-source media for live boxing journalism.
 * Do not download/hotlink agency photos without a written licence.
 * Official YouTube embeds remain hosted by their rights-holder; clearly label the date.
 */
const pressOct17 = [
 {title:'17 October — Dubois celebrates the WBO defence',publisher:'Reuters / Action Images',credit:'John Sibley, Action Images via Reuters',url:'https://www.reuters.com/sports/dubois-stops-wardley-second-round-retain-wbo-heavyweight-title-2026-10-17/',type:'ringside',published:'17 Oct 2026',description:'Fight-night photographs of the title defence and immediate aftermath. Images available for licensing from the publisher.'},
 {title:'17 October — ringside results and fight images',publisher:'MMA Fighting',url:'https://www.mmafighting.com/boxing/516222/daniel-dubois-destroys-fabio-wardley-via-2nd-round-knockout-in-highly-anticipated-rematch',type:'ringside',published:'17 Oct 2026',description:'Independent ringside reporting and editorial pictures; visit the original publisher.'},
 {title:'15 October — official final press conference photographs',publisher:'Queensberry Promotions / FIGHTMAG',credit:'Leigh Dawney / Queensberry Promotions',url:'https://www.fightmag.com/photos-dubois-and-wardley-at-final-press-conference-ahead-of-rematch/',type:'gallery',published:'15 Oct 2026',description:'Multiple genuine portraits and face-off images released by the event promoter and published by FIGHTMAG.'}
];
const officialVideos=[
 {kind:'youtube',youtubeId:'5HReUSh22bY',title:'Dubois vs Wardley — first fight highlights',publisher:'DAZN Boxing (verified)',published:'9 May 2026',description:'ARCHIVE: highlights from the first meeting in Manchester, NOT the October rematch.'},
 {kind:'youtube',youtubeId:'2W33Uyr3KBc',title:'Dubois vs Wardley II — official face-off',publisher:'DAZN Boxing (verified)',published:'18 Sep 2026',description:'PRE-FIGHT: official rematch face-off, not a post-fight reaction.'},
 {kind:'youtube',youtubeId:'Ps5cOjwmhdw',title:'Dubois and Wardley — launch press conference confrontation',publisher:'DAZN Boxing (verified)',published:'2 Sep 2026',description:'PRE-FIGHT: launch press conference, not a clip of the October fight.'}
];
const fightNightVideos=[
 {title:'October 17 — fight-night highlights and video updates',publisher:'MMA Fighting',url:'https://www.mmafighting.com/boxing/516171/daniel-dubois-vs-fabio-wardley-2-full-fight-video-highlights-boxing',published:'17 Oct 2026',description:'Current rematch highlights collected by the publisher; footage rights remain with original owners.'},
 {title:'October 17 — official DAZN ringside clips and reactions',publisher:'DAZN Boxing',url:'https://www.youtube.com/@DAZNBoxing/videos',published:'17 Oct 2026 onward',description:'Official broadcaster video channel. New fight-night uploads can be embedded once individual video IDs are verified.'},
 {title:'October 17 — official broadcaster social clips',publisher:'DAZN Boxing',url:'https://x.com/DAZNBoxing',published:'17 Oct 2026 onward',description:'Official broadcaster account featuring ringside video and image posts. Posts remain on the original platform.'}
];
const pressByStory={
 'daniel-dubois-fabio-wardley-2-result-second-round-tko':{photos:pressOct17,videos:[officialVideos[0]],footage:fightNightVideos},
 'dubois-wardley-2-post-fight-reaction-what-they-said':{photos:[pressOct17[0],pressOct17[1]],videos:[officialVideos[1]],footage:fightNightVideos},
 'dubois-wardley-first-17-seconds-tactical-analysis':{photos:[pressOct17[0],pressOct17[1]],videos:[officialVideos[0]],footage:[fightNightVideos[0],fightNightVideos[1]]},
 'ben-davison-towel-fabio-wardley-dubois-corner-decision':{photos:[pressOct17[0],pressOct17[1]],videos:[officialVideos[0]],footage:[fightNightVideos[0]]},
 'dubois-wardley-rough-tactics-allegations-rematch-aftermath':{photos:[pressOct17[2],pressOct17[0]],videos:[officialVideos[0],officialVideos[2]],footage:[fightNightVideos[0]]},
 'daniel-dubois-wbo-heavyweight-title-what-next-after-wardley':{photos:[pressOct17[0]],videos:[],footage:[fightNightVideos[0],fightNightVideos[1]]},
 'dubois-hrgovic-2-unification-ibf-mandatory-after-wardley':{photos:[pressOct17[0],pressOct17[1]],videos:[],footage:[fightNightVideos[0],fightNightVideos[2]]},
 'jalolov-dacres-result-dubois-wardley-undercard-october-2026':{photos:[{title:'17 October — full London card and official results',publisher:'MMA Fighting',url:'https://www.mmafighting.com/boxing/515997/dubois-vs-wardley-2-results-live-updates-of-the-undercard-and-main-event',type:'gallery',published:'17 Oct 2026',description:'Undercard reporting and accompanying event imagery; source images are not cleared for reuse.'}],videos:[],footage:[{title:'Queensberry official event media',publisher:'Queensberry Promotions',url:'https://queensberry.co.uk/pages/news',published:'17 Oct 2026 onward',description:'Event-organiser video interviews and photo coverage as made available.'}]}
};
export function officialMediaForArticle(slug){return pressByStory[slug]||null;}
export function hasOfficialMedia(slug){return Boolean(pressByStory[slug]);}
