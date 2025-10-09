# ===================================
# Dockerfile - Frontend (Vue.js)
# Sistema de Boletería - TicketVue
# ===================================

# Etapa 1: Build
FROM node:18-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluidas devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copiar build de Vue al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
