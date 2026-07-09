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
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String TAG = "MockLocationService";

    private LocationManager locationManager;
    private double currentLat = 0.0;
    private double currentLon = 0.0;
    private boolean isMocking = false;
    private Thread mockThread;

    // Provder names
    private final String gpsProvider = LocationManager.GPS_PROVIDER;
    private final String networkProvider = LocationManager.NETWORK_PROVIDER;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            currentLat = intent.getDoubleExtra("LATITUDE", 0.0);
            currentLon = intent.getDoubleExtra("LONGITUDE", 0.0);
        }

        Notification notification = buildNotification();
        startForeground(NOTIFICATION_ID, notification);

        if (!isMocking) {
            startMocking();
        }

        return START_STICKY;
    }

    private void startMocking() {
        try {
            setupProvider(gpsProvider);
            setupProvider(networkProvider);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: No mock location permission", e);
            sendErrorBroadcast();
            stopSelf();
            return;
        }

        isMocking = true;
        mockThread = new Thread(() -> {
            while (isMocking) {
                try {
                    setMockLocation(gpsProvider, currentLat, currentLon);
                    setMockLocation(networkProvider, currentLat, currentLon);
                    Thread.sleep(1000); // Enviar ubicación cada 1 segundo
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } catch (SecurityException e) {
                    Log.e(TAG, "Lost mock location permission during execution", e);
                    isMocking = false;
                    new Handler(Looper.getMainLooper()).post(() -> {
                        sendErrorBroadcast();
                        stopSelf();
                    });
                }
            }
        });
        mockThread.start();
    }

    private void setupProvider(String providerName) {
        try {
            locationManager.addTestProvider(
                    providerName, false, false, false, false, false, true, true, 1, 1);
            locationManager.setTestProviderEnabled(providerName, true);
        } catch (IllegalArgumentException e) {
            // El provider ya existe, simplemente lo habilitamos
            locationManager.setTestProviderEnabled(providerName, true);
        }
    }

    private void setMockLocation(String provider, double lat, double lon) throws SecurityException {
        Location mockLocation = new Location(provider);
        mockLocation.setLatitude(lat);
        mockLocation.setLongitude(lon);
        mockLocation.setAccuracy(3.0f);
        mockLocation.setTime(System.currentTimeMillis());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
        }
        locationManager.setTestProviderLocation(provider, mockLocation);
    }

    private void stopMocking() {
        isMocking = false;
        if (mockThread != null) {
            mockThread.interrupt();
        }
        try {
            locationManager.removeTestProvider(gpsProvider);
        } catch (IllegalArgumentException | SecurityException e) {
            // Ignorar si el provider no estaba registrado o no hay permiso
        }
        try {
            locationManager.removeTestProvider(networkProvider);
        } catch (IllegalArgumentException | SecurityException e) {
            // Ignorar
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent("MOCK_LOCATION_ERROR");
        intent.setPackage(getPackageName());
        sendBroadcast(intent);
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
                    getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private Notification buildNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.notification_title))
                .setContentText(getString(R.string.notification_text))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
    }
}
