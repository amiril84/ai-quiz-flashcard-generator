@echo off
echo ========================================
echo   AI Quiz Generator - Backend Server
echo ========================================
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Flask backend server...
echo Backend will run on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
python app.py
