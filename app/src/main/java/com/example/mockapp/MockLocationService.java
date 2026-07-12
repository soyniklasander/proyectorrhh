package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
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

public class MockLocationService extends Service {
    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LAT = "EXTRA_LAT";
    public static final String EXTRA_LON = "EXTRA_LON";

    private LocationManager locationManager;
    private boolean isRunning = false;
    private double currentLat;
    private double currentLon;
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
                currentLat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
                currentLon = intent.getDoubleExtra(EXTRA_LON, 0.0);
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
            }
        }
        return START_NOT_STICKY;
    }

    private void startMocking() {
        if (!isRunning) {
            isRunning = true;
            Notification notification = new Notification.Builder(this, CHANNEL_ID)
                    .setContentTitle("Simulador GPS")
                    .setContentText("Simulando ubicación en " + currentLat + ", " + currentLon)
                    .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                    .build();

            startForeground(1, notification);

            try {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, false, false, false, 0, 5);
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            } catch (IllegalArgumentException e) {
                Log.w(TAG, "Test provider ya existe o error al añadirlo: " + e.getMessage());
            } catch (SecurityException e) {
                Log.e(TAG, "Error de seguridad. La app no es Mock Location App.", e);
                Intent errorIntent = new Intent("MOCK_LOCATION_ERROR");
                sendBroadcast(errorIntent);
                stopSelf();
                return;
            }

            mockLocationRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isRunning) {
                        try {
                            Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                            mockLocation.setLatitude(currentLat);
                            mockLocation.setLongitude(currentLon);
                            mockLocation.setAltitude(0.0);
                            mockLocation.setTime(System.currentTimeMillis());
                            mockLocation.setAccuracy(5.0f);
                            mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                        } catch (Exception e) {
                            Log.e(TAG, "Error actualizando ubicación", e);
                        }
                        handler.postDelayed(this, 1000); // 1 update per second
                    }
                }
            };
            handler.post(mockLocationRunnable);
        }
    }

    private void stopMocking() {
        if (isRunning) {
            isRunning = false;
            if (handler != null && mockLocationRunnable != null) {
                handler.removeCallbacks(mockLocationRunnable);
            }
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (IllegalArgumentException e) {
                Log.w(TAG, "Test provider ya removido o error: " + e.getMessage());
            }
            stopForeground(true);
            stopSelf();
        }
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
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

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}