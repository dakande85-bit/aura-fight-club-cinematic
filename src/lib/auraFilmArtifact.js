import JSZip from 'jszip';

const MAX_ARCHIVE=100*1024*1024;
const MAX_VIDEO=90*1024*1024;
const MAX_REPORT=5*1024*1024;

function findFile(zip,name){
 return Object.values(zip.files).find(file=>!file.dir&&file.name.split('/').pop()===name);
}
export function describeFilmReport(report){
 const status=String(report?.status||'unknown');
 if(status==='rough_cut_generated')return 'Rendered rough cut ready for review.';
 if(status==='needs_licensed_footage')return 'No usable licensed footage was available. No film was rendered.';
 if(status==='needs_script')return 'Narration needs to be revised to match the requested video length.';
 if(status==='render_failed')return 'Footage was found, but video rendering encountered an error.';
 return 'Production report available: '+status;
}
export async function inspectFilmArtifact(arrayBuffer){
 const buffer=arrayBuffer instanceof ArrayBuffer?arrayBuffer:arrayBuffer?.buffer;
 if(!buffer||buffer.byteLength<200||buffer.byteLength>MAX_ARCHIVE)
  throw Error('This video ZIP is empty or too large to preview in the browser. Download the archive instead.');
 const archive=await JSZip.loadAsync(buffer,{checkCRC32:true});
 const reportFile=findFile(archive,'production.json');
 if(!reportFile)throw Error('The automatic production archive is missing its editorial report.');
 if(reportFile._data?.uncompressedSize>MAX_REPORT)throw Error('Invalid oversized production report.');
 const report=JSON.parse(await reportFile.async('string'));
 const researchFile=findFile(archive,'youtube-research.json');
 let youtubeResearch=null;
 if(researchFile){
  if(researchFile._data?.uncompressedSize>MAX_REPORT)throw Error('Oversized YouTube research report.');
  youtubeResearch=JSON.parse(await researchFile.async('string'));
 }
 const movie=findFile(archive,'roughcut-youtube.mp4');
 if(!movie)return {report,youtubeResearch,video:null,videoName:null,description:describeFilmReport(report)};
 if(movie._data?.uncompressedSize>MAX_VIDEO)
  throw Error('This rough-cut is too large to preview on a phone. Download the video pack.');
 const bytes=await movie.async('uint8array');
 if(bytes.byteLength<10000 ||
    String.fromCharCode(...bytes.subarray(4,8))!=='ftyp')
   throw Error('The video output is not a valid MP4.');
 return {report,youtubeResearch,video:new Blob([bytes],{type:'video/mp4'}),
  videoName:movie.name.split('/').pop(),description:describeFilmReport(report)};
}

const MAX_EDITABLE_CLIPS=120;
const MAX_EDITABLE_TOTAL=185*1024*1024;

/**
 * Import the actual FFmpeg-produced, separately editable MP4 scene files.
 * The returned video bytes are backed by the local ZIP, not fake YouTube URLs.
 * Caller must not assume the original footage is approved for publication.
 */
export async function extractEditableFilmClips(input){
 const source=input instanceof ArrayBuffer?input:input?.buffer;
 if(!source||source.byteLength<200||source.byteLength>MAX_ARCHIVE)
  throw Error('The video edit pack is missing or too large for this browser.');
 const archive=await JSZip.loadAsync(source,{checkCRC32:true});
 const reportFile=findFile(archive,'production.json');
 if(!reportFile)throw Error('Missing film production report.');
 const report=JSON.parse(await reportFile.async('string'));
 if(report.status!=='rough_cut_generated')
  throw Error(describeFilmReport(report));
 const timelineFile=findFile(archive,'editable-timeline.json');
 if(!timelineFile)throw Error('This pack contains only a rendered video, not an editable scene timeline.');
 const timeline=JSON.parse(await timelineFile.async('string'));
 if(timeline.format!=='AURA-FILMROOM-EDIT-V1'||
     !Array.isArray(timeline.scenes)||timeline.scenes.length<1||
     timeline.scenes.length>MAX_EDITABLE_CLIPS)
   throw Error('The imported film timeline format is invalid.');
 let byteTotal=0;
 const clips=[];
 for(let i=0;i<timeline.scenes.length;i++){
   const shot=timeline.scenes[i];
   if(!/^editable-clips\/scene-[0-9]{3}\.mp4$/.test(shot?.localClip||''))
    throw Error('The film contains an invalid editable scene path.');
   const file=archive.file(shot.localClip);
   if(!file||file.dir)throw Error('An edited scene video is missing: '+shot.localClip);
   const predictedSize=Number(file._data?.uncompressedSize)||0;
   if(predictedSize>MAX_VIDEO||byteTotal+predictedSize>MAX_EDITABLE_TOTAL)
    throw Error('The edit pack contains too much video for on-device storage. Download the ZIP and edit on desktop.');
   const bytes=await file.async('uint8array');
   byteTotal+=bytes.byteLength;
   if(bytes.byteLength<512||
       String.fromCharCode(...bytes.subarray(4,8))!=='ftyp')
     throw Error('An editable scene is not a playable MP4: '+shot.localClip);
   const duration=Number(shot.shotSeconds);
   if(!Number.isFinite(duration)||duration<.15||duration>12)
     throw Error('An editable scene contains an invalid cut duration.');
   clips.push({
      scene:i+1,blob:new Blob([bytes],{type:'video/mp4'}),
      filename:shot.localClip.split('/').pop(),
      duration,kind:shot.role==='weighin'?'faceoff':
       shot.role==='press'?'press':shot.role==='fight'?'fight':'broll',
      narration:String(shot.narration||''),
      referenceUrl:String(shot.sourceUrl||''),
      title:String(shot.title||'Auto-edited scene '+(i+1)),
      illustrative:Boolean(shot.illustrative),
      rightsReviewed:false
   });
 }
 return {clips,report,timeline};
}
