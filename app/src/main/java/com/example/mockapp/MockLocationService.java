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

import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String TAG = "MockLocationService";
    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;

    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";

    private LocationManager locationManager;
    private boolean isMocking = false;
    private double currentLat = 0.0;
    private double currentLon = 0.0;

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
                currentLat = intent.getDoubleExtra(EXTRA_LATITUDE, 0.0);
                currentLon = intent.getDoubleExtra(EXTRA_LONGITUDE, 0.0);
                startMocking();
            } else if (ACTION_STOP.equals(action)) {
                stopMocking();
                stopForeground(true);
                stopSelf();
            }
        }
        return START_STICKY;
    }

    private void startMocking() {
        if (isMocking) {
            // Update location if already mocking
            return;
        }

        Notification notification = createNotification("Simulando ubicación activa");
        startForeground(NOTIFICATION_ID, notification);

        try {
            locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true, 0, 5
            );
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);

            isMocking = true;

            mockLocationRunnable = new Runnable() {
                @Override
                public void run() {
                    if (isMocking) {
                        setMockLocation(currentLat, currentLon);
                        handler.postDelayed(this, 1000); // Actualiza cada segundo
                    }
                }
            };
            handler.post(mockLocationRunnable);

        } catch (SecurityException e) {
            Log.e(TAG, "Permiso denegado para mock location. ¿Está la app seleccionada en las opciones de desarrollador?", e);
            stopMocking();
            stopSelf();
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Test provider ya existe", e);
            // Si ya existe, intentamos habilitarlo
            try {
                locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
                isMocking = true;
                handler.post(mockLocationRunnable);
            } catch (Exception ex) {
                Log.e(TAG, "Error al reactivar test provider", ex);
            }
        }
    }

    private void stopMocking() {
        isMocking = false;
        if (handler != null && mockLocationRunnable != null) {
            handler.removeCallbacks(mockLocationRunnable);
        }
        if (locationManager != null) {
            try {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            } catch (Exception e) {
                Log.e(TAG, "Error removiendo test provider", e);
            }
        }
    }

    private void setMockLocation(double lat, double lon) {
        Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
        mockLocation.setLatitude(lat);
        mockLocation.setLongitude(lon);
        mockLocation.setAltitude(0);
        mockLocation.setAccuracy(1.0f);
        mockLocation.setTime(System.currentTimeMillis());
        mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

        try {
            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);
        } catch (Exception e) {
            Log.e(TAG, "Error seteando la ubicación mock", e);
        }
    }

    private Notification createNotification(String text) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("MockApp GPS")
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
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

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMocking();
    }
}
