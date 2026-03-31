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

class MockLocationService : Service() {

    private lateinit var locationManager: LocationManager
    private var isRunning = false
    private var targetLat = 0.0
    private var targetLon = 0.0

    private val NOTIFICATION_ID = 101
    private val CHANNEL_ID = "MockLocationChannel"

    private var mockThread: Thread? = null

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopMocking()
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        targetLat = intent?.getDoubleExtra(EXTRA_LAT, 0.0) ?: 0.0
        targetLon = intent?.getDoubleExtra(EXTRA_LON, 0.0) ?: 0.0

        startForeground(NOTIFICATION_ID, buildNotification())
        startMocking()

        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = getString(R.string.notification_channel_name)
            val channel = NotificationChannel(
                CHANNEL_ID,
                name,
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val text = getString(R.string.notification_text, targetLat, targetLon)
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(text)
            .setSmallIcon(R.mipmap.ic_launcher) // Using launcher icon as we didn't add a specific small icon
            .setOngoing(true)
            .build()
    }

    private fun startMocking() {
        if (isRunning) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, true, true, true, 1, 1)
            } else {
                @Suppress("DEPRECATION")
                locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true,
                    true, true, 1, 1
                )
            }
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true)
            isRunning = true

            mockThread = Thread {
                while (isRunning) {
                    try {
                        val mockLocation = Location(LocationManager.GPS_PROVIDER).apply {
                            latitude = targetLat
                            longitude = targetLon
                            accuracy = 3.0f
                            time = System.currentTimeMillis()
                            elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()

                            // add basic mock altitude, speed and bearing if needed by some apps
                            altitude = 0.0
                            speed = 0.0f
                            bearing = 0.0f
                        }

                        // Add the extras necessary for Android 12+ mock locations
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            mockLocation.isMock = true
                        } else {
                            @Suppress("DEPRECATION")
                            val extras = android.os.Bundle()
                            extras.putInt("satellites", 7)
                            mockLocation.extras = extras
                        }

                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation)

                        Thread.sleep(1000) // update once a second
                    } catch (e: InterruptedException) {
                        break
                    } catch (e: Exception) {
                        Log.e("MockLocationService", "Error injecting mock location", e)
                        // Sleep a bit on error to prevent tight looping crashing everything
                        try { Thread.sleep(5000) } catch (ignored: InterruptedException) {}
                    }
                }
            }
            mockThread?.start()
        } catch (e: SecurityException) {
            Log.e("MockLocationService", "SecurityException: Mock locations not enabled", e)
            isRunning = false
        } catch (e: Exception) {
            Log.e("MockLocationService", "Error setting up test provider", e)
            isRunning = false
        }
    }

    private fun stopMocking() {
        isRunning = false
        mockThread?.interrupt()
        mockThread = null
        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                // We only remove the test provider if we actually added it
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER)
            }
        } catch (e: Exception) {
            Log.e("MockLocationService", "Error removing test provider", e)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMocking()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val ACTION_STOP = "com.example.mockapp.ACTION_STOP"
        const val EXTRA_LAT = "lat"
        const val EXTRA_LON = "lon"
    }
}
