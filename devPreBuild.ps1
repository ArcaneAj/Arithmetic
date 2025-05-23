param (
    [Parameter(Mandatory = $true)]$source,
    [Parameter(Mandatory = $true)][string]$output
)

$Cwd = Get-Location

$FullSrc = Join-Path -Path $Cwd.Path -ChildPath $source

$FullSrc = $FullSrc.TrimEnd('\').TrimEnd('/')

Set-Location $FullSrc

# Insert the dev listener
Get-ChildItem -Path $FullSrc -Recurse | Where-Object { !$_.FullName.Contains("dist") -and !$_.FullName.Contains("node_modules") -and ($_.BaseName -eq "index" -and $_.Extension -eq ".ts") }  | ForEach-Object {
    $content = Get-Content -Path $_.FullName  -Encoding UTF8 -Raw
    $prefixed = "import { heartbeat } from 'f:/Dealer/client/dev'; heartbeat();" + $content
    [IO.File]::WriteAllText($_.FullName, $prefixed)
}
Write-Host "Pre-build complete"