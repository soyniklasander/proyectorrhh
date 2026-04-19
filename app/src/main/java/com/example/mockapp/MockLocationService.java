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

    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private Handler handler;
    private Runnable mockLocationRunnable;
    private double currentLat = 0.0;
    private double currentLon = 0.0;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null && intent.getAction().equals("STOP_SERVICE")) {
            stopSelf();
            return START_NOT_STICKY;
        }

        if (intent != null) {
            currentLat = intent.getDoubleExtra("lat", currentLat);
            currentLon = intent.getDoubleExtra("lon", currentLon);
        }

        Notification notification = createNotification();
        startForeground(NOTIFICATION_ID, notification);

        startMocking();

        return START_STICKY;
    }

    private void startMocking() {
        stopMocking(); // Clear existing runnables

        try {
            if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        1, 1);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: Add test provider failed. App not set as mock location app.", e);
            sendErrorBroadcast();
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
             Log.e(TAG, "IllegalArgumentException: Test provider might already exist.", e);
        }

        mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                try {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(currentLat);
                    mockLocation.setLongitude(currentLon);
                    mockLocation.setAltitude(0);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setAccuracy(1f);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                    }

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                    handler.postDelayed(this, 1000); // Update every 1 second
                } catch (SecurityException e) {
                    Log.e(TAG, "SecurityException: Set test provider location failed.", e);
                    sendErrorBroadcast();
                    stopSelf();
                } catch (IllegalArgumentException e) {
                    Log.e(TAG, "IllegalArgumentException: Provider is null or location is incomplete.", e);
                }
            }
        };

        handler.post(mockLocationRunnable);
    }

    private void stopMocking() {
        if (mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        try {
            if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                 locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (SecurityException | IllegalArgumentException e) {
            Log.e(TAG, "Exception removing test provider", e);
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent("MOCK_LOCATION_ERROR");
        sendBroadcast(intent);
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
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
                    getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Intent stopIntent = new Intent(this, MockLocationService.class);
        stopIntent.setAction("STOP_SERVICE");
        PendingIntent stopPendingIntent = PendingIntent.getService(this,
                0, stopIntent, PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .addAction(android.R.drawable.ic_delete, getString(R.string.stop_action), stopPendingIntent)
                .build();
    }
}