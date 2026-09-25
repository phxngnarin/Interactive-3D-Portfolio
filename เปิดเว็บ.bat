@echo off
REM ดับเบิลคลิกไฟล์นี้เพื่อเปิดเว็บ (ไม่ต้องพิมพ์คำสั่งเอง)
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
    set PYCMD=python
) else (
    where python3 >nul 2>nul
    if %errorlevel%==0 (
        set PYCMD=python3
    ) else (
        echo ไม่พบ Python ในเครื่อง กรุณาติดตั้งจาก https://www.python.org/downloads/ ก่อน
        pause
        exit /b 1
    )
)

start "" http://localhost:8080/
%PYCMD% -m http.server 8080
