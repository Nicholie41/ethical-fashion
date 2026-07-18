# One-time setup: signs you into GitHub, creates repo, pushes code.
$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

$repo = "ethical-fashion"
$owner = "Nicholie41"
$root = "D:\DOWNLOADS\ETHICAL"
$git = "git -c safe.directory=$root"

Set-Location $root

Write-Host "Checking GitHub login..." -ForegroundColor Cyan
$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Sign in to GitHub in your browser (one time only)..." -ForegroundColor Yellow
  gh auth login -h github.com -p https -w
}

Write-Host "Creating repo $owner/$repo on GitHub..." -ForegroundColor Cyan
gh repo create $repo --public --source=. --remote=origin --push 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Repo may already exist — pushing to origin..." -ForegroundColor Yellow
  Invoke-Expression "$git remote remove origin" 2>$null
  Invoke-Expression "$git remote add origin https://github.com/$owner/$repo.git"
  Invoke-Expression "$git branch -M main"
  Invoke-Expression "$git push -u origin main"
}

Write-Host "Done! Open: https://github.com/$owner/$repo" -ForegroundColor Green
