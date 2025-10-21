# ===================================
# Dockerfile - Backend (Node.js + Express)
# Sistema de Boletería - TicketVue
# ===================================

FROM node:18-alpine

# Instalar herramientas necesarias
RUN apk add --no-cache bash

# Crear directorio de aplicación
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Crear directorio para logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto (serán sobrescritas por .env)
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usuario no root por seguridad
USER node

# Comando de inicio
CMD ["node", "server.js"]
