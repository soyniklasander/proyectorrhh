package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
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

import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private boolean isMocking = false;
    private double currentLat = 0.0;
    private double currentLon = 0.0;
    private Handler handler;
    private Runnable mockLocationRunnable;

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
            currentLat = intent.getDoubleExtra("lat", 0.0);
            currentLon = intent.getDoubleExtra("lon", 0.0);
        }

        startForeground(NOTIFICATION_ID, createNotification());
        startMocking();

        return START_STICKY;
    }

    private void startMocking() {
        if (isMocking) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, false, false, false,
                        ProviderProperties.POWER_USAGE_LOW,
                        ProviderProperties.ACCURACY_FINE
                );
            } else {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, false, false, false,
                        1, 1
                );
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (IllegalArgumentException e) {
            // Test provider already exists or cannot be added. Keep going.
            e.printStackTrace();
        } catch (SecurityException e) {
            broadcastError();
            stopSelf();
            return;
        }

        isMocking = true;

        mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isMocking) return;

                try {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(currentLat);
                    mockLocation.setLongitude(currentLon);
                    mockLocation.setAltitude(0);
                    mockLocation.setAccuracy(5.0f);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                } catch (SecurityException e) {
                    broadcastError();
                    stopSelf();
                    return;
                }

                handler.postDelayed(this, 1000);
            }
        };

        handler.post(mockLocationRunnable);
    }

    private void broadcastError() {
        Intent intent = new Intent("MOCK_LOCATION_ERROR");
        intent.setPackage(getPackageName());
        sendBroadcast(intent);
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
                e.printStackTrace();
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

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, flags);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.service_notification_title))
                .setContentText(getString(R.string.service_notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
    }
}
