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
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationServiceChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String TAG = "MockLocationService";

    private LocationManager locationManager;
    private Handler handler = new Handler(Looper.getMainLooper());
    private double lat = 0.0;
    private double lon = 0.0;
    private boolean isMocking = false;

    private Runnable mockLocationRunnable = new Runnable() {
        @Override
        public void run() {
            if (isMocking) {
                setMockLocation(lat, lon);
                handler.postDelayed(this, 1000); // update every second
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.mock_service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        if (intent != null) {
            lat = intent.getDoubleExtra("lat", 0.0);
            lon = intent.getDoubleExtra("lon", 0.0);
            startMocking();
        }

        return START_STICKY;
    }

    private void startMocking() {
        if (locationManager == null) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER,
                        false, false, false, false, false, false, false,
                        ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER,
                        false, false, false, false, false, false, false, 0, 1);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isMocking = true;
            handler.post(mockLocationRunnable);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: No mock location permission", e);
            sendErrorBroadcast();
            stopSelf();
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "IllegalArgumentException: Test provider already exists or missing", e);
            isMocking = true;
            handler.post(mockLocationRunnable);
        }
    }

    private void setMockLocation(double latitude, double longitude) {
        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
        mockLocation.setLatitude(latitude);
        mockLocation.setLongitude(longitude);
        mockLocation.setAltitude(0);
        mockLocation.setAccuracy(1.0f);
        mockLocation.setTime(System.currentTimeMillis());
        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

        try {
            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException while setting location", e);
            sendErrorBroadcast();
            stopSelf();
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "IllegalArgumentException while setting location", e);
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent("com.example.mockapp.MOCK_LOCATION_ERROR");
        intent.setPackage(getPackageName());
        sendBroadcast(intent);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isMocking = false;
        handler.removeCallbacks(mockLocationRunnable);
        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (Exception e) {
                Log.e(TAG, "Error removing test provider", e);
            }
        }
    }

    @Nullable
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
