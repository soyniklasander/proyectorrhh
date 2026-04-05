package com.example.mockapp

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapListener
import org.osmdroid.events.ScrollEvent
import org.osmdroid.events.ZoomEvent
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView

class MainActivity : AppCompatActivity() {

    private lateinit var map: MapView
    private lateinit var btnStart: Button
    private lateinit var btnStop: Button
    private lateinit var tvLocationInfo: TextView

    private val PERMISSIONS_REQUEST_CODE = 100
    private var currentLat = 0.0
    private var currentLon = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configuración de osmdroid usando las preferencias por defecto
        Configuration.getInstance().load(applicationContext, getSharedPreferences("osmdroid", Context.MODE_PRIVATE))

        setContentView(R.layout.activity_main)

        map = findViewById(R.id.map)
        btnStart = findViewById(R.id.btnStart)
        btnStop = findViewById(R.id.btnStop)
        tvLocationInfo = findViewById(R.id.tvLocationInfo)

        setupMap()
        checkPermissions()

        btnStart.setOnClickListener {
            if (isMockLocationEnabled()) {
                startMocking()
            } else {
                Toast.makeText(this, getString(R.string.enable_mock_location_settings), Toast.LENGTH_LONG).show()
            }
        }

        btnStop.setOnClickListener {
            stopMocking()
        }
    }

    private fun setupMap() {
        map.setMultiTouchControls(true)
        val mapController = map.controller
        mapController.setZoom(15.0)
        // Centro en algún lugar (ej: Madrid) por defecto
        val startPoint = GeoPoint(40.4168, -3.7038)
        mapController.setCenter(startPoint)
        updateCurrentLocation(startPoint.latitude, startPoint.longitude)

        map.addMapListener(object : MapListener {
            override fun onScroll(event: ScrollEvent?): Boolean {
                val center = map.mapCenter
                updateCurrentLocation(center.latitude, center.longitude)
                return true
            }

            override fun onZoom(event: ZoomEvent?): Boolean {
                return true
            }
        })
    }

    private fun updateCurrentLocation(lat: Double, lon: Double) {
        currentLat = lat
        currentLon = lon
        tvLocationInfo.text = String.format(getString(R.string.location_selected), String.format("%.6f", lat), String.format("%.6f", lon))
    }

    private fun startMocking() {
        val intent = Intent(this, MockLocationService::class.java).apply {
            action = "START_MOCKING"
            putExtra("LATITUDE", currentLat)
            putExtra("LONGITUDE", currentLon)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        btnStart.isEnabled = false
        btnStop.isEnabled = true
        Toast.makeText(this, getString(R.string.mock_started), Toast.LENGTH_SHORT).show()
    }

    private fun stopMocking() {
        val intent = Intent(this, MockLocationService::class.java).apply {
            action = "STOP_MOCKING"
        }
        startService(intent)
        btnStart.isEnabled = true
        btnStop.isEnabled = false
        Toast.makeText(this, getString(R.string.mock_stopped), Toast.LENGTH_SHORT).show()
    }

    private fun isMockLocationEnabled(): Boolean {
        var isMockLocation = false
        try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            // En Android 6.0+ la app necesita ser seleccionada en las opciones de desarrollador
            // Para probar esto correctamente programáticamente es complicado, pero el servicio lanzará una SecurityException si no está habilitado
            isMockLocation = true // Asumimos true por ahora, el servicio capturará el error.
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return isMockLocation
    }

    private fun checkPermissions() {
        val requiredPermissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requiredPermissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missingPermissions = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions.toTypedArray(),
                PERMISSIONS_REQUEST_CODE
            )
        }
    }

    override fun onResume() {
        super.onResume()
        map.onResume()
    }

    override fun onPause() {
        super.onPause()
        map.onPause()
    }
}
