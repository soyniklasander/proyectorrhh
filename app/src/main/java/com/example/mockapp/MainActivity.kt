package com.example.mockapp

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker

class MainActivity : AppCompatActivity() {

    private lateinit var map: MapView
    private lateinit var btnStart: Button
    private lateinit var btnStop: Button
    private lateinit var statusText: TextView
    private lateinit var selectedLocationText: TextView

    private var selectedLat: Double? = null
    private var selectedLon: Double? = null
    private var marker: Marker? = null

    private val PERMISSIONS_REQUEST_CODE = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Setup osmdroid config BEFORE setting content view
        Configuration.getInstance().load(
            applicationContext,
            getSharedPreferences("osmdroid", Context.MODE_PRIVATE)
        )

        setContentView(R.layout.activity_main)

        map = findViewById(R.id.map)
        btnStart = findViewById(R.id.btnStart)
        btnStop = findViewById(R.id.btnStop)
        statusText = findViewById(R.id.statusText)
        selectedLocationText = findViewById(R.id.selectedLocationText)

        setupMap()
        checkPermissions()

        btnStart.setOnClickListener {
            if (checkMockLocationEnabled()) {
                startSimulation()
            } else {
                promptEnableMockLocation()
            }
        }

        btnStop.setOnClickListener {
            stopSimulation()
        }
    }

    private fun setupMap() {
        map.setTileSource(TileSourceFactory.MAPNIK)
        map.setMultiTouchControls(true)
        val mapController = map.controller
        mapController.setZoom(15.0)
        // Default point to Madrid or anywhere
        val startPoint = GeoPoint(40.4167, -3.7033)
        mapController.setCenter(startPoint)

        val mReceive = object : MapEventsReceiver {
            override fun singleTapConfirmedHelper(p: GeoPoint): Boolean {
                updateSelectedLocation(p)
                return true
            }
            override fun longPressHelper(p: GeoPoint): Boolean {
                updateSelectedLocation(p)
                return true
            }
        }
        map.overlays.add(MapEventsOverlay(mReceive))
    }

    private fun updateSelectedLocation(point: GeoPoint) {
        selectedLat = point.latitude
        selectedLon = point.longitude

        if (marker == null) {
            marker = Marker(map)
            map.overlays.add(marker)
        }
        marker?.position = point
        marker?.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
        map.invalidate()

        selectedLocationText.text = getString(R.string.location_selected_format, selectedLat, selectedLon)
    }

    private fun checkPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 14+ requires foreground service types permissions explicit checks
            permissions.add(Manifest.permission.FOREGROUND_SERVICE_LOCATION)
        }

        val neededPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (neededPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                neededPermissions.toTypedArray(),
                PERMISSIONS_REQUEST_CODE
            )
        }
    }

    private fun checkMockLocationEnabled(): Boolean {
        return try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager

            // Try adding a test provider to see if we have permissions
            // If the app is not set as mock location app, this throws a SecurityException
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true, 1, 1
                )
            } else {
                @Suppress("DEPRECATION")
                locationManager.addTestProvider(
                    LocationManager.GPS_PROVIDER,
                    false, false, false, false, true, true, true, 1, 1
                )
            }
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER)
            true
        } catch (e: SecurityException) {
            false
        } catch (e: Exception) {
            Log.e("MockApp", "Error checking mock location status", e)
            false
        }
    }

    private fun promptEnableMockLocation() {
        AlertDialog.Builder(this)
            .setTitle(R.string.error_mock_location_disabled)
            .setMessage(R.string.dev_options_prompt)
            .setPositiveButton(R.string.btn_open_settings) { _, _ ->
                startActivity(Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS))
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun startSimulation() {
        if (selectedLat == null || selectedLon == null) {
            Toast.makeText(this, R.string.error_no_location, Toast.LENGTH_SHORT).show()
            return
        }

        val intent = Intent(this, MockLocationService::class.java).apply {
            putExtra(MockLocationService.EXTRA_LAT, selectedLat)
            putExtra(MockLocationService.EXTRA_LON, selectedLon)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }

        statusText.text = getString(R.string.status_running)
        btnStart.isEnabled = false
        btnStop.isEnabled = true
    }

    private fun stopSimulation() {
        val intent = Intent(this, MockLocationService::class.java).apply {
            action = MockLocationService.ACTION_STOP
        }
        startService(intent) // or startForegroundService, Service handles action internally

        statusText.text = getString(R.string.status_stopped)
        btnStart.isEnabled = true
        btnStop.isEnabled = false
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
