@echo off
REM KINGsjobs - register Windows scheduled tasks.
REM Run this ONCE by right-clicking and choosing "Run as administrator".
setlocal
set "TASKDIR=%~dp0"

echo Creating scheduled task: runs every 20 minutes...
schtasks /Create /TN "KINGsjobs Monitor" /TR "\"%TASKDIR%run_once.bat\"" /SC MINUTE /MO 20 /F

echo Creating scheduled task: runs once at every startup...
schtasks /Create /TN "KINGsjobs Monitor (startup)" /TR "\"%TASKDIR%run_once.bat\"" /SC ONSTART /F

echo.
echo Done. Two tasks created. To remove them later:
echo   schtasks /Delete /TN "KINGsjobs Monitor" /F
echo   schtasks /Delete /TN "KINGsjobs Monitor (startup)" /F
echo.
pause
