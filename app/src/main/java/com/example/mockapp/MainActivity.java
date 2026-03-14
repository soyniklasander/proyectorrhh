package com.example.mockapp;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

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

import com.google.android.material.textfield.TextInputEditText;

public class MainActivity extends AppCompatActivity {

    private TextInputEditText latInput;
    private TextInputEditText lngInput;
    private Button toggleButton;
    private TextView statusText;

    private boolean isMocking = false;
    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        latInput = findViewById(R.id.latInput);
        lngInput = findViewById(R.id.lngInput);
        toggleButton = findViewById(R.id.toggleButton);
        statusText = findViewById(R.id.statusText);

        toggleButton.setOnClickListener(v -> {
            if (isMocking) {
                stopMocking();
            } else {
                startMocking();
            }
        });
    }

    private void startMocking() {
        if (!hasPermissions()) {
            requestPermissions();
            return;
        }

        if (!isMockLocationEnabled()) {
            Toast.makeText(this, "Please select this app as the mock location app in Developer Options.", Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            return;
        }

        double lat;
        double lng;
        try {
            lat = Double.parseDouble(latInput.getText().toString());
            lng = Double.parseDouble(lngInput.getText().toString());
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Invalid coordinates", Toast.LENGTH_SHORT).show();
            return;
        }

        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", lat);
        serviceIntent.putExtra("lng", lng);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isMocking = true;
        toggleButton.setText("Stop Mocking");
        statusText.setText("Status: Mocking Active (" + lat + ", " + lng + ")");
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);

        isMocking = false;
        toggleButton.setText("Start Mocking");
        statusText.setText("Status: Stopped");
    }

    private boolean hasPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    private void requestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.POST_NOTIFICATIONS
            }, PERMISSION_REQUEST_CODE);
        } else {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION
            }, PERMISSION_REQUEST_CODE);
        }
    }

    private boolean isMockLocationEnabled() {
        LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        boolean isMockEnabled = false;
        try {
            locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, false, false, false, 0, 1);
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            isMockEnabled = true;
        } catch (SecurityException e) {
            isMockEnabled = false;
        } catch (IllegalArgumentException e) {
            // Provider already exists, likely we have permissions
            isMockEnabled = true;
        }
        return isMockEnabled;
    }
}
