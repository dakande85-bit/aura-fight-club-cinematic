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
 const movie=findFile(archive,'roughcut-youtube.mp4');
 if(!movie)return {report,video:null,videoName:null,description:describeFilmReport(report)};
 if(movie._data?.uncompressedSize>MAX_VIDEO)
  throw Error('This rough-cut is too large to preview on a phone. Download the video pack.');
 const bytes=await movie.async('uint8array');
 if(bytes.byteLength<10000 ||
    String.fromCharCode(...bytes.subarray(4,8))!=='ftyp')
   throw Error('The video output is not a valid MP4.');
 return {report,video:new Blob([bytes],{type:'video/mp4'}),
  videoName:movie.name.split('/').pop(),description:describeFilmReport(report)};
}
