package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.location.provider.ProviderProperties;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    public static final String ACTION_START_MOCKING = "START_MOCKING";
    public static final String ACTION_STOP_MOCKING = "STOP_MOCKING";
    public static final String EXTRA_LAT = "LATITUDE";
    public static final String EXTRA_LON = "LONGITUDE";

    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private boolean isMocking = false;
    private double currentLat;
    private double currentLon;

    private HandlerThread handlerThread;
    private Handler handler;
    private final Runnable mockLocationRunnable = new Runnable() {
        @Override
        public void run() {
            if (isMocking) {
                publishMockLocation(currentLat, currentLon);
                handler.postDelayed(this, 1000); // Actualizar cada segundo
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handlerThread = new HandlerThread("MockLocationThread");
        handlerThread.start();
        handler = new Handler(handlerThread.getLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START_MOCKING.equals(action)) {
                currentLat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
                currentLon = intent.getDoubleExtra(EXTRA_LON, 0.0);
                startMockLocation();
            } else if (ACTION_STOP_MOCKING.equals(action)) {
                stopMockLocation();
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    private void startMockLocation() {
        createNotificationChannel();
        Notification notification = new NotificationCompat.Builder(this, getString(R.string.notification_channel_id))
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        ProviderProperties.POWER_USAGE_LOW,
                        ProviderProperties.ACCURACY_FINE
                );
            } else {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        1, 1
                );
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isMocking = true;
            handler.post(mockLocationRunnable);
        } catch (IllegalArgumentException e) {
            // El proveedor de pruebas ya existe o no se puede registrar
            sendErrorBroadcast();
        } catch (SecurityException e) {
            // Permiso denegado (App Ops)
            sendErrorBroadcast();
        }
    }

    private void stopMockLocation() {
        isMocking = false;
        handler.removeCallbacks(mockLocationRunnable);
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (IllegalArgumentException e) {
            // Ignorar si el proveedor no existe
        }
        stopForeground(true);
    }

    private void publishMockLocation(double lat, double lon) {
        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
        mockLocation.setLatitude(lat);
        mockLocation.setLongitude(lon);
        mockLocation.setAltitude(0);
        mockLocation.setTime(System.currentTimeMillis());
        mockLocation.setAccuracy(1.0f);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
        }

        try {
            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (SecurityException | IllegalArgumentException e) {
            isMocking = false;
            sendErrorBroadcast();
            stopSelf();
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent(MainActivity.ACTION_MOCK_LOCATION_ERROR);
        sendBroadcast(intent);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    getString(R.string.notification_channel_id),
                    getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMockLocation();
        if (handlerThread != null) {
            handlerThread.quit();
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
