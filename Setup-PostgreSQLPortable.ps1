# ============================================
# Script de Configuracion de PostgreSQL Portable
# Solo configura el entorno, NO inicia el servidor
# ============================================

# Funcion para buscar PostgreSQL
function Find-PostgreSQLInstallation {
    param(
        [string]$StartPath = $PSScriptRoot
    )
    
    # 1. Intentar encontrar postgres.exe en el directorio actual del script
    $currentDirBin = Join-Path $StartPath "bin"
    $currentDirPostgres = Join-Path $currentDirBin "postgres.exe"
    if (Test-Path $currentDirPostgres) {
        return $StartPath
    }
    
    # 2. Buscar en subdirectorios comunes
    $commonPaths = @(
        "pgsql*",
        "postgresql*",
        "postgres*",
        "PostgreSQL*"
    )
    
    foreach ($pattern in $commonPaths) {
        $matches = Get-ChildItem -Path $StartPath -Directory -Filter $pattern -ErrorAction SilentlyContinue
        foreach ($match in $matches) {
            $postgresPath = Join-Path $match.FullName "bin\postgres.exe"
            if (Test-Path $postgresPath) {
                return $match.FullName
            }
        }
    }
    
    # 3. Buscar en el directorio padre
    $parentDir = Split-Path $StartPath -Parent
    if ($parentDir) {
        foreach ($pattern in $commonPaths) {
            $matches = Get-ChildItem -Path $parentDir -Directory -Filter $pattern -ErrorAction SilentlyContinue
            foreach ($match in $matches) {
                $postgresPath = Join-Path $match.FullName "bin\postgres.exe"
                if (Test-Path $postgresPath) {
                    return $match.FullName
                }
            }
        }
    }
    
    return $null
}

# Funcion para solicitar ruta manualmente
function Request-PostgreSQLPath {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "  PostgreSQL Portable no encontrado" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ingresa la ruta de la carpeta de PostgreSQL" -ForegroundColor Cyan
    Write-Host "Ejemplo: C:\pgsql" -ForegroundColor Gray
    Write-Host ""
    
    $userPath = Read-Host "Ruta de PostgreSQL"
    
    if ([string]::IsNullOrWhiteSpace($userPath)) {
        Write-Host "Error: No se proporciono ruta" -ForegroundColor Red
        return $null
    }
    
    $userPath = $userPath.Trim('"').Trim("'")
    
    if (-not (Test-Path $userPath)) {
        Write-Host "Error: La ruta no existe" -ForegroundColor Red
        return $null
    }
    
    $postgresExe = Join-Path $userPath "bin\postgres.exe"
    if (-not (Test-Path $postgresExe)) {
        Write-Host "Error: No se encontro postgres.exe en bin\" -ForegroundColor Red
        return $null
    }
    
    return $userPath
}

# Funcion para guardar la configuracion
function Save-PostgreSQLConfig {
    param([string]$PostgreSQLPath)
    
    $configFile = Join-Path $PSScriptRoot ".postgres-config"
    $PostgreSQLPath | Out-File -FilePath $configFile -Encoding UTF8
}

# Funcion para cargar configuracion guardada
function Load-PostgreSQLConfig {
    $configFile = Join-Path $PSScriptRoot ".postgres-config"
    if (Test-Path $configFile) {
        $savedPath = Get-Content $configFile -Raw
        $savedPath = $savedPath.Trim()
        if ((Test-Path $savedPath) -and (Test-Path (Join-Path $savedPath "bin\postgres.exe"))) {
            return $savedPath
        }
    }
    return $null
}

# Funcion para inicializar el cluster de datos
function Initialize-PostgreSQLData {
    param(
        [string]$PostgreSQLPath,
        [string]$DataPath
    )
    
    $initdbExe = Join-Path $PostgreSQLPath "bin\initdb.exe"
    
    if (-not (Test-Path $DataPath)) {
        Write-Host "Inicializando cluster..." -ForegroundColor Yellow
        
        try {
            & $initdbExe -D $DataPath -U postgres -E UTF8 --locale=C -A trust | Out-Null
            Write-Host "Cluster inicializado" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "Error al inicializar: $_" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

# ============================================
# EJECUCION PRINCIPAL
# ============================================

Write-Host "Configurando PostgreSQL Portable..." -ForegroundColor Cyan

# Cargar o buscar PostgreSQL
$PostgreSQLDir = Load-PostgreSQLConfig

if (-not $PostgreSQLDir) {
    $PostgreSQLDir = Find-PostgreSQLInstallation
    
    if (-not $PostgreSQLDir) {
        $PostgreSQLDir = Request-PostgreSQLPath
        
        if (-not $PostgreSQLDir) {
            Write-Host "No se pudo configurar PostgreSQL" -ForegroundColor Red
            return
        }
    }
    
    Save-PostgreSQLConfig -PostgreSQLPath $PostgreSQLDir
}

# Configurar rutas
$BinDir = Join-Path $PostgreSQLDir "bin"
$DataDir = Join-Path $PostgreSQLDir "data"
$LogDir = Join-Path $PostgreSQLDir "logs"

# Crear directorio de logs
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Configurar variables de entorno
$env:PATH = "$BinDir;$env:PATH"
$env:PGDATA = $DataDir
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
$env:PGUSER = "postgres"

# Inicializar cluster si es necesario
Initialize-PostgreSQLData -PostgreSQLPath $PostgreSQLDir -DataPath $DataDir | Out-Null

Write-Host "PostgreSQL configurado en: $PostgreSQLDir" -ForegroundColor Green