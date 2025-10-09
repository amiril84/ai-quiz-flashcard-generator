@echo off
echo ========================================
echo   Windows Cleanup Script
echo   for YouTube Transcript API Migration
echo ========================================
echo.

echo [1/4] Stopping all Python processes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul
echo Done!
echo.

echo [2/4] Checking installed packages...
pip list | findstr /i "youtube-transcript-api PySocks"
echo.

echo [3/4] Uninstalling old YouTube transcript library...
pip uninstall -y youtube-transcript-api 2>nul
pip uninstall -y PySocks 2>nul
echo Done!
echo.

echo [4/4] Reinstalling fresh dependencies...
cd /d "%~dp0"
pip install -r requirements.txt --upgrade
echo Done!
echo.

echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Clear your browser cache (Ctrl+Shift+Delete)
echo 2. Run: python app.py
echo 3. Test with a YouTube URL
echo.
pause
