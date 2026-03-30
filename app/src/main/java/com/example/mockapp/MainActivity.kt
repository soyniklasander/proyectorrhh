package com.example.mockapp

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.material.textfield.TextInputEditText

class MainActivity : AppCompatActivity() {

    private lateinit var etLatitude: TextInputEditText
    private lateinit var etLongitude: TextInputEditText
    private lateinit var btnToggleMocking: Button
    private lateinit var tvStatus: TextView
    private lateinit var btnDevSettings: Button

    private var isMocking = false

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions.all { it.value }) {
            checkMockLocationEnabled()
        } else {
            Toast.makeText(this, R.string.permission_required, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etLatitude = findViewById(R.id.etLatitude)
        etLongitude = findViewById(R.id.etLongitude)
        btnToggleMocking = findViewById(R.id.btnToggleMocking)
        tvStatus = findViewById(R.id.tvStatus)
        btnDevSettings = findViewById(R.id.btnDevSettings)

        btnDevSettings.setOnClickListener {
            startActivity(Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS))
        }

        btnToggleMocking.setOnClickListener {
            if (isMocking) {
                stopMocking()
            } else {
                requestPermissionsAndStart()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (isMocking) {
            checkMockLocationEnabled()
        }
    }

    private fun requestPermissionsAndStart() {
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            permissions.add(Manifest.permission.FOREGROUND_SERVICE_LOCATION)
        }

        val neededPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }.toTypedArray()

        if (neededPermissions.isNotEmpty()) {
            requestPermissionLauncher.launch(neededPermissions)
        } else {
            checkMockLocationEnabled()
        }
    }

    private fun checkMockLocationEnabled() {
        val isMockLocationApp = try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, true, true, true, 0, 5)
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER)
            true
        } catch (e: SecurityException) {
            false
        } catch (e: IllegalArgumentException) {
            true // Provider already exists, assume we have permission
        }

        if (isMockLocationApp) {
            btnDevSettings.visibility = View.GONE
            startMocking()
        } else {
            Toast.makeText(this, R.string.error_mock_location_not_enabled, Toast.LENGTH_LONG).show()
            btnDevSettings.visibility = View.VISIBLE
        }
    }

    private fun startMocking() {
        val latStr = etLatitude.text.toString()
        val lngStr = etLongitude.text.toString()

        val lat = latStr.toDoubleOrNull() ?: 0.0
        val lng = lngStr.toDoubleOrNull() ?: 0.0

        val intent = Intent(this, MockLocationService::class.java).apply {
            action = MockLocationService.ACTION_START
            putExtra(MockLocationService.EXTRA_LAT, lat)
            putExtra(MockLocationService.EXTRA_LNG, lng)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }

        isMocking = true
        updateUI()
    }

    private fun stopMocking() {
        val intent = Intent(this, MockLocationService::class.java).apply {
            action = MockLocationService.ACTION_STOP
        }
        startService(intent)

        isMocking = false
        updateUI()
    }

    private fun updateUI() {
        if (isMocking) {
            btnToggleMocking.text = getString(R.string.stop_mocking)
            tvStatus.text = getString(R.string.status_running)
            etLatitude.isEnabled = false
            etLongitude.isEnabled = false
        } else {
            btnToggleMocking.text = getString(R.string.start_mocking)
            tvStatus.text = getString(R.string.status_stopped)
            etLatitude.isEnabled = true
            etLongitude.isEnabled = true
        }
    }
}
