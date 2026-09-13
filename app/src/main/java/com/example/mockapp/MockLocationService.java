package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationManager;
import android.location.provider.ProviderProperties;
import android.os.Build;
import android.os.IBinder;
import android.os.SystemClock;

public class MockLocationService extends Service {
    public static final String ACTION_START = "com.example.mockapp.START_SPOOFING";
    public static final String ACTION_STOP = "com.example.mockapp.STOP_SPOOFING";
    public static final String EXTRA_LAT = "lat";
    public static final String EXTRA_LON = "lon";
    public static final String ACTION_MOCK_ERROR = "com.example.mockapp.MOCK_ERROR";

    private LocationManager locationManager;
    private boolean isSpoofing = false;
    private Thread spoofingThread;
    private double currentLat = 0;
    private double currentLon = 0;
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

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
                currentLat = intent.getDoubleExtra(EXTRA_LAT, 0);
                currentLon = intent.getDoubleExtra(EXTRA_LON, 0);
                startSpoofing();
            } else if (ACTION_STOP.equals(action)) {
                stopSpoofing();
            }
        }
        return START_NOT_STICKY;
    }

    private void startSpoofing() {
        if (isSpoofing) {
            return;
        }

        Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

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
        } catch (SecurityException e) {
            broadcastError();
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            // Test provider might already exist, which is fine
        }

        isSpoofing = true;
        spoofingThread = new Thread(new Runnable() {
            @Override
            public void run() {
                while (isSpoofing) {
                    try {
                        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                        mockLocation.setLatitude(currentLat);
                        mockLocation.setLongitude(currentLon);
                        mockLocation.setAltitude(0);
                        mockLocation.setTime(System.currentTimeMillis());
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                            mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                        }
                        mockLocation.setAccuracy(1.0f);

                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);

                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } catch (SecurityException e) {
                        isSpoofing = false;
                        broadcastError();
                        stopSelf();
                        break;
                    } catch (IllegalArgumentException e) {
                        // Provider might be removed
                    }
                }
            }
        });
        spoofingThread.start();
    }

    private void broadcastError() {
        Intent errorIntent = new Intent(ACTION_MOCK_ERROR);
        sendBroadcast(errorIntent);
    }

    private void stopSpoofing() {
        isSpoofing = false;
        if (spoofingThread != null) {
            spoofingThread.interrupt();
            spoofingThread = null;
        }

        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (IllegalArgumentException | SecurityException e) {
            // Ignore
        }

        stopForeground(true);
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Mock Location Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopSpoofing();
    }
}
