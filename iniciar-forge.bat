@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Forge - iniciar

rem === Comprobaciones ===
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en el PATH.
  echo Instalalo desde https://nodejs.org version LTS, cierra esta ventana y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

if not exist package.json (
  echo [ERROR] No encuentro package.json. Guarda este archivo en la raiz del proyecto.
  pause
  exit /b 1
)

rem === Archivo .env con las claves de Supabase ===
if not exist .env (
  if exist .env.example (
    copy /y .env.example .env >nul
    echo Se creo el archivo .env a partir de .env.example.
    echo Pega tu URL y tu clave publishable de Supabase, guarda y cierra el Bloc de notas.
    echo Guia: docs\SUPABASE_SETUP.md
    start /wait notepad .env
  )
)

rem === Dependencias ===
if not exist node_modules (
  echo Instalando dependencias, esto puede tardar unos minutos...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install fallo. Revisa el mensaje de arriba.
    pause
    exit /b 1
  )
)

rem === Limpiar variables que daban problemas ===
set EXPO_OFFLINE=
set REACT_NATIVE_PACKAGER_HOSTNAME=

:menu
echo.
echo ================= FORGE =================
echo  1  Abrir en el telefono con la misma Wi-Fi
echo  2  Abrir en el telefono con tunel, sin depender del firewall
echo  3  Abrir en el navegador, version web
echo  4  Reinstalar dependencias y alinear versiones
echo  5  Permitir el puerto 8081 en el firewall, requiere administrador
echo  6  Salir
echo ==========================================
choice /c 123456 /n /m "Elige una opcion: "

if errorlevel 6 goto :fin
if errorlevel 5 goto :firewall
if errorlevel 4 goto :deps
if errorlevel 3 goto :web
if errorlevel 2 goto :tunnel
if errorlevel 1 goto :lan

:lan
echo Escanea el QR con Expo Go. Para detener el servidor pulsa Ctrl+C.
call npx expo start --lan -c
goto :menu

:tunnel
echo Si pide instalar @expo/ngrok, responde Y. Para detener el servidor pulsa Ctrl+C.
call npx expo start --tunnel -c
goto :menu

:web
echo Se abrira en el navegador. Para detener el servidor pulsa Ctrl+C.
call npx expo start --web -c
goto :menu

:deps
call npm install
call npx expo install --fix
pause
goto :menu

:firewall
net session >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Esta opcion necesita permisos de administrador.
  echo Cierra esta ventana, haz clic derecho sobre iniciar-forge.bat y elige Ejecutar como administrador.
  pause
  goto :menu
)
netsh advfirewall firewall delete rule name="Expo Metro 8081" >nul 2>nul
netsh advfirewall firewall add rule name="Expo Metro 8081" dir=in action=allow protocol=TCP localport=8081 profile=any remoteip=localsubnet
echo Listo: el puerto 8081 queda abierto solo para tu red local.
pause
goto :menu

:fin
endlocal
exit /b 0
