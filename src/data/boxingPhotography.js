export const fighterPhotography={
 'naoya-inoue':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
 'junto-nakatani':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
 'jesse-bam-rodriguez':{src:'https://www.matchroomboxing.com/app/uploads/2026/04/MAP13492-2048x1365.jpg',alt:'Jesse Bam Rodriguez celebrating with championship belts',credit:'Matchroom Boxing'},
 'anthony-joshua':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
 'tyson-fury':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
 'canelo-alvarez':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
 'fabio-wardley':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
 'moses-itauma':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
 'devin-haney':null, // Multi-boxer promotional/photo source excluded from solo fighter directory
};
export const fightPhotography={
 'schofield-bahdi':null,
 'smith-puello':null,
 'foster-navarrete':null,
 'billam-smith-clarke':null,
 'kabayel-hysa':null,
 'dubois-wardley-2':{src:'https://www.rte.ie/images/00245710-800.jpg',alt:'Daniel Dubois and Fabio Wardley in the ring during their first fight',credit:'RTÉ Sport'},
 'fury-joshua':{src:'https://www.fightmag.com/wp-content/uploads/2026/09/tyson-fury-vs-anthony-joshua-faceoff-turki-alalshikh-696x494.jpg',alt:'Tyson Fury and Anthony Joshua at their promotional face-off',credit:'FightMag'},
 'canelo-mbilli':{src:'https://www.boxinginsider.com/wp-content/uploads/2026/09/IMG_9836-1200x675.jpeg',alt:'Canelo Alvarez versus Christian Mbilli promotional artwork',credit:'Boxing Insider'},
 'fundora-hadribeaj':{src:'https://media.dave.sport/boxingsocial/2026/03/Fundora-vs-Thurman-Fight-Night-11-scaled.jpg',alt:'Sebastian Fundora celebrates with his title after a previous bout',credit:'Boxing Social',archive:true},
};

/** Image may be reused for a fighter profile only when the named boxer is explicitly depicted. */
export const mediaForFighter=(slug)=>fighterPhotography[slug]||null;
export const mediaForFight=(id)=>fightPhotography[id]||null;
