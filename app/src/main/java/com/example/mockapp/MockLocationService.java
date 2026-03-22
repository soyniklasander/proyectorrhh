package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationServiceChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private Handler handler;
    private Runnable mockLocationRunnable;

    private double lat;
    private double lon;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            lat = intent.getDoubleExtra("lat", 0.0);
            lon = intent.getDoubleExtra("lon", 0.0);
        }

        createNotificationChannel();
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);
        startMocking();

        return START_STICKY;
    }

    private void startMocking() {
        if (locationManager == null) return;

        try {
            locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false,
                    true, true, true, 0, 5);
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (Exception e) {
            e.printStackTrace();
        }

        mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                try {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(lat);
                    mockLocation.setLongitude(lon);
                    mockLocation.setAltitude(0);
                    mockLocation.setAccuracy(5f);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                } catch (Exception e) {
                    e.printStackTrace();
                }

                handler.postDelayed(this, 1000); // 1 actualización por segundo
            }
        };

        handler.post(mockLocationRunnable);
    }

    private void stopMocking() {
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
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
        return null; // Not bound service
    }
}
