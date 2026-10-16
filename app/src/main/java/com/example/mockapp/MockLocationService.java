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
import android.os.SystemClock;

import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationServiceChannel";
    private static final int NOTIFICATION_ID = 1;

    private LocationManager locationManager;
    private HandlerThread handlerThread;
    private Handler handler;
    private boolean isRunning = false;

    private double lat = 0.0;
    private double lon = 0.0;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            lat = intent.getDoubleExtra("lat", 0.0);
            lon = intent.getDoubleExtra("lon", 0.0);
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        if (!isRunning) {
            startMocking();
        }

        return START_STICKY;
    }

    private void startMocking() {
        isRunning = true;

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
        } catch (SecurityException e) {
            broadcastError();
            stopSelf();
            return;
        } catch (IllegalArgumentException e) {
            // Provider might already exist, continue
        }

        handlerThread = new HandlerThread("MockLocationThread");
        handlerThread.start();
        handler = new Handler(handlerThread.getLooper());

        Runnable mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isRunning) return;

                Location location = new Location(LocationManager.GPS_PROVIDER);
                location.setLatitude(lat);
                location.setLongitude(lon);
                location.setAltitude(0);
                location.setAccuracy(1.0f);
                location.setTime(System.currentTimeMillis());
                location.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                try {
                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, location);
                } catch (SecurityException e) {
                    broadcastError();
                    stopSelf();
                    return;
                } catch (IllegalArgumentException e) {
                    // Ignore
                }

                handler.postDelayed(this, 1000); // update every second
            }
        };

        handler.post(mockLocationRunnable);
    }

    private void broadcastError() {
        Intent errorIntent = new Intent("MOCK_LOCATION_ERROR");
        sendBroadcast(errorIntent);
    }

    @Override
    public void onDestroy() {
        isRunning = false;
        if (handlerThread != null) {
            handlerThread.quitSafely();
        }

        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (Exception e) {
            // Ignore
        }

        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_DEFAULT
            );

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
