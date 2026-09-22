@echo off
setlocal enabledelayedexpansion
rem ---------------------------------------------------------------------------
rem Hook launcher. Usage: run-hook.cmd <script-basename>
rem
rem Runs .github/hooks/scripts/<script-basename>.mjs under a node interpreter
rem that is actually known to work.
rem
rem Why this exists: hook commands are spawned through a shell, and if `node`
rem does not resolve the hook fails SILENTLY. Claude Code and Copilot both treat
rem a non-zero hook exit as "no decision" and carry on. That turns the entire
rem guard system into theatre while it still looks configured -- which is
rem exactly the state this repo was in (dead scoop entry on PATH, mise shims
rem erroring with "cannot find binary path").
rem
rem So: resolve node defensively, and if it genuinely cannot be found, say so
rem LOUDLY via systemMessage instead of exiting quietly.
rem ---------------------------------------------------------------------------

set "SCRIPT=%~dp0%~1.mjs"

if not exist "%SCRIPT%" (
  echo {"systemMessage":"[agentic-guard] hook script not found: %~1.mjs"}
  exit /b 0
)

set "NODE="

rem 1. Whatever is on PATH.
for %%N in (node.exe) do if not defined NODE set "NODE=%%~$PATH:N"

rem 2. Prove it runs. A mise shim can sit on PATH and still fail to resolve its
rem    own binary, so existence is not enough -- execute a no-op and check.
if defined NODE (
  "!NODE!" -e "" >nul 2>&1 || set "NODE="
)

rem 3. Fall back to known mise install roots, highest version first.
if not defined NODE (
  for %%R in ("%MISE_DATA_DIR%" "D:\mise" "%LOCALAPPDATA%\mise") do (
    if not defined NODE if exist "%%~R\installs\node" (
      for /f "delims=" %%V in ('dir /b /o-n "%%~R\installs\node" 2^>nul') do (
        if not defined NODE if exist "%%~R\installs\node\%%V\node.exe" (
          "%%~R\installs\node\%%V\node.exe" -e "" >nul 2>&1 && set "NODE=%%~R\installs\node\%%V\node.exe"
        )
      )
    )
  )
)

if not defined NODE (
  echo {"systemMessage":"[agentic-guard] CANNOT RESOLVE NODE - every guard hook is DISABLED. Destructive-command and secret-path protection is NOT in effect. Fix node on PATH, then restart the session."}
  exit /b 0
)

rem stdin (the hook payload) and stdout (the decision) both pass straight through.
"!NODE!" "%SCRIPT%"
exit /b %ERRORLEVEL%
