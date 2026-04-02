package com.example.mockapp

import android.Manifest
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.mockapp.databinding.ActivityMainBinding
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Marker

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var selectedLocation: GeoPoint? = null
    private var locationMarker: Marker? = null

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.entries.all { it.value }
        if (!allGranted) {
            Toast.makeText(this, R.string.permission_required, Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Setup osmdroid config
        Configuration.getInstance().load(applicationContext, getPreferences(Context.MODE_PRIVATE))

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        checkPermissions()
        setupMap()
        setupButtons()
    }

    private fun checkPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    private fun isMockLocationEnabled(): Boolean {
        var isMockLocation = false
        try {
            val opsManager = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            isMockLocation = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                opsManager.unsafeCheckOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), packageName) == AppOpsManager.MODE_ALLOWED
            } else {
                opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), packageName) == AppOpsManager.MODE_ALLOWED
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return isMockLocation
    }

    private fun setupMap() {
        binding.mapView.setTileSource(TileSourceFactory.MAPNIK)
        binding.mapView.setMultiTouchControls(true)
        val mapController = binding.mapView.controller
        mapController.setZoom(15.0)

        // Default to somewhere (e.g., Madrid)
        val startPoint = GeoPoint(40.4168, -3.7038)
        mapController.setCenter(startPoint)

        val mReceive = object : MapEventsReceiver {
            override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                p?.let { updateSelectedLocation(it) }
                return true
            }

            override fun longPressHelper(p: GeoPoint?): Boolean {
                return false
            }
        }
        val overlayEvents = MapEventsOverlay(mReceive)
        binding.mapView.overlays.add(overlayEvents)
    }

    private fun updateSelectedLocation(point: GeoPoint) {
        selectedLocation = point

        if (locationMarker == null) {
            locationMarker = Marker(binding.mapView)
            locationMarker?.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
            binding.mapView.overlays.add(locationMarker)
        }

        locationMarker?.position = point
        locationMarker?.title = getString(R.string.location_picked)
        binding.mapView.invalidate()

        binding.tvCoordinates.text = "Lat: ${String.format("%.5f", point.latitude)}, Lon: ${String.format("%.5f", point.longitude)}"
    }

    private fun setupButtons() {
        binding.btnStart.setOnClickListener {
            if (!isMockLocationEnabled()) {
                Toast.makeText(this, R.string.mock_app_not_set, Toast.LENGTH_LONG).show()
                startActivity(Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS))
                return@setOnClickListener
            }

            selectedLocation?.let { point ->
                val intent = Intent(this, MockLocationService::class.java).apply {
                    action = MockLocationService.ACTION_START
                    putExtra(MockLocationService.EXTRA_LAT, point.latitude)
                    putExtra(MockLocationService.EXTRA_LON, point.longitude)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(intent)
                } else {
                    startService(intent)
                }

                binding.btnStart.isEnabled = false
                binding.btnStop.isEnabled = true
            } ?: run {
                Toast.makeText(this, "Selecciona una ubicación primero", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnStop.setOnClickListener {
            val intent = Intent(this, MockLocationService::class.java).apply {
                action = MockLocationService.ACTION_STOP
            }
            startService(intent)

            binding.btnStart.isEnabled = true
            binding.btnStop.isEnabled = false
        }
    }

    override fun onResume() {
        super.onResume()
        binding.mapView.onResume()
    }

    override fun onPause() {
        super.onPause()
        binding.mapView.onPause()
    }
}
