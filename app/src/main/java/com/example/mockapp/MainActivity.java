package com.example.mockapp;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.material.textfield.TextInputEditText;

public class MainActivity extends AppCompatActivity {
    private static final int PERMISSION_REQUEST_CODE = 100;

    private TextInputEditText editTextLatitude;
    private TextInputEditText editTextLongitude;
    private Button buttonStart;
    private Button buttonStop;
    private TextView textViewStatus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        editTextLatitude = findViewById(R.id.editTextLatitude);
        editTextLongitude = findViewById(R.id.editTextLongitude);
        buttonStart = findViewById(R.id.buttonStart);
        buttonStop = findViewById(R.id.buttonStop);
        textViewStatus = findViewById(R.id.textViewStatus);

        buttonStart.setOnClickListener(v -> startMocking());
        buttonStop.setOnClickListener(v -> stopMocking());
    }

    private void startMocking() {
        if (!hasPermissions()) {
            requestPermissions();
            return;
        }

        if (!isMockLocationEnabled()) {
            Toast.makeText(this, "Please select this app as the mock location app in Developer Options", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            return;
        }

        try {
            double lat = Double.parseDouble(editTextLatitude.getText().toString());
            double lon = Double.parseDouble(editTextLongitude.getText().toString());

            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.putExtra("LATITUDE", lat);
            serviceIntent.putExtra("LONGITUDE", lon);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }

            textViewStatus.setText("Status: Mocking at " + lat + ", " + lon);
            buttonStart.setEnabled(false);
            buttonStop.setEnabled(true);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Invalid latitude or longitude", Toast.LENGTH_SHORT).show();
        }
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction("STOP");
        startService(serviceIntent); // Sends stop intent to service

        textViewStatus.setText("Status: Stopped");
        buttonStart.setEnabled(true);
        buttonStop.setEnabled(false);
    }

    private boolean hasPermissions() {
        boolean hasLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasNotification = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            hasNotification = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return hasLocation && hasNotification;
    }

    private void requestPermissions() {
        String[] permissions;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions = new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.POST_NOTIFICATIONS
            };
        } else {
            permissions = new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            };
        }
        ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startMocking();
            } else {
                Toast.makeText(this, "Permissions are required to mock location", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (locationManager != null) {
                locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, true, true, true, android.location.provider.ProviderProperties.POWER_USAGE_LOW, android.location.provider.ProviderProperties.ACCURACY_FINE);
                locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
                isMockLocation = true;
            }
        } catch (SecurityException e) {
            isMockLocation = false;
        } catch (Exception e) {
            // Might exist already
            isMockLocation = true;
        }
        return isMockLocation;
    }
}
