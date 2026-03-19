@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
cd /d "%ROOT%"

rem Change BACKUP_REMOTE if you add a dedicated source backup remote later.
set "BACKUP_REMOTE=origin"
rem Leave empty to push the current branch.
set "BACKUP_BRANCH="

set "HEXO_CMD=%ROOT%node_modules\.bin\hexo.cmd"
if exist "%HEXO_CMD%" (
  set "USE_LOCAL_HEXO=1"
) else (
  set "HEXO_CMD=hexo"
  where hexo >nul 2>&1
  if errorlevel 1 (
    echo [ERROR] hexo was not found. Install dependencies or add hexo to PATH.
    exit /b 1
  )
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] This script must be run inside a Git repository.
  exit /b 1
)

set "HAS_CONFLICTS="
for /f "delims=" %%i in ('git diff --name-only --diff-filter=U') do set "HAS_CONFLICTS=1"
if defined HAS_CONFLICTS (
  echo [ERROR] Unresolved merge conflicts were detected. Resolve them before deploy.
  exit /b 1
)

for /f "delims=" %%i in ('git branch --show-current') do set "CURRENT_BRANCH=%%i"
if not defined CURRENT_BRANCH (
  echo [ERROR] Could not detect the current Git branch.
  exit /b 1
)

if not defined BACKUP_BRANCH set "BACKUP_BRANCH=%CURRENT_BRANCH%"

git remote get-url "%BACKUP_REMOTE%" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Backup remote "%BACKUP_REMOTE%" does not exist.
  echo         Edit BACKUP_REMOTE in deploy.bat and try again.
  exit /b 1
)

echo [STEP] hexo clean
call :run_hexo clean
if errorlevel 1 exit /b 1

echo [STEP] hexo g
call :run_hexo g
if errorlevel 1 exit /b 1

echo [STEP] hexo d
call :run_hexo d
if errorlevel 1 exit /b 1

echo [STEP] git add -A
git add -A
if errorlevel 1 (
  echo [ERROR] git add failed.
  exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
  for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd HH:mm:ss')"`) do set "NOW=%%i"
  if not defined NOW set "NOW=%date% %time%"
  set "COMMIT_MESSAGE=chore: backup source !NOW!"

  echo [STEP] git commit
  git commit -m "!COMMIT_MESSAGE!"
  if errorlevel 1 (
    echo [ERROR] git commit failed.
    exit /b 1
  )
) else (
  echo [INFO] No local changes to commit.
)

echo [STEP] git push %BACKUP_REMOTE% HEAD:%BACKUP_BRANCH%
git push "%BACKUP_REMOTE%" "HEAD:%BACKUP_BRANCH%"
if errorlevel 1 (
  echo [ERROR] git push failed.
  exit /b 1
)

echo [DONE] Deploy and source backup finished.
exit /b 0

:run_hexo
if defined USE_LOCAL_HEXO (
  call "%HEXO_CMD%" %~1
) else (
  call hexo %~1
)

if errorlevel 1 (
  echo [ERROR] hexo %~1 failed.
  exit /b 1
)

exit /b 0
