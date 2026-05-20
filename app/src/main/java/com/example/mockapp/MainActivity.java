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
import android.widget.TextView;
import android.widget.Toast;

import org.osmdroid.api.IGeoPoint;
import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapListener;
import org.osmdroid.events.ScrollEvent;
import org.osmdroid.events.ZoomEvent;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;

public class MainActivity extends AppCompatActivity {

    private MapView mapView;
    private TextView coordinatesTextView;
    private Button startMockButton, stopMockButton;
    private LocationManager locationManager;
    private static final int PERMISSION_REQUEST_CODE = 1001;

    private double currentLat = 0.0;
    private double currentLng = 0.0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Load osmdroid configuration
        Configuration.getInstance().load(getApplicationContext(), getPreferences(MODE_PRIVATE));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        coordinatesTextView = findViewById(R.id.coordinatesTextView);
        startMockButton = findViewById(R.id.startMockButton);
        stopMockButton = findViewById(R.id.stopMockButton);

        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

        setupMap();

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

    private void setupMap() {
        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setMultiTouchControls(true);

        // Default center
        GeoPoint startPoint = new GeoPoint(40.416775, -3.703790); // Madrid by default
        mapView.getController().setZoom(15.0);
        mapView.getController().setCenter(startPoint);

        updateCoordinatesText(startPoint.getLatitude(), startPoint.getLongitude());

        mapView.addMapListener(new MapListener() {
            @Override
            public boolean onScroll(ScrollEvent event) {
                IGeoPoint center = mapView.getMapCenter();
                updateCoordinatesText(center.getLatitude(), center.getLongitude());
                return true;
            }

            @Override
            public boolean onZoom(ZoomEvent event) {
                IGeoPoint center = mapView.getMapCenter();
                updateCoordinatesText(center.getLatitude(), center.getLongitude());
                return true;
            }
        });
    }

    private void updateCoordinatesText(double lat, double lng) {
        currentLat = lat;
        currentLng = lng;
        coordinatesTextView.setText(String.format("Lat: %.6f, Lng: %.6f", lat, lng));
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
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
                Toast.makeText(this, "Se requieren permisos para que la simulación funcione", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void startMocking() {
        try {
            // Start the foreground service
            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.putExtra("lat", currentLat);
            serviceIntent.putExtra("lng", currentLng);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }

            Toast.makeText(this, "Simulación de GPS iniciada", Toast.LENGTH_SHORT).show();

        } catch (SecurityException e) {
            Toast.makeText(this, "Por favor, habilita esta app en Opciones de desarrollador -> Elegir aplicación para simular ubicación", Toast.LENGTH_LONG).show();
        }
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
        Toast.makeText(this, "Simulación de GPS detenida", Toast.LENGTH_SHORT).show();
    }
}