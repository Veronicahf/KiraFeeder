# Kira Feeder · Sincronización JSON/XML

Interfaz para visualizar la misma configuración de un dispensador inteligente en los formatos que usan la aplicación móvil y los sistemas heredados.

## Ejecutar

Desde esta carpeta, inicia un servidor estático:

```bash
python3 -m http.server 8000
```

Abre <http://localhost:8000> en el navegador.

## Cambiar los datos

Edita `data.json` y/o `data.xml`. Pulsa **Actualizar** en la interfaz para volver a leer ambos archivos y reflejar los cambios. La vista también intenta refrescar los datos automáticamente cada 5 segundos.

Los dos archivos representan la misma estructura:

- Identificador del dispositivo
- Nombre de la mascota
- Estado de conexión
- Rutinas con horario, fecha, hora, porción en gramos y tipo de alimento
