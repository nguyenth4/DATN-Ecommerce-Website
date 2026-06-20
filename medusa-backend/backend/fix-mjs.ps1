$targetDirs = @(
    "d:\DATN\DATN-Ecommerce-Website\medusa-backend\backend\node_modules\react-aria",
    "d:\DATN\DATN-Ecommerce-Website\medusa-backend\backend\node_modules\react-stately",
    "d:\DATN\DATN-Ecommerce-Website\medusa-backend\backend\node_modules\@react-aria",
    "d:\DATN\DATN-Ecommerce-Website\medusa-backend\backend\node_modules\@react-stately",
    "d:\DATN\DATN-Ecommerce-Website\medusa-backend\backend\node_modules\@internationalized",
    "d:\DATN\DATN-Ecommerce-Website\medusa-backend\backend\node_modules\@medusajs"
)

foreach ($dir in $targetDirs) {
    if (Test-Path $dir) {
        Write-Host "Processing $dir..."
        Get-ChildItem -Path $dir -Recurse -Filter *.js | ForEach-Object {
            $jsPath = $_.FullName
            $mjsPath = $jsPath -replace '\.js$', '.mjs'
            if (!(Test-Path $mjsPath)) {
                Copy-Item -Path $jsPath -Destination $mjsPath -Force
            }
        }
    }
}
Write-Host "Done!"
