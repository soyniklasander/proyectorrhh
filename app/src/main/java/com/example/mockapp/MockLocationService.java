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
import android.os.Build;
import android.os.IBinder;
import android.os.SystemClock;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String MOCK_PROVIDER = LocationManager.GPS_PROVIDER;

    private LocationManager locationManager;
    private Thread mockThread;
    private volatile boolean isMocking = false;
    private double lat = 0.0;
    private double lng = 0.0;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            lat = intent.getDoubleExtra("lat", 0.0);
            lng = intent.getDoubleExtra("lng", 0.0);
        }

        createNotificationChannel();
        Notification notification = createNotification();
        startForeground(NOTIFICATION_ID, notification);

        startMocking();

        return START_STICKY;
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

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Spoofing GPS Location")
                .setContentText("Mocking to: " + lat + ", " + lng)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
    }

    private void startMocking() {
        if (isMocking) {
            // Stop existing thread if starting a new location
            isMocking = false;
            if (mockThread != null) {
                mockThread.interrupt();
            }
        }

        try {
            locationManager.addTestProvider(
                MOCK_PROVIDER,
                false,
                false,
                false,
                false,
                true,
                true,
                true,
                android.location.provider.ProviderProperties.POWER_USAGE_LOW,
                android.location.provider.ProviderProperties.ACCURACY_FINE
            );
            locationManager.setTestProviderEnabled(MOCK_PROVIDER, true);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: Developer Options -> Select mock location app not set.", e);
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            Log.i(TAG, "Test provider already exists");
        }

        isMocking = true;
        mockThread = new Thread(new Runnable() {
            @Override
            public void run() {
                while (isMocking) {
                    Location mockLocation = new Location(MOCK_PROVIDER);
                    mockLocation.setLatitude(lat);
                    mockLocation.setLongitude(lng);
                    mockLocation.setAccuracy(3.0f);
                    mockLocation.setTime(System.currentTimeMillis());
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                    }

                    try {
                        locationManager.setTestProviderLocation(MOCK_PROVIDER, mockLocation);
                        Thread.sleep(1000); // Update every second to keep connection alive
                    } catch (InterruptedException e) {
                        Log.i(TAG, "Mocking thread interrupted.");
                        break;
                    } catch (SecurityException e) {
                        Log.e(TAG, "SecurityException while mocking", e);
                        break;
                    } catch (Exception e) {
                        Log.e(TAG, "Exception while mocking", e);
                    }
                }
            }
        });
        mockThread.start();
    }

    @Override
    public void onDestroy() {
        isMocking = false;
        if (mockThread != null) {
            mockThread.interrupt();
            mockThread = null;
        }

        try {
            locationManager.removeTestProvider(MOCK_PROVIDER);
        } catch (Exception e) {
            Log.e(TAG, "Failed to remove test provider", e);
        }

        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}