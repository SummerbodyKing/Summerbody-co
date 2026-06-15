@echo off
REM One-time setup on Windows 11. Run this from the job-monitor folder.
setlocal

echo === Creating virtual environment (venv) ===
python -m venv venv
if errorlevel 1 (
  echo Could not create venv. Is Python 3 installed and on PATH?
  exit /b 1
)

echo === Installing dependencies ===
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo === (Optional) Install Playwright Chromium for JS-rendered pages ===
echo Skipping by default. To enable, run:  playwright install chromium
echo.

if not exist config.yaml (
  copy config.example.yaml config.yaml
  echo Created config.yaml from the example. EDIT IT before running.
) else (
  echo config.yaml already exists; leaving it untouched.
)

echo.
echo Setup done. Next:
echo   1) Edit config.yaml (set your ntfy topic and target URLs)
echo   2) Test:   run_test.bat
echo   3) Schedule: see README.md  (or run:  venv\Scripts\python monitor.py --print-task)
endlocal
