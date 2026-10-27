[CmdletBinding()]
param([switch]$Demo)
$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
$pg=Join-Path $PSScriptRoot '.local/runtime/pgsql/bin'
$node=Join-Path $PSScriptRoot '.local/runtime/node/node.exe'
if(-not(Test-Path $node)){$node=(Get-Command node).Source}
if(-not(Test-Path "$pg/initdb.exe")){throw 'Runtime PostgreSQL/PostGIS absent.'}
if(-not(Test-Path '.local/bootstrap.json')){
 & $node -e "const fs=require('fs'),c=require('crypto'),p=require('path');const db=c.randomBytes(32).toString('hex'),owner=c.randomBytes(32).toString('hex'),admin=c.randomBytes(18).toString('base64url');const b={ownerUrl:'postgresql://carto_owner:'+owner+'@127.0.0.1:55435/carto_cns',databasePassword:db,adminId:c.randomUUID(),adminEmail:'admin@carto-cns.local',adminPassword:admin};fs.writeFileSync('.local/bootstrap.json',JSON.stringify(b));fs.writeFileSync('.local/owner-password.txt',owner);fs.writeFileSync('.local/ACCES_LOCAL.txt','Carto-CNS : http://localhost:5190\nCompte : '+b.adminEmail+'\nMot de passe : '+admin+'\n');fs.writeFileSync('.env','DATABASE_URL=postgresql://carto_app:'+db+'@127.0.0.1:55435/carto_cns\nJWT_SECRET='+c.randomBytes(48).toString('hex')+'\nPORT=5190\nHOST=127.0.0.1\nAPP_ORIGIN=http://localhost:5190\n')"
 if($LASTEXITCODE -ne 0){throw 'Création de configuration impossible.'}
 $identity=[System.Security.Principal.WindowsIdentity]::GetCurrent().Name
 icacls .local /inheritance:r /grant:r "${identity}:(OI)(CI)F" 'SYSTEM:(OI)(CI)F' /Q | Out-Null
 icacls .env /inheritance:r /grant:r "${identity}:F" 'SYSTEM:F' /Q | Out-Null
}
if(-not(Test-Path '.local/pgdata/PG_VERSION')){
 & "$pg/initdb.exe" -D .local/pgdata -U carto_owner -A scram-sha-256 --pwfile .local/owner-password.txt --encoding=UTF8 --locale=C
 if($LASTEXITCODE -ne 0){throw 'Initialisation PostgreSQL impossible.'}
}
& "$pg/pg_ctl.exe" -D .local/pgdata status *> $null
if($LASTEXITCODE -ne 0){
 & "$pg/pg_ctl.exe" -D .local/pgdata -l .local/postgres.log -o '-h 127.0.0.1 -p 55435' start
 if($LASTEXITCODE -ne 0){throw 'Démarrage PostgreSQL impossible.'}
}
$bootstrap=Get-Content .local/bootstrap.json -Raw | ConvertFrom-Json
$env:PGPASSWORD=Get-Content .local/owner-password.txt -Raw
$exists=& "$pg/psql.exe" -h 127.0.0.1 -p 55435 -U carto_owner -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='carto_cns'"
if($exists -ne '1'){& "$pg/createdb.exe" -h 127.0.0.1 -p 55435 -U carto_owner carto_cns;if($LASTEXITCODE -ne 0){throw 'Création base impossible.'}}
Remove-Item Env:PGPASSWORD
& $node server/migrate.mjs
if($LASTEXITCODE -ne 0){throw 'Migration Carto-CNS impossible.'}
if($Demo){& $node server/seed-demo.mjs;if($LASTEXITCODE -ne 0){throw 'Démonstration non initialisée.'}}
Write-Output 'Carto-CNS installé. Identifiants dans .local/ACCES_LOCAL.txt.'

