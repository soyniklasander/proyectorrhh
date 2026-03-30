# Simulador GPS (Mock Location App)

Esta es una aplicación de Android construida desde cero que te permite simular tu ubicación GPS para pruebas o propósitos como compartir una ubicación falsa en tiempo real.

## Requisitos
- Android 7.0 (API 24) en adelante.

## Cómo usarla
1. Compila e instala la aplicación APK.
2. Abre la aplicación y te pedirá habilitar las opciones de desarrollador para elegir esta aplicación como tu aplicación de "Ubicación de prueba" (Mock Location App).
3. Dentro de la aplicación, introduce la latitud y la longitud deseadas.
4. Presiona el botón "Iniciar Simulación".
5. Tu ubicación será sobrescrita continuamente usando un servicio en primer plano.
6. Presiona el botón "Detener Simulación" para volver a tu ubicación real.

## Desarrollo
El proyecto es una app estándar de Android con Kotlin y las bibliotecas habituales (AndroidX, Material Design). Se ha configurado con Gradle (AGP 8.4.0, Kotlin 1.9.22). Puedes construir el proyecto ejecutando:

```bash
./gradlew assembleDebug
```
