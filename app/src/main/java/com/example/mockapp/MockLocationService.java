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
        if (intent != null) {
            currentLat = intent.getDoubleExtra("LATITUDE", currentLat);
            currentLon = intent.getDoubleExtra("LONGITUDE", currentLon);
        }

        startForeground(NOTIFICATION_ID, createNotification());
        startMocking();

        return START_STICKY;
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Simulando Ubicación")
                .setContentText("Ubicación GPS falsa activa")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
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

    private void startMocking() {
        try {
            if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, true, true, true, 0, 5);
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            }
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: ¿Está la app seleccionada como aplicación de ubicación simulada?", e);
            sendErrorBroadcast();
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            Log.i(TAG, "Provider already exists, proceeding.");
        }

        if (mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
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
                    mockLocation.setAccuracy(1.0f);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                    }

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);

                    // Also mock network provider for better results
                    try {
                        Location mockNetLocation = new Location(LocationManager.NETWORK_PROVIDER);
                        mockNetLocation.setLatitude(currentLat);
                        mockNetLocation.setLongitude(currentLon);
                        mockNetLocation.setAltitude(0);
                        mockNetLocation.setTime(System.currentTimeMillis());
                        mockNetLocation.setAccuracy(1.0f);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                            mockNetLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                        }

                        locationManager.addTestProvider(LocationManager.NETWORK_PROVIDER, false, false, false, false, false, false, false, 0, 5);
                        locationManager.setTestProviderEnabled(LocationManager.NETWORK_PROVIDER, true);
                        locationManager.setTestProviderLocation(LocationManager.NETWORK_PROVIDER, mockNetLocation);
                    } catch (Exception e) {
                        // Network provider might not exist or be modifiable
                    }

                    handler.postDelayed(this, 1000); // Update every second
                } catch (SecurityException e) {
                    Log.e(TAG, "SecurityException during mock update", e);
                    sendErrorBroadcast();
                    stopSelf();
                } catch (IllegalArgumentException e) {
                    Log.e(TAG, "Test provider removed?", e);
                }
            }
        };

        handler.post(mockLocationRunnable);
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent("MOCK_LOCATION_ERROR");
        sendBroadcast(intent);
    }

    private void stopMocking() {
        if (mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        try {
            if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
            if (locationManager.getProvider(LocationManager.NETWORK_PROVIDER) != null) {
                locationManager.removeTestProvider(LocationManager.NETWORK_PROVIDER);
            }
        } catch (SecurityException | IllegalArgumentException e) {
            Log.e(TAG, "Error removing test provider", e);
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
