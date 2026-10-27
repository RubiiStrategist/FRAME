@echo off
setlocal
cd /d "%~dp0"
call "%~dp0INICIAR_SERVIDOR.bat" --open
exit /b %errorlevel%
