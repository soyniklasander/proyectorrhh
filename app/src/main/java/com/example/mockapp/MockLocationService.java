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
    private double lat = 0.0;
    private double lon = 0.0;
    private boolean isMocking = false;
    private Handler handler;
    private Runnable mockRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.hasExtra("lat") && intent.hasExtra("lon")) {
            lat = intent.getDoubleExtra("lat", 0.0);
            lon = intent.getDoubleExtra("lon", 0.0);
        }

        createNotificationChannel();

        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        startMocking();

        return START_STICKY;
    }

    private void startMocking() {
        if (isMocking) {
            return;
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
                        1, 1
                );
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (IllegalArgumentException e) {
            Log.i(TAG, "Test provider already exists", e);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: Cannot add test provider. App not set as mock location app?", e);
            broadcastError();
            stopSelf();
            return;
        }

        isMocking = true;

        mockRunnable = new Runnable() {
            @Override
            public void run() {
                if (isMocking) {
                    try {
                        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                        mockLocation.setLatitude(lat);
                        mockLocation.setLongitude(lon);
                        mockLocation.setAltitude(0);
                        mockLocation.setAccuracy(1f);
                        mockLocation.setTime(System.currentTimeMillis());
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                    } catch (SecurityException e) {
                        Log.e(TAG, "Lost mock location permission", e);
                        broadcastError();
                        stopSelf();
                        return;
                    } catch (IllegalArgumentException e) {
                        Log.e(TAG, "Provider removed", e);
                    }

                    handler.postDelayed(this, 1000); // Update every 1 second
                }
            }
        };
        handler.post(mockRunnable);
    }

    private void broadcastError() {
        Intent errorIntent = new Intent("MOCK_LOCATION_ERROR");
        sendBroadcast(errorIntent);
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockRunnable != null) {
            handler.removeCallbacks(mockRunnable);
        }

        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (IllegalArgumentException e) {
            Log.i(TAG, "Test provider already removed", e);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException removing test provider", e);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMocking();
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
                    NotificationManager.IMPORTANCE_DEFAULT
            );

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
