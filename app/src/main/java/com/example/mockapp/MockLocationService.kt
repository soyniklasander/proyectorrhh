package com.example.mockapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.widget.Toast
import androidx.core.app.NotificationCompat

class MockLocationService : Service() {

    private val TAG = "MockLocationService"
    private lateinit var locationManager: LocationManager
    private var isMocking = false
    private var mockLat = 0.0
    private var mockLon = 0.0

    private val handler = Handler(Looper.getMainLooper())
    private val mockLocationRunnable = object : Runnable {
        override fun run() {
            if (isMocking) {
                setMockLocation(mockLat, mockLon)
                handler.postDelayed(this, 1000) // Actualizar cada segundo
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START_MOCKING" -> {
                mockLat = intent.getDoubleExtra("LATITUDE", 0.0)
                mockLon = intent.getDoubleExtra("LONGITUDE", 0.0)
                startForegroundService()
                startMocking()
            }
            "STOP_MOCKING" -> {
                stopMocking()
                stopForeground(true)
                stopSelf()
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun startForegroundService() {
        val channelId = getString(R.string.notification_channel_id)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelName = getString(R.string.notification_channel_name)
            val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .build()

        startForeground(1, notification)
    }

    private fun startMocking() {
        try {
            // Añadir provider de prueba si no existe
            if (!locationManager.allProviders.contains(LocationManager.GPS_PROVIDER)) {
                locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true, 0, 5
                )
            } else {
                try {
                    locationManager.addTestProvider(
                        LocationManager.GPS_PROVIDER,
                        false, false, false, false, true, true, true, 0, 5
                    )
                } catch (e: SecurityException) {
                    Toast.makeText(this, getString(R.string.enable_mock_location_settings), Toast.LENGTH_LONG).show()
                    stopSelf()
                    return
                } catch (e: IllegalArgumentException) {
                    // Provider ya existe
                }
            }

            locationManager.setTestProviderEnabled(LocationManager.GPS_PROVIDER, true)
            isMocking = true
            handler.post(mockLocationRunnable)
        } catch (e: SecurityException) {
            Log.e(TAG, "Permiso denegado para mock location", e)
            Toast.makeText(this, getString(R.string.enable_mock_location_settings), Toast.LENGTH_LONG).show()
            stopSelf()
        }
    }

    private fun setMockLocation(lat: Double, lon: Double) {
        try {
            val mockLocation = Location(LocationManager.GPS_PROVIDER)
            mockLocation.latitude = lat
            mockLocation.longitude = lon
            mockLocation.altitude = 0.0
            mockLocation.time = System.currentTimeMillis()
            mockLocation.accuracy = 1.0f
            mockLocation.elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()

            locationManager.setTestProviderLocation(LocationManager.GPS_PROVIDER, mockLocation)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting mock location", e)
        }
    }

    private fun stopMocking() {
        isMocking = false
        handler.removeCallbacks(mockLocationRunnable)
        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error removing test provider", e)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMocking()
    }
}
