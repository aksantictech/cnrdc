[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
Set-Location $PSScriptRoot
$pg=Join-Path $PSScriptRoot '.local/runtime/pgsql/bin'
$node=Join-Path $PSScriptRoot '.local/runtime/node/node.exe'
if(-not(Test-Path $node)){$node=(Get-Command node).Source}
if(-not(Test-Path '.env')){throw 'Lancer Installer-Carto-CNS.ps1 avant le premier démarrage.'}
& "$pg/pg_ctl.exe" -D .local/pgdata status *> $null
if($LASTEXITCODE -ne 0){& "$pg/pg_ctl.exe" -D .local/pgdata -l .local/postgres.log -o '-h 127.0.0.1 -p 55435' start;if($LASTEXITCODE -ne 0){throw 'PostgreSQL indisponible.'}}
Write-Host 'Carto-CNS : http://localhost:5190'
Write-Host 'Garder cette fenêtre ouverte. Ctrl+C pour arrêter l application.'
& $node --env-file=.env server/index.mjs

