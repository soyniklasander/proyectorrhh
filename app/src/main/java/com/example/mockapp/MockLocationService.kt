package com.example.mockapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*

class MockLocationService : Service() {

    private val job = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.Default + job)

    private lateinit var locationManager: LocationManager
    private var isMocking = false

    private var targetLat = 0.0
    private var targetLng = 0.0

    companion object {
        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val EXTRA_LAT = "EXTRA_LAT"
        const val EXTRA_LNG = "EXTRA_LNG"

        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "mock_location_channel"
        private const val TAG = "MockLocationService"
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
                targetLng = intent.getDoubleExtra(EXTRA_LNG, 0.0)
                startMocking()
            }
            ACTION_STOP -> {
                stopMocking()
                stopSelf()
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Simulador GPS",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Simulando Ubicación")
            .setContentText("Lat: $targetLat, Lng: $targetLng")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build()
    }

    private fun startMocking() {
        if (isMocking) return

        try {
            locationManager.addTestProvider(
                LocationManager.GPS_PROVIDER,
                false, false, false, false, true, true, true,
                android.location.Criteria.POWER_LOW,
                android.location.Criteria.ACCURACY_FINE
            )
            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true)

            isMocking = true
            startForeground(NOTIFICATION_ID, createNotification())

            scope.launch {
                while (isMocking) {
                    val location = Location(LocationManager.GPS_PROVIDER).apply {
                        latitude = targetLat
                        longitude = targetLng
                        altitude = 10.0
                        accuracy = 5.0f
                        time = System.currentTimeMillis()
                        elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
                    }
                    try {
                        locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, location)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error setting mock location", e)
                    }
                    delay(1000)
                }
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException: No mock location permission", e)
            stopSelf()
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "IllegalArgumentException: Test provider might already exist", e)
            // Still try to start if provider exists
            isMocking = true
            startForeground(NOTIFICATION_ID, createNotification())
        }
    }

    private fun stopMocking() {
        isMocking = false
        try {
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing test provider", e)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
        stopMocking()
    }
}
