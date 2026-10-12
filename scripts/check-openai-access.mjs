/**
 * Secure, low-cost OpenAI API preflight for the AURA automated newsroom.
 * Never logs the secret token or request headers.
 */
const key=process.env.OPENAI_API_KEY;
const model=process.env.AURA_AI_MODEL||'gpt-5-mini';
if(!key) {
 console.error('AURA_API_CHECK: MISSING_SECRET — add OPENAI_API_KEY in GitHub Actions repository secrets.');
 process.exit(1);
}
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),20000);
try{
 const response=await fetch('https://api.openai.com/v1/responses',{
  method:'POST',
  headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
  body:JSON.stringify({model,input:'Respond with OK.',max_output_tokens:25}),
  signal:controller.signal
 });
 if(!response.ok){
  const body=await response.json().catch(()=>({}));
  const code=String(body.error?.code||body.error?.type||'unknown').slice(0,80);
  const guidance=response.status===401?'Invalid or revoked key':response.status===403?'API project permission denied':response.status===429?'Quota or rate limit: check OpenAI API billing and project limits':response.status===404?'Model not available to this API project':'Check OpenAI API access and model permissions';
  console.error('AURA_API_CHECK: FAILED HTTP '+response.status+' code='+code+'; '+guidance);
  process.exitCode=1;
 }else{
  console.log('AURA_API_CHECK: PASS — authentication, model access, and a small text-generation request worked.');
 }
}catch(error){
 console.error('AURA_API_CHECK: ERROR — '+(error.name==='AbortError'?'Timeout contacting API':'Network or request failure'));
 process.exitCode=1;
}finally{clearTimeout(timeout)}
