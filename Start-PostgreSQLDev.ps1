# ============================================
# 🚀 Script Unificado: Start-PostgreSQLDev.ps1
# --------------------------------------------
# Detecta, configura y arranca PostgreSQL Portable
# Prepara entorno de desarrollo para NestJS
# ============================================

param(
    [string]$DatabaseName = "control_accesos"
)

Write-Host "🔧 Iniciando entorno PostgreSQL Portable..." -ForegroundColor Cyan

# -----------------------------
# 🔍 Buscar instalación existente
# -----------------------------
function Find-PostgreSQLInstallation {
    param([string]$StartPath = $PSScriptRoot)

    $currentDirBin = Join-Path $StartPath "bin"
    if (Test-Path (Join-Path $currentDirBin "postgres.exe"))) { return $StartPath }

    $patterns = @("pgsql*", "postgresql*", "postgres*", "PostgreSQL*")
    foreach ($pattern in $patterns) {
        $matches = Get-ChildItem -Path $StartPath -Directory -Filter $pattern -ErrorAction SilentlyContinue
        foreach ($match in $matches) {
            if (Test-Path (Join-Path $match.FullName "bin\postgres.exe")) {
                return $match.FullName
            }
        }
    }

    $parent = Split-Path $StartPath -Parent
    if ($parent) {
        foreach ($pattern in $patterns) {
            $matches = Get-ChildItem -Path $parent -Directory -Filter $pattern -ErrorAction SilentlyContinue
            foreach ($match in $matches) {
                if (Test-Path (Join-Path $match.FullName "bin\postgres.exe")) {
                    return $match.FullName
                }
            }
        }
    }

    return $null
}

# -----------------------------
# 🧭 Solicitar ruta manualmente
# -----------------------------
function Request-PostgreSQLPath {
    Write-Host "`nPostgreSQL Portable no encontrado." -ForegroundColor Yellow
    Write-Host "Por favor ingresa la ruta (ejemplo: C:\pgsql)" -ForegroundColor Cyan
    $path = Read-Host "Ruta de PostgreSQL"
    $path = $path.Trim('"').Trim("'")
    if (-not (Test-Path (Join-Path $path "bin\postgres.exe"))) {
        Write-Host "❌ Ruta inválida o postgres.exe no encontrado." -ForegroundColor Red
        return $null
    }
    return $path
}

# -----------------------------
# 💾 Configuración persistente
# -----------------------------
function Save-PostgreSQLConfig {
    param([string]$PostgreSQLPath)
    $file = Join-Path $PSScriptRoot ".postgres-config"
    $PostgreSQLPath | Out-File -FilePath $file -Encoding UTF8
}

function Load-PostgreSQLConfig {
    $file = Join-Path $PSScriptRoot ".postgres-config"
    if (Test-Path $file) {
        $path = (Get-Content $file -Raw).Trim()
        if (Test-Path (Join-Path $path "bin\postgres.exe")) {
            return $path
        }
    }
    return $null
}

# -----------------------------
# 🗄️ Inicializar datos
# -----------------------------
function Initialize-PostgreSQLData {
    param([string]$PostgreSQLPath, [string]$DataPath)

    $initdbExe = Join-Path $PostgreSQLPath "bin\initdb.exe"
    if (-not (Test-Path $DataPath)) {
        Write-Host "🧩 Inicializando cluster de datos..." -ForegroundColor Yellow
        & $initdbExe -D $DataPath -U postgres -E UTF8 --locale=C -A trust | Out-Null
        Write-Host "✅ Cluster inicializado correctamente." -ForegroundColor Green
    }
}

# -----------------------------
# ▶️ Iniciar PostgreSQL
# -----------------------------
function Start-PostgreSQL {
    param([string]$PostgreSQLPath, [string]$DataPath, [string]$LogDir)

    $pgCtl = Join-Path $PostgreSQLPath "bin\pg_ctl.exe"
    $logFile = Join-Path $LogDir "postgres.log"

    if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

    # Verificar si ya está corriendo
    $pgProcess = Get-Process -Name postgres -ErrorAction SilentlyContinue
    if ($pgProcess) {
        Write-Host "⚙️ PostgreSQL ya está ejecutándose." -ForegroundColor Yellow
        return
    }

    Write-Host "🚀 Iniciando servidor PostgreSQL..." -ForegroundColor Cyan
    & $pgCtl start -D $DataPath -l $logFile | Out-Null
    Start-Sleep -Seconds 2

    if (Get-Process -Name postgres -ErrorAction SilentlyContinue) {
        Write-Host "✅ Servidor PostgreSQL iniciado." -ForegroundColor Green
    } else {
        Write-Host "❌ Error al iniciar PostgreSQL. Revisa logs en $logFile" -ForegroundColor Red
    }
}

# -----------------------------
# 🧱 Crear base de datos
# -----------------------------
function Ensure-DatabaseExists {
    param([string]$DatabaseName)

    $exists = & psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DatabaseName'"
    if (-not $exists) {
        Write-Host "🪶 Creando base de datos '$DatabaseName'..." -ForegroundColor Yellow
        & createdb -U postgres $DatabaseName
        Write-Host "✅ Base de datos creada." -ForegroundColor Green
    } else {
        Write-Host "📦 Base de datos '$DatabaseName' ya existe." -ForegroundColor Gray
    }
}

# ============================================
# 🔧 EJECUCIÓN PRINCIPAL
# ============================================
$PostgreSQLDir = Load-PostgreSQLConfig
if (-not $PostgreSQLDir) {
    $PostgreSQLDir = Find-PostgreSQLInstallation
    if (-not $PostgreSQLDir) {
        $PostgreSQLDir = Request-PostgreSQLPath
        if (-not $PostgreSQLDir) {
            Write-Host "❌ No se pudo configurar PostgreSQL." -ForegroundColor Red
            exit 1
        }
    }
    Save-PostgreSQLConfig -PostgreSQLPath $PostgreSQLDir
}

$BinDir = Join-Path $PostgreSQLDir "bin"
$DataDir = Join-Path $PostgreSQLDir "data"
$LogDir = Join-Path $PostgreSQLDir "logs"

$env:PATH = "$BinDir;$env:PATH"
$env:PGDATA = $DataDir
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
$env:PGUSER = "postgres"

Initialize-PostgreSQLData -PostgreSQLPath $PostgreSQLDir -DataPath $DataDir
Start-PostgreSQL -PostgreSQLPath $PostgreSQLDir -DataPath $DataDir -LogDir $LogDir
Ensure-DatabaseExists -DatabaseName $DatabaseName

Write-Host "`n✅ PostgreSQL Portable está listo para usarse." -ForegroundColor Green
Write-Host "🌍 Host: localhost | DB: $DatabaseName | User: postgres" -ForegroundColor Cyan
