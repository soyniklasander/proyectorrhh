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
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {
    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "mock_location_channel";
    private static final int NOTIFICATION_ID = 1;

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";
    public static final String ACTION_MOCK_LOCATION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";

    private LocationManager locationManager;
    private boolean isMocking = false;
    private double currentLat = 0.0;
    private double currentLng = 0.0;
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
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                currentLat = intent.getDoubleExtra(EXTRA_LATITUDE, 0.0);
                currentLng = intent.getDoubleExtra(EXTRA_LONGITUDE, 0.0);
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    private void startMocking() {
        if (isMocking) return;

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        try {
            setupTestProvider();
            isMocking = true;
            startLocationUpdates();
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: Mock location not enabled", e);
            broadcastError();
            stopSelf();
        } catch (Exception e) {
            Log.e(TAG, "Error starting mock location", e);
            stopSelf();
        }
    }

    private void setupTestProvider() {
        try {
            locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true,
                    ProviderProperties.POWER_USAGE_LOW,
                    ProviderProperties.ACCURACY_FINE);

            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (IllegalArgumentException e) {
            // Provider might already exist
            Log.w(TAG, "Provider might already exist", e);
        }
    }

    private void startLocationUpdates() {
        mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                if (isMocking) {
                    try {
                        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                        mockLocation.setLatitude(currentLat);
                        mockLocation.setLongitude(currentLng);
                        mockLocation.setAltitude(0);
                        mockLocation.setAccuracy(5.0f);
                        mockLocation.setTime(System.currentTimeMillis());
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                    } catch (Exception e) {
                        Log.e(TAG, "Error setting mock location", e);
                    }
                    handler.postDelayed(this, 1000);
                }
            }
        };
        handler.post(mockLocationRunnable);
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (IllegalArgumentException | SecurityException e) {
            Log.w(TAG, "Error removing test provider", e);
        }
        stopForeground(true);
    }

    private void broadcastError() {
        Intent errorIntent = new Intent(ACTION_MOCK_LOCATION_ERROR);
        sendBroadcast(errorIntent);
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
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
