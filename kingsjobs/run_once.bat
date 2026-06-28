@echo off
REM KINGsjobs - run one check (used by Windows Task Scheduler).
cd /d "%~dp0"
if exist ".venv\Scripts\activate.bat" call ".venv\Scripts\activate.bat"
python monitor.py
