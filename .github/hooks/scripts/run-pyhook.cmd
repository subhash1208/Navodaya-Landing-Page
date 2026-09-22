@echo off
setlocal enabledelayedexpansion
rem ---------------------------------------------------------------------------
rem Python hook launcher. Usage: run-pyhook.cmd <script-basename>
rem
rem The node twin of this file is run-hook.cmd, and it exists for the same
rem reason: a hook command is spawned through a shell, and if the interpreter
rem does not resolve the hook fails SILENTLY. Claude Code and Copilot both treat
rem a non-zero hook exit as "no decision" and carry on -- so a guard that cannot
rem start looks identical to a guard that approved the call.
rem
rem Two Windows-specific traps this has to dodge, both verified on this machine
rem 2026-09-22:
rem   1. `py` is broken here -- it reports
rem      "Unable to create process using 'D:\python3.13\python.exe'". So the
rem      standard PEP 397 launcher is NOT a usable fallback.
rem   2. C:\...\WindowsApps\python.exe is the Microsoft Store STUB. It is on
rem      PATH, it exists, and running it opens the Store instead of executing
rem      the script. Existence checks are therefore not enough -- every
rem      candidate is test-executed before being accepted.
rem ---------------------------------------------------------------------------

set "SCRIPT=%~dp0%~1.py"

if not exist "%SCRIPT%" (
  echo {"systemMessage":"[guardrail] hook script not found: %~1.py"}
  exit /b 0
)

set "PY="

rem 1. Whatever is on PATH -- but prove it runs, and reject the Store stub.
rem    The stub test uses cmd's own string substitution rather than `find /i`:
rem    on this machine Git Bash's /usr/bin precedes System32 on PATH, so `find`
rem    resolves to GNU find, which does not understand /i and prints errors to
rem    stderr while leaving the check silently ineffective. Substitution needs
rem    no external process and cannot be shadowed.
for %%P in (python.exe) do if not defined PY set "PY=%%~$PATH:P"
if defined PY (
  if not "!PY!"=="!PY:WindowsApps=!" set "PY="
)
if defined PY (
  "!PY!" -c "pass" >nul 2>&1 || set "PY="
)

rem 2. Fall back to known mise install roots, highest version first.
if not defined PY (
  for %%R in ("%MISE_DATA_DIR%" "D:\mise" "%LOCALAPPDATA%\mise") do (
    if not defined PY if exist "%%~R\installs\python" (
      for /f "delims=" %%V in ('dir /b /o-n "%%~R\installs\python" 2^>nul') do (
        if not defined PY if exist "%%~R\installs\python\%%V\python.exe" (
          "%%~R\installs\python\%%V\python.exe" -c "pass" >nul 2>&1 && set "PY=%%~R\installs\python\%%V\python.exe"
        )
      )
    )
  )
)

if not defined PY (
  echo {"systemMessage":"[guardrail] CANNOT RESOLVE PYTHON - the PreToolUse secret-path guard is DISABLED. Native deny rules in permissions.json still apply. Fix python on PATH, then restart the session."}
  exit /b 0
)

rem stdin (the hook payload) passes straight through; so does exit code 2, which
rem is how this hook blocks a tool call.
"!PY!" "%SCRIPT%"
exit /b %ERRORLEVEL%
