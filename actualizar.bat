@echo off
:: Configurar consola en UTF-8 para soportar tildes y caracteres especiales
chcp 65001 > nul
title Actualizar Repositorio - LogicaKids

echo ====================================================
echo      ACTUALIZACIÃ“N DEL REPOSITORIO LOGICAKIDS
echo ====================================================
echo.

:: Verificar si git estÃ¡ instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git no estÃ¡ instalado o no se encuentra en el PATH del sistema.
    echo Por favor, instale Git e intente de nuevo.
    echo.
    pause
    exit /b 1
)

echo [+] Guardando cambios locales temporalmente (git stash)...
git stash

echo.
echo [+] Descargando las Ãºltimas actualizaciones del servidor (git pull)...
git pull origin main
set pull_status=%errorlevel%

echo.
echo [+] Restaurando sus cambios locales (git stash pop)...
git stash pop >nul 2>nul

echo.
if %pull_status% equ 0 (
    color 0A
    echo ====================================================
    echo   Â¡ACTUALIZACIÃ“N COMPLETADA CON Ã‰XITO!
    echo ====================================================
) else (
    color 0C
    echo ====================================================
    echo   [ERROR] Hubo un problema al actualizar el repositorio.
    echo   Verifique su conexiÃ³n a Internet o los conflictos.
    echo ====================================================
)

echo.
pause
