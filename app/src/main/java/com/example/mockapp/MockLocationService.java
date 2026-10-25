package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
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

public class MockLocationService extends Service {

    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    public static final String ACTION_STOP = "com.example.mockapp.STOP_SERVICE";
    public static final String MOCK_LOCATION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";
    public static final String EXTRA_LAT = "lat";
    public static final String EXTRA_LON = "lon";

    private LocationManager locationManager;
    private double currentLat;
    private double currentLon;
    private boolean isMocking = false;
    private Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            if (ACTION_STOP.equals(intent.getAction())) {
                stopMocking();
                stopSelf();
                return START_NOT_STICKY;
            }

            currentLat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
            currentLon = intent.getDoubleExtra(EXTRA_LON, 0.0);

            startForegroundService();
            startMocking();
        }
        return START_STICKY;
    }

    private void startForegroundService() {
        createNotificationChannel();

        Intent stopIntent = new Intent(this, MockLocationService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, getString(R.string.stop_spoofing), stopPendingIntent)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
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

    private void startMocking() {
        try {
            if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (IllegalArgumentException e) {
            Log.d(TAG, "Provider does not exist, safe to add");
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: App is not mock location provider", e);
            sendErrorBroadcast();
            stopSelf();
            return;
        }

        try {
            locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    ProviderProperties.POWER_USAGE_LOW,
                    ProviderProperties.ACCURACY_FINE
            );
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isMocking = true;
            mockLocationRunnable.run();
        } catch (SecurityException | IllegalArgumentException e) {
            Log.e(TAG, "Failed to add test provider", e);
            sendErrorBroadcast();
            stopSelf();
        }
    }

    private void stopMocking() {
        isMocking = false;
        handler.removeCallbacks(mockLocationRunnable);
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (SecurityException | IllegalArgumentException e) {
            Log.e(TAG, "Failed to remove test provider", e);
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent(MOCK_LOCATION_ERROR);
        sendBroadcast(intent);
    }

    private Runnable mockLocationRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isMocking) return;

            try {
                Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                mockLocation.setLatitude(currentLat);
                mockLocation.setLongitude(currentLon);
                mockLocation.setAltitude(0);
                mockLocation.setTime(System.currentTimeMillis());
                mockLocation.setAccuracy(5.0f);
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
            } catch (Exception e) {
                Log.e(TAG, "Error setting mock location", e);
            }

            handler.postDelayed(this, 1000);
        }
    };

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMocking();
    }
}
