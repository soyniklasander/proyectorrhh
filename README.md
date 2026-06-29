# Ubicación Simulada (MockApp)

Aplicación Android para simular (spoof) tu ubicación GPS en tiempo real.

## Requisitos

- Android 7.0 (API 24) o superior.

## Instrucciones de Instalación y Uso

1. **Instalar el APK:** Compila el proyecto con Gradle (`gradle assembleDebug`) e instala el APK generado en tu dispositivo.
2. **Habilitar Opciones de Desarrollador:** Si no las tienes activadas, ve a "Ajustes" > "Acerca del teléfono" y toca 7 veces en "Número de compilación".
3. **Seleccionar Aplicación de Ubicación de Prueba:**
   - Ve a "Ajustes" > "Opciones de Desarrollador".
   - Busca la opción "Elegir aplicación para simular ubicación" (o "Select mock location app").
   - Selecciona "Ubicación Simulada".
4. **Uso de la Aplicación:**
   - Abre la aplicación. Concede los permisos requeridos (Ubicación y Notificaciones).
   - Toca en cualquier lugar del mapa para seleccionar la ubicación deseada.
   - Presiona "Iniciar Simulación". Una notificación persistente aparecerá, indicando que la simulación está activa.
   - Para detener, presiona "Detener Simulación".

> **Nota:** Si intentas iniciar la simulación sin haber seleccionado la aplicación en las opciones de desarrollador, la aplicación mostrará un mensaje indicando que debes hacerlo.
