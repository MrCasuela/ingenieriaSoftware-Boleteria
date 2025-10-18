#!/bin/sh
# Script para esperar a que MySQL esté listo antes de iniciar el backend

set -e

host="$1"
shift
cmd="$@"

echo "⏳ Esperando a que MySQL esté listo en $host..."

until node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: '$host',
  port: 3306,
  user: '${DB_USER:-ticketuser}',
  password: '${DB_PASSWORD:-ticketpass}',
  database: '${DB_NAME:-ticketvue}'
}).then(() => {
  console.log('✅ MySQL está listo!');
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
" 2>/dev/null; do
  echo "⏳ MySQL no está listo aún - reintentando en 2 segundos..."
  sleep 2
done

echo "🚀 MySQL está listo! Iniciando backend..."
exec $cmd
