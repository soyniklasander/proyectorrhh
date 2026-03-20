package com.example.mockapp;

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
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSIONS_REQUEST_CODE = 100;

    private EditText etLatitude;
    private EditText etLongitude;
    private Button btnStart;
    private Button btnStop;
    private Button btnSettings;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etLatitude = findViewById(R.id.etLatitude);
        etLongitude = findViewById(R.id.etLongitude);
        btnStart = findViewById(R.id.btnStart);
        btnStop = findViewById(R.id.btnStop);
        btnSettings = findViewById(R.id.btnSettings);

        btnStart.setOnClickListener(v -> startMockingService());
        btnStop.setOnClickListener(v -> stopMockingService());
        btnSettings.setOnClickListener(v -> openDeveloperSettings());

        checkAndRequestPermissions();
    }

    private void checkAndRequestPermissions() {
        List<String> requiredPermissions = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requiredPermissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requiredPermissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!requiredPermissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, requiredPermissions.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
        }
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
            if (!allGranted) {
                Toast.makeText(this, "Debe conceder todos los permisos para usar la app.", Toast.LENGTH_LONG).show();
            }
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            // Intentar inicializar el test provider nos dirá si tenemos los permisos
            locationManager.addTestProvider(LocationManager.GPS_PROVIDER, false, false, false, false, true, true, true, 0, 5);
            locationManager.removeTestProvider(LocationManager.GPS_PROVIDER);
            isMockLocation = true;
        } catch (SecurityException e) {
            isMockLocation = false;
        } catch (IllegalArgumentException e) {
            isMockLocation = true; // El provider ya existe, probablemente configurado
        }
        return isMockLocation;
    }

    private void startMockingService() {
        if (!isMockLocationEnabled()) {
            Toast.makeText(this, "Debe seleccionar esta app en Opciones de Desarrollador > Seleccionar aplicación de ubicación de prueba", Toast.LENGTH_LONG).show();
            return;
        }

        String latStr = etLatitude.getText().toString();
        String lonStr = etLongitude.getText().toString();

        if (latStr.isEmpty() || lonStr.isEmpty()) {
            Toast.makeText(this, "Por favor ingrese latitud y longitud", Toast.LENGTH_SHORT).show();
            return;
        }

        double lat;
        double lon;
        try {
            lat = Double.parseDouble(latStr);
            lon = Double.parseDouble(lonStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Coordenadas inválidas", Toast.LENGTH_SHORT).show();
            return;
        }

        Intent intent = new Intent(this, MockLocationService.class);
        intent.setAction(MockLocationService.ACTION_START);
        intent.putExtra(MockLocationService.EXTRA_LATITUDE, lat);
        intent.putExtra(MockLocationService.EXTRA_LONGITUDE, lon);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }

        Toast.makeText(this, "Simulando ubicación iniciada...", Toast.LENGTH_SHORT).show();
    }

    private void stopMockingService() {
        Intent intent = new Intent(this, MockLocationService.class);
        intent.setAction(MockLocationService.ACTION_STOP);
        startService(intent);
        Toast.makeText(this, "Simulación detenida.", Toast.LENGTH_SHORT).show();
    }

    private void openDeveloperSettings() {
        startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
    }
}
