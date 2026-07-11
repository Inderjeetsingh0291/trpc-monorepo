if (Test-Path ".env") {
    Write-Host ".env file exists. ✅"
} else {
    Write-Host ".env file does not exist."
    Copy-Item ".env.example" ".env"
}

$dirs = Get-ChildItem -Directory -Path "apps\*","packages\*" -ErrorAction SilentlyContinue
foreach ($dir in $dirs) {
    $target = Join-Path $dir.FullName ".env"
    if (-not (Test-Path $target)) {
        New-Item -ItemType HardLink -Path $target -Target (Resolve-Path ".env").Path | Out-Null
    }
}
Write-Host "Setup complete."
