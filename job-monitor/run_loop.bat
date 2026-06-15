@echo off
REM Continuous mode: checks on a schedule and keeps running until you close it.
cd /d "%~dp0"
"%~dp0venv\Scripts\python.exe" "%~dp0monitor.py" --config "%~dp0config.yaml" --loop
