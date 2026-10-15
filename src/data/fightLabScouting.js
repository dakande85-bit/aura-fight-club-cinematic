import punchFeed from './licensedPunchStats.json';
/**
 * AURA editorial scouting, NOT a punch-stat feed.
 * Facts and interpretations are separately labelled; source URLs are mandatory
 * for event-specific factual claims. Licensed punch data is ingested separately.
 */
export const fightLabScouting = {
  'dubois-wardley-2': {
    checkedAt: '2026-10-15',
    headline: 'Can Wardley change the middle rounds?',
    thesis: 'The first meeting showed two different fights: Wardley had early success, then Dubois recovered and turned sustained pressure into an eleventh-round stoppage. The rematch hinges on whether Wardley can avoid the same attritional pattern.',
    evidence: [
      {label: 'Previous meeting', detail: 'Dubois won by stoppage in round 11 in May 2026 after suffering two early knockdowns.', url: 'https://talksport.com/boxing/4639216/daniel-dubois-fabio-wardley-predictions-derek-chisora-simon-jordan/'},
      {label: 'Rematch confirmed', detail: 'The return is scheduled for 17 October 2026.', url: 'https://queensberry.co.uk/blogs/queensberry-promotions-blog/run-it-back-dubois-wardley-sequel-set-for-october-17'}
    ],
    fighters: {
      'Daniel Dubois': {weapon: 'Jab into heavy follow-up combinations', opportunity: 'Establish a sustainable pace after surviving the opening exchanges.', danger: 'The first fight showed vulnerability to early knockdowns.'},
      'Fabio Wardley': {weapon: 'Fast starts and disruptive heavyweight punching', opportunity: 'Make early damage count without emptying the tank.', danger: 'Sustained incoming pressure and a prolonged high-contact fight.'}
    },
    keys: ['Who wins the jab exchanges after round four?', 'Can Wardley keep his feet under him as the pace rises?', 'Does Dubois avoid the early knockdowns that changed the first fight?'],
    editorialLean: 'Dubois, with a late stoppage as a plausible route — not a statistical probability.',
    confidence: 'Qualitative analysis only; no licensed punch-by-punch series.'
  },
  'fundora-hadribeaj': {
    checkedAt: '2026-10-15',
    headline: 'The distance problem at 154',
    thesis: 'Fundora has unusual height and reach for the division, but his tendency to exchange reduces the protection those advantages should offer. Hadribeaj needs to solve both the reach and the champion’s work rate.',
    evidence: [
      {label: 'Fundora measurements', detail: 'WBC lists Fundora at 197 cm tall with 203 cm reach, in a southpaw stance.', url: 'https://wbcboxing.com/boxeador/sebastian-fundora/'},
      {label: 'Challenger profile', detail: 'The Ring profiles Hadribeaj as an orthodox boxer with a 23–0–1 record.', url: 'https://www.ringmagazine.com/fighters/ermal-hadribeaj-70SNbkWZvHnLYdyr7ZQktd'},
      {label: 'Title defence', detail: 'Fundora is scheduled to face Hadribeaj on 17 October 2026.', url: 'https://www.premierboxingchampions.com/sebastian-fundora-vs-ermal-hadribeaj'}
    ],
    fighters: {
      'Sebastian Fundora': {weapon: 'Southpaw straight shots and sustained volume', opportunity: 'Control range without being drawn into unnecessary trades.', danger: 'Standing in the pocket gives shorter opponents access.'},
      'Ermal Hadribeaj': {weapon: 'Orthodox counters and timed entries', opportunity: 'Exploit the moments when Fundora abandons his height advantage.', danger: 'Getting stranded at the end of Fundora’s long combinations.'}
    },
    keys: ['How does Hadribeaj get past the lead hand?', 'Will Fundora box long or fight inside?', 'Who dictates the tempo beyond the opening rounds?'],
    editorialLean: 'Fundora on physical and championship experience, subject to the distance battle.',
    confidence: 'Qualitative analysis only; no licensed punch-by-punch series.'
  }
};

/** Optional licensed-feed contract: no fictional default values. */
export const punchDataContract = punchFeed;

// When licensed data arrives, the vetted publishing pipeline can populate per-fight:
// { fighters: { [name]: { sampleFights, rounds: [{round, jabsThrown,
//   jabsLanded, powerThrown, powerLanded}], sourceUrl, reviewedAt } } }
// Never imply punch averages or stoppage-round probabilities from the win/loss record.

/** Explicitly sourced previous results. Entries are intentionally NOT padded to five. */
export const verifiedRecentFights = {
  'Daniel Dubois': [
    {date:'2026-05-09',opponent:'Fabio Wardley',result:'W',method:'TKO 11',source:'https://www.reuters.com/sports/dubois-stops-wardley-11-rounds-take-wbo-heavyweight-title-2026-05-09/'}
  ],
  'Fabio Wardley': [
    {date:'2026-05-09',opponent:'Daniel Dubois',result:'L',method:'TKO 11',source:'https://www.reuters.com/sports/dubois-stops-wardley-11-rounds-take-wbo-heavyweight-title-2026-05-09/'}
  ],
  'Ermal Hadribeaj': [
    {date:'2026-05-23',opponent:'Bakary Samake',result:'W',method:'UD 12',source:'https://www.ringmagazine.com/news/hadribeaj-on-path-to-fight-fundora-after-beating-samake-5YssaDQDBeTNAHl3PWdFvs'}
  ],
  'Sebastian Fundora': [
    {date:'2026-03-28',opponent:'Keith Thurman',result:'W',method:'TKO 6',source:'https://www.premierboxingchampions.com/events/249677'}
  ]
};
