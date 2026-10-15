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
    private Runnable mockRunnable;
    private double currentLat = 0.0;
    private double currentLon = 0.0;
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
            String action = intent.getAction();
            if ("START_MOCK".equals(action)) {
                currentLat = intent.getDoubleExtra("LAT", 0.0);
                currentLon = intent.getDoubleExtra("LON", 0.0);
                if (!isRunning) {
                    startForegroundService();
                    startMocking();
                } else {
                    updateMockLocationOnly();
                }
            } else if ("STOP_MOCK".equals(action)) {
                stopMocking();
                stopForeground(true);
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    private void startForegroundService() {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void startMocking() {
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
                        1, // POWER_USAGE_LOW equivalent
                        1  // ACCURACY_FINE equivalent
                );
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);

            isRunning = true;
            mockRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isRunning) {
                        pushLocation(currentLat, currentLon);
                        handler.postDelayed(this, 1000); // Update every second
                    }
                }
            };
            handler.post(mockRunnable);

        } catch (SecurityException e) {
            broadcastError();
            stopSelf();
        } catch (IllegalArgumentException e) {
            // Provider might already exist or be missing, try removing and adding
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
                startMocking(); // Retry
            } catch (Exception ex) {
                broadcastError();
                stopSelf();
            }
        }
    }

    private void updateMockLocationOnly() {
        // Just push a new location immediately
        pushLocation(currentLat, currentLon);
    }

    private void pushLocation(double lat, double lon) {
        try {
            Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
            mockLocation.setLatitude(lat);
            mockLocation.setLongitude(lon);
            mockLocation.setAltitude(0);
            mockLocation.setTime(System.currentTimeMillis());
            mockLocation.setAccuracy(1.0f);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
            }

            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (Exception e) {
            // Error pushing location, possibly permission lost
            broadcastError();
            stopMocking();
            stopSelf();
        }
    }

    private void stopMocking() {
        isRunning = false;
        if (handler != null && mockRunnable != null) {
            handler.removeCallbacks(mockRunnable);
        }
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (Exception e) {
            // Ignore if provider doesn't exist
        }
    }

    private void broadcastError() {
        Intent intent = new Intent("MOCK_LOCATION_ERROR");
        intent.setPackage(getPackageName());
        sendBroadcast(intent);
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
