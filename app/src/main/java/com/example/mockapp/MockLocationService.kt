package com.example.mockapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.location.provider.ProviderProperties
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
import android.util.Log
import androidx.core.app.NotificationCompat

class MockLocationService : Service() {

    private lateinit var locationManager: LocationManager
    private var isRunning = false
    private var targetLat: Double = 0.0
    private var targetLon: Double = 0.0
    private var mockThread: Thread? = null

    companion object {
        private const val TAG = "MockLocationService"
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "MockLocationChannel"
        const val ACTION_START = "com.example.mockapp.START"
        const val ACTION_STOP = "com.example.mockapp.STOP"
        const val EXTRA_LAT = "lat"
        const val EXTRA_LON = "lon"
    }

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                targetLat = intent.getDoubleExtra(EXTRA_LAT, 0.0)
                targetLon = intent.getDoubleExtra(EXTRA_LON, 0.0)
                startMocking()
            }
            ACTION_STOP -> {
                stopMocking()
            }
        }
        return START_STICKY
    }

    private fun startMocking() {
        if (isRunning) return

        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        isRunning = true
        setupTestProvider()

        mockThread = Thread {
            while (isRunning) {
                try {
                    publishMockLocation(targetLat, targetLon)
                    Thread.sleep(1000) // Update every second
                } catch (e: InterruptedException) {
                    Thread.currentThread().interrupt()
                } catch (e: Exception) {
                    Log.e(TAG, "Error publishing mock location", e)
                }
            }
        }
        mockThread?.start()
    }

    private fun stopMocking() {
        isRunning = false
        mockThread?.interrupt()
        mockThread = null
        removeTestProvider()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun setupTestProvider() {
        try {
            if (locationManager.getProvider(LocationManager.GPS_PROVIDER) != null) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER)
            }
        } catch (e: Exception) {
            // Provider might not exist or be a test provider
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val properties = ProviderProperties.Builder()
                    .setHasAltitudeSupport(false)
                    .setHasSpeedSupport(false)
                    .setHasBearingSupport(false)
                    .setPowerUsage(ProviderProperties.POWER_USAGE_LOW)
                    .setAccuracy(ProviderProperties.ACCURACY_FINE)
                    .build()
                    locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        properties
                    )
            } else {
                @Suppress("DEPRECATION")
                locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, false, false, false,
                    android.location.Criteria.POWER_LOW, android.location.Criteria.ACCURACY_FINE
                )
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true)
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException: Make sure this app is selected as the mock location app in Developer Options.", e)
            stopMocking() // Stop if we can't setup the provider
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up test provider", e)
        }
    }

    private fun removeTestProvider() {
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing test provider", e)
        }
    }

    private fun publishMockLocation(lat: Double, lon: Double) {
        try {
            val location = Location(LocationManager.GPS_PROVIDER)
            location.latitude = lat
            location.longitude = lon
            location.accuracy = 5f
            location.time = System.currentTimeMillis()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                location.elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
            }

            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, location)
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException while publishing location. Mock location app revoked?", e)
            stopMocking()
        } catch (e: Exception) {
            Log.e(TAG, "Error publishing location", e)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Simulación de Ubicación",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Canal para mantener la simulación de ubicación activa en segundo plano"
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.service_running))
            .setContentText(getString(R.string.service_description))
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMocking()
    }
}
