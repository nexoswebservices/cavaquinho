@echo off
chcp 65001 >nul
echo =============================================
echo   Adicionar Cifra ao Cavaquinho App
echo =============================================
echo.

if "%~1"=="" (
    echo Uso: adicionar-cifra.bat arquivo.txt
    echo.
    echo O arquivo .txt deve ter o formato:
    echo ---
    echo Titulo da Musica
    echo Artista
    echo Tom: Gm
    echo.
    echo [Intro]
    echo Gm ^| Dm ^| Eb7+ ^| Cm ^| D7
    echo.
    echo [Verso]
    echo Gm ^| Fm ^| Bb7 ^| Eb7+
    echo.
    echo [Refrao]
    echo Cm ^| D7 ^| Gm
    echo ---
    pause
    exit /b 1
)

if not exist "%~1" (
    echo ERRO: Arquivo "%~1" nao encontrado
    pause
    exit /b 1
)

echo Processando: %~1
echo.
python "%~dp0processar-cifra.py" "%~1"

if %errorlevel%==0 (
    echo.
    echo Cifra adicionada com sucesso!
    echo Agora rode: python scripts\build-progressions-from-curated.py
    echo E depois faca o deploy.
) else (
    echo.
    echo ERRO ao processar a cifra.
)
echo.
pause
