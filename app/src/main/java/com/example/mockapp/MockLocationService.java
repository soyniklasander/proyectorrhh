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

public class MockLocationService extends Service {
    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LAT = "EXTRA_LAT";
    public static final String EXTRA_LON = "EXTRA_LON";

    private LocationManager locationManager;
    private boolean isMocking = false;
    private double currentLat;
    private double currentLon;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable mockRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                currentLat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
                currentLon = intent.getDoubleExtra(EXTRA_LON, 0.0);
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
            }
        }
        return START_NOT_STICKY;
    }

    private void startMocking() {
        if (isMocking) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, false, false, false, ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, false, false, false, 1, 1);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (IllegalArgumentException e) {
            // Test provider already exists or registered
        } catch (SecurityException e) {
            sendBroadcast(new Intent("MOCK_LOCATION_ERROR"));
            stopSelf();
            return;
        }

        isMocking = true;
        createNotificationChannel();
        Notification notification = new Notification.Builder(this, "mock_channel")
                .setContentTitle("Simulando ubicación")
                .setContentText("Lat: " + currentLat + ", Lon: " + currentLon)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(1, notification);
        }

        mockRunnable = new Runnable() {
            @Override
            public void run() {
                if (isMocking) {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(currentLat);
                    mockLocation.setLongitude(currentLon);
                    mockLocation.setAltitude(0);
                    mockLocation.setAccuracy(1.0f);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    try {
                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    handler.postDelayed(this, 1000);
                }
            }
        };
        handler.post(mockRunnable);
    }

    private void stopMocking() {
        isMocking = false;
        if (mockRunnable != null) {
            handler.removeCallbacks(mockRunnable);
        }
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (IllegalArgumentException | SecurityException e) {
            // Ignore
        }
        stopForeground(true);
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("mock_channel", "Mock Location", NotificationManager.IMPORTANCE_LOW);
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
}
