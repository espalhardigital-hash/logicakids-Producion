# INSTRUCCIONES PARA APLICAR MIGRACIÓN EN LA VPS (MODO SEGURO)

Ya que no tenemos conexión SSH, no intentes copiar y pegar el contenido directamente en la consola web de Portainer. El archivo pesa más de 20MB y congelará tu navegador de forma inmediata.

Afortunadamente, como subimos los cambios a GitHub, podemos hacer que la base de datos descargue el archivo directamente de internet.

Sigue estos pasos dentro de la consola (`>_ Console`) de tu contenedor `base_postgres_general` en Portainer:

### PASO 1: Descargar la herramienta de red (solo la primera vez)
Como estás dentro del contenedor de la base de datos, primero debemos instalar una herramienta para descargar archivos:
```bash
apt-get update && apt-get install -y wget
```
*(Presiona Enter y espera a que termine de instalar)*

### PASO 2: Descargar el archivo de migración desde GitHub
Ejecuta esto para que el contenedor descargue el SQL maestro que creamos:
```bash
wget https://raw.githubusercontent.com/espalhardigital-hash/logicakids/desarrollo/final_migration.sql
```

### PASO 3: Aplicar en Desarrollo
Ahora inyectaremos ese archivo a tu base de datos de desarrollo usando este comando exacto:
```bash
psql -U logicakids_admin_desarrollo -d bd_logicakids_desarrollo < final_migration.sql
```

### PASO 4: Aplicar en Producción
Para inyectar esas mismas preguntas en la base de datos de producción (que vive en el mismo contenedor principal), ejecuta:
```bash
psql -U logicakids_admin_producion -d bd_logicakids_producion < final_migration.sql
```

¡Listo! Si no ves errores en la pantalla al ejecutar los comandos de `psql`, ambos entornos tendrán el 100% de las nuevas preguntas manteniendo intactos a los usuarios y sus progresos.
