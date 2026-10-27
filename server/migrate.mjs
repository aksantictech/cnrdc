import pg from 'pg';import {readFile,writeFile} from 'node:fs/promises';import {randomUUID,randomBytes} from 'node:crypto';import {hashPassword} from './domain.mjs';
const bootstrap=process.env.SETUP_DATABASE_URL?{ownerUrl:process.env.SETUP_DATABASE_URL,databasePassword:process.env.PG_APP_PASSWORD,adminId:randomUUID(),adminEmail:process.env.ADMIN_EMAIL,adminPassword:process.env.ADMIN_PASSWORD}:JSON.parse(await readFile(new URL('../.local/bootstrap.json',import.meta.url),'utf8'));
if(!bootstrap.databasePassword||!bootstrap.adminEmail||!bootstrap.adminPassword||bootstrap.adminPassword.length<12)throw Error('Secrets d’initialisation incomplets.');
const owner=new pg.Pool({connectionString:bootstrap.ownerUrl});
await owner.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
await owner.query(await readFile(new URL('./administration.sql',import.meta.url),'utf8'));
await owner.query(await readFile(new URL('./cloud.sql',import.meta.url),'utf8'));
const role=await owner.query("SELECT 1 FROM pg_roles WHERE rolname='carto_app'");if(!role.rowCount)await owner.query("CREATE ROLE carto_app LOGIN PASSWORD '"+bootstrap.databasePassword.replaceAll("'","''")+"'");
await owner.query('GRANT CONNECT ON DATABASE carto_cns TO carto_app; GRANT USAGE ON SCHEMA public TO carto_app; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO carto_app; GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO carto_app; REVOKE CREATE ON SCHEMA public FROM PUBLIC');
const users=(await owner.query('SELECT count(*)::int n FROM users')).rows[0].n;
if(!users){await owner.query('INSERT INTO users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)',[bootstrap.adminId,'Équipe PNCNS',bootstrap.adminEmail,hashPassword(bootstrap.adminPassword),'ADMIN']);}
await owner.query('REVOKE UPDATE,DELETE,TRUNCATE ON audit_log FROM carto_app');
console.log('Schéma PostgreSQL/PostGIS prêt ; rôle applicatif sans privilège de création de schéma.');
await owner.end();
