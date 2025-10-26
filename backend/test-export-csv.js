async function testExportCSV() {
  try {
    // 1. Login como administrador
    console.log('🔐 Intentando login como administrador...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin1@ticketvue.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Error en login:', loginData);
      return;
    }

    console.log('✅ Login exitoso');
    console.log('👤 Usuario:', loginData.user.firstName, loginData.user.lastName);
    console.log('🔑 Token obtenido:', loginData.token.substring(0, 50) + '...');
    console.log('📊 Usuario activo:', loginData.user.isActive);

    const token = loginData.token;

    // 2. Intentar exportar CSV
    console.log('\n📄 Intentando exportar CSV...');
    const csvResponse = await fetch('http://localhost:3000/api/admin/reports/attendance/export/csv', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status de respuesta:', csvResponse.status, csvResponse.statusText);

    if (!csvResponse.ok) {
      const errorText = await csvResponse.text();
      console.error('❌ Error al exportar CSV:', errorText);
      return;
    }

    const csvContent = await csvResponse.text();
    console.log('✅ CSV exportado exitosamente');
    console.log('📏 Tamaño del CSV:', csvContent.length, 'caracteres');
    console.log('\n📄 Primeras líneas del CSV:');
    console.log(csvContent.substring(0, 500));

    // 3. Probar exportación de estadísticas CSV
    console.log('\n📊 Intentando exportar CSV de estadísticas...');
    const statsResponse = await fetch('http://localhost:3000/api/admin/reports/attendance/export/csv-stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status de respuesta:', statsResponse.status, statsResponse.statusText);

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      console.error('❌ Error al exportar CSV stats:', errorText);
      return;
    }

    const statsContent = await statsResponse.text();
    console.log('✅ CSV de estadísticas exportado exitosamente');
    console.log('📏 Tamaño del CSV:', statsContent.length, 'caracteres');
    console.log('\n📄 Primeras líneas del CSV de estadísticas:');
    console.log(statsContent.substring(0, 500));

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testExportCSV();
