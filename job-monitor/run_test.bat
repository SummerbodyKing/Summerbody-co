@echo off
REM Run one pass, print what was found, and send a single test notification.
cd /d "%~dp0"
"%~dp0venv\Scripts\python.exe" "%~dp0monitor.py" --config "%~dp0config.yaml" --test
pause
