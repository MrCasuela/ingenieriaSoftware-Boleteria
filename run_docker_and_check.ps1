# Run Docker Compose, collect status and logs for diagnostics
# Usage: Open PowerShell in the project root and run: .\run_docker_and_check.ps1

$diag = Join-Path -Path $PSScriptRoot -ChildPath 'diagnostico_docker.txt'
if (Test-Path $diag) { Remove-Item $diag -Force }

function Log { param($s) $s | Out-File $diag -Append; Write-Host $s }

Log "==== Diagnóstico iniciado: $(Get-Date -Format o) ===="

Log "-- Docker version --"
try { docker version 2>&1 | Out-File -Append $diag } catch { Log "Docker no disponible o error al ejecutar 'docker version'" }

Log "-- Docker Compose version --"
try { docker-compose version 2>&1 | Out-File -Append $diag } catch { Log "docker-compose no disponible o error al ejecutar 'docker-compose version'" }

Log "\n-- Ejecutando: docker-compose up -d --build -- Espera a que termine... --"
$start = docker-compose up -d --build 2>&1 | Tee-Object -Variable upOut
$upOut | Out-File -Append $diag

Log "-- Listando contenedores (docker ps) --"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" 2>&1 | Tee-Object -Variable psOut | Out-File -Append $diag

Log "-- Inspect Health de ticketvue-mysql --"
try {
    docker inspect --format='{{json .State.Health}}' ticketvue-mysql 2>&1 | Tee-Object -Variable healthOut | Out-File -Append $diag
} catch {
    Log "No se pudo inspeccionar ticketvue-mysql (puede que no exista el contenedor)."
}

Log "-- Logs mysql (ultimas 200 lineas) --"
try { docker logs ticketvue-mysql --tail 200 2>&1 | Tee-Object -Variable mysqlLogs | Out-File -Append $diag } catch { Log "No hay logs de ticketvue-mysql o contenedor no iniciado" }

Log "-- Logs backend (ultimas 200 lineas) --"
try { docker logs ticketvue-backend --tail 200 2>&1 | Tee-Object -Variable backendLogs | Out-File -Append $diag } catch { Log "No hay logs de ticketvue-backend o contenedor no iniciado" }

Log "-- Health endpoint backend (http://localhost:3000/health) --"
try {
    $h = Invoke-RestMethod -Uri 'http://localhost:3000/health' -TimeoutSec 10
    $h | ConvertTo-Json -Depth 5 | Tee-Object -Variable healthJson | Out-File -Append $diag
} catch {
    Log "Error al consultar http://localhost:3000/health: $_"
}

Log "\n==== Diagnóstico completo: $(Get-Date -Format o) ===="
Log "Archivo de diagnóstico creado en: $diag"

Write-Host "\nTerminado. Puedes abrir el archivo 'diagnostico_docker.txt' en la raíz del proyecto y pegar su contenido aquí o pegar las secciones relevantes." -ForegroundColor Green
