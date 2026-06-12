# INSTRUCCIONES PARA APLICAR MIGRACIÓN EN LA VPS

Ya que no tenemos conexión SSH, deberás aplicar estos archivos a través de la interfaz web de Portainer en tu VPS.

## 1. MIGRACIÓN EN DESARROLLO
1. Ve al Portainer de tu VPS.
2. Ingresa a la consola (`>_ Console`) del contenedor de PostgreSQL de desarrollo (suele llamarse `base_postgres_general`).
3. Abre el archivo `final_migration.sql` que está en tu PC local (D:\Antigravity\APP_Logica_Matematicas_kids\final_migration.sql).
4. Copia TODO el contenido del archivo.
5. En la consola de Portainer, ejecuta `psql -U logicakids_admin_desarrollo -d bd_logicakids_desarrollo`
6. Pega todo el contenido copiado y presiona Enter.

## 2. MIGRACIÓN EN PRODUCCIÓN
El proceso es idéntico, he creado una copia llamada `final_migration_producion.sql` para evitar confusiones, aunque el contenido es exactamente el mismo:

1. En Portainer, ingresa a la consola (`>_ Console`) del contenedor de PostgreSQL de Producción (su contenedor en el stack `matematicas-producion` o el contenedor compartido `base_postgres_general`).
2. Abre el archivo `final_migration_producion.sql` en tu PC (D:\Antigravity\APP_Logica_Matematicas_kids\final_migration_producion.sql).
3. Copia TODO el contenido.
4. En la consola de Portainer, ejecuta `psql -U logicakids_admin_producion -d bd_logicakids_producion`
5. Pega todo el contenido copiado y presiona Enter.

¡Listo! Con esto, ambos entornos tendrán el 100% de las nuevas preguntas manteniendo intactos a los usuarios y sus progresos.
