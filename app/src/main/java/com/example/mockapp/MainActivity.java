package com.example.mockapp;

import android.Manifest;
import android.app.AppOpsManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private MapView mapView;
    private Button btnAction;
    private Button btnDevSettings;
    private TextView tvLocation;
    private Marker currentMarker;

    private double selectedLat = 0.0;
    private double selectedLon = 0.0;
    private boolean isMocking = false;

    private final ActivityResultLauncher<String[]> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
                Boolean fineLocationGranted = result.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false);
                Boolean coarseLocationGranted = result.getOrDefault(Manifest.permission.ACCESS_COARSE_LOCATION, false);

                if (fineLocationGranted != null && fineLocationGranted && coarseLocationGranted != null && coarseLocationGranted) {
                    setupMap();
                } else {
                    Toast.makeText(this, R.string.permissions_required, Toast.LENGTH_LONG).show();
                }
            });

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                stopMockingService();
                Toast.makeText(MainActivity.this, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inicializar osmdroid
        Configuration.getInstance().load(getApplicationContext(), androidx.preference.PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        btnAction = findViewById(R.id.btnAction);
        btnDevSettings = findViewById(R.id.btnDevSettings);
        tvLocation = findViewById(R.id.tvLocation);

        checkPermissionsAndSetupMap();

        btnAction.setOnClickListener(v -> {
            if (isMocking) {
                stopMockingService();
            } else {
                if (selectedLat == 0.0 && selectedLon == 0.0) {
                    Toast.makeText(this, "Por favor, selecciona una ubicación en el mapa primero.", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (isMockLocationEnabled()) {
                    startMockingService();
                } else {
                    Toast.makeText(this, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
                }
            }
        });

        btnDevSettings.setOnClickListener(v -> {
            startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mapView != null) {
            mapView.onResume();
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mapView != null) {
            mapView.onPause();
        }
        try {
            unregisterReceiver(errorReceiver);
        } catch (IllegalArgumentException e) {
            // Ya desregistrado
        }
    }

    private void checkPermissionsAndSetupMap() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!permissions.isEmpty()) {
            requestPermissionLauncher.launch(permissions.toArray(new String[0]));
        } else {
            setupMap();
        }
    }

    private void setupMap() {
        mapView.setMultiTouchControls(true);
        // Centro por defecto: Madrid
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038);
        mapView.getController().setZoom(5.0);
        mapView.getController().setCenter(startPoint);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateSelectedLocation(p.getLatitude(), p.getLongitude());
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        MapEventsOverlay overlayEvents = new MapEventsOverlay(mReceive);
        mapView.getOverlays().add(overlayEvents);
    }

    private void updateSelectedLocation(double lat, double lon) {
        selectedLat = lat;
        selectedLon = lon;

        if (currentMarker != null) {
            mapView.getOverlays().remove(currentMarker);
        }

        currentMarker = new Marker(mapView);
        currentMarker.setPosition(new GeoPoint(lat, lon));
        currentMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        mapView.getOverlays().add(currentMarker);
        mapView.invalidate();

        tvLocation.setText(getString(R.string.location_selected, String.format("%.6f", lat), String.format("%.6f", lon)));

        if (isMocking) {
            // Actualizar el servicio si ya está corriendo
            Intent intent = new Intent(this, MockLocationService.class);
            intent.putExtra("LATITUDE", selectedLat);
            intent.putExtra("LONGITUDE", selectedLon);
            ContextCompat.startForegroundService(this, intent);
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            if (opsManager != null) {
                isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isMockLocation;
    }

    private void startMockingService() {
        Intent intent = new Intent(this, MockLocationService.class);
        intent.putExtra("LATITUDE", selectedLat);
        intent.putExtra("LONGITUDE", selectedLon);
        ContextCompat.startForegroundService(this, intent);
        isMocking = true;
        btnAction.setText(R.string.stop_mocking);
    }

    private void stopMockingService() {
        Intent intent = new Intent(this, MockLocationService.class);
        stopService(intent);
        isMocking = false;
        btnAction.setText(R.string.start_mocking);
    }
}
