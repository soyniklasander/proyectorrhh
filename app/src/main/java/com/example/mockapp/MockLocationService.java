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
import android.os.HandlerThread;
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

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";
    public static final String MOCK_LOCATION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";

    private LocationManager locationManager;
    private HandlerThread handlerThread;
    private Handler handler;
    private Runnable mockLocationRunnable;
    private boolean isMocking = false;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                double latitude = intent.getDoubleExtra(EXTRA_LATITUDE, 0);
                double longitude = intent.getDoubleExtra(EXTRA_LONGITUDE, 0);
                startMocking(latitude, longitude);
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
                stopForeground(true);
                stopSelf();
            }
        }
        return START_NOT_STICKY;
    }

    private void startMocking(double latitude, double longitude) {
        if (isMocking) return;

        try {
            try {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, true, true, true, 0, 1);
            } catch (IllegalArgumentException e) {
                Log.w(TAG, "Test provider already exists", e);
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: Mock location not enabled", e);
            sendBroadcast(new Intent(MOCK_LOCATION_ERROR));
            stopSelf();
            return;
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.mocking_active))
                .setContentText(getString(R.string.mocking_active_desc) + ": " + latitude + ", " + longitude)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        handlerThread = new HandlerThread("MockLocationThread");
        handlerThread.start();
        handler = new Handler(handlerThread.getLooper());

        isMocking = true;
        mockLocationRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isMocking) return;

                Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                mockLocation.setLatitude(latitude);
                mockLocation.setLongitude(longitude);
                mockLocation.setAltitude(0);
                mockLocation.setAccuracy(1.0f);
                mockLocation.setTime(System.currentTimeMillis());
                mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                try {
                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
                } catch (SecurityException | IllegalArgumentException e) {
                    Log.e(TAG, "Error setting mock location", e);
                }

                handler.postDelayed(this, 1000); // Update every 1 second
            }
        };
        handler.post(mockLocationRunnable);
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        if (handlerThread != null) {
            handlerThread.quitSafely();
        }

        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (IllegalArgumentException | SecurityException e) {
                Log.w(TAG, "Error removing test provider", e);
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    getString(R.string.notification_channel_name),
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription(getString(R.string.notification_channel_desc));
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopMocking();
        super.onDestroy();
    }
}