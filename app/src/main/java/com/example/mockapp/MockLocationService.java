package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationManager;
import android.location.provider.ProviderProperties;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;

import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private LocationManager locationManager;
    private Handler handler;
    private HandlerThread handlerThread;
    private double lat = 0.0;
    private double lon = 0.0;
    private boolean isRunning = false;

    private static final String CHANNEL_ID = "MockLocationChannel";

    private final Runnable mockLocationRunnable = new Runnable() {
        @Override
        public void run() {
            if (isRunning) {
                try {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(lat);
                    mockLocation.setLongitude(lon);
                    mockLocation.setAltitude(0.0);
                    mockLocation.setAccuracy(5.0f);
                    mockLocation.setTime(System.currentTimeMillis());
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                    }

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                } catch (SecurityException | IllegalArgumentException e) {
                    sendErrorBroadcast();
                    stopSelf();
                    return;
                }

                handler.postDelayed(this, 1000);
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handlerThread = new HandlerThread("MockLocationThread");
        handlerThread.start();
        handler = new Handler(handlerThread.getLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            lat = intent.getDoubleExtra("lat", 0.0);
            lon = intent.getDoubleExtra("lon", 0.0);
        }

        createNotificationChannel();
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.mock_service_running))
                .setContentText(getString(R.string.mock_service_description))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(1, notification);
        }

        if (!isRunning) {
            setupMockProvider();
            isRunning = true;
            handler.post(mockLocationRunnable);
        }

        return START_STICKY;
    }

    private void setupMockProvider() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, false, false, false, ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, true, true, true, 1, 1);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (IllegalArgumentException e) {
            // Already exists
            try {
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
            } catch (Exception ex) {
                sendErrorBroadcast();
                stopSelf();
            }
        } catch (SecurityException e) {
            sendErrorBroadcast();
            stopSelf();
        }
    }

    private void sendErrorBroadcast() {
        Intent intent = new Intent("com.example.mockapp.MOCK_LOCATION_ERROR");
        intent.setPackage(getPackageName());
        sendBroadcast(intent);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Mock Location Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        if (handler != null) {
            handler.removeCallbacksAndMessages(null);
        }
        if (handlerThread != null) {
            handlerThread.quitSafely();
        }
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
        } catch (Exception e) {
            // Ignorar
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
