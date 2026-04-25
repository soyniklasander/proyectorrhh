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
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    private EditText latEditText, lngEditText;
    private Button startMockButton, stopMockButton;
    private LocationManager locationManager;
    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        latEditText = findViewById(R.id.latEditText);
        lngEditText = findViewById(R.id.lngEditText);
        startMockButton = findViewById(R.id.startMockButton);
        stopMockButton = findViewById(R.id.stopMockButton);

        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

        startMockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkPermissions()) {
                    startMocking();
                } else {
                    requestPermissions();
                }
            }
        });

        stopMockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopMocking();
            }
        });

        // Request permissions right away
        if (!checkPermissions()) {
            requestPermissions();
        }
    }

    private boolean checkPermissions() {
        boolean fineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean postNotifications = true;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            postNotifications = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }

        return fineLocation && postNotifications;
    }

    private void requestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.POST_NOTIFICATIONS
            }, PERMISSION_REQUEST_CODE);
        } else {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            }, PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permissions granted
            } else {
                Toast.makeText(this, "Permissions required for spoofing to work", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void startMocking() {
        String latStr = latEditText.getText().toString();
        String lngStr = lngEditText.getText().toString();

        if (latStr.isEmpty() || lngStr.isEmpty()) {
            Toast.makeText(this, "Please enter latitude and longitude", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            double lat = Double.parseDouble(latStr);
            double lng = Double.parseDouble(lngStr);

            // Start the foreground service
            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.putExtra("lat", lat);
            serviceIntent.putExtra("lng", lng);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }

            Toast.makeText(this, "Started Mock Location Service", Toast.LENGTH_SHORT).show();

        } catch (NumberFormatException e) {
            Toast.makeText(this, "Invalid coordinates", Toast.LENGTH_SHORT).show();
        } catch (SecurityException e) {
            Toast.makeText(this, "Please enable this app in Developer Options -> Select mock location app", Toast.LENGTH_LONG).show();
        }
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
        Toast.makeText(this, "Stopped Mock Location Service", Toast.LENGTH_SHORT).show();
    }
}