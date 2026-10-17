// Short-lived, in-memory handoff from the automatic producer to the editing route.
// Necessary on iOS/WebKit where large File objects can fail IndexedDB structured-clone.
// Never persists across reloads. The original ZIP remains the durable backup.
let staged=null;
export function stageAutomaticEdit({slug,assets,cuts,script,voice=null,storageFailed=false}){
 if(!slug||!Array.isArray(assets)||!Array.isArray(cuts))throw Error('Invalid automatic edit handoff.');
 const bytes=assets.reduce((n,a)=>n+(a.file?.size||0),0);
 if(bytes>185*1024*1024)throw Error('This project is too large for in-memory iPhone editing.');
 staged={slug,assets,cuts,script:String(script||''),voice,storageFailed,
   stagedAt:Date.now()};
}
export function consumeAutomaticEdit(slug){
 if(!staged||staged.slug!==slug)return null;
 const value=staged;staged=null;return value;
}
