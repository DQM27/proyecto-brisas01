# ============================================
# Script de Inicio de Entorno de Desarrollo
# NestJS + PostgreSQL Portable
# ============================================

param(
    [switch]$StopServer,
    [switch]$RestartServer,
    [switch]$StatusOnly,
    [string]$CreateDatabase
)

Clear-Host
Write-Host "================================================" -ForegroundColor Magenta
Write-Host "  Entorno de Desarrollo - NestJS + PostgreSQL" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""

# ============================================
# 1. CONFIGURAR POSTGRESQL
# ============================================

Write-Host "[>] Cargando PostgreSQL..." -ForegroundColor Cyan

$setupScript = Join-Path $PSScriptRoot "Setup-PostgreSQLPortable.ps1"

if (-not (Test-Path $setupScript)) {
    Write-Host "[ERROR] No se encontro Setup-PostgreSQLPortable.ps1" -ForegroundColor Red
    exit 1
}

. $setupScript

if (-not $env:PGDATA) {
    Write-Host "[ERROR] No se pudo configurar PostgreSQL" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# 2. GESTIONAR SERVIDOR
# ============================================

$BinDir = Split-Path $env:PGDATA -Parent | Join-Path -ChildPath "bin"
$LogFile = Split-Path $env:PGDATA -Parent | Join-Path -ChildPath "logs\postgres.log"

function Get-PostgreSQLStatus {
    try {
        $status = & "$BinDir\pg_ctl.exe" status -D $env:PGDATA 2>$null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
}

$isRunning = Get-PostgreSQLStatus

if ($StopServer) {
    Write-Host "[>] Deteniendo servidor..." -ForegroundColor Cyan
    if ($isRunning) {
        & "$BinDir\pg_ctl.exe" stop -D $env:PGDATA -m fast
        Write-Host "[OK] Servidor detenido" -ForegroundColor Green
    } else {
        Write-Host "[INFO] El servidor ya estaba detenido" -ForegroundColor Yellow
    }
    exit 0
}

if ($StatusOnly) {
    Write-Host ""
    Write-Host "Estado del Servidor:" -ForegroundColor Cyan
    & "$BinDir\pg_ctl.exe" status -D $env:PGDATA
    Write-Host ""
    Write-Host "Bases de datos existentes:" -ForegroundColor Cyan
    & "$BinDir\psql.exe" -U postgres -c "\l"
    exit 0
}

if ($RestartServer) {
    Write-Host "[>] Reiniciando servidor..." -ForegroundColor Cyan
    if ($isRunning) {
        & "$BinDir\pg_ctl.exe" restart -D $env:PGDATA -l $LogFile
    } else {
        & "$BinDir\pg_ctl.exe" start -D $env:PGDATA -l $LogFile
    }
    Start-Sleep -Seconds 2
    $isRunning = Get-PostgreSQLStatus
}

if (-not $isRunning) {
    Write-Host "[>] Iniciando servidor PostgreSQL..." -ForegroundColor Cyan
    
    & "$BinDir\pg_ctl.exe" start -D $env:PGDATA -l $LogFile
    Start-Sleep -Seconds 2
    
    $isRunning = Get-PostgreSQLStatus
    
    if ($isRunning) {
        Write-Host "[OK] Servidor iniciado" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] No se pudo iniciar" -ForegroundColor Red
        Write-Host "Revisa: $LogFile" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[OK] Servidor ya esta corriendo" -ForegroundColor Green
}

Write-Host ""

# ============================================
# 3. GESTIONAR BASE DE DATOS
# ============================================

function Test-DatabaseExists {
    param([string]$DatabaseName)
    
    $result = & "$BinDir\psql.exe" -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DatabaseName'" 2>$null
    return ($result -eq "1")
}

function Get-AllDatabases {
    $result = & "$BinDir\psql.exe" -U postgres -tAc "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname" 2>$null
    return $result
}

function New-Database {
    param([string]$DatabaseName)
    
    if (Test-DatabaseExists -DatabaseName $DatabaseName) {
        Write-Host "[INFO] La base de datos '$DatabaseName' ya existe" -ForegroundColor Yellow
        return $true
    }
    
    try {
        Write-Host "[>] Creando base de datos '$DatabaseName'..." -ForegroundColor Cyan
        & "$BinDir\createdb.exe" -U postgres $DatabaseName 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Base de datos '$DatabaseName' creada exitosamente" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[ERROR] No se pudo crear la base de datos" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "[ERROR] Error al crear base de datos: $_" -ForegroundColor Red
        return $false
    }
}

# Manejar creacion de base de datos
if ($CreateDatabase) {
    New-Database -DatabaseName $CreateDatabase
    Write-Host ""
}

# ============================================
# 4. CONFIGURAR NODE.JS
# ============================================

$nodeScript = Join-Path $PSScriptRoot "Setup-NodePortable.ps1"
if (Test-Path $nodeScript) {
    Write-Host "[>] Cargando Node.js..." -ForegroundColor Cyan
    . $nodeScript
    Write-Host ""
}

# ============================================
# 5. DETECTAR PROYECTO NESTJS
# ============================================

$nestCliConfig = Join-Path $PSScriptRoot "nest-cli.json"
$packageJson = Join-Path $PSScriptRoot "package.json"
$isNestProject = $false
$dbName = $null

if (Test-Path $packageJson) {
    $package = Get-Content $packageJson -Raw | ConvertFrom-Json
    if ($package.dependencies.'@nestjs/core') {
        $isNestProject = $true
    }
}

# Buscar nombre de BD en .env
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    foreach ($line in $envContent) {
        if ($line -match "^DATABASE_NAME=(.+)$") {
            $dbName = $matches[1].Trim()
            break
        }
    }
}

# ============================================
# 6. CREAR BD AUTOMATICAMENTE SI ES NECESARIO
# ============================================

if ($isNestProject -and $dbName -and -not [string]::IsNullOrWhiteSpace($dbName)) {
    Write-Host "[>] Proyecto NestJS detectado" -ForegroundColor Cyan
    Write-Host "[>] Base de datos configurada: $dbName" -ForegroundColor Cyan
    
    if (-not (Test-DatabaseExists -DatabaseName $dbName)) {
        Write-Host "[INFO] La base de datos no existe. Creandola..." -ForegroundColor Yellow
        New-Database -DatabaseName $dbName | Out-Null
    } else {
        Write-Host "[OK] Base de datos '$dbName' existe" -ForegroundColor Green
    }
    Write-Host ""
}

# ============================================
# 7. RESUMEN
# ============================================

Write-Host "================================================" -ForegroundColor Green
Write-Host "  Entorno Listo" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "PostgreSQL:" -ForegroundColor Cyan
Write-Host "  Estado:     CORRIENDO" -ForegroundColor Green
Write-Host "  Host:       localhost" -ForegroundColor White
Write-Host "  Puerto:     5432" -ForegroundColor White
Write-Host "  Usuario:    postgres" -ForegroundColor White
Write-Host "  Password:   (sin password)" -ForegroundColor Gray
Write-Host ""

# Mostrar bases de datos existentes
Write-Host "Bases de datos disponibles:" -ForegroundColor Cyan
$databases = Get-AllDatabases
if ($databases) {
    foreach ($db in $databases) {
        if ($db -eq $dbName) {
            Write-Host "  * $db" -ForegroundColor Green -NoNewline
            Write-Host " (configurada en .env)" -ForegroundColor Gray
        } else {
            Write-Host "  - $db" -ForegroundColor White
        }
    }
} else {
    Write-Host "  (ninguna base de datos de usuario)" -ForegroundColor Gray
}
Write-Host ""

# Mostrar informacion de Node.js si esta disponible
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    $npmVersion = npm --version
    
    Write-Host "Node.js:" -ForegroundColor Cyan
    Write-Host "  Version:    $nodeVersion" -ForegroundColor White
    Write-Host "  npm:        v$npmVersion" -ForegroundColor White
    Write-Host ""
}

