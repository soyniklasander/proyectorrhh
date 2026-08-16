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

    public static final String ACTION_START = "com.example.mockapp.START_MOCK";
    public static final String ACTION_STOP = "com.example.mockapp.STOP_MOCK";
    public static final String EXTRA_LAT = "LATITUDE";
    public static final String EXTRA_LON = "LONGITUDE";

    public static final String ACTION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";

    private LocationManager locationManager;
    private double targetLat;
    private double targetLon;
    private boolean isMocking = false;
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable mockLocationTask = new Runnable() {
        @Override
        public void run() {
            if (isMocking) {
                publishMockLocation();
                handler.postDelayed(this, 1000);
            }
        }
    };

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
                targetLat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
                targetLon = intent.getDoubleExtra(EXTRA_LON, 0.0);
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
            }
        }
        return START_STICKY;
    }

    private void startMocking() {
        if (isMocking) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                 locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        1, 1);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isMocking = true;

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(getString(R.string.notification_title))
                    .setContentText(getString(R.string.notification_text))
                    .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                    .setOngoing(true)
                    .build();

            startForeground(NOTIFICATION_ID, notification);
            handler.post(mockLocationTask);

        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: No se tienen permisos de mock location", e);
            sendErrorBroadcast();
            stopSelf();
        } catch (IllegalArgumentException e) {
            Log.w(TAG, "El proveedor ya existe: " + e.getMessage());
            isMocking = true;
            handler.post(mockLocationTask);
        }
    }

    private void publishMockLocation() {
        try {
            Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
            mockLocation.setLatitude(targetLat);
            mockLocation.setLongitude(targetLon);
            mockLocation.setAltitude(0.0);
            mockLocation.setAccuracy(5.0f);
            mockLocation.setTime(System.currentTimeMillis());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
            }

            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (Exception e) {
            Log.e(TAG, "Error al publicar la ubicación de prueba", e);
        }
    }

    private void stopMocking() {
        isMocking = false;
        handler.removeCallbacks(mockLocationTask);
        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (IllegalArgumentException e) {
                 Log.w(TAG, "Error al remover el proveedor, o ya fue removido: " + e.getMessage());
            } catch (Exception e) {
                Log.e(TAG, "Error al remover el proveedor de prueba", e);
            }
        }
        stopForeground(true);
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Mock Location Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent(ACTION_ERROR);
        sendBroadcast(intent);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMocking();
    }
}
