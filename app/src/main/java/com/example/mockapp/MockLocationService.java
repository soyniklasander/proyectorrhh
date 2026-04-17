package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.os.SystemClock;

import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationServiceChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private Thread mockLocationThread;
    private boolean isMocking = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(R.mipmap.ic_launcher)
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        if (intent != null && intent.hasExtra("lat") && intent.hasExtra("lon")) {
            double lat = intent.getDoubleExtra("lat", 0);
            double lon = intent.getDoubleExtra("lon", 0);
            startMocking(lat, lon);
        }

        return START_STICKY;
    }

    private void startMocking(double lat, double lon) {
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);

        try {
            locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, false, true, true, 1, 1);
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (SecurityException e) {
            // App is not set as mock location app in developer options
            Intent errorIntent = new Intent("com.example.mockapp.MOCK_LOCATION_ERROR");
            errorIntent.setPackage(getPackageName());
            sendBroadcast(errorIntent);
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            // Provider already exists
        }

        isMocking = true;
        mockLocationThread = new Thread(() -> {
            while (isMocking) {
                Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                mockLocation.setLatitude(lat);
                mockLocation.setLongitude(lon);
                mockLocation.setAltitude(0.0);
                mockLocation.setTime(System.currentTimeMillis());
                mockLocation.setAccuracy(1.0f);
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                try {
                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                } catch (SecurityException e) {
                    // App lost mock location permission
                    Intent errorIntent = new Intent("com.example.mockapp.MOCK_LOCATION_ERROR");
                    errorIntent.setPackage(getPackageName());
                    sendBroadcast(errorIntent);
                    isMocking = false;
                    stopSelf();
                    break;
                } catch (Exception e) {
                    // Ignore other exceptions
                }

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });
        mockLocationThread.start();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isMocking = false;
        if (mockLocationThread != null) {
            mockLocationThread.interrupt();
        }

        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (Exception ignored) {
            }
        }
    }

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
