@echo off
setlocal enabledelayedexpansion

echo [ > panoramas.json
set "first=1"

for /d %%i in (panoramas\*) do (
    if not "!first!"=="1" (echo , >> panoramas.json)
    set "first=0"
    set "folder=%%~nxi"
    <nul set /p ="  "panoramas/!folder!"" >> panoramas.json
)

python analyzelocations2.py

echo. >> panoramas.json
echo ] >> panoramas.json
echo panoramas.json generated successfully!