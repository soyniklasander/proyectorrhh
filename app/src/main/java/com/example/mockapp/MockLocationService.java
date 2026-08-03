package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.location.provider.ProviderProperties;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private HandlerThread handlerThread;
    private Handler handler;
    private volatile boolean isRunning = false;

    private double currentLatitude = 0.0;
    private double currentLongitude = 0.0;

    private final Runnable mockLocationRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isRunning) return;

            try {
                Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                mockLocation.setLatitude(currentLatitude);
                mockLocation.setLongitude(currentLongitude);
                mockLocation.setAccuracy(5.0f);
                mockLocation.setTime(System.currentTimeMillis());

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
                }

                locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);

                handler.postDelayed(this, 1000); // Update every 1 second
            } catch (Exception e) {
                e.printStackTrace();
                sendErrorBroadcast();
                stopSelf();
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            currentLatitude = intent.getDoubleExtra("LATITUDE", 0.0);
            currentLongitude = intent.getDoubleExtra("LONGITUDE", 0.0);
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText("Simulando ubicación...")
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        if (!isRunning) {
            startMocking();
        }

        return START_STICKY;
    }

    private void startMocking() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        ProviderProperties.POWER_USAGE_LOW, ProviderProperties.ACCURACY_FINE);
            } else {
                locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true,
                        1, 1);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);

            handlerThread = new HandlerThread("MockLocationThread");
            handlerThread.start();
            handler = new Handler(handlerThread.getLooper());

            isRunning = true;
            handler.post(mockLocationRunnable);
        } catch (IllegalArgumentException e) {
            // Provider might already exist, try to use it
            try {
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
                handlerThread = new HandlerThread("MockLocationThread");
                handlerThread.start();
                handler = new Handler(handlerThread.getLooper());

                isRunning = true;
                handler.post(mockLocationRunnable);
            } catch (Exception innerException) {
                sendErrorBroadcast();
                stopSelf();
            }
        } catch (SecurityException e) {
            sendErrorBroadcast();
            stopSelf();
        }
    }

    private void stopMocking() {
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
            // Ignore
        }
    }

    private void sendErrorBroadcast() {
        Intent errorIntent = new Intent("MOCK_LOCATION_ERROR");
        sendBroadcast(errorIntent);
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
                    "Canal Servicio Mock Location",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
