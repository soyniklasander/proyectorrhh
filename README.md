# MockApp

MockApp es una aplicación Android que te permite simular la ubicación GPS de tu dispositivo utilizando un mapa interactivo.

## Funcionalidades
- Selección de coordenadas en tiempo real a través del mapa de OpenStreetMap (osmdroid).
- Simulación continua en segundo plano mediante Foreground Service.
- UI sencilla para iniciar y detener el servicio.

## Instrucciones de Instalación
La APK está ubicada en `app/build/outputs/apk/debug/app-debug.apk`.

Para que la aplicación funcione, es indispensable habilitarla en los ajustes de desarrollo de Android:
1. Activa las **Opciones de desarrollador** (pulsando 7 veces en "Número de compilación" en la información de software de tu teléfono).
2. Ve a las **Opciones de desarrollador**.
3. Busca la opción **Elegir aplicación para simular ubicación** (o *Mock location app*).
4. Selecciona **MockApp**.
