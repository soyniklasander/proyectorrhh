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

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {
    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";
    public static final String MOCK_LOCATION_ERROR = "MOCK_LOCATION_ERROR";

    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final int UPDATE_INTERVAL_MS = 1000;

    private LocationManager locationManager;
    private Handler handler;
    private Runnable mockLocationRunnable;
    private double currentLatitude;
    private double currentLongitude;
    private boolean isMocking = false;

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
                currentLatitude = intent.getDoubleExtra(EXTRA_LATITUDE, 0.0);
                currentLongitude = intent.getDoubleExtra(EXTRA_LONGITUDE, 0.0);
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
            sendBroadcast(new Intent(MOCK_LOCATION_ERROR));
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            // Test provider might already exist
        }

        isMocking = true;
        mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isMocking) return;

                Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                mockLocation.setLatitude(currentLatitude);
                mockLocation.setLongitude(currentLongitude);
                mockLocation.setAltitude(0);
                mockLocation.setTime(System.currentTimeMillis());
                mockLocation.setAccuracy(1f);
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                try {
                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                } catch (SecurityException e) {
                    sendBroadcast(new Intent(MOCK_LOCATION_ERROR));
                    stopMocking();
                    stopSelf();
                    return;
                }

                handler.postDelayed(this, UPDATE_INTERVAL_MS);
            }
        };
        handler.post(mockLocationRunnable);
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (IllegalArgumentException | SecurityException e) {
                // Ignore if provider doesn't exist or no permission
            }
        }
    }

    private Notification createNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
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

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}