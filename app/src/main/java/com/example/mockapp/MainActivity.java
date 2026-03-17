package com.example.mockapp;

import androidx.annotation.NonNull;
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
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private EditText editTextLatitude;
    private EditText editTextLongitude;
    private Button buttonStart;
    private Button buttonStop;
    private TextView textViewStatus;

    private static final int PERMISSIONS_REQUEST_CODE = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        editTextLatitude = findViewById(R.id.editTextLatitude);
        editTextLongitude = findViewById(R.id.editTextLongitude);
        buttonStart = findViewById(R.id.buttonStart);
        buttonStop = findViewById(R.id.buttonStop);
        textViewStatus = findViewById(R.id.textViewStatus);

        buttonStart.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkAndRequestPermissions()) {
                    if (isMockLocationEnabled()) {
                        startMockLocation();
                    } else {
                        Toast.makeText(MainActivity.this, R.string.error_mock_app_not_set, Toast.LENGTH_LONG).show();
                        promptToEnableMockLocation();
                    }
                }
            }
        });

        buttonStop.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopMockLocation();
            }
        });
    }

    private boolean checkAndRequestPermissions() {
        List<String> listPermissionsNeeded = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            listPermissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            listPermissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.FOREGROUND_SERVICE) != PackageManager.PERMISSION_GRANTED) {
                listPermissionsNeeded.add(Manifest.permission.FOREGROUND_SERVICE);
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                listPermissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.FOREGROUND_SERVICE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                listPermissionsNeeded.add(Manifest.permission.FOREGROUND_SERVICE_LOCATION);
            }
        }


        if (!listPermissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, listPermissionsNeeded.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
            return false;
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (allGranted) {
                if (isMockLocationEnabled()) {
                    startMockLocation();
                } else {
                    Toast.makeText(this, R.string.error_mock_app_not_set, Toast.LENGTH_LONG).show();
                    promptToEnableMockLocation();
                }
            } else {
                Toast.makeText(this, R.string.error_permissions, Toast.LENGTH_SHORT).show();
            }
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            // Test if we can actually add a test provider
            LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, false, false, false, 0, 1);
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            isMockLocation = true;
        } catch (SecurityException e) {
            // App doesn't have the permission
            isMockLocation = false;
        } catch (IllegalArgumentException e) {
             // Sometimes it throws this if provider already exists or other internal state issue
             isMockLocation = false;
        }
        return isMockLocation;
    }

    private void promptToEnableMockLocation() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS);
        if (intent.resolveActivity(getPackageManager()) != null) {
            startActivity(intent);
        } else {
            Toast.makeText(this, R.string.please_enable_developer_options, Toast.LENGTH_LONG).show();
        }
    }

    private void startMockLocation() {
        String latStr = editTextLatitude.getText().toString();
        String lonStr = editTextLongitude.getText().toString();

        if (latStr.isEmpty() || lonStr.isEmpty()) {
            Toast.makeText(this, R.string.error_invalid_coordinates, Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            double latitude = Double.parseDouble(latStr);
            double longitude = Double.parseDouble(lonStr);

            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.setAction(MockLocationService.ACTION_START);
            serviceIntent.putExtra(MockLocationService.EXTRA_LATITUDE, latitude);
            serviceIntent.putExtra(MockLocationService.EXTRA_LONGITUDE, longitude);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }

            textViewStatus.setText(R.string.status_running);
            textViewStatus.setTextColor(ContextCompat.getColor(this, R.color.teal_200));

        } catch (NumberFormatException e) {
            Toast.makeText(this, R.string.error_invalid_coordinates, Toast.LENGTH_SHORT).show();
        }
    }

    private void stopMockLocation() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP);
        startService(serviceIntent); // We can just startService with STOP action

        textViewStatus.setText(R.string.status_stopped);
        textViewStatus.setTextColor(ContextCompat.getColor(this, R.color.black));
    }
}
