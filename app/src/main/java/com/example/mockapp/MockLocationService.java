package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LAT = "EXTRA_LAT";
    public static final String EXTRA_LON = "EXTRA_LON";

    private LocationManager locationManager;
    private boolean isMocking = false;
    private double currentLat = 0.0;
    private double currentLon = 0.0;

    private Handler handler;
    private Runnable mockRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                currentLat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
                currentLon = intent.getDoubleExtra(EXTRA_LON, 0.0);
                startMocking();
                startForeground(NOTIFICATION_ID, createNotification());
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
                stopForeground(true);
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    private void startMocking() {
        if (isMocking) return;

        try {
            locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true, 0, 5
            );
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isMocking = true;

            mockRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isMocking) {
                        setMockLocation(currentLat, currentLon);
                        handler.postDelayed(this, 1000); // Actualizar cada segundo
                    }
                }
            };
            handler.post(mockRunnable);

        } catch (SecurityException e) {
            Log.e(TAG, "Error: La aplicación no está configurada como 'App de ubicación de prueba' en Opciones de Desarrollador.", e);
            Intent errorIntent = new Intent("MOCK_LOCATION_ERROR");
            sendBroadcast(errorIntent);
            stopSelf();
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Error al configurar el proveedor de prueba", e);
        }
    }

    private void setMockLocation(double lat, double lon) {
        try {
            Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
            mockLocation.setLatitude(lat);
            mockLocation.setLongitude(lon);
            mockLocation.setAltitude(0);
            mockLocation.setTime(System.currentTimeMillis());
            mockLocation.setAccuracy(5f);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
            }

            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (SecurityException | IllegalArgumentException e) {
            Log.e(TAG, "Error al establecer la ubicación de prueba", e);
        }
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockRunnable != null) {
            handler.removeCallbacks(mockRunnable);
        }
        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (SecurityException | IllegalArgumentException e) {
            Log.e(TAG, "Error al remover el proveedor de prueba", e);
        }
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Canal de Servicio de Simulación",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Simulador GPS Activo")
                .setContentText("Simulando ubicación...")
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
    }
}
