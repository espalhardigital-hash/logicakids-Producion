# ==========================================
# Etapa 1: Construcción (Builder)
# ==========================================
FROM node:22 AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar solo package.json para evitar conflictos de arquitectura o de plataforma con package-lock.json de Windows
COPY package.json ./

# Forzar la instalación de dependencias de desarrollo para la compilación (incluso si el host/VPS tiene NODE_ENV=production)
ENV NODE_ENV=development

# Ajustar la memoria de Node.js a 2048MB (tu VPS tiene 15GB de RAM, por lo que podemos usar una compilación súper veloz y robusta)
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Instalar dependencias con banderas para ahorrar recursos
RUN npm install --no-audit --no-fund

# Copiar el resto del código fuente del frontend
COPY . .

# Recibir la URL de la API desde el docker-compose.yml
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Desactivar generación de Source Maps para reducir sustancialmente el consumo de RAM en la compilación
ENV GENERATE_SOURCEMAP=false

# Compilar la aplicación de React/Vite (esto crea la carpeta /dist internamente)
RUN npm run build

# ==========================================
# Etapa 2: Servidor Web (Producción)
# ==========================================
FROM nginx:alpine

# Copiar el código ya compilado desde la Etapa 1 hacia la carpeta de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto estándar de Nginx
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
