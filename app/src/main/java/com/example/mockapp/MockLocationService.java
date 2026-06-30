package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {
    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";
    public static final String MOCK_LOCATION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";

    private LocationManager locationManager;
    private Thread mockThread;
    private boolean isRunning = false;
    private double latitude = 0.0;
    private double longitude = 0.0;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                latitude = intent.getDoubleExtra(EXTRA_LATITUDE, 0.0);
                longitude = intent.getDoubleExtra(EXTRA_LONGITUDE, 0.0);
                startForegroundService();
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    private void startForegroundService() {
        String channelId = "mock_location_channel";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "Simulador de Ubicación",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        Notification notification = new NotificationCompat.Builder(this, channelId)
                .setContentTitle("Simulando ubicación")
                .setContentText("Lat: " + latitude + ", Lon: " + longitude)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .build();

        startForeground(1, notification);
    }

    private void startMocking() {
        if (isRunning) return;
        isRunning = true;

        try {
            locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER, false, false, false, false, true,
                    true, true, 0, 5
            );
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (IllegalArgumentException e) {
            // Test provider might already exist, try to set it enabled anyway
            try {
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            } catch (Exception ex) {
                // Ignore
            }
        } catch (SecurityException e) {
            sendBroadcast(new Intent(MOCK_LOCATION_ERROR));
            stopSelf();
            return;
        }

        mockThread = new Thread(() -> {
            while (isRunning) {
                try {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(latitude);
                    mockLocation.setLongitude(longitude);
                    mockLocation.setAltitude(0.0);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setAccuracy(1.0f);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                    }
                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);

                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (SecurityException e) {
                    sendBroadcast(new Intent(MOCK_LOCATION_ERROR));
                    stopSelf();
                    break;
                }
            }
        });
        mockThread.start();
    }

    private void stopMocking() {
        isRunning = false;
        if (mockThread != null) {
            mockThread.interrupt();
            mockThread = null;
        }
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (Exception ignored) {
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
}
