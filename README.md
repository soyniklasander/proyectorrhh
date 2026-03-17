# Simulador de Ubicación GPS (MockApp)

Esta es una aplicación nativa para Android que te permite simular la ubicación GPS de tu dispositivo, útil para probar aplicaciones que requieren datos de ubicación.

## Instalación y Configuración

1.  **Instala el APK:** Instala la aplicación en tu dispositivo Android.
2.  **Habilita las Opciones de Desarrollador:**
    *   Ve a la Configuración de tu dispositivo.
    *   Busca "Acerca del teléfono" o "Información del teléfono".
    *   Toca 7 veces seguidas en "Número de compilación" para activar las opciones de desarrollador.
3.  **Configura la Aplicación de Ubicación de Prueba:**
    *   Ve a Configuración -> Sistema -> Opciones de Desarrollador.
    *   Busca la opción "Seleccionar aplicación de ubicación de prueba" (o "Elegir aplicación de ubicación falsa").
    *   Selecciona "Simulador de Ubicación" (MockApp).

## Uso de la Aplicación

1.  Abre la aplicación "Simulador de Ubicación".
2.  Concede los permisos solicitados (Ubicación y Notificaciones).
3.  Ingresa la **Latitud** y **Longitud** de la ubicación que deseas simular.
4.  Presiona el botón **"Iniciar Simulación"**.
5.  Aparecerá una notificación permanente indicando que el servicio está activo. Todas las aplicaciones en tu dispositivo creerán que estás en esa ubicación.
6.  Para detener la simulación, vuelve a la aplicación y presiona **"Detener Simulación"**.
