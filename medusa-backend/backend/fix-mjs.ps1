$basePath = "$PSScriptRoot\node_modules"

$targetDirs = @(
    "$basePath\react-aria",
    "$basePath\react-stately",
    "$basePath\@react-aria",
    "$basePath\@react-stately",
    "$basePath\@internationalized",
    "$basePath\date-fns",
    "$basePath\motion"
)

foreach ($dir in $targetDirs) {
    if (Test-Path $dir) {
        Write-Host "Processing $dir..."
        # Get ALL .js files recursively (including subdirectories)
        Get-ChildItem -Path $dir -Recurse -Filter *.js | ForEach-Object {
            $jsPath = $_.FullName
            $mjsPath = $jsPath -replace '\.js$', '.mjs'
            if (!(Test-Path $mjsPath)) {
                Copy-Item -Path $jsPath -Destination $mjsPath -Force
            }
        }
    } else {
        Write-Host "Skipping (not found): $dir"
    }
}
Write-Host "Done!"
