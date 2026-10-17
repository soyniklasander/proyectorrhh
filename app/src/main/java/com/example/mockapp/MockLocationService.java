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

    private LocationManager locationManager;
    private Handler handler;
    private Runnable mockLocationRunnable;
    private double currentLat = 0.0;
    private double currentLon = 0.0;
    private boolean isProviderAdded = false;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.hasExtra("lat") && intent.hasExtra("lon")) {
            currentLat = intent.getDoubleExtra("lat", 0.0);
            currentLon = intent.getDoubleExtra("lon", 0.0);
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.mock_active))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        startMocking();

        return START_STICKY;
    }

    private void startMocking() {
        try {
            if (!isProviderAdded) {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        ProviderProperties.POWER_USAGE_LOW,
                        ProviderProperties.ACCURACY_FINE
                );
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
                isProviderAdded = true;
            }
        } catch (SecurityException e) {
            sendErrorBroadcast();
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            // Provider already exists or other error
        }

        if (mockLocationRunnable == null) {
            mockLocationRunnable = new Runnable() {
                @Override
                public void run() {
                    try {
                        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                        mockLocation.setLatitude(currentLat);
                        mockLocation.setLongitude(currentLon);
                        mockLocation.setAltitude(0);
                        mockLocation.setAccuracy(1.0f);
                        mockLocation.setTime(System.currentTimeMillis());
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                        handler.postDelayed(this, 1000); // update every second
                    } catch (SecurityException e) {
                        sendErrorBroadcast();
                        stopSelf();
                    } catch (IllegalArgumentException e) {
                        // ignore
                    }
                }
            };
            handler.post(mockLocationRunnable);
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent("MOCK_LOCATION_ERROR");
        sendBroadcast(intent);
    }

    private void stopMocking() {
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
            mockLocationRunnable = null;
        }
        if (isProviderAdded && locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (Exception e) {
                // ignore
            }
            isProviderAdded = false;
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
                    getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
