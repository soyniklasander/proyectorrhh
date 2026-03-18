# Simulador de GPS (MockApp)

Esta es una aplicación nativa de Android diseñada para simular tu ubicación GPS, ideal para cuando necesitas compartir ubicaciones específicas o probar el comportamiento basado en la ubicación de otras aplicaciones. Está construida usando Java y hace uso de Foreground Services (servicios en primer plano) para que la simulación de ubicación continúe en segundo plano.

## Funciones
- Introduce una latitud y longitud específicas a las que deseas simular.
- Se ejecuta en segundo plano como un Foreground Service con una notificación continua.
- Completamente en español.

## Requisitos de instalación y Configuración
Para que esta aplicación pueda simular tu ubicación, requiere un paso de configuración adicional usando las Opciones de Desarrollador de tu dispositivo Android:

1.  **Instala la aplicación** (el APK se puede encontrar en `app/build/outputs/apk/release/app-release-unsigned.apk` después de compilar, o `app/build/outputs/apk/debug/app-debug.apk`).
2.  **Habilita las opciones de desarrollador:** Si aún no las has habilitado, ve a Configuración -> Acerca del teléfono y toca "Número de compilación" 7 veces.
3.  **Configura la aplicación para simular ubicación:**
    *   Ve a Configuración -> Sistema -> Opciones de desarrollador (o simplemente busca "Opciones de desarrollador" en la configuración).
    *   Desplázate hacia abajo hasta la sección **Depuración** y busca una opción que dice **"Elegir aplicación para simular ubicación"** (o "Seleccionar aplicación de ubicación de prueba").
    *   Toca allí y selecciona **Simulador de GPS** (o "MockApp").
4.  **Permisos:** Cuando abras la app por primera vez, te pedirá permisos de ubicación y notificaciones (en Android 13+). Debes concederlos para que la app funcione.

## Cómo usarla
1.  Abre la aplicación.
2.  Introduce la **Latitud** y **Longitud** del lugar que deseas simular.
3.  Presiona **Iniciar Simulación**. Verás un mensaje indicando que el servicio ha comenzado, y una notificación persistente aparecerá en la barra de estado.
4.  Abre Google Maps, WhatsApp o cualquier otra app, y verás que tu ubicación actual es la que introdujiste en el simulador.
5.  Para detener la simulación, vuelve a la aplicación y presiona **Detener Simulación**.
