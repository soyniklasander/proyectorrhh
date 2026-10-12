package com.example.mockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationManager;
import android.location.provider.ProviderProperties;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;

public class MockLocationService extends Service {

    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    public static final String ACTION_START = "com.example.mockapp.ACTION_START";
    public static final String ACTION_STOP = "com.example.mockapp.ACTION_STOP";
    public static final String EXTRA_LAT = "EXTRA_LAT";
    public static final String EXTRA_LON = "EXTRA_LON";

    private LocationManager locationManager;
    private Handler handler;
    private Runnable mockLocationRunnable;
    private boolean isMocking = false;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                double lat = intent.getDoubleExtra(EXTRA_LAT, 0.0);
                double lon = intent.getDoubleExtra(EXTRA_LON, 0.0);
                startMocking(lat, lon);
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
                stopSelf();
            }
        }
        return START_STICKY;
    }

    private void startMocking(double lat, double lon) {
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
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
                        1, 1 // POWER_USAGE_LOW, ACCURACY_FINE
                );
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);

            isMocking = true;
            mockLocationRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isMocking) {
                        try {
                            Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                            mockLocation.setLatitude(lat);
                            mockLocation.setLongitude(lon);
                            mockLocation.setAltitude(0);
                            mockLocation.setTime(System.currentTimeMillis());
                            mockLocation.setAccuracy(1.0f);
                            mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                            Log.d(TAG, "Mock location updated: " + lat + ", " + lon);
                        } catch (SecurityException | IllegalArgumentException e) {
                            Log.e(TAG, "Error setting mock location", e);
                            stopMocking();
                            stopSelf();
                            return;
                        }
                        handler.postDelayed(this, 1000); // Update every second
                    }
                }
            };
            handler.post(mockLocationRunnable);

        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: App is likely not set as mock location app", e);
            Intent errorIntent = new Intent("MOCK_LOCATION_ERROR");
            sendBroadcast(errorIntent);
            stopSelf();
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "IllegalArgumentException when adding test provider", e);
        }
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        if (locationManager != null) {
            try {
                if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
                }
            } catch (IllegalArgumentException | SecurityException e) {
                Log.e(TAG, "Error removing test provider", e);
            }
        }
        stopForeground(STOP_FOREGROUND_REMOVE);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Mock Location Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
