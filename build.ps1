param (
    [Parameter(Mandatory = $true)]$source,
    [Parameter(Mandatory = $true)][string]$output
)

$Cwd = Get-Location

$FullSrc = Join-Path -Path $Cwd.Path -ChildPath $source
$FullDst = Join-Path -Path $Cwd.Path -ChildPath $output

if (Test-Path $FullDst) {
    Remove-Item -Recurse -Force -Path $FullDst | out-null
}

$FullSrc = $FullSrc.TrimEnd('\').TrimEnd('/')
$FullDst = $FullDst.TrimEnd('\').TrimEnd('/')

Set-Location $FullSrc

New-Item -ItemType Directory -Force -Path $FullDst | out-null

npx tsc

Write-Host "copy js, html, css, and public folder"
# copy js, html, css, and public folder
Get-ChildItem -Path $FullSrc -Recurse | Where-Object { !$_.FullName.Contains("dist") -and !$_.FullName.Contains("node_modules") -and ($_.Extension -eq ".js" -or ($_.BaseName -eq "index" -and !($_.Extension -eq ".ts")) -or (Split-Path -Path (Split-Path -Path $_.FullName -Parent) -Leaf).Contains("public")) }  | ForEach-Object {
    $sourceFile = $_.FullName
    $destFile = $_.FullName.Replace($FullSrc, $FullDst)
    $destDir = Split-Path -parent $destFile
    New-Item -ItemType Directory -Force -Path $destDir | out-null
    Copy-Item -Path $sourceFile -Destination $destFile
}

Write-Host "compile to a <script> containing a self-executing function ('iife')"
# compile to a <script> containing a self-executing function ('iife')
Get-ChildItem -Path $FullDst -Recurse | Where-Object { $_.BaseName -eq "index" -and $_.Extension -eq ".js" }  | ForEach-Object {
    $BundleName = Join-Path -Path $_.DirectoryName -ChildPath 'bundle.js'
    npx rollup $_.FullName --file $BundleName --format iife
}

Write-Host "Remove local JS files"
# Remove local JS files
Get-ChildItem -Path $FullSrc -Recurse | Where-Object { !$_.FullName.Contains("dist") -and !$_.FullName.Contains("node_modules") -and $_.Extension -eq ".js" }  | ForEach-Object { Remove-Item $_.FullName }

Write-Host "Remove non bundle.js in dist"
# Remove non bundle.js in dist
Get-ChildItem -Path $FullDst -Recurse | Where-Object { $_.Extension -eq ".js" -and !($_.BaseName -eq "bundle") }  | ForEach-Object { Remove-Item $_.FullName }

Write-Host "Tidy up empty directories"
# Tidy up empty directories
$tailRecursion = {
    param(
        $Path
    )
    foreach ($childDirectory in Get-ChildItem -Force -LiteralPath $Path -Directory) {
        & $tailRecursion -Path $childDirectory.FullName
    }
    $currentChildren = Get-ChildItem -Force -LiteralPath $Path
    $isEmpty = $currentChildren -eq $null
    if ($isEmpty) {
        #Write-Verbose "Removing empty folder at path '${Path}'." -Verbose
        Remove-Item -Force -LiteralPath $Path
    }
}

& $tailRecursion -Path $FullDst

Write-Host "Build complete"