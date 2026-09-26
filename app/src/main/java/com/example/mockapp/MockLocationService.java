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
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;

public class MockLocationService extends Service {
    private static final String CHANNEL_ID = "MockLocationChannel";
    public static final String MOCK_LOCATION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";
    private LocationManager locationManager;
    private boolean isMocking = false;
    private double lat = 0.0;
    private double lon = 0.0;
    private Handler handler;
    private Runnable mockRunnable;

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
            if ("STOP".equals(intent.getAction())) {
                stopMocking();
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            } else {
                lat = intent.getDoubleExtra("lat", 0.0);
                lon = intent.getDoubleExtra("lon", 0.0);
                Notification notification = createNotification();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
                } else {
                    startForeground(1, notification);
                }
                startMocking();
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
        } catch (IllegalArgumentException e) {
            // Already added or not allowed
        } catch (SecurityException e) {
            sendBroadcast(new Intent(MOCK_LOCATION_ERROR));
            stopSelf();
            return;
        }

        isMocking = true;
        mockRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isMocking) return;

                Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                mockLocation.setLatitude(lat);
                mockLocation.setLongitude(lon);
                mockLocation.setAltitude(0);
                mockLocation.setAccuracy(5.0f);
                mockLocation.setTime(System.currentTimeMillis());
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                }

                try {
                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                } catch (SecurityException | IllegalArgumentException e) {
                    // Ignored
                }

                handler.postDelayed(this, 1000);
            }
        };
        handler.post(mockRunnable);
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockRunnable != null) {
            handler.removeCallbacks(mockRunnable);
        }
        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (IllegalArgumentException e) {
                // Ignored
            }
        }
    }

    private Notification createNotification() {
        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        return builder
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
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
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
    }
}
