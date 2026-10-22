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
import android.os.IBinder;
import android.os.SystemClock;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    private LocationManager locationManager;
    private Thread mockThread;
    private boolean isRunning = false;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        double lat = intent.getDoubleExtra("lat", 0.0);
        double lon = intent.getDoubleExtra("lon", 0.0);

        Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        startMocking(lat, lon);

        return START_STICKY;
    }

    private void startMocking(double lat, double lon) {
        if (isRunning) return;

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
        } catch (SecurityException e) {
            sendBroadcast(new Intent("MOCK_LOCATION_ERROR"));
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            // Provider already exists
        }

        isRunning = true;
        mockThread = new Thread(() -> {
            while (isRunning) {
                try {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(lat);
                    mockLocation.setLongitude(lon);
                    mockLocation.setAltitude(0);
                    mockLocation.setAccuracy(5.0f);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    try {
                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                    } catch (SecurityException e) {
                        sendBroadcast(new Intent("MOCK_LOCATION_ERROR"));
                        stopSelf();
                        break;
                    }

                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
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
        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (SecurityException | IllegalArgumentException e) {
                // Ignore
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
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
        stopMocking();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
