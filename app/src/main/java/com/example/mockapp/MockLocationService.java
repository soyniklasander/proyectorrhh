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

    private static final String CHANNEL_ID = "MockLocationServiceChannel";
    private LocationManager locationManager;
    private double currentLat;
    private double currentLon;
    private Handler handler;
    private boolean isMocking = false;

    private final Runnable mockLocationRunnable = new Runnable() {
        @Override
        public void run() {
            if (isMocking) {
                setMockLocation(currentLat, currentLon);
                handler.postDelayed(this, 1000); // Update every second
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        Notification.Builder builder = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.start_mocking))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation);

        Notification notification = builder.build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(1, notification);
        }

        if (intent != null) {
            currentLat = intent.getDoubleExtra("lat", 0.0);
            currentLon = intent.getDoubleExtra("lon", 0.0);
        }

        startMockLocation();

        return START_NOT_STICKY;
    }

    private void startMockLocation() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER,
                        false, false, false, false, true,
                        true, true, ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER,
                        false, false, false, false, true,
                        true, true, 1, 1);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isMocking = true;
            handler.post(mockLocationRunnable);
        } catch (SecurityException | IllegalArgumentException e) {
            broadcastError();
            stopSelf();
        }
    }

    private void setMockLocation(double lat, double lon) {
        try {
            Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
            mockLocation.setLatitude(lat);
            mockLocation.setLongitude(lon);
            mockLocation.setAltitude(0.0);
            mockLocation.setAccuracy(1.0f);
            mockLocation.setTime(System.currentTimeMillis());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
            }

            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (SecurityException | IllegalArgumentException e) {
            broadcastError();
            stopSelf();
        }
    }

    private void broadcastError() {
        Intent errorIntent = new Intent("com.example.mockapp.MOCK_LOCATION_ERROR");
        errorIntent.setPackage(getPackageName());
        sendBroadcast(errorIntent);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isMocking = false;
        handler.removeCallbacks(mockLocationRunnable);
        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (SecurityException | IllegalArgumentException ignored) {
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
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
