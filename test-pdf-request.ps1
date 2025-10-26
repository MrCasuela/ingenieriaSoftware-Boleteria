# Script de prueba para generar PDF de auditoría
$uri = "http://localhost:3000/api/audit/generate-pdf"
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    eventId = 1
} | ConvertTo-Json

Write-Host "Enviando petición a: $uri"
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $body -OutFile "reporte-auditoria.pdf"
    Write-Host "✅ PDF generado exitosamente: reporte-auditoria.pdf"
    Write-Host "Status: $($response.StatusCode)"
} catch {
    Write-Host "❌ Error al generar PDF:"
    Write-Host $_.Exception.Message
    
    # Intentar mostrar respuesta del servidor
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor: $responseBody"
    }
}
