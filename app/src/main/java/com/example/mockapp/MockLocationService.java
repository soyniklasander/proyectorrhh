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
import android.os.IBinder;
import android.os.SystemClock;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private boolean isMocking = false;
    private Thread mockThread;

    private static double currentLat = 0;
    private static double currentLon = 0;

    public static void updateLocation(double lat, double lon) {
        currentLat = lat;
        currentLon = lon;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            currentLat = intent.getDoubleExtra("lat", 0);
            currentLon = intent.getDoubleExtra("lon", 0);
        }

        Notification notification = createNotification();
        startForeground(NOTIFICATION_ID, notification);

        startMocking();

        return START_STICKY;
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
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

    private void startMocking() {
        if (isMocking) return;

        try {
            setupMockProvider(LocationManager.GPS_PROVIDER);
            setupMockProvider(LocationManager.NETWORK_PROVIDER);

            isMocking = true;
            mockThread = new Thread(() -> {
                while (isMocking) {
                    try {
                        setMockLocation(LocationManager.GPS_PROVIDER, currentLat, currentLon);
                        setMockLocation(LocationManager.NETWORK_PROVIDER, currentLat, currentLon);
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    } catch (SecurityException e) {
                        Log.e(TAG, "SecurityException in mock thread", e);
                        broadcastError();
                        break;
                    }
                }
            });
            mockThread.start();
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException starting mock", e);
            broadcastError();
            stopSelf();
        }
    }

    private void setupMockProvider(String provider) {
        try {
            locationManager.addTestProvider(
                    provider, false, false, false, false, true,
                    true, true, ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            locationManager.setTestProviderEnabled(provider, true);
        } catch (IllegalArgumentException e) {
            Log.i(TAG, "Test provider already exists: " + provider);
        }
    }

    private void setMockLocation(String provider, double lat, double lon) {
        Location mockLocation = new Location(provider);
        mockLocation.setLatitude(lat);
        mockLocation.setLongitude(lon);
        mockLocation.setAltitude(0);
        mockLocation.setAccuracy(1.0f);
        mockLocation.setTime(System.currentTimeMillis());
        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

        locationManager.setTestProviderLocation(provider, mockLocation);
    }

    private void broadcastError() {
        Intent intent = new Intent("MOCK_LOCATION_ERROR");
        sendBroadcast(intent);
    }

    private void stopMocking() {
        isMocking = false;
        if (mockThread != null) {
            mockThread.interrupt();
            mockThread = null;
        }

        try {
            removeMockProvider(LocationManager.GPS_PROVIDER);
            removeMockProvider(LocationManager.NETWORK_PROVIDER);
        } catch (SecurityException | IllegalArgumentException e) {
            Log.e(TAG, "Error removing test provider", e);
        }
    }

    private void removeMockProvider(String provider) {
        try {
            locationManager.removeTestProvider(provider);
        } catch (IllegalArgumentException e) {
            Log.i(TAG, "Test provider not found for removal: " + provider);
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
}
