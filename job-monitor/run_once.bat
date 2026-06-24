@echo off
REM One-shot check. This is what Windows Task Scheduler should run.
REM Uses the venv's python so no activation is needed.
cd /d "%~dp0"
"%~dp0venv\Scripts\python.exe" "%~dp0monitor.py" --config "%~dp0config.yaml"
