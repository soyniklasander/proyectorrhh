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

    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String PROVIDER = LocationManager.GPS_PROVIDER;

    private LocationManager locationManager;
    private Handler handler;
    private Runnable mockLocationRunnable;
    private double lat;
    private double lon;
    private boolean isRunning = false;

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
            lat = intent.getDoubleExtra("lat", 0.0);
            lon = intent.getDoubleExtra("lon", 0.0);
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        startMocking();

        return START_STICKY;
    }

    private void startMocking() {
        if (isRunning) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(PROVIDER,
                        false, false, false, false, true, true, true,
                        ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                locationManager.addTestProvider(PROVIDER,
                        false, false, false, false, true, true, true,
                        0, 1);
            }
            locationManager.setTestProviderEnabled(PROVIDER, true);
        } catch (IllegalArgumentException | SecurityException e) {
            e.printStackTrace();
            sendBroadcast(new Intent("com.example.mockapp.MOCK_LOCATION_ERROR"));
            stopSelf();
            return;
        }

        isRunning = true;
        mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isRunning) return;

                Location mockLocation = new Location(PROVIDER);
                mockLocation.setLatitude(lat);
                mockLocation.setLongitude(lon);
                mockLocation.setAltitude(0.0);
                mockLocation.setAccuracy(5.0f);
                mockLocation.setTime(System.currentTimeMillis());

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                }

                try {
                    locationManager.setTestProviderLocation(PROVIDER, mockLocation);
                } catch (IllegalArgumentException | SecurityException e) {
                    e.printStackTrace();
                }

                handler.postDelayed(this, 1000);
            }
        };
        handler.post(mockLocationRunnable);
    }

    private void stopMocking() {
        isRunning = false;
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(PROVIDER);
            }
        } catch (IllegalArgumentException | SecurityException e) {
            e.printStackTrace();
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
                    "Mock Location Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}