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
import android.os.IBinder;
import android.os.SystemClock;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {
    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private Thread mockThread;
    private boolean isMocking = false;

    private double latitude = 40.7128;
    private double longitude = -74.0060;

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
            if ("STOP".equals(action)) {
                stopMocking();
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            } else {
                latitude = intent.getDoubleExtra("LATITUDE", 40.7128);
                longitude = intent.getDoubleExtra("LONGITUDE", -74.0060);
                startForeground(NOTIFICATION_ID, buildNotification());
                startMocking();
            }
        }
        return START_STICKY;
    }

    private void startMocking() {
        if (isMocking) return;
        isMocking = true;

        try {
            locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true,
                    ProviderProperties.POWER_USAGE_LOW,
                    ProviderProperties.ACCURACY_FINE
            );
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (SecurityException e) {
            Log.e(TAG, "Mock location permission not granted", e);
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Provider already exists", e);
        }

        mockThread = new Thread(() -> {
            while (isMocking) {
                try {
                    Location location = new Location(LocationManager.GPS_PROVIDER);
                    location.setLatitude(latitude);
                    location.setLongitude(longitude);
                    location.setAccuracy(1.0f);
                    location.setAltitude(0.0);
                    location.setTime(System.currentTimeMillis());
                    location.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, location);
                    Thread.sleep(1000); // Update every 1 second
                } catch (InterruptedException | SecurityException e) {
                    Log.e(TAG, "Mock thread interrupted or permission lost", e);
                    break;
                }
            }
        });
        mockThread.start();
    }

    private void stopMocking() {
        isMocking = false;
        if (mockThread != null) {
            mockThread.interrupt();
            mockThread = null;
        }
        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error removing test provider", e);
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

    private Notification buildNotification() {
        Intent stopIntent = new Intent(this, MockLocationService.class);
        stopIntent.setAction("STOP");
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingStopIntent = PendingIntent.getService(this, 0, stopIntent, flags);

        Intent mainIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingMainIntent = PendingIntent.getActivity(this, 0, mainIntent, flags);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Mock GPS Active")
                .setContentText("Spoofing location to: " + latitude + ", " + longitude)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingMainIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", pendingStopIntent)
                .setOngoing(true)
                .build();
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
}
