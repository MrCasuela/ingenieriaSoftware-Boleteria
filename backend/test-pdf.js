// Script de prueba para generar PDF de auditoría
import http from 'http';
import fs from 'fs';

const data = JSON.stringify({ eventId: 1 });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/audit/generate-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('📤 Enviando petición POST a /api/audit/generate-pdf');
console.log('Body:', data);

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  if (res.statusCode === 200) {
    const fileStream = fs.createWriteStream('/tmp/reporte-test.pdf');
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('✅ PDF guardado en /tmp/reporte-test.pdf');
      
      // Mostrar tamaño del archivo
      const stats = fs.statSync('/tmp/reporte-test.pdf');
      console.log(`📄 Tamaño: ${stats.size} bytes`);
      process.exit(0);
    });
  } else {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('❌ Respuesta:', body);
      process.exit(1);
    });
  }
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end();