if ($isNestProject) {
    Write-Host "Proyecto NestJS detectado!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Base de Datos:" -ForegroundColor Cyan
Write-Host "  Conectar:              psql -U postgres" -ForegroundColor White
Write-Host "  Conectar a una BD:     psql -U postgres -d nombre_bd" -ForegroundColor White
Write-Host "  Crear BD:              .\Start-DevEnvironment.ps1 -CreateDatabase nombre_bd" -ForegroundColor White
Write-Host "  Listar BDs:            .\Start-DevEnvironment.ps1 -StatusOnly" -ForegroundColor White
Write-Host ""

if ($isNestProject) {
    Write-Host "NestJS:" -ForegroundColor Cyan
    Write-Host "  Desarrollo:            npm run start:dev" -ForegroundColor White
    Write-Host "  Produccion:            npm run start:prod" -ForegroundColor White
    Write-Host "  Tests:                 npm test" -ForegroundColor White
    Write-Host ""
}

Write-Host "Gestion del servidor:" -ForegroundColor Cyan
Write-Host "  Detener:               .\Start-DevEnvironment.ps1 -StopServer" -ForegroundColor White
Write-Host "  Reiniciar:             .\Start-DevEnvironment.ps1 -RestartServer" -ForegroundColor White
Write-Host "  Ver estado:            .\Start-DevEnvironment.ps1 -StatusOnly" -ForegroundColor White
Write-Host ""

# Mostrar ejemplo de .env si no existe
if (-not (Test-Path $envFile) -and $isNestProject) {
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "  ACCION REQUERIDA: Crear archivo .env" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Crea un archivo .env con esta configuracion:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "DATABASE_HOST=localhost" -ForegroundColor Gray
    Write-Host "DATABASE_PORT=5432" -ForegroundColor Gray
    Write-Host "DATABASE_USER=postgres" -ForegroundColor Gray
    Write-Host "DATABASE_PASSWORD=" -ForegroundColor Gray
    Write-Host "DATABASE_NAME=nestjs_app" -ForegroundColor Gray
    Write-Host "NODE_ENV=development" -ForegroundColor Gray
    Write-Host "PORT=3000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Luego ejecuta nuevamente este script para crear la BD automaticamente" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Green
Write-Host ""