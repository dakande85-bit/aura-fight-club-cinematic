// Pure browser export policy: keep mobile editing reliable before offering 1080p jobs.
// FFmpeg/WASM is very memory-intensive on iPhone/iPad; heavy rendering belongs in a cloud worker.
export function mobileDevice(userAgent=''){
 return /iPhone|iPad|iPod|Android.*Mobile|Mobile.*Android/i.test(userAgent);
}
export function exportProfile(format='shorts',userAgent=''){
 if(!['shorts','youtube'].includes(format))throw new Error('Unsupported video aspect ratio.');
 const mobile=mobileDevice(userAgent);
 const width=mobile?(format==='shorts'?360:640):(format==='shorts'?540:960);
 const height=mobile?(format==='shorts'?640:360):(format==='shorts'?960:540);
 return {
  format,mobile,width,height,fps:mobile?18:24,
  sourceLimit:mobile?45*1024*1024:180*1024*1024,
  durationLimit:mobile?30:90,
  cutLimit:mobile?8:22,
 };
}
export function checkExport(cuts,assets,format='shorts',userAgent=''){
 const profile=exportProfile(format,userAgent);
 if(!Array.isArray(cuts)||cuts.length===0)throw new Error('The timeline is empty. Add real footage and assemble your video.');
 if(cuts.length>profile.cutLimit)throw new Error('This browser can export at most '+profile.cutLimit+' clips per job. Remove scenes or use a desktop computer.');
 const sources=new Map(assets.map(a=>[a.id,a]));
 const used=new Set();
 let seconds=0;
 for(const [i,cut] of cuts.entries()){
  const source=sources.get(cut.assetId);
  if(!source?.file)throw new Error('Scene '+(i+1)+' is missing its original video. Reattach it first.');
  if(!source.rightsReviewed)throw new Error('Review the footage usage for '+source.title+' before exporting.');
  const begin=Number(cut.start),length=Number(cut.duration);
  if(!Number.isFinite(begin)||!Number.isFinite(length)||begin<0||length<0.2||begin+length>source.duration+0.05)
   throw new Error('Scene '+(i+1)+' extends beyond the real video. Adjust its starting time or length.');
  used.add(source.id);seconds+=length;
 }
 if(seconds>profile.durationLimit+.1)throw new Error('The '+Math.round(seconds)+' second edit is too heavy for this browser. Try a '+profile.durationLimit+'-second export or use desktop.');
 const bytes=[...used].reduce((total,id)=>total+(sources.get(id)?.file?.size||0),0);
 if(bytes>profile.sourceLimit)throw new Error('The source videos are too large for this browser ('+Math.round(bytes/1048576)+' MB). Trim the originals or use desktop.');
 return {...profile,seconds:Math.round(seconds*100)/100,sourceBytes:bytes};
}
export function videoFilter(profile){
 const {width:w,height:h,fps}=profile;
 // Native scale/pad is much cheaper than splitting and blurring each frame.
 return 'scale='+w+':'+h+':force_original_aspect_ratio=decrease,'+
  'pad='+w+':'+h+':(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps='+fps+',format=yuv420p';
}
