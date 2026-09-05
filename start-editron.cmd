@echo off
tasklist /FI "IMAGENAME eq mongod.exe" | find /I "mongod.exe" >nul || (
    echo Starting MongoDB...
    start "" /min "C:\Users\DELL\Tools\mongodb\bin\mongod.exe" --dbpath "C:\Users\DELL\Tools\mongodb\data" --port 27017 --bind_ip 127.0.0.1
    timeout /t 4 /nobreak >nul
)
cd /d "%~dp0"
echo Starting Editron (Next.js + Collab)...
npm run dev
pause
