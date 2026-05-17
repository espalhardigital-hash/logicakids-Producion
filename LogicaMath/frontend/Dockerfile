# Production Stage - Nginx
# Servimos directamente la carpeta 'dist' precompilada localmente en alta performance.
# Esto reduce el consumo de RAM en el VPS a 0MB durante el deploy y evita bloqueos (OOM).
FROM nginx:alpine

# Copiar archivos compilados al directorio de contenido estático de Nginx
COPY dist /usr/share/nginx/html

# Copiar archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
