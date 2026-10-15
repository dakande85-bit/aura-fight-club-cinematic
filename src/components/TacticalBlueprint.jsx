/**
 * Editorial, illustrative boxing-ring geometry. Positions are not measured
 * or derived from a tracking feed. The surrounding sourced copy is the claim.
 */
const diagrams=[
 {label:'Entry lanes',region:'DISTANCE',left:[215,190],right:[456,190],path:'M235 189 Q334 127 438 190',focus:[334,190],radius:105},
 {label:'Angle changes',region:'MID-RANGE',left:[282,146],right:[425,242],path:'M303 143 Q408 109 423 215',focus:[368,193],radius:82},
 {label:'Pocket exchanges',region:'INSIDE',left:[306,195],right:[372,209],path:'M310 193 Q337 157 366 206',focus:[341,196],radius:59}
];
const surname=name=>String(name||'Fighter').split(' ').slice(-1)[0].toUpperCase();
export default function TacticalBlueprint({fighters=[],active=0,onSelect=()=>{}}){
 const current=diagrams[active]||diagrams[0];
 return <div className="fdc-blueprint">
  <div className="fdc-blueprint-topline"><span><i/> AURA / RING BLUEPRINT</span><span>VIEW {String(active+1).padStart(2,'0')} OF 03</span></div>
  <div className="fdc-blueprint-canvas">
   <svg viewBox="0 0 680 390" role="img" aria-label={'Illustrative tactical ring schematic: '+current.label+'. These are conceptual positions, not measured fighter movements.'} preserveAspectRatio="xMidYMid meet">
    <defs>
     <radialGradient id="aura-floor" cx="50%" cy="50%" r="67%"><stop offset="0%" stopColor="#213440"/><stop offset="100%" stopColor="#0b171f"/></radialGradient>
     <radialGradient id="aura-hotspot"><stop offset="0%" stopColor="#d8b887" stopOpacity=".22"/><stop offset="100%" stopColor="#d8b887" stopOpacity="0"/></radialGradient>
     <pattern id="aura-floor-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#d9edf1" strokeOpacity=".045" strokeWidth=".7"/></pattern>
    </defs>
    <rect width="680" height="390" fill="#08151c"/>
    <rect x="56" y="35" width="568" height="320" fill="url(#aura-floor)" stroke="#506672" strokeWidth="1"/>
    <rect x="56" y="35" width="568" height="320" fill="url(#aura-floor-grid)"/>
    <rect x="69" y="49" width="542" height="292" fill="none" stroke="#90a2a9" strokeOpacity=".5" strokeWidth="2"/>
    <rect x="81" y="61" width="518" height="268" fill="none" stroke="#8799a2" strokeOpacity=".3" strokeWidth="1.5"/>
    <rect x="91" y="72" width="498" height="247" fill="none" stroke="#70838b" strokeOpacity=".18" strokeWidth="1"/>
    <path d="M56 35 l29 0 0 29 M624 355 l-29 0 0 -29" fill="none" stroke="#d29b81" strokeWidth="7"/>
    <path d="M624 35 l-29 0 0 29 M56 355 l29 0 0 -29" fill="none" stroke="#83a9bc" strokeWidth="7"/>
    <circle cx="340" cy="195" r="54" stroke="#50636e" fill="none" strokeWidth="1.4" strokeDasharray="6 6"/>
    <path d="M340 64 V326 M94 195 H586" stroke="#b3c4ca" strokeOpacity=".12" strokeWidth="1"/>
    <g className="fdc-blueprint-moving" key={active}>
      <circle cx={current.focus[0]} cy={current.focus[1]} r={current.radius} fill="url(#aura-hotspot)"/>
      <circle cx={current.focus[0]} cy={current.focus[1]} r={current.radius*.68} fill="none" stroke="#dfb981" strokeOpacity=".47" strokeWidth="1.6" strokeDasharray="4 8"/>
      <path d={current.path} stroke="#e9d1a7" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 7" fill="none" className="fdc-blueprint-trajectory"/>
      <circle cx={current.left[0]} cy={current.left[1]} r="23" fill="#c88472" fillOpacity=".12" stroke="#e6a58f" strokeOpacity=".4" strokeWidth="1.3"/>
      <circle cx={current.right[0]} cy={current.right[1]} r="23" fill="#80aecd" fillOpacity=".12" stroke="#93c2de" strokeOpacity=".4" strokeWidth="1.3"/>
      <circle cx={current.left[0]} cy={current.left[1]} r="11" fill="#e6a58f" stroke="#ffe4cc" strokeWidth="3"/>
      <circle cx={current.right[0]} cy={current.right[1]} r="11" fill="#8bbad8" stroke="#d7eff9" strokeWidth="3"/>
      <circle cx={current.focus[0]} cy={current.focus[1]} r="5" fill="#f4d4a0"/>
      <text x={current.left[0]} y={current.left[1]-33} textAnchor="middle" fill="#f6c7ae" fontWeight="800" fontSize="11" letterSpacing="1">{surname(fighters[0]?.name)}</text>
      <text x={current.right[0]} y={current.right[1]-33} textAnchor="middle" fill="#b1d8eb" fontWeight="800" fontSize="11" letterSpacing="1">{surname(fighters[1]?.name)}</text>
    </g>
    <text x="340" y="32" textAnchor="middle" fill="#8ba1ac" fontSize="10" fontWeight="700" letterSpacing="2.5">TACTICAL ZONE MAP</text>
    <text x="340" y="374" textAnchor="middle" fill="#a2b5bc" fontSize="11" fontWeight="700" letterSpacing="2">{current.region}</text>
   </svg>
   <div className="fdc-blueprint-watermark" aria-hidden="true"><span>AURA</span><strong>STRATEGY / 01</strong></div>
  </div>
  <div className="fdc-blueprint-controls" role="group" aria-label="Illustrative tactical zone">
   {diagrams.map((item,i)=><button type="button" key={item.label} aria-pressed={active===i} onClick={()=>onSelect(i)}><span>{String(i+1).padStart(2,'0')}</span><strong>{item.label}</strong></button>)}
  </div>
  <p className="fdc-blueprint-note">CONCEPTUAL DIAGRAM <span>·</span> Not fighter-tracking data or a recorded exchange</p>
 </div>;
}
