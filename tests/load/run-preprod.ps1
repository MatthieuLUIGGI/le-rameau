param(
    [ValidateSet('smoke', 'demo', 'load')]
    [string]$Profile = 'smoke',
    [string]$ConfigFile = (Join-Path $PSScriptRoot 'config.local.json')
)

$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$k6Command = Get-Command k6 -ErrorAction SilentlyContinue
if (-not $k6Command) { throw 'k6 est introuvable. Verifie d abord que k6 version fonctionne dans ce terminal.' }
if (-not (Test-Path -LiteralPath $ConfigFile -PathType Leaf)) {
    throw 'Copie tests/load/config.example.json vers tests/load/config.local.json puis renseigne Supabase et un compte resident de test. Ce fichier local est ignore par Git.'
}
$resolvedConfig = (Resolve-Path -LiteralPath $ConfigFile).Path
$settings = Get-Content -Raw -LiteralPath $resolvedConfig | ConvertFrom-Json
if (-not $settings.supabaseUrl -or -not $settings.supabaseAnonKey -or -not $settings.accounts) {
    throw 'Il manque supabaseUrl, supabaseAnonKey ou accounts dans la configuration locale.'
}

$variables = @('PROFILE', 'K6_CONFIG_FILE', 'K6_VERSION', 'K6_LOCAL_COMMIT', 'REPORT_PREFIX')
$previous = @{}
foreach ($variable in $variables) { $previous[$variable] = [Environment]::GetEnvironmentVariable($variable, 'Process') }
$result = 1
Push-Location -LiteralPath $projectRoot
try {
    $env:PROFILE = $Profile
    $env:K6_CONFIG_FILE = $resolvedConfig
    $env:K6_VERSION = (& $k6Command.Source version | Out-String).Trim()
    $gitCommand = Get-Command git -ErrorAction SilentlyContinue
    if ($gitCommand) { $env:K6_LOCAL_COMMIT = (& $gitCommand.Source rev-parse --short HEAD | Out-String).Trim() }
    $reportDirectory = Join-Path $PSScriptRoot 'results'
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
    $env:REPORT_PREFIX = Join-Path $reportDirectory ('preprod-{0}-{1}' -f $Profile, (Get-Date -Format 'yyyyMMdd-HHmmss'))
    Write-Host "Profil : $Profile. Les rapports seront dans tests/load/results."
    & $k6Command.Source run (Join-Path $PSScriptRoot 'preprod.k6.js')
    $result = $LASTEXITCODE
    if ($result -eq 0) { Write-Host 'Execution terminee. Ouvre le rapport HTML pour interpreter les mesures.' }
    else { Write-Warning 'Objectif non atteint ou configuration incomplete. Lire les messages et le rapport avant de relancer.' }
}
finally {
    foreach ($variable in $variables) { [Environment]::SetEnvironmentVariable($variable, $previous[$variable], 'Process') }
    Pop-Location
}
$global:LASTEXITCODE = $result
if ($result -ne 0) { throw "Le test k6 n est pas valide (code $result). Consulter les messages et les rapports." }
