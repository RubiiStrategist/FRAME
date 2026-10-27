@echo off
setlocal
cd /d "%~dp0"
title FRAME - Servidor do site
set "FRAME_SITE_DIR=%~dp0"
set "FRAME_OPEN_FLAG="
if /I "%~1"=="--open" set "FRAME_OPEN_FLAG=--open"
if not exist "%~dp0index.html" goto incomplete
if not exist "%~dp0servidor.cjs" goto incomplete
if exist "%~dp0.frame-runtime\node.exe" (
  "%~dp0.frame-runtime\node.exe" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)" >nul 2>nul
  if not errorlevel 1 goto localnode
)
where node >nul 2>nul
if errorlevel 1 goto download
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)" >nul 2>nul
if errorlevel 1 goto download
node "%~dp0servidor.cjs" %FRAME_OPEN_FLAG%
if errorlevel 1 goto failed
exit /b 0
:download
echo.
echo Preparando o Node portatil para abrir a FRAME...
echo O download oficial acontece apenas na primeira vez.
echo Nao e necessario instalar nada como administrador.
echo.
powershell.exe -NoLogo -NoProfile -Command "$ErrorActionPreference='Stop'; try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12; $arch=$env:PROCESSOR_ARCHITEW6432; if(-not $arch){$arch=$env:PROCESSOR_ARCHITECTURE}; if($arch -eq 'ARM64'){$platform='win-arm64'}elseif($arch -eq 'AMD64'){$platform='win-x64'}else{throw 'Este iniciador requer Windows de 64 bits.'}; $base='https://nodejs.org/dist/latest-v24.x/'; $entry=$platform+'/node.exe'; $manifest=(Invoke-WebRequest -UseBasicParsing -Uri ($base+'SHASUMS256.txt') -TimeoutSec 60).Content; $line=($manifest -split '\r?\n' | Where-Object {$_ -match ('^([a-fA-F0-9]{64})\s+'+[regex]::Escape($entry)+'$')} | Select-Object -First 1); if(-not $line){throw 'Nao foi possivel conferir a versao oficial do Node.'}; $expected=($line -split '\s+')[0]; $dir=Join-Path $env:FRAME_SITE_DIR '.frame-runtime'; New-Item -ItemType Directory -Path $dir -Force | Out-Null; $temp=Join-Path $dir ('node-'+[guid]::NewGuid().ToString('N')+'.download'); Write-Host 'Baixando Node do site oficial...'; Invoke-WebRequest -UseBasicParsing -Uri ($base+$entry) -OutFile $temp -TimeoutSec 300; $actual=(Get-FileHash -LiteralPath $temp -Algorithm SHA256).Hash; if($actual -ne $expected){Remove-Item -LiteralPath $temp; throw 'O download nao passou na verificacao. Tente novamente.'}; Move-Item -LiteralPath $temp -Destination (Join-Path $dir 'node.exe') -Force; Write-Host 'Node pronto. Iniciando o site...'; exit 0 } catch { Write-Host ('Falha: '+$_.Exception.Message); exit 1 }"
if errorlevel 1 goto failed
:localnode
"%~dp0.frame-runtime\node.exe" "%~dp0servidor.cjs" %FRAME_OPEN_FLAG%
if errorlevel 1 goto failed
exit /b 0
:incomplete
echo.
echo Extraia o ZIP inteiro antes de abrir o site.
echo Mantenha os dois arquivos BAT junto de index.html e da pasta assets.
pause
exit /b 1
:failed
echo.
echo O site nao iniciou. Confira a mensagem acima.
echo Se era o primeiro uso, confira a internet e tente novamente.
pause
exit /b 1
