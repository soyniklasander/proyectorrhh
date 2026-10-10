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
import android.util.Log;

public class MockLocationService extends Service {
    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LAT = "EXTRA_LAT";
    public static final String EXTRA_LON = "EXTRA_LON";
    public static final String ACTION_ERROR = "MOCK_LOCATION_ERROR";

    private LocationManager locationManager;
    private boolean isRunning = false;
    private double currentLat = 0.0;
    private double currentLon = 0.0;
    private Thread mockThread;

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
                currentLat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
                currentLon = intent.getDoubleExtra(EXTRA_LON, 0.0);
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
            }
        }
        return START_NOT_STICKY;
    }

    private void startMocking() {
        if (isRunning) return;

        Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(1, notification);
        }

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
                        1, 1 // old API power/accuracy ints
                );
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isRunning = true;

            mockThread = new Thread(() -> {
                while (isRunning) {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(currentLat);
                    mockLocation.setLongitude(currentLon);
                    mockLocation.setAltitude(0.0);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setAccuracy(1.0f);
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    try {
                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                        Thread.sleep(1000);
                    } catch (InterruptedException | IllegalArgumentException e) {
                        Log.e(TAG, "Error setting mock location", e);
                    }
                }
            });
            mockThread.start();

        } catch (SecurityException e) {
            Log.e(TAG, "Mock location not permitted", e);
            sendBroadcast(new Intent(ACTION_ERROR));
            stopSelf();
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Test provider error", e);
            // sometimes it already exists
            try {
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
                isRunning = true;
            } catch (Exception ex) {
                Log.e(TAG, "Failed to enable existing test provider", ex);
                stopSelf();
            }
        }
    }

    private void stopMocking() {
        isRunning = false;
        if (mockThread != null) {
            mockThread.interrupt();
            mockThread = null;
        }
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (Exception e) {
            Log.e(TAG, "Error removing test provider", e);
        }
        stopForeground(true);
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    getString(R.string.service_channel_name),
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
    }
}
