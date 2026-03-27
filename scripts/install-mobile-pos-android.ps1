param(
    [string]$Framework = "net9.0-android"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$env:DOTNET_CLI_HOME = Join-Path $root ".dotnet"
$env:HOME = $env:DOTNET_CLI_HOME

Write-Host "Verification du terminal Android via adb..." -ForegroundColor Cyan
adb devices

Write-Host "Installation de D_Show POS Mobile sur le terminal..." -ForegroundColor Cyan
dotnet build (Join-Path $root "apps\mobile-pos\DShow.PosMobile.csproj") -f $Framework -t:Install
