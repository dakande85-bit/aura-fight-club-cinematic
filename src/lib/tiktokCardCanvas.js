// 1080 x 1920 original editorial artwork, rendered locally in the browser.
// Only user-supplied images are allowed into cover art after rights confirmation.
export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1920;

function wrap(ctx, text, width) {
  const words = String(text||'').split(/\s+/).filter(Boolean);
  const lines=[]; let line='';
  for (const word of words) {
    const proposal = line ? line+' '+word : word;
    if (ctx.measureText(proposal).width <= width || !line) line=proposal;
    else {lines.push(line); line=word;}
  }
  if (line) lines.push(line);
  return lines;
}

function typography(ctx, text, {x,y,width,maxHeight,startSize,minSize,lineHeight=1.12,weight=850,color='#f6f5f1',maxLines=12}) {
  let size=startSize,lines=[];
  while (size>=minSize) {
    ctx.font = weight+' '+size+'px Arial, Helvetica, sans-serif';
    lines=wrap(ctx,text,width);
    if (lines.length <= maxLines && lines.length*size*lineHeight<=maxHeight) break;
    size-=3;
  }
  ctx.font=weight+' '+size+'px Arial, Helvetica, sans-serif';
  ctx.fillStyle=color;ctx.textBaseline='top';
  lines=wrap(ctx,text,width);
  const visible=lines.slice(0, Math.min(maxLines,Math.floor(maxHeight/(size*lineHeight))));
  if (visible.length < lines.length && visible.length) {
    let tail=visible[visible.length-1];
    while(tail && ctx.measureText(tail+'…').width>width)tail=tail.slice(0,-1);
    visible[visible.length-1]=tail+'…';
  }
  visible.forEach((line,i)=>ctx.fillText(line,x,y+i*size*lineHeight));
  return y+visible.length*size*lineHeight;
}
function background(ctx, index, photo) {
  const bg=ctx.createLinearGradient(0,0,SLIDE_WIDTH,SLIDE_HEIGHT);
  bg.addColorStop(0,'#202a34');bg.addColorStop(.55,'#0c121b');bg.addColorStop(1,'#080d14');
  ctx.fillStyle=bg;ctx.fillRect(0,0,SLIDE_WIDTH,SLIDE_HEIGHT);
  ctx.save();
  if (photo && index===0) {
    const scale=Math.max(SLIDE_WIDTH/photo.width, SLIDE_HEIGHT/photo.height);
    const w=photo.width*scale,h=photo.height*scale;
    ctx.drawImage(photo,(SLIDE_WIDTH-w)/2,(SLIDE_HEIGHT-h)/2,w,h);
    const shade=ctx.createLinearGradient(0,100,0,SLIDE_HEIGHT);
    shade.addColorStop(0,'rgba(5,9,13,.50)');
    shade.addColorStop(.4,'rgba(5,9,13,.72)');
    shade.addColorStop(1,'rgba(3,6,11,.96)');
    ctx.fillStyle=shade;ctx.fillRect(0,0,SLIDE_WIDTH,SLIDE_HEIGHT);
  } else {
    ctx.strokeStyle='rgba(214,175,104,.18)';ctx.lineWidth=3;
    for(let i=0;i<8;i++){
      ctx.beginPath();ctx.moveTo(SLIDE_WIDTH+i*84,140);ctx.lineTo(-340+i*84,SLIDE_HEIGHT);ctx.stroke();
    }
    ctx.strokeStyle='rgba(232,239,243,.07)';ctx.lineWidth=7;
    for(let i=0;i<4;i++){ctx.strokeRect(450-i*96,280+i*110,850,640);}
    ctx.fillStyle='rgba(213,173,101,.055)';
    ctx.beginPath();ctx.ellipse(915,1060,540,700,-.4,0,2*Math.PI);ctx.fill();
  }
  ctx.restore();
}
export function drawTikTokSlide(canvas, slide, index, total, photo=null) {
  if(!canvas || !slide)return;
  canvas.width=SLIDE_WIDTH;canvas.height=SLIDE_HEIGHT;
  const ctx=canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas export is not supported by this browser.');
  background(ctx,index,photo);
  const gold='#d8b77a';
  ctx.fillStyle=gold;ctx.fillRect(0,0,SLIDE_WIDTH,17);
  ctx.fillStyle='#fff';ctx.font='800 40px Arial, Helvetica, sans-serif';ctx.textBaseline='top';
  ctx.fillText('FIGHT DESK',74,108);
  ctx.fillStyle=gold;ctx.font='700 26px Arial, Helvetica, sans-serif';ctx.fillText('BOXING   /   ANALYSIS',75,178);
  ctx.strokeStyle='rgba(238,241,243,.30)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(74,260);ctx.lineTo(1006,260);ctx.stroke();
  ctx.fillStyle=gold;ctx.font='700 30px Arial, Helvetica, sans-serif';
  const label=String(slide.label||'THE STORY').toUpperCase().slice(0,56);
  typography(ctx,label,{x:74,y:345,width:920,maxHeight:155,startSize:31,minSize:23,weight:750,color:gold,maxLines:3});
  let cursor;
  if (slide.kind==='cover') {
    cursor=typography(ctx,slide.heading,{x:74,y:535,width:924,maxHeight:855,startSize:100,minSize:60,lineHeight:1.13,weight:900,maxLines:10});
    ctx.fillStyle=gold;ctx.fillRect(75,Math.min(cursor+78,1518),205,8);
  } else {
    cursor=typography(ctx,slide.heading || 'INSIDE THE FIGHT',{x:74,y:523,width:920,maxHeight:300,startSize:68,minSize:48,weight:900,maxLines:4});
    cursor=Math.max(cursor+75,840);
    typography(ctx,slide.body,{x:74,y:cursor,width:915,maxHeight:740,startSize:57,minSize:38,weight:550,lineHeight:1.28,maxLines:15});
  }
  ctx.strokeStyle='rgba(240,240,240,.34)';ctx.beginPath();ctx.moveTo(74,1720);ctx.lineTo(1006,1720);ctx.stroke();
  ctx.fillStyle='#e7e8e9';ctx.font='750 31px Arial, Helvetica, sans-serif';ctx.fillText('THE STORY BEHIND THE HEADLINE',75,1761);
  ctx.fillStyle=gold;ctx.textAlign='right';ctx.fillText(String(index+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),1000,1824);
  ctx.textAlign='left';
}
export function canvasPng(canvas) {
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed.')),'image/png'));
}
