# Simulador de GPS (Mock Location App)

Esta es una aplicación Android que te permite simular tu ubicación GPS para que otras aplicaciones en tu dispositivo (como mapas o cuando compartes tu ubicación en tiempo real) detecten la ubicación simulada en lugar de tu ubicación real.

## 🚀 Instalación y Uso

1. **Instalar la APK**: Instala la aplicación en tu dispositivo Android.
2. **Habilitar Opciones de Desarrollador**:
   - Ve a los ajustes de tu teléfono.
   - Navega hasta "Acerca del teléfono".
   - Toca repetidamente el "Número de compilación" unas 7 veces hasta que aparezca un mensaje indicando que eres desarrollador.
3. **Elegir Aplicación para Simular Ubicación**:
   - Ve a "Opciones para desarrolladores" en tus ajustes.
   - Busca la opción "Elegir aplicación para simular ubicación" (o "Select mock location app").
   - Selecciona **MockApp** de la lista.
4. **Usar la Aplicación**:
   - Abre la aplicación "Simulador de GPS".
   - Ingresa la Latitud y Longitud deseadas.
   - Presiona "Iniciar Simulación".
   - ¡Listo! Tu dispositivo ahora reportará la ubicación que ingresaste a todas las demás aplicaciones.

## 🛠️ Tecnologías

- Escrito en Java para Android.
- Usa Foreground Services para mantener la simulación de GPS activa en segundo plano.
- Compatible con Android 7.0 (API 24) en adelante.
