# MockApp - Simulador de Ubicación (GPS Fake)

## Descripción
MockApp es una aplicación Android que te permite falsear o simular tu ubicación GPS de forma rápida y sencilla en cualquier otra aplicación que utilice los servicios de ubicación, como aplicaciones de mensajería (para compartir ubicación en tiempo real), mapas, etc.

El proyecto está creado desde cero y funciona de manera autónoma sin requerir ningún servicio externo, todo se hace a través de `osmdroid` para la selección del mapa.

## Características
* **Mapa Interactivo:** Permite seleccionar la ubicación exacta en el mapa moviéndolo y haciendo zoom, utilizando la librería open source *osmdroid*.
* **Simulación en Tiempo Real:** Envía la ubicación falsa a tu dispositivo constantemente de modo que no se detecten saltos entre tu ubicación real y la falsa.
* **Foreground Service:** Sigue simulando tu ubicación incluso con la aplicación en segundo plano. Muestra una notificación persistente de estado.
* **Español:** Toda la interfaz y notificaciones están pensadas para el público hispanohablante.

## Requisitos de Instalación / Uso
Para que la simulación de ubicación funcione, debes darle permiso a la aplicación desde las opciones de desarrollador:
1. Ve a **Ajustes** -> **Acerca del teléfono** y toca repetidamente en **Número de compilación** (u opciones equivalentes) unas 7 veces hasta que aparezca "Ahora eres un desarrollador".
2. Ve a **Ajustes** -> **Sistema** -> **Opciones de desarrollador**.
3. Busca la opción **Elegir aplicación para simular ubicación** (o "Select mock location app").
4. Selecciona **MockApp** (o Ubicación Simulada).

## Compilación del Proyecto
El proyecto está basado en Gradle 8.7 y Android Gradle Plugin 8.4.0, utilizando Java 17.
Para compilar y obtener la APK:
```bash
./gradlew assembleDebug
```
El APK se generará en la ruta: `app/build/outputs/apk/debug/app-debug.apk`

## Licencia
Proyecto libre.
