package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationManager;
import android.location.provider.ProviderProperties;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
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
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";

    private LocationManager locationManager;
    private Thread mockLocationThread;
    private boolean isRunning = false;
    private double currentLatitude = 0.0;
    private double currentLongitude = 0.0;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                currentLatitude = intent.getDoubleExtra(EXTRA_LATITUDE, 0.0);
                currentLongitude = intent.getDoubleExtra(EXTRA_LONGITUDE, 0.0);
                startForegroundService();
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
                stopForeground(true);
                stopSelf();
            }
        }
        return START_STICKY;
    }

    private void startForegroundService() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Ubicación Simulada Activa")
                .setContentText("Simulando ubicación en: " + currentLatitude + ", " + currentLongitude)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Canal de Ubicación Simulada",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private void startMocking() {
        if (isRunning) return;
        isRunning = true;

        try {
            if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (Exception ignored) {
        }

        try {
            locationManager.addTestProvider(LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true,
                    ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (SecurityException e) {
            Log.e(TAG, "Permiso de ubicación simulada no concedido. Ve a Opciones de Desarrollador.", e);
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Error añadiendo test provider", e);
        }

        mockLocationThread = new Thread(() -> {
            while (isRunning) {
                try {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(currentLatitude);
                    mockLocation.setLongitude(currentLongitude);
                    mockLocation.setAltitude(0);
                    mockLocation.setAccuracy(1.0f);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);

                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (SecurityException e) {
                    Log.e(TAG, "Permisos perdidos durante la simulación", e);
                    break;
                }
            }
        });
        mockLocationThread.start();
    }

    private void stopMocking() {
        isRunning = false;
        if (mockLocationThread != null) {
            mockLocationThread.interrupt();
            mockLocationThread = null;
        }
        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMocking();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
