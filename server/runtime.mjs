import pg from 'pg';import{readFileSync}from'node:fs';
const identifier=(value,fallback)=>{const id=value||fallback;if(!/^[a-z_][a-z0-9_]*$/.test(id))throw Error('Identifiant de schéma invalide.');return id};
export const databaseSchema=identifier(process.env.DATABASE_SCHEMA,'public');
export const postgisSchema=identifier(process.env.POSTGIS_SCHEMA,'public');
export const cloud=process.env.VERCEL==='1'||process.env.DEPLOYMENT_TARGET==='vercel';
export function poolConfig(url=process.env.DATABASE_URL){
 if(!url)throw Error('DATABASE_URL manquant.');
 const u=new URL(url),local=['localhost','127.0.0.1','::1','database'].includes(u.hostname),supabaseHost=u.hostname.endsWith('.pooler.supabase.com')||u.hostname.endsWith('.supabase.co');
 const ca=process.env.DATABASE_CA?.replaceAll('\\n','\n')||(supabaseHost?readFileSync(new URL('./certs/supabase-ca.crt',import.meta.url),'utf8'):undefined);
 const sslMode=u.searchParams.get('sslmode');for(const key of ['sslmode','sslrootcert','sslcert','sslkey'])u.searchParams.delete(key);
 return{connectionString:u.toString(),max:cloud?3:12,idleTimeoutMillis:10000,connectionTimeoutMillis:15000,...(!local||sslMode==='require'?{ssl:{rejectUnauthorized:true,...(ca?{ca}:{})}}:{})};
}
export const createPool=url=>new pg.Pool(poolConfig(url));
export function allowedOrigins(){const values=[process.env.APP_ORIGIN,...(process.env.ADDITIONAL_ORIGINS||'').split(','),...(cloud?[process.env.VERCEL_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(v=>'https://'+v):[`http://localhost:${process.env.PORT||5190}`,`http://127.0.0.1:${process.env.PORT||5190}`])].filter(Boolean);return new Set(values.map(v=>{const u=new URL(v);if(cloud&&u.protocol!=='https:')throw Error('HTTPS requis en ligne.');return u.origin}))}
