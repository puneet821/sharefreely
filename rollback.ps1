# Rollback Script
# This script reverts the project state to the previous git commit

Write-Host "Checking current Git status..." -ForegroundColor Cyan

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "Warning: You have uncommitted changes. Please commit or stash them before rolling back." -ForegroundColor Yellow
    exit
}

Write-Host "Rolling back to the previous version..." -ForegroundColor Cyan

# Revert to the previous commit locally
git reset --hard HEAD~1

# Push the rollback to the remote repository
Write-Host "Updating the GitHub repository..." -ForegroundColor Cyan
git push origin main --force

Write-Host "Successfully rolled back to the previous version!" -ForegroundColor Green
