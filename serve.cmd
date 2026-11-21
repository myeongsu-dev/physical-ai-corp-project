@echo off
rem Double-click: serve this folder at http://127.0.0.1:8765 and open index.html.
rem The 3D viewer loads GLB/JSON files, so pages must come from a web server (file:// does not work).
rem Close this window (or press Ctrl+C) to stop the server.
setlocal
set "PORT=8765"
pushd "%~dp0"

set "PY="
where python >nul 2>nul && set "PY=python"
if not defined PY where py >nul 2>nul && set "PY=py -3"
if not defined PY where uv >nul 2>nul && set "PY=uv run --no-project python"
if not defined PY (
  echo [serve] Python or uv is required. Install uv once:
  echo   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  pause
  exit /b 1
)

echo [serve] http://127.0.0.1:%PORT%/index.html
start "" "http://127.0.0.1:%PORT%/index.html"
%PY% -m http.server %PORT% --bind 127.0.0.1
if errorlevel 1 (
  echo [serve] Could not start the server. Port %PORT% may be in use by another window.
  pause
)
popd
