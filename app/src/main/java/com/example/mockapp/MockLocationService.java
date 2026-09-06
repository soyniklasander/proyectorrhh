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
import android.content.pm.ServiceInfo;

public class MockLocationService extends Service {
    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";

    public static final String ACTION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";

    private LocationManager locationManager;
    private Handler handler;
    private Runnable mockLocationRunnable;
    private double currentLat = 0;
    private double currentLon = 0;
    private boolean isMocking = false;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                currentLat = intent.getDoubleExtra(EXTRA_LATITUDE, 0);
                currentLon = intent.getDoubleExtra(EXTRA_LONGITUDE, 0);
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

        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

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
                        1, // POWER_USAGE_LOW
                        1  // ACCURACY_FINE
                );
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            isMocking = true;

            mockLocationRunnable = new Runnable() {
                @Override
                public void run() {
                    setMockLocation(currentLat, currentLon);
                    handler.postDelayed(this, 1000);
                }
            };
            handler.post(mockLocationRunnable);

        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Test provider already exists", e);
            // Even if it exists, try to enable and mock
            try {
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
                isMocking = true;
                mockLocationRunnable = new Runnable() {
                    @Override
                    public void run() {
                        setMockLocation(currentLat, currentLon);
                        handler.postDelayed(this, 1000);
                    }
                };
                handler.post(mockLocationRunnable);
            } catch (Exception ex) {
                broadcastError();
            }
        } catch (SecurityException e) {
            Log.e(TAG, "Mock location not permitted", e);
            broadcastError();
        }
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (Exception e) {
            Log.e(TAG, "Error removing test provider", e);
        }
        stopForeground(true);
    }

    private void setMockLocation(double lat, double lon) {
        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
        mockLocation.setLatitude(lat);
        mockLocation.setLongitude(lon);
        mockLocation.setAltitude(0);
        mockLocation.setAccuracy(1.0f);
        mockLocation.setTime(System.currentTimeMillis());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
        }
        try {
            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (Exception e) {
            Log.e(TAG, "Error setting mock location", e);
        }
    }

    private void broadcastError() {
        Intent intent = new Intent(ACTION_ERROR);
        sendBroadcast(intent);
        stopMocking();
        stopSelf();
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

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
    }
}
