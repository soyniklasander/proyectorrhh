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
import android.os.IBinder;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class MockLocationService extends Service {

    private static final String CHANNEL_ID = "MockLocationChannel";
    private static final int NOTIFICATION_ID = 1;
    private LocationManager locationManager;
    private boolean isRunning = false;
    private Thread mockThread;
    private double lat = 0.0;
    private double lon = 0.0;

    @Override
    public void onCreate() {
        super.onCreate();
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            lat = intent.getDoubleExtra("lat", 0.0);
            lon = intent.getDoubleExtra("lon", 0.0);
        }

        createNotificationChannel();

        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
        } else {
            pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, 0);
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.service_running))
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        startMocking();

        return START_STICKY;
    }

    private void startMocking() {
        if (isRunning) return;
        isRunning = true;

        mockThread = new Thread(() -> {
            try {
                if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                    locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false,
                            false, false, true, true, true, 0, 5);
                    locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true);
                }

                while (isRunning) {
                    Location mockLocation = new Location(LocationManager.GPS_PROVIDER);
                    mockLocation.setLatitude(lat);
                    mockLocation.setLongitude(lon);
                    mockLocation.setAltitude(0.0);
                    mockLocation.setAccuracy(5.0f);
                    mockLocation.setTime(System.currentTimeMillis());
                    mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

                    locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation);

                    Thread.sleep(1000); // Actualiza cada 1 segundo
                }
            } catch (SecurityException e) {
                // Falla si la app no ha sido elegida como app de ubicaciones falsas en Opciones de Desarrollo
                Intent errorIntent = new Intent("MOCK_LOCATION_ERROR");
                sendBroadcast(errorIntent);
                stopSelf();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (IllegalArgumentException e) {
                 // Falla si el provider ya fue agregado
                 try {
                     locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
                     if (isRunning) {
                         // reintento
                         startMocking();
                     }
                 } catch (Exception ex) {
                     ex.printStackTrace();
                 }
            }
        });
        mockThread.start();
    }

    private void stopMocking() {
        isRunning = false;
        if (mockThread != null) {
            mockThread.interrupt();
            mockThread = null;
        }
        try {
            if (locationManager != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            }
        } catch (SecurityException | IllegalArgumentException e) {
            e.printStackTrace();
        }
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
