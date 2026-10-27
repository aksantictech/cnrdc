let initialization;
function application(){
 if(!initialization)initialization=(async()=>{process.env.CARTO_NO_LISTEN='1';const {app}=await import('../server.mjs');await app.ready();return{app}})().catch(error=>{initialization=null;throw error});
 return initialization;
}
export default async function handler(req,res){
 try{const url=new URL(req.url,'https://cnrdc.vercel.app');const route=url.searchParams.get('__route');url.searchParams.delete('__route');if(route!==null&&!url.pathname.startsWith('/api/v1/'))url.pathname='/api/v1/'+route;req.url=url.pathname+(url.searchParams.size?'?'+url.searchParams:'');const{app}=await application();await new Promise((resolve,reject)=>{res.once('finish',resolve);res.once('error',reject);app.server.emit('request',req,res)})}
 catch(error){console.error('Carto-CNS: requête interrompue',{code:error.code,message:error.message});if(!res.headersSent){res.statusCode=503;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({message:'Le service est momentanément indisponible. Réessayez dans un instant.'}))}else res.end()}
}
