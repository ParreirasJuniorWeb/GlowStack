$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDir = Join-Path $root "frontend"
$backupDir = Join-Path $root ".backup-test"
$restoreDir = Join-Path $root ".restore-test"
$zipPath = Join-Path $backupDir "frontend-backup.zip"

if (-not (Test-Path $sourceDir)) {
  throw "Pasta de origem não encontrada: $sourceDir"
}

if (Test-Path $backupDir) { Remove-Item $backupDir -Recurse -Force }
if (Test-Path $restoreDir) { Remove-Item $restoreDir -Recurse -Force }

New-Item -ItemType Directory -Path $backupDir | Out-Null
New-Item -ItemType Directory -Path $restoreDir | Out-Null

Compress-Archive -Path (Join-Path $sourceDir "*") -DestinationPath $zipPath -Force
Expand-Archive -Path $zipPath -DestinationPath $restoreDir -Force

$criticalFiles = @(
  "package.json",
  "src/main.tsx",
  "src/App.tsx",
  "index.html"
)

$missing = @()
foreach ($file in $criticalFiles) {
  $restoredPath = Join-Path $restoreDir $file
  if (-not (Test-Path $restoredPath)) {
    $missing += $file
  }
}

$sourceCount = (Get-ChildItem -Path $sourceDir -Recurse -File).Count
$restoredCount = (Get-ChildItem -Path $restoreDir -Recurse -File).Count

if ($missing.Count -gt 0) {
  throw "Falha na restauração. Arquivos ausentes: $($missing -join ', ')"
}

if ($restoredCount -lt [Math]::Floor($sourceCount * 0.9)) {
  throw "Falha na restauração. Quantidade de arquivos restaurados muito baixa. Origem=$sourceCount Restaurado=$restoredCount"
}

Write-Output "Backup e restauração validados com sucesso."
Write-Output "Arquivos na origem: $sourceCount"
Write-Output "Arquivos restaurados: $restoredCount"
Write-Output "Zip gerado em: $zipPath"
